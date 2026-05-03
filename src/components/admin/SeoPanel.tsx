import { useEffect, useState } from "react";
import { Loader2, Save, Trash2, Edit3, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const STATIC_PATHS = ["/", "/home", "/blog", "/events", "/courses", "/members", "/about", "/login"];

const empty = {
  path: "", title: "", title_en: "", description: "", description_en: "",
  keywords: "", keywords_en: "", og_image: "", canonical: "", no_index: false,
};

const SeoPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    const [{ data: seo }, { data: cp }] = await Promise.all([
      supabase.from("page_seo").select("*").order("path"),
      supabase.from("custom_pages").select("slug, title, title_en"),
    ]);
    setList(seo || []); setCustomPages(cp || []);
  };

  const startEdit = (s: any) => {
    setEditing(s);
    setForm({ ...empty, ...s });
  };
  const startNew = (path: string) => {
    setEditing(null);
    setForm({ ...empty, path });
  };
  const reset = () => { setEditing(null); setForm({ ...empty }); };

  const save = async () => {
    if (!form.path) return toast({ title: "Path required", variant: "destructive" });
    setSaving(true);
    const payload = { ...form, updated_by: user?.id };
    const { error } = editing
      ? await supabase.from("page_seo").update(payload).eq("id", editing.id)
      : await supabase.from("page_seo").upsert(payload, { onConflict: "path" });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "SEO saved" }); reset(); fetchAll(); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete SEO entry?")) return;
    await supabase.from("page_seo").delete().eq("id", id);
    fetchAll();
  };

  const allPaths = [
    ...STATIC_PATHS,
    ...customPages.map((p) => `/p/${p.slug}`),
  ];
  const existingPaths = new Set(list.map((s) => s.path));
  const missingPaths = allPaths.filter((p) => !existingPaths.has(p));

  const inp = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bengali font-bold text-foreground mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> Pages without SEO</h3>
        <div className="flex flex-wrap gap-2">
          {missingPaths.map((p) => (
            <button key={p} onClick={() => startNew(p)} className="px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-mono hover:bg-primary/10 hover:border-primary/40 flex items-center gap-1">
              <Plus className="w-3 h-3" /> {p}
            </button>
          ))}
          {missingPaths.length === 0 && <span className="text-xs text-muted-foreground font-bengali">All known pages have SEO entries.</span>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-bengali font-bold text-foreground">{editing ? "Edit SEO" : "New SEO Entry"}</h3>
        <input className={inp} placeholder="Path e.g. /about or /p/my-page" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} disabled={!!editing} />
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inp} placeholder="Title (Bangla)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inp} placeholder="Title (English)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
        </div>
        <textarea rows={2} className={inp} placeholder="Meta description (Bangla, <160 chars)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea rows={2} className={inp} placeholder="Meta description (English, <160 chars)" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inp} placeholder="Keywords (Bangla, comma-separated)" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          <input className={inp} placeholder="Keywords (English, comma-separated)" value={form.keywords_en} onChange={(e) => setForm({ ...form, keywords_en: e.target.value })} />
        </div>
        <input className={inp} placeholder="Open Graph image URL" value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} />
        <input className={inp} placeholder="Canonical URL (optional)" value={form.canonical} onChange={(e) => setForm({ ...form, canonical: e.target.value })} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.no_index} onChange={(e) => setForm({ ...form, no_index: e.target.checked })} />
          <span className="text-sm font-bengali">Hide from search engines (noindex)</span>
        </label>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bengali text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
          {editing && <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bengali text-sm">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-bengali font-bold text-foreground">Configured pages</h3>
        {list.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
            <code className="text-xs px-2 py-1 rounded bg-muted">{s.path}</code>
            <div className="flex-1 min-w-0">
              <p className="font-bengali text-sm font-bold text-foreground truncate">{s.title || s.title_en || "(no title)"}</p>
              <p className="text-xs text-muted-foreground truncate">{s.description || s.description_en}</p>
            </div>
            {s.no_index && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">noindex</span>}
            <button onClick={() => startEdit(s)} className="p-2 hover:bg-muted rounded-lg"><Edit3 className="w-4 h-4 text-primary" /></button>
            <button onClick={() => remove(s.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-muted-foreground font-bengali py-6">No SEO entries yet.</p>}
      </div>
    </div>
  );
};

export default SeoPanel;
