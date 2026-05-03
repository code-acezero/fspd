import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MemberCard, { type MemberCardData } from "@/components/members/MemberCard";
import { useSectionBlock } from "@/hooks/useSectionBlock";

type Member = MemberCardData & { id: string };

const MembersSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yReverse = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

  const block = useSectionBlock("members", {
    eyebrow: t("ourLeadership"),
    title: t("seniorMembers"),
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("members")
        .select("id, name, name_en, title, title_en, bio, bio_en, avatar_url, gradient_class")
        .eq("is_senior", true)
        .order("sort_order", { ascending: true });
      if (data) setMembers(data as Member[]);
    })();
  }, []);

  useEffect(() => {
    if (members.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % members.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [members.length]);

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + members.length) % members.length);
    const adjustedDiff = normalizedDiff > members.length / 2 ? normalizedDiff - members.length : normalizedDiff;

    const angle = adjustedDiff * 50;
    const radius = 220;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const scale = 0.55 + (z + radius) / (2 * radius) * 0.45;
    const opacity = Math.abs(adjustedDiff) > 2 ? 0 : 0.3 + (z + radius) / (2 * radius) * 0.7;
    const rotateY = -angle * 0.6;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: Math.round(z + radius),
    };
  };

  if (block.hideForVisitors) return null;
  if (members.length === 0 && !block.visible) return null;
  const { cfg, texts, classes, styles, animDur, animEnabled } = block;

  return (
    <section id="members" ref={containerRef} style={styles.section} className={`pt-14 pb-10 ${classes.spacing} bg-hero-gradient relative overflow-hidden`}>
      {cfg.show.decorations && (
        <>
          <motion.div style={{ y }} className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <motion.div style={{ y: yReverse }} className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={animEnabled ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: animDur }}
          className={`mb-4 flex flex-col ${classes.align}`}
        >
          {cfg.show.eyebrow && texts.eyebrow && (
            <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-2" style={styles.eyebrow}>{texts.eyebrow}</p>
          )}
          {cfg.show.title && texts.title && (
            <h2 className={`font-bengali ${classes.titleSize} font-bold text-primary-foreground mb-3 drop-shadow-lg`} style={styles.title}>{texts.title}</h2>
          )}
          {cfg.show.subtitle && texts.subtitle && (
            <p className="text-primary-foreground/70 max-w-2xl text-base font-bengali mb-3">{texts.subtitle}</p>
          )}
          {cfg.show.divider && <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />}
        </motion.div>

        {members.length === 0 ? (
          <p className="text-center text-sm text-primary-foreground/60 italic py-8">No senior members yet.</p>
        ) : (
          <>
            <div className="relative h-[240px] md:h-[280px] flex items-start justify-center pt-2" style={{ perspective: "1200px" }}>
              <div className="relative w-full max-w-lg mx-auto" style={{ transformStyle: "preserve-3d" }}>
                <AnimatePresence>
                  {members.map((member, index) => {
                    const st = getCardStyle(index);
                    return (
                      <motion.div
                        key={member.id}
                        className="absolute left-1/2 top-0 w-44 -ml-22 md:w-56 md:-ml-28 cursor-pointer"
                        animate={{ x: 0, ...st }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        onClick={() => setActiveIndex(index)}
                        style={{ transformStyle: "preserve-3d", zIndex: st.zIndex }}
                      >
                        <MemberCard member={member} variant="carousel" active={index === activeIndex} bioMaxChars={120} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-2 relative z-10">
              {members.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-accent w-8" : "bg-primary-foreground/20 w-2 hover:bg-primary-foreground/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MembersSection;
