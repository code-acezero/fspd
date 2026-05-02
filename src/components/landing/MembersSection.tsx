import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MemberCard, { type MemberCardData } from "@/components/members/MemberCard";

type Member = MemberCardData & { id: string };

const MembersSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yReverse = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

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

  if (members.length === 0) return null;

  return (
    <section id="members" ref={containerRef} className="pt-14 pb-10 bg-hero-gradient relative overflow-hidden">
      <motion.div style={{ y }} className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <motion.div style={{ y: yReverse }} className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
          <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-2">{t("ourLeadership")}</p>
          <h2 className="font-bengali text-3xl md:text-5xl font-bold text-primary-foreground mb-3 drop-shadow-lg">{t("seniorMembers")}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full" />
        </motion.div>

        {/* 3D Cylinder Carousel */}
        <div className="relative h-[240px] md:h-[280px] flex items-start justify-center pt-2" style={{ perspective: "1200px" }}>
          <div className="relative w-full max-w-lg mx-auto" style={{ transformStyle: "preserve-3d" }}>
            <AnimatePresence>
              {members.map((member, index) => {
                const style = getCardStyle(index);
                return (
                  <motion.div
                    key={member.id}
                    className="absolute left-1/2 top-0 w-44 -ml-22 md:w-56 md:-ml-28 cursor-pointer"
                    animate={{ x: 0, ...style }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    onClick={() => setActiveIndex(index)}
                    style={{ transformStyle: "preserve-3d", zIndex: style.zIndex }}
                  >
                    <MemberCard member={member} variant="carousel" active={index === activeIndex} bioMaxChars={120} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-2 relative z-10">
          {members.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-accent w-8" : "bg-primary-foreground/20 w-2 hover:bg-primary-foreground/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembersSection;
