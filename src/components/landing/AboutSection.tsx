import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Users, Calendar, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateCard = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -3]);

  const stats = [
    { icon: BookOpen, value: "৫০০+", label: t("publications") },
    { icon: Users, value: "২,৫০০+", label: t("activeMembers") },
    { icon: Calendar, value: "১৫০+", label: t("annualEvents") },
    { icon: Award, value: "৫০+", label: t("yearsLegacy") },
  ];

  return (
    <section id="about" ref={ref} className="py-24 bg-warm-gradient relative overflow-hidden">
      {/* Parallax decorative blobs */}
      <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl" />
      <motion.div style={{ y: y2 }} className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3">{t("aboutIdentity")}</p>
          <h2 className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-6">{t("aboutTitle")}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-bengali">{t("aboutDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6" style={{ perspective: "1000px" }}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
