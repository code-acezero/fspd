import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Speech {
  id: string;
  role_label: string;
  role_label_en: string;
  speaker_name: string;
  speaker_name_en: string;
  speech: string;
  speech_en: string;
  photo_url: string;
  sort_order: number;
  is_active: boolean;
}

const STORAGE_KEY = "fsp-welcome-popup-shown-at";

const WelcomeSpeechPopup = () => {
  const { settings } = useSiteSettings();
  const { lang } = useLanguage();
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Cooldown gate — show only if last shown more than `cooldown_minutes` ago.
  const popupCfg = (settings as any)?.welcome_popup as { enabled?: boolean; cooldown_minutes?: number } | undefined;
  const enabled = popupCfg?.enabled !== false;
  const cooldown = Math.max(1, popupCfg?.cooldown_minutes ?? 15);

  useEffect(() => {
    if (!enabled) return;
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const now = Date.now();
    if (last && now - last < cooldown * 60 * 1000) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("welcome_speeches")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (cancelled || !data || data.length === 0) return;
      setSpeeches(data);
      setIndex(0);
      // small delay so it doesn't fight the page paint
      setTimeout(() => setOpen(true), 800);
    })();
    return () => { cancelled = true; };
  }, [enabled, cooldown]);

  const close = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const next = () => {
    if (index < speeches.length - 1) setIndex(index + 1);
    else close();
  };

  if (!open || speeches.length === 0) return null;
  const s = speeches[index];
  const name = lang === "en" ? (s.speaker_name_en || s.speaker_name) : (s.speaker_name || s.speaker_name_en);
  const role = lang === "en" ? (s.role_label_en || s.role_label) : (s.role_label || s.role_label_en);
  const text = lang === "en" ? (s.speech_en || s.speech) : (s.speech || s.speech_en);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-background/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left: large portrait */}
              <div className="md:w-2/5 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl bg-muted">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bengali font-bold text-primary">
                      {name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <span className="mt-4 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bengali font-semibold">
                  {role}
                </span>
                <h3 className="mt-2 font-bengali font-bold text-base md:text-lg text-foreground">
                  {name}
                </h3>
              </div>

              {/* Right: novel-style speech */}
              <div className="md:w-3/5 p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                <Quote className="w-6 h-6 text-accent/60 mb-2" />
                <p
                  className="font-bengali text-foreground/90 leading-loose text-sm md:text-base whitespace-pre-wrap"
                  style={{
                    fontFamily: "'Hind Siliguri', Georgia, serif",
                    textAlign: "justify",
                    textIndent: "1.5em",
                  }}
                >
                  {text}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {speeches.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bengali font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              >
                {index < speeches.length - 1 ? (lang === "en" ? "Next" : "পরবর্তী") : (lang === "en" ? "Close" : "বন্ধ করুন")}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeSpeechPopup;
