import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Loader2,
  Image as ImageLucide,
  FileText,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  FileEdit
} from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { extractIdFromSlug, createSlug } from "@/lib/slugify";
import EventGalleryModal, { EventGalleryItem } from "@/components/events/EventGalleryModal";
import CorrectionRequestModal from "@/components/common/CorrectionRequestModal";

const EventDetailPage = () => {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

  const shortId = slug ? extractIdFromSlug(slug) : "";

  // Fetch Event Data
  const { data: dbEvent, isLoading } = useQuery({
    queryKey: ["event", shortId],
    queryFn: async () => {
      if (!shortId) return null;
      const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shortId);
      if (isFullUuid) {
        const { data, error } = await supabase.from("events").select("*").eq("id", shortId).maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      return (data || []).find((e) => e.id.toLowerCase().startsWith(shortId.toLowerCase())) || null;
    },
    enabled: !!shortId,
    retry: false,
  });

  // Fetch Connected Gallery Items
  const { data: galleryItems = [] } = useQuery<EventGalleryItem[]>({
    queryKey: ["event-gallery", dbEvent?.id],
    queryFn: async () => {
      if (!dbEvent?.id) return [];
      const { data, error } = await supabase
        .from("site_assets")
        .select("id, name, image_url, created_at")
        .eq("slot", `event:${dbEvent.id}`);
      if (error) return [];
      return data || [];
    },
    enabled: !!dbEvent?.id,
  });

  // Fetch Connected Posts
  const { data: connectedPosts = [] } = useQuery({
    queryKey: ["event-posts", dbEvent?.id],
    queryFn: async () => {
      if (!dbEvent?.id) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, title_en, cover_image, excerpt")
        .contains("tags", [`event:${dbEvent.id}`])
        .eq("published", true);
      if (error) return [];
      return data || [];
    },
    enabled: !!dbEvent?.id,
  });

  const event = dbEvent
    ? {
        id: dbEvent.id,
        title: dbEvent.title,
        titleEn: dbEvent.title_en,
        date: dbEvent.date,
        time: dbEvent.time,
        location: dbEvent.location,
        description: dbEvent.description,
        tag: dbEvent.tag,
        tagColor: dbEvent.tag_color,
      }
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="font-bengali text-xl text-muted-foreground mb-4">{t("eventNotFound")}</p>
            <Link to="/events" className="text-primary hover:underline font-bengali px-6 py-2 rounded-full bg-primary/10">{t("backToEvents")}</Link>
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = lang === "en" && event.titleEn ? event.titleEn : event.title;
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Header Banner */}
      <div className="bg-hero-gradient py-12 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 font-bengali px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> {t("backToEvents")}
          </Link>
          <div className="max-w-3xl">
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${event.tagColor}`}>{t(event.tag) || event.tag}</span>
            <h1 className="font-bengali text-2xl md:text-4xl font-bold text-primary-foreground mt-2 mb-3 drop-shadow-lg">{displayTitle}</h1>
            {event.titleEn && lang === "bn" && <p className="text-primary-foreground/60 text-sm mb-4">{event.titleEn}</p>}
            {event.title && lang === "en" && <p className="text-primary-foreground/60 text-sm mb-4">{event.title}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Calendar className="w-3.5 h-3.5" />{t(event.date) || event.date}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><Clock className="w-3.5 h-3.5" />{t(event.time) || event.time}</span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm"><MapPin className="w-3.5 h-3.5" />{t(event.location) || event.location}</span>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-xs font-semibold backdrop-blur-sm transition-all font-bengali shadow-xs"
                title={lang === "en" ? "Suggest Correction / Update" : "তথ্য সংশোধনের আবেদন জানান"}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Suggest Correction" : "সংশোধনের আবেদন"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Description */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border p-6 md:p-10 depth-card space-y-6">
            <h2 className="font-bengali text-xl font-bold text-foreground">{t("eventDetails")}</h2>
            <p className="font-bengali text-foreground/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {t(event.description) || event.description}
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("date")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{t(event.date) || event.date}</p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("time")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{t(event.time) || event.time}</p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <MapPin className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bengali">{t("location")}</p>
                <p className="text-sm font-semibold text-foreground font-bengali">{t(event.location) || event.location}</p>
              </div>
            </div>
          </motion.article>

          {/* ── Interconnectivity Section: Event Gallery & Connected Post ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Event Gallery Button Card */}
            {galleryItems.length > 0 && (
              <div className="p-6 rounded-3xl bg-card border border-primary/30 depth-card flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold font-bengali text-primary flex items-center gap-1.5">
                    <ImageLucide className="w-4 h-4" />
                    ইভেন্ট ফটো ও ভিডিও অ্যালবাম
                  </span>
                  <h4 className="font-bengali font-bold text-base text-foreground">
                    অনুষ্ঠানের স্মরণীয় মুহূর্তসমূহ ({galleryItems.length}টি মিডিয়া)
                  </h4>
                  <p className="text-xs text-muted-foreground font-bengali">
                    অনুষ্ঠানে ধারণকৃত সকল ছবি এবং ভিডিও হাই-রেজোলিউশনে উপভোগ করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/25 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <ImageLucide className="w-4 h-4" />
                  <span>ইভেন্ট গ্যালারি দেখুন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Connected Blog Post Card */}
            {connectedPosts.length > 0 && (
              <div className="p-6 rounded-3xl bg-card border border-border depth-card flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold font-bengali text-accent flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    অনুষ্ঠান সংক্রান্ত নিবন্ধ / প্রতিবেদন
                  </span>
                  <h4 className="font-bengali font-bold text-base text-foreground truncate">
                    {connectedPosts[0].title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-bengali line-clamp-2">
                    {connectedPosts[0].excerpt}
                  </p>
                </div>

                <Link
                  to={`/blog/${createSlug(connectedPosts[0].title_en || connectedPosts[0].title, connectedPosts[0].id)}`}
                  className="w-full py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bengali font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>সম্পূর্ণ প্রতিবেদন পড়ুন</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Share Action */}
          <div className="flex justify-end pt-4">
            <div className="relative">
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

      {/* Event Gallery Lightbox Modal */}
      <EventGalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        eventTitle={displayTitle}
        eventDate={event.date}
        items={galleryItems}
      />

      {/* Suggest Correction Modal */}
      {correctionModalOpen && (
        <CorrectionRequestModal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          targetType="event"
          targetId={dbEvent ? dbEvent.id : (event ? event.id : "")}
          targetTitle={displayTitle}
        />
      )}

      <Footer />
    </div>
  );
};

export default EventDetailPage;
