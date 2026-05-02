import { useEffect, useState } from "react";
import { Check, X, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface PendingPost {
  id: string;
  title: string;
  title_en: string;
  excerpt: string;
  cover_image: string;
  images: string[];
  author_id: string | null;
  approval_status: string;
  created_at: string;
  author_name?: string;
}

const ModerationPanel = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id,title,title_en,excerpt,cover_image,images,author_id,approval_status,created_at")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const ids = Array.from(new Set(data.map((p) => p.author_id).filter(Boolean))) as string[];
      let map: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,display_name,full_name").in("id", ids);
        profs?.forEach((p) => { map[p.id] = p.display_name || p.full_name || ""; });
      }
      setPosts(data.map((p) => ({ ...(p as any), author_name: p.author_id ? map[p.author_id] : "" })));
    } else setPosts([]);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    const { error } = await supabase
      .from("posts")
      .update({ approval_status: decision, published: decision === "approved" })
      .eq("id", id);
    setBusy(null);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else {
      toast({ title: decision === "approved" ? t("approvedToast") : t("rejected") });
      fetchPending();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-3xl border border-border p-6 depth-card">
        <h3 className="font-bengali font-bold text-foreground mb-4">{t("pendingPosts")}</h3>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground font-bengali text-center py-8">{t("noPendingPosts")}</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="flex gap-4 p-4 rounded-2xl border border-border bg-muted/30">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bengali text-sm font-semibold text-foreground truncate">{p.title || p.title_en}</p>
                  <p className="text-xs text-muted-foreground font-bengali">
                    {t("by")}: {p.author_name || "—"} • {new Date(p.created_at).toLocaleDateString()}
                  </p>
                  {p.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-bengali">{p.excerpt}</p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => decide(p.id, "approved")}
                    disabled={busy === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 font-bengali"
                  >
                    {busy === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {t("approve")}
                  </button>
                  <button
                    onClick={() => decide(p.id, "rejected")}
                    disabled={busy === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-all disabled:opacity-50 font-bengali"
                  >
                    <X className="w-3.5 h-3.5" /> {t("reject")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPanel;
