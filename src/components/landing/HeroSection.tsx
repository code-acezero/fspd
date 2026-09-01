import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Home } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import alponaMotif from "@/assets/alpona-motif.png";
import LogoTile from "@/components/branding/LogoTile";
import HeritageRibbon from "@/components/branding/HeritageRibbon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { supabase } from "@/integrations/supabase/client";
import { isVideoMedia } from "@/lib/storage";
import EditableText from "@/components/editor/EditableText";
import EditableImage from "@/components/editor/EditableImage";
import EditableSection from "@/components/editor/EditableSection";

const HeroSection = () => {
  const { lang, t } = useLanguage();
  const { settings } = useSiteSettings();
  const { getContent, editMode } = useVisualEditor();
  const [heroImage, setHeroImage] = useState<string>(heroBanner);

  useEffect(() => {
    (async () => {
      // 1. Try page_content first
      const { data: pageData } = await supabase
        .from("page_content" as any)
        .select("media_url")
        .eq("page_key", "landing")
        .eq("section_key", "hero")
        .eq("element_key", "bg_image")
        .maybeSingle();

      if ((pageData as any)?.media_url) {
        setHeroImage((pageData as any).media_url);
        return;
      }

      // 2. Try site_assets slot="hero"
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

    const handleHeroUpdated = (e: any) => {
      if (e?.detail) setHeroImage(e.detail);
    };
    window.addEventListener("fspd:hero_image_updated", handleHeroUpdated);
    return () => window.removeEventListener("fspd:hero_image_updated", handleHeroUpdated);
  }, []);

  const heroImageResolution = getContent("landing", "hero", "bg_image", { media: heroImage });
  const activeHeroImage = heroImageResolution.mediaUrl || heroImage;

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, 140], { clamp: true });
  const textY = useTransform(scrollY, [0, 500], [0, -80], { clamp: true });
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0], { clamp: true });
  const heroBlendDarken = useTransform(scrollY, [0, 550], [0, 1], { clamp: true });
  const chevronOpacity = useTransform(scrollY, [0, 150], [1, 0], { clamp: true });

  return (
    <EditableSection pageKey="landing" sectionKey="hero" sectionTitle="হিরো ব্যানার (Hero Banner)">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden palette-depth">
        {/* Parallax Background Image / Video */}
        <motion.div className="absolute inset-0" style={{ y: bgY, transformOrigin: "center top" }}>
          {editMode ? (
            <EditableImage
              pageKey="landing"
              sectionKey="hero"
              elementKey="bg_image"
              defaultSrc={activeHeroImage}
              folder="hero"
              alt="Bengali cultural heritage landscape"
              className="w-full h-[125%] object-cover object-center"
              containerClassName="w-full h-full"
            />
          ) : isVideoMedia(activeHeroImage) ? (
            <video
              src={activeHeroImage}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[125%] object-cover object-center"
            />
          ) : (
            <img
              src={activeHeroImage}
              alt="Bengali cultural heritage landscape"
              className="w-full h-[125%] object-cover object-center"
              width={1920}
              height={960}
            />
          )}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/8" />
        </motion.div>

        {/* Dynamic Scroll Darken Blend Veil (Clean at scroll 0, darkens smoothly on scroll) */}
        <motion.div
          className="absolute inset-0 bg-background pointer-events-none z-[1]"
          style={{ opacity: heroBlendDarken }}
        />

        {/* Deep Bottom Feathered Gradient Blend (Dissolves bottom into next section seamlessly) */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 md:h-80 bg-gradient-to-t from-background via-background/80 via-background/25 to-transparent pointer-events-none z-[2]" />

        {/* Top Header Subtle Shadow Blend */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/70 via-background/20 to-transparent pointer-events-none z-[2]" />

        {/* Floating cultural motifs with depth layers */}
        <motion.img
          src={alponaMotif}
          alt=""
          className="absolute top-16 right-8 w-40 h-40 opacity-[0.03] pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          loading="lazy"
          width={512}
          height={512}
        />
        <motion.img
          src={alponaMotif}
          alt=""
          className="absolute bottom-24 left-8 w-32 h-32 opacity-[0.03] pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          loading="lazy"
          width={512}
          height={512}
        />

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
              background: i % 2 === 0 ? "hsl(var(--gold))" : "hsl(var(--accent))",
              opacity: 0.15 + (i % 3) * 0.1,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Top bar with quick links */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoTile size="md" glow="off" dilateRadius={3} />
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/home"
                className="inline-flex items-center justify-center px-5 h-9 text-xs sm:text-sm font-semibold rounded-full bg-white/10 dark:bg-black/35 backdrop-blur-xl text-foreground/85 hover:text-foreground hover:bg-white/20 dark:hover:bg-black/50 transition-all border border-white/15 hover:border-white/25 shadow-sm leading-none text-center"
              >
                <span>{t("home")}</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 h-9 text-xs sm:text-sm font-semibold rounded-full bg-primary/85 backdrop-blur-xl text-primary-foreground hover:bg-primary transition-all border border-white/20 shadow-md shadow-primary/25 leading-none text-center"
              >
                <span>{t("joinUs")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content with pure scroll-driven fade out */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20"
          style={{ y: textY, opacity: contentOpacity }}
        >
          {/* Top Tagline */}
          <div className="mb-4">
            <EditableText
              pageKey="landing"
              sectionKey="hero"
              elementKey="tagline"
              defaultBn="বাং লা  সং স্কৃ তি র  পা দ পী ঠ"
              defaultEn="THE CRADLE OF BENGALI CULTURE"
              as="p"
              className="text-cyan-400 text-sm md:text-base tracking-[0.35em] uppercase font-semibold"
            />
          </div>

          {/* Single-Row Hero Title */}
          <h1
            className="font-bengali text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-5 leading-tight tracking-tight drop-shadow-xl"
            style={{ textShadow: "0 4px 30px hsl(var(--primary) / 0.18)" }}
          >
            <EditableText
              pageKey="landing"
              sectionKey="hero"
              elementKey="title_full"
              defaultBn="ফরিদপুর সাহিত্য পরিষদ"
              defaultEn="Faridpur Shahitto Parishad"
              as="span"
            />
          </h1>

          {/* Established 1975 Vintage Heritage Folded Ribbon Banner */}
          <div className="flex justify-center mb-6">
            <HeritageRibbon
              textBn="প্রতিষ্ঠিত  ১৯৭৫"
              textEn="ESTD  1975"
              className="w-[300px] sm:w-[350px] md:w-[390px] h-[66px] sm:h-[76px] md:h-[84px]"
            />
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mb-6 font-bengali leading-relaxed text-center">
            <EditableText
              pageKey="landing"
              sectionKey="hero"
              elementKey="subtitle"
              defaultBn="সাহিত্য, সংস্কৃতি ও জ্ঞানচর্চার মাধ্যমে বাংলার ঐতিহ্য সংরক্ষণ ও বিকাশে নিবেদিত"
              defaultEn="Dedicated to preserving and developing the heritage of Bengal through literature, culture and pursuit of knowledge"
              multiline
              as="span"
            />
          </p>

          {/* Visitor Counter (Clean text, perfectly centered) */}
          <div className="inline-flex items-center justify-center px-7 py-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 mb-10 shadow-inner">
            <span className="text-foreground/90 text-xs md:text-sm font-medium tracking-wide">
              <span className="font-bold text-cyan-400">10000</span>{" "}
              <EditableText
                pageKey="landing"
                sectionKey="hero"
                elementKey="visitors_badge"
                defaultBn="জন পরিদর্শক"
                defaultEn="Visitors"
                as="span"
              />
            </span>
          </div>

          {/* Symmetrical 3-Button Action Cluster */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-3xl mx-auto">
            {/* Left Button (Foreshadow Frosted Glass: About) */}
            <a
              href="#about"
              className="w-full sm:w-[210px] md:w-[220px] h-[50px] rounded-full bg-white/5 dark:bg-card/40 backdrop-blur-xl border border-white/10 text-foreground/85 font-semibold font-bengali shadow-md hover:bg-white/12 dark:hover:bg-card/70 hover:text-foreground hover:border-white/25 transition-all duration-300 flex items-center justify-center text-sm md:text-base text-center px-4"
            >
              <EditableText
                pageKey="landing"
                sectionKey="hero"
                elementKey="cta_about"
                defaultBn="আমাদের সম্পর্কে জানুন"
                defaultEn="Learn About Us"
                as="span"
              />
            </a>

            {/* Center Main Button (Sleek Frosted Glass Hero: Home) */}
            <Link
              to="/home"
              className="w-full sm:w-[220px] md:w-[230px] h-[50px] rounded-full bg-primary/85 hover:bg-primary backdrop-blur-2xl border border-white/25 text-primary-foreground font-semibold font-bengali shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center text-sm md:text-base group text-center px-4"
            >
              <Home className="w-4 h-4 text-primary-foreground/90 group-hover:scale-110 transition-transform duration-300" />
              <EditableText
                pageKey="landing"
                sectionKey="hero"
                elementKey="cta_home"
                defaultBn="হোম পেজ দেখুন"
                defaultEn="Explore Home"
                as="span"
              />
            </Link>

            {/* Right Button (Foreshadow Frosted Glass: Members) */}
            <Link
              to="/members"
              className="w-full sm:w-[210px] md:w-[220px] h-[50px] rounded-full bg-white/5 dark:bg-card/40 backdrop-blur-xl border border-white/10 text-foreground/85 font-semibold font-bengali shadow-md hover:bg-white/12 dark:hover:bg-card/70 hover:text-foreground hover:border-white/25 transition-all duration-300 flex items-center justify-center text-sm md:text-base text-center px-4"
            >
              <EditableText
                pageKey="landing"
                sectionKey="hero"
                elementKey="cta_members"
                defaultBn="সদস্যবৃন্দ দেখুন"
                defaultEn="View Members"
                as="span"
              />
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ opacity: chevronOpacity }}
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/40" />
        </motion.div>
      </div>
    </EditableSection>
  );
};

export default HeroSection;
