// Page Blocks — CMS configuration types & defaults for the inline page builder.
// Phase 1: Hero block only. More blocks will follow the same pattern.

export type HeroPreset = "classic" | "minimal" | "bold" | "editorial";
export type HeroAlign = "left" | "center" | "right";
export type HeroSizeScale = "s" | "m" | "l" | "xl";
export type HeroSpacing = "tight" | "comfortable" | "spacious";
export type HeroAnimation = "none" | "subtle" | "elegant" | "dramatic";
export type HeroBackground = "image" | "gradient" | "solid";

export interface HeroShow {
  eyebrow: boolean;
  title: boolean;
  establishedBadge: boolean;
  subtitle: boolean;
  visitorBadge: boolean;
  ctas: boolean;
  scrollHint: boolean;
  topBar: boolean;
  motifs: boolean;
  orbs: boolean;
}

export interface HeroText {
  eyebrow_bn: string;
  eyebrow_en: string;
  title_bn: string;
  title_en: string;
  established_bn: string;
  established_en: string;
  subtitle_bn: string;
  subtitle_en: string;
  visitorCount: string;
  ctaPrimary_bn: string;
  ctaPrimary_en: string;
  ctaPrimaryHref: string;
  ctaSecondary_bn: string;
  ctaSecondary_en: string;
  ctaSecondaryHref: string;
  ctaTertiary_bn: string;
  ctaTertiary_en: string;
  ctaTertiaryHref: string;
}

export interface HeroAdvanced {
  titleFontPx: number | null;
  subtitleFontPx: number | null;
  eyebrowLetterSpacingEm: number | null;
  paddingTopPx: number | null;
  paddingBottomPx: number | null;
  titleColor: string | null;
  accentColor: string | null;
  overlayOpacity: number | null;
}

export interface HeroStyle {
  preset: HeroPreset;
  align: HeroAlign;
  titleSize: HeroSizeScale;
  spacing: HeroSpacing;
  animation: HeroAnimation;
  background: HeroBackground;
  advanced: HeroAdvanced;
}

export interface HeroConfig {
  show: HeroShow;
  text: HeroText;
  style: HeroStyle;
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  show: {
    eyebrow: true, title: true, establishedBadge: true, subtitle: true,
    visitorBadge: true, ctas: true, scrollHint: true, topBar: true,
    motifs: true, orbs: true,
  },
  text: {
    eyebrow_bn: "", eyebrow_en: "",
    title_bn: "", title_en: "",
    established_bn: "প্রতিষ্ঠিত ১৯৭৫", established_en: "Established 1975",
    subtitle_bn: "", subtitle_en: "",
    visitorCount: "১২,৪৫৬",
    ctaPrimary_bn: "", ctaPrimary_en: "", ctaPrimaryHref: "/home",
    ctaSecondary_bn: "", ctaSecondary_en: "", ctaSecondaryHref: "#about",
    ctaTertiary_bn: "", ctaTertiary_en: "", ctaTertiaryHref: "/members",
  },
  style: {
    preset: "classic", align: "center", titleSize: "xl",
    spacing: "comfortable", animation: "elegant", background: "image",
    advanced: {
      titleFontPx: null, subtitleFontPx: null, eyebrowLetterSpacingEm: null,
      paddingTopPx: null, paddingBottomPx: null,
      titleColor: null, accentColor: null, overlayOpacity: null,
    },
  },
};

// Deep-merge helper to layer DB config on defaults safely.
export function mergeHeroConfig(raw: any): HeroConfig {
  const r = (raw && typeof raw === "object") ? raw : {};
  return {
    show: { ...DEFAULT_HERO_CONFIG.show, ...(r.show ?? {}) },
    text: { ...DEFAULT_HERO_CONFIG.text, ...(r.text ?? {}) },
    style: {
      ...DEFAULT_HERO_CONFIG.style,
      ...(r.style ?? {}),
      advanced: { ...DEFAULT_HERO_CONFIG.style.advanced, ...((r.style?.advanced) ?? {}) },
    },
  };
}

// Style scale → tailwind class maps, keep brand consistent.
export const TITLE_SIZE_CLASS: Record<HeroSizeScale, string> = {
  s: "text-3xl md:text-4xl lg:text-5xl",
  m: "text-3xl md:text-5xl lg:text-6xl",
  l: "text-4xl md:text-6xl lg:text-7xl",
  xl: "text-5xl md:text-7xl lg:text-8xl",
};

export const SPACING_CLASS: Record<HeroSpacing, string> = {
  tight: "py-12",
  comfortable: "py-20",
  spacious: "py-32",
};

export const ALIGN_CLASS: Record<HeroAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export const ANIMATION_DURATION: Record<HeroAnimation, number> = {
  none: 0, subtle: 0.4, elegant: 0.8, dramatic: 1.2,
};
