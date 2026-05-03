// SectionEditorPanel — generic floating editor for SectionConfig blocks
// (about, services, events_preview, members, footer).
// Hero has its own richer panel; this handles the rest with the same UX.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Sparkles, Languages, Save, RotateCcw, Settings2,
  Type as TypeIcon, Wand2, Loader2, Plus, Trash2, ChevronUp, ChevronDown, Layers, History,
} from "lucide-react";
import RevisionsDialog from "@/components/editor/RevisionsDialog";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BLOCK_LABELS, SERVICE_ICONS, DEFAULT_SERVICES_ITEMS, newId,
  STAT_ICONS, DEFAULT_ABOUT_STATS, TAG_COLORS, MEMBER_GRADIENTS,
  type AnyBlockKey, type SectionConfig, type ServicesItem, type ServiceIcon,
  type AboutStatItem, type StatIcon, type EventsItem, type MembersItem,
  type HeroAlign, type HeroSizeScale, type HeroSpacing, type HeroAnimation,
} from "@/lib/pageBlocks";

const ALIGNS: HeroAlign[] = ["left", "center", "right"];
const SIZES: HeroSizeScale[] = ["s", "m", "l", "xl"];
const SPACINGS: HeroSpacing[] = ["tight", "comfortable", "spacious"];
const ANIMS: HeroAnimation[] = ["none", "subtle", "elegant", "dramatic"];

type Tab = "text" | "items" | "show" | "style" | "advanced";

interface Props {
  blockKey: string;
  page?: string;          // default "landing"
  label?: string;         // override BLOCK_LABELS
}

