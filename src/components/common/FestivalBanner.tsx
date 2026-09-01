import React, { useState } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Sparkles, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FestivalBanner: React.FC = () => {
  const { activeFestival, isFestivalThemeActive } = useSiteSettings();
  const { lang } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (!isFestivalThemeActive || !activeFestival || dismissed) return null;

  const greeting = lang === "en" ? activeFestival.greetingEn : activeFestival.greetingBn;
  const name = lang === "en" ? activeFestival.nameEn : activeFestival.nameBn;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-primary/10 border-b border-primary/20 backdrop-blur-md z-30"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-base shrink-0 animate-bounce">{activeFestival.icon}</span>
            <div className="flex items-center gap-2 truncate flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[10px] font-bengali uppercase shrink-0">
                {lang === "en" ? "Special Occasion" : "বিশেষ উৎসব"}
              </span>
              <p className="font-bengali font-semibold text-foreground truncate text-xs sm:text-sm">
                {greeting}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-full hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={lang === "en" ? "Dismiss banner" : "ব্যানারটি বন্ধ করুন"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FestivalBanner;
