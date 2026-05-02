import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Mic2, GraduationCap, Palette, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const services = [
    { icon: BookOpen, title: t("svcLitPub"), titleEn: "Literary Publications", desc: t("svcLitPubDesc") },
    { icon: Mic2, title: t("svcCultural"), titleEn: "Cultural Events", desc: t("svcCulturalDesc") },
    { icon: GraduationCap, title: t("svcEducation"), titleEn: "Educational Programs", desc: t("svcEducationDesc") },
    { icon: Palette, title: t("svcArts"), titleEn: "Arts & Crafts", desc: t("svcArtsDesc") },
    { icon: Globe, title: t("svcCommunity"), titleEn: "Community Development", desc: t("svcCommunityDesc") },
    { icon: Heart, title: t("svcHeritage"), titleEn: "Heritage Preservation", desc: t("svcHeritageDesc") },
  ];

  return (
    <section id="services" ref={ref} className="py-24 bg-background relative overflow-hidden">
      <motion.div style={{ y }} className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-accent/3 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3">{t("ourActivities")}</p>
          <h2 className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-6">{t("servicesTitle")}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" style={{ perspective: "1200px" }}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, rotateY: -5 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, rotateY: 3, scale: 1.02 }}
              className="group relative bg-card rounded-2xl p-7 border border-border overflow-hidden shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-accent/8 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bengali text-lg font-bold text-foreground mb-1">{service.title}</h3>
              <p className="text-xs text-accent font-medium mb-3">{service.titleEn}</p>
              <p className="font-bengali text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
