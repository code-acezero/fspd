import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Share2, Play, Calendar, User, Loader2 } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromSlug } from "@/lib/slugify";

const BlogReaderPage = () => {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatingContent, setTranslatingContent] = useState(false);

  const shortId = slug ? extractIdFromSlug(slug) : "";

  const { data: dbPost, isLoading } = useQuery({
    queryKey: ["post", shortId],
    queryFn: async () => {
      if (!shortId) return null;
      const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shortId);
      if (isFullUuid) {
        const { data, error } = await supabase.from("posts").select("*").eq("id", shortId).maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("posts").select("*").eq("published", true);
      if (error) throw error;
      return (data || []).find((p) => p.id.toLowerCase().startsWith(shortId.toLowerCase())) || null;
    },
    enabled: !!shortId,
    retry: false,
  });

  const TAG_EN: Record<string, string> = {
    "রবীন্দ্রনাথ": "Rabindranath", "বাংলা সাহিত্য": "Bengali Literature", "কবিতা": "Poetry",
    "ফরিদপুর": "Faridpur", "লোকসংস্কৃতি": "Folk Culture", "ঐতিহ্য": "Heritage",
    "আধুনিক সাহিত্য": "Modern Literature", "নাটক": "Drama", "থিয়েটার": "Theatre",
    "সংস্কৃতি": "Culture", "বৈশাখ": "Boishakh", "উৎসব": "Festival",
  };

  const post = dbPost
    ? {
        id: dbPost.id,
        title: dbPost.title,
        titleEn: dbPost.title_en,
        excerpt: dbPost.excerpt,
        content: dbPost.content,
        author: t("fspAuthor"),
        date: new Date(dbPost.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US"),
        category: dbPost.category,
        tags: dbPost.tags || [],
        youtubeUrl: dbPost.youtube_url,
        rating: 4.5,
        featured: dbPost.featured,
      }
    : null;

  const translateText = useCallback(async (text: string, targetLang: "en" | "bn") => {
    try {
      const { data, error } = await supabase.functions.invoke("translate", { body: { text, targetLang } });
      if (error) throw error;
      return data?.translatedText || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const sourceContent = dbPost?.content ?? "";
    if (lang === "en" && sourceContent) {
      const isBengali = /[\u0980-\u09FF]/.test(sourceContent);
      if (isBengali) {
        setTranslatingContent(true);
        translateText(sourceContent, "en").then((translated) => {
          setTranslatedContent(translated);
          setTranslatingContent(false);
        });
        return;
      }
    }
    setTranslatedContent(null);
  }, [lang, dbPost, translateText]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="font-bengali text-xl text-muted-foreground mb-4">{t("postNotFound")}</p>
            <Link to="/blog" className="text-primary hover:underline font-bengali px-6 py-2 rounded-full bg-primary/10">{t("backToBlog")}</Link>
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = lang === "en" && post.titleEn ? post.titleEn : post.title;
  const displayContent = translatedContent || post.content;
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-10 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 font-bengali px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all"><ArrowLeft className="w-4 h-4" /> {t("backToBlog")}</Link>
          <div className="max-w-3xl">
            <span className="px-4 py-1 rounded-full bg-gold/20 text-gold text-sm font-semibold">{t(post.category) || post.category}</span>
            <h1 className="font-bengali text-2xl md:text-4xl font-bold text-primary-foreground mt-3 mb-3 drop-shadow-lg">{displayTitle}</h1>
            {post.titleEn && lang === "bn" && <p className="text-primary-foreground/60 text-sm mb-4">{post.titleEn}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><User className="w-3.5 h-3.5" />{post.author}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Star className="w-3.5 h-3.5 text-gold" />{post.rating}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          {translatingContent && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t("translatingContent")}</div>
          )}
          <article className="prose prose-lg max-w-none mb-10">
            {displayContent.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("## ")) return <h2 key={i} className="font-bengali text-2xl font-bold text-foreground mt-8 mb-4">{paragraph.replace("## ", "")}</h2>;
              return <p key={i} className="font-bengali text-foreground/80 leading-relaxed mb-4">{paragraph}</p>;
            })}
          </article>
          {post.youtubeUrl && (
            <div className="mb-10">
              <h3 className="font-bengali text-xl font-bold text-foreground mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Play className="w-4 h-4 text-primary" /></div>{t("relatedVideo")}</h3>
              <div className="aspect-video rounded-3xl overflow-hidden bg-card border border-border depth-card"><iframe src={post.youtubeUrl} title={displayTitle} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-8">{post.tags.map((tag: string) => (<span key={tag} className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bengali hover:bg-secondary/80 transition-colors">{lang === "en" ? (TAG_EN[tag] ?? (t(tag) || tag)) : tag}</span>))}</div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-card rounded-3xl border border-border mb-10 depth-card nakshi-border">
            <div>
              <p className="font-bengali text-sm text-muted-foreground mb-2">{t("rateThisPost")}</p>
              <div className="flex gap-1">{[1,2,3,4,5].map((star) => (<button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setUserRating(star)} className="transition-transform hover:scale-125"><Star className={`w-6 h-6 ${(hoverRating || userRating) >= star ? "text-gold fill-gold" : "text-muted-foreground/30"}`} /></button>))}</div>
            </div>
            <div className="relative">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 font-bengali transition-all"><Share2 className="w-4 h-4" /> {t("sharePost")}</button>
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
      <Footer />
    </div>
  );
};

export default BlogReaderPage;
