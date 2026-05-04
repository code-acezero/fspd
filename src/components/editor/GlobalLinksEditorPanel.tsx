// GlobalLinksEditorPanel — editor for global:nav and global:footer_links blocks.
// Renders an items/columns/socials list with bilingual labels + URLs.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Save, RotateCcw, Loader2, Plus, Trash2,
  ChevronUp, ChevronDown, Globe, Languages,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BLOCK_LABELS, DEFAULT_NAV_ITEMS, DEFAULT_FOOTER_COLUMNS, DEFAULT_SOCIALS, newId,
  type NavItem, type FooterColumn, type SocialLink,
} from "@/lib/pageBlocks";

interface Props {
  blockKey: "nav" | "footer_links";
}

const inputCls = "w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30";

const GlobalLinksEditorPanel = ({ blockKey }: Props) => {
  const { role } = useAuth();
  const { editMode } = useVisualEditor();
  const {
    activeBlock, setActiveBlock, setPreviewDraft,
    getRow, getRawDraft, isVisible,
    updateRawDraft, setBlockVisible, publishBlock, revertBlockDraft, saving,
  } = usePageBlocks();
  const { toast } = useToast();
  const [translating, setTranslating] = useState<string | null>(null);

  const isEditor = role === "admin" || role === "moderator";
  const page = "global";
  const row = getRow(blockKey, page);
  const activeKey = `${page}:${blockKey}`;
  const shouldShow = isEditor && editMode && activeBlock === activeKey && !!row;

  useEffect(() => { if (shouldShow) setPreviewDraft(true); /* eslint-disable-next-line */ }, [shouldShow]);
  if (!shouldShow) return null;

  const visible = isVisible(blockKey, page);
  const raw = getRawDraft(blockKey, page) ?? {};
  const blockLabel = BLOCK_LABELS[blockKey] ?? blockKey;

  const autoTranslate = async (sourceText: string, targetLang: "bn" | "en", token: string, applyTo: (v: string) => void) => {
    if (!sourceText.trim()) { toast({ title: "Source field is empty", variant: "destructive" }); return; }
    setTranslating(token);
    try {
      const { data, error } = await supabase.functions.invoke("translate", { body: { text: sourceText, targetLang } });
      if (error) throw error;
      const translated = data?.translatedText || "";
      if (translated) applyTo(translated);
    } catch (e: any) {
      toast({ title: "Translation failed", description: e?.message, variant: "destructive" });
    } finally { setTranslating(null); }
  };

  const handlePublish = async () => { await publishBlock(blockKey, page); toast({ title: "Published", description: `${blockLabel} is now live.` }); };
  const handleRevert  = async () => { await revertBlockDraft(blockKey, page); toast({ title: "Reverted to published version" }); };

  // ---------- NAV editor ----------
  const renderNav = () => {
    const items: NavItem[] = Array.isArray(raw.items) ? raw.items : DEFAULT_NAV_ITEMS;
    const setItems = (next: NavItem[]) => updateRawDraft(blockKey, (p: any) => ({ ...p, items: next }), page);
    const add = () => setItems([...items, { id: newId("n"), label_bn: "নতুন", label_en: "New", to: "/", visible: true }]);
    const upd = (id: string, patch: Partial<NavItem>) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
    const del = (id: string) => setItems(items.filter(i => i.id !== id));
    const move = (id: string, dir: -1 | 1) => {
      const i = items.findIndex(x => x.id === id); if (i < 0) return;
      const j = i + dir; if (j < 0 || j >= items.length) return;
      const arr = [...items]; [arr[i], arr[j]] = [arr[j], arr[i]]; setItems(arr);
    };
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{items.length} nav item{items.length === 1 ? "" : "s"}</p>
          <button onClick={add} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
        {items.map((it, idx) => (
          <div key={it.id} className="border border-border rounded-xl p-2.5 space-y-1.5 bg-background/50">
            <div className="flex items-center gap-1">
              <button onClick={() => upd(it.id, { visible: !it.visible })} className="p-1 rounded hover:bg-foreground/5" title={it.visible ? "Hide" : "Show"}>
                {it.visible ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <button disabled={idx === 0} onClick={() => move(it.id, -1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button disabled={idx === items.length - 1} onClick={() => move(it.id, 1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
              <input className={`${inputCls} flex-1`} placeholder="/path" value={it.to} onChange={e => upd(it.id, { to: e.target.value })} />
              <button onClick={() => del(it.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex gap-1">
              <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={it.label_bn} onChange={e => upd(it.id, { label_bn: e.target.value })} />
              <button onClick={() => autoTranslate(it.label_bn, "en", `n_${it.id}_en`, v => upd(it.id, { label_en: v }))} disabled={translating === `n_${it.id}_en` || !it.label_bn.trim()} className="p-1.5 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40">
                {translating === `n_${it.id}_en` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
              </button>
              <input className={inputCls} placeholder="English" value={it.label_en} onChange={e => upd(it.id, { label_en: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ---------- FOOTER LINKS editor ----------
  const renderFooter = () => {
    const columns: FooterColumn[] = Array.isArray(raw.columns) ? raw.columns : DEFAULT_FOOTER_COLUMNS;
    const socials: SocialLink[] = Array.isArray(raw.socials) ? raw.socials : DEFAULT_SOCIALS;
    const setColumns = (next: FooterColumn[]) => updateRawDraft(blockKey, (p: any) => ({ ...p, columns: next }), page);
    const setSocials = (next: SocialLink[]) => updateRawDraft(blockKey, (p: any) => ({ ...p, socials: next }), page);

    const addCol = () => setColumns([...columns, { id: newId("c"), title_bn: "নতুন কলাম", title_en: "New Column", visible: true, links: [] }]);
    const updCol = (id: string, patch: Partial<FooterColumn>) => setColumns(columns.map(c => c.id === id ? { ...c, ...patch } : c));
    const delCol = (id: string) => setColumns(columns.filter(c => c.id !== id));
    const addLink = (cid: string) => updCol(cid, { links: [...(columns.find(c=>c.id===cid)?.links ?? []), { id: newId("l"), label_bn: "লিংক", label_en: "Link", to: "/", visible: true }] });
    const updLink = (cid: string, lid: string, patch: any) => updCol(cid, { links: (columns.find(c=>c.id===cid)?.links ?? []).map(l => l.id === lid ? { ...l, ...patch } : l) });
    const delLink = (cid: string, lid: string) => updCol(cid, { links: (columns.find(c=>c.id===cid)?.links ?? []).filter(l => l.id !== lid) });

    const addSoc = () => setSocials([...socials, { id: newId("s"), platform: "facebook", href: "#", visible: true }]);
    const updSoc = (id: string, patch: Partial<SocialLink>) => setSocials(socials.map(s => s.id === id ? { ...s, ...patch } : s));
    const delSoc = (id: string) => setSocials(socials.filter(s => s.id !== id));

    return (
      <div className="space-y-4">
        {/* Columns */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground uppercase font-semibold">Link Columns</p>
            <button onClick={addCol} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
              <Plus className="w-3 h-3" /> Add column
            </button>
          </div>
          {columns.map((col) => (
            <div key={col.id} className="border border-border rounded-xl p-2.5 space-y-2 bg-background/50">
              <div className="flex items-center gap-1">
                <button onClick={() => updCol(col.id, { visible: !col.visible })} className="p-1 rounded hover:bg-foreground/5">
                  {col.visible ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <input className={`${inputCls} font-bengali flex-1`} placeholder="বাংলা শিরোনাম" value={col.title_bn} onChange={e => updCol(col.id, { title_bn: e.target.value })} />
                <input className={`${inputCls} flex-1`} placeholder="English title" value={col.title_en} onChange={e => updCol(col.id, { title_en: e.target.value })} />
                <button onClick={() => delCol(col.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-1.5 pl-2 border-l-2 border-border">
                {col.links.map((l) => (
                  <div key={l.id} className="space-y-1">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updLink(col.id, l.id, { visible: !l.visible })} className="p-1 rounded hover:bg-foreground/5">
                        {l.visible ? <Eye className="w-3 h-3 text-success" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                      </button>
                      <input className={`${inputCls}`} placeholder="/path" value={l.to} onChange={e => updLink(col.id, l.id, { to: e.target.value })} />
                      <button onClick={() => delLink(col.id, l.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="flex gap-1">
                      <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={l.label_bn} onChange={e => updLink(col.id, l.id, { label_bn: e.target.value })} />
                      <input className={inputCls} placeholder="English" value={l.label_en} onChange={e => updLink(col.id, l.id, { label_en: e.target.value })} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addLink(col.id)} className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> Add link</button>
              </div>
            </div>
          ))}
        </div>

        {/* Socials */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground uppercase font-semibold">Social Links</p>
            <button onClick={addSoc} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
              <Plus className="w-3 h-3" /> Add social
            </button>
          </div>
          {socials.map((s) => (
            <div key={s.id} className="flex items-center gap-1 border border-border rounded-xl p-2 bg-background/50">
              <button onClick={() => updSoc(s.id, { visible: !s.visible })} className="p-1 rounded hover:bg-foreground/5">
                {s.visible ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <select className={`${inputCls} w-28`} value={s.platform} onChange={e => updSoc(s.id, { platform: e.target.value as SocialLink["platform"] })}>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="mail">Email</option>
              </select>
              <input className={`${inputCls} flex-1`} placeholder="https:// or mailto:" value={s.href} onChange={e => updSoc(s.id, { href: e.target.value })} />
              <button onClick={() => delSoc(s.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed right-4 top-4 bottom-24 w-[420px] z-[210] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{blockLabel} (Global)</p>
              <p className="text-[10px] text-muted-foreground">
                {row?.has_unpublished_changes ? "Unpublished changes" : "All changes published"}
                {saving && " · saving…"}
              </p>
            </div>
          </div>
          <button onClick={() => setActiveBlock(null)} className="p-1.5 rounded-full hover:bg-foreground/10"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 text-xs">
            {visible ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
            <span>Block {visible ? "visible" : "hidden"}</span>
          </div>
          <button onClick={() => setBlockVisible(blockKey, !visible, page)}
            className={`text-[11px] px-2 py-1 rounded-full font-medium ${visible ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/10 text-success hover:bg-success/20"}`}>
            {visible ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {blockKey === "nav" ? renderNav() : renderFooter()}
        </div>

        <div className="border-t border-border p-3 bg-muted/30 flex items-center gap-2">
          <button onClick={handleRevert} disabled={saving || !row?.has_unpublished_changes}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-background hover:bg-foreground/5 text-xs font-medium border border-border disabled:opacity-40">
            <RotateCcw className="w-3.5 h-3.5" /> Revert
          </button>
          <button onClick={handlePublish} disabled={saving || !row?.has_unpublished_changes}
            className="flex-[1.5] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold disabled:opacity-40">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default GlobalLinksEditorPanel;
