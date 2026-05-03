// HeroEditorPanel — floating right-side inline editor for the landing Hero block.
// - Visible only when admin/moderator + editMode is on.
// - Edits autosave to draft_config in DB.
// - Live preview is on by default while panel is open.
// - Publish promotes draft → published_config; Revert resets draft.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Sparkles, Languages, Save, RotateCcw, Settings2,
  Type as TypeIcon, Wand2, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  HeroConfig, HeroPreset, HeroAlign, HeroSizeScale, HeroSpacing,
  HeroAnimation, HeroBackground,
} from "@/lib/pageBlocks";

const PRESETS: { id: HeroPreset; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "editorial", label: "Editorial" },
];
const ALIGNS: HeroAlign[] = ["left", "center", "right"];
const SIZES: HeroSizeScale[] = ["s", "m", "l", "xl"];
const SPACINGS: HeroSpacing[] = ["tight", "comfortable", "spacious"];
const ANIMS: HeroAnimation[] = ["none", "subtle", "elegant", "dramatic"];
const BGS: HeroBackground[] = ["image", "gradient", "solid"];

type Tab = "text" | "show" | "style" | "advanced";

const HeroEditorPanel = () => {
  const { role } = useAuth();
  const { editMode, setEditMode } = useVisualEditor();
  const {
    heroDraft, heroRow, heroVisible, previewDraft, setPreviewDraft,
    updateHeroDraft, setHeroVisible, publishHero, revertHeroDraft, saving,
  } = usePageBlocks();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("text");
  const [translating, setTranslating] = useState<string | null>(null);

  const isEditor = role === "admin" || role === "moderator";
  const shouldShow = isEditor && editMode && !!heroRow;

  // Auto-enable draft preview while panel is open; turn it off when it closes.
  useEffect(() => {
    if (shouldShow) setPreviewDraft(true);
    else setPreviewDraft(false);
    // setPreviewDraft is stable from context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  if (!shouldShow) return null;

  const cfg: HeroConfig = heroDraft;

  const setText = (k: keyof HeroConfig["text"], v: string) =>
    updateHeroDraft({ ...cfg, text: { ...cfg.text, [k]: v } });
  const setShow = (k: keyof HeroConfig["show"], v: boolean) =>
    updateHeroDraft({ ...cfg, show: { ...cfg.show, [k]: v } });
  const setStyle = <K extends keyof HeroConfig["style"]>(k: K, v: HeroConfig["style"][K]) =>
    updateHeroDraft({ ...cfg, style: { ...cfg.style, [k]: v } });
  const setAdv = (k: keyof HeroConfig["style"]["advanced"], v: any) =>
    updateHeroDraft({ ...cfg, style: { ...cfg.style, advanced: { ...cfg.style.advanced, [k]: v } } });

  const autoTranslate = async (sourceText: string, targetLang: "bn" | "en", targetField: string) => {
    if (!sourceText.trim()) {
      toast({ title: "Source field is empty", variant: "destructive" });
      return;
    }
    setTranslating(targetField);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text: sourceText, targetLang },
      });
      if (error) throw error;
      const translated = data?.translatedText || "";
      if (translated) setText(targetField as any, translated);
    } catch (e: any) {
      toast({ title: "Translation failed", description: e?.message, variant: "destructive" });
    } finally {
      setTranslating(null);
    }
  };

  const handlePublish = async () => {
    await publishHero();
    toast({ title: "Published", description: "Hero is now live for visitors." });
  };

  const handleRevert = async () => {
    await revertHeroDraft();
    toast({ title: "Reverted to published version" });
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "text", label: "Text", icon: TypeIcon },
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
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Hero Section</p>
              <p className="text-[10px] text-muted-foreground">
                {heroRow?.has_unpublished_changes ? "Unpublished changes" : "All changes published"}
                {saving && " · saving…"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditMode(false)}
            className="p-1.5 rounded-full hover:bg-foreground/10"
            title="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visibility toggle */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 text-xs">
            {heroVisible ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
            <span>Section {heroVisible ? "visible" : "hidden"}</span>
          </div>
          <button
            onClick={() => setHeroVisible(!heroVisible)}
            className={`text-[11px] px-2 py-1 rounded-full font-medium ${heroVisible ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`}
          >
            {heroVisible ? "Hide" : "Show"}
          </button>
        </div>

        {/* Tabs */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === "text" && (
            <>
              <BilingualField
                label="Eyebrow / Tagline"
                bn={cfg.text.eyebrow_bn} en={cfg.text.eyebrow_en}
                onBn={(v) => setText("eyebrow_bn", v)} onEn={(v) => setText("eyebrow_en", v)}
                onTranslate={autoTranslate}
                bnField="eyebrow_bn" enField="eyebrow_en"
                translating={translating}
              />
              <BilingualField
                label="Title"
                bn={cfg.text.title_bn} en={cfg.text.title_en}
                onBn={(v) => setText("title_bn", v)} onEn={(v) => setText("title_en", v)}
                onTranslate={autoTranslate}
                bnField="title_bn" enField="title_en"
                translating={translating}
              />
              <BilingualField
                label="Established badge"
                bn={cfg.text.established_bn} en={cfg.text.established_en}
                onBn={(v) => setText("established_bn", v)} onEn={(v) => setText("established_en", v)}
                onTranslate={autoTranslate}
                bnField="established_bn" enField="established_en"
                translating={translating}
              />
              <BilingualField
                label="Subtitle"
                bn={cfg.text.subtitle_bn} en={cfg.text.subtitle_en}
                onBn={(v) => setText("subtitle_bn", v)} onEn={(v) => setText("subtitle_en", v)}
                onTranslate={autoTranslate}
                bnField="subtitle_bn" enField="subtitle_en"
                translating={translating}
                multiline
              />
              <Field label="Visitor count">
                <input className={inputCls} value={cfg.text.visitorCount} onChange={(e) => setText("visitorCount", e.target.value)} />
              </Field>

              <CtaGroup
                label="Primary CTA"
                bn={cfg.text.ctaPrimary_bn} en={cfg.text.ctaPrimary_en} href={cfg.text.ctaPrimaryHref}
                onBn={(v) => setText("ctaPrimary_bn", v)} onEn={(v) => setText("ctaPrimary_en", v)}
                onHref={(v) => setText("ctaPrimaryHref", v)}
              />
              <CtaGroup
                label="Secondary CTA"
                bn={cfg.text.ctaSecondary_bn} en={cfg.text.ctaSecondary_en} href={cfg.text.ctaSecondaryHref}
                onBn={(v) => setText("ctaSecondary_bn", v)} onEn={(v) => setText("ctaSecondary_en", v)}
                onHref={(v) => setText("ctaSecondaryHref", v)}
              />
              <CtaGroup
                label="Tertiary CTA"
                bn={cfg.text.ctaTertiary_bn} en={cfg.text.ctaTertiary_en} href={cfg.text.ctaTertiaryHref}
                onBn={(v) => setText("ctaTertiary_bn", v)} onEn={(v) => setText("ctaTertiary_en", v)}
                onHref={(v) => setText("ctaTertiaryHref", v)}
              />
            </>
          )}

          {tab === "show" && (
            <div className="space-y-1">
              {(Object.keys(cfg.show) as Array<keyof HeroConfig["show"]>).map((k) => (
                <ToggleRow key={k} label={humanize(k)} value={cfg.show[k]} onChange={(v) => setShow(k, v)} />
              ))}
            </div>
          )}

          {tab === "style" && (
            <>
              <Field label="Preset">
                <SegGroup options={PRESETS.map((p) => ({ id: p.id, label: p.label }))} value={cfg.style.preset} onChange={(v) => setStyle("preset", v as HeroPreset)} />
              </Field>
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
              <Field label="Background">
                <SegGroup options={BGS.map((b) => ({ id: b, label: cap(b) }))} value={cfg.style.background} onChange={(v) => setStyle("background", v as HeroBackground)} />
              </Field>
            </>
          )}

          {tab === "advanced" && (
            <>
              <p className="text-[11px] text-muted-foreground mb-2">Raw values override presets. Leave blank to use the preset.</p>
              <NumField label="Title font size (px)" value={cfg.style.advanced.titleFontPx} onChange={(v) => setAdv("titleFontPx", v)} min={16} max={160} />
              <NumField label="Subtitle font size (px)" value={cfg.style.advanced.subtitleFontPx} onChange={(v) => setAdv("subtitleFontPx", v)} min={10} max={48} />
              <NumField label="Eyebrow letter-spacing (em)" value={cfg.style.advanced.eyebrowLetterSpacingEm} onChange={(v) => setAdv("eyebrowLetterSpacingEm", v)} min={0} max={2} step={0.05} />
              <NumField label="Padding top (px)" value={cfg.style.advanced.paddingTopPx} onChange={(v) => setAdv("paddingTopPx", v)} min={0} max={400} />
              <NumField label="Padding bottom (px)" value={cfg.style.advanced.paddingBottomPx} onChange={(v) => setAdv("paddingBottomPx", v)} min={0} max={400} />
              <Field label="Title color">
                <ColorInput value={cfg.style.advanced.titleColor} onChange={(v) => setAdv("titleColor", v)} />
              </Field>
              <Field label="Accent color (eyebrow)">
                <ColorInput value={cfg.style.advanced.accentColor} onChange={(v) => setAdv("accentColor", v)} />
              </Field>
              <NumField label="Background overlay (0–1)" value={cfg.style.advanced.overlayOpacity} onChange={(v) => setAdv("overlayOpacity", v)} min={0} max={1} step={0.05} />
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-3 bg-muted/30 flex items-center gap-2">
          <button
            onClick={handleRevert}
            disabled={saving || !heroRow?.has_unpublished_changes}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-background hover:bg-foreground/5 text-xs font-medium border border-border disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Revert
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !heroRow?.has_unpublished_changes}
            className="flex-[1.5] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// --- subcomponents ---

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const BilingualField = ({
  label, bn, en, onBn, onEn, onTranslate, bnField, enField, translating, multiline,
}: {
  label: string; bn: string; en: string;
  onBn: (v: string) => void; onEn: (v: string) => void;
  onTranslate: (text: string, lang: "bn" | "en", targetField: string) => void;
  bnField: string; enField: string; translating: string | null; multiline?: boolean;
}) => (
  <Field label={label}>
    <div className="space-y-1.5">
      <div className="flex items-start gap-1">
        {multiline ? (
          <textarea className={`${inputCls} min-h-[60px] font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />
        ) : (
          <input className={`${inputCls} font-bengali`} placeholder="বাংলা" value={bn} onChange={(e) => onBn(e.target.value)} />
        )}
        <button
          onClick={() => onTranslate(bn, "en", enField)}
          disabled={translating === enField || !bn.trim()}
          className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0"
          title="Translate BN → EN"
        >
          {translating === enField ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex items-start gap-1">
        {multiline ? (
          <textarea className={`${inputCls} min-h-[60px]`} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />
        ) : (
          <input className={inputCls} placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} />
        )}
        <button
          onClick={() => onTranslate(en, "bn", bnField)}
          disabled={translating === bnField || !en.trim()}
          className="p-2 rounded-lg bg-muted hover:bg-foreground/10 disabled:opacity-40 shrink-0"
          title="Translate EN → BN"
        >
          {translating === bnField ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  </Field>
);

const CtaGroup = ({
  label, bn, en, href, onBn, onEn, onHref,
}: {
  label: string; bn: string; en: string; href: string;
  onBn: (v: string) => void; onEn: (v: string) => void; onHref: (v: string) => void;
}) => (
  <Field label={label}>
    <div className="space-y-1.5">
      <input className={`${inputCls} font-bengali`} placeholder="বাংলা label" value={bn} onChange={(e) => onBn(e.target.value)} />
      <input className={inputCls} placeholder="English label" value={en} onChange={(e) => onEn(e.target.value)} />
      <input className={`${inputCls} text-xs`} placeholder="/path or https://..." value={href} onChange={(e) => onHref(e.target.value)} />
    </div>
  </Field>
);

const ToggleRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50">
    <span className="text-sm">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  </div>
);

const SegGroup = ({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) => (
  <div className="grid grid-cols-4 gap-1 p-0.5 bg-muted/50 rounded-lg">
    {options.map((o) => (
      <button
        key={o.id}
        onClick={() => onChange(o.id)}
        className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors ${value === o.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const NumField = ({ label, value, onChange, min, max, step = 1 }: { label: string; value: number | null; onChange: (v: number | null) => void; min?: number; max?: number; step?: number }) => (
  <Field label={label}>
    <div className="flex items-center gap-1">
      <input
        type="number"
        className={inputCls}
        placeholder="auto"
        value={value ?? ""}
        min={min} max={max} step={step}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
      />
      {value !== null && (
        <button onClick={() => onChange(null)} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 text-[10px]" title="Reset">
          ×
        </button>
      )}
    </div>
  </Field>
);

const ColorInput = ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => (
  <div className="flex items-center gap-1">
    <input
      type="color"
      className="w-10 h-9 rounded-lg border border-border bg-background cursor-pointer"
      value={value ?? "#ffffff"}
      onChange={(e) => onChange(e.target.value)}
    />
    <input
      type="text"
      className={inputCls}
      placeholder="auto (e.g. #ffffff or hsl(...))"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    />
    {value !== null && (
      <button onClick={() => onChange(null)} className="p-2 rounded-lg bg-muted hover:bg-foreground/10 text-[10px]" title="Reset">×</button>
    )}
  </div>
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const humanize = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default HeroEditorPanel;
