// Heritage & Occasion Palettes — Single source of truth for the 3-Layer Color Engine.
// Layer 1 (60% Foundation): Background canvas & deep atmospheric ambient gradients.
// Layer 2 (30% Structure):  Cards, elevated surfaces, borders, containers & muted panels.
// Layer 3 (10% Focus):      Primary brand focal CTAs, active highlights, rings & glowing accents.

export type PaletteId =
  // --- 10 Classic Heritage Palettes ---
  | "royal"
  | "crimson"
  | "midnight"
  | "forest"
  | "ocean"
  | "emerald"
  | "saffron"
  | "marigold"
  | "magenta"
  | "rose"
  // --- 11 Bangladesh Occasion & Festival Palettes ---
  | "ekushey"
  | "shadhinota"
  | "boishakhi"
  | "bijoy"
  | "basanto"
  | "jasimuddin"
  | "rabindra"
  | "nazrul"
  | "eid"
  | "puja"
  | "boimela";

export type PaletteCategory = "heritage" | "occasion";

export interface Palette {
  id: PaletteId;
  label: string;
  labelBn: string;
  description: string;
  descriptionBn: string;
  category: PaletteCategory;
  occasionBadge?: string;

  // --- Layer 3: Focal Accents (10%) ---
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;

  // --- Layer 1: Base Canvas Tokens (60%) ---
  bgLight: string;
  fgLight: string;
  bgDark: string;
  fgDark: string;

  // --- Layer 2: Structural Surfaces & Borders (30%) ---
  cardLight: string;
  cardFgLight: string;
  cardDark: string;
  cardFgDark: string;
  secondaryLight: string;
  secondaryDark: string;
  mutedLight: string;
  mutedFgLight: string;
  mutedDark: string;
  mutedFgDark: string;
  borderLight: string;
  borderDark: string;

  // --- Depth Ambient Gradients ---
  layerBack: string;
  layerMid: string;
  layerFront: string;
  gradientHero: string;
  gradientGold: string;
  gradientWarm: string;

  // CSS filter to recolor the source logo if needed.
  logoFilter: string;
}

// Logo tint generator
const tint = (hueRotateDeg: number, saturate = 4500, brightness = 95) =>
  `brightness(0) saturate(100%) invert(18%) sepia(78%) saturate(${saturate}%) hue-rotate(${hueRotateDeg}deg) brightness(${brightness}%) contrast(105%) drop-shadow(0 1px 2px hsl(0 0% 0% / 0.18))`;