const SectionEditorPanel = ({ blockKey, page = "landing", label }: Props) => {
  const { role } = useAuth();
  const { editMode } = useVisualEditor();
  const {
    activeBlock, setActiveBlock, setPreviewDraft,
    getRow, getSectionDraft, isVisible,
    updateSectionDraft, setBlockVisible, publishBlock, revertBlockDraft, saving,
    updateRawDraft, getRawDraft,
  } = usePageBlocks();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("text");
  const [translating, setTranslating] = useState<string | null>(null);
  const [revisionsOpen, setRevisionsOpen] = useState(false);

  const isEditor = role === "admin" || role === "moderator";
  const row = getRow(blockKey, page);
  const activeKey = `${page}:${blockKey}`;
  const shouldShow = isEditor && editMode && (activeBlock as unknown as string) === activeKey && !!row;

  useEffect(() => {
    if (shouldShow) setPreviewDraft(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  if (!shouldShow) return null;

  const cfg: SectionConfig = getSectionDraft(blockKey, page);
  const visible = isVisible(blockKey, page);
  const isServices = page === "landing" && blockKey === "about" ? false : page === "landing" && blockKey === "services";
  const isAbout = page === "landing" && blockKey === "about";
  const isEventsPreview = page === "landing" && blockKey === "events_preview";
  const isMembers = page === "landing" && blockKey === "members";
  const isAboutStats = page === "about" && blockKey === "stats";
  const showsStats = isAbout || isAboutStats;
  const hasItems = isServices || isAbout || isEventsPreview || isMembers || isAboutStats;
  const itemsLabel = (isAbout || isAboutStats) ? "Stats" : isMembers ? "Members" : isEventsPreview ? "Events" : "Cards";
  const rawDraft = getRawDraft(blockKey, page);
  const blockLabel = label ?? BLOCK_LABELS[blockKey] ?? blockKey;

  // ---- services items
  const svcItems: ServicesItem[] = isServices
    ? (Array.isArray(rawDraft?.items) ? rawDraft.items : DEFAULT_SERVICES_ITEMS)
    : [];
  // ---- about stats (used on landing 'about' AND about/'stats' blocks)
  const aboutStats: AboutStatItem[] = showsStats
    ? (Array.isArray(rawDraft?.stats) ? rawDraft.stats : DEFAULT_ABOUT_STATS)
    : [];
  // ---- events items (default empty → falls back to DB events)
  const eventItems: EventsItem[] = isEventsPreview && Array.isArray(rawDraft?.items) ? rawDraft.items : [];
  // ---- members items (default empty → falls back to DB members)
  const memberItems: MembersItem[] = isMembers && Array.isArray(rawDraft?.items) ? rawDraft.items : [];

  const setText = (k: keyof SectionConfig["text"], v: string) =>
    updateSectionDraft(blockKey, { ...cfg, text: { ...cfg.text, [k]: v } }, page);
  const setShow = (k: keyof SectionConfig["show"], v: boolean) =>
    updateSectionDraft(blockKey, { ...cfg, show: { ...cfg.show, [k]: v } }, page);
  const setStyle = <K extends keyof SectionConfig["style"]>(k: K, v: SectionConfig["style"][K]) =>
    updateSectionDraft(blockKey, { ...cfg, style: { ...cfg.style, [k]: v } }, page);
  const setAdv = (k: keyof SectionConfig["style"]["advanced"], v: any) =>
    updateSectionDraft(blockKey, { ...cfg, style: { ...cfg.style, advanced: { ...cfg.style.advanced, [k]: v } } }, page);

  // ---- generic array helpers ----
  const moveInArray = <T extends { id: string }>(arr: T[], id: string, dir: -1 | 1): T[] => {
    const i = arr.findIndex((x) => x.id === id); if (i < 0) return arr;
    const j = i + dir; if (j < 0 || j >= arr.length) return arr;
    const out = [...arr]; [out[i], out[j]] = [out[j], out[i]]; return out;
  };

  // ---- services items helpers ----
  const setSvcItems = (next: ServicesItem[]) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, items: next }), page);
  const addSvc = () => setSvcItems([...svcItems, { id: newId("svc"), icon: "BookOpen", title_bn: "নতুন সেবা", title_en: "New Service", desc_bn: "", desc_en: "", visible: true }]);
  const removeSvc = (id: string) => setSvcItems(svcItems.filter((x) => x.id !== id));
  const moveSvc = (id: string, dir: -1 | 1) => setSvcItems(moveInArray(svcItems, id, dir));
  const updateSvc = (id: string, patch: Partial<ServicesItem>) =>
    setSvcItems(svcItems.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  // ---- about stats helpers ----
  const setStats = (next: AboutStatItem[]) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, stats: next }), page);
  const addStat = () => setStats([...aboutStats, { id: newId("stat"), icon: "Star", value: "১০০+", label_bn: "নতুন", label_en: "New", visible: true }]);
  const removeStat = (id: string) => setStats(aboutStats.filter((x) => x.id !== id));
  const moveStat = (id: string, dir: -1 | 1) => setStats(moveInArray(aboutStats, id, dir));
  const updateStat = (id: string, patch: Partial<AboutStatItem>) =>
    setStats(aboutStats.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  // ---- events items helpers ----
  const setEvItems = (next: EventsItem[]) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, items: next }), page);
  const addEv = () => setEvItems([...eventItems, { id: newId("ev"), title_bn: "নতুন অনুষ্ঠান", title_en: "New Event", date: "", time: "", location: "", tag: "", tag_color: TAG_COLORS[0], href: "/events", visible: true }]);
  const removeEv = (id: string) => setEvItems(eventItems.filter((x) => x.id !== id));
  const moveEv = (id: string, dir: -1 | 1) => setEvItems(moveInArray(eventItems, id, dir));
  const updateEv = (id: string, patch: Partial<EventsItem>) =>
    setEvItems(eventItems.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  // ---- members items helpers ----
  const setMemItems = (next: MembersItem[]) =>
    updateRawDraft(blockKey, (prev: any) => ({ ...prev, items: next }), page);
  const addMem = () => setMemItems([...memberItems, { id: newId("mem"), name_bn: "নাম", name_en: "Name", title_bn: "", title_en: "", bio_bn: "", bio_en: "", avatar_url: "", gradient_class: MEMBER_GRADIENTS[0], visible: true }]);
  const removeMem = (id: string) => setMemItems(memberItems.filter((x) => x.id !== id));
  const moveMem = (id: string, dir: -1 | 1) => setMemItems(moveInArray(memberItems, id, dir));
  const updateMem = (id: string, patch: Partial<MembersItem>) =>
    setMemItems(memberItems.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const autoTranslate = async (sourceText: string, targetLang: "bn" | "en", targetField: string, applyTo?: (v: string) => void) => {
    if (!sourceText.trim()) { toast({ title: "Source field is empty", variant: "destructive" }); return; }
    setTranslating(targetField);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text: sourceText, targetLang },
      });
      if (error) throw error;
      const translated = data?.translatedText || "";
      if (translated) {
        if (applyTo) applyTo(translated);
        else setText(targetField as any, translated);
      }
    } catch (e: any) {
      toast({ title: "Translation failed", description: e?.message, variant: "destructive" });
    } finally { setTranslating(null); }
  };

  const handlePublish = async () => {
    await publishBlock(blockKey, page);
    toast({ title: "Published", description: `${blockLabel} is now live.` });
  };
  const handleRevert = async () => {
    await revertBlockDraft(blockKey, page);
    toast({ title: "Reverted to published version" });
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "text", label: "Text", icon: TypeIcon },
    ...(hasItems ? [{ id: "items" as Tab, label: itemsLabel, icon: Layers }] : []),
    { id: "show", label: "Show/Hide", icon: Eye },
    { id: "style", label: "Style", icon: Wand2 },
    { id: "advanced", label: "Advanced", icon: Settings2 },
  ];


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
              <p className="text-sm font-semibold truncate">{blockLabel} Section</p>
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
            <span>Section {visible ? "visible" : "hidden"}</span>
          </div>
          <button
            onClick={() => setBlockVisible(blockKey, !visible, page)}
            className={`text-[11px] px-2 py-1 rounded-full font-medium ${visible ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex border-b border-border bg-muted/20 overflow-x-auto">
          {tabs.map((tt) => (
            <button
              key={tt.id}
              onClick={() => setTab(tt.id)}
              className={`flex-1 min-w-[88px] flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium border-b-2 transition-colors ${tab === tt.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <tt.icon className="w-3.5 h-3.5" />
              {tt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === "text" && (
            <>
              <Bilingual label="Eyebrow / Tagline"
                bn={cfg.text.eyebrow_bn} en={cfg.text.eyebrow_en}
                onBn={(v) => setText("eyebrow_bn", v)} onEn={(v) => setText("eyebrow_en", v)}
                onTranslate={autoTranslate}
                bnField="eyebrow_bn" enField="eyebrow_en" translating={translating} />
              <Bilingual label="Title"
                bn={cfg.text.title_bn} en={cfg.text.title_en}
                onBn={(v) => setText("title_bn", v)} onEn={(v) => setText("title_en", v)}
                onTranslate={autoTranslate}
                bnField="title_bn" enField="title_en" translating={translating} />
              <Bilingual label="Subtitle"
                bn={cfg.text.subtitle_bn} en={cfg.text.subtitle_en}
                onBn={(v) => setText("subtitle_bn", v)} onEn={(v) => setText("subtitle_en", v)}
                onTranslate={autoTranslate}
                bnField="subtitle_bn" enField="subtitle_en" translating={translating} multiline />
            </>
          )}

          {tab === "items" && isServices && (
            <ItemsList
              count={svcItems.length} label="card"
              onAdd={addSvc}
              empty="No items. Add a card to get started."
            >
              {svcItems.map((it, idx) => {
                const Icon = (LucideIcons as any)[it.icon] || LucideIcons.BookOpen;
                return (
                  <ItemCard key={it.id}
                    onUp={() => moveSvc(it.id, -1)} upDisabled={idx === 0}
                    onDown={() => moveSvc(it.id, 1)} downDisabled={idx === svcItems.length - 1}
                    onRemove={() => removeSvc(it.id)}
                    onToggleVisible={() => updateSvc(it.id, { visible: !it.visible })}
                    visible={it.visible}
                    leading={<Icon className="w-4 h-4 text-primary shrink-0" />}
                    leadingControl={
                      <select value={it.icon} onChange={(e) => updateSvc(it.id, { icon: e.target.value as ServiceIcon })} className={`${inputCls} text-xs flex-1`}>
                        {SERVICE_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    }
                  >
                    <BilingualRow bn={it.title_bn} en={it.title_en}
                      onBn={(v) => updateSvc(it.id, { title_bn: v })} onEn={(v) => updateSvc(it.id, { title_en: v })}
                      placeholderBn="বাংলা শিরোনাম" placeholderEn="English title"
                      translateToken={`svc_${it.id}_t_en`} translating={translating}
                      onTranslateBnEn={() => autoTranslate(it.title_bn, "en", `svc_${it.id}_t_en`, (v) => updateSvc(it.id, { title_en: v }))}
                    />
                    <textarea className={`${inputCls} font-bengali text-xs min-h-[44px]`} placeholder="বাংলা বিবরণ" value={it.desc_bn} onChange={(e) => updateSvc(it.id, { desc_bn: e.target.value })} />
                    <textarea className={`${inputCls} text-xs min-h-[44px]`} placeholder="English description" value={it.desc_en} onChange={(e) => updateSvc(it.id, { desc_en: e.target.value })} />
                  </ItemCard>
                );
              })}
            </ItemsList>
          )}

          {tab === "items" && isAbout && (
            <ItemsList
              count={aboutStats.length} label="stat"
              onAdd={addStat}
              empty="No stats. Add a tile to get started."
            >
              {aboutStats.map((it, idx) => {
                const Icon = (LucideIcons as any)[it.icon] || LucideIcons.Star;
                return (
                  <ItemCard key={it.id}
                    onUp={() => moveStat(it.id, -1)} upDisabled={idx === 0}
                    onDown={() => moveStat(it.id, 1)} downDisabled={idx === aboutStats.length - 1}
                    onRemove={() => removeStat(it.id)}
                    onToggleVisible={() => updateStat(it.id, { visible: !it.visible })}
                    visible={it.visible}
                    leading={<Icon className="w-4 h-4 text-primary shrink-0" />}
                    leadingControl={
                      <select value={it.icon} onChange={(e) => updateStat(it.id, { icon: e.target.value as StatIcon })} className={`${inputCls} text-xs flex-1`}>
                        {STAT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    }
                  >
                    <input className={`${inputCls} font-bengali text-sm font-bold`} placeholder="৫০০+" value={it.value} onChange={(e) => updateStat(it.id, { value: e.target.value })} />
                    <BilingualRow bn={it.label_bn} en={it.label_en}
                      onBn={(v) => updateStat(it.id, { label_bn: v })} onEn={(v) => updateStat(it.id, { label_en: v })}
                      placeholderBn="বাংলা লেবেল" placeholderEn="English label"
                      translateToken={`stat_${it.id}_l_en`} translating={translating}
                      onTranslateBnEn={() => autoTranslate(it.label_bn, "en", `stat_${it.id}_l_en`, (v) => updateStat(it.id, { label_en: v }))}
                    />
                  </ItemCard>
                );
              })}
            </ItemsList>
          )}

          {tab === "items" && isEventsPreview && (
            <ItemsList
              count={eventItems.length} label="event"
              onAdd={addEv}
              empty="No custom events. Live events from the database will be shown until you add overrides here."
            >
              {eventItems.map((it, idx) => (
                <ItemCard key={it.id}
                  onUp={() => moveEv(it.id, -1)} upDisabled={idx === 0}
                  onDown={() => moveEv(it.id, 1)} downDisabled={idx === eventItems.length - 1}
                  onRemove={() => removeEv(it.id)}
                  onToggleVisible={() => updateEv(it.id, { visible: !it.visible })}
                  visible={it.visible}
                  leadingControl={
                    <input className={`${inputCls} text-xs flex-1`} placeholder="Tag (e.g. Workshop)" value={it.tag} onChange={(e) => updateEv(it.id, { tag: e.target.value })} />
                  }
                >
                  <BilingualRow bn={it.title_bn} en={it.title_en}
                    onBn={(v) => updateEv(it.id, { title_bn: v })} onEn={(v) => updateEv(it.id, { title_en: v })}
                    placeholderBn="বাংলা শিরোনাম" placeholderEn="English title"
                    translateToken={`ev_${it.id}_t_en`} translating={translating}
                    onTranslateBnEn={() => autoTranslate(it.title_bn, "en", `ev_${it.id}_t_en`, (v) => updateEv(it.id, { title_en: v }))}
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input className={`${inputCls} font-bengali text-xs`} placeholder="তারিখ / Date" value={it.date} onChange={(e) => updateEv(it.id, { date: e.target.value })} />
                    <input className={`${inputCls} font-bengali text-xs`} placeholder="সময় / Time" value={it.time} onChange={(e) => updateEv(it.id, { time: e.target.value })} />
                  </div>
                  <input className={`${inputCls} font-bengali text-xs`} placeholder="অবস্থান / Location" value={it.location} onChange={(e) => updateEv(it.id, { location: e.target.value })} />
                  <input className={`${inputCls} text-xs`} placeholder="/events/slug or https://..." value={it.href} onChange={(e) => updateEv(it.id, { href: e.target.value })} />
                  <select className={`${inputCls} text-xs`} value={it.tag_color} onChange={(e) => updateEv(it.id, { tag_color: e.target.value })}>
                    {TAG_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </ItemCard>
              ))}
            </ItemsList>
          )}

          {tab === "items" && isMembers && (
            <ItemsList
              count={memberItems.length} label="member"
              onAdd={addMem}
              empty="No custom members. Senior members from the database will be shown until you add overrides here."
            >
              {memberItems.map((it, idx) => (
                <ItemCard key={it.id}
                  onUp={() => moveMem(it.id, -1)} upDisabled={idx === 0}
                  onDown={() => moveMem(it.id, 1)} downDisabled={idx === memberItems.length - 1}
                  onRemove={() => removeMem(it.id)}
                  onToggleVisible={() => updateMem(it.id, { visible: !it.visible })}
                  visible={it.visible}
                  leadingControl={
                    <select className={`${inputCls} text-xs flex-1`} value={it.gradient_class} onChange={(e) => updateMem(it.id, { gradient_class: e.target.value })}>
                      {MEMBER_GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  }
                >
                  <BilingualRow bn={it.name_bn} en={it.name_en}
                    onBn={(v) => updateMem(it.id, { name_bn: v })} onEn={(v) => updateMem(it.id, { name_en: v })}
                    placeholderBn="বাংলা নাম" placeholderEn="English name"
                    translateToken={`mem_${it.id}_n_en`} translating={translating}
                    onTranslateBnEn={() => autoTranslate(it.name_bn, "en", `mem_${it.id}_n_en`, (v) => updateMem(it.id, { name_en: v }))}
                  />
                  <BilingualRow bn={it.title_bn} en={it.title_en}
                    onBn={(v) => updateMem(it.id, { title_bn: v })} onEn={(v) => updateMem(it.id, { title_en: v })}
                    placeholderBn="বাংলা পদবি" placeholderEn="English title"
                    translateToken={`mem_${it.id}_t_en`} translating={translating}
                    onTranslateBnEn={() => autoTranslate(it.title_bn, "en", `mem_${it.id}_t_en`, (v) => updateMem(it.id, { title_en: v }))}
                  />
                  <input className={`${inputCls} text-xs`} placeholder="Avatar URL (https://...)" value={it.avatar_url} onChange={(e) => updateMem(it.id, { avatar_url: e.target.value })} />
                  <textarea className={`${inputCls} font-bengali text-xs min-h-[40px]`} placeholder="বাংলা পরিচিতি" value={it.bio_bn} onChange={(e) => updateMem(it.id, { bio_bn: e.target.value })} />
                  <textarea className={`${inputCls} text-xs min-h-[40px]`} placeholder="English bio" value={it.bio_en} onChange={(e) => updateMem(it.id, { bio_en: e.target.value })} />
                </ItemCard>
              ))}
            </ItemsList>
          )}

          {tab === "show" && (
            <div className="space-y-1">
              {(Object.keys(cfg.show) as Array<keyof SectionConfig["show"]>).map((k) => (
                <ToggleRow key={k} label={humanize(k)} value={cfg.show[k]} onChange={(v) => setShow(k, v)} />
              ))}
            </div>
          )}

          {tab === "style" && (
            <>
              <Field label="Alignment">
                <SegGroup options={ALIGNS.map((a) => ({ id: a, label: cap(a) }))} value={cfg.style.align} onChange={(v) => setStyle("align", v as HeroAlign)} />
              </Field>
              <Field label="Title size">
                <SegGroup options={SIZES.map((s) => ({ id: s, label: s.toUpperCase() }))} value={cfg.style.titleSize} onChange={(v) => setStyle("titleSize", v as HeroSizeScale)} />
              </Field>
              <Field label="Spacing">
                <SegGroup options={SPACINGS.map((s) => ({ id: s, label: cap(s) }))} value={cfg.style.spacing} onChange={(v) => setStyle("spacing", v as HeroSpacing)} />
              </Field>
              <Field label="Animation">
                <SegGroup options={ANIMS.map((a) => ({ id: a, label: cap(a) }))} value={cfg.style.animation} onChange={(v) => setStyle("animation", v as HeroAnimation)} />
              </Field>
            </>
          )}

          {tab === "advanced" && (
            <>
              <p className="text-[11px] text-muted-foreground mb-2">Raw values override presets. Leave blank to use the preset.</p>
              <NumField label="Title font size (px)" value={cfg.style.advanced.titleFontPx} onChange={(v) => setAdv("titleFontPx", v)} min={16} max={160} />
              <NumField label="Padding top (px)" value={cfg.style.advanced.paddingTopPx} onChange={(v) => setAdv("paddingTopPx", v)} min={0} max={400} />
              <NumField label="Padding bottom (px)" value={cfg.style.advanced.paddingBottomPx} onChange={(v) => setAdv("paddingBottomPx", v)} min={0} max={400} />
              <Field label="Title color">
                <ColorInput value={cfg.style.advanced.titleColor} onChange={(v) => setAdv("titleColor", v)} />
              </Field>
              <Field label="Accent color (eyebrow)">
                <ColorInput value={cfg.style.advanced.accentColor} onChange={(v) => setAdv("accentColor", v)} />
              </Field>
              <Field label="Background color">
                <ColorInput value={cfg.style.advanced.backgroundColor} onChange={(v) => setAdv("backgroundColor", v)} />
              </Field>
            </>
          )}
        </div>

        <div className="border-t border-border p-3 bg-muted/30 flex items-center gap-2">
          <button onClick={() => setRevisionsOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-full bg-background hover:bg-foreground/5 text-xs font-medium border border-border"
            title="Revision history">
            <History className="w-3.5 h-3.5" />
          </button>
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
      <RevisionsDialog
        open={revisionsOpen}
        onClose={() => setRevisionsOpen(false)}
        page={page}
        blockKey={blockKey}
        blockLabel={blockLabel}
        currentDraft={rawDraft}
      />
    </AnimatePresence>
  );
};

// --- subcomponents (local copy, mirror HeroEditorPanel) ---
const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Bilingual = ({ label, bn, en, onBn, onEn, onTranslate, bnField, enField, translating, multiline }: {
  label: string; bn: string; en: string;
  onBn: (v: string) => void; onEn: (v: string) => void;
  onTranslate: (text: string, lang: "bn" | "en", targetField: string) => void;
  bnField: string; enField: string; translating: string | null; multiline?: boolean;
}) => (
  <Field label={label}>
    <div className="space-y-1.5">
      <div className="flex items-start gap-1">
        {multiline
          ? <textarea className={`${inputCls} min-h-[60px] font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />
          : <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />}
        <button onClick={() => onTranslate(bn, "en", enField)} disabled={translating === enField || !bn.trim()}
          className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="Translate BN → EN">
          {translating === enField ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex items-start gap-1">
        {multiline
          ? <textarea className={`${inputCls} min-h-[60px]`} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />
          : <input className={inputCls} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />}
        <button onClick={() => onTranslate(en, "bn", bnField)} disabled={translating === bnField || !en.trim()}
          className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="Translate EN → BN">
          {translating === bnField ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  </Field>
);

const ToggleRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50">
    <span className="text-sm">{label}</span>
    <button onClick={() => onChange(!value)} className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  </div>
);

const SegGroup = ({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) => (
  <div className="grid grid-cols-4 gap-1 p-0.5 bg-muted/50 rounded-lg">
    {options.map((o) => (
      <button key={o.id} onClick={() => onChange(o.id)}
        className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors ${value === o.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
        {o.label}
      </button>
    ))}
  </div>
);

const NumField = ({ label, value, onChange, min, max, step = 1 }: { label: string; value: number | null; onChange: (v: number | null) => void; min?: number; max?: number; step?: number }) => (
  <Field label={label}>
    <div className="flex items-center gap-1">
      <input type="number" className={inputCls} placeholder="auto" value={value ?? ""} min={min} max={max} step={step}
        onChange={(e) => { const v = e.target.value; onChange(v === "" ? null : Number(v)); }} />
      {value !== null && <button onClick={() => onChange(null)} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 text-[10px]" title="Reset">×</button>}
    </div>
  </Field>
);

const ColorInput = ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => (
  <div className="flex items-center gap-1">
    <input type="color" className="w-10 h-9 rounded-lg border border-border bg-background cursor-pointer" value={value ?? "#ffffff"} onChange={(e) => onChange(e.target.value)} />
    <input type="text" className={inputCls} placeholder="auto (#hex or hsl(...))" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} />
    {value !== null && <button onClick={() => onChange(null)} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 text-[10px]" title="Reset">×</button>}
  </div>
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const humanize = (s: string) => s.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// --- generic item editor primitives (used by services / stats / events / members) ---

const ItemsList = ({ count, label, onAdd, empty, children }: {
  count: number; label: string; onAdd: () => void; empty: string; children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] text-muted-foreground">{count} {label}{count === 1 ? "" : "s"}</p>
      <button onClick={onAdd} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20">
        <Plus className="w-3 h-3" /> Add {label}
      </button>
    </div>
    {count === 0
      ? <p className="text-xs text-muted-foreground italic text-center py-4">{empty}</p>
      : children}
  </div>
);

const ItemCard = ({
  leading, leadingControl, visible, onToggleVisible,
  onUp, upDisabled, onDown, downDisabled, onRemove, children,
}: {
  leading?: React.ReactNode;
  leadingControl?: React.ReactNode;
  visible: boolean; onToggleVisible: () => void;
  onUp: () => void; upDisabled: boolean;
  onDown: () => void; downDisabled: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-border rounded-xl p-3 space-y-2 bg-background/50">
    <div className="flex items-center gap-2">
      {leading}
      {leadingControl}
      <button onClick={onToggleVisible} className="p-1.5 rounded-lg hover:bg-foreground/5" title={visible ? "Hide" : "Show"}>
        {visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <button disabled={upDisabled} onClick={onUp} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30" title="Move up">
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button disabled={downDisabled} onClick={onDown} className="p-1 rounded hover:bg-foreground/5 disabled:opacity-30" title="Move down">
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <button onClick={onRemove} className="p-1 rounded hover:bg-destructive/10 text-destructive" title="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-1 gap-1.5">{children}</div>
  </div>
);

const BilingualRow = ({
  bn, en, onBn, onEn, placeholderBn, placeholderEn,
  translateToken, translating, onTranslateBnEn,
}: {
  bn: string; en: string; onBn: (v: string) => void; onEn: (v: string) => void;
  placeholderBn: string; placeholderEn: string;
  translateToken: string; translating: string | null;
  onTranslateBnEn: () => void;
}) => (
  <>
    <div className="flex gap-1">
      <input className={`${inputCls} font-bengali text-xs`} placeholder={placeholderBn} value={bn} onChange={(e) => onBn(e.target.value)} />
      <button onClick={onTranslateBnEn} disabled={translating === translateToken || !bn.trim()} className="p-1.5 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0" title="BN→EN">
        {translating === translateToken ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
      </button>
    </div>
    <input className={`${inputCls} text-xs`} placeholder={placeholderEn} value={en} onChange={(e) => onEn(e.target.value)} />
  </>
);

export default SectionEditorPanel;
