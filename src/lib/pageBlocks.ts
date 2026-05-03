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

// =============================================================
// Generic Section block (for About / Services / Events / Members / Footer)
// =============================================================

export type SectionBlockKey = "about" | "services" | "events_preview" | "members" | "footer";
export type AnyBlockKey = "hero" | SectionBlockKey;

export interface SectionShow {
  eyebrow: boolean;
  title: boolean;
  subtitle: boolean;
  divider: boolean;
  decorations: boolean;
}

export interface SectionText {
  eyebrow_bn: string; eyebrow_en: string;
  title_bn: string;   title_en: string;
  subtitle_bn: string; subtitle_en: string;
}

export interface SectionAdvanced {
  titleFontPx: number | null;
  paddingTopPx: number | null;
  paddingBottomPx: number | null;
  titleColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
}

export interface SectionStyle {
  align: HeroAlign;
  titleSize: HeroSizeScale;
  spacing: HeroSpacing;
  animation: HeroAnimation;
  advanced: SectionAdvanced;
}

export interface SectionConfig {
  show: SectionShow;
  text: SectionText;
  style: SectionStyle;
}

export const DEFAULT_SECTION_CONFIG: SectionConfig = {
  show: { eyebrow: true, title: true, subtitle: true, divider: true, decorations: true },
  text: {
    eyebrow_bn: "", eyebrow_en: "",
    title_bn: "", title_en: "",
    subtitle_bn: "", subtitle_en: "",
  },
  style: {
    align: "center", titleSize: "l", spacing: "comfortable", animation: "elegant",
    advanced: {
      titleFontPx: null, paddingTopPx: null, paddingBottomPx: null,
      titleColor: null, accentColor: null, backgroundColor: null,
    },
  },
};

export function mergeSectionConfig(raw: any): SectionConfig {
  const r = (raw && typeof raw === "object") ? raw : {};
  return {
    show: { ...DEFAULT_SECTION_CONFIG.show, ...(r.show ?? {}) },
    text: { ...DEFAULT_SECTION_CONFIG.text, ...(r.text ?? {}) },
    style: {
      ...DEFAULT_SECTION_CONFIG.style,
      ...(r.style ?? {}),
      advanced: { ...DEFAULT_SECTION_CONFIG.style.advanced, ...((r.style?.advanced) ?? {}) },
    },
  };
}

export const BLOCK_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  events_preview: "Events Preview",
  members: "Senior Members",
  footer: "Footer",
  // global
  nav: "Top Navigation",
  footer_links: "Footer Links",
  // per-page hero (one per secondary page)
  page_hero: "Page Header",
};

// =============================================================
// Services items — deep card editing for ServicesSection
// =============================================================

export const SERVICE_ICONS = [
  "BookOpen", "Mic2", "GraduationCap", "Palette", "Globe", "Heart",
  "Music", "Camera", "Pen", "Library", "Theater", "Award", "Users", "Star",
] as const;
export type ServiceIcon = typeof SERVICE_ICONS[number];

export interface ServicesItem {
  id: string;            // stable client id
  icon: ServiceIcon;
  title_bn: string; title_en: string;
  desc_bn: string;  desc_en: string;
  visible: boolean;
}

export interface ServicesSectionConfig extends SectionConfig {
  items?: ServicesItem[]; // when present, overrides defaults
}

export const DEFAULT_SERVICES_ITEMS: ServicesItem[] = [
  { id: "lit",       icon: "BookOpen",       title_bn: "সাহিত্যকর্ম প্রকাশ",     title_en: "Literary Publications",     desc_bn: "নিয়মিত সাহিত্য পত্রিকা ও গ্রন্থ প্রকাশ",   desc_en: "Regular publication of literary works.", visible: true },
  { id: "cult",      icon: "Mic2",           title_bn: "সাংস্কৃতিক অনুষ্ঠান",     title_en: "Cultural Events",           desc_bn: "নাটক, সংগীত ও কবিতা পাঠের আসর",            desc_en: "Drama, music and poetry recitals.",      visible: true },
  { id: "edu",       icon: "GraduationCap",  title_bn: "শিক্ষামূলক কর্মসূচি",    title_en: "Educational Programs",      desc_bn: "কর্মশালা ও প্রশিক্ষণ কোর্স",                desc_en: "Workshops and training courses.",        visible: true },
  { id: "arts",      icon: "Palette",        title_bn: "শিল্প ও কারুকাজ",        title_en: "Arts & Crafts",             desc_bn: "ঐতিহ্যবাহী শিল্পকলার চর্চা ও প্রদর্শনী",     desc_en: "Traditional arts practice & exhibitions.", visible: true },
  { id: "comm",      icon: "Globe",          title_bn: "সামাজিক উন্নয়ন",        title_en: "Community Development",     desc_bn: "সমাজ কল্যাণমূলক বিভিন্ন কার্যক্রম",         desc_en: "Various community welfare activities.",  visible: true },
  { id: "heritage",  icon: "Heart",          title_bn: "ঐতিহ্য সংরক্ষণ",        title_en: "Heritage Preservation",     desc_bn: "বাংলা ঐতিহ্য ও সংস্কৃতির সংরক্ষণ",           desc_en: "Preserving Bengali heritage & culture.", visible: true },
];

