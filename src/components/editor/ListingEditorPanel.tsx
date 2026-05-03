// ListingEditorPanel — bilingual filter labels, search placeholder, empty state, intro
// for blog/events/courses listing pages.
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Save, RotateCcw, Languages, Loader2, Sparkles, History,
  Plus, Trash2, ChevronUp, ChevronDown,
} from "lucide-react";
import RevisionsDialog from "@/components/editor/RevisionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BLOCK_LABELS, mergeListingConfig, newId, type ListingConfig, type ListingFilter } from "@/lib/pageBlocks";

interface Props { page: string; supportsFilters?: boolean; }

const ListingEditorPanel = ({ page, supportsFilters }: Props) => {
  const { role } = useAuth();
  const { editMode } = useVisualEditor();
  const {
    activeBlock, setActiveBlock, setPreviewDraft, getRow, isVisible,
    setBlockVisible, publishBlock, revertBlockDraft, saving,
    updateRawDraft, getRawDraft,
  } = usePageBlocks();
  const { toast } = useToast();
  const [translating, setTranslating] = useState<string | null>(null);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const blockKey = "listing";
  const isEditor = role === "admin" || role === "moderator";
  const row = getRow(blockKey, page);
  const activeKey = `${page}:${blockKey}`;
  const shouldShow = isEditor && editMode && activeBlock === activeKey && !!row;

  useEffect(() => { if (shouldShow) setPreviewDraft(true); /* eslint-disable-next-line */ }, [shouldShow]);
  if (!shouldShow) return null;

  const rawDraft = getRawDraft(blockKey, page);
  const cfg: ListingConfig = mergeListingConfig(rawDraft);
  const visible = isVisible(blockKey, page);
  const blockLabel = `${page[0].toUpperCase()}${page.slice(1)} — ${BLOCK_LABELS[blockKey] ?? blockKey}`;
  const filters: ListingFilter[] = cfg.filters ?? [];

  const set = (k: keyof ListingConfig, v: any) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, [k]: v }), page);

  const setFilters = (next: ListingFilter[]) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, filters: next }), page);
  const addFilter = () => setFilters([...filters, { id: newId("f"), value: "", label_bn: "", label_en: "", visible: true }]);
  const updateFilter = (id: string, patch: Partial<ListingFilter>) =>
    setFilters(filters.map((f) => f.id === id ? { ...f, ...patch } : f));
  const removeFilter = (id: string) => setFilters(filters.filter((f) => f.id !== id));
  const moveFilter = (id: string, dir: -1 | 1) => {
    const i = filters.findIndex((f) => f.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= filters.length) return;
    const out = [...filters]; [out[i], out[j]] = [out[j], out[i]]; setFilters(out);
  };

  const translate = async (src: string, target: "bn" | "en", field: string, apply: (v: string) => void) => {
    if (!src.trim()) { toast({ title: "Source field is empty", variant: "destructive" }); return; }
    setTranslating(field);
    try {
      const { data, error } = await supabase.functions.invoke("translate", { body: { text: src, targetLang: target } });
      if (error) throw error;
      if (data?.translatedText) apply(data.translatedText);
    } catch (e: any) {
      toast({ title: "Translation failed", description: e?.message, variant: "destructive" });
    } finally { setTranslating(null); }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed right-4 top-4 bottom-24 w-[400px] z-[210] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{blockLabel}</p>
              <p className="text-[10px] text-muted-foreground">
                {row?.has_unpublished_changes ? "Unpublished changes" : "All changes published"}
                {saving && " · saving…"}
              </p>
            </div>
          </div>
          <button onClick={() => setActiveBlock(null)} className="p-1.5 rounded-full hover:bg-foreground/10" title="Close editor">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 text-xs">
            {visible ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
            <span>Block {visible ? "visible" : "hidden"}</span>
          </div>
          <button onClick={() => setBlockVisible(blockKey, !visible, page)}
            className={`text-[11px] px-2 py-1 rounded-full font-medium ${visible ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`}>
            {visible ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-[11px] text-muted-foreground italic">
            Empty fields fall back to built-in defaults.
          </p>

          <Field label="Intro paragraph (optional, shown above the list)">
            <BiRow multiline
              bn={cfg.intro_bn} en={cfg.intro_en}
              onBn={(v) => set("intro_bn", v)} onEn={(v) => set("intro_en", v)}
              translating={translating}
              tBnEn={() => translate(cfg.intro_bn, "en", "intro_en", (v) => set("intro_en", v))}
              tEnBn={() => translate(cfg.intro_en, "bn", "intro_bn", (v) => set("intro_bn", v))}
              fEn="intro_en" fBn="intro_bn"
            />
          </Field>

          <Field label="Search placeholder">
            <BiRow
              bn={cfg.searchPlaceholder_bn} en={cfg.searchPlaceholder_en}
              onBn={(v) => set("searchPlaceholder_bn", v)} onEn={(v) => set("searchPlaceholder_en", v)}
              translating={translating}
              tBnEn={() => translate(cfg.searchPlaceholder_bn, "en", "spe", (v) => set("searchPlaceholder_en", v))}
              tEnBn={() => translate(cfg.searchPlaceholder_en, "bn", "spb", (v) => set("searchPlaceholder_bn", v))}
              fEn="spe" fBn="spb"
            />
          </Field>

          <Field label="Empty-state message (no results)">
            <BiRow
              bn={cfg.emptyState_bn} en={cfg.emptyState_en}
              onBn={(v) => set("emptyState_bn", v)} onEn={(v) => set("emptyState_en", v)}
              translating={translating}
              tBnEn={() => translate(cfg.emptyState_bn, "en", "ese", (v) => set("emptyState_en", v))}
              tEnBn={() => translate(cfg.emptyState_en, "bn", "esb", (v) => set("emptyState_bn", v))}
              fEn="ese" fBn="esb"
            />
          </Field>

          {supportsFilters && (
            <>
              <Field label='"All" filter label'>
                <BiRow
                  bn={cfg.filterAllLabel_bn} en={cfg.filterAllLabel_en}
                  onBn={(v) => set("filterAllLabel_bn", v)} onEn={(v) => set("filterAllLabel_en", v)}
                  translating={translating}
                  tBnEn={() => translate(cfg.filterAllLabel_bn, "en", "fae", (v) => set("filterAllLabel_en", v))}
                  tEnBn={() => translate(cfg.filterAllLabel_en, "bn", "fab", (v) => set("filterAllLabel_bn", v))}
                  fEn="fae" fBn="fab"
                />
              </Field>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Category filters</label>
                  <button onClick={addFilter} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
                    <Plus className="w-3 h-3" /> Add filter
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Leave empty to use built-in categories.</p>
                {filters.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic text-center py-3">No custom filters.</p>
                ) : filters.map((f, idx) => (
                  <div key={f.id} className="border border-border rounded-xl p-2 space-y-1 bg-background/50">
                    <div className="flex items-center gap-1">
                      <input className={`${inputCls} font-bengali text-xs`} placeholder="Match value (e.g. সাহিত্য)" value={f.value} onChange={(e) => updateFilter(f.id, { value: e.target.value })} />
                      <button onClick={() => updateFilter(f.id, { visible: !f.visible })} className="p-1 rounded hover:bg-foreground/5" title={f.visible ? "Hide" : "Show"}>
                        {f.visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button disabled={idx === 0} onClick={() => moveFilter(f.id, -1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button disabled={idx === filters.length - 1} onClick={() => moveFilter(f.id, 1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeFilter(f.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input className={`${inputCls} font-bengali text-xs`} placeholder="বাংলা লেবেল" value={f.label_bn} onChange={(e) => updateFilter(f.id, { label_bn: e.target.value })} />
                    <input className={`${inputCls} text-xs`} placeholder="English label" value={f.label_en} onChange={(e) => updateFilter(f.id, { label_en: e.target.value })} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-border p-3 bg-muted/30 flex items-center gap-2">
          <button onClick={() => setRevisionsOpen(true)} className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-full bg-background hover:bg-foreground/5 text-xs font-medium border border-border" title="Revision history">
            <History className="w-3.5 h-3.5" />
          </button>
          <button onClick={async () => { await revertBlockDraft(blockKey, page); toast({ title: "Reverted to published version" }); }}
            disabled={saving || !row?.has_unpublished_changes}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-background hover:bg-foreground/5 text-xs font-medium border border-border disabled:opacity-40">
            <RotateCcw className="w-3.5 h-3.5" /> Revert
          </button>
          <button onClick={async () => { await publishBlock(blockKey, page); toast({ title: "Published", description: `${blockLabel} is now live.` }); }}
            disabled={saving || !row?.has_unpublished_changes}
            className="flex-[1.5] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold disabled:opacity-40">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </motion.aside>
      <RevisionsDialog open={revisionsOpen} onClose={() => setRevisionsOpen(false)} page={page} blockKey={blockKey} blockLabel={blockLabel} currentDraft={rawDraft} />
    </AnimatePresence>
  );
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const BiRow = ({
  bn, en, onBn, onEn, translating, tBnEn, tEnBn, fEn, fBn, multiline,
}: {
  bn: string; en: string; onBn: (v: string) => void; onEn: (v: string) => void;
  translating: string | null; tBnEn: () => void; tEnBn: () => void; fEn: string; fBn: string;
  multiline?: boolean;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-start gap-1">
      {multiline
        ? <textarea className={`${inputCls} font-bengali min-h-[60px]`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />
        : <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />}
      <button onClick={tBnEn} disabled={translating === fEn || !bn.trim()} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="BN→EN">
        {translating === fEn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
      </button>
    </div>
    <div className="flex items-start gap-1">
      {multiline
        ? <textarea className={`${inputCls} min-h-[60px]`} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />
        : <input className={inputCls} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />}
      <button onClick={tEnBn} disabled={translating === fBn || !en.trim()} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="EN→BN">
        {translating === fBn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
      </button>
    </div>
  </div>
);

export default ListingEditorPanel;
