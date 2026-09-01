import React, { useState, useRef, useEffect } from "react";
import {
  Paintbrush,
  Check,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar as CalendarIcon,
  Sparkles,
  Compass,
  Play,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PALETTES, PaletteId, applyPalette } from "@/lib/palettes";
import {
  BANGLADESH_SPECIAL_DAYS,
  getActiveSpecialDay,
  getNextUpcomingSpecialDay,
  getBanglaDate,
  getYearlyFestivalCalendar,
  toBanglaDigits,
  type SpecialDay,
  type YearlyFestivalItem,
} from "@/lib/specialDays";

export interface AppearanceFormState {
  palette: PaletteId;
  logo_glow: "off" | "subtle" | "normal" | "bold";
  logo_dilate: number;
  show_particles: boolean;
  auto_festival_theme: boolean;
  active_festival_override: string | null;
  theme_adaptive_logo: boolean;
}

interface ThemePalettesStudioProps {
  appearanceForm: AppearanceFormState;
  setAppearanceForm: React.Dispatch<React.SetStateAction<AppearanceFormState>>;
  savingSettings: boolean;
  onSave: () => Promise<void>;
}

export const ThemePalettesStudio: React.FC<ThemePalettesStudioProps> = ({
  appearanceForm,
  setAppearanceForm,
  savingSettings,
  onSave,
}) => {
  const { lang } = useLanguage();
  const [paletteCategoryTab, setPaletteCategoryTab] = useState<"all" | "heritage" | "occasion">("all");
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [showYearlyExplorer, setShowYearlyExplorer] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const simulatorRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (simulatorRef.current && !simulatorRef.current.contains(event.target as Node)) {
        setSimulatorOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };

    if (simulatorOpen || filterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [simulatorOpen, filterDropdownOpen]);

  const todaySpecialDay = getActiveSpecialDay();
  const nextSpecial = getNextUpcomingSpecialDay();

  const selectedFestival = appearanceForm.active_festival_override
    ? BANGLADESH_SPECIAL_DAYS.find((d) => d.id === appearanceForm.active_festival_override)
    : null;

  const todayBangla = getBanglaDate();

  const monthNamesBn = [
    "জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"
  ];
  const monthNamesEn = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getDateBadge = (d: SpecialDay) => {
    if (d.id === "boimela") {
      return lang === "en" ? "1-28 Feb" : "১-২৮ ফেব্রু";
    }
    if (d.movableDates) {
      return lang === "en" ? "Movable" : "চাঁদ সাপেক্ষে";
    }
    if (lang === "en") {
      return `${d.startDay} ${monthNamesEn[d.startMonth - 1]}`;
    }
    return `${d.startDay} ${monthNamesBn[d.startMonth - 1]}`;
  };

  const filteredPalettes = Object.values(PALETTES).filter((p) => {
    if (paletteCategoryTab === "all") return true;
    return p.category === paletteCategoryTab;
  });

  const categoryOptions = [
    {
      id: "all" as const,
      icon: "🌟",
      buttonLabelEn: "All Themes",
      buttonLabelBn: "সকল থিম",
      dropdownLabelEn: "All Themes",
      dropdownLabelBn: "সকল থিম",
      count: 21,
    },
    {
      id: "heritage" as const,
      icon: "🏛️",
      buttonLabelEn: "Heritage",
      buttonLabelBn: "হেরিটেজ",
      dropdownLabelEn: "Heritage Palettes",
      dropdownLabelBn: "প্রাতিষ্ঠানিক হেরিটেজ",
      count: 10,
    },
    {
      id: "occasion" as const,
      icon: "🇧🇩",
      buttonLabelEn: "Festivals",
      buttonLabelBn: "জাতীয় উৎসব",
      dropdownLabelEn: "Bangladesh Festivals",
      dropdownLabelBn: "জাতীয় ও উৎসবের থিম",
      count: 11,
    },
  ];

  const activeCategory = categoryOptions.find((c) => c.id === paletteCategoryTab) || categoryOptions[0];

  return (
    <div className="space-y-6">
      {/* ── AUTOMATED FESTIVAL & SPECIAL DAYS ENGINE BANNER ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-card via-secondary/20 to-primary/5 border border-border depth-card space-y-5 relative z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇧🇩</span>
              <h3 className="font-bengali font-bold text-base text-foreground">
                {lang === "en"
                  ? "Bangladesh Special Days & Festivals Auto-Theme Engine"
                  : "স্বয়ংক্রিয় জাতীয় দিবস ও উৎসব থিম ইঞ্জিন"}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                AUTO ENGINE
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-bengali">
              {lang === "en"
                ? "Automatically detect Bangladeshi historic days (Ekushey Feb, 26th March, Pohela Boishakh, 16th Dec, Jasimuddin Utsab, Eid, Puja) and apply dedicated cultural palettes."
                : "২১শে ফেব্রুয়ারি, ২৬শে মার্চ, পহেলা বৈশাখ, ১৬ই ডিসেম্বর, জসীম উদ্দীন স্মরণ, ঈদ ও পূজার মতো বিশেষ দিনে স্বয়ংক্রিয়ভাবে পোর্টালের রঙ ও আবহ বদলে যাবে।"}
            </p>
          </div>

          {/* Master Auto Toggle */}
          <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2.5 rounded-2xl border border-border shrink-0">
            <div className="text-right">
              <span className="text-xs font-bengali font-bold text-foreground block">
                {appearanceForm.auto_festival_theme
                  ? lang === "en"
                    ? "Auto-Theme ON"
                    : "স্বয়ংক্রিয় থিম চালু"
                  : lang === "en"
                  ? "Auto-Theme OFF"
                  : "স্বয়ংক্রিয় থিম বন্ধ"}
              </span>
              <span className="text-[10px] text-muted-foreground font-bengali">
                {appearanceForm.auto_festival_theme
                  ? lang === "en"
                    ? "Scheduled daily"
                    : "ক্যালেন্ডার অনুযায়ী"
                  : lang === "en"
                  ? "Manual theme locked"
                  : "ম্যানুয়াল লক"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={appearanceForm.auto_festival_theme}
              onChange={(e) => {
                const checked = e.target.checked;
                setAppearanceForm((prev) => ({ ...prev, auto_festival_theme: checked }));
                if (checked && todaySpecialDay) {
                  applyPalette(todaySpecialDay.paletteId);
                } else {
                  applyPalette(appearanceForm.palette || "royal");
                }
              }}
              className="w-5 h-5 rounded text-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Engine Live Status + Upcoming Countdown + Festival Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Today's Status */}
          <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-lg">
              {todaySpecialDay ? todaySpecialDay.icon : "🏛️"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold font-bengali text-muted-foreground uppercase tracking-wider block">
                {lang === "en" ? "Today's Status" : "আজকের স্ট্যাটাস"}
              </span>
              <p className="text-xs font-bengali font-bold text-foreground truncate">
                {todaySpecialDay
                  ? lang === "en"
                    ? todaySpecialDay.nameEn
                    : todaySpecialDay.nameBn
                  : lang === "en"
                  ? "Regular Schedule (Heritage Theme)"
                  : "নিয়মিত দিন (হেরিটেজ থিম)"}
              </p>
            </div>
          </div>

          {/* 2. Next Upcoming Festival */}
          <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 text-lg">
              {nextSpecial ? nextSpecial.specialDay.icon : "⏳"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold font-bengali text-muted-foreground uppercase tracking-wider block">
                {lang === "en" ? "Next Festival Countdown" : "পরবর্তী উৎসব"}
              </span>
              <p className="text-xs font-bengali font-bold text-foreground truncate">
                {nextSpecial
                  ? lang === "en"
                    ? `${nextSpecial.specialDay.nameEn} (${nextSpecial.daysRemaining} days left)`
                    : `${nextSpecial.specialDay.nameBn} (আর ${nextSpecial.daysRemaining} দিন বাকি)`
                  : lang === "en"
                  ? "No upcoming festivals"
                  : "কোনো উৎসব নেই"}
              </p>
            </div>
          </div>

          {/* 3. Live Festival Simulator / Test Mode */}
          <div
            ref={simulatorRef}
            className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-col justify-center space-y-1.5 relative z-40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-bengali text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <span>⚡</span>
                {lang === "en" ? "Festival Live Simulator" : "উৎসব সিমুলেটর (লাইভ টেস্ট)"}
              </span>
              {appearanceForm.active_festival_override && (
                <button
                  type="button"
                  onClick={() => {
                    setAppearanceForm((prev) => ({ ...prev, active_festival_override: null }));
                    applyPalette(appearanceForm.palette || "royal");
                  }}
                  className="text-[10px] text-primary hover:underline font-bengali cursor-pointer"
                >
                  {lang === "en" ? "Reset" : "রিসেট"}
                </button>
              )}
            </div>

            {/* Custom Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSimulatorOpen((prev) => !prev)}
                className="w-full px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bengali text-foreground flex items-center justify-between gap-2 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm shrink-0">
                    {selectedFestival ? selectedFestival.icon : "📅"}
                  </span>
                  <span className="truncate font-medium text-xs">
                    {selectedFestival
                      ? lang === "en"
                        ? selectedFestival.nameEn
                        : selectedFestival.nameBn
                      : lang === "en"
                      ? "Normal Schedule (Today's Date)"
                      : "স্বাভাবিক সূচি (আজকের তারিখ)"}
                  </span>
                </div>
                {simulatorOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Dropdown Popover Menu */}
              {simulatorOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-full sm:min-w-[320px] max-w-[calc(100vw-2rem)] z-50 rounded-2xl bg-popover border border-border shadow-2xl overflow-hidden p-1.5 max-h-72 overflow-y-auto">
                  {/* Default "Normal (Today's Date)" Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppearanceForm((prev) => ({ ...prev, active_festival_override: null }));
                      applyPalette(appearanceForm.palette || "royal");
                      setSimulatorOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-bengali transition-colors cursor-pointer ${
                      !appearanceForm.active_festival_override
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-base shrink-0">📅</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-xs text-foreground">
                          {lang === "en" ? "Normal (Today's Date)" : "স্বাভাবিক সূচি (আজকের তারিখ)"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate font-normal">
                          {lang === "en" ? "Follow calendar automations" : "স্বয়ংক্রিয় ক্যালেন্ডার অনুযায়ী"}
                        </p>
                      </div>
                    </div>
                    {!appearanceForm.active_festival_override && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>

                  <div className="my-1 border-t border-border/60" />

                  {/* Special Day Items */}
                  <div className="space-y-0.5">
                    {BANGLADESH_SPECIAL_DAYS.map((d) => {
                      const isSelected = appearanceForm.active_festival_override === d.id;
                      const categoryLabels: Record<string, { bn: string; en: string }> = {
                        national: { bn: "জাতীয়", en: "National" },
                        literary: { bn: "সাহিত্য", en: "Literary" },
                        seasonal: { bn: "ঋতু", en: "Seasonal" },
                        religious: { bn: "ধর্মীয়", en: "Religious" },
                      };
                      const catLabel = categoryLabels[d.category]
                        ? lang === "en"
                          ? categoryLabels[d.category].en
                          : categoryLabels[d.category].bn
                        : d.category;

                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setAppearanceForm((prev) => ({ ...prev, active_festival_override: d.id }));
                            applyPalette(d.paletteId);
                            setSimulatorOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-bengali transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-secondary/80"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-base shrink-0">{d.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-xs text-foreground">
                                {lang === "en" ? d.nameEn : d.nameBn}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold font-bengali bg-secondary/80 text-muted-foreground border border-border/60">
                                  {catLabel}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-primary/10 text-primary border border-primary/20">
                                  {getDateBadge(d)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Live Date Bar & Yearly Explorer Toggle Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs font-bengali text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border text-foreground">
              <span className="text-sm">🇧🇩</span>
              <span className="font-bold text-primary font-bengali">
                {todayBangla.formattedBn}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">•</span>
            <span className="text-[11px] text-muted-foreground font-bengali">
              {lang === "en"
                ? `Gregorian: ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                : `ইংরেজি: ${toBanglaDigits(new Date().getDate())} ${monthNamesBn[new Date().getMonth()]} ${toBanglaDigits(new Date().getFullYear())}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowYearlyExplorer((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bengali font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>
              {showYearlyExplorer
                ? (lang === "en" ? "Hide Yearly Calendar" : "ক্যালেন্ডার তালিকা লুকান")
                : (lang === "en" ? "Explore Year-Wise Calendar" : "বছরভিত্তিক উৎসব ক্যালেন্ডার দেখুন")}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showYearlyExplorer ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── EXPANDABLE YEAR-BY-YEAR FESTIVAL & SPECIAL DAYS EXPLORER ── */}
        {showYearlyExplorer && (
          <div className="pt-2 border-t border-border/70 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/50 p-3.5 rounded-2xl border border-border">
              <div className="space-y-0.5">
                <h4 className="font-bengali font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {lang === "en"
                      ? `${selectedYear} Bangladesh Festival & Theme Schedule`
                      : `${toBanglaDigits(selectedYear)} সালের জাতীয় উৎসব ও বঙ্গাব্দ পঞ্জিকা সূচি`}
                  </span>
                </h4>
                <p className="text-[10px] text-muted-foreground font-bengali">
                  {lang === "en"
                    ? "Accurately syncs with Bangla Academy revised solar calendar and astronomical Islamic moon-sighting dates."
                    : "বাংলা একাডেমি সংশোধিত বঙ্গাব্দ সৌর বর্ষপঞ্জি ও জাতীয় গেজেট অনুসারে স্বয়ংক্রিয়ভাবে গণনা করা হয়।"}
                </p>
              </div>

              {/* Year Selector Tabs */}
              <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shrink-0">
                {[2025, 2026, 2027, 2028, 2029].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedYear === yr
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang === "en" ? yr : toBanglaDigits(yr)}
                  </button>
                ))}
              </div>
            </div>

            {/* Festival Calendar Grid for Selected Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getYearlyFestivalCalendar(selectedYear).map((item) => {
                const pal = PALETTES[item.paletteId];
                const isCurrentlyActiveInSim = appearanceForm.active_festival_override === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl bg-card border transition-all flex flex-col justify-between space-y-2.5 shadow-2xs ${
                      isCurrentlyActiveInSim
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <h5 className="font-bengali font-bold text-xs text-foreground truncate">
                              {lang === "en" ? item.nameEn : item.nameBn}
                            </h5>
                            <span className="text-[10px] font-bold font-bengali text-primary">
                              {item.banglaDateString}
                            </span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bengali font-bold bg-secondary text-muted-foreground border border-border shrink-0">
                          {lang === "en" ? item.calendarTypeEn : item.calendarTypeBn}
                        </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground font-mono bg-secondary/40 px-2 py-1 rounded-lg border border-border/40">
                        📅 {lang === "en" ? item.gregorianDateStringEn : item.gregorianDateStringBn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                      {/* 4 Palette Dot Swatches */}
                      {pal && (
                        <div className="flex items-center gap-1" title={pal.label}>
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${pal.primary})` }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${pal.accent})` }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${pal.bgDark})` }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${pal.cardDark})` }} />
                        </div>
                      )}

                      {/* Instant Test Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setAppearanceForm((prev) => ({ ...prev, active_festival_override: item.id }));
                          applyPalette(item.paletteId);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bengali font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isCurrentlyActiveInSim
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-secondary hover:bg-primary/20 text-primary border border-border"
                        }`}
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>
                          {isCurrentlyActiveInSim
                            ? (lang === "en" ? "Active in Preview" : "প্রিভিউ চলছে")
                            : (lang === "en" ? "Test Theme" : "টেস্ট করুন")}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── THEME PALETTES SELECTOR SECTION ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-primary" />
              <span>
                {lang === "en"
                  ? "Theme & Color Palettes Studio (21 Themes)"
                  : "কালার থিম ও প্যালেট স্টুডিও (২১টি কালার থিম)"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground font-bengali mt-0.5">
              {lang === "en"
                ? "Click on any palette to preview instantly across the entire portal in real time."
                : "যেকোনো থিমে ক্লিক করলেই তাৎক্ষণিক পুরো পোর্টালে সরাসরি লাইভ প্রিভিউ দেখতে পাবেন।"}
            </p>
          </div>

          {/* Category Filter Dropdown */}
          <div ref={filterDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bengali font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="flex items-center gap-1.5">
                <span>{activeCategory.icon}</span>
                <span>{lang === "en" ? activeCategory.buttonLabelEn : activeCategory.buttonLabelBn}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                {activeCategory.count}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  filterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 min-w-[210px] max-w-[280px] p-1.5 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-0.5">
                {categoryOptions.map((opt) => {
                  const isSelected = paletteCategoryTab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPaletteCategoryTab(opt.id);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-bengali transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{opt.icon}</span>
                        <span className="truncate">{lang === "en" ? opt.dropdownLabelEn : opt.dropdownLabelBn}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-secondary text-muted-foreground border border-border">
                          {opt.count}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Palettes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPalettes.map((pal) => {
            const isSelected = (appearanceForm.palette || "royal") === pal.id;
            const isOccasionActive = todaySpecialDay?.paletteId === pal.id && appearanceForm.auto_festival_theme;
            const isOverrideActive =
              appearanceForm.active_festival_override &&
              BANGLADESH_SPECIAL_DAYS.find((d) => d.id === appearanceForm.active_festival_override)?.paletteId === pal.id;

            return (
              <div
                key={pal.id}
                onClick={() => {
                  setAppearanceForm((prev) => ({ ...prev, palette: pal.id }));
                  applyPalette(pal.id);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected || isOccasionActive || isOverrideActive
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                    : "border-border bg-secondary/30 hover:bg-secondary/70 hover:border-border/80"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-bengali uppercase border ${
                            pal.category === "heritage"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {pal.occasionBadge || (lang === "en" ? "Heritage Theme" : "প্রাতিষ্ঠানিক হেরিটেজ")}
                        </span>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-mono font-bold">
                            ACTIVE
                          </span>
                        )}
                        {(isOccasionActive || isOverrideActive) && !isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-mono font-bold animate-pulse">
                            LIVE TODAY
                          </span>
                        )}
                      </div>

                      <h4 className="font-bengali font-bold text-sm text-foreground mt-1.5">
                        {lang === "en" ? pal.label : pal.labelBn}
                      </h4>
                    </div>

                    {(isSelected || isOccasionActive || isOverrideActive) && (
                      <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground font-bengali line-clamp-2">
                    {lang === "en" ? pal.description : pal.descriptionBn}
                  </p>
                </div>

                {/* 4-Layer Color Swatch Circles + Contrast Preview */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full shadow-2xs border border-white/20"
                      style={{ backgroundColor: `hsl(${pal.primary})` }}
                      title="Primary Accent (10%)"
                    />
                    <div
                      className="w-5 h-5 rounded-full shadow-2xs border border-white/20"
                      style={{ backgroundColor: `hsl(${pal.accent})` }}
                      title="Secondary Accent"
                    />
                    <div
                      className="w-5 h-5 rounded-full shadow-2xs border border-white/20"
                      style={{ backgroundColor: `hsl(${pal.bgDark})` }}
                      title="Canvas Background (60%)"
                    />
                    <div
                      className="w-5 h-5 rounded-full shadow-2xs border border-white/20"
                      style={{ backgroundColor: `hsl(${pal.cardDark})` }}
                      title="Structural Surface (30%)"
                    />
                  </div>

                  {/* Preview Pill */}
                  <div
                    className="px-2 py-0.5 rounded-md text-[10px] font-bengali font-bold border border-white/10"
                    style={{
                      backgroundColor: `hsl(${pal.cardDark})`,
                      color: `hsl(${pal.primaryLight})`,
                    }}
                  >
                    বাংলা
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Theme-Adaptive Logo & Favicon Switch */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3">
          <div>
            <h4 className="font-bengali font-bold text-xs text-foreground flex items-center gap-1.5">
              <span>🎨</span>
              <span>{lang === "en" ? "Theme-Adaptive Logo & Favicon Color" : "থিমের রঙে লোগো ও ফ্যাভিকনের রঙ পরিবর্তন"}</span>
            </h4>
            <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
              {lang === "en"
                ? "When enabled, the logo and favicon dynamically tint to match the active theme. When disabled, they stay in original natural colors."
                : "চালু থাকলে সক্রিয় হেরিটেজ বা উৎসব থিম রঙের সাথে লোগো ও ফ্যাভিকন স্বয়ংক্রিয়ভাবে মানিয়ে নেবে। বন্ধ থাকলে মূল প্রাকৃতিক রঙে থাকবে।"}
            </p>
          </div>
          <input
            type="checkbox"
            checked={appearanceForm.theme_adaptive_logo}
            onChange={(e) =>
              setAppearanceForm((prev) => ({ ...prev, theme_adaptive_logo: e.target.checked }))
            }
            className="w-4 h-4 rounded text-primary cursor-pointer shrink-0"
          />
        </div>

        {/* Particle Background Switch */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
          <div>
            <h4 className="font-bengali font-bold text-xs text-foreground">
              {lang === "en" ? "Ambient Background Particles" : "হালকা ব্যাকগ্রাউন্ড পার্টিকেল এফেক্ট"}
            </h4>
            <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
              {lang === "en"
                ? "Floating literary aesthetic particles on home hero"
                : "পোর্টাল ব্যাকগ্রাউন্ডে মৃদু সাংস্কৃতিক ভাসমান কণা"}
            </p>
          </div>
          <input
            type="checkbox"
            checked={appearanceForm.show_particles}
            onChange={(e) =>
              setAppearanceForm((prev) => ({ ...prev, show_particles: e.target.checked }))
            }
            className="w-4 h-4 rounded text-primary cursor-pointer"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-muted-foreground font-bengali">
            {lang === "en"
              ? "Theme changes apply instantly sitewide for all visitors upon saving."
              : "সংরক্ষণ করার সাথে সাথে সকল ভিজিটরের জন্য এই থিম সক্রিয় হয়ে যাবে।"}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={savingSettings}
            className="px-7 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{lang === "en" ? "Save Theme & Festival Settings" : "থিম ও উৎসব সেটিংস সংরক্ষণ করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePalettesStudio;
