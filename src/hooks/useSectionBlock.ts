// useSectionBlock — small hook + helpers for landing sections to consume their
// CMS config and render section header + visibility consistently.

import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ALIGN_CLASS, SPACING_CLASS, TITLE_SIZE_CLASS, ANIMATION_DURATION,
  type SectionConfig,
} from "@/lib/pageBlocks";

const pickL = (lang: "bn" | "en", bn: string, en: string, fallback: string) => {
  const v = lang === "en" ? (en || bn) : (bn || en);
  return v || fallback;
};

export interface SectionBlockResult {
  cfg: SectionConfig;
  visible: boolean;
  hideForVisitors: boolean;
  /** convenient resolved fields */
  texts: { eyebrow: string; title: string; subtitle: string };
  classes: { spacing: string; align: string; titleSize: string };
  styles: {
    section: React.CSSProperties;
    title: React.CSSProperties;
    eyebrow: React.CSSProperties;
  };
  animDur: number;
  animEnabled: boolean;
}

export function useSectionBlock(
  blockKey: string,
  fallback: { eyebrow?: string; title?: string; subtitle?: string } = {},
  page: string = "landing",
): SectionBlockResult {
  const { getSection, isVisible } = usePageBlocks();
  const { editMode } = useVisualEditor();
  const { lang } = useLanguage();
  const cfg = getSection(blockKey, page);
  const visible = isVisible(blockKey, page);
  const hideForVisitors = !visible && !editMode;

  const adv = cfg.style.advanced;
  const animDur = ANIMATION_DURATION[cfg.style.animation];

  return {
    cfg,
    visible,
    hideForVisitors,
    texts: {
      eyebrow: pickL(lang, cfg.text.eyebrow_bn, cfg.text.eyebrow_en, fallback.eyebrow ?? ""),
      title: pickL(lang, cfg.text.title_bn, cfg.text.title_en, fallback.title ?? ""),
      subtitle: pickL(lang, cfg.text.subtitle_bn, cfg.text.subtitle_en, fallback.subtitle ?? ""),
    },
    classes: {
      spacing: SPACING_CLASS[cfg.style.spacing],
      align: ALIGN_CLASS[cfg.style.align],
      titleSize: TITLE_SIZE_CLASS[cfg.style.titleSize],
    },
    styles: {
      section: {
        ...(adv.paddingTopPx != null ? { paddingTop: `${adv.paddingTopPx}px` } : {}),
        ...(adv.paddingBottomPx != null ? { paddingBottom: `${adv.paddingBottomPx}px` } : {}),
        ...(adv.backgroundColor ? { backgroundColor: adv.backgroundColor } : {}),
        ...(!visible ? { outline: "2px dashed hsl(var(--destructive))", opacity: 0.5 } : {}),
      },
      title: {
        ...(adv.titleFontPx ? { fontSize: `${adv.titleFontPx}px` } : {}),
        ...(adv.titleColor ? { color: adv.titleColor } : {}),
      },
      eyebrow: adv.accentColor ? { color: adv.accentColor } : {},
    },
    animDur,
    animEnabled: cfg.style.animation !== "none",
  };
}
