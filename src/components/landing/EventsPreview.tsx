import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSlug } from "@/lib/slugify";

const EventsPreview = () => {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,title_en,date,time,location,tag,tag_color")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setEvents(data);
    })();
  }, []);

  if (events.length === 0) return null;

  return (
    <section id="events" ref={ref} className="py-24 bg-warm-gradient relative overflow-hidden">
      <motion.div style={{ y }} className="absolute top-20 left-0 w-60 h-60 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.2em] uppercase font-semibold mb-3">{t("eventSchedule")}</p>
          <h2 className="font-bengali text-3xl md:text-5xl font-bold text-foreground mb-6">{t("upcomingEventsTitle")}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6" style={{ perspective: "1000px" }}>
          {events.map((event, index) => (
            <Link to={`/events/${createSlug(event.title_en || event.title, event.id)}`} key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 5 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, rotateY: 3, scale: 1.02 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all group h-full"
              >
                <div className="p-5">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold mb-3 ${event.tag_color}`}>{event.tag}</span>
                  <h3 className="font-bengali text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{lang === "en" && event.title_en ? event.title_en : event.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{lang === "en" ? event.title : event.title_en}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Calendar className="w-3 h-3 text-accent" /></div>
                      <span className="font-bengali">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Clock className="w-3 h-3 text-accent" /></div>
                      <span className="font-bengali">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><MapPin className="w-3 h-3 text-accent" /></div>
                      <span className="font-bengali">{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between bg-secondary/30">
                  <span className="text-xs font-semibold text-primary font-bengali">{t("readMore")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsPreview;
