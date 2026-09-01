import React, { useState, useRef } from "react";
import RichBlockEditor from "@/components/editor/RichBlockEditor";
import {
  ImagePlus,
  Video,
  Youtube,
  Send,
  Loader2,
  Calendar,
  GraduationCap,
  X,
  Languages,
  Award,
  ShieldCheck,
  Tag,
  Globe,
  Lock,
  PlusCircle,
  Link2,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadSiteImage } from "@/lib/storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText } from "@/lib/translate";

export interface MediaAttachment {
  url: string;
  type: "image" | "video";
  position: string;
  caption?: string;
}

export interface PostData {
  id?: string;
  title: string;
  title_en: string;
  content: string;
  content_en?: string;
  excerpt: string;
  excerpt_en: string;
  category: string;
  tags: string[];
  cover_image?: string;
  images?: string[];
  media_attachments?: MediaAttachment[];
  youtube_url?: string;
  published: boolean;
  featured: boolean;
  connected_event_id?: string;
  connected_course_id?: string;
}

export type FacebookPostData = PostData;

interface PostComposerProps {
  initialData?: PostData | null;
  events: Array<{ id: string; title: string; date: string }>;
  courses: Array<{ id: string; title: string }>;
  onSave: (post: PostData) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
}

// Auto translation helper using reliable client-side translation
const translateApi = async (text: string, targetLang: "en" | "bn"): Promise<string> => {
  if (!text || !text.trim()) return "";
  const from = targetLang === "en" ? "bn" : "en";
  try {
    const res = await translateText(text, from, targetLang);
    return res || "";
  } catch (err) {
    console.error("Translation failed:", err);
    return "";
  }
};

