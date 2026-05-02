import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type ContentType = "post" | "event" | null;

const ContentCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeType, setActiveType] = useState<ContentType>(null);
  const [saving, setSaving] = useState(false);

  const [postForm, setPostForm] = useState({ title: "", title_en: "", content: "", excerpt: "", category: "সাহিত্য", tags: "", published: false });
  const [eventForm, setEventForm] = useState({ title: "", title_en: "", date: "", time: "", location: "", description: "", tag: "" });

  const savePost = async () => {
    if (!postForm.title || !user) return;
    setSaving(true);
    const payload = { ...postForm, tags: postForm.tags.split(",").map((t) => t.trim()).filter(Boolean), author_id: user.id };
    const { error } = await supabase.from("posts").insert(payload);
    if (error) { toast({ title: t("error"), description: error.message, variant: "destructive" }); }
    else { toast({ title: t("success"), description: t("postSaved") }); setPostForm({ title: "", title_en: "", content: "", excerpt: "", category: "সাহিত্য", tags: "", published: false }); setActiveType(null); }
    setSaving(false);
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !user) return;
    setSaving(true);
    const payload = { ...eventForm, created_by: user.id, tag_color: "bg-primary text-primary-foreground" };
    const { error } = await supabase.from("events").insert(payload);
    if (error) { toast({ title: t("error"), description: error.message, variant: "destructive" }); }
    else { toast({ title: t("success"), description: t("eventSaved") }); setEventForm({ title: "", title_en: "", date: "", time: "", location: "", description: "", tag: "" }); setActiveType(null); }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-3xl border border-border p-6 depth-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bengali text-lg font-bold text-foreground">{t("createContent")}</h2>
        {!activeType && (
          <div className="flex gap-2">
            <button onClick={() => setActiveType("post")} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition-all font-bengali">
              <FileText className="w-3.5 h-3.5" /> {t("postLabel")}
            </button>
            <button onClick={() => setActiveType("event")} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/80 transition-all font-bengali">
              <Calendar className="w-3.5 h-3.5" /> {t("eventLabel")}
            </button>
          </div>
        )}
        {activeType && (
          <button onClick={() => setActiveType(null)} className="p-2 rounded-full hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeType === "post" && (
          <motion.div key="post" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder={t("titleBangla")} className={inputClass} />
              <input value={postForm.title_en} onChange={(e) => setPostForm({ ...postForm, title_en: e.target.value })} placeholder={t("titleEnglish")} className={inputClass} />
            </div>
            <input value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} placeholder={t("categoryLabel")} className={inputClass} />
            <textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} placeholder={t("excerptLabel")} rows={2} className={inputClass + " resize-none"} />
            <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder={t("contentBody")} rows={5} className={inputClass + " resize-none"} />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-bengali text-foreground">
                <input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })} className="rounded" /> {t("publishNow")}
              </label>
              <button onClick={savePost} disabled={saving || !postForm.title} className="ml-auto px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all flex items-center gap-2 disabled:opacity-50 font-bengali">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("postNow")}
              </button>
            </div>
          </motion.div>
        )}

        {activeType === "event" && (
          <motion.div key="event" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder={t("eventTitleLabel")} className={inputClass} />
              <input value={eventForm.title_en} onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })} placeholder={t("titleEnglish")} className={inputClass} />
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className={inputClass} />
              <input value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} placeholder={t("timeLabel")} className={inputClass} />
              <input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder={t("locationLabel")} className={inputClass} />
              <input value={eventForm.tag} onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })} placeholder={t("tagLabel")} className={inputClass} />
            </div>
            <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder={t("descriptionLabel")} rows={3} className={inputClass + " resize-none"} />
            <button onClick={saveEvent} disabled={saving || !eventForm.title || !eventForm.date} className="ml-auto px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/80 transition-all flex items-center gap-2 disabled:opacity-50 font-bengali">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("createEventLabel")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeType && (
        <p className="text-sm text-muted-foreground font-bengali text-center py-4">
          {t("clickToCreateContent")}
        </p>
      )}
    </motion.div>
  );
};

export default ContentCreator;