export function mergeServicesConfig(raw: any): ServicesSectionConfig {
  const base = mergeSectionConfig(raw);
  const r = (raw && typeof raw === "object") ? raw : {};
  const items: ServicesItem[] | undefined = Array.isArray(r.items)
    ? r.items.map((it: any, i: number) => ({
        id: typeof it?.id === "string" ? it.id : `it_${i}`,
        icon: SERVICE_ICONS.includes(it?.icon) ? it.icon : "BookOpen",
        title_bn: it?.title_bn ?? "", title_en: it?.title_en ?? "",
        desc_bn:  it?.desc_bn  ?? "", desc_en:  it?.desc_en  ?? "",
        visible: it?.visible !== false,
      }))
    : undefined;
  return { ...base, items };
}

// =============================================================
// Global blocks: Nav + Footer Links
// =============================================================

export interface NavItem {
  id: string;
  label_bn: string; label_en: string;
  to: string;
  visible: boolean;
}

export interface NavConfig {
  items?: NavItem[]; // when present, overrides defaults
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home",    label_bn: "হোম",       label_en: "Home",    to: "/home",    visible: true },
  { id: "blog",    label_bn: "ব্লগ",      label_en: "Blog",    to: "/blog",    visible: true },
  { id: "events",  label_bn: "অনুষ্ঠান",  label_en: "Events",  to: "/events",  visible: true },
  { id: "courses", label_bn: "কোর্স",     label_en: "Courses", to: "/courses", visible: true },
  { id: "members", label_bn: "সদস্য",    label_en: "Members", to: "/members", visible: true },
  { id: "about",   label_bn: "পরিচিতি",  label_en: "About",   to: "/about",   visible: true },
];

export function mergeNavConfig(raw: any): NavConfig {
  const r = (raw && typeof raw === "object") ? raw : {};
  const items: NavItem[] | undefined = Array.isArray(r.items)
    ? r.items.map((it: any, i: number) => ({
        id: typeof it?.id === "string" ? it.id : `n_${i}`,
        label_bn: it?.label_bn ?? "", label_en: it?.label_en ?? "",
        to: it?.to ?? "/",
        visible: it?.visible !== false,
      }))
    : undefined;
  return { items };
}

export interface FooterLink { id: string; label_bn: string; label_en: string; to: string; visible: boolean; }
export interface FooterColumn {
  id: string;
  title_bn: string; title_en: string;
  links: FooterLink[];
  visible: boolean;
}
export interface SocialLink { id: string; platform: "facebook" | "youtube" | "instagram" | "twitter" | "mail"; href: string; visible: boolean; }

export interface FooterLinksConfig {
  columns?: FooterColumn[];
  socials?: SocialLink[];
}

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "quick", visible: true,
    title_bn: "দ্রুত লিঙ্ক", title_en: "Quick Links",
    links: [
      { id: "l1", label_bn: "হোম",      label_en: "Home",    to: "/home",    visible: true },
      { id: "l2", label_bn: "ব্লগ",     label_en: "Blog",    to: "/blog",    visible: true },
      { id: "l3", label_bn: "অনুষ্ঠান", label_en: "Events",  to: "/events",  visible: true },
      { id: "l4", label_bn: "কোর্স",    label_en: "Courses", to: "/courses", visible: true },
      { id: "l5", label_bn: "সদস্য",   label_en: "Members", to: "/members", visible: true },
    ],
  },
];

export const DEFAULT_SOCIALS: SocialLink[] = [
  { id: "fb", platform: "facebook", href: "#", visible: true },
  { id: "yt", platform: "youtube",  href: "#", visible: true },
  { id: "ml", platform: "mail",     href: "mailto:info@fsp.org.bd", visible: true },
];

export function mergeFooterLinksConfig(raw: any): FooterLinksConfig {
  const r = (raw && typeof raw === "object") ? raw : {};
  const columns: FooterColumn[] | undefined = Array.isArray(r.columns)
    ? r.columns.map((c: any, i: number) => ({
        id: typeof c?.id === "string" ? c.id : `c_${i}`,
        title_bn: c?.title_bn ?? "", title_en: c?.title_en ?? "",
        visible: c?.visible !== false,
        links: Array.isArray(c?.links) ? c.links.map((l: any, j: number) => ({
          id: typeof l?.id === "string" ? l.id : `l_${i}_${j}`,
          label_bn: l?.label_bn ?? "", label_en: l?.label_en ?? "",
          to: l?.to ?? "/", visible: l?.visible !== false,
        })) : [],
      }))
    : undefined;
  const socials: SocialLink[] | undefined = Array.isArray(r.socials)
    ? r.socials.map((s: any, i: number) => ({
        id: typeof s?.id === "string" ? s.id : `s_${i}`,
        platform: ["facebook","youtube","instagram","twitter","mail"].includes(s?.platform) ? s.platform : "mail",
        href: s?.href ?? "#",
        visible: s?.visible !== false,
      }))
    : undefined;
  return { columns, socials };
}

// short helper — random id (for new items in the editor)
export const newId = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
