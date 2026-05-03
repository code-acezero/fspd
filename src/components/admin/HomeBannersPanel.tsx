import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Loader2, Trash2, ImagePlus, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  tag: string;
  tag_en: string;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

const empty: Omit<Banner, "id"> = {
  tag: "", tag_en: "", title: "", title_en: "", subtitle: "", subtitle_en: "",
  image_url: "", link_url: "", is_active: true, sort_order: 0,
};

const inputClass = "w-full px-3 py-2 rounded-full border border-border bg-background text-sm";

const HomeBannersPanel = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [draft, setDraft] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-home-banners"],
    queryFn: async () => {
      const { data } = await supabase.from("home_banners").select("*").order("sort_order");
      return (data as Banner[]) || [];
    },
  });

  useEffect(() => {
    if (editing) {
      const { id, ...rest } = editing;
      setDraft(rest);
    } else {
      setDraft(empty);
    }
  }, [editing]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-home-banners"] });
    qc.invalidateQueries({ queryKey: ["home-banners"] });
  };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("home_banners").update(draft).eq("id", editing.id);
    } else {
      await supabase.from("home_banners").insert({ ...draft, sort_order: banners.length });
    }
    refresh();
    setEditing(null);
    setDraft(empty);
    toast({ title: "Saved" });
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("home_banners").delete().eq("id", id);
    refresh();
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from("home_banners").update({ is_active: !b.is_active }).eq("id", b.id);
    refresh();
  };

  const move = async (b: Banner, dir: -1 | 1) => {
    const idx = banners.findIndex((x) => x.id === b.id);
    const swap = banners[idx + dir];
    if (!swap) return;
    await supabase.from("home_banners").update({ sort_order: swap.sort_order }).eq("id", b.id);
    await supabase.from("home_banners").update({ sort_order: b.sort_order }).eq("id", swap.id);
    refresh();
  };

  const upload = async (file: File) => {
    const path = `banners/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("content-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("content-images").getPublicUrl(path);
    setDraft((d) => ({ ...d, image_url: data.publicUrl }));
  };

  return (
    <div className="bg-background rounded-3xl border border-border p-6 depth-card space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bengali font-bold text-foreground">Home banners</h3>
          <p className="text-xs text-muted-foreground mt-1">Rotating hero slides shown at the top of the home page.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setDraft(empty); }}
          className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-secondary/80"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Editor */}
      <div className="border border-border rounded-2xl p-4 space-y-3 bg-card">
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-xs text-muted-foreground">Tag (BN)</label><input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs text-muted-foreground">Tag (EN)</label><input value={draft.tag_en} onChange={(e) => setDraft({ ...draft, tag_en: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs text-muted-foreground">Title (BN)</label><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs text-muted-foreground">Title (EN)</label><input value={draft.title_en} onChange={(e) => setDraft({ ...draft, title_en: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs text-muted-foreground">Subtitle (BN)</label><input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs text-muted-foreground">Subtitle (EN)</label><input value={draft.subtitle_en} onChange={(e) => setDraft({ ...draft, subtitle_en: e.target.value })} className={inputClass} /></div>
          <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Link URL (optional)</label><input value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} placeholder="/events or https://..." className={inputClass} /></div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/png,image/jpeg,image/webp";
              input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) upload(f); };
              input.click();
            }}
            className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center gap-2 hover:bg-secondary/80"
          >
            <ImagePlus className="w-4 h-4" /> Background image
          </button>
          {draft.image_url && <img src={draft.image_url} alt="" className="h-10 rounded-lg object-cover" />}
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} className="rounded" />
            Active
          </label>
          <button
            onClick={save}
            disabled={saving || !draft.title}
            className="ml-auto px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full bg-muted text-foreground text-sm">Cancel</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && banners.length === 0 && <p className="text-sm text-muted-foreground">No banners yet.</p>}
        {banners.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
            {b.image_url ? <img src={b.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-muted" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground truncate">{b.title || b.title_en || "(untitled)"}</div>
              <div className="text-xs text-muted-foreground truncate">{b.tag || b.tag_en}</div>
            </div>
            <button onClick={() => move(b, -1)} disabled={i === 0} className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => move(b, 1)} disabled={i === banners.length - 1} className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
            <button onClick={() => toggleActive(b)} className="p-1.5 rounded-full hover:bg-muted">{b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}</button>
            <button onClick={() => setEditing(b)} className="px-3 py-1 rounded-full bg-secondary text-xs">Edit</button>
            <button onClick={() => remove(b.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeBannersPanel;
