import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Edit3, Eye, ChevronUp, ChevronDown, Type, Image as ImageIcon, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Block =
  | { type: "heading"; text: string; text_en?: string; level?: 1 | 2 | 3 }
  | { type: "paragraph"; text: string; text_en?: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "html"; html: string };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

const PageBuilderPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [showInNav, setShowInNav] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const { data } = await supabase.from("custom_pages").select("*").order("sort_order");
    if (data) setPages(data);
  };

  const reset = () => {
    setEditing(null); setTitle(""); setTitleEn(""); setSlug("");
    setIsPublished(false); setShowInNav(false); setSortOrder(0); setBlocks([]);
  };

  const startEdit = (p: any) => {
    setEditing(p); setTitle(p.title); setTitleEn(p.title_en); setSlug(p.slug);
    setIsPublished(p.is_published); setShowInNav(p.show_in_nav);
    setSortOrder(p.sort_order); setBlocks(Array.isArray(p.blocks) ? p.blocks : []);
  };

  const save = async () => {
    if (!title && !titleEn) return toast({ title: "Title required", variant: "destructive" });
    const finalSlug = slug || slugify(titleEn || title);
    if (!finalSlug) return toast({ title: "Slug required", variant: "destructive" });
    setSaving(true);
    const payload = {
      slug: finalSlug, title, title_en: titleEn, blocks: blocks as any,
      is_published: isPublished, show_in_nav: showInNav, sort_order: sortOrder,
      created_by: user?.id,
    };
    const { error } = editing
      ? await supabase.from("custom_pages").update(payload).eq("id", editing.id)
      : await supabase.from("custom_pages").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); reset(); fetchPages(); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await supabase.from("custom_pages").delete().eq("id", id);
    fetchPages();
  };

  const addBlock = (type: Block["type"]) => {
    const b: Block =
      type === "heading" ? { type: "heading", text: "", level: 2 } :
      type === "paragraph" ? { type: "paragraph", text: "" } :
      type === "image" ? { type: "image", url: "", alt: "" } :
      { type: "html", html: "" };
    setBlocks([...blocks, b]);
  };

  const updateBlock = (i: number, patch: any) => {
    setBlocks(blocks.map((b, idx) => idx === i ? { ...b, ...patch } : b));
  };

  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= blocks.length) return;
    const next = [...blocks]; [next[i], next[j]] = [next[j], next[i]]; setBlocks(next);
  };

  const removeBlock = (i: number) => setBlocks(blocks.filter((_, idx) => idx !== i));

  const inp = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      {/* List */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bengali font-bold text-foreground">Custom Pages</h3>
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bengali flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Page
          </button>
        </div>
        <div className="space-y-2">
          {pages.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bengali text-sm font-bold text-foreground truncate">{p.title || p.title_en}</p>
                <p className="text-xs text-muted-foreground truncate">/p/{p.slug} · {p.is_published ? "published" : "draft"}{p.show_in_nav ? " · in nav" : ""}</p>
              </div>
              <Link to={`/p/${p.slug}`} target="_blank" className="p-2 hover:bg-background rounded-lg"><Eye className="w-4 h-4" /></Link>
              <button onClick={() => startEdit(p)} className="p-2 hover:bg-background rounded-lg"><Edit3 className="w-4 h-4 text-primary" /></button>
              <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
            </div>
          ))}
          {pages.length === 0 && <p className="text-center text-muted-foreground font-bengali py-6">No custom pages yet.</p>}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-bengali font-bold text-foreground">{editing ? "Edit Page" : "New Page"}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inp} placeholder="Title (Bangla)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={inp} placeholder="Title (English)" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          <input className={inp} placeholder="Slug (auto from English title)" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          <input type="number" className={inp} placeholder="Sort order" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /><span className="text-sm font-bengali">Published</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} /><span className="text-sm font-bengali">Show in nav</span></label>
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          <p className="text-sm font-bengali font-semibold text-foreground">Content blocks</p>
          {blocks.map((b, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-background">{b.type}</span>
                <div className="flex-1" />
                <button onClick={() => moveBlock(i, -1)} className="p-1 hover:bg-background rounded"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveBlock(i, 1)} className="p-1 hover:bg-background rounded"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => removeBlock(i)} className="p-1 hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
              {b.type === "heading" && (
                <>
                  <input className={inp} placeholder="Heading (Bangla)" value={(b as any).text} onChange={(e) => updateBlock(i, { text: e.target.value })} />
                  <input className={inp} placeholder="Heading (English)" value={(b as any).text_en || ""} onChange={(e) => updateBlock(i, { text_en: e.target.value })} />
                </>
              )}
              {b.type === "paragraph" && (
                <>
                  <textarea rows={3} className={inp} placeholder="Text (Bangla)" value={(b as any).text} onChange={(e) => updateBlock(i, { text: e.target.value })} />
                  <textarea rows={3} className={inp} placeholder="Text (English)" value={(b as any).text_en || ""} onChange={(e) => updateBlock(i, { text_en: e.target.value })} />
                </>
              )}
              {b.type === "image" && (
                <>
                  <input className={inp} placeholder="Image URL" value={(b as any).url} onChange={(e) => updateBlock(i, { url: e.target.value })} />
                  <input className={inp} placeholder="Alt text" value={(b as any).alt || ""} onChange={(e) => updateBlock(i, { alt: e.target.value })} />
                  <input className={inp} placeholder="Caption (optional)" value={(b as any).caption || ""} onChange={(e) => updateBlock(i, { caption: e.target.value })} />
                </>
              )}
              {b.type === "html" && (
                <textarea rows={4} className={inp} placeholder="<p>Raw HTML</p>" value={(b as any).html} onChange={(e) => updateBlock(i, { html: e.target.value })} />
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addBlock("heading")} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bengali flex items-center gap-1"><Type className="w-3.5 h-3.5" /> Heading</button>
            <button onClick={() => addBlock("paragraph")} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bengali flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Paragraph</button>
            <button onClick={() => addBlock("image")} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bengali flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Image</button>
            <button onClick={() => addBlock("html")} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bengali flex items-center gap-1">{`</>`} HTML</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bengali text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editing ? "Update Page" : "Create Page"}
          </button>
          {editing && <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bengali text-sm">Cancel</button>}
        </div>
      </div>
    </div>
  );
};

export default PageBuilderPanel;
