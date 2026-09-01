import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MemberCard, { type MemberCardData } from "@/components/members/MemberCard";
import EditableText from "@/components/editor/EditableText";
import EditableSection from "@/components/editor/EditableSection";

type Member = MemberCardData & { id: string };

const MembersSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yReverse = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("members")
        .select("id, name, name_en, title, title_en, bio, bio_en, avatar_url, gradient_class, role")
        .eq("is_senior", true)
        .order("sort_order", { ascending: true });
      if (data) setMembers(data as Member[]);
    })();
  }, []);

  useEffect(() => {
    if (members.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % members.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [members.length]);

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + members.length) % members.length);
    const adjustedDiff = normalizedDiff > members.length / 2 ? normalizedDiff - members.length : normalizedDiff;

    const angle = adjustedDiff * 45;
    const radius = 300;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const scale = 0.65 + (z + radius) / (2 * radius) * 0.35;
    const opacity = Math.abs(adjustedDiff) > 2 ? 0 : 0.35 + (z + radius) / (2 * radius) * 0.65;
    const rotateY = -angle * 0.65;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: Math.round(z + radius),
    };
  };

  if (members.length === 0) return null;

  return (
    <EditableSection
      pageKey="landing"
      sectionKey="members"
      sectionTitle="নেতৃত্ব ও জ্যেষ্ঠ সদস্যবৃন্দ (Leadership & Members)"
    >
      {/* Seamless Section Blending Container with 100% Symmetrical Left-Right Color Gradient */}
      <div
        ref={containerRef}
        className="py-14 md:py-18 relative overflow-hidden bg-gradient-to-b from-background via-card/25 to-background border-y border-border/20"
      >
        {/* 100% Symmetrical Ambient Center Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[900px] h-[380px] md:h-[480px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,hsl(var(--primary)/0.04)_50%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
        
        {/* Symmetrical Left & Right Identical Tone Spotlights */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none -translate-x-1/3" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none translate-x-1/3" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <EditableText
              pageKey="landing"
              sectionKey="members"
              elementKey="badge"
              defaultBn={t("ourLeadership") || "আমাদের নেতৃত্ব"}
              defaultEn="Our Leadership"
              as="p"
              className="text-accent text-sm tracking-[0.25em] uppercase font-semibold mb-2"
            />
            <EditableText
              pageKey="landing"
              sectionKey="members"
              elementKey="title"
              defaultBn={t("seniorMembers") || "জ্যেষ্ঠ ও নির্বাহী সদস্যবৃন্দ"}
              defaultEn="Senior & Executive Members"
              as="h2"
              className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-4"
            />

          </motion.div>

          {/* 3D Cylinder Carousel with Clean, Symmetrical Full-Bleed ID Cards */}
          <div
            className="relative h-[340px] md:h-[370px] flex items-start justify-center pt-6 md:pt-8"
            style={{ perspective: "1400px" }}
          >
            <div className="relative w-full max-w-xl mx-auto" style={{ transformStyle: "preserve-3d" }}>
              <AnimatePresence>
                {members.map((member, index) => {
                  const style = getCardStyle(index);
                  return (
                    <motion.div
                      key={member.id}
                      className="absolute left-1/2 top-0 -ml-28 w-56 md:w-64 md:-ml-32 cursor-pointer"
                      animate={{ x: 0, ...style }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      onClick={() => setActiveIndex(index)}
                      style={{ transformStyle: "preserve-3d", zIndex: style.zIndex }}
                    >
                      <MemberCard
                        member={member}
                        variant="carousel"
                        active={index === activeIndex}
                        bioMaxChars={120}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Carousel Indicator Dots with Balanced Spacing */}
          <div className="flex justify-center gap-2 mt-8 md:mt-10 relative z-20">
            {members.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-accent w-8 shadow-sm shadow-accent/50"
                    : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </EditableSection>
  );
};

export default MembersSection;
