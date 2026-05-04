// BodyEditorPanel — bilingual heading + body text for body_intro / body_outro blocks.
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Save, RotateCcw, Languages, Loader2, Sparkles, History } from "lucide-react";
import RevisionsDialog from "@/components/editor/RevisionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BLOCK_LABELS, mergeBodyConfig, type BodyConfig } from "@/lib/pageBlocks";

interface Props { blockKey: string; page: string; }

const BodyEditorPanel = ({ blockKey, page }: Props) => {
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

  const isEditor = role === "admin" || role === "moderator";
  const row = getRow(blockKey, page);
  const activeKey = `${page}:${blockKey}`;
  const shouldShow = isEditor && editMode && activeBlock === activeKey && !!row;

  useEffect(() => { if (shouldShow) setPreviewDraft(true); /* eslint-disable-next-line */ }, [shouldShow]);
  if (!shouldShow) return null;

  const cfg: BodyConfig = mergeBodyConfig(getRawDraft(blockKey, page));
  const visible = isVisible(blockKey, page);
  const blockLabel = BLOCK_LABELS[blockKey] ?? blockKey;
  const rawDraft = getRawDraft(blockKey, page);

  const set = (k: keyof BodyConfig, v: string) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, [k]: v }), page);

  const translate = async (src: string, target: "bn" | "en", field: keyof BodyConfig) => {
    if (!src.trim()) { toast({ title: "Source field is empty", variant: "destructive" }); return; }
    setTranslating(field);
    try {
      const { data, error } = await supabase.functions.invoke("translate", { body: { text: src, targetLang: target } });
      if (error) throw error;
      if (data?.translatedText) set(field, data.translatedText);
    } catch (e: any) {
      toast({ title: "Translation failed", description: e?.message, variant: "destructive" });
    } finally { setTranslating(null); }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
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
            {visible ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
            <span>Block {visible ? "visible" : "hidden"}</span>
          </div>
          <button
            onClick={() => setBlockVisible(blockKey, !visible, page)}
            className={`text-[11px] px-2 py-1 rounded-full font-medium ${visible ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/10 text-success hover:bg-success/20"}`}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-[11px] text-muted-foreground italic">
            Leave both heading & text empty to hide this block on the live page.
          </p>

          <Field label="Heading">
            <BiRow
              bn={cfg.heading_bn} en={cfg.heading_en}
              onBn={(v) => set("heading_bn", v)} onEn={(v) => set("heading_en", v)}
              translating={translating} translateBnToEn={() => translate(cfg.heading_bn, "en", "heading_en")} translateEnToBn={() => translate(cfg.heading_en, "bn", "heading_bn")}
              fieldEn="heading_en" fieldBn="heading_bn"
            />
          </Field>

          <Field label="Body text">
            <BiRow multiline rows={6}
              bn={cfg.text_bn} en={cfg.text_en}
              onBn={(v) => set("text_bn", v)} onEn={(v) => set("text_en", v)}
              translating={translating} translateBnToEn={() => translate(cfg.text_bn, "en", "text_en")} translateEnToBn={() => translate(cfg.text_en, "bn", "text_bn")}
              fieldEn="text_en" fieldBn="text_bn"
            />
          </Field>
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
  bn, en, onBn, onEn, translating, translateBnToEn, translateEnToBn, fieldEn, fieldBn,
  multiline, rows = 3,
}: {
  bn: string; en: string; onBn: (v: string) => void; onEn: (v: string) => void;
  translating: string | null; translateBnToEn: () => void; translateEnToBn: () => void;
  fieldEn: string; fieldBn: string;
  multiline?: boolean; rows?: number;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-start gap-1">
      {multiline
        ? <textarea className={`${inputCls} font-bengali min-h-[60px]`} rows={rows} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />
        : <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />}
      <button onClick={translateBnToEn} disabled={translating === fieldEn || !bn.trim()} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="BN → EN">
        {translating === fieldEn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
      </button>
    </div>
    <div className="flex items-start gap-1">
      {multiline
        ? <textarea className={`${inputCls} min-h-[60px]`} rows={rows} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />
        : <input className={inputCls} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />}
      <button onClick={translateEnToBn} disabled={translating === fieldBn || !en.trim()} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="EN → BN">
        {translating === fieldBn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
      </button>
    </div>
  </div>
);

export default BodyEditorPanel;