export const PALETTES: Record<PaletteId, Palette> = {
  /* ══════════════════════════════════════════════════════════════════════
     CLASSIC HERITAGE PALETTES (10 OFFICIAL THEMES)
  ══════════════════════════════════════════════════════════════════════ */

  // 1. Royal Heritage (Flagship Default)
  royal: {
    id: "royal",
    label: "Royal Heritage (Default)",
    labelBn: "রয়েল হেরিটেজ (অফিসিয়াল)",
    description: "Official deep indigo blue with celestial azure & glowing gold",
    descriptionBn: "ফরিদপুর সাহিত্য পরিষদের প্রাতিষ্ঠানিক নীল ও সোনালী আভা",
    category: "heritage",
    primary: "228 75% 50%",
    primaryDark: "228 82% 38%",
    primaryLight: "225 90% 68%",
    primaryForeground: "0 0% 100%",
    accent: "192 95% 50%",
    accentForeground: "228 40% 6%",
    ring: "228 75% 50%",
    bgLight: "225 35% 98%",
    fgLight: "228 45% 10%",
    bgDark: "228 40% 6.5%",
    fgDark: "220 25% 96%",
    cardLight: "225 30% 95%",
    cardFgLight: "228 45% 12%",
    cardDark: "228 32% 10.5%",
    cardFgDark: "220 20% 94%",
    secondaryLight: "225 35% 92%",
    secondaryDark: "228 28% 15%",
    mutedLight: "225 20% 91%",
    mutedFgLight: "225 18% 44%",
    mutedDark: "228 24% 14%",
    mutedFgDark: "225 18% 65%",
    borderLight: "225 25% 88%",
    borderDark: "228 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(228 82% 38% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(228 75% 50% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(228 75% 50% / 0.12) 0%, transparent 40%, hsl(192 95% 50% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(225 90% 68% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(42 95% 54% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(228 75% 50%), hsl(228 82% 38%), hsl(228 40% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(228 75% 50%), hsl(192 95% 50%))",
    gradientWarm: "linear-gradient(180deg, hsl(228 40% 6.5%), hsl(228 32% 10.5%))",
    logoFilter: "none",
  },

  // 2. Crimson Heritage
  crimson: {
    id: "crimson",
    label: "Crimson Heritage",
    labelBn: "ক্রিমসন হেরিটেজ",
    description: "Deep Bengali crimson with antique gilded gold & imperial velvet",
    descriptionBn: "ঐতিহাসিক রক্তিম লাল ও রাজকীয় সোনালী বৈভব",
    category: "heritage",
    primary: "350 72% 44%",
    primaryDark: "350 78% 30%",
    primaryLight: "350 65% 60%",
    primaryForeground: "0 0% 100%",
    accent: "42 90% 52%",
    accentForeground: "350 32% 6%",
    ring: "350 72% 44%",
    bgLight: "350 20% 98%",
    fgLight: "350 35% 10%",
    bgDark: "350 32% 6%",
    fgDark: "35 20% 96%",
    cardLight: "350 22% 95%",
    cardFgLight: "350 35% 12%",
    cardDark: "350 25% 10.5%",
    cardFgDark: "35 15% 94%",
    secondaryLight: "350 25% 92%",
    secondaryDark: "350 22% 15%",
    mutedLight: "350 15% 91%",
    mutedFgLight: "350 15% 44%",
    mutedDark: "350 18% 14%",
    mutedFgDark: "350 15% 64%",
    borderLight: "350 20% 88%",
    borderDark: "350 20% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(350 78% 30% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(350 72% 44% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(350 72% 44% / 0.12) 0%, transparent 40%, hsl(42 90% 52% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(350 65% 60% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(42 90% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(350 72% 44%), hsl(350 78% 30%), hsl(350 32% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(42 90% 52%), hsl(45 85% 62%))",
    gradientWarm: "linear-gradient(180deg, hsl(350 32% 6%), hsl(350 25% 10.5%))",
    logoFilter: tint(338, 4200, 92),
  },

  // 3. Midnight Aurora
  midnight: {
    id: "midnight",
    label: "Midnight Aurora",
    labelBn: "মিডনাইট অরোরা",
    description: "Deep cosmic navy with electric violet & vibrant cyan shimmer",
    descriptionBn: "নৈশ আকাশের গাঢ় নীল ও ইলেকট্রিক বেগুনি আলোকচ্ছটা",
    category: "heritage",
    primary: "250 75% 54%",
    primaryDark: "250 80% 38%",
    primaryLight: "255 85% 68%",
    primaryForeground: "0 0% 100%",
    accent: "185 95% 50%",
    accentForeground: "250 42% 5.5%",
    ring: "250 75% 54%",
    bgLight: "245 30% 98%",
    fgLight: "250 45% 10%",
    bgDark: "250 42% 5.5%",
    fgDark: "240 25% 96%",
    cardLight: "245 28% 95%",
    cardFgLight: "250 45% 12%",
    cardDark: "250 32% 9.5%",
    cardFgDark: "240 20% 94%",
    secondaryLight: "245 30% 92%",
    secondaryDark: "250 28% 14%",
    mutedLight: "245 18% 91%",
    mutedFgLight: "245 15% 44%",
    mutedDark: "250 22% 13%",
    mutedFgDark: "245 18% 64%",
    borderLight: "245 22% 88%",
    borderDark: "250 25% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(250 80% 38% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(250 75% 54% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(250 75% 54% / 0.12) 0%, transparent 40%, hsl(185 95% 50% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(255 85% 68% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(185 95% 50% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(250 75% 54%), hsl(250 80% 38%), hsl(250 42% 5.5%))",
    gradientGold: "linear-gradient(135deg, hsl(250 75% 54%), hsl(185 95% 50%))",
    gradientWarm: "linear-gradient(180deg, hsl(250 42% 5.5%), hsl(250 32% 9.5%))",
    logoFilter: tint(220, 4800, 88),
  },

  // 4. Heritage Forest
  forest: {
    id: "forest",
    label: "Heritage Forest",
    labelBn: "সবুজ অরণ্য (ফরেস্ট)",
    description: "Deep emerald jade & antique gold ornamentation",
    descriptionBn: "চিরসবুজ বাংলার শ্যামল বনানী ও স্বর্ণাভ অলংকরণ",
    category: "heritage",
    primary: "152 65% 32%",
    primaryDark: "152 72% 20%",
    primaryLight: "152 50% 50%",
    primaryForeground: "0 0% 100%",
    accent: "42 90% 54%",
    accentForeground: "152 35% 6%",
    ring: "152 65% 32%",
    bgLight: "150 25% 98%",
    fgLight: "152 40% 10%",
    bgDark: "152 38% 5.5%",
    fgDark: "140 20% 96%",
    cardLight: "150 25% 95%",
    cardFgLight: "152 40% 12%",
    cardDark: "152 28% 9.5%",
    cardFgDark: "140 18% 94%",
    secondaryLight: "150 28% 92%",
    secondaryDark: "152 22% 14%",
    mutedLight: "150 18% 91%",
    mutedFgLight: "150 15% 44%",
    mutedDark: "152 18% 13%",
    mutedFgDark: "150 15% 64%",
    borderLight: "150 20% 88%",
    borderDark: "152 20% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(152 72% 20% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(152 65% 32% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(152 65% 32% / 0.12) 0%, transparent 40%, hsl(42 90% 54% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(152 50% 50% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(42 90% 54% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(152 65% 32%), hsl(152 72% 20%), hsl(152 38% 5.5%))",
    gradientGold: "linear-gradient(135deg, hsl(152 65% 32%), hsl(42 90% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(152 38% 5.5%), hsl(152 28% 9.5%))",
    logoFilter: tint(110, 4200, 92),
  },

  // 5. Ocean Tide
  ocean: {
    id: "ocean",
    label: "Ocean Tide",
    labelBn: "সমুদ্র তরঙ্গ (ওশান)",
    description: "Deep Pacific sapphire with coastal teal & sunlit coral",
    descriptionBn: "গভীর সমুদ্রের নীল, উপকূলীয় টিল ও প্রবাল রঙের ছোঁয়া",
    category: "heritage",
    primary: "198 85% 42%",
    primaryDark: "198 90% 28%",
    primaryLight: "198 75% 62%",
    primaryForeground: "0 0% 100%",
    accent: "24 95% 58%",
    accentForeground: "198 40% 6%",
    ring: "198 85% 42%",
    bgLight: "198 30% 98%",
    fgLight: "198 45% 10%",
    bgDark: "198 42% 6%",
    fgDark: "190 25% 96%",
    cardLight: "198 28% 95%",
    cardFgLight: "198 45% 12%",
    cardDark: "198 32% 10%",
    cardFgDark: "190 20% 94%",
    secondaryLight: "198 30% 92%",
    secondaryDark: "198 25% 14.5%",
    mutedLight: "198 18% 91%",
    mutedFgLight: "198 15% 44%",
    mutedDark: "198 20% 13.5%",
    mutedFgDark: "198 15% 64%",
    borderLight: "198 22% 88%",
    borderDark: "198 22% 17.5%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(198 90% 28% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(198 85% 42% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(198 85% 42% / 0.12) 0%, transparent 40%, hsl(24 95% 58% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(198 75% 62% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(24 95% 58% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(198 85% 42%), hsl(198 90% 28%), hsl(198 42% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(198 85% 42%), hsl(24 95% 58%))",
    gradientWarm: "linear-gradient(180deg, hsl(198 42% 6%), hsl(198 32% 10%))",
    logoFilter: tint(175, 4500, 95),
  },

  // 6. Emerald Dynasty
  emerald: {
    id: "emerald",
    label: "Emerald Dynasty",
    labelBn: "এমেরাল্ড ডাইনেস্টি",
    description: "Imperial jade with gilded aureolin & obsidian depth",
    descriptionBn: "পান্না সবুজ ও ঔজ্জ্বল্যময় সোনালী ক্যালিগ্রাফিক প্রভাব",
    category: "heritage",
    primary: "160 84% 39%",
    primaryDark: "160 90% 25%",
    primaryLight: "160 65% 58%",
    primaryForeground: "0 0% 100%",
    accent: "45 95% 52%",
    accentForeground: "160 40% 5.5%",
    ring: "160 84% 39%",
    bgLight: "160 25% 98%",
    fgLight: "160 40% 10%",
    bgDark: "160 38% 5.5%",
    fgDark: "150 20% 96%",
    cardLight: "160 25% 95%",
    cardFgLight: "160 40% 12%",
    cardDark: "160 28% 9.5%",
    cardFgDark: "150 18% 94%",
    secondaryLight: "160 28% 92%",
    secondaryDark: "160 22% 14%",
    mutedLight: "160 18% 91%",
    mutedFgLight: "160 15% 44%",
    mutedDark: "160 18% 13%",
    mutedFgDark: "160 15% 64%",
    borderLight: "160 20% 88%",
    borderDark: "160 20% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(160 90% 25% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(160 84% 39% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(160 84% 39% / 0.12) 0%, transparent 40%, hsl(45 95% 52% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(160 65% 58% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 95% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(160 84% 39%), hsl(160 90% 25%), hsl(160 38% 5.5%))",
    gradientGold: "linear-gradient(135deg, hsl(160 84% 39%), hsl(45 95% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(160 38% 5.5%), hsl(160 28% 9.5%))",
    logoFilter: tint(135, 4600, 94),
  },

  // 7. Saffron Glow
  saffron: {
    id: "saffron",
    label: "Saffron Glow",
    labelBn: "জাফরান দীপ্তি (স্যাফরন)",
    description: "Warm imperial saffron with terracotta & deep amber warmth",
    descriptionBn: "উষ্ণ জাফরানি রেশম, পোড়ামাটির আভা ও রক্তিম সোনা",
    category: "heritage",
    primary: "32 95% 48%",
    primaryDark: "28 95% 36%",
    primaryLight: "35 90% 64%",
    primaryForeground: "0 0% 100%",
    accent: "12 90% 54%",
    accentForeground: "32 40% 6%",
    ring: "32 95% 48%",
    bgLight: "35 30% 98%",
    fgLight: "32 45% 10%",
    bgDark: "32 40% 6.5%",
    fgDark: "35 25% 96%",
    cardLight: "35 28% 95%",
    cardFgLight: "32 45% 12%",
    cardDark: "32 30% 10.5%",
    cardFgDark: "35 20% 94%",
    secondaryLight: "35 30% 92%",
    secondaryDark: "32 25% 15%",
    mutedLight: "35 18% 91%",
    mutedFgLight: "35 15% 44%",
    mutedDark: "32 20% 14%",
    mutedFgDark: "35 15% 64%",
    borderLight: "35 22% 88%",
    borderDark: "32 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(28 95% 36% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(32 95% 48% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(32 95% 48% / 0.12) 0%, transparent 40%, hsl(12 90% 54% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(35 90% 64% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(12 90% 54% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(32 95% 48%), hsl(28 95% 36%), hsl(32 40% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(32 95% 48%), hsl(12 90% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(32 40% 6.5%), hsl(32 30% 10.5%))",
    logoFilter: tint(15, 4800, 96),
  },

  // 8. Marigold Sunset
  marigold: {
    id: "marigold",
    label: "Marigold Sunset",
    labelBn: "গাঁদা সূর্যাস্ত (মেরিগোল্ড)",
    description: "Rich sunset ochre, warm copper & radiant amber",
    descriptionBn: "গাঁদা ফুলের উজ্জ্বল হলুদ ও সূর্যাস্তের তামাটে আভা",
    category: "heritage",
    primary: "38 92% 48%",
    primaryDark: "32 92% 35%",
    primaryLight: "42 90% 65%",
    primaryForeground: "0 0% 100%",
    accent: "16 92% 52%",
    accentForeground: "38 35% 6%",
    ring: "38 92% 48%",
    bgLight: "40 30% 98%",
    fgLight: "38 45% 10%",
    bgDark: "38 38% 6.5%",
    fgDark: "40 25% 96%",
    cardLight: "40 28% 95%",
    cardFgLight: "38 45% 12%",
    cardDark: "38 30% 10.5%",
    cardFgDark: "40 20% 94%",
    secondaryLight: "40 30% 92%",
    secondaryDark: "38 24% 15%",
    mutedLight: "40 18% 91%",
    mutedFgLight: "40 15% 44%",
    mutedDark: "38 20% 14%",
    mutedFgDark: "40 15% 64%",
    borderLight: "40 22% 88%",
    borderDark: "38 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(32 92% 35% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(38 92% 48% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(38 92% 48% / 0.12) 0%, transparent 40%, hsl(16 92% 52% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(42 90% 65% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(16 92% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(38 92% 48%), hsl(32 92% 35%), hsl(38 38% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(38 92% 48%), hsl(16 92% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(38 38% 6.5%), hsl(38 30% 10.5%))",
    logoFilter: tint(25, 4700, 96),
  },

  // 9. Royal Magenta
  magenta: {
    id: "magenta",
    label: "Royal Magenta",
    labelBn: "রয়েল ম্যাজেন্টা",
    description: "Vibrant royal magenta with gilded gold & plum obsidian",
    descriptionBn: "উজ্জ্বল রাজকীয় ম্যাজেন্টা ও স্বর্ণাভ কারুকাজ",
    category: "heritage",
    primary: "322 75% 48%",
    primaryDark: "322 80% 32%",
    primaryLight: "322 65% 64%",
    primaryForeground: "0 0% 100%",
    accent: "42 90% 54%",
    accentForeground: "322 35% 6%",
    ring: "322 75% 48%",
    bgLight: "320 25% 98%",
    fgLight: "322 40% 10%",
    bgDark: "322 35% 6%",
    fgDark: "310 20% 96%",
    cardLight: "320 25% 95%",
    cardFgLight: "322 40% 12%",
    cardDark: "322 26% 10%",
    cardFgDark: "310 18% 94%",
    secondaryLight: "320 28% 92%",
    secondaryDark: "322 22% 14.5%",
    mutedLight: "320 18% 91%",
    mutedFgLight: "320 15% 44%",
    mutedDark: "322 18% 13.5%",
    mutedFgDark: "320 15% 64%",
    borderLight: "320 20% 88%",
    borderDark: "322 20% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(322 80% 32% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(322 75% 48% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(322 75% 48% / 0.12) 0%, transparent 40%, hsl(42 90% 54% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(322 65% 64% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(42 90% 54% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(322 75% 48%), hsl(322 80% 32%), hsl(322 35% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(322 75% 48%), hsl(42 90% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(322 35% 6%), hsl(322 26% 10%))",
    logoFilter: tint(295, 5000, 95),
  },

  // 10. Rose Quartz
  rose: {
    id: "rose",
    label: "Rose Quartz",
    labelBn: "রোজ কোয়ার্টজ",
    description: "Velveteen antique rose with champagne gold radiance",
    descriptionBn: "স্নিগ্ধ গোলাপী রেশম ও শ্যাম্পেন গোল্ডের মোহময় আবহ",
    category: "heritage",
    primary: "340 72% 54%",
    primaryDark: "340 78% 38%",
    primaryLight: "340 65% 70%",
    primaryForeground: "0 0% 100%",
    accent: "38 90% 58%",
    accentForeground: "340 30% 6.2%",
    ring: "340 72% 54%",
    bgLight: "340 25% 98%",
    fgLight: "340 35% 10%",
    bgDark: "340 30% 6.2%",
    fgDark: "330 20% 96%",
    cardLight: "340 25% 95%",
    cardFgLight: "340 35% 12%",
    cardDark: "340 24% 10.2%",
    cardFgDark: "330 18% 94%",
    secondaryLight: "340 28% 92%",
    secondaryDark: "340 20% 14.5%",
    mutedLight: "340 18% 91%",
    mutedFgLight: "340 15% 44%",
    mutedDark: "340 16% 13.5%",
    mutedFgDark: "340 15% 64%",
    borderLight: "340 20% 88%",
    borderDark: "340 18% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(340 78% 38% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(340 72% 54% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(340 72% 54% / 0.12) 0%, transparent 40%, hsl(38 90% 58% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(340 65% 70% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(38 90% 58% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(340 72% 54%), hsl(340 78% 38%), hsl(340 30% 6.2%))",
    gradientGold: "linear-gradient(135deg, hsl(340 72% 54%), hsl(38 90% 58%))",
    gradientWarm: "linear-gradient(180deg, hsl(340 30% 6.2%), hsl(340 24% 10.2%))",
    logoFilter: tint(320, 4600, 98),
  },

  /* ══════════════════════════════════════════════════════════════════════
     BANGLADESH OCCASIONS & FESTIVAL PALETTES (11 DEDICATED THEMES)
  ══════════════════════════════════════════════════════════════════════ */

  // 11. Ekushey Provat (অমর একুশে ফেব্রুয়ারি — শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস)
  ekushey: {
    id: "ekushey",
    label: "Ekushey Provat",
    labelBn: "একুশে প্রভাত (মাতৃভাষা দিবস)",
    description: "Solemn charcoal slate, monochrome provatpheri & poignant blood-red rose",
    descriptionBn: "অমর একুশের শোক ও গৌরবের প্রতীক — কৃষ্ণবর্ণ স্লেট ও রক্তিম গোলাপ",
    category: "occasion",
    occasionBadge: "২১শে ফেব্রুয়ারি • শহীদ দিবস",
    primary: "352 85% 48%",
    primaryDark: "352 90% 32%",
    primaryLight: "352 80% 64%",
    primaryForeground: "0 0% 100%",
    accent: "0 0% 96%",
    accentForeground: "0 0% 8%",
    ring: "352 85% 48%",
    bgLight: "0 0% 98%",
    fgLight: "0 0% 12%",
    bgDark: "0 0% 7%",
    fgDark: "0 0% 96%",
    cardLight: "0 0% 94%",
    cardFgLight: "0 0% 12%",
    cardDark: "0 0% 11%",
    cardFgDark: "0 0% 94%",
    secondaryLight: "0 0% 90%",
    secondaryDark: "0 0% 16%",
    mutedLight: "0 0% 88%",
    mutedFgLight: "0 0% 45%",
    mutedDark: "0 0% 15%",
    mutedFgDark: "0 0% 65%",
    borderLight: "0 0% 84%",
    borderDark: "0 0% 20%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(352 90% 32% / 0.22) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(0 0% 20% / 0.35) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(352 85% 48% / 0.10) 0%, transparent 40%, hsl(0 0% 100% / 0.05) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(352 80% 64% / 0.20) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(0 0% 90% / 0.12) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(352 85% 48%), hsl(0 0% 18%), hsl(0 0% 7%))",
    gradientGold: "linear-gradient(135deg, hsl(352 85% 48%), hsl(0 0% 85%))",
    gradientWarm: "linear-gradient(180deg, hsl(0 0% 7%), hsl(0 0% 12%))",
    logoFilter: tint(340, 5000, 95),
  },

  // 12. Shadhinota Utsob (মহান স্বাধীনতা ও জাতীয় দিবস — ২৬শে মার্চ)
  shadhinota: {
    id: "shadhinota",
    label: "Shadhinota Utsob",
    labelBn: "স্বাধীনতা উৎসব (২৬শে মার্চ)",
    description: "Vibrant Bangladesh flag bottle green with blazing solar crimson sun",
    descriptionBn: "জাতীয় পতাকার গাঢ় সবুজ ও উদীয়মান রক্তিম সূর্য",
    category: "occasion",
    occasionBadge: "২৬শে মার্চ • মহান স্বাধীনতা দিবস",
    primary: "145 80% 30%",
    primaryDark: "145 88% 20%",
    primaryLight: "145 65% 48%",
    primaryForeground: "0 0% 100%",
    accent: "354 88% 52%",
    accentForeground: "0 0% 100%",
    ring: "145 80% 30%",
    bgLight: "145 25% 98%",
    fgLight: "145 45% 10%",
    bgDark: "145 40% 5.5%",
    fgDark: "140 25% 96%",
    cardLight: "145 28% 95%",
    cardFgLight: "145 45% 12%",
    cardDark: "145 30% 9.5%",
    cardFgDark: "140 20% 94%",
    secondaryLight: "145 30% 92%",
    secondaryDark: "145 25% 14%",
    mutedLight: "145 18% 91%",
    mutedFgLight: "145 15% 44%",
    mutedDark: "145 20% 13%",
    mutedFgDark: "145 15% 64%",
    borderLight: "145 22% 88%",
    borderDark: "145 22% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(145 88% 20% / 0.30) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(354 88% 52% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(145 80% 30% / 0.15) 0%, transparent 40%, hsl(354 88% 52% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(354 88% 52% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 95% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(145 80% 30%), hsl(145 88% 20%), hsl(145 40% 5.5%))",
    gradientGold: "linear-gradient(135deg, hsl(145 80% 30%), hsl(354 88% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(145 40% 5.5%), hsl(145 30% 9.5%))",
    logoFilter: tint(115, 4500, 95),
  },

  // 13. Boishakhi Ranga (পহেলা বৈশাখ — বাংলা নববর্ষ)
  boishakhi: {
    id: "boishakhi",
    label: "Boishakhi Ranga",
    labelBn: "বৈশাখী রঙ (পহেলা বৈশাখ)",
    description: "Alpona ivory white, festive vermilion red, sunny terracotta & gold",
    descriptionBn: "ঐতিহ্যবাহী লাল-সাদা আলপনা, উৎসবের সিঁদুর ও বৈশাখী মেলা",
    category: "occasion",
    occasionBadge: "১৪ই এপ্রিল • শুভ নববর্ষ",
    primary: "355 85% 46%",
    primaryDark: "355 90% 32%",
    primaryLight: "355 75% 62%",
    primaryForeground: "0 0% 100%",
    accent: "45 98% 52%",
    accentForeground: "355 35% 6%",
    ring: "355 85% 46%",
    bgLight: "38 40% 98%",
    fgLight: "355 45% 10%",
    bgDark: "355 35% 6%",
    fgDark: "40 25% 96%",
    cardLight: "38 35% 95%",
    cardFgLight: "355 45% 12%",
    cardDark: "355 28% 10.5%",
    cardFgDark: "40 20% 94%",
    secondaryLight: "38 35% 92%",
    secondaryDark: "355 24% 15%",
    mutedLight: "38 20% 91%",
    mutedFgLight: "355 15% 44%",
    mutedDark: "355 20% 14%",
    mutedFgDark: "38 15% 64%",
    borderLight: "38 25% 88%",
    borderDark: "355 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(355 90% 32% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(45 98% 52% / 0.25) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(355 85% 46% / 0.15) 0%, transparent 40%, hsl(45 98% 52% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(355 75% 62% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 98% 52% / 0.22) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(355 85% 46%), hsl(355 90% 32%), hsl(355 35% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(355 85% 46%), hsl(45 98% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(355 35% 6%), hsl(355 28% 10.5%))",
    logoFilter: tint(345, 4800, 95),
  },

  // 14. Bijoy Ullash (মহান বিজয় দিবস — ১৬ই ডিসেম্বর)
  bijoy: {
    id: "bijoy",
    label: "Bijoy Ullash",
    labelBn: "বিজয় উল্লাস (১৬ই ডিসেম্বর)",
    description: "Deep victory emerald, radiant victory red & triumphant golden radiance",
    descriptionBn: "মুক্তিযুদ্ধের বিজয়গাথা — বীরত্বপূর্ণ পান্না সবুজ ও বিজয় লাল",
    category: "occasion",
    occasionBadge: "১৬ই ডিসেম্বর • মহান বিজয় দিবস",
    primary: "148 85% 28%",
    primaryDark: "148 92% 18%",
    primaryLight: "148 70% 46%",
    primaryForeground: "0 0% 100%",
    accent: "45 95% 52%",
    accentForeground: "148 40% 6%",
    ring: "148 85% 28%",
    bgLight: "148 25% 98%",
    fgLight: "148 45% 10%",
    bgDark: "148 42% 5.2%",
    fgDark: "140 25% 96%",
    cardLight: "148 28% 95%",
    cardFgLight: "148 45% 12%",
    cardDark: "148 30% 9.2%",
    cardFgDark: "140 20% 94%",
    secondaryLight: "148 30% 92%",
    secondaryDark: "148 25% 14%",
    mutedLight: "148 18% 91%",
    mutedFgLight: "148 15% 44%",
    mutedDark: "148 20% 13%",
    mutedFgDark: "148 15% 64%",
    borderLight: "148 22% 88%",
    borderDark: "148 22% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(148 92% 18% / 0.32) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(352 85% 48% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(148 85% 28% / 0.15) 0%, transparent 40%, hsl(45 95% 52% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(352 85% 48% / 0.22) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 95% 52% / 0.22) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(148 85% 28%), hsl(148 92% 18%), hsl(148 42% 5.2%))",
    gradientGold: "linear-gradient(135deg, hsl(148 85% 28%), hsl(45 95% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(148 42% 5.2%), hsl(148 30% 9.2%))",
    logoFilter: tint(118, 4600, 95),
  },

  // 15. Basanto Boron (পহেলা ফাল্গুন — বসন্ত বরণ ও বসন্ত উৎসব)
  basanto: {
    id: "basanto",
    label: "Basanto Boron",
    labelBn: "বসন্ত বরণ (পহেলা ফাল্গুন)",
    description: "Basanti marigold yellow, mustard ochre & floral coral-orange",
    descriptionBn: "ঋতুরাজ বসন্তের বাসন্তী হলুদ, গাঁদা ফুল ও পলাশের রক্তিম আভা",
    category: "occasion",
    occasionBadge: "১৪ই ফেব্রুয়ারি • বসন্ত বরণ",
    primary: "42 98% 48%",
    primaryDark: "36 98% 36%",
    primaryLight: "46 95% 65%",
    primaryForeground: "0 0% 10%",
    accent: "14 92% 54%",
    accentForeground: "0 0% 100%",
    ring: "42 98% 48%",
    bgLight: "44 40% 98%",
    fgLight: "40 45% 10%",
    bgDark: "36 38% 6.5%",
    fgDark: "44 25% 96%",
    cardLight: "44 35% 95%",
    cardFgLight: "40 45% 12%",
    cardDark: "36 30% 10.5%",
    cardFgDark: "44 20% 94%",
    secondaryLight: "44 35% 92%",
    secondaryDark: "36 24% 15%",
    mutedLight: "44 20% 91%",
    mutedFgLight: "40 15% 44%",
    mutedDark: "36 20% 14%",
    mutedFgDark: "44 15% 64%",
    borderLight: "44 25% 88%",
    borderDark: "36 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(36 98% 36% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(14 92% 54% / 0.25) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(42 98% 48% / 0.15) 0%, transparent 40%, hsl(14 92% 54% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(46 95% 65% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(14 92% 54% / 0.20) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(42 98% 48%), hsl(36 98% 36%), hsl(36 38% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(42 98% 48%), hsl(14 92% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(36 38% 6.5%), hsl(36 30% 10.5%))",
    logoFilter: tint(35, 4800, 96),
  },

  // 16. Nakshi Kantha (পল্লীকবি জসীম উদ্‌দীন জন্মোৎসব — ফরিদপুরের গৌরব)
  jasimuddin: {
    id: "jasimuddin",
    label: "Nakshi Kantha",
    labelBn: "নকশী কাঁথা (জসীম উদ্‌দীন স্মরণ)",
    description: "Rustic Padma clay, lush rural paddy green & golden mustard harvest",
    descriptionBn: "পল্লীকবির স্মরণে পদ্মাপাড়ের মৃৎশিল্প, ধানসিঁড়ি ও ফসলী মাঠের রূপ",
    category: "occasion",
    occasionBadge: "১লা জানুয়ারি • পল্লীকবি স্মরণ",
    primary: "28 85% 42%",
    primaryDark: "24 88% 28%",
    primaryLight: "32 75% 60%",
    primaryForeground: "0 0% 100%",
    accent: "142 65% 42%",
    accentForeground: "28 40% 6%",
    ring: "28 85% 42%",
    bgLight: "32 30% 98%",
    fgLight: "28 45% 10%",
    bgDark: "28 35% 6.5%",
    fgDark: "32 25% 96%",
    cardLight: "32 28% 95%",
    cardFgLight: "28 45% 12%",
    cardDark: "28 26% 10.5%",
    cardFgDark: "32 20% 94%",
    secondaryLight: "32 30% 92%",
    secondaryDark: "28 22% 15%",
    mutedLight: "32 18% 91%",
    mutedFgLight: "28 15% 44%",
    mutedDark: "28 18% 14%",
    mutedFgDark: "32 15% 64%",
    borderLight: "32 22% 88%",
    borderDark: "28 20% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(24 88% 28% / 0.30) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(142 65% 42% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(28 85% 42% / 0.15) 0%, transparent 40%, hsl(142 65% 42% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(32 75% 60% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 90% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(28 85% 42%), hsl(24 88% 28%), hsl(28 35% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(28 85% 42%), hsl(142 65% 42%))",
    gradientWarm: "linear-gradient(180deg, hsl(28 35% 6.5%), hsl(28 26% 10.5%))",
    logoFilter: tint(15, 4600, 95),
  },

  // 17. Gitanjali Heritage (রবীন্দ্র জয়ন্তী — ২৫শে বৈশাখ / ৮ই মে)
  rabindra: {
    id: "rabindra",
    label: "Gitanjali Heritage",
    labelBn: "গীতাঞ্জলি হেরিটেজ (রবীন্দ্র জয়ন্তী)",
    description: "Shantiniketan vintage sepia, parchment ivory & classic indigo blue",
    descriptionBn: "শান্তিনিকেতনের মাটির স্পর্শ, পান্ডুলিপির ক্লাসিক সেপিয়া ও নীল",
    category: "occasion",
    occasionBadge: "২৫শে বৈশাখ • রবীন্দ্র জয়ন্তী",
    primary: "220 68% 44%",
    primaryDark: "220 75% 30%",
    primaryLight: "220 58% 62%",
    primaryForeground: "0 0% 100%",
    accent: "36 82% 52%",
    accentForeground: "220 35% 6%",
    ring: "220 68% 44%",
    bgLight: "38 25% 98%",
    fgLight: "220 40% 10%",
    bgDark: "220 35% 6.5%",
    fgDark: "38 20% 96%",
    cardLight: "38 25% 95%",
    cardFgLight: "220 40% 12%",
    cardDark: "220 26% 10.5%",
    cardFgDark: "38 18% 94%",
    secondaryLight: "38 28% 92%",
    secondaryDark: "220 22% 15%",
    mutedLight: "38 18% 91%",
    mutedFgLight: "220 15% 44%",
    mutedDark: "220 18% 14%",
    mutedFgDark: "38 15% 64%",
    borderLight: "38 20% 88%",
    borderDark: "220 20% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(220 75% 30% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(36 82% 52% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(220 68% 44% / 0.12) 0%, transparent 40%, hsl(36 82% 52% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(220 58% 62% / 0.22) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(36 82% 52% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(220 68% 44%), hsl(220 75% 30%), hsl(220 35% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(220 68% 44%), hsl(36 82% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(220 35% 6.5%), hsl(220 26% 10.5%))",
    logoFilter: tint(215, 4200, 92),
  },

  // 18. Bidrohi Dhumketu (জাতীয় কবি কাজী নজরুল ইসলাম জন্মজয়ন্তী — ১১ই জ্যৈষ্ঠ / ২৫শে মে)
  nazrul: {
    id: "nazrul",
    label: "Bidrohi Dhumketu",
    labelBn: "বিদ্রোহী ধূমকেতু (নজরুল জয়ন্তী)",
    description: "Fiery flame amber, rebellious volcanic crimson & midnight ash",
    descriptionBn: "বিদ্রোহী কবির বজ্রকণ্ঠ — অগ্নিবীণার শিখা ও আগ্নেয়গিরির রক্তিম আভা",
    category: "occasion",
    occasionBadge: "১১ই জ্যৈষ্ঠ • নজরুল জয়ন্তী",
    primary: "16 92% 48%",
    primaryDark: "10 92% 34%",
    primaryLight: "22 88% 64%",
    primaryForeground: "0 0% 100%",
    accent: "45 98% 54%",
    accentForeground: "16 40% 6%",
    ring: "16 92% 48%",
    bgLight: "20 30% 98%",
    fgLight: "16 45% 10%",
    bgDark: "16 38% 6%",
    fgDark: "25 25% 96%",
    cardLight: "20 28% 95%",
    cardFgLight: "16 45% 12%",
    cardDark: "16 30% 10%",
    cardFgDark: "25 20% 94%",
    secondaryLight: "20 30% 92%",
    secondaryDark: "16 24% 15%",
    mutedLight: "20 18% 91%",
    mutedFgLight: "16 15% 44%",
    mutedDark: "16 20% 14%",
    mutedFgDark: "20 15% 64%",
    borderLight: "20 22% 88%",
    borderDark: "16 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(10 92% 34% / 0.30) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(45 98% 54% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(16 92% 48% / 0.15) 0%, transparent 40%, hsl(45 98% 54% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(22 88% 64% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 98% 54% / 0.20) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(16 92% 48%), hsl(10 92% 34%), hsl(16 38% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(16 92% 48%), hsl(45 98% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(16 38% 6%), hsl(16 30% 10%))",
    logoFilter: tint(10, 4800, 95),
  },

  // 19. Eid Mubarak (পবিত্র ঈদুল ফিতর ও ঈদুল আজহা)
  eid: {
    id: "eid",
    label: "Eid Mubarak",
    labelBn: "পবিত্র ঈদ মোবারক",
    description: "Crescent celestial teal/emerald, moonlit ivory & shimmering gold",
    descriptionBn: "ঈদের বাঁকা চাঁদ — আসমানি টিল, স্নিগ্ধ পান্না ও শুভ্র চাঁদনী",
    category: "occasion",
    occasionBadge: "পবিত্র ঈদ মোবারক",
    primary: "172 82% 36%",
    primaryDark: "172 90% 22%",
    primaryLight: "172 65% 54%",
    primaryForeground: "0 0% 100%",
    accent: "45 95% 52%",
    accentForeground: "172 40% 5.5%",
    ring: "172 82% 36%",
    bgLight: "172 25% 98%",
    fgLight: "172 40% 10%",
    bgDark: "172 42% 5.5%",
    fgDark: "160 20% 96%",
    cardLight: "172 25% 95%",
    cardFgLight: "172 40% 12%",
    cardDark: "172 30% 9.5%",
    cardFgDark: "160 18% 94%",
    secondaryLight: "172 28% 92%",
    secondaryDark: "172 24% 14%",
    mutedLight: "172 18% 91%",
    mutedFgLight: "172 15% 44%",
    mutedDark: "172 20% 13%",
    mutedFgDark: "172 15% 64%",
    borderLight: "172 20% 88%",
    borderDark: "172 22% 17%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(172 90% 22% / 0.30) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(45 95% 52% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(172 82% 36% / 0.15) 0%, transparent 40%, hsl(45 95% 52% / 0.15) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(172 65% 54% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 95% 52% / 0.20) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(172 82% 36%), hsl(172 90% 22%), hsl(172 42% 5.5%))",
    gradientGold: "linear-gradient(135deg, hsl(172 82% 36%), hsl(45 95% 52%))",
    gradientWarm: "linear-gradient(180deg, hsl(172 42% 5.5%), hsl(172 30% 9.5%))",
    logoFilter: tint(150, 4600, 95),
  },

  // 20. Sharodiyo Utsob (শারদীয় দুর্গোৎসব)
  puja: {
    id: "puja",
    label: "Sharodiyo Utsob",
    labelBn: "শারদীয় উৎসব (দুর্গোৎসব)",
    description: "Autumn Kashful cloud white, kumkum red & radiant festive gold",
    descriptionBn: "নীল আকাশে সাদা মেঘের ভেলা, কাশফুল ও শারদীয় উৎসবের উল্লাস",
    category: "occasion",
    occasionBadge: "শারদীয় দুর্গোৎসব",
    primary: "352 82% 46%",
    primaryDark: "352 88% 30%",
    primaryLight: "352 70% 64%",
    primaryForeground: "0 0% 100%",
    accent: "45 95% 54%",
    accentForeground: "352 35% 6%",
    ring: "352 82% 46%",
    bgLight: "210 30% 98%",
    fgLight: "352 40% 10%",
    bgDark: "352 32% 6%",
    fgDark: "210 20% 96%",
    cardLight: "210 25% 95%",
    cardFgLight: "352 40% 12%",
    cardDark: "352 26% 10.2%",
    cardFgDark: "210 18% 94%",
    secondaryLight: "210 28% 92%",
    secondaryDark: "352 22% 14.5%",
    mutedLight: "210 18% 91%",
    mutedFgLight: "352 15% 44%",
    mutedDark: "352 18% 13.5%",
    mutedFgDark: "210 15% 64%",
    borderLight: "210 20% 88%",
    borderDark: "352 20% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(352 88% 30% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(45 95% 54% / 0.22) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(352 82% 46% / 0.12) 0%, transparent 40%, hsl(45 95% 54% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(352 70% 64% / 0.22) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(45 95% 54% / 0.20) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(352 82% 46%), hsl(352 88% 30%), hsl(352 32% 6%))",
    gradientGold: "linear-gradient(135deg, hsl(352 82% 46%), hsl(45 95% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(352 32% 6%), hsl(352 26% 10.2%))",
    logoFilter: tint(340, 4800, 95),
  },

  // 21. Boi Mela Sahitya (অমর একুশে বইমেলা মাস)
  boimela: {
    id: "boimela",
    label: "Boi Mela Sahitya",
    labelBn: "বইমেলা সাহিত্য (বইমেলা মাস)",
    description: "Classic literary binding leather, aged parchment & deep ink navy",
    descriptionBn: "ঐতিহাসিক বইয়ের চামড়া বাঁধাই, প্রাচীন পান্ডুলিপি ও কালির সুবাস",
    category: "occasion",
    occasionBadge: "অমর একুশে বইমেলা",
    primary: "216 75% 42%",
    primaryDark: "216 85% 28%",
    primaryLight: "216 65% 60%",
    primaryForeground: "0 0% 100%",
    accent: "38 90% 54%",
    accentForeground: "216 40% 6%",
    ring: "216 75% 42%",
    bgLight: "38 25% 98%",
    fgLight: "216 45% 10%",
    bgDark: "216 38% 6.5%",
    fgDark: "38 25% 96%",
    cardLight: "38 25% 95%",
    cardFgLight: "216 45% 12%",
    cardDark: "216 30% 10.5%",
    cardFgDark: "38 20% 94%",
    secondaryLight: "38 28% 92%",
    secondaryDark: "216 24% 15%",
    mutedLight: "38 18% 91%",
    mutedFgLight: "216 15% 44%",
    mutedDark: "216 20% 14%",
    mutedFgDark: "38 15% 64%",
    borderLight: "38 22% 88%",
    borderDark: "216 22% 18%",
    layerBack:
      "radial-gradient(85% 65% at 15% 10%, hsl(216 85% 28% / 0.28) 0%, transparent 60%), radial-gradient(75% 60% at 90% 90%, hsl(38 90% 54% / 0.20) 0%, transparent 65%)",
    layerMid:
      "linear-gradient(135deg, hsl(216 75% 42% / 0.12) 0%, transparent 40%, hsl(38 90% 54% / 0.12) 100%)",
    layerFront:
      "radial-gradient(35% 28% at 70% 20%, hsl(216 65% 60% / 0.25) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(38 90% 54% / 0.18) 0%, transparent 70%)",
    gradientHero:
      "linear-gradient(135deg, hsl(216 75% 42%), hsl(216 85% 28%), hsl(216 38% 6.5%))",
    gradientGold: "linear-gradient(135deg, hsl(216 75% 42%), hsl(38 90% 54%))",
    gradientWarm: "linear-gradient(180deg, hsl(216 38% 6.5%), hsl(216 30% 10.5%))",
    logoFilter: tint(210, 4400, 94),
  },
};

