// Heritage Palettes — single source of truth for theme colors applied sitewide.
// Each palette defines HSL stops for the design tokens, layered depth gradients
// (background → mid → foreground) and a CSS filter that recolors the
// (originally blue) logo PNG to match.

export type PaletteId =
  | "crimson"
  | "forest"
  | "royal"
  | "marigold"
  | "magenta"
  | "midnight"
  | "saffron"
  | "ocean"
  | "rose"
  | "emerald";

export interface Palette {
  id: PaletteId;
  label: string;
  description: string;
  // HSL strings ("H S% L%") — assigned to CSS vars at runtime.
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  ring: string;
  // Layered depth — three stacked gradients composed into --layer-bg.
  // Background (farthest) → Mid → Foreground (closest). Each gradient uses
  // alpha so they blend into the page background while creating depth.
  layerBack: string;
  layerMid: string;
  layerFront: string;
  // CSS filter to recolor the source logo to the palette's primary hue.
  logoFilter: string;
}

// drop-shadow keeps depth; brightness(0) flattens then we re-tint.
const tint = (hueRotateDeg: number, saturate = 4500, brightness = 95) =>
  `brightness(0) saturate(100%) invert(18%) sepia(78%) saturate(${saturate}%) hue-rotate(${hueRotateDeg}deg) brightness(${brightness}%) contrast(105%) drop-shadow(0 1px 2px hsl(0 0% 0% / 0.18))`;

// Build a 3-layer depth backdrop from a palette's HSL stops.
// Layer 1 (back): broad radial wash of primary-dark — anchors the depth
// Layer 2 (mid):  diagonal accent gradient — adds warmth & motion
// Layer 3 (front): tight radial highlights of primaryLight — "pop" close to viewer
const layered = (primary: string, primaryDark: string, primaryLight: string, accent: string) => ({
  layerBack: `radial-gradient(80% 60% at 15% 10%, hsl(${primaryDark} / 0.28) 0%, transparent 60%), radial-gradient(70% 55% at 90% 90%, hsl(${primary} / 0.20) 0%, transparent 65%)`,
  layerMid: `linear-gradient(135deg, hsl(${primary} / 0.10) 0%, transparent 40%, hsl(${accent} / 0.10) 100%)`,
  layerFront: `radial-gradient(35% 28% at 70% 20%, hsl(${primaryLight} / 0.22) 0%, transparent 70%), radial-gradient(28% 22% at 20% 80%, hsl(${accent} / 0.18) 0%, transparent 70%)`,
});

const make = (
  id: PaletteId,
  label: string,
  description: string,
  primary: string,
  primaryDark: string,
  primaryLight: string,
  accent: string,
  logoFilter: string,
): Palette => ({
  id,
  label,
  description,
  primary,
  primaryDark,
  primaryLight,
  accent,
  ring: primary,
  ...layered(primary, primaryDark, primaryLight, accent),
  logoFilter,
});

export const PALETTES: Record<PaletteId, Palette> = {
  crimson: make("crimson", "Crimson Heritage", "Default Bengali crimson & gold",
    "350 65% 42%", "350 70% 30%", "350 55% 58%", "40 78% 52%", tint(338, 4200, 92)),
  forest: make("forest", "Heritage Forest", "Deep green & gold ornament",
    "152 55% 30%", "152 60% 20%", "152 40% 48%", "42 85% 55%", tint(80, 3200, 88)),
  royal: make("royal", "Royal Indigo", "Cobalt blue & saffron",
    "222 70% 42%", "222 75% 28%", "222 60% 60%", "35 90% 55%", tint(195, 5200, 92)),
  marigold: make("marigold", "Marigold Sunset", "Orange & terracotta warmth",
    "22 85% 50%", "18 80% 38%", "28 80% 62%", "45 90% 55%", tint(355, 4800, 100)),
  magenta: make("magenta", "Mystic Magenta", "Vibrant magenta & gold",
    "320 70% 48%", "320 75% 34%", "320 60% 62%", "45 85% 58%", tint(295, 5000, 95)),
  midnight: make("midnight", "Midnight Aurora", "Deep navy with violet shimmer",
    "248 55% 38%", "248 65% 22%", "270 60% 58%", "190 85% 58%", tint(220, 4800, 88)),
  saffron: make("saffron", "Saffron Glow", "Warm saffron with copper warmth",
    "32 90% 50%", "18 75% 36%", "42 85% 60%", "350 70% 50%", tint(2, 5000, 98)),
  ocean: make("ocean", "Ocean Tide", "Teal currents & coral foam",
    "188 65% 38%", "200 70% 24%", "175 55% 52%", "12 80% 58%", tint(170, 4500, 92)),
  rose: make("rose", "Rose Quartz", "Soft pink with golden veil",
    "338 70% 52%", "338 75% 38%", "338 60% 68%", "38 85% 60%", tint(320, 4600, 98)),
  emerald: make("emerald", "Emerald Dynasty", "Jade emerald with gilded amber",
    "162 70% 32%", "162 75% 20%", "162 50% 50%", "38 90% 55%", tint(95, 4200, 90)),
};

export const DEFAULT_PALETTE: PaletteId = "crimson";

export const applyPalette = (id: PaletteId) => {
  const p = PALETTES[id] ?? PALETTES[DEFAULT_PALETTE];
  const root = document.documentElement;
  root.style.setProperty("--primary", p.primary);
  root.style.setProperty("--ring", p.ring);
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--crimson", p.primary);
  root.style.setProperty("--crimson-dark", p.primaryDark);
  root.style.setProperty("--crimson-light", p.primaryLight);
  root.style.setProperty("--gold", p.accent);
  // Layered depth — consumed by .palette-depth utility (see index.css).
  root.style.setProperty("--layer-back", p.layerBack);
  root.style.setProperty("--layer-mid", p.layerMid);
  root.style.setProperty("--layer-front", p.layerFront);
  // Logo filter consumed by LogoTile.
  root.style.setProperty("--logo-filter", p.logoFilter);
  // Re-derive hero gradient from current palette.
  root.style.setProperty(
    "--gradient-hero",
    `linear-gradient(135deg, hsl(${p.primary}), hsl(${p.primaryDark}), hsl(20 30% 12%))`,
  );
  // Lighter gold endpoint: bump lightness by ~10%.
  const goldLight = p.accent.replace(/(\d+)%$/, (_m, l) => `${Math.min(85, Number(l) + 10)}%`);
  root.style.setProperty(
    "--gradient-gold",
    `linear-gradient(135deg, hsl(${p.accent}), hsl(${goldLight}))`,
  );
  root.dataset.palette = id;
};
