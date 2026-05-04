// Theme token system — DB-driven design colors.
//
// The site_settings.theme row stores HSL strings ("H S% L%") for every CSS
// variable consumed by Tailwind / shadcn / our custom utilities, separated
// into `light` and `dark` modes. SiteSettingsContext reads this row on boot
// and calls applyThemeTokens() to override the monochrome defaults baked
// into src/index.css.
//
// Adding a new token? Append it to TOKEN_KEYS, the seed in the migration,
// and the admin Theme picker. Everything else (apply/types) is generic.

export type ThemeMode = "light" | "dark";

export const TOKEN_KEYS = [
  "background",
  "foreground",
  "card",
  "card_foreground",
  "popover",
  "popover_foreground",
  "primary",
  "primary_foreground",
  "secondary",
  "secondary_foreground",
  "muted",
  "muted_foreground",
  "accent",
  "accent_foreground",
  "destructive",
  "destructive_foreground",
  "border",
  "input",
  "ring",
  "gold",
  "gold_light",
  "crimson",
  "crimson_dark",
  "crimson_light",
  "forest",
  "forest_light",
  "success",
  "success_foreground",
  "warning",
  "warning_foreground",
] as const;

export type TokenKey = (typeof TOKEN_KEYS)[number];
export type ThemeTokens = Record<TokenKey, string>;
export interface ThemeSetting {
  light: Partial<ThemeTokens>;
  dark: Partial<ThemeTokens>;
}

// Pure monochrome fallbacks — must match :root / .dark in src/index.css.
export const MONO_LIGHT: ThemeTokens = {
  background: "0 0% 100%",
  foreground: "0 0% 8%",
  card: "0 0% 98%",
  card_foreground: "0 0% 8%",
  popover: "0 0% 100%",
  popover_foreground: "0 0% 8%",
  primary: "0 0% 12%",
  primary_foreground: "0 0% 98%",
  secondary: "0 0% 94%",
  secondary_foreground: "0 0% 12%",
  muted: "0 0% 94%",
  muted_foreground: "0 0% 40%",
  accent: "0 0% 90%",
  accent_foreground: "0 0% 12%",
  destructive: "0 0% 30%",
  destructive_foreground: "0 0% 98%",
  border: "0 0% 88%",
  input: "0 0% 88%",
  ring: "0 0% 30%",
  gold: "0 0% 50%",
  gold_light: "0 0% 70%",
  crimson: "0 0% 30%",
  crimson_dark: "0 0% 20%",
  crimson_light: "0 0% 60%",
  forest: "0 0% 35%",
  forest_light: "0 0% 50%",
  success: "0 0% 30%",
  success_foreground: "0 0% 98%",
  warning: "0 0% 45%",
  warning_foreground: "0 0% 98%",
};

export const MONO_DARK: ThemeTokens = {
  background: "0 0% 6%",
  foreground: "0 0% 92%",
  card: "0 0% 10%",
  card_foreground: "0 0% 92%",
  popover: "0 0% 10%",
  popover_foreground: "0 0% 92%",
  primary: "0 0% 88%",
  primary_foreground: "0 0% 8%",
  secondary: "0 0% 14%",
  secondary_foreground: "0 0% 92%",
  muted: "0 0% 14%",
  muted_foreground: "0 0% 55%",
  accent: "0 0% 18%",
  accent_foreground: "0 0% 92%",
  destructive: "0 0% 60%",
  destructive_foreground: "0 0% 8%",
  border: "0 0% 18%",
  input: "0 0% 18%",
  ring: "0 0% 70%",
  gold: "0 0% 60%",
  crimson: "0 0% 70%",
  crimson_dark: "0 0% 50%",
  crimson_light: "0 0% 80%",
};

export const DEFAULT_THEME: ThemeSetting = { light: MONO_LIGHT, dark: MONO_DARK };

const cssVar = (k: TokenKey) => `--${k.replace(/_/g, "-")}`;

/** Apply a partial token map to :root via inline style. Missing keys fall
 *  back to the monochrome defaults so the page never goes "no colors". */
export const applyThemeTokens = (tokens: Partial<ThemeTokens>, mode: ThemeMode) => {
  const fallback = mode === "dark" ? MONO_DARK : MONO_LIGHT;
  const root = document.documentElement;
  TOKEN_KEYS.forEach((k) => {
    const v = tokens[k] ?? fallback[k];
    root.style.setProperty(cssVar(k), v);
  });
};

/** HSL "H S% L%" → "#rrggbb" (for color picker UI). */
export const hslToHex = (hsl: string): string => {
  const m = hsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!m) return "#000000";
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/** "#rrggbb" → "H S% L%" (HSL string format used by all our CSS vars). */
export const hexToHsl = (hex: string): string => {
  const m = hex.trim().replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return "0 0% 0%";
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};
