import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, ArrowRight, Star, AlertCircle, BookOpen, Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/lib/slugify";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import SeoHead from "@/components/SeoHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Banner {
  id: string;
  tag: string;
  tag_en: string;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  image_url: string;
  link_url: string;
}

const BannerSlider = ({ slides, loading }: { slides: Banner[]; loading: boolean }) => {
  const [current, setCurrent] = useState(0);
  const { lang } = useLanguage();

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="relative h-40 md:h-56 lg:h-72 bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="w-full max-w-2xl space-y-3">
            <Skeleton className="h-4 w-24 mx-auto rounded-full" />
            <Skeleton className="h-8 md:h-12 w-3/4 mx-auto rounded-full" />
            <Skeleton className="h-4 w-1/2 mx-auto rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[current];
  const Wrapper: any = slide.link_url ? Link : "div";
  const wrapperProps = slide.link_url ? { to: slide.link_url } : {};

  return (
    <div className="relative h-40 md:h-56 lg:h-72 bg-hero-gradient overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {slide.image_url && (
            <img src={slide.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          )}
          <Wrapper
            {...wrapperProps}
            className="relative z-10 h-full flex items-center justify-center text-center px-8"
          >
            <div>
              {(slide.tag || slide.tag_en) && (
                <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] md:text-xs font-semibold mb-2 font-bengali">
                  {lang === "en" && slide.tag_en ? slide.tag_en : slide.tag}
                </span>
              )}
              <h2 className="font-bengali text-lg md:text-2xl lg:text-4xl font-bold text-primary-foreground mb-1 drop-shadow-lg">
                {lang === "en" && slide.title_en ? slide.title_en : slide.title}
              </h2>
              {(slide.subtitle || slide.subtitle_en) && (
                <p className="font-bengali text-primary-foreground/70 text-xs md:text-sm">
                  {lang === "en" && slide.subtitle_en ? slide.subtitle_en : slide.subtitle}
                </p>
              )}
            </div>
          </Wrapper>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      {slides.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md text-primary-foreground hover:bg-background/40 items-center justify-center transition-all border border-primary-foreground/10 shadow-lg z-20"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md text-primary-foreground hover:bg-background/40 items-center justify-center transition-all border border-primary-foreground/10 shadow-lg z-20"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-primary-foreground/30 w-1.5"}`} />))}
          </div>
        </>
      )}
    </div>
  );
};

const NoticesSkeleton = () => (
  <div className="bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-3 md:p-5 depth-card nakshi-border">
    <div className="flex items-center gap-2 mb-3"><Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" /><Skeleton className="h-4 w-24 rounded-full" /></div>
    <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded-lg" />)}</div>
  </div>
);

const PostsGridSkeleton = () => (
  <div className="flex flex-wrap justify-center gap-3 md:gap-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="w-[calc(50%-6px)] md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden">
        <Skeleton className="h-20 md:h-32 w-full rounded-none" />
        <div className="p-2.5 md:p-4 space-y-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const EventsGridSkeleton = () => (
  <div className="flex flex-wrap justify-center gap-3 md:gap-5">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="w-full md:w-[calc(50%-10px)] bg-card rounded-2xl md:rounded-3xl border border-border p-4 md:p-6 space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
      </div>
    ))}
  </div>
);

const SectionHeader = ({ icon: Icon, label, link }: { icon: any; label: string; link: string }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-3 md:mb-6">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center"><Icon className="w-3 h-3 md:w-4 md:h-4 text-primary" /></div>
        <h2 className="font-bengali text-lg md:text-2xl font-bold text-foreground">{label}</h2>
      </div>
      <Link to={link} className="text-xs md:text-sm text-primary hover:underline font-bengali flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">{t("viewAll")} <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
    </div>
  );
};

const HomePage = () => {
  const { t, lang } = useLanguage();

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["home-banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("home_banners")
        .select("id,tag,tag_en,title,title_en,subtitle,subtitle_en,image_url,link_url")
        .eq("is_active", true)
        .order("sort_order");
      return (data as Banner[]) || [];
    },
  });

  const { data: latestPosts = [], isLoading: postsLoading } = useQuery({
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

  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
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
      <SeoHead />
      <MainNav />
      <BannerSlider slides={banners} loading={bannersLoading} />
      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-12">
        {/* Notices */}
        {postsLoading ? (
          <NoticesSkeleton />
        ) : latestPosts.length > 0 ? (
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
            </div>
          </motion.div>
        ) : null}

        {/* Latest Posts */}
        <section>
          <SectionHeader icon={BookOpen} label={t("latestPosts")} link="/blog" />
          {postsLoading ? (
            <PostsGridSkeleton />
          ) : latestPosts.length === 0 ? (
            <p className="font-bengali text-muted-foreground py-8 text-center">{t("noPosts")}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 md:gap-5">
              {latestPosts.map((post: any, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="w-[calc(50%-6px)] md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                  <Link to={`/blog/${createSlug(post.title_en || post.title, post.id)}`} className="block bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden depth-card-3d group">
                    <div className="h-20 md:h-32 bg-muted/40 flex items-center justify-center relative overflow-hidden">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-muted-foreground/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                    </div>
                    <div className="p-2.5 md:p-4">
                      {post.category && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] md:text-xs font-semibold">{t(post.category) || post.category}</span>
                      )}
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
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <SectionHeader icon={Calendar} label={t("upcomingEvents")} link="/events" />
          {eventsLoading ? (
            <EventsGridSkeleton />
          ) : upcomingEvents.length === 0 ? (
            <p className="font-bengali text-muted-foreground py-8 text-center">{t("noEvents")}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 md:gap-5">
              {upcomingEvents.map((event: any) => (
                <Link to={`/events/${createSlug(event.title_en || event.title, event.id)}`} key={event.id} className="block w-full md:w-[calc(50%-10px)]">
                  <motion.div whileHover={{ y: -4 }} className="bg-card rounded-2xl md:rounded-3xl border border-border p-3 md:p-6 depth-card group h-full">
                    {event.tag && (
                      <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] md:text-xs font-semibold mb-2 md:mb-3 ${event.tag_color || "bg-primary text-primary-foreground"}`}>
                        {t(event.tag) || event.tag}
                      </span>
                    )}
                    <h3 className="font-bengali text-sm md:text-lg font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                      {lang === "en" && event.title_en ? event.title_en : event.title}
                    </h3>
                    {event.title_en && lang === "bn" && (
                      <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">{event.title_en}</p>
                    )}
                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      {event.date && <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80"><Calendar className="w-3 h-3 text-accent" />{event.date}</span>}
                      {event.time && <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80"><Clock className="w-3 h-3 text-accent" />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-secondary/80 hidden md:flex"><MapPin className="w-3 h-3 text-accent" />{event.location}</span>}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
