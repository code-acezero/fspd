import { useState, useEffect, useCallback, useMemo, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  ThumbsUp,
  Send,
  Play,
  Calendar,
  User,
  Loader2,
  Globe,
  Image as ImageLucide,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  Tag,
  FileEdit
} from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromSlug, createSlug } from "@/lib/slugify";
import EventGalleryModal, { EventGalleryItem } from "@/components/events/EventGalleryModal";
import { translateText } from "@/lib/translate";
import CorrectionRequestModal from "@/components/common/CorrectionRequestModal";

interface Comment {
  id: string;
  author: string;
  authorEn?: string;
  text: string;
  textEn?: string;
  date: string;
  dateEn?: string;
  likes: number;
}

const BlogReaderPage = () => {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const [commentText, setCommentText] = useState("");
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: "1", author: "আহমেদ হোসেন", authorEn: "Ahmed Hossain", text: "চমৎকার লেখা! অনেক কিছু জানতে পারলাম।", textEn: "Wonderful writing! Learned so much.", date: "২১ মার্চ", dateEn: "Mar 21", likes: 12 },
    { id: "2", author: "নাজমা আক্তার", authorEn: "Nazma Akhter", text: "বাংলা সাহিত্য নিয়ে এমন সুন্দর বিশ্লেষণ আগে পড়িনি। ধন্যবাদ!", textEn: "I had never read such a beautiful analysis of Bengali literature before. Thank you!", date: "২০ মার্চ", dateEn: "Mar 20", likes: 8 },
  ]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [translatingContent, setTranslatingContent] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // Extract ID from slug
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

  // Check if post is connected to an event (via tag "event:UUID")
  const eventTag = (dbPost?.tags || []).find((t: string) => t.startsWith("event:"));
  const connectedEventId = eventTag ? eventTag.replace("event:", "") : null;

  // Fetch connected event details
  const { data: connectedEvent } = useQuery({
    queryKey: ["post-connected-event", connectedEventId],
    queryFn: async () => {
      if (!connectedEventId) return null;
      const { data, error } = await supabase.from("events").select("*").eq("id", connectedEventId).maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!connectedEventId,
  });

  // Fetch connected event gallery items
  const { data: eventGalleryItems = [] } = useQuery<EventGalleryItem[]>({
    queryKey: ["event-gallery", connectedEventId],
    queryFn: async () => {
      if (!connectedEventId) return [];
      const { data, error } = await supabase
        .from("site_assets")
        .select("id, name, image_url, created_at")
        .eq("slot", `event:${connectedEventId}`);
      if (error) return [];
      return data || [];
    },
    enabled: !!connectedEventId,
  });

  // Check if post is connected to a course
  const courseTag = (dbPost?.tags || []).find((t: string) => t.startsWith("course:"));
  const connectedCourseId = courseTag ? courseTag.replace("course:", "") : null;

  const { data: connectedCourse } = useQuery({
    queryKey: ["post-connected-course", connectedCourseId],
    queryFn: async () => {
      if (!connectedCourseId) return null;
      const { data, error } = await supabase.from("courses").select("*").eq("id", connectedCourseId).maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!connectedCourseId,
  });

  const post = dbPost
    ? {
        id: dbPost.id,
        title: dbPost.title,
        titleEn: dbPost.title_en,
        excerpt: dbPost.excerpt,
        content: dbPost.content,
        coverImage: dbPost.cover_image,
        images: dbPost.images || [],
        author: t("fspAuthor"),
        date: new Date(dbPost.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US"),
        category: dbPost.category,
        tags: dbPost.tags || [],
        youtubeUrl: dbPost.youtube_url,
        commentCount: comments.length,
        featured: dbPost.featured,
      }
    : null;

  // Auto-translate content on demand using reliable translateText
  const translateContentHandler = useCallback(async (text: string, targetLang: "en" | "bn") => {
    try {
      const from = targetLang === "en" ? "bn" : "en";
      return await translateText(text, from, targetLang);
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const sourceContent = dbPost?.content ?? "";
    if (lang === "en") {
      // If author already provided English content in excerpt_en (>80 chars), use it directly!
      if (dbPost?.excerpt_en && dbPost.excerpt_en.length > 80 && !/[ঀ-৿]/.test(dbPost.excerpt_en)) {
        setTranslatedContent(dbPost.excerpt_en);
        return;
      }

      if (sourceContent) {
        const isBengali = /[ঀ-৿]/.test(sourceContent);
        if (isBengali) {
          setTranslatingContent(true);
          translateContentHandler(sourceContent, "en").then((translated) => {
            setTranslatedContent(translated);
            setTranslatingContent(false);
          });
          return;
        }
      }
    }
    setTranslatedContent(null);
  }, [lang, dbPost, translateContentHandler]);

  // Reconstruct rich media attachments and positions from post.images and post.tags
  const mediaAttachments = useMemo(() => {
    if (!post || !post.images) return [];
    return post.images.map((url: string, i: number) => {
      const metaTag = (post.tags || []).find((t: string) => t.startsWith(`media:${i}:`));
      let position = i === 0 ? "top" : "bottom";
      let type: "image" | "video" = url.match(/\.(mp4|webm|mov|mkv|ogg)$/i) ? "video" : "image";

      if (metaTag) {
        const parts = metaTag.split(":");
        if (parts[2]) position = parts[2];
        if (parts[3]) type = parts[3] as "image" | "video";
      }
      return { url, position, type };
    });
  }, [post]);

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
  const paragraphs = displayContent.split("\n\n").filter(Boolean);

  const handleComment = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([{ id: Date.now().toString(), author: t("guestReader"), text: commentText, date: t("justNow"), likes: 0 }, ...comments]);
    setCommentText("");
  };

  const shareUrl = window.location.href;

  // Extract YouTube ID for embed
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const youtubeId = getYouTubeId(post.youtubeUrl);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Header Banner */}
      <div className="bg-hero-gradient py-12 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 font-bengali px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> {t("backToBlog")}
          </Link>
          <div className="max-w-3xl">
            <span className="px-4 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold font-bengali">
              {t(post.category) || post.category}
            </span>
            <h1 className="font-bengali text-2xl md:text-4xl font-bold text-primary-foreground mt-3 mb-3 drop-shadow-lg">
              {displayTitle}
            </h1>
            {post.titleEn && lang === "bn" && <p className="text-primary-foreground/60 text-sm mb-4">{post.titleEn}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm">
                <User className="w-3.5 h-3.5" />{post.author}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 backdrop-blur-sm">
                <Calendar className="w-3.5 h-3.5" />{post.date}
              </span>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-xs font-semibold backdrop-blur-sm transition-all font-bengali shadow-xs"
                title={lang === "en" ? "Suggest Correction / Update" : "তথ্য সংশোধনের পরামর্শ দিন"}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Suggest Correction" : "সংশোধনের পরামর্শ"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Rich Media Positioning */}
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Hero Image if available */}
          {post.coverImage && (
            <div className="rounded-3xl overflow-hidden border border-border shadow-xl aspect-video md:aspect-[21/9] bg-muted/30">
              <img src={post.coverImage} alt={displayTitle} className="w-full h-full object-cover" />
            </div>
          )}

          {translatingContent && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary/10 text-primary text-xs font-bengali">
              <Loader2 className="w-4 h-4 animate-spin" /> {t("translatingContent")}
            </div>
          )}

          {/* Dynamic In-Content Paragraphs & Media Layout */}
          <article className="prose prose-lg max-w-none text-foreground/85 leading-relaxed space-y-6 font-bengali">
            {paragraphs.map((p, pIdx) => {
              const pNum = pIdx + 1;
              const floatLeftMedia = mediaAttachments.find(
                (a) => a.position === `float_left_p_${pNum}` || (pNum === 1 && a.position === "inline_left")
              );
              const floatRightMedia = mediaAttachments.find(
                (a) => a.position === `float_right_p_${pNum}` || (pNum === 1 && a.position === "inline_right")
              );
              const afterMedia = mediaAttachments.filter(
                (a) =>
                  a.position === `after_p_${pNum}` ||
                  (pNum === 1 && a.position === "paragraph_1") ||
                  (pNum === 2 && a.position === "paragraph_2")
              );

              return (
                <div key={pIdx} className="space-y-4">
                  <div className="clearfix">
                    {/* Inline Left Media */}
                    {floatLeftMedia && (
                      <div className="float-left mr-5 mb-4 max-w-[280px] sm:max-w-[340px] rounded-2xl overflow-hidden border border-border shadow-md bg-card/60">
                        {floatLeftMedia.type === "video" ? (
                          <video src={floatLeftMedia.url} controls className="w-full h-auto object-cover m-0" />
                        ) : (
                          <img src={floatLeftMedia.url} alt="" className="w-full h-auto object-cover m-0" />
                        )}
                      </div>
                    )}

                    {/* Inline Right Media */}
                    {floatRightMedia && (
                      <div className="float-right ml-5 mb-4 max-w-[280px] sm:max-w-[340px] rounded-2xl overflow-hidden border border-border shadow-md bg-card/60">
                        {floatRightMedia.type === "video" ? (
                          <video src={floatRightMedia.url} controls className="w-full h-auto object-cover m-0" />
                        ) : (
                          <img src={floatRightMedia.url} alt="" className="w-full h-auto object-cover m-0" />
                        )}
                      </div>
                    )}

                    {p.startsWith("## ") ? (
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mt-6 mb-3">{p.replace("## ", "")}</h2>
                    ) : (
                      <p className="text-base md:text-lg leading-relaxed">{p}</p>
                    )}
                  </div>

                  {/* After Paragraph Media Block */}
                  {afterMedia.length > 0 && (
                    <div className="clear-both my-6 space-y-4 not-prose">
                      {afterMedia.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="rounded-3xl overflow-hidden border border-border shadow-lg bg-card/60"
                        >
                          {m.type === "video" ? (
                            <video src={m.url} controls className="w-full max-h-[500px] object-cover" />
                          ) : (
                            <img src={m.url} alt="" className="w-full max-h-[520px] object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </article>

          {/* YouTube Video Player Embed */}
          {youtubeId && (
            <div className="p-6 rounded-3xl bg-card border border-border depth-card space-y-4">
              <h3 className="font-bengali font-bold text-lg text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500" />
                ভিডিও প্রতিবেদন (Video Presentation)
              </h3>
              <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={displayTitle}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Bottom Images Grid (All media designated for bottom gallery) */}
          {(() => {
            const bottomMedia = mediaAttachments.filter(
              (a) => a.position === "bottom" && a.url !== post.coverImage
            );
            if (bottomMedia.length === 0 && (!post.images || post.images.length <= 1)) return null;

            const displayList = bottomMedia.length > 0
              ? bottomMedia
              : (post.images || []).slice(1).map((u) => ({ url: u, type: "image" }));

            return (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
                  <ImageLucide className="w-4 h-4 text-primary" />
                  সংযুক্ত ছবির অ্যালবাম
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayList.map((item: any, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border bg-muted/40 shadow-sm">
                      {item.type === "video" ? (
                        <video src={item.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Interconnectivity Cards: Connected Event & Course ── */}
          {(connectedEvent || connectedCourse) && (
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              {connectedEvent && (
                <div className="p-5 rounded-3xl bg-card border border-primary/30 depth-card flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold font-bengali text-primary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      সম্পর্কিত অনুষ্ঠান (Connected Event)
                    </span>
                    <h4 className="font-bengali font-bold text-sm text-foreground truncate">
                      {connectedEvent.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bengali">
                      {connectedEvent.date} • {connectedEvent.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/events/${createSlug(connectedEvent.title_en || connectedEvent.title, connectedEvent.id)}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bengali font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-colors"
                    >
                      <span>অনুষ্ঠান দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {eventGalleryItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setGalleryModalOpen(true)}
                        className="py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bengali font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ImageLucide className="w-3.5 h-3.5 text-primary" />
                        <span>গ্যালারি ({eventGalleryItems.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {connectedCourse && (
                <div className="p-5 rounded-3xl bg-card border border-border depth-card flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold font-bengali text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      সম্পর্কিত কোর্স (Connected Course)
                    </span>
                    <h4 className="font-bengali font-bold text-sm text-foreground truncate">
                      {connectedCourse.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bengali">
                      প্রশিক্ষক: {connectedCourse.instructor}
                    </p>
                  </div>

                  <Link
                    to={`/courses/${createSlug(connectedCourse.title_en || connectedCourse.title, connectedCourse.id)}`}
                    className="w-full py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bengali font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>কোর্স বিবরণ ও ভর্তি</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(post.tags || []).filter((t: string) => !t.startsWith("event:") && !t.startsWith("course:")).map((tag) => (
              <span key={tag} className="px-3.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bengali">
                #{tag}
              </span>
            ))}
          </div>

          {/* Share Action */}
          <div className="flex justify-end pt-4 border-t border-border">
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

          {/* Comments Section */}
          <div className="pt-6">
            <h3 className="font-bengali text-xl font-bold text-foreground mb-6">{t("comments")} ({comments.length})</h3>
            <form onSubmit={handleComment} className="flex gap-3 mb-8">
              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={t("writeComment")} className="flex-1 px-5 py-3 rounded-full bg-card border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="submit" className="px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-crimson-dark transition-colors shadow-md shadow-primary/20"><Send className="w-4 h-4" /></button>
            </form>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card rounded-3xl border border-border p-5 depth-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bengali text-xs font-semibold text-foreground">{comment.author}</p>
                        <p className="text-[10px] text-muted-foreground">{comment.date}</p>
                      </div>
                    </div>
                  </div>
                  <p className="font-bengali text-sm text-foreground/80 pl-10">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Gallery Lightbox Modal if triggered */}
      {connectedEvent && (
        <EventGalleryModal
          isOpen={galleryModalOpen}
          onClose={() => setGalleryModalOpen(false)}
          eventTitle={connectedEvent.title}
          eventDate={connectedEvent.date}
          items={eventGalleryItems}
        />
      )}

      {/* Suggest Correction Modal */}
      {correctionModalOpen && (
        <CorrectionRequestModal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          targetType="post"
          targetId={dbPost ? dbPost.id : (post ? post.id : "")}
          targetTitle={displayTitle}
        />
      )}

      <Footer />
    </div>
  );
};

export default BlogReaderPage;
