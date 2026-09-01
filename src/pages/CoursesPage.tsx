import { motion } from "framer-motion";
import { GraduationCap, Clock, BookOpen, Users, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as mockCourses } from "@/data/mockData";
import { createSlug } from "@/lib/slugify";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import EditableText from "@/components/editor/EditableText";
import EditableSection from "@/components/editor/EditableSection";

export interface CourseData {
  id: string;
  title: string;
  titleEn: string;
  instructor: string;
  instructorEn: string;
  duration: string;
  durationEn: string;
  modules: number;
  enrolled: number;
  status: "open" | "ongoing" | "coming_soon";
  description: string;
  descriptionEn: string;
  highlights: string[];
  highlightsEn: string[];
  cover_image?: string;
}

const CoursesPage = () => {
  const { t, lang } = useLanguage();

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: t("statusOpen") || "নিবন্ধন চলছে", color: "bg-forest text-primary-foreground" },
    ongoing: { label: t("statusOngoing") || "চলমান", color: "bg-accent text-accent-foreground" },
    coming_soon: { label: t("statusComingSoon") || "শীঘ্রই আসছে", color: "bg-muted text-muted-foreground" },
  };

  const { data: dbCourses = [], isLoading } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return mockCourses.map((c) => ({
          id: c.id,
          title: c.title,
          titleEn: c.titleEn,
          instructor: c.instructor,
          instructorEn: c.instructorEn,
          duration: c.duration,
          durationEn: c.durationEn,
          modules: c.modules,
          enrolled: c.enrolled,
          status: c.status as "open" | "ongoing" | "coming_soon",
          description: c.description,
          descriptionEn: c.descriptionEn,
          highlights: c.highlights,
          highlightsEn: c.highlightsEn,
        }));
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        title: row.title,
        titleEn: row.title_en || row.title,
        instructor: row.instructor,
        instructorEn: row.instructor_en || row.instructor,
        duration: row.duration,
        durationEn: row.duration_en || row.duration,
        modules: row.modules || 0,
        enrolled: row.enrolled || 0,
        status: (row.status || "open") as "open" | "ongoing" | "coming_soon",
        description: row.description || "",
        descriptionEn: row.description_en || row.description || "",
        highlights: Array.isArray(row.highlights) ? row.highlights : [],
        highlightsEn: Array.isArray(row.highlights_en) ? row.highlights_en : (Array.isArray(row.highlights) ? row.highlights : []),
        cover_image: row.cover_image,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <EditableSection pageKey="courses" sectionKey="header" sectionTitle="কোর্স পেজ হেডার (Courses Header)">
        <div className="bg-hero-gradient py-16 relative overflow-hidden">
          <div className="absolute inset-0 alpona-pattern opacity-20" />
          <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <EditableText
              pageKey="courses"
              sectionKey="header"
              elementKey="title"
              defaultBn={t("allCourses") || "সকল কোর্স ও কর্মশালা"}
              defaultEn="All Courses & Workshops"
              as="h1"
              className="font-bengali text-3xl md:text-5xl font-bold text-primary-foreground mb-4 drop-shadow-lg block"
            />
            <EditableText
              pageKey="courses"
              sectionKey="header"
              elementKey="subtitle"
              defaultBn={t("coursesSubtitle") || "সাহিত্য, ভাষা ও সংস্কৃতির উপর বিশেষায়িত পাঠ্যক্রম"}
              defaultEn="Specialized courses on Bengali literature, language, and arts"
              as="p"
              className="font-bengali text-primary-foreground/70 max-w-lg mx-auto block"
            />
          </div>
        </div>
      </EditableSection>

      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-bengali">কোর্সসমূহ লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {dbCourses.map((course, index) => {
              const status = statusLabels[course.status] || statusLabels.open;
              return (
                <Link
                  to={`/courses/${createSlug(course.titleEn || course.title, course.id)}`}
                  key={course.id}
                  className="block w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-card rounded-3xl border border-border overflow-hidden depth-card-3d group h-full"
                  >
                    <div className="h-36 bg-gradient-to-br from-primary/15 to-forest/15 flex items-center justify-center relative">
                      {course.cover_image ? (
                        <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <GraduationCap className="w-12 h-12 text-primary/30" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
                    </div>
                    <div className="p-6">
                      <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 ${status.color}`}>
                        {status.label}
                      </span>
                      <h3 className="font-bengali text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {lang === "en" ? course.titleEn : course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {lang === "en" ? course.title : course.titleEn}
                      </p>
                      <p className="font-bengali text-sm text-muted-foreground mb-4 line-clamp-2">
                        {lang === "en" ? course.descriptionEn : course.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80">
                          <Clock className="w-3.5 h-3.5" />
                          {lang === "en" ? course.durationEn : course.duration}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.modules} {t("modules")}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80">
                          <Users className="w-3.5 h-3.5" />
                          {course.enrolled} {t("enrolled")}
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-5">
                        {(lang === "en" ? course.highlightsEn : course.highlights).slice(0, 3).map((h) => (
                          <div key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="w-3.5 h-3.5 text-forest shrink-0" />
                            <span className="font-bengali truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                      {course.status === "open" && (
                        <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-crimson-dark transition-colors font-bengali shadow-md shadow-primary/20">
                          {t("register")}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;
