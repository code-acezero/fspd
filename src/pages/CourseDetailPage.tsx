import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Clock, BookOpen, Users, CheckCircle, Share2, Loader2 } from "lucide-react";
import { courses as mockCourses } from "@/data/mockData";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { extractIdFromSlug } from "@/lib/slugify";
import CourseRegisterDialog from "@/components/courses/CourseRegisterDialog";

const CourseDetailPage = () => {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Support slug-based, direct ID, or trailing-numeric-id formats.
  const shortId = slug ? extractIdFromSlug(slug) : "";
  const trailingNumeric = slug ? (slug.match(/-(\d+)$/)?.[1] ?? "") : "";
  const course = mockCourses.find((c) => c.id === slug || c.id === shortId || c.id === trailingNumeric);

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: t("statusOpen"), color: "bg-forest text-primary-foreground" },
    ongoing: { label: t("statusOngoing"), color: "bg-accent text-accent-foreground" },
    coming_soon: { label: t("statusComingSoon"), color: "bg-muted text-muted-foreground" },
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="font-bengali text-xl text-muted-foreground mb-4">{t("courseNotFound")}</p>
            <Link to="/courses" className="text-primary hover:underline font-bengali px-6 py-2 rounded-full bg-primary/10">{t("backToCourses")}</Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusLabels[course.status];
  const displayTitle = lang === "en" ? course.titleEn : course.title;
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-10 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <Link to="/courses" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 font-bengali px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> {t("backToCourses")}
          </Link>
          <div className="max-w-3xl">
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${status.color}`}>{status.label}</span>
            <h1 className="font-bengali text-2xl md:text-4xl font-bold text-primary-foreground mt-2 mb-3 drop-shadow-lg">{displayTitle}</h1>
            <p className="text-primary-foreground/60 text-sm mb-4">{lang === "en" ? course.title : course.titleEn}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><GraduationCap className="w-3.5 h-3.5" />{lang === "en" ? course.instructorEn : course.instructor}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Clock className="w-3.5 h-3.5" />{lang === "en" ? course.durationEn : course.duration}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><BookOpen className="w-3.5 h-3.5" />{course.modules} {t("modules")}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Users className="w-3.5 h-3.5" />{course.enrolled} {t("enrolled")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border p-6 md:p-10 depth-card mb-8">
            <h2 className="font-bengali text-xl font-bold text-foreground mb-4">{t("courseDescription")}</h2>
            <p className="font-bengali text-foreground/80 leading-relaxed mb-8">{lang === "en" ? course.descriptionEn : course.description}</p>

            <h3 className="font-bengali text-lg font-bold text-foreground mb-4">{t("courseHighlights")}</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {(lang === "en" ? course.highlightsEn : course.highlights).map((h) => (
                <div key={h} className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-4">
                  <CheckCircle className="w-5 h-5 text-forest shrink-0" />
                  <span className="font-bengali text-sm text-foreground">{h}</span>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("duration")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{lang === "en" ? course.durationEn : course.duration}</p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <BookOpen className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("totalModules")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{course.modules}</p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("totalEnrolled")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{course.enrolled}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            {course.status === "open" && (
              <button onClick={() => setRegisterOpen(true)} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-crimson-dark transition-colors font-bengali shadow-md shadow-primary/20">
                {t("register")}
              </button>
            )}
            <div className="relative ml-auto">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 font-bengali transition-all">
                <Share2 className="w-4 h-4" /> {t("sharePost")}
              </button>
              {showShareMenu && (
                <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-xl p-3 z-10 min-w-[160px] depth-card">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-xl">Facebook</a>
                  <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${displayTitle}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-xl">Twitter / X</a>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); setShowShareMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-xl font-bengali">{t("copyLink")}</button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CourseRegisterDialog courseId={course.id} courseTitle={displayTitle} open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