// Bilingual Input Pair with bidirectional auto-translate
const BilingualInputPair: React.FC<{
  label: string;
  valueBn: string;
  valueEn: string;
  onChangeBn: (v: string) => void;
  onChangeEn: (v: string) => void;
  placeholderBn?: string;
  placeholderEn?: string;
  multiline?: boolean;
  rows?: number;
}> = ({
  label,
  valueBn,
  valueEn,
  onChangeBn,
  onChangeEn,
  placeholderBn,
  placeholderEn,
  multiline,
  rows = 3,
}) => {
  const [translatingToEn, setTranslatingToEn] = useState(false);
  const [translatingToBn, setTranslatingToBn] = useState(false);
  const { lang } = useLanguage();

  const handleTranslateToEn = async () => {
    if (!valueBn.trim()) return;
    setTranslatingToEn(true);
    const res = await translateApi(valueBn, "en");
    if (res) onChangeEn(res);
    setTranslatingToEn(false);
  };

  const handleTranslateToBn = async () => {
    if (!valueEn.trim()) return;
    setTranslatingToBn(true);
    const res = await translateApi(valueEn, "bn");
    if (res) onChangeBn(res);
    setTranslatingToBn(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold font-bengali text-foreground flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-muted-foreground font-bengali flex items-center gap-1">
          <Languages className="w-3 h-3 text-primary" />
          {lang === "en" ? "Auto-Translation Enabled" : "অটো-অনুবাদ সক্রিয়"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Bengali Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bengali text-muted-foreground px-1">
            <span>{lang === "en" ? "Bengali (বাংলা)" : "বাংলা (Bengali)"}</span>
            {valueEn?.trim() && (
              <button
                type="button"
                onClick={handleTranslateToBn}
                disabled={translatingToBn}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10.5px] font-bengali font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-2xs border border-primary/20"
                title={lang === "en" ? "Translate English to Bengali" : "ইংরেজি থেকে বাংলায় অনুবাদ"}
              >
                {translatingToBn ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Languages className="w-3 h-3 text-primary" />
                )}
                <span>
                  {valueBn?.trim()
                    ? (lang === "en" ? "Re-translate to Bangla" : "পুনরায় বাংলায় অনুবাদ")
                    : (lang === "en" ? "Translate to Bangla" : "বাংলায় অনুবাদ")}
                </span>
              </button>
            )}
          </div>
          {multiline ? (
            <textarea
              rows={rows}
              value={valueBn}
              onChange={(e) => onChangeBn(e.target.value)}
              placeholder={placeholderBn || "বাংলায় লিখুন..."}
              className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            />
          ) : (
            <input
              type="text"
              value={valueBn}
              onChange={(e) => onChangeBn(e.target.value)}
              placeholder={placeholderBn || "বাংলায় লিখুন..."}
              className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>

        {/* English Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bengali text-muted-foreground px-1">
            <span className="font-sans">English</span>
            {valueBn?.trim() && (
              <button
                type="button"
                onClick={handleTranslateToEn}
                disabled={translatingToEn}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10.5px] font-sans font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-2xs border border-primary/20"
                title={lang === "en" ? "Translate Bengali to English" : "বাংলা থেকে ইংরেজিতে অনুবাদ"}
              >
                {translatingToEn ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Languages className="w-3 h-3 text-primary" />
                )}
                <span>
                  {valueEn?.trim()
                    ? (lang === "en" ? "Re-translate to English" : "পুনরায় ইংরেজিতে অনুবাদ")
                    : (lang === "en" ? "Translate to English" : "ইংরেজিতে অনুবাদ")}
                </span>
              </button>
            )}
          </div>
          {multiline ? (
            <textarea
              rows={rows}
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder={placeholderEn || "Write in English..."}
              className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            />
          ) : (
            <input
              type="text"
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder={placeholderEn || "Write in English..."}
              className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PostComposer: React.FC<PostComposerProps> = ({
  initialData,
  events,
  courses,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const { user, profile } = useAuth();
  const avatarUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || "";
  const { toast } = useToast();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [titleEn, setTitleEn] = useState(initialData?.title_en || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [contentEn, setContentEn] = useState(initialData?.content_en || initialData?.excerpt_en || "");
  const [category, setCategory] = useState(initialData?.category || "সাহিত্য");

  // Separate initial tags into Bengali and English
  const initialTags = initialData?.tags || [];
  const initialBnTags = initialTags.filter(
    (t) => !t.startsWith("media:") && !t.startsWith("event:") && !t.startsWith("course:") && /[ঀ-৿]/.test(t)
  );
  const initialEnTags = initialTags.filter(
    (t) => !t.startsWith("media:") && !t.startsWith("event:") && !t.startsWith("course:") && !/[ঀ-৿]/.test(t)
  );

  const [tagsInput, setTagsInput] = useState(
    initialBnTags.length > 0
      ? initialBnTags.join(", ")
      : initialTags.filter((t) => !t.startsWith("media:") && !t.startsWith("event:") && !t.startsWith("course:")).join(", ")
  );
  const [tagsEnInput, setTagsEnInput] = useState(initialEnTags.join(", "));
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtube_url || "");
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);

  // Attachment Section Toggles (Click to turn on/off)
  const [showMediaSection, setShowMediaSection] = useState(
    Boolean(initialData?.media_attachments?.length || initialData?.images?.length)
  );
  const [showYoutubeInput, setShowYoutubeInput] = useState(Boolean(initialData?.youtube_url));
  const [showConnectSection, setShowConnectSection] = useState(
    Boolean(initialData?.connected_event_id || initialData?.connected_course_id)
  );

  const handleToggleMedia = () => {
    setShowMediaSection((prev) => !prev);
  };

  // Interconnectivity Links
  const [connectedEventId, setConnectedEventId] = useState(initialData?.connected_event_id || "");
  const [connectedCourseId, setConnectedCourseId] = useState(initialData?.connected_course_id || "");

  // Media Attachments (Max 10)
  const [attachments, setAttachments] = useState<MediaAttachment[]>(
    initialData?.media_attachments ||
      (initialData?.images || []).map((url, i) => ({
        url,
        type: url.match(/\.(mp4|webm|mov|mkv)$/i) ? "video" : "image",
        position: i === 0 ? "top" : "bottom",
      }))
  );
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Dynamically detect paragraphs from content body in real time
  const detectedParagraphs = React.useMemo(() => {
    return content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  // Helper to normalize legacy positions to dynamic paragraph ids
  const normalizePosition = (pos: string) => {
    if (pos === "paragraph_1") return "after_p_1";
    if (pos === "paragraph_2") return "after_p_2";
    if (pos === "inline_left") return "float_left_p_1";
    if (pos === "inline_right") return "float_right_p_1";
    return pos;
  };

  // Parse YouTube Embed ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const youtubeId = getYouTubeId(youtubeUrl);

  // File Upload Handler (Up to 10 files)
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 10) {
      toast({
        title: lang === "en" ? "Maximum 10 media files allowed" : "সর্বোচ্চ ১০টি ছবি বা ভিডিও যোগ করা যাবে",
        variant: "destructive",
      });
      return;
    }

    setUploadingMedia(true);
    const newAttachments: MediaAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.name);
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);

      if (!isVideo && !isImage) continue;

      try {
        const res = await uploadSiteImage(file, "post", user?.id);
        const publicUrl = typeof res === "string" ? res : res?.url;
        if (publicUrl) {
          newAttachments.push({
            url: publicUrl,
            type: isVideo ? "video" : "image",
            position: attachments.length === 0 && i === 0 ? "top" : "bottom",
          });
        }
      } catch (err: any) {
        console.error("Upload error for file:", file.name, err);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      setShowMediaSection(true);
      toast({
        title: lang === "en"
          ? `${newAttachments.length} media file(s) attached!`
          : `${newAttachments.length}টি মিডিয়া ফাইল যুক্ত হয়েছে!`,
      });
    } else {
      toast({
        title: lang === "en" ? "Failed to attach media" : "মিডিয়া সংযুক্ত করা যায়নি",
        variant: "destructive",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadingMedia(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttachmentPosition = (index: number, position: MediaAttachment["position"]) => {
    setAttachments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, position } : item))
    );
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!title.trim() && !titleEn.trim()) {
      toast({
        title: lang === "en" ? "Post title is required" : "শিরোনাম আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    const parsedBnTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedEnTags = tagsEnInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const userTags = Array.from(new Set([...parsedBnTags, ...parsedEnTags]));

    // If connected event or course, tag them as well for database queries
    if (connectedEventId && !userTags.includes(`event:${connectedEventId}`)) {
      userTags.push(`event:${connectedEventId}`);
    }
    if (connectedCourseId && !userTags.includes(`course:${connectedCourseId}`)) {
      userTags.push(`course:${connectedCourseId}`);
    }

    // Encode media attachment positions in tags so they persist losslessly in database
    const mediaTags = attachments.map((a, i) => `media:${i}:${a.position}:${a.type}`);
    const cleanTags = userTags.filter((t) => !t.startsWith("media:"));
    const finalTags = [...cleanTags, ...mediaTags];

    const heroAttachment = attachments.find((a) => a.position === "top");
    const coverImage = heroAttachment ? heroAttachment.url : attachments[0]?.url || "";

    const payload: PostData = {
      title,
      title_en: titleEn,
      content,
      content_en: contentEn,
      excerpt: content.substring(0, 160) + (content.length > 160 ? "..." : ""),
      excerpt_en: contentEn ? (contentEn.length > 160 ? contentEn.substring(0, 160) + "..." : contentEn) : (titleEn ? `${titleEn} - Official publication` : ""),
      category,
      tags: finalTags,
      cover_image: coverImage,
      images: attachments.map((a) => a.url),
      media_attachments: attachments,
      youtube_url: youtubeUrl.trim(),
      published,
      featured,
      connected_event_id: connectedEventId,
      connected_course_id: connectedCourseId,
    };

    await onSave(payload);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 sm:p-7 shadow-sm space-y-5">
      {/* ── Author Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-primary to-crimson-dark flex items-center justify-center text-primary-foreground font-bengali font-bold text-base shadow-sm shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "ফ"
            )}
          </div>
          <div>
            <span className="font-bengali font-bold text-sm text-foreground block">
              {user?.email?.split("@")[0] || (lang === "en" ? "Administrator" : "অ্যাডমিনিস্ট্রেটর")}
            </span>
            <span className="text-[11px] text-muted-foreground font-bengali flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              {lang === "en" ? "Faridpur Shahitto Parishad Official Post" : "ফরিদপুর সাহিত্য পরিষদ অফিসিয়াল পোস্ট"}
            </span>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Post Title Pair with Google Auto-Translation ── */}
      <BilingualInputPair
        label={lang === "en" ? "Post Title" : "পোস্টের শিরোনাম (Post Title)"}
        valueBn={title}
        valueEn={titleEn}
        onChangeBn={setTitle}
        onChangeEn={setTitleEn}
        placeholderBn="একটি আকর্ষণীয় শিরোনাম লিখুন..."
        placeholderEn="Enter an engaging title in English..."
      />

      {/* ── Category Selection ── */}
      <div className="space-y-1">
        <label className="text-xs font-bold font-bengali text-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" />
          <span>{lang === "en" ? "Category" : "ক্যাটাগরি (Category)"}</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="সাহিত্য">{lang === "en" ? "Literature" : "সাহিত্য (Literature)"}</option>
          <option value="কবিতা">{lang === "en" ? "Poetry" : "কবিতা (Poetry)"}</option>
          <option value="প্রবন্ধ">{lang === "en" ? "Essay" : "প্রবন্ধ (Essay)"}</option>
          <option value="গবেষণা">{lang === "en" ? "Research" : "গবেষণা (Research)"}</option>
          <option value="ইতিহাস">{lang === "en" ? "History & Heritage" : "ইতিহাস ও ঐতিহ্য (History & Heritage)"}</option>
          <option value="ঘোষণা">{lang === "en" ? "Notice & Announcement" : "জরুরি বিজ্ঞপ্তি ও ঘোষণা (Notice)"}</option>
        </select>
      </div>

      {/* ── Bilingual Tags with Bidirectional Auto-Translation ── */}
      <BilingualInputPair
        label={lang === "en" ? "Tags (comma-separated)" : "ট্যাগসমূহ (Tags - কমা দিয়ে লিখুন)"}
        valueBn={tagsInput}
        valueEn={tagsEnInput}
        onChangeBn={setTagsInput}
        onChangeEn={setTagsEnInput}
        placeholderBn="ফরিদপুর, মহাফেজখানা, ইতিহাস, ১৯৮৩, প্রতিষ্ঠা..."
        placeholderEn="Faridpur, Archives, History, 1983, Foundation..."
      />

      {/* ── Content Body — Rich Block Editor ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold font-bengali text-foreground">
            {lang === "en" ? "Content Body" : "মূল বক্তব্য ও বিবরণ (Content Body)"}
          </label>
          <span className="text-[10px] text-muted-foreground font-bengali bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full">
            {lang === "en" ? "Rich Block Editor" : "ব্লক-ভিত্তিক সম্পাদক"}
          </span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-bengali mb-1.5 px-1">
              🇧🇩 {lang === "en" ? "Bengali (বাংলা)" : "বাংলা (Bengali)"}
            </p>
            <RichBlockEditor value={content} onChange={setContent} lang="bn" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-sans mb-1.5 px-1">
              🇬🇧 English
            </p>
            <RichBlockEditor value={contentEn} onChange={setContentEn} lang="en" />
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════
          POST ENHANCEMENTS & MEDIA ACTION BAR
      ══════════════════════════════════════════════════════════════ */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <span className="font-bengali font-bold text-xs text-foreground flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-primary shrink-0" />
          <span>{lang === "en" ? "Add to your post" : "পোস্টে যুক্ত করুন (Add to post)"}</span>
        </span>

        {/* Hidden File Input for Media Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {/* Attachment Quick Tools - Responsive 3-col grid on mobile, flex row on sm+ */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          {/* Photo / Video Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMedia}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bengali font-semibold transition-all active:scale-95 shadow-xs ${
              showMediaSection || attachments.length > 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-card hover:bg-secondary border-border text-foreground"
            }`}
            title={lang === "en" ? "Toggle Photos & Videos" : "ছবি ও ভিডিও অপশন চালু/বন্ধ করুন"}
          >
            {uploadingMedia ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
            ) : (
              <ImagePlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{lang === "en" ? "Media" : "মিডিয়া"}</span>
            {attachments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                {attachments.length}
              </span>
            )}
          </button>

          {/* YouTube Video Toggle Button */}
          <button
            type="button"
            onClick={() => setShowYoutubeInput(!showYoutubeInput)}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bengali font-semibold transition-all active:scale-95 shadow-xs ${
              showYoutubeInput || youtubeUrl
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-card hover:bg-secondary border-border text-foreground"
            }`}
            title={lang === "en" ? "Toggle YouTube Video" : "ইউটিউব ভিডিও অপশন চালু/বন্ধ করুন"}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">YouTube</span>
            {youtubeUrl && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
          </button>

          {/* Connect Event / Course Toggle Button */}
          <button
            type="button"
            onClick={() => setShowConnectSection(!showConnectSection)}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bengali font-semibold transition-all active:scale-95 shadow-xs ${
              showConnectSection || connectedEventId || connectedCourseId
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-card hover:bg-secondary border-border text-foreground"
            }`}
            title={lang === "en" ? "Toggle Event / Course Links" : "ইভেন্ট / কোর্স লিংক চালু/বন্ধ করুন"}
          >
            <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{lang === "en" ? "Event/Course" : "ইভেন্ট/কোর্স"}</span>
            {(connectedEventId || connectedCourseId) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* ── YOUTUBE ATTACHMENT CARD (CONDITIONAL & REFINED) ── */}
      {showYoutubeInput && (
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3 animate-in fade-in zoom-in-98">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-bengali text-foreground flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>{lang === "en" ? "YouTube Video Embed" : "ইউটিউব ভিডিও এম্বেড (YouTube Video)"}</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowYoutubeInput(false);
                setYoutubeUrl("");
              }}
              className="w-7 h-7 rounded-xl bg-card hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all border border-border active:scale-95 shadow-xs"
              title="Close YouTube Embed"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
            />
            <Youtube className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {youtubeId && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black/40 max-w-md shadow-md">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube Preview"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* ── CROSS-CONNECTIVITY CARD (CONDITIONAL & REFINED) ── */}
      {showConnectSection && (
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3 animate-in fade-in zoom-in-98">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-bengali text-foreground flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "en" ? "Cross-Connectivity Links" : "আন্তঃসংযোগ লিংক (Connected Event / Course)"}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowConnectSection(false);
                setConnectedEventId("");
                setConnectedCourseId("");
              }}
              className="w-7 h-7 rounded-xl bg-card hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all border border-border active:scale-95 shadow-xs"
              title="Close Connections"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                📅 {lang === "en" ? "Connected Event" : "সম্পর্কিত অনুষ্ঠান"}
              </label>
              <select
                value={connectedEventId}
                onChange={(e) => setConnectedEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{lang === "en" ? "None (Not Connected)" : "কোনোটি নয় (সংযুক্ত নয়)"}</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                🎓 {lang === "en" ? "Connected Course" : "সম্পর্কিত কোর্স"}
              </label>
              <select
                value={connectedCourseId}
                onChange={(e) => setConnectedCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{lang === "en" ? "None (Not Connected)" : "কোনোটি নয় (সংযুক্ত নয়)"}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDIA ATTACHMENTS (CONDITIONAL & TOGGLEABLE) ── */}
      {showMediaSection && (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-secondary/20 border border-border/80 animate-in fade-in zoom-in-98">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold font-bengali text-foreground flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === "en"
                    ? `Media Attachments (${attachments.length}/10)`
                    : `ছবি ও ভিডিও সংযোজন (${attachments.length}/১০)`}
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground font-bengali">
                {lang === "en"
                  ? "Select display position in the post for each photo or video."
                  : "প্রতিটি ছবি বা ভিডিও পোস্টের কোথায় প্রদর্শিত হবে তা নির্বাচন করুন।"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {attachments.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-sans font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-xs"
                >
                  {uploadingMedia ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{lang === "en" ? "+ Add" : "+ যোগ করুন"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMediaSection(false)}
                className="w-7 h-7 rounded-xl bg-card hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all border border-border active:scale-95 shadow-xs"
                title={lang === "en" ? "Close Media Drawer" : "ড্রয়ার বন্ধ করুন"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Empty Dropzone when no files attached yet */}
          {attachments.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-card/40 hover:bg-card/70 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                {uploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              </div>
              <p className="text-xs font-bengali font-bold text-foreground">
                {lang === "en" ? "Upload Photos or Videos" : "ছবি বা ভিডিও আপলোড করুন"}
              </p>
              <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
                {lang === "en"
                  ? "Click to select up to 10 files (JPG, PNG, WebP, MP4, MOV)"
                  : "সর্বোচ্চ ১০টি ছবি বা ভিডিও ফাইল নির্বাচন করতে ক্লিক করুন"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl border border-border bg-card space-y-2 relative group shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="aspect-video rounded-xl bg-muted/40 relative overflow-hidden flex items-center justify-center">
                  {att.type === "video" ? (
                    <video src={att.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={att.url} alt="" className="w-full h-full object-cover" />
                  )}

                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors shadow-sm"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                      #{idx + 1}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] uppercase font-bold tracking-wider">
                      {att.type}
                    </span>
                  </div>
                </div>

                {/* Placement Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bengali text-muted-foreground block font-semibold">
                    {lang === "en" ? "Position in Post:" : "প্রদর্শনের স্থান:"}
                  </label>
                  <select
                    value={normalizePosition(att.position)}
                    onChange={(e) => updateAttachmentPosition(idx, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-secondary text-[11px] font-bengali text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="top">📌 {lang === "en" ? "Hero Banner (Top of Post)" : "শীর্ষে ব্যানার (Hero Top)"}</option>

                    {/* Context-Aware Paragraph Positions */}
                    {detectedParagraphs.map((para, pIdx) => {
                      const pNum = pIdx + 1;
                      const cleanPara = para.replace(/^[#\s*>-]+/, "").trim();
                      const snippet = cleanPara.length > 26 ? cleanPara.slice(0, 26) + "..." : cleanPara;

                      return (
                        <optgroup
                          key={pIdx}
                          label={lang === "en" ? `¶ Paragraph ${pNum}: "${snippet}"` : `¶ অনুচ্ছেদ ${pNum}: "${snippet}"`}
                        >
                          <option value={`after_p_${pNum}`}>
                            📄 {lang === "en" ? `After Paragraph ${pNum}` : `${pNum} নং অনুচ্ছেদের পর`}
                          </option>
                          <option value={`float_left_p_${pNum}`}>
                            ⬅️ {lang === "en" ? `Inside Para ${pNum} (Float Left)` : `${pNum} নং অনুচ্ছেদে বামে (Float Left)`}
                          </option>
                          <option value={`float_right_p_${pNum}`}>
                            ➡️ {lang === "en" ? `Inside Para ${pNum} (Float Right)` : `${pNum} নং অনুচ্ছেদে ডানে (Float Right)`}
                          </option>
                        </optgroup>
                      );
                    })}

                    {detectedParagraphs.length === 0 && (
                      <option disabled value="">
                        {lang === "en"
                          ? "ℹ️ (Type paragraphs in Content Body above to enable in-text placement)"
                          : "ℹ️ (অনুচ্ছেদ অনুযায়ী বসাতে উপরে বক্তব্য লিখুন)"}
                      </option>
                    )}

                    <option value="bottom">🖼️ {lang === "en" ? "Bottom Photo Gallery (End of Post)" : "নিচে ফটো গ্যালারি (Bottom Grid)"}</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* ══════════════════════════════════════════════════════════════
          REFINED PUBLISH CONTROLS & SUBMIT ACTION FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pt-4 border-t border-border">
        {/* Modern Segmented Status and Featured Switches */}
        <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap w-full sm:w-auto">
          {/* Live vs Draft Segmented Switch */}
          <div className="flex items-center p-0.5 rounded-full bg-secondary/80 border border-border shadow-xs">
            <button
              type="button"
              onClick={() => setPublished(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bengali font-bold transition-all ${
                published
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={lang === "en" ? "Publish publicly on website" : "ওয়েবসাইটে সরাসরি প্রকাশ করুন"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Live" : "লাইভ"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPublished(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bengali font-bold transition-all ${
                !published
                  ? "bg-card text-amber-400 shadow-xs border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={lang === "en" ? "Unpublish or save as draft" : "অপ্রকাশিত রাখুন / ড্রাফট"}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Draft" : "ড্রাফট"}</span>
            </button>
          </div>

          {/* Featured Highlight Switch */}
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bengali font-bold border transition-all active:scale-95 shadow-xs ${
              featured
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/10"
                : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${featured ? "text-amber-400 fill-amber-400/20" : ""}`} />
            <span>{lang === "en" ? "Featured" : "ফিচার্ড"}</span>
            {featured && <Check className="w-3 h-3 text-amber-400" />}
          </button>
        </div>

        {/* Action Buttons: Cancel and Publish/Update */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full border border-border hover:bg-secondary text-xs font-bengali font-semibold text-foreground transition-all active:scale-95 text-center"
            >
              {lang === "en" ? "Cancel" : "বাতিল"}
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 sm:px-8 py-2.5 rounded-full bg-gradient-to-r from-primary to-crimson-dark text-primary-foreground font-bengali font-bold text-xs shadow-lg shadow-primary/30 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>
              {initialData
                ? (lang === "en" ? "Update Post" : "পোস্ট আপডেট করুন")
                : (lang === "en" ? "Publish Post" : "পোস্ট প্রকাশ করুন")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
