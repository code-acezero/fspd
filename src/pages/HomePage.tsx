import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, ArrowRight, Star, MessageSquare, AlertCircle, BookOpen, Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/lib/slugify";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const BannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  const slides = [
    { tag: t("bannerTag1"), title: t("bannerTitle1"), subtitle: t("bannerSub1") },
    { tag: t("bannerTag2"), title: t("bannerTitle2"), subtitle: t("bannerSub2") },
    { tag: t("bannerTag3"), title: t("bannerTitle3"), subtitle: t("bannerSub3") },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-40 md:h-56 lg:h-72 bg-hero-gradient overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center text-center px-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] md:text-xs font-semibold mb-2 font-bengali">{slides[current].tag}</span>
            <h2 className="font-bengali text-lg md:text-2xl lg:text-4xl font-bold text-primary-foreground mb-1 drop-shadow-lg">{slides[current].title}</h2>
            <p className="font-bengali text-primary-foreground/70 text-xs md:text-sm">{slides[current].subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md text-primary-foreground hover:bg-background/40 items-center justify-center transition-all border border-primary-foreground/10 shadow-lg"><ChevronLeft className="w-5 h-5" /></button>
      <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md text-primary-foreground hover:bg-background/40 items-center justify-center transition-all border border-primary-foreground/10 shadow-lg"><ChevronRight className="w-5 h-5" /></button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:hidden">
        <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="p-1 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm"><ChevronLeft className="w-3.5 h-3.5" /></button>
        {slides.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-primary-foreground/30 w-1.5"}`} />))}
        <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="p-1 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2">
        {slides.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-primary-foreground/30 w-1.5"}`} />))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const { t, lang } = useLanguage();

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["home-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id,title,title_en,category,created_at,featured,cover_image")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,title_en,date,time,location,tag,tag_color")
        .order("created_at", { ascending: false })
        .limit(2);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <BannerSlider />
      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-3 md:p-5 depth-card nakshi-border">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center"><Megaphone className="w-3 h-3 md:w-4 md:h-4 text-primary" /></div>
            <h3 className="font-bengali font-bold text-sm md:text-base text-foreground">{t("notices")}</h3>
          </div>
          <div className="space-y-2">
            {latestPosts.slice(0, 3).map((p: any) => (
              <Link to={`/blog/${createSlug(p.title_en || p.title, p.id)}`} key={p.id} className="flex items-center justify-between py-1.5 md:py-2 border-b border-border last:border-0 hover:bg-muted/40 px-2 rounded-lg">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 shrink-0 text-accent" />
                  <span className="font-bengali text-xs md:text-sm text-foreground truncate">{lang === "en" && p.title_en ? p.title_en : p.title}</span>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground shrink-0 ml-4">{new Date(p.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</span>
              </Link>
            ))}
            {latestPosts.length === 0 && (
              <p className="text-xs text-muted-foreground font-bengali text-center py-2">{t("noPosts")}</p>
            )}
          </div>
        </motion.div>

        <section>
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center"><BookOpen className="w-3 h-3 md:w-4 md:h-4 text-primary" /></div>
              <h2 className="font-bengali text-lg md:text-2xl font-bold text-foreground">{t("latestPosts")}</h2>
            </div>
            <Link to="/blog" className="text-xs md:text-sm text-primary hover:underline font-bengali flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">{t("viewAll")} <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-5">
            {latestPosts.map((post: any, index) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="w-[calc(50%-6px)] md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                <Link to={`/blog/${createSlug(post.title_en || post.title, post.id)}`} className="block bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden depth-card-3d group">
                  <div className="h-20 md:h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-primary/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                  </div>
                  <div className="p-2.5 md:p-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] md:text-xs font-semibold">{t(post.category) || post.category}</span>
                    <h3 className="font-bengali text-xs md:text-sm font-bold text-foreground mt-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                      {lang === "en" && post.title_en ? post.title_en : post.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] md:text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</span>
                      {post.featured && <Star className="w-3 h-3 text-gold" />}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {latestPosts.length === 0 && (
              <p className="font-bengali text-muted-foreground py-8">{t("noPosts")}</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center"><Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary" /></div>
              <h2 className="font-bengali text-lg md:text-2xl font-bold text-foreground">{t("upcomingEvents")}</h2>
            </div>
            <Link to="/events" className="text-xs md:text-sm text-primary hover:underline font-bengali flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">{t("viewAll")} <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-5">
            {upcomingEvents.map((event: any) => (
              <Link to={`/events/${createSlug(event.title_en || event.title, event.id)}`} key={event.id} className="block w-full md:w-[calc(50%-10px)]">
                <motion.div whileHover={{ y: -4 }} className="bg-card rounded-2xl md:rounded-3xl border border-border p-3 md:p-6 depth-card group h-full">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] md:text-xs font-semibold mb-2 md:mb-3 ${event.tag_color}`}>
                    {t(event.tag) || event.tag}
                  </span>
                  <h3 className="font-bengali text-sm md:text-lg font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                    {lang === "en" && event.title_en ? event.title_en : event.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">{lang === "en" ? event.title : event.title_en}</p>
                  <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80"><Calendar className="w-3 h-3 text-accent" />{event.date}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80"><Clock className="w-3 h-3 text-accent" />{event.time}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80 hidden md:flex"><MapPin className="w-3 h-3 text-accent" />{event.location}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="font-bengali text-muted-foreground py-8">{t("noEvents")}</p>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
