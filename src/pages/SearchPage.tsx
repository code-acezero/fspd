import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Calendar, GraduationCap, Users, ArrowLeft, Loader2 } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { courses as mockCourses } from "@/data/mockData";
import { createSlug } from "@/lib/slugify";
import EditableSection from "@/components/editor/EditableSection";
import EditableText from "@/components/editor/EditableText";

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
      <EditableSection pageKey="search" sectionKey="header" sectionTitle="অনুসন্ধান পেজ হেডার (Search Header)">
        <div className="bg-hero-gradient py-10 relative overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center relative">
            <EditableText
              pageKey="search"
              sectionKey="header"
              elementKey="title"
              defaultBn="অনুসন্ধান ফলাফল"
              defaultEn="Search Results"
              as="h1"
              className="font-bengali text-2xl md:text-3xl font-bold text-primary-foreground mb-2 block"
            />
            {query && (
              <p className="font-bengali text-primary-foreground/70 text-sm">
                "{query}" {t("searchResultsFor")}
              </p>
            )}
          </div>
        </div>
      </EditableSection>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border p-8 depth-card">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-bengali text-muted-foreground mb-2">
              {query ? t("noResultsFound") : "কিছু অনুসন্ধান করতে লিখুন..."}
            </p>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-bengali mt-2">
              <ArrowLeft className="w-4 h-4" /> {t("backToHome")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-bengali">{results.length}টি ফলাফল পাওয়া গেছে</p>
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <Link to={r.link} key={`${r.type}-${r.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all depth-card group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">{typeLabels[r.type]}</span>
                      <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                    </div>
                    <h3 className="font-bengali font-bold text-foreground truncate group-hover:text-primary transition-colors">{r.title}</h3>
                  </div>
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

export default SearchPage;
