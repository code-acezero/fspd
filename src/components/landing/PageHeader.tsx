// PageHeader — reusable hero header for secondary pages (about, members, blog, events, courses).
// Reads its config from the per-page `page_hero` block via SectionConfig.

import { motion } from "framer-motion";
import { useSectionBlock } from "@/hooks/useSectionBlock";

interface PageHeaderProps {
  page: string;                                  // "about" | "members" | "blog" | ...
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackEyebrow?: string;
}

const PageHeader = ({ page, fallbackTitle, fallbackSubtitle = "", fallbackEyebrow = "" }: PageHeaderProps) => {
  const block = useSectionBlock(
    "page_hero",
    { eyebrow: fallbackEyebrow, title: fallbackTitle, subtitle: fallbackSubtitle },
    page,
  );
  if (block.hideForVisitors) return null;
  const { cfg, texts, classes, styles, animDur, animEnabled } = block;

  return (
    <section
      style={styles.section}
      className={`bg-hero-gradient ${classes.spacing} relative overflow-hidden`}
    >
      {cfg.show.decorations && <div className="absolute inset-0 alpona-pattern opacity-20" />}
      <div className={`container mx-auto px-4 lg:px-8 relative flex flex-col ${classes.align}`}>
        {cfg.show.eyebrow && texts.eyebrow && (
          <motion.p
            initial={animEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: animDur }}
            className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3"
            style={styles.eyebrow}
          >
            {texts.eyebrow}
          </motion.p>
        )}
        {cfg.show.title && texts.title && (
          <motion.h1
            initial={animEnabled ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animDur }}
            className={`font-bengali ${classes.titleSize} font-bold text-primary-foreground mb-4 drop-shadow-lg`}
            style={styles.title}
          >
            {texts.title}
          </motion.h1>
        )}
        {cfg.show.subtitle && texts.subtitle && (
          <motion.p
            initial={animEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: animDur, delay: 0.1 }}
            className="font-bengali text-primary-foreground/80 max-w-2xl text-lg"
          >
            {texts.subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
