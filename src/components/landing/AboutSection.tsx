import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSectionBlock } from "@/hooks/useSectionBlock";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { DEFAULT_ABOUT_STATS } from "@/lib/pageBlocks";

const AboutSection = () => {
  const { t, lang } = useLanguage();
  const { getAbout } = usePageBlocks();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateCard = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -3]);

  const block = useSectionBlock("about", {
    eyebrow: t("aboutIdentity"),
    title: t("aboutTitle"),
    subtitle: t("aboutDesc"),
  });
  if (block.hideForVisitors) return null;
  const { cfg, texts, classes, styles, animDur, animEnabled } = block;

  // Resolve stat tiles: CMS-defined stats > DEFAULT_ABOUT_STATS (which mirror the original hardcoded list)
  const aboutCfg = getAbout();
  const cmsStats = (aboutCfg.stats ?? DEFAULT_ABOUT_STATS).filter((s) => s.visible !== false);
  const stats = cmsStats.map((s) => {
    const Icon = (LucideIcons as any)[s.icon] || LucideIcons.Star;
    const labelFromKey = (key: string) => { try { return t(key); } catch { return ""; } };
    // back-compat: if labels empty, fall back to translation key by stat id
    const fallbackKey = ({ pubs: "publications", memb: "activeMembers", events: "annualEvents", years: "yearsLegacy" } as Record<string, string>)[s.id] ?? "";
    const label = lang === "en"
      ? (s.label_en || s.label_bn || (fallbackKey ? labelFromKey(fallbackKey) : ""))
      : (s.label_bn || s.label_en || (fallbackKey ? labelFromKey(fallbackKey) : ""));
    return { Icon, value: s.value, label };
  });

  return (
    <section id="about" ref={ref} style={styles.section} className={`${classes.spacing} bg-warm-gradient relative overflow-hidden`}>
      {cfg.show.decorations && (
        <>
          <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={animEnabled ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: animDur }}
          className={`mb-16 flex flex-col ${classes.align}`}
        >
          {cfg.show.eyebrow && texts.eyebrow && (
            <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3" style={styles.eyebrow}>{texts.eyebrow}</p>
          )}
          {cfg.show.title && texts.title && (
            <h2 className={`font-bengali ${classes.titleSize} font-bold text-foreground mb-6`} style={styles.title}>{texts.title}</h2>
          )}
          {cfg.show.divider && (
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full mb-6" />
          )}
          {cfg.show.subtitle && texts.subtitle && (
            <p className="text-muted-foreground max-w-2xl text-lg font-bengali">{texts.subtitle}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6" style={{ perspective: "1000px" }}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={animEnabled ? { opacity: 0, y: 40, rotateX: 10 } : false}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: animDur * 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, rotateY: 5, scale: 1.03 }}
              style={{ rotateX: rotateCard }}
              className="bg-card rounded-2xl p-6 lg:p-8 text-center border border-border group shadow-lg shadow-foreground/[0.03] hover:shadow-xl hover:shadow-primary/10 transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="font-bengali text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="font-bengali text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
