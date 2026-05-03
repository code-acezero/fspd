import { useEffect, useState, useRef } from "react";
import { Loader2, Plus, Save, Trash2, Edit3, ImagePlus, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const empty = {
  role_label: "", role_label_en: "",
  speaker_name: "", speaker_name_en: "",
  speech: "", speech_en: "",
  photo_url: "", sort_order: 0, is_active: true,
};

const SpeechesPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings, updateSettings } = useSiteSettings();
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const popupCfg = (settings as any)?.welcome_popup ?? { enabled: true, cooldown_minutes: 15 };
  const [enabled, setEnabled] = useState<boolean>(popupCfg.enabled !== false);
  const [cooldown, setCooldown] = useState<number>(popupCfg.cooldown_minutes ?? 15);

  useEffect(() => { fetchList(); }, []);
  useEffect(() => {
    setEnabled(popupCfg.enabled !== false);
    setCooldown(popupCfg.cooldown_minutes ?? 15);
  }, [(settings as any)?.welcome_popup]);

  const fetchList = async () => {
    const { data } = await supabase.from("welcome_speeches").select("*").order("sort_order");
    if (data) setList(data);
  };

  const startEdit = (s: any) => {
    setEditing(s);
    setForm({
      role_label: s.role_label, role_label_en: s.role_label_en,
      speaker_name: s.speaker_name, speaker_name_en: s.speaker_name_en,
      speech: s.speech, speech_en: s.speech_en,
      photo_url: s.photo_url, sort_order: s.sort_order, is_active: s.is_active,
    });
  };

  const reset = () => { setEditing(null); setForm({ ...empty }); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, created_by: user?.id };
    const { error } = editing
      ? await supabase.from("welcome_speeches").update(payload).eq("id", editing.id)
      : await supabase.from("welcome_speeches").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); reset(); fetchList(); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this speech?")) return;
    await supabase.from("welcome_speeches").delete().eq("id", id);
    fetchList();
  };

  const reorder = async (s: any, dir: "up" | "down") => {
    const idx = list.findIndex((x) => x.id === s.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const other = list[swapIdx];
    await Promise.all([
      supabase.from("welcome_speeches").update({ sort_order: other.sort_order }).eq("id", s.id),
      supabase.from("welcome_speeches").update({ sort_order: s.sort_order }).eq("id", other.id),
    ]);
    fetchList();
  };

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast({ title: "Max 5MB", variant: "destructive" });
    setUploading(true);
    const path = `speeches/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("content-images").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data } = supabase.storage.from("content-images").getPublicUrl(path);
    setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    setUploading(false);
  };

  const savePopupConfig = async () => {
    await updateSettings("welcome_popup" as any, { enabled, cooldown_minutes: cooldown });
    toast({ title: "Popup settings saved" });
  };

  const inp = "w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      {/* Popup config */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bengali font-bold text-foreground mb-4">Welcome Popup Settings</h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span className="text-sm text-foreground font-bengali">Enabled</span>
          </label>
          <div>
            <label className="text-xs text-muted-foreground font-bengali mb-1 block">Cooldown (minutes)</label>
            <input type="number" min={1} value={cooldown} onChange={(e) => setCooldown(Number(e.target.value) || 15)} className={inp} />
          </div>
          <button onClick={savePopupConfig} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bengali text-sm flex items-center gap-2 justify-center">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-bengali font-bold text-foreground">{editing ? "Edit Speech" : "New Speech"}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inp} placeholder="Role (Bangla) e.g. সভাপতি" value={form.role_label} onChange={(e) => setForm({ ...form, role_label: e.target.value })} />
          <input className={inp} placeholder="Role (English)" value={form.role_label_en} onChange={(e) => setForm({ ...form, role_label_en: e.target.value })} />
          <input className={inp} placeholder="Speaker Name (Bangla)" value={form.speaker_name} onChange={(e) => setForm({ ...form, speaker_name: e.target.value })} />
          <input className={inp} placeholder="Speaker Name (English)" value={form.speaker_name_en} onChange={(e) => setForm({ ...form, speaker_name_en: e.target.value })} />
        </div>
        <textarea rows={4} className={inp} placeholder="Speech (Bangla)" value={form.speech} onChange={(e) => setForm({ ...form, speech: e.target.value })} />
        <textarea rows={4} className={inp} placeholder="Speech (English)" value={form.speech_en} onChange={(e) => setForm({ ...form, speech_en: e.target.value })} />
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-muted border border-border text-sm font-bengali flex items-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} Upload Photo
          </button>
          {form.photo_url && <img src={form.photo_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30" />}
          <input type="number" className={`${inp} max-w-[140px]`} placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span className="text-xs font-bengali">Active</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bengali text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editing ? "Update" : "Create"}
          </button>
          {editing && <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bengali text-sm">Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {list.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
            <img src={s.photo_url || ""} alt="" className="w-12 h-12 rounded-full object-cover bg-muted ring-1 ring-border" />
            <div className="flex-1 min-w-0">
              <p className="font-bengali text-sm font-bold text-foreground truncate">{s.speaker_name}</p>
              <p className="text-xs text-muted-foreground font-bengali truncate">{s.role_label} · {s.is_active ? "active" : "hidden"}</p>
            </div>
            <button onClick={() => reorder(s, "up")} className="p-2 hover:bg-muted rounded-lg"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => reorder(s, "down")} className="p-2 hover:bg-muted rounded-lg"><ChevronDown className="w-4 h-4" /></button>
            <button onClick={() => startEdit(s)} className="p-2 hover:bg-muted rounded-lg"><Edit3 className="w-4 h-4 text-primary" /></button>
            <button onClick={() => remove(s.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-muted-foreground font-bengali py-8">No speeches yet. Add one above.</p>}
      </div>
    </div>
  );
};

export default SpeechesPanel;
