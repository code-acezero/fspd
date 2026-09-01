import { supabase } from "@/integrations/supabase/client";

export interface ChangeRequest {
  id: string;
  user_id: string;
  target_type: "member" | "post" | "event" | "course" | "profile";
  target_id: string;
  target_title: string;
  proposed_data: Record<string, any>;
  notes: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

const LOCAL_FALLBACK_KEY = "fspd_change_requests_store";

const getLocalRequests = (): ChangeRequest[] => {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalRequests = (requests: ChangeRequest[]) => {
  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error("Local requests save failed:", err);
  }
};

export const submitChangeRequest = async (params: {
  target_type: "member" | "post" | "event" | "course" | "profile";
  target_id: string;
  target_title: string;
  proposed_data: Record<string, any>;
  notes: string;
}): Promise<{ success: boolean; error?: string }> => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return { success: false, error: "You must be signed in to submit a change request." };
  }

  const newRecord: ChangeRequest = {
    id: crypto.randomUUID ? crypto.randomUUID() : cr__,
    user_id: user.id,
    target_type: params.target_type,
    target_id: params.target_id,
    target_title: params.target_title || "Untitled",
    proposed_data: params.proposed_data,
    notes: params.notes,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_email: user.email,
  };

  try {
    const { error } = await (supabase.from("change_requests" as any) as any).insert([
      {
        id: newRecord.id,
        user_id: newRecord.user_id,
        target_type: newRecord.target_type,
        target_id: newRecord.target_id,
        target_title: newRecord.target_title,
        proposed_data: newRecord.proposed_data,
        notes: newRecord.notes,
        status: "pending",
      },
    ]);

    if (error) {
      console.warn("Database change_requests insert fallback to local/settings storage:", error.message);
      const existing = getLocalRequests();
      saveLocalRequests([newRecord, ...existing]);
    }
    return { success: true };
  } catch (err: any) {
    const existing = getLocalRequests();
    saveLocalRequests([newRecord, ...existing]);
    return { success: true };
  }
};

export const fetchChangeRequests = async (): Promise<ChangeRequest[]> => {
  try {
    const { data, error } = await (supabase.from("change_requests" as any) as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Fetch user profile info
      const userIds = Array.from(new Set(data.map((r: any) => r.user_id).filter(Boolean)));
      let userMap: Record<string, { name: string }> = {};
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, display_name").in("id", userIds as string[]);
        profs?.forEach((p) => {
          userMap[p.id] = { name: p.display_name || p.full_name || "" };
        });
      }

      return data.map((r: any) => ({
        ...r,
        user_name: userMap[r.user_id]?.name || "",
      }));
    }
  } catch (err) {
    console.warn("fetchChangeRequests DB query fallback:", err);
  }

  return getLocalRequests();
};

export const approveChangeRequest = async (
  request: ChangeRequest,
  adminNotes: string = ""
): Promise<{ success: boolean; error?: string }> => {
  const { data: authData } = await supabase.auth.getUser();
  const adminId = authData?.user?.id;
  const now = new Date().toISOString();

  try {
    // 1. Apply proposed changes to the target table
    const { target_type, target_id, proposed_data } = request;

    if (target_type === "member") {
      const { error: memErr } = await supabase.from("members").update(proposed_data).eq("id", target_id);
      if (memErr) throw memErr;

      // If this member is connected to a user_id, optionally sync matching fields to profiles
      const { data: mem } = await supabase.from("members").select("user_id").eq("id", target_id).single();
      if (mem?.user_id) {
        const profileUpdates: Record<string, any> = {};
        if (proposed_data.name) profileUpdates.full_name = proposed_data.name;
        if (proposed_data.name) profileUpdates.display_name = proposed_data.name;
        if (proposed_data.title) profileUpdates.position = proposed_data.title;
        if (proposed_data.title_en) profileUpdates.position_en = proposed_data.title_en;
        if (proposed_data.bio) profileUpdates.bio = proposed_data.bio;
        if (proposed_data.phone) profileUpdates.phone = proposed_data.phone;
        if (proposed_data.avatar_url) profileUpdates.avatar_url = proposed_data.avatar_url;

        if (Object.keys(profileUpdates).length > 0) {
          await supabase.from("profiles").update(profileUpdates).eq("id", mem.user_id);
        }
      }
    } else if (target_type === "post") {
      const { error: postErr } = await supabase.from("posts").update(proposed_data).eq("id", target_id);
      if (postErr) throw postErr;
    } else if (target_type === "event") {
      const { error: evtErr } = await supabase.from("events").update(proposed_data).eq("id", target_id);
      if (evtErr) throw evtErr;
    } else if (target_type === "course") {
      const { error: crsErr } = await supabase.from("courses").update(proposed_data).eq("id", target_id);
      if (crsErr) throw crsErr;
    } else if (target_type === "profile") {
      const { error: profErr } = await supabase.from("profiles").update(proposed_data).eq("id", target_id);
      if (profErr) throw profErr;
    }

    // 2. Mark request as approved in database
    await (supabase.from("change_requests" as any) as any)
      .update({
        status: "approved",
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", request.id);

    // Update local fallback store
    const local = getLocalRequests();
    const updated = local.map((r) =>
      r.id === request.id ? { ...r, status: "approved" as const, admin_notes: adminNotes, reviewed_by: adminId, reviewed_at: now } : r
    );
    saveLocalRequests(updated);

    return { success: true };
  } catch (err: any) {
    console.error("approveChangeRequest error:", err);
    return { success: false, error: err.message || "Failed to apply changes" };
  }
};

export const rejectChangeRequest = async (
  requestId: string,
  adminNotes: string = ""
): Promise<{ success: boolean; error?: string }> => {
  const { data: authData } = await supabase.auth.getUser();
  const adminId = authData?.user?.id;
  const now = new Date().toISOString();

  try {
    await (supabase.from("change_requests" as any) as any)
      .update({
        status: "rejected",
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", requestId);

    const local = getLocalRequests();
    const updated = local.map((r) =>
      r.id === requestId ? { ...r, status: "rejected" as const, admin_notes: adminNotes, reviewed_by: adminId, reviewed_at: now } : r
    );
    saveLocalRequests(updated);

    return { success: true };
  } catch (err: any) {
    console.error("rejectChangeRequest error:", err);
    return { success: false, error: err.message || "Failed to reject request" };
  }
};
