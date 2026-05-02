import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Globe, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageUploader from "@/components/upload/ImageUploader";

/**
 * Facebook-style composer. Members can write a post, attach images, and submit.
 * Senior members are auto-published; general members go to a pending queue.
 * Uses RLS + triggers on `posts` to enforce moderation server-side.
 */

const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(8000),
});

const MAX_IMAGES = 4;

interface MyPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  approval_status: string;
  published: boolean;
  images: string[];
}

const MemberPostComposer = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t, lang } = useLanguage();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);

  const isSenior = profile?.is_senior;

  const fetchMine = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("posts")
      .select("id,title,content,created_at,approval_status,published,images")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setMyPosts(data as unknown as MyPost[]);
  };

  useEffect(() => { fetchMine(); /* eslint-disable-next-line */ }, [user]);

  // Image upload handled by <ImageUploader /> below.

  const submit = async () => {
    if (!user) return;
    const parsed = postSchema.safeParse({ title, content });
    if (!parsed.success) {
      toast({ title: t("error"), description: parsed.error.errors[0]?.message || "Invalid input", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const excerpt = content.slice(0, 200);
    // Triggers will set approval_status & published based on senior status.
    const { error } = await supabase.from("posts").insert({
      title,
      content,
      excerpt,
      images,
      author_id: user.id,
      category: "সদস্য পোস্ট",
      tags: [],
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: t("success"),
      description: isSenior ? t("postPublished") : t("postPendingApproval"),
    });
    setTitle(""); setContent(""); setImages([]); setOpen(false);
    fetchMine();
  };

  if (!user) return null;
  const display = profile?.display_name || profile?.full_name || (lang === "bn" ? "সদস্য" : "Member");
  const initial = (display || "?").charAt(0).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border p-5 depth-card space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold overflow-hidden shrink-0">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initial}
        </div>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left px-5 py-2.5 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground font-bengali text-sm transition-colors"
          >
            {t("whatsOnYourMind").replace("{name}", display)}
          </button>
        ) : (
          <p className="font-bengali text-sm font-semibold text-foreground">{display}</p>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titleBangla") + " / " + t("titleEnglish")}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("composerBody")}
              rows={5}
              maxLength={8000}
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {images.map((url, idx) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader
              folder="post"
              maxImages={MAX_IMAGES}
              value={images}
              onChange={setImages}
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-bengali inline-flex items-center gap-1">
                  {isSenior ? <CheckCircle2 className="w-3 h-3 text-forest" /> : <Clock className="w-3 h-3 text-accent" />}
                  {isSenior ? t("autoPublishSenior") : t("approvalRequired")}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => { setOpen(false); setTitle(""); setContent(""); setImages([]); }} className="px-4 py-2 rounded-full text-xs font-bengali text-muted-foreground hover:bg-muted">
                  {t("cancel")}
                </button>
                <button
                  onClick={submit}
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-bengali hover:bg-primary/80 disabled:opacity-50 transition-all"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {t("postNow")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {myPosts.length > 0 && (
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-xs font-bengali text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> {t("yourRecentPosts")}
          </p>
          {myPosts.map((p) => {
            const status = p.approval_status === "approved" && p.published
              ? { label: t("statusPublished"), Icon: CheckCircle2, color: "text-forest" }
              : p.approval_status === "rejected"
                ? { label: t("statusRejected"), Icon: AlertCircle, color: "text-destructive" }
                : { label: t("statusPending"), Icon: Clock, color: "text-accent" };
            const Sicon = status.Icon;
            return (
              <div key={p.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="font-bengali text-sm text-foreground truncate">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</p>
                </div>
                <span className={`text-[10px] font-semibold font-bengali inline-flex items-center gap-1 ${status.color} shrink-0`}>
                  <Sicon className="w-3 h-3" />{status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MemberPostComposer;