export const DEFAULT_PALETTE: PaletteId = "royal";

export const HERITAGE_PALETTES = Object.values(PALETTES).filter(
  (p) => p.category === "heritage"
);

export const OCCASION_PALETTES = Object.values(PALETTES).filter(
  (p) => p.category === "occasion"
);

export const applyPalette = (id: PaletteId) => {
  const p = PALETTES[id] ?? PALETTES[DEFAULT_PALETTE];
  const root = document.documentElement;

  // --- Layer 3: Focal Accents (10%) ---
  root.style.setProperty("--primary", p.primary);
  root.style.setProperty("--primary-foreground", p.primaryForeground);
  root.style.setProperty("--primary-dark", p.primaryDark);
  root.style.setProperty("--primary-light", p.primaryLight);
  root.style.setProperty("--ring", p.ring);
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--accent-foreground", p.accentForeground);

  // Backward compatibility alias variables
  root.style.setProperty("--crimson", p.primary);
  root.style.setProperty("--crimson-dark", p.primaryDark);
  root.style.setProperty("--crimson-light", p.primaryLight);
  root.style.setProperty("--gold", p.accent);
  root.style.setProperty("--gold-light", p.primaryLight);

  // --- Layer 1 & 2: Dynamic 3-Layer Theme Tokens ---
  root.style.setProperty("--theme-bg-light", p.bgLight);
  root.style.setProperty("--theme-fg-light", p.fgLight);
  root.style.setProperty("--theme-card-light", p.cardLight);
  root.style.setProperty("--theme-card-fg-light", p.cardFgLight);
  root.style.setProperty("--theme-secondary-light", p.secondaryLight);
  root.style.setProperty("--theme-muted-light", p.mutedLight);
  root.style.setProperty("--theme-muted-fg-light", p.mutedFgLight);
  root.style.setProperty("--theme-border-light", p.borderLight);

  root.style.setProperty("--theme-bg-dark", p.bgDark);
  root.style.setProperty("--theme-fg-dark", p.fgDark);
  root.style.setProperty("--theme-card-dark", p.cardDark);
  root.style.setProperty("--theme-card-fg-dark", p.cardFgDark);
  root.style.setProperty("--theme-secondary-dark", p.secondaryDark);
  root.style.setProperty("--theme-muted-dark", p.mutedDark);
  root.style.setProperty("--theme-muted-fg-dark", p.mutedFgDark);
  root.style.setProperty("--theme-border-dark", p.borderDark);

  // --- Depth Ambient Layers ---
  root.style.setProperty("--layer-back", p.layerBack);
  root.style.setProperty("--layer-mid", p.layerMid);
  root.style.setProperty("--layer-front", p.layerFront);

  // --- Gradients ---
  root.style.setProperty("--gradient-hero", p.gradientHero);
  root.style.setProperty("--gradient-gold", p.gradientGold);
  root.style.setProperty("--gradient-warm", p.gradientWarm);

  // --- Logo Tint Filter ---
  root.style.setProperty("--logo-filter", p.logoFilter);

  root.dataset.palette = id;
};
