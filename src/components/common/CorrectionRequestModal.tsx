import { useState, type FormEvent } from "react";
import { X, Send, Loader2, AlertCircle, FileEdit, CheckCircle2, ShieldCheck, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitChangeRequest } from "@/lib/changeRequests";

export interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "member" | "post" | "event" | "course" | "profile";
  targetId: string;
  targetTitle: string;
  initialData?: {
    name?: string;
    name_en?: string;
    title?: string;
    title_en?: string;
    bio?: string;
    phone?: string;
    [key: string]: any;
  };
}

export const CorrectionRequestModal = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  initialData = {},
}: CorrectionRequestModalProps) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [notes, setNotes] = useState("");
  const [proposedName, setProposedName] = useState(initialData.name || "");
  const [proposedNameEn, setProposedNameEn] = useState(initialData.name_en || "");
  const [proposedTitle, setProposedTitle] = useState(initialData.title || "");
  const [proposedTitleEn, setProposedTitleEn] = useState(initialData.title_en || "");
  const [proposedBio, setProposedBio] = useState(initialData.bio || "");
  const [proposedPhone, setProposedPhone] = useState(initialData.phone || "");

  // Generic correction fields (for posts, events, courses)
  const [targetField, setTargetField] = useState("General / Content Details");
  const [proposedContent, setProposedContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: lang === "en" ? "Sign In Required" : "সাইন ইন প্রয়োজন",
        description: lang === "en" ? "Please sign in to submit a correction request." : "সংশোধনের আবেদন জানাতে অনুগ্রহ করে সাইন ইন করুন।",
        variant: "destructive",
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: lang === "en" ? "Notes Required" : "বিবরণ প্রয়োজন",
        description: lang === "en" ? "Please write an explanation note for the admin." : "অনুগ্রহ করে অ্যাডমিনের জন্য সংশোধনের কারণ বা বিবরণ লিখুন।",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    let proposedData: Record<string, any> = {};

    if (targetType === "member" || targetType === "profile") {
      if (proposedName.trim()) proposedData.name = proposedName.trim();
      if (proposedNameEn.trim()) proposedData.name_en = proposedNameEn.trim();
      if (proposedTitle.trim()) proposedData.title = proposedTitle.trim();
      if (proposedTitleEn.trim()) proposedData.title_en = proposedTitleEn.trim();
      if (proposedBio.trim()) proposedData.bio = proposedBio.trim();
      if (proposedPhone.trim()) proposedData.phone = proposedPhone.trim();
    } else {
      proposedData = {
        field_name: targetField,
        suggested_correction: proposedContent.trim(),
      };
    }

    const res = await submitChangeRequest({
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
      proposed_data: proposedData,
      notes: notes.trim(),
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      toast({
        title: lang === "en" ? "Request Submitted" : "আবেদন সফলভাবে জমা হয়েছে",
        description: lang === "en" ? "Admin will review your change request shortly." : "অ্যাডমিনিস্ট্রেটর পর্যালোচনার পর প্রয়োজনীয় ব্যবস্থা নেবেন।",
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } else {
      toast({
        title: lang === "en" ? "Submission Failed" : "আবেদন ব্যর্থ হয়েছে",
        description: res.error || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getTargetBadgeLabel = () => {
    switch (targetType) {
      case "member":
        return lang === "en" ? "Council Member Profile" : "পরিষদ সদস্য প্রোফাইল";
      case "post":
        return lang === "en" ? "Post / Article" : "পোস্ট / প্রবন্ধ";
      case "event":
        return lang === "en" ? "Event & Festival" : "অনুষ্ঠান ও সাহিত্য সভা";
      case "course":
        return lang === "en" ? "Course & Workshop" : "কোর্স ও কর্মশালা";
      default:
        return lang === "en" ? "User Profile" : "ইউজার প্রোফাইল";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bengali font-bold text-sm text-foreground">
                {lang === "en" ? "Request Correction or Update" : "তথ্য সংশোধন বা পরিবর্তনের আবেদন"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold font-bengali">
                  {getTargetBadgeLabel()}
                </span>
                <span className="text-[11px] text-muted-foreground font-bengali truncate max-w-[200px]">
                  {targetTitle}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-secondary hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bengali font-bold text-base text-foreground">
              {lang === "en" ? "Change Request Submitted!" : "আবেদন সফলভাবে গৃহীত হয়েছে!"}
            </h4>
            <p className="text-xs text-muted-foreground font-bengali">
              {lang === "en"
                ? "The administration will review your notes and apply the updates upon approval."
                : "পরিষদ কর্তৃপক্ষ আপনার আবেদনটি যাচাই করে অনুমোদন প্রদান করবে।"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/80 text-xs text-muted-foreground font-bengali flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                {lang === "en"
                  ? "For verified records, changes require administrative review. Describe the exact correction and provide your reasons below."
                  : "অফিসিয়াল তথ্যের নির্ভুলতা বজায় রাখতে পরিবর্তনসমূহ অ্যাডমিন যাচাইকরণ সাপেক্ষে কার্যকর হবে।"}
              </span>
            </div>

            {/* Member Profile Specific Fields */}
            {(targetType === "member" || targetType === "profile") && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                      {lang === "en" ? "Full Name (Bengali)" : "নাম (বাংলা)"}
                    </label>
                    <input
                      type="text"
                      value={proposedName}
                      onChange={(e) => setProposedName(e.target.value)}
                      placeholder="সঠিক বাংলা নাম..."
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                      {lang === "en" ? "Full Name (English)" : "নাম (ইংরেজি)"}
                    </label>
                    <input
                      type="text"
                      value={proposedNameEn}
                      onChange={(e) => setProposedNameEn(e.target.value)}
                      placeholder="Correct English Name..."
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                      {lang === "en" ? "Designation / Title (Bengali)" : "পদবী / পরিচয় (বাংলা)"}
                    </label>
                    <input
                      type="text"
                      value={proposedTitle}
                      onChange={(e) => setProposedTitle(e.target.value)}
                      placeholder="যেমন: সহ-সভাপতি, কবি..."
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                      {lang === "en" ? "Designation / Title (English)" : "পদবী / পরিচয় (ইংরেজি)"}
                    </label>
                    <input
                      type="text"
                      value={proposedTitleEn}
                      onChange={(e) => setProposedTitleEn(e.target.value)}
                      placeholder="e.g. Vice President, Poet..."
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                    {lang === "en" ? "Contact Phone Number" : "যোগাযোগের ফোন নম্বর"}
                  </label>
                  <input
                    type="text"
                    value={proposedPhone}
                    onChange={(e) => setProposedPhone(e.target.value)}
                    placeholder="01715-XXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                    {lang === "en" ? "Bio & Literary Summary" : "সংক্ষিপ্ত পরিচিতি ও সাহিত্যজীবন"}
                  </label>
                  <textarea
                    rows={3}
                    value={proposedBio}
                    onChange={(e) => setProposedBio(e.target.value)}
                    placeholder="সংশোধিত সাহিত্যিক বা সাংগঠনিক জীবনবৃত্তান্ত..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Post / Event / Course Generic Fields */}
            {targetType !== "member" && targetType !== "profile" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                    {lang === "en" ? "Topic / Field Needing Correction" : "সংশোধনের বিষয় / ফিল্ড"}
                  </label>
                  <select
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Title / Headline">{lang === "en" ? "Title / Headline" : "শিরোনাম / নাম"}</option>
                    <option value="Date / Time / Venue">{lang === "en" ? "Date / Time / Venue" : "তারিখ / সময় / স্থান"}</option>
                    <option value="Content / Description Fact">{lang === "en" ? "Content Fact / Info" : "মূল বক্তব্য বা তথ্যের ত্রুটি"}</option>
                    <option value="Grammar / Spelling">{lang === "en" ? "Grammar / Spelling" : "বানান বা ভাষাগত ত্রুটি"}</option>
                    <option value="Photo / Media Placement">{lang === "en" ? "Photo / Media" : "ছবি বা মিডিয়ার সংশোধন"}</option>
                    <option value="Other">{lang === "en" ? "Other" : "অন্যান্য"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bengali text-muted-foreground block mb-1">
                    {lang === "en" ? "Proposed Correct Information" : "প্রস্তাবিত সঠিক তথ্য"}
                  </label>
                  <textarea
                    rows={3}
                    value={proposedContent}
                    onChange={(e) => setProposedContent(e.target.value)}
                    placeholder={lang === "en" ? "Write the correct text, date, or facts here..." : "সঠিক বিবরণ, বানান বা তথ্যটি এখানে লিখুন..."}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Explanation Notes for Admin (Mandatory) */}
            <div>
              <label className="text-[11px] font-bengali font-bold text-foreground block mb-1">
                {lang === "en" ? "Explanation / Notes for Admin *" : "অ্যাডমিনের জন্য কারণ ও বিবরণ (বাধ্যতামূলক) *"}
              </label>
              <textarea
                required
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Explain why this change is needed or cite reference..."
                    : "কেন এই সংশোধনটি প্রয়োজন বা তথ্যটির রেফারেন্স উল্লেখ করুন..."
                }
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-bengali transition-colors"
              >
                {lang === "en" ? "Cancel" : "বাতিল"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bengali font-semibold text-xs transition-all active:scale-95 shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{lang === "en" ? "Submit Request" : "আবেদন পাঠান"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CorrectionRequestModal;
