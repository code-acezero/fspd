// AboutListsEditorPanel — editor for `anniversaries` and `honoured` blocks on the About page.
// Items default to undefined (= use hardcoded fallback). Fill items[] to override.
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Save, RotateCcw, Loader2, Sparkles, History,
  Plus, Trash2, ChevronUp, ChevronDown,
} from "lucide-react";
import RevisionsDialog from "@/components/editor/RevisionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { useToast } from "@/hooks/use-toast";
import {
  BLOCK_LABELS, mergeAnniversariesConfig, mergeHonouredConfig, newId,
  type AnniversariesConfig, type AnniversaryItem,
  type HonouredConfig, type HonouredGroup,
} from "@/lib/pageBlocks";

interface Props { blockKey: "anniversaries" | "honoured"; page?: string; }

const AboutListsEditorPanel = ({ blockKey, page = "about" }: Props) => {
  const { role } = useAuth();
  const { editMode } = useVisualEditor();
  const {
    activeBlock, setActiveBlock, setPreviewDraft, getRow, isVisible,
    setBlockVisible, publishBlock, revertBlockDraft, saving,
    updateRawDraft, getRawDraft,
  } = usePageBlocks();
  const { toast } = useToast();
  const [revisionsOpen, setRevisionsOpen] = useState(false);

  const isEditor = role === "admin" || role === "moderator";
  const row = getRow(blockKey, page);
  const activeKey = `${page}:${blockKey}`;
  const shouldShow = isEditor && editMode && activeBlock === activeKey && !!row;
  useEffect(() => { if (shouldShow) setPreviewDraft(true); /* eslint-disable-next-line */ }, [shouldShow]);
  if (!shouldShow) return null;

  const rawDraft = getRawDraft(blockKey, page);
  const visible = isVisible(blockKey, page);
  const blockLabel = BLOCK_LABELS[blockKey] ?? blockKey;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed right-4 top-4 bottom-24 w-[420px] z-[210] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
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
          <button onClick={() => setActiveBlock(null)} className="p-1.5 rounded-full hover:bg-foreground/10"><X className="w-4 h-4" /></button>
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
          {blockKey === "anniversaries"
            ? <AnniversariesBody page={page} rawDraft={rawDraft} updateRawDraft={updateRawDraft} />
            : <HonouredBody page={page} rawDraft={rawDraft} updateRawDraft={updateRawDraft} />}
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

// ----------------- Anniversaries body -----------------
const AnniversariesBody = ({ page, rawDraft, updateRawDraft }: { page: string; rawDraft: any; updateRawDraft: any }) => {
  const cfg: AnniversariesConfig = mergeAnniversariesConfig(rawDraft);
  const items: AnniversaryItem[] = cfg.items ?? [];
  const set = (k: keyof AnniversariesConfig, v: any) => updateRawDraft("anniversaries", (prev: any) => ({ ...prev, [k]: v }), page);
  const setItems = (next: AnniversaryItem[]) => set("items", next);
  const add = () => setItems([...items, { id: newId("a"), person_bn: "", person_en: "", date_bn: "", date_en: "", venue_bn: "", venue_en: "", visible: true }]);
  const update = (id: string, patch: Partial<AnniversaryItem>) => setItems(items.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setItems(items.filter((x) => x.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const out = [...items]; [out[i], out[j]] = [out[j], out[i]]; setItems(out);
  };

  return (
    <>
      <p className="text-[11px] text-muted-foreground italic">
        Empty list = built-in defaults are shown. Add items to override.
      </p>
      <Field label="Heading">
        <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={cfg.heading_bn} onChange={(e) => set("heading_bn", e.target.value)} />
        <input className={inputCls} placeholder="English" value={cfg.heading_en} onChange={(e) => set("heading_en", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={cfg.subtitle_bn} onChange={(e) => set("subtitle_bn", e.target.value)} />
        <input className={inputCls} placeholder="English" value={cfg.subtitle_en} onChange={(e) => set("subtitle_en", e.target.value)} />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
        <button onClick={add} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
          <Plus className="w-3 h-3" /> Add item
        </button>
      </div>
      {items.length === 0
        ? <p className="text-xs text-muted-foreground italic text-center py-4">No custom items. Built-in defaults are shown.</p>
        : items.map((it, idx) => (
          <div key={it.id} className="border border-border rounded-xl p-2 space-y-1 bg-background/50">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => update(it.id, { visible: !it.visible })} className="p-1 rounded hover:bg-foreground/5" title={it.visible ? "Hide" : "Show"}>
                {it.visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <button disabled={idx === 0} onClick={() => move(it.id, -1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button disabled={idx === items.length - 1} onClick={() => move(it.id, 1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(it.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <input className={`${inputCls} font-bengali text-xs`} placeholder="ব্যক্তি (BN)" value={it.person_bn} onChange={(e) => update(it.id, { person_bn: e.target.value })} />
            <input className={`${inputCls} text-xs`} placeholder="Person (EN)" value={it.person_en} onChange={(e) => update(it.id, { person_en: e.target.value })} />
            <div className="grid grid-cols-2 gap-1">
              <input className={`${inputCls} font-bengali text-xs`} placeholder="তারিখ (BN)" value={it.date_bn} onChange={(e) => update(it.id, { date_bn: e.target.value })} />
              <input className={`${inputCls} text-xs`} placeholder="Date (EN)" value={it.date_en} onChange={(e) => update(it.id, { date_en: e.target.value })} />
            </div>
            <input className={`${inputCls} font-bengali text-xs`} placeholder="অবস্থান (BN)" value={it.venue_bn} onChange={(e) => update(it.id, { venue_bn: e.target.value })} />
            <input className={`${inputCls} text-xs`} placeholder="Venue (EN)" value={it.venue_en} onChange={(e) => update(it.id, { venue_en: e.target.value })} />
          </div>
        ))}
    </>
  );
};

// ----------------- Honoured body -----------------
const HonouredBody = ({ page, rawDraft, updateRawDraft }: { page: string; rawDraft: any; updateRawDraft: any }) => {
  const cfg: HonouredConfig = mergeHonouredConfig(rawDraft);
  const groups: HonouredGroup[] = cfg.groups ?? [];
  const set = (k: keyof HonouredConfig, v: any) => updateRawDraft("honoured", (prev: any) => ({ ...prev, [k]: v }), page);
  const setGroups = (next: HonouredGroup[]) => set("groups", next);
  const add = () => setGroups([...groups, { id: newId("g"), year_bn: "", year_en: "", names_bn: [""], names_en: [""], visible: true }]);
  const update = (id: string, patch: Partial<HonouredGroup>) => setGroups(groups.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setGroups(groups.filter((x) => x.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = groups.findIndex((x) => x.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= groups.length) return;
    const out = [...groups]; [out[i], out[j]] = [out[j], out[i]]; setGroups(out);
  };

  return (
    <>
      <p className="text-[11px] text-muted-foreground italic">
        Names go one per line in each textarea. Empty groups list = built-in defaults are shown.
      </p>
      <Field label="Heading">
        <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={cfg.heading_bn} onChange={(e) => set("heading_bn", e.target.value)} />
        <input className={inputCls} placeholder="English" value={cfg.heading_en} onChange={(e) => set("heading_en", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={cfg.subtitle_bn} onChange={(e) => set("subtitle_bn", e.target.value)} />
        <input className={inputCls} placeholder="English" value={cfg.subtitle_en} onChange={(e) => set("subtitle_en", e.target.value)} />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-muted-foreground">{groups.length} year-group{groups.length === 1 ? "" : "s"}</p>
        <button onClick={add} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
          <Plus className="w-3 h-3" /> Add year
        </button>
      </div>
      {groups.length === 0
        ? <p className="text-xs text-muted-foreground italic text-center py-4">No custom groups. Built-in defaults are shown.</p>
        : groups.map((g, idx) => (
          <div key={g.id} className="border border-border rounded-xl p-2 space-y-1 bg-background/50">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => update(g.id, { visible: !g.visible })} className="p-1 rounded hover:bg-foreground/5">
                {g.visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <button disabled={idx === 0} onClick={() => move(g.id, -1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button disabled={idx === groups.length - 1} onClick={() => move(g.id, 1)} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(g.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <input className={`${inputCls} font-bengali text-xs font-bold`} placeholder="বছর (BN)" value={g.year_bn} onChange={(e) => update(g.id, { year_bn: e.target.value })} />
              <input className={`${inputCls} text-xs font-bold`} placeholder="Year (EN)" value={g.year_en} onChange={(e) => update(g.id, { year_en: e.target.value })} />
            </div>
            <textarea
              className={`${inputCls} font-bengali text-xs min-h-[80px]`}
              placeholder="নামসমূহ — প্রতি লাইনে একটি"
              value={g.names_bn.join("\n")}
              onChange={(e) => update(g.id, { names_bn: e.target.value.split("\n") })}
            />
            <textarea
              className={`${inputCls} text-xs min-h-[80px]`}
              placeholder="Names — one per line"
              value={g.names_en.join("\n")}
              onChange={(e) => update(g.id, { names_en: e.target.value.split("\n") })}
            />
          </div>
        ))}
    </>
  );
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <div className="space-y-1.5">{children}</div>
  </div>
);

export default AboutListsEditorPanel;
