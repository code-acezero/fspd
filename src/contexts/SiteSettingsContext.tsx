import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applyPalette, DEFAULT_PALETTE, PALETTES, type PaletteId } from "@/lib/palettes";

interface SiteSettings {
  general: {
    site_name_bn: string;
    site_name_en: string;
    tagline_bn: string;
    tagline_en: string;
    contact_email: string;
    contact_phone: string;
    address_bn: string;
    address_en: string;
    logo_url: string;
  };
  appearance: {
    primary_color: string;
    accent_color: string;
    hero_style: string;
    show_particles: boolean;
    palette: PaletteId;
    logo_glow: "off" | "subtle" | "normal" | "bold";
    /** Dilation radius (SVG user units, viewBox 0–100) for the logo silhouette
     *  background. Clamped to a safe range so it never breaks layout or
     *  over-expands past the logo's true outer edge. */
    logo_dilate: number;
  };
  features: {
    enable_blog: boolean;
    enable_events: boolean;
    enable_courses: boolean;
    enable_members: boolean;
    maintenance_mode: boolean;
  };
  welcome_popup: {
    enabled: boolean;
    cooldown_minutes: number;
  };
}

// --- Validation / clamping for appearance values ---
const VALID_GLOWS = ["off", "subtle", "normal", "bold"] as const;
const LOGO_DILATE_MIN = 0;
const LOGO_DILATE_MAX = 20;
const LOGO_DILATE_DEFAULT = 8;

const clampLogoDilate = (raw: unknown): number => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return LOGO_DILATE_DEFAULT;
  return Math.min(LOGO_DILATE_MAX, Math.max(LOGO_DILATE_MIN, Math.round(n * 10) / 10));
};

const sanitizeAppearance = (
  incoming: Partial<SiteSettings["appearance"]> & Record<string, unknown>,
): SiteSettings["appearance"] => {
  const glow = VALID_GLOWS.includes(incoming.logo_glow as typeof VALID_GLOWS[number])
    ? (incoming.logo_glow as SiteSettings["appearance"]["logo_glow"])
    : "normal";
  return {
    primary_color: String(incoming.primary_color ?? defaultSettings.appearance.primary_color),
    accent_color: String(incoming.accent_color ?? defaultSettings.appearance.accent_color),
    hero_style: String(incoming.hero_style ?? defaultSettings.appearance.hero_style),
    show_particles: Boolean(incoming.show_particles ?? defaultSettings.appearance.show_particles),
    palette: (PALETTES[incoming.palette as PaletteId]
      ? (incoming.palette as PaletteId)
      : DEFAULT_PALETTE),
    logo_glow: glow,
    logo_dilate: clampLogoDilate(incoming.logo_dilate ?? LOGO_DILATE_DEFAULT),
  };
};

const defaultSettings: SiteSettings = {
  general: { site_name_bn: "ফরিদপুর সাহিত্য পরিষদ", site_name_en: "Faridpur Shahitto Parishad", tagline_bn: "বাংলা সংস্কৃতির পাদপীঠ", tagline_en: "The Cradle of Bengali Culture", contact_email: "info@fsp.org.bd", contact_phone: "", address_bn: "", address_en: "", logo_url: "" },
  appearance: { primary_color: "0 78% 45%", accent_color: "45 90% 52%", hero_style: "default", show_particles: true, palette: DEFAULT_PALETTE, logo_glow: "normal", logo_dilate: LOGO_DILATE_DEFAULT },
  features: { enable_blog: true, enable_events: true, enable_courses: true, enable_members: true, maintenance_mode: false },
  welcome_popup: { enabled: true, cooldown_minutes: 15 },
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (key: keyof SiteSettings, value: any) => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const merged = { ...defaultSettings };
        data.forEach((row) => {
          if (row.key in merged) {
            (merged as any)[row.key] = { ...(merged as any)[row.key], ...(row.value as any) };
          }
        });
        // Always sanitize appearance — clamps logo_dilate, validates logo_glow,
        // and falls back to defaults for any malformed values from the DB.
        merged.appearance = sanitizeAppearance(merged.appearance);
        setSettings(merged);
        applyPalette(merged.appearance.palette);
      } else {
        applyPalette(DEFAULT_PALETTE);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // Re-apply palette whenever it changes (admin updates).
  useEffect(() => {
    const palette = (settings.appearance.palette as PaletteId) || DEFAULT_PALETTE;
    applyPalette(PALETTES[palette] ? palette : DEFAULT_PALETTE);
  }, [settings.appearance.palette]);

  const updateSettings = async (key: keyof SiteSettings, value: any) => {
    // Sanitize appearance on the way out so invalid admin input never reaches
    // Supabase or the live UI.
    const safeValue = key === "appearance" ? sanitizeAppearance(value ?? {}) : value;
    const { error } = await supabase
      .from("site_settings")
      .update({ value: safeValue as any, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (!error) {
      setSettings((prev) => ({ ...prev, [key]: safeValue }));
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
