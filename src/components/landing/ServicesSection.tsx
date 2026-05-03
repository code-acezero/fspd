import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSectionBlock } from "@/hooks/useSectionBlock";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { DEFAULT_SERVICES_ITEMS, type ServicesItem } from "@/lib/pageBlocks";

const ServicesSection = () => {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const block = useSectionBlock("services", {
    eyebrow: t("ourActivities"),
    title: t("servicesTitle"),
  });
  const { getServices } = usePageBlocks();
  const servicesCfg = getServices();
  if (block.hideForVisitors) return null;
  const { cfg, texts, classes, styles, animDur, animEnabled } = block;

  // Use CMS items if defined, otherwise defaults.
  const rawItems: ServicesItem[] = servicesCfg.items ?? DEFAULT_SERVICES_ITEMS;
  const items = rawItems.filter((it) => it.visible !== false);

  return (
    <section id="services" ref={ref} style={styles.section} className={`${classes.spacing} bg-background relative overflow-hidden`}>
      {cfg.show.decorations && (
        <motion.div style={{ y }} className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-accent/3 to-transparent rounded-full blur-3xl" />
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
          {cfg.show.subtitle && texts.subtitle && (
            <p className="text-muted-foreground max-w-2xl text-lg font-bengali mb-6">{texts.subtitle}</p>
          )}
          {cfg.show.divider && (
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" style={{ perspective: "1200px" }}>
          {items.map((service, index) => {
            const Icon = (LucideIcons as any)[service.icon] || LucideIcons.BookOpen;
            const titleMain = lang === "en" ? (service.title_en || service.title_bn) : (service.title_bn || service.title_en);
            const titleAlt = lang === "en" ? service.title_bn : service.title_en;
            const desc = lang === "en" ? (service.desc_en || service.desc_bn) : (service.desc_bn || service.desc_en);
            return (
              <motion.div
                key={service.id}
                initial={animEnabled ? { opacity: 0, y: 30, rotateY: -5 } : false}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: animDur * 0.6, delay: index * 0.08 }}
                whileHover={{ y: -8, rotateY: 3, scale: 1.02 }}
                className="group relative bg-card rounded-2xl p-7 border border-border overflow-hidden shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-accent/8 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bengali text-lg font-bold text-foreground mb-1">{titleMain}</h3>
                {titleAlt && <p className="text-xs text-accent font-medium mb-3">{titleAlt}</p>}
                <p className="font-bengali text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
