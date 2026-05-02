import { motion } from "framer-motion";
import { GraduationCap, Clock, BookOpen, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { courses } from "@/data/mockData";
import { createSlug } from "@/lib/slugify";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const CoursesPage = () => {
  const { t, lang } = useLanguage();

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: t("statusOpen"), color: "bg-forest text-primary-foreground" },
    ongoing: { label: t("statusOngoing"), color: "bg-accent text-accent-foreground" },
    coming_soon: { label: t("statusComingSoon"), color: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <h1 className="font-bengali text-3xl md:text-5xl font-bold text-primary-foreground mb-4 drop-shadow-lg">{t("allCourses")}</h1>
          <p className="font-bengali text-primary-foreground/70 max-w-lg mx-auto">{t("coursesSubtitle")}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap justify-center gap-6">
          {courses.map((course, index) => {
            const status = statusLabels[course.status];
            return (
              <Link to={`/courses/${createSlug(course.titleEn || course.title, course.id)}`} key={course.id} className="block w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }} className="bg-card rounded-3xl border border-border overflow-hidden depth-card-3d group h-full">
                <div className="h-36 bg-gradient-to-br from-primary/15 to-forest/15 flex items-center justify-center relative"><GraduationCap className="w-12 h-12 text-primary/30" /><div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" /></div>
                <div className="p-6">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 ${status.color}`}>{status.label}</span>
                  <h3 className="font-bengali text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {lang === "en" ? course.titleEn : course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">{lang === "en" ? course.title : course.titleEn}</p>
                  <p className="font-bengali text-sm text-muted-foreground mb-4">{lang === "en" ? course.descriptionEn : course.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80"><Clock className="w-3.5 h-3.5" />{lang === "en" ? course.durationEn : course.duration}</span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80"><BookOpen className="w-3.5 h-3.5" />{course.modules} {t("modules")}</span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80"><Users className="w-3.5 h-3.5" />{course.enrolled} {t("enrolled")}</span>
                  </div>
                  <div className="space-y-1.5 mb-5">{(lang === "en" ? course.highlightsEn : course.highlights).map((h) => (<div key={h} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle className="w-3.5 h-3.5 text-forest shrink-0" /><span className="font-bengali">{h}</span></div>))}</div>
                  {course.status === "open" && (<button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-crimson-dark transition-colors font-bengali shadow-md shadow-primary/20">{t("register")}</button>)}
                </div>
              </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;
