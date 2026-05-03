import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// Mock fallback removed — only DB events.
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import PageHeader from "@/components/landing/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/lib/slugify";

const EventsPage = () => {
  const { t, lang } = useLanguage();

  const { data: dbEvents, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const events = (dbEvents || []).map((e) => ({
    id: e.id,
    title: e.title,
    titleEn: e.title_en,
    date: e.date,
    time: e.time,
    location: e.location,
    description: e.description,
    tag: e.tag,
    tagColor: e.tag_color,
    coverImage: (e as any).cover_image || "",
  }));

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <PageHeader page="events" fallbackTitle={t("allEvents")} fallbackSubtitle={t("eventsPageSubtitle")} />
      <div className="container mx-auto px-4 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16"><Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="font-bengali text-muted-foreground">{t("noEvents")}</p></div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {events.map((event, index) => (
              <Link to={`/events/${createSlug(event.titleEn || event.title, event.id)}`} key={event.id} className="block w-full md:w-[calc(50%-12px)]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }} className="bg-card rounded-3xl border border-border overflow-hidden depth-card-3d group h-full">
                <div className="h-40 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center relative"><Calendar className="w-12 h-12 text-primary/30" /><div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" /></div>
                <div className="p-6">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 ${event.tagColor}`}>{t(event.tag) || event.tag}</span>
                  <h3 className="font-bengali text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{lang === "en" && event.titleEn ? event.titleEn : event.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{lang === "en" ? event.title : event.titleEn}</p>
                  <p className="font-bengali text-sm text-muted-foreground mb-4">{t(event.description) || event.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary"><Calendar className="w-3.5 h-3.5 text-accent" />{t(event.date) || event.date}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary"><Clock className="w-3.5 h-3.5 text-accent" />{t(event.time) || event.time}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary"><MapPin className="w-3.5 h-3.5 text-accent" />{t(event.location) || event.location}</span>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;
