import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Calendar, GraduationCap, Users, ArrowLeft, Loader2 } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts, events as mockEvents, courses as mockCourses } from "@/data/mockData";
import { createSlug } from "@/lib/slugify";

interface SearchResult {
  type: "post" | "event" | "course" | "member";
  id: string;
  title: string;
  subtitle: string;
  link: string;
  icon: typeof BookOpen;
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t, lang } = useLanguage();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    performSearch(query.trim());
  }, [query, lang]);

  const performSearch = async (q: string) => {
    setLoading(true);
    const lower = q.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search DB posts
    try {
      const { data: posts } = await supabase.from("posts").select("*").eq("published", true);
      if (posts) {
        posts.forEach((p) => {
          if (p.title.toLowerCase().includes(lower) || p.title_en.toLowerCase().includes(lower) || p.content.toLowerCase().includes(lower) || p.excerpt.toLowerCase().includes(lower)) {
            const title = lang === "en" && p.title_en ? p.title_en : p.title;
            allResults.push({ type: "post", id: p.id, title, subtitle: p.category, link: `/blog/${createSlug(p.title_en || p.title, p.id)}`, icon: BookOpen });
          }
        });
      }
    } catch {}

    // Search DB events
    try {
      const { data: evts } = await supabase.from("events").select("*");
      if (evts) {
        evts.forEach((e) => {
          if (e.title.toLowerCase().includes(lower) || e.title_en.toLowerCase().includes(lower) || e.description.toLowerCase().includes(lower)) {
            const title = lang === "en" && e.title_en ? e.title_en : e.title;
            allResults.push({ type: "event", id: e.id, title, subtitle: e.date, link: `/events/${createSlug(e.title_en || e.title, e.id)}`, icon: Calendar });
          }
        });
      }
    } catch {}

    // Search members
    try {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, display_name, position, position_en, avatar_url");
      if (profiles) {
        profiles.forEach((p) => {
          if (p.full_name.toLowerCase().includes(lower) || p.display_name.toLowerCase().includes(lower) || p.position.toLowerCase().includes(lower)) {
            allResults.push({ type: "member", id: p.id, title: p.full_name || p.display_name, subtitle: p.position || "", link: `/profile/${p.id}`, icon: Users });
          }
        });
      }
    } catch {}

    // Search mock posts (fallback)
    if (allResults.filter(r => r.type === "post").length === 0) {
      blogPosts.forEach((p) => {
        if (p.title.toLowerCase().includes(lower) || p.titleEn.toLowerCase().includes(lower)) {
          allResults.push({ type: "post", id: p.id, title: lang === "en" ? p.titleEn : p.title, subtitle: p.category, link: `/blog/${p.id}`, icon: BookOpen });
        }
      });
    }

    // Search mock events (fallback)
    if (allResults.filter(r => r.type === "event").length === 0) {
      mockEvents.forEach((e) => {
        if (e.title.toLowerCase().includes(lower) || e.titleEn.toLowerCase().includes(lower)) {
          allResults.push({ type: "event", id: e.id, title: lang === "en" ? e.titleEn : e.title, subtitle: e.date, link: `/events/${e.id}`, icon: Calendar });
        }
      });
    }

    // Search courses (mock only for now)
    mockCourses.forEach((c) => {
      if (c.title.toLowerCase().includes(lower) || c.titleEn.toLowerCase().includes(lower)) {
        allResults.push({ type: "course", id: c.id, title: lang === "en" ? c.titleEn : c.title, subtitle: lang === "en" ? c.instructorEn : c.instructor, link: `/courses/${c.id}`, icon: GraduationCap });
      }
    });

    setResults(allResults);
    setLoading(false);
  };

  const typeLabels: Record<string, string> = {
    post: t("blog"),
    event: t("events"),
    course: t("courses"),
    member: t("members"),
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-10 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <h1 className="font-bengali text-2xl md:text-4xl font-bold text-primary-foreground mb-2 drop-shadow-lg">{t("searchResults")}</h1>
          <p className="font-bengali text-primary-foreground/70 text-sm">"{query}" — {results.length} {t("resultsFound")}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link to="/home" className="inline-flex items-center gap-2 text-primary hover:underline text-sm mb-6 font-bengali"><ArrowLeft className="w-4 h-4" /> {t("backToHome")}</Link>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-bengali text-muted-foreground">{query ? t("noSearchResults") : t("searchPrompt")}</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {results.map((r, i) => (
              <motion.div key={`${r.type}-${r.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={r.link} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all group depth-card">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <r.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bengali text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-bengali shrink-0">{typeLabels[r.type]}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
