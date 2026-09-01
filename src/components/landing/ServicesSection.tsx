import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Mic2, GraduationCap, Palette, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/editor/EditableText";
import EditableSection from "@/components/editor/EditableSection";

const ServicesSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const services = [
    {
      key: "svc_lit",
      icon: BookOpen,
      title: t("svcLitPub") || "সাহিত্য ও প্রকাশনা",
      titleEn: "Literary Publications",
      desc: t("svcLitPubDesc") || "নিয়মিত সাহিত্য পত্রিকা, স্মারকগ্রন্থ ও গ্রন্থ প্রকাশনা।",
      descEn: "Publishing poetry, stories, novels, essays, and organizing reading circles.",
    },
    {
      key: "svc_cultural",
      icon: Mic2,
      title: t("svcCultural") || "সাংস্কৃতিক অনুষ্ঠান",
      titleEn: "Cultural Events",
      desc: t("svcCulturalDesc") || "বার্ষিক সাহিত্য উৎসব, কবিতা পাঠের আসর ও নাট্যোৎসব।",
      descEn: "Annual literary festivals, poetry recitation evenings, and drama performances.",
    },
    {
      key: "svc_edu",
      icon: GraduationCap,
      title: t("svcEducation") || "শিক্ষা ও প্রশিক্ষণ",
      titleEn: "Educational Programs",
      desc: t("svcEducationDesc") || "সৃজনশীল লেখালেখি ও ভাষা শিক্ষা কর্মশালা।",
      descEn: "Workshops on creative writing, literary skills, and language education.",
    },
    {
      key: "svc_arts",
      icon: Palette,
      title: t("svcArts") || "চারুকলা ও ঐতিহ্য",
      titleEn: "Arts & Crafts",
      desc: t("svcArtsDesc") || "নকশিকাঁথা, লোকশিল্প ও আলপনা প্রদর্শনী।",
      descEn: "Exhibitions and workshops celebrating Nakshi Kantha, folk art, and alpona.",
    },
    {
      key: "svc_comm",
      icon: Globe,
      title: t("svcCommunity") || "সামাজিক কার্যক্রম",
      titleEn: "Community Development",
      desc: t("svcCommunityDesc") || "গুণীজন সংবর্ধনা ও নতুন প্রতিভার পৃষ্ঠপোষকতা।",
      descEn: "Honoring distinguished cultural figures and nurturing promising new talents.",
    },
    {
      key: "svc_heritage",
      icon: Heart,
      title: t("svcHeritage") || "ঐতিহ্য সংরক্ষণ",
      titleEn: "Heritage Preservation",
      desc: t("svcHeritageDesc") || "ফরিদপুরের ইতিহাস, মুক্তিযুদ্ধ ও লোকসাহিত্য সংরক্ষণ।",
      descEn: "Preserving and archiving Faridpur's history, liberation war lore, and folklore.",
    },
  ];

  return (
    <EditableSection pageKey="landing" sectionKey="services" sectionTitle="আমাদের কর্মযজ্ঞ (Activities & Services)">
      <div ref={ref} className="py-24 bg-background relative overflow-hidden">
        <motion.div style={{ y }} className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-accent/3 to-transparent rounded-full blur-3xl" />

        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <EditableText
              pageKey="landing"
              sectionKey="services"
              elementKey="badge"
              defaultBn={t("ourActivities") || "আমাদের কার্যক্রম"}
              defaultEn="Our Activities"
              as="p"
              className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3"
            />
            <EditableText
              pageKey="landing"
              sectionKey="services"
              elementKey="title"
              defaultBn={t("servicesTitle") || "সাহিত্য ও সংস্কৃতির অনন্য ক্ষেত্র"}
              defaultEn="A Unique Sphere of Literature & Culture"
              as="h2"
              className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-6"
            />

          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" style={{ perspective: "1200px" }}>
            {services.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 30, rotateY: -5 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, rotateY: 3, scale: 1.02 }}
                className="group relative bg-card rounded-2xl p-7 border border-border overflow-hidden shadow-sm transition-all"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-accent/8 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <EditableText
                  pageKey="landing"
                  sectionKey="services"
                  elementKey={`${service.key}_title`}
                  defaultBn={service.title}
                  defaultEn={service.titleEn}
                  as="h3"
                  className="font-bengali text-lg font-bold text-foreground mb-1 block"
                />
                <EditableText
                  pageKey="landing"
                  sectionKey="services"
                  elementKey={`${service.key}_sub`}
                  defaultBn={service.titleEn}
                  defaultEn={service.titleEn}
                  as="p"
                  className="text-xs text-accent font-medium mb-3 block"
                />
                <EditableText
                  pageKey="landing"
                  sectionKey="services"
                  elementKey={`${service.key}_desc`}
                  defaultBn={service.desc}
                  defaultEn={service.descEn}
                  multiline
                  as="p"
                  className="font-bengali text-sm text-muted-foreground leading-relaxed block"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </EditableSection>
  );
};

export default ServicesSection;
