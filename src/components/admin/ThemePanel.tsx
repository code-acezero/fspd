import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TOKEN_KEYS,
  type TokenKey,
  type ThemeMode,
  type ThemeSetting,
  MONO_LIGHT,
  MONO_DARK,
  hslToHex,
  hexToHsl,
} from "@/lib/themeTokens";

const LABEL_KEYS: Record<TokenKey, string> = {
  background: "tokenBackground",
  foreground: "tokenForeground",
  card: "tokenCard",
  card_foreground: "tokenCardForeground",
  popover: "tokenPopover",
  popover_foreground: "tokenPopoverForeground",
  primary: "tokenPrimary",
  primary_foreground: "tokenPrimaryForeground",
  secondary: "tokenSecondary",
  secondary_foreground: "tokenSecondaryForeground",
  muted: "tokenMuted",
  muted_foreground: "tokenMutedForeground",
  accent: "tokenAccent",
  accent_foreground: "tokenAccentForeground",
  destructive: "tokenDestructive",
  destructive_foreground: "tokenDestructiveForeground",
  border: "tokenBorder",
  input: "tokenInput",
  ring: "tokenRing",
  gold: "tokenGold",
  gold_light: "tokenGoldLight",
  gold_foreground: "tokenGoldForeground",
  crimson: "tokenCrimson",
  crimson_dark: "tokenCrimsonDark",
  crimson_light: "tokenCrimsonLight",
  crimson_foreground: "tokenCrimsonForeground",
  forest: "tokenForest",
  forest_light: "tokenForestLight",
  forest_foreground: "tokenForestForeground",
  success: "tokenSuccess",
  success_foreground: "tokenSuccessForeground",
  warning: "tokenWarning",
  warning_foreground: "tokenWarningForeground",
};

/**
 * Visual color picker for every design token in both light & dark modes.
 * Values are stored as HSL strings in site_settings.theme and applied live
 * via applyThemeTokens() in SiteSettingsContext.
 */
const ThemePanel = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { theme: mode, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [draft, setDraft] = useState<ThemeSetting>(settings.theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings.theme), [settings.theme]);

  const setToken = (m: ThemeMode, k: TokenKey, hsl: string) => {
    setDraft((d) => ({ ...d, [m]: { ...d[m], [k]: hsl } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings("theme", draft);
    toast({ title: t("themeSaved"), description: t("themeSavedDesc") });
    setSaving(false);
  };

  const handleReset = (m: ThemeMode) => {
    const fallback = m === "dark" ? MONO_DARK : MONO_LIGHT;
    setDraft((d) => ({ ...d, [m]: { ...fallback } }));
  };

  return (
    <div className="bg-background rounded-3xl border border-border p-6 depth-card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-bengali font-bold text-foreground">{t("themeColors")}</h3>
          <p className="text-xs text-muted-foreground mt-1 font-bengali">
            {t("themeColorsDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-secondary p-1">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-bengali transition-all ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
                }`}
              >
                {m === "dark" ? t("darkMode") : t("lightMode")}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleReset(mode)}
            className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold font-bengali hover:bg-secondary/80 flex items-center gap-1.5"
            title={t("resetToMono")}
          >
            <RotateCcw className="w-3.5 h-3.5" /> {t("reset")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TOKEN_KEYS.map((k) => {
          const hsl = draft[mode][k] ?? (mode === "dark" ? MONO_DARK[k] : MONO_LIGHT[k]);
          const hex = hslToHex(hsl);
          return (
            <label
              key={k}
              className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card"
            >
              <input
                type="color"
                value={hex}
                onChange={(e) => setToken(mode, k, hexToHsl(e.target.value))}
                className="w-10 h-10 rounded-full border border-border cursor-pointer bg-transparent"
                aria-label={t(LABEL_KEYS[k])}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground font-bengali truncate">{t(LABEL_KEYS[k])}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{hsl}</div>
              </div>
            </label>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("saveTheme")}
      </button>
    </div>
  );
};

export default ThemePanel;
