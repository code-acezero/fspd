import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Star, MessageSquare, Filter, Loader2 } from "lucide-react";
// Mock fallback removed — only DB posts.
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import PageHeader from "@/components/landing/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/lib/slugify";



const BlogListPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("সব");
  const { t, lang } = useLanguage();

  const { data: dbPosts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const allPosts = (dbPosts || []).map((p) => ({
    id: p.id,
    title: p.title,
    titleEn: p.title_en,
    excerpt: p.excerpt,
    excerptEn: (p as any).excerpt_en || "",
    content: p.content,
    author: t("editorialBoard"),
    date: new Date(p.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US"),
    category: p.category,
    tags: p.tags,
    youtubeUrl: p.youtube_url,
    coverImage: (p as any).cover_image || "",
    rating: 0,
    ratingCount: 0,
    commentCount: 0,
    featured: p.featured,
  }));

  const categoryKeys = ["catAll", "catLiterature", "catCulture", "catDrama", "catFestival"];
  const categoryValues = ["সব", "সাহিত্য", "সংস্কৃতি", "নাটক", "উৎসব"];

  const filtered = allPosts.filter((post) => {
    const matchSearch = post.title.includes(search) || post.titleEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "সব" || post.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <PageHeader page="blog" fallbackTitle={t("blogAndPosts")} fallbackSubtitle={t("blogSubtitle")} />
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("blogSearchPlaceholder")} className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-sm text-foreground font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 depth-card" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Filter className="w-4 h-4 text-muted-foreground" /></div>
            {categoryKeys.map((catKey, i) => (
              <button key={catKey} onClick={() => setActiveCategory(categoryValues[i])} className={`px-5 py-2 rounded-full text-sm font-bengali whitespace-nowrap transition-all ${activeCategory === categoryValues[i] ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t(catKey)}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {filtered.map((post, index) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <Link to={`/blog/${createSlug(post.titleEn || post.title, post.id)}`} className="block bg-card rounded-3xl border border-border overflow-hidden depth-card-3d group h-full">
                  <div className="h-40 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center relative overflow-hidden">
                    {(post as any).coverImage ? (
                      <img src={(post as any).coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-primary/30" />
                    )}
                    {post.featured && (<span className="absolute top-3 left-3 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">{t("featured")}</span>)}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">{lang === "en" ? ({"সাহিত্য":"Literature","সংস্কৃতি":"Culture","নাটক":"Drama","উৎসব":"Festival","ইতিহাস":"History","সংবাদ":"News","কবিতা":"Poetry","গল্প":"Story"}[post.category] || post.category) : post.category}</span>
                      <span className="text-xs text-muted-foreground">• {t(post.date) || post.date}</span>
                    </div>
                    <h3 className="font-bengali text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{lang === "en" && post.titleEn ? post.titleEn : post.title}</h3>
                    <p className="font-bengali text-sm text-muted-foreground line-clamp-2 mb-4">{lang === "en" && (post as any).excerptEn ? (post as any).excerptEn : post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-bengali">{t(post.author) || post.author}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-accent" />{post.rating}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16"><BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="font-bengali text-muted-foreground">{t("noPosts")}</p></div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogListPage;
