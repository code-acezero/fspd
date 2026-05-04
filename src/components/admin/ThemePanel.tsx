import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
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

const LABELS: Record<TokenKey, string> = {
  background: "Background",
  foreground: "Foreground (text)",
  card: "Card",
  card_foreground: "Card text",
  popover: "Popover",
  popover_foreground: "Popover text",
  primary: "Primary",
  primary_foreground: "Primary text",
  secondary: "Secondary",
  secondary_foreground: "Secondary text",
  muted: "Muted",
  muted_foreground: "Muted text",
  accent: "Accent",
  accent_foreground: "Accent text",
  destructive: "Destructive",
  destructive_foreground: "Destructive text",
  border: "Border",
  input: "Input",
  ring: "Ring (focus)",
  gold: "Gold",
  gold_light: "Gold light",
  crimson: "Crimson",
  crimson_dark: "Crimson dark",
  crimson_light: "Crimson light",
  forest: "Forest",
  forest_light: "Forest light",
  success: "Success",
  success_foreground: "Success text",
  warning: "Warning",
  warning_foreground: "Warning text",
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
  const [draft, setDraft] = useState<ThemeSetting>(settings.theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings.theme), [settings.theme]);

  const setToken = (m: ThemeMode, k: TokenKey, hsl: string) => {
    setDraft((d) => ({ ...d, [m]: { ...d[m], [k]: hsl } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings("theme", draft);
    toast({ title: "Theme saved", description: "Colors updated across the site." });
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
          <h3 className="font-bengali font-bold text-foreground">Theme Colors</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Edit every color used across the site. Defaults are pure monochrome — set your brand palette here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-secondary p-1">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
                }`}
              >
                {m === "dark" ? "Dark mode" : "Light mode"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleReset(mode)}
            className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 flex items-center gap-1.5"
            title={`Reset ${mode} to monochrome`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
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
                aria-label={LABELS[k]}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{LABELS[k]}</div>
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
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save theme
      </button>
    </div>
  );
};

export default ThemePanel;
