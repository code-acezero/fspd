import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Users, Calendar, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/editor/EditableText";
import EditableSection from "@/components/editor/EditableSection";

const AboutSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateCard = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -3]);

  const stats = [
    { key: "stat_pub", icon: BookOpen, defaultVal: "৫০০+", defaultLabelBn: t("publications") || "প্রকাশনা", defaultLabelEn: "Publications" },
    { key: "stat_members", icon: Users, defaultVal: "২,৫০০+", defaultLabelBn: t("activeMembers") || "সক্রিয় সদস্য", defaultLabelEn: "Active Members" },
    { key: "stat_events", icon: Calendar, defaultVal: "১৫০+", defaultLabelBn: t("annualEvents") || "বার্ষিক অনুষ্ঠান", defaultLabelEn: "Annual Events" },
    { key: "stat_legacy", icon: Award, defaultVal: "৫০+", defaultLabelBn: t("yearsLegacy") || "বছরের ঐতিহ্য", defaultLabelEn: "Years Legacy" },
  ];

  return (
    <EditableSection pageKey="landing" sectionKey="about" sectionTitle="পরিচিতি ও পরিসংখ্যান (About & Stats)">
      <div ref={ref} className="py-24 bg-warm-gradient relative overflow-hidden">
        {/* Seamless Section Transition Blending Gradients */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/60 to-transparent pointer-events-none z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-[1]" />

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
            <EditableText
              pageKey="landing"
              sectionKey="about"
              elementKey="badge"
              defaultBn={t("aboutIdentity") || "আমাদের পরিচিতি"}
              defaultEn="Our Identity"
              as="p"
              className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3"
            />
            <EditableText
              pageKey="landing"
              sectionKey="about"
              elementKey="title"
              defaultBn={t("aboutTitle") || "ফরিদপুর সাহিত্য পরিষদ"}
              defaultEn="Faridpur Shahitto Parishad"
              as="h2"
              className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-6"
            />

            <EditableText
              pageKey="landing"
              sectionKey="about"
              elementKey="description"
              defaultBn={t("aboutDesc") || "বাংলা সাহিত্যের ঐতিহ্য সংরক্ষণ, নতুন প্রতিভার বিকাশ এবং সাংস্কৃতিক মেলবন্ধন তৈরির লক্ষ্যে আমরা নিরলসভাবে কাজ করে যাচ্ছি।"}
              defaultEn="Working tirelessly to preserve Bengali literary heritage, nurture new talents and foster cultural harmony."
              multiline
              as="p"
              className="text-muted-foreground max-w-2xl mx-auto text-lg font-bengali"
            />
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6" style={{ perspective: "1000px" }}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, rotateY: 5, scale: 1.03 }}
                style={{ rotateX: rotateCard }}
                className="bg-card rounded-2xl p-6 lg:p-8 text-center border border-border group shadow-sm transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <EditableText
                  pageKey="landing"
                  sectionKey="about"
                  elementKey={`${stat.key}_val`}
                  defaultBn={stat.defaultVal}
                  defaultEn={stat.defaultVal}
                  as="p"
                  className="font-bengali text-3xl lg:text-4xl font-bold text-foreground mb-1"
                />
                <EditableText
                  pageKey="landing"
                  sectionKey="about"
                  elementKey={`${stat.key}_label`}
                  defaultBn={stat.defaultLabelBn}
                  defaultEn={stat.defaultLabelEn}
                  as="p"
                  className="font-bengali text-sm text-muted-foreground"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </EditableSection>
  );
};

export default AboutSection;
