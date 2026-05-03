import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Eye, Home } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import alponaMotif from "@/assets/alpona-motif.webp";
import LogoTile from "@/components/branding/LogoTile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const { lang, t } = useLanguage();
  const { settings } = useSiteSettings();
  const siteName = lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn;
  const tagline = lang === "en" ? settings.general.tagline_en : settings.general.tagline_bn;
  const [heroImage, setHeroImage] = useState<string>(heroBanner);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_assets")
        .select("image_url")
        .eq("slot", "hero")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data?.image_url) setHeroImage(data.image_url);
    })();
  }, []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 8]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden palette-depth">
      {/* Deep parallax background with perspective */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale, rotateX, transformOrigin: "center top" }}>
        <img src={heroImage} alt="Bengali cultural heritage landscape" className="w-full h-[120%] object-cover" width={1920} height={960} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/8 via-transparent to-accent/5" />
      </motion.div>

      {/* Floating cultural motifs with depth layers */}
      <motion.img src={alponaMotif} alt="" className="absolute top-16 right-8 w-40 h-40 opacity-[0.03] pointer-events-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -80]) }}
        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} loading="lazy" width={512} height={512} />
      <motion.img src={alponaMotif} alt="" className="absolute bottom-24 left-8 w-32 h-32 opacity-[0.03] pointer-events-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 60]) }}
        animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} loading="lazy" width={512} height={512} />

      {/* Floating light orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${10 + i * 11}%`,
            left: `${5 + i * 12}%`,
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
            background: i % 2 === 0
              ? "radial-gradient(circle, hsl(var(--gold) / 0.4), transparent)"
              : "radial-gradient(circle, hsl(var(--crimson-light) / 0.3), transparent)",
            y: useTransform(scrollYProgress, [0, 1], [0, -30 - i * 10]),
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              <LogoTile size="md" glow="subtle" contained />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-2">
            <Link to="/home" className="px-5 py-2 text-sm rounded-full bg-foreground/10 backdrop-blur-md text-foreground/80 hover:text-foreground hover:bg-foreground/20 transition-all border border-foreground/10 font-bengali">{t("home")}</Link>
            <Link to="/login" className="px-5 py-2 text-sm rounded-full bg-primary backdrop-blur-md text-primary-foreground hover:bg-crimson-dark transition-all shadow-lg shadow-primary/30 font-bengali">{t("joinUs")}</Link>
          </motion.div>
        </div>
      </div>

      {/* Main content with parallax + perspective */}
      <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20" style={{ y: textY, opacity }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
          <p className="text-accent text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-medium">{tagline}</p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-bengali text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          style={{ textShadow: "0 4px 30px hsl(var(--primary) / 0.15)" }}
        >
          {siteName}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-4 font-bengali">
          {t("heroSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/30 mb-10 shadow-inner"
        >
          <Eye className="w-4 h-4 text-accent" />
          <span className="text-foreground/90 text-sm"><span className="font-semibold text-accent">১২,৪৫৬</span> {t("visitors")}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/home" className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-crimson-dark transition-all shadow-xl shadow-primary/25 font-bengali hover:shadow-primary/40 hover:-translate-y-1 inline-flex items-center gap-2 justify-center">
            <Home className="w-4 h-4" />{t("exploreHome")}
          </Link>
          <a href="#about" className="px-8 py-3.5 bg-foreground/5 text-foreground font-semibold rounded-full hover:bg-foreground/10 transition-all backdrop-blur-md border border-foreground/10 font-bengali hover:-translate-y-1">
            {t("learnAbout")}
          </a>
          <Link to="/members" className="px-8 py-3.5 bg-foreground/5 text-foreground font-semibold rounded-full hover:bg-foreground/10 transition-all backdrop-blur-md border border-foreground/10 font-bengali hover:-translate-y-1">
            {t("viewMembers")}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 12, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
        <ChevronDown className="w-6 h-6 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
