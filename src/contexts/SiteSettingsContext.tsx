import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applyPalette, DEFAULT_PALETTE, PALETTES, type PaletteId } from "@/lib/palettes";
import { getActiveSpecialDay, BANGLADESH_SPECIAL_DAYS, type SpecialDay } from "@/lib/specialDays";

export interface SiteSettings {
  general: {
    site_name_bn: string;
    site_name_en: string;
    tagline_bn: string;
    tagline_en: string;
    contact_email: string;
    contact_phone: string;
    alt_phone?: string;
    address_bn: string;
    address_en: string;
    logo_url: string;
    facebook_url?: string;
    youtube_url?: string;
    established_year_bn?: string;
    established_year_en?: string;
    favicon_bg?: "white_circle" | "white_solid" | "gradient_primary" | "transparent";
  };
  appearance: {
    primary_color: string;
    accent_color: string;
    hero_style: string;
    show_particles: boolean;
    palette: PaletteId;
    logo_glow: "off" | "subtle" | "normal" | "bold";
    /** Dilation radius (SVG user units, viewBox 0–100) for the logo silhouette */
    logo_dilate: number;
    /** Automatically detect Bangladesh national days and festivals and apply specific festival themes */
    auto_festival_theme: boolean;
    /** Manual test/override festival ID (null for normal automatic operation) */
    active_festival_override: string | null;
    /** Whether the logo & favicon adapt to the current theme colors */
    theme_adaptive_logo: boolean;
  };
  features: {
    enable_blog: boolean;
    enable_events: boolean;
    enable_courses: boolean;
    enable_members: boolean;
    enable_gallery: boolean;
    maintenance_mode: boolean;
    maintenance_message_bn?: string;
    maintenance_message_en?: string;
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

const sanitizeAppearance = (raw: unknown): SiteSettings["appearance"] => {
  if (!raw || typeof raw !== "object") return { ...defaultSettings.appearance };
  const incoming = raw as Partial<SiteSettings["appearance"]>;
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
    auto_festival_theme: incoming.auto_festival_theme !== undefined ? Boolean(incoming.auto_festival_theme) : true,
    active_festival_override: incoming.active_festival_override ? String(incoming.active_festival_override) : null,
    theme_adaptive_logo: incoming.theme_adaptive_logo !== undefined ? Boolean(incoming.theme_adaptive_logo) : true,
  };
};

export const applyBrowserFavicon = (
  logoSrc: string,
  bgStyle: string = "white_circle",
  paletteId: PaletteId = "royal",
  themeAdaptive: boolean = true
) => {
  if (typeof window === "undefined" || !logoSrc) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pal = PALETTES[paletteId] || PALETTES["royal"];
      const primaryHsl = pal.primary;

      // Calculate aspect-ratio preserved dimensions (contain mode)
      const calculateFit = (targetPad: number) => {
        const availW = size - targetPad * 2;
        const availH = size - targetPad * 2;
        const natW = img.naturalWidth || 1;
        const natH = img.naturalHeight || 1;
        const aspect = natW / natH;

        let drawW = availW;
        let drawH = availH;
        let drawX = targetPad;
        let drawY = targetPad;

        if (aspect < 1) {
          // Taller than wide: fit to height, center horizontally
          drawH = availH;
          drawW = availH * aspect;
          drawX = targetPad + (availW - drawW) / 2;
          drawY = targetPad;
        } else {
          // Wider than tall: fit to width, center vertically
          drawW = availW;
          drawH = availW / aspect;
          drawX = targetPad;
          drawY = targetPad + (availH - drawH) / 2;
        }

        return { drawX, drawY, drawW, drawH };
      };

      if (bgStyle === "white_circle") {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = themeAdaptive ? `hsl(${primaryHsl})` : "rgba(0, 0, 0, 0.12)";
        ctx.stroke();

        const { drawX, drawY, drawW, drawH } = calculateFit(14);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else if (bgStyle === "white_solid") {
        const r = 24;
        ctx.beginPath();
        ctx.roundRect(2, 2, size - 4, size - 4, r);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = themeAdaptive ? `hsl(${primaryHsl})` : "rgba(0, 0, 0, 0.12)";
        ctx.stroke();

        const { drawX, drawY, drawW, drawH } = calculateFit(16);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else if (bgStyle === "gradient_primary") {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        const grad = ctx.createLinearGradient(0, 0, size, size);
        if (themeAdaptive) {
          grad.addColorStop(0, `hsl(${pal.primary})`);
          grad.addColorStop(1, `hsl(${pal.accent})`);
        } else {
          grad.addColorStop(0, "#1e3a8a");
          grad.addColorStop(1, "#3b82f6");
        }
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        const { drawX, drawY, drawW, drawH } = calculateFit(16);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Transparent
        const { drawX, drawY, drawW, drawH } = calculateFit(4);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      const dataUrl = canvas.toDataURL("image/png");
      let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = dataUrl;

      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleLink) {
        appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        document.head.appendChild(appleLink);
      }
      appleLink.href = dataUrl;
    } catch (e) {
      console.warn("Could not update dynamic favicon:", e);
    }
  };
  img.src = logoSrc;
};

const defaultSettings: SiteSettings = {
  general: {
    site_name_bn: "ফরিদপুর সাহিত্য পরিষদ",
    site_name_en: "Faridpur Shahitto Parishad",
    tagline_bn: "বাংলা সংস্কৃতির পাদপীঠ",
    tagline_en: "The Cradle of Bengali Culture",
    contact_email: "info@fsp.org.bd",
    contact_phone: "01715-015621",
    alt_phone: "",
    address_bn: "ফরিদপুর সাহিত্য পরিষদ, সাহিত্য ভবন, পৌরসভার পূর্ব পার্শ্বে, ফরিদপুর",
    address_en: "Faridpur Shahitto Parishad, Sahitya Bhaban, East of Municipality, Faridpur",
    logo_url: "/site-logo.png",
    facebook_url: "https://facebook.com",
    youtube_url: "",
    established_year_bn: "১৯৮২",
    established_year_en: "1982",
    favicon_bg: "white_circle",
  },
  appearance: {
    primary_color: "228 75% 50%",
    accent_color: "192 95% 50%",
    hero_style: "default",
    show_particles: true,
    palette: DEFAULT_PALETTE,
    logo_glow: "normal",
    logo_dilate: LOGO_DILATE_DEFAULT,
    auto_festival_theme: true,
    active_festival_override: null,
  },
  features: {
    enable_blog: true,
    enable_events: true,
    enable_courses: true,
    enable_members: true,
    enable_gallery: true,
    maintenance_mode: false,
    maintenance_message_bn: "ওয়েবসাইটে রক্ষণাবেক্ষণের কাজ চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।",
    maintenance_message_en: "Site is currently undergoing scheduled maintenance. We will be back shortly.",
  },
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (key: keyof SiteSettings, value: any) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  loading: boolean;
  activeFestival: SpecialDay | null;
  isFestivalThemeActive: boolean;
  effectivePalette: PaletteId;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => false,
  refreshSettings: async () => {},
  loading: true,
  activeFestival: null,
  isFestivalThemeActive: false,
  effectivePalette: DEFAULT_PALETTE,
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Compute active festival
  const activeFestival = useMemo(() => {
    if (!settings.appearance.auto_festival_theme && !settings.appearance.active_festival_override) {
      return null;
    }

    if (settings.appearance.active_festival_override) {
      const found = BANGLADESH_SPECIAL_DAYS.find(
        (d) => d.id === settings.appearance.active_festival_override
      );
      if (found) return found;
    }

    if (settings.appearance.auto_festival_theme) {
      return getActiveSpecialDay();
    }

    return null;
  }, [settings.appearance.auto_festival_theme, settings.appearance.active_festival_override]);

  // Compute effective palette
  const effectivePalette = useMemo<PaletteId>(() => {
    if (activeFestival && activeFestival.paletteId && PALETTES[activeFestival.paletteId]) {
      return activeFestival.paletteId;
    }
    const pal = settings.appearance.palette as PaletteId;
    return PALETTES[pal] ? pal : DEFAULT_PALETTE;
  }, [activeFestival, settings.appearance.palette]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const merged = { ...defaultSettings };
      data.forEach((row) => {
        if (row.key in merged) {
          (merged as any)[row.key] = { ...(merged as any)[row.key], ...(row.value as any) };
        }
      });
      merged.appearance = sanitizeAppearance(merged.appearance);
      setSettings(merged);

      // Apply dynamic favicon
      applyBrowserFavicon(
        merged.general.logo_url || "/site-logo.png",
        merged.general.favicon_bg || "white_circle",
        merged.appearance.palette || "royal",
        merged.appearance.theme_adaptive_logo !== false
      );
    } else {
      applyBrowserFavicon("/site-logo.png", "white_circle", "royal", true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Re-apply palette whenever effective palette changes
  useEffect(() => {
    applyPalette(effectivePalette);
  }, [effectivePalette]);

  // Re-apply favicon whenever logo, favicon background, effectivePalette, or theme_adaptive_logo changes
  useEffect(() => {
    applyBrowserFavicon(
      settings.general.logo_url || "/site-logo.png",
      settings.general.favicon_bg || "white_circle",
      effectivePalette,
      settings.appearance.theme_adaptive_logo !== false
    );
  }, [
    settings.general.logo_url,
    settings.general.favicon_bg,
    effectivePalette,
    settings.appearance.theme_adaptive_logo,
  ]);

  const updateSettings = async (key: keyof SiteSettings, value: any): Promise<boolean> => {
    const safeValue = key === "appearance" ? sanitizeAppearance(value ?? {}) : value;
    const { error } = await supabase
      .from("site_settings")
      .update({ value: safeValue as any, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (!error) {
      setSettings((prev) => ({ ...prev, [key]: safeValue }));
      return true;
    }
    console.error("Failed to update site_settings:", error);
    return false;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        refreshSettings: fetchSettings,
        loading,
        activeFestival,
        isFestivalThemeActive: Boolean(activeFestival),
        effectivePalette,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
