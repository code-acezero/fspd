import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, SlidersHorizontal, RotateCcw, Eye, EyeOff,
  Palette, Type, AlignLeft, AlignCenter, AlignRight,
  ImageIcon, Trash2, Layers, Check, Wand2,
  FolderTree, ExternalLink, ChevronRight, ChevronDown,
  Globe, Search, ArrowLeft, Image as ImageLucide
} from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { deleteStorageImage } from "@/lib/storage";
import ImageSelectModal from "@/components/editor/ImageSelectModal";
import BilingualInputPair from "@/components/forms/BilingualInputPair";
import { SITE_PAGES_REGISTRY, PageMeta, SectionMeta, PageSectionElementMeta } from "@/lib/siteRegistry";

export const VisualEditorDrawer = () => {
  const { isDrawerOpen, selectedElement, setIsDrawerOpen } = useVisualEditor();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end md:flex-row md:justify-end">
          {/* Backdrop overlay with click-to-close */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px]"
          />

          {/* Desktop Sliding Side Drawer (>= md) */}
          <motion.div
            key="drawer-panel-desktop"
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.8 }}
            className="hidden md:flex relative z-10 w-full max-w-[420px] lg:max-w-[460px] h-full bg-slate-950/98 text-foreground backdrop-blur-2xl border-l border-white/10 shadow-2xl flex-col overflow-hidden"
          >
            <DrawerMaster />
          </motion.div>

          {/* Mobile iOS Slide-Up Bottom Sheet (< md) */}
          <motion.div
            key="drawer-panel-mobile"
            initial={{ y: "100%", opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
            className="flex md:hidden relative z-10 w-full h-[88vh] max-h-[88vh] rounded-t-[32px] bg-slate-950/98 text-foreground backdrop-blur-3xl border-t border-white/15 shadow-2xl flex-col overflow-hidden"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {/* iOS Grabber */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            <DrawerMaster />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DrawerMaster = () => {
  const { selectedElement, setSelectedElement, setIsDrawerOpen } = useVisualEditor();
  const [activeTab, setActiveTab] = useState<"inspector" | "directory" | "media">(
    selectedElement ? "inspector" : "directory"
  );

  // If element selection changes to non-null, switch to inspector
  useEffect(() => {
    if (selectedElement) {
      setActiveTab("inspector");
    }
  }, [selectedElement]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top Bar with Tab Switcher ── */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10 flex-1 min-w-0">
          {selectedElement && (
            <button
              type="button"
              onClick={() => setActiveTab("inspector")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold font-bengali transition-colors flex items-center justify-center gap-1.5 truncate ${
                activeTab === "inspector"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">এডিটর</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold font-bengali transition-colors flex items-center justify-center gap-1.5 truncate ${
              activeTab === "directory"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">পেজ ও সেকশন</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold font-bengali transition-colors flex items-center justify-center gap-1.5 truncate ${
              activeTab === "media"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageLucide className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">মিডিয়া</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Close (✕)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Content View ── */}
      <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
        {activeTab === "inspector" && selectedElement ? (
          <ElementInspector onBackToDirectory={() => setActiveTab("directory")} />
        ) : activeTab === "media" ? (
          <MediaManager />
        ) : (
          <PagesDirectory onSelectElement={() => setActiveTab("inspector")} />
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 1. PAGES & SECTIONS DIRECTORY NAVIGATOR
// ══════════════════════════════════════════════════════════════
const PagesDirectory = ({ onSelectElement }: { onSelectElement: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedElement, getContent, setIsDrawerOpen } = useVisualEditor();
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    landing: true,
    home: true,
    about: true,
    events: true,
    courses: true,
    members: true,
    blog: true,
    global: true,
  });

  const togglePage = (key: string) => {
    setExpandedPages((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleJumpToElement = (page: PageMeta, section: SectionMeta, element: PageSectionElementMeta) => {
    const key = `${page.pageKey}:${section.sectionKey}:${element.elementKey}`;
    setSelectedElement(key);
    onSelectElement();

    if (location.pathname !== page.route) {
      navigate(page.route);
    }

    setTimeout(() => {
      const el = document.querySelector(`[data-ve-element="${key}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 pb-12">
      <div>
        <h3 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-primary" />
          সাইটের সকল পেজ ও সেকশন তালিকা
        </h3>
        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
          যেকোনো পেজের সেকশন বা টেক্সট নির্বাচন করে সরাসরি লাইভ পরিবর্তন করুন
        </p>
      </div>

      <div className="space-y-3">
        {SITE_PAGES_REGISTRY.map((page) => {
          const isExpanded = !!expandedPages[page.pageKey];
          const isCurrentPage = location.pathname === page.route;

          return (
            <div
              key={page.pageKey}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCurrentPage
                  ? "bg-primary/[0.04] border-primary/40 shadow-xs"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              {/* Page Accordion Header */}
              <div
                onClick={() => togglePage(page.pageKey)}
                className="p-3 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrentPage ? "bg-primary text-primary-foreground" : "bg-white/10 text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bengali font-bold text-xs text-foreground block truncate">
                      {page.pageTitleBn}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {page.route}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isCurrentPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(page.route);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] text-white font-bengali flex items-center gap-1 active:scale-95 transition-transform"
                      title="Navigate to page"
                    >
                      <ExternalLink className="w-3 h-3 text-accent" />
                      যান
                    </button>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Sections List */}
              {isExpanded && (
                <div className="border-t border-white/5 bg-black/20 p-2.5 space-y-2.5">
                  {page.sections.map((section) => (
                    <div
                      key={section.sectionKey}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold font-bengali text-foreground/90 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {section.sectionTitleBn}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const key = `${page.pageKey}:${section.sectionKey}:__section__`;
                            setSelectedElement(key);
                            onSelectElement();
                          }}
                          className="text-[10px] text-primary hover:underline font-bengali p-1"
                        >
                          সেকশন সেটিংস
                        </button>
                      </div>

                      {/* Element Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {section.elements.map((el) => {
                          const resolved = getContent(page.pageKey, section.sectionKey, el.elementKey, {
                            bn: el.defaultBn,
                            en: el.defaultEn,
                          });
                          const isEdited = resolved.isCustomized;

                          return (
                            <button
                              key={el.elementKey}
                              type="button"
                              onClick={() => handleJumpToElement(page, section, el)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bengali flex items-center gap-1.5 border transition-all active:scale-95 ${
                                isEdited
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <span>{el.labelBn}</span>
                              {isEdited && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 2. ELEMENT INSPECTOR & EDITOR (Live text/typography/color)
// ══════════════════════════════════════════════════════════════
const ElementInspector = ({ onBackToDirectory }: { onBackToDirectory: () => void }) => {
  const {
    selectedElement,
    getContent,
    updateContent,
    resetElement,
    imageElements,
    setIsDrawerOpen,
  } = useVisualEditor();

  const { lang } = useLanguage();
  const { toast } = useToast();

  const [pageKey, sectionKey, elementKey] = (selectedElement || "::").split(":");
  const content = getContent(pageKey, sectionKey, elementKey);

  const isImageElement = imageElements.has(selectedElement || "");
  const isSectionElement = elementKey === "__section__";

  const [draftBn, setDraftBn] = useState(content.textBn);
  const [draftEn, setDraftEn] = useState(content.textEn);
  const [styles, setStyles] = useState<Record<string, any>>(content.styles || {});
  const [customHref, setCustomHref] = useState(content.metadata?.href || "");
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [deletingFromBucket, setDeletingFromBucket] = useState(false);

  const colorPresets = [
    { label: "Default", value: "" },
    { label: "White", value: "#ffffff" },
    { label: "Primary", value: "hsl(var(--primary))" },
    { label: "Accent", value: "hsl(var(--accent))" },
    { label: "Gold", value: "#fbbf24" },
    { label: "Emerald", value: "#34d399" },
    { label: "Muted", value: "hsl(var(--muted-foreground))" },
  ];

  useEffect(() => {
    setDraftBn(content.textBn);
    setDraftEn(content.textEn);
    setStyles(content.styles || {});
    setCustomHref(content.metadata?.href || "");
  }, [selectedElement, content.textBn, content.textEn, content.styles, content.metadata?.href]);

  const updateStyle = (styleKey: string, value: any) => {
    const next = { ...styles, [styleKey]: value !== "" ? value : undefined };
    setStyles(next);
    updateContent(pageKey, sectionKey, elementKey, { styles: next });
  };

  const handleImageDelete = async () => {
    if (!content.mediaUrl) return;
    if (!confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই ছবিটি স্টোরেজ থেকে চিরতরে মুছে ফেলতে চান?" : "Are you sure you want to permanently delete this image from storage?")) {
      return;
    }

    setDeletingFromBucket(true);
    const delRes = await deleteStorageImage(content.mediaUrl);
    setDeletingFromBucket(false);

    if (delRes.success) {
      updateContent(pageKey, sectionKey, elementKey, { media_url: "" });
      toast({
        title: lang === "bn" ? "ছবি স্টোরেজ থেকে মুছে ফেলা হয়েছে" : "Image deleted from storage",
        description: delRes.message,
      });
    } else {
      updateContent(pageKey, sectionKey, elementKey, { media_url: "" });
      toast({
        title: lang === "bn" ? "ছবি আনলিংক করা হয়েছে" : "Image unlinked",
        description: delRes.message,
      });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5 min-h-0">
        {/* Back Link + Breadcrumb Header */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="text-xs text-primary hover:underline font-bengali flex items-center gap-1.5 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            সকল পেজ ও সেকশন তালিকা
          </button>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {isImageElement ? <ImageIcon className="w-4 h-4" /> : isSectionElement ? <Layers className="w-4 h-4" /> : <Type className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-mono block">
                {pageKey} › {sectionKey}
              </span>
              <h4 className="font-bengali font-bold text-xs text-foreground truncate">
                {elementKey}
              </h4>
            </div>
          </div>
        </div>

        {/* Visibility & Reset Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => updateContent(pageKey, sectionKey, elementKey, { is_visible: !content.isVisible })}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bengali font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              content.isVisible
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
            }`}
          >
            {content.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {content.isVisible ? "দৃশ্যমান (Visible)" : "লুকানো (Hidden)"}
          </button>

          <button
            type="button"
            onClick={() => resetElement(pageKey, sectionKey, elementKey)}
            className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-destructive/15 hover:border-destructive/40 text-muted-foreground hover:text-destructive text-xs font-bengali font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title="Reset to default code value"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            রিসেট (Reset)
          </button>
        </div>

        {/* ── IMAGE CONTROLS (If Image Element) ── */}
        {isImageElement ? (
          <div className="space-y-4 pt-2">
            <h5 className="font-bengali font-bold text-xs text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              ছবি নির্বাচন ও পরিবর্তন (Image Asset)
            </h5>

            {content.mediaUrl ? (
              <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-black/40 p-2 space-y-2">
                <img
                  src={content.mediaUrl}
                  alt=""
                  className="w-full h-44 object-cover rounded-xl border border-white/10"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImgModalOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bengali font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    ছবি পরিবর্তন করুন
                  </button>
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    disabled={deletingFromBucket}
                    className="py-2.5 px-3 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 text-xs font-bengali font-bold transition-colors flex items-center gap-1.5 active:scale-95"
                    title="Delete completely from storage bucket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    মুছুন
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setImgModalOpen(true)}
                className="w-full py-8 border-2 border-dashed border-white/20 hover:border-primary/60 rounded-2xl bg-white/[0.02] hover:bg-primary/5 text-muted-foreground hover:text-primary flex flex-col items-center justify-center gap-2 transition-all active:scale-98"
              >
                <UploadCloud className="w-8 h-8 text-primary/80" />
                <span className="font-bengali text-xs font-bold">নতুন ছবি আপলোড বা নির্বাচন করুন</span>
              </button>
            )}
          </div>
        ) : isSectionElement ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground font-bengali leading-relaxed">
              আপনি সম্পূর্ণ সেকশনটি নির্বাচন করেছেন। ওপরের বোতাম ব্যবহার করে সেকশনটি লুকানো বা দৃশ্যমান করতে পারেন।
            </p>
          </div>
        ) : (
          /* ── TEXT & TYPOGRAPHY CONTROLS WITH LIVE AUTO-TRANSLATION ── */
          <div className="space-y-4 pt-1">
            <BilingualInputPair
              valueBn={draftBn}
              valueEn={draftEn}
              onChangeBn={(val) => {
                setDraftBn(val);
                updateContent(pageKey, sectionKey, elementKey, { content_bn: val });
              }}
              onChangeEn={(val) => {
                setDraftEn(val);
                updateContent(pageKey, sectionKey, elementKey, { content_en: val });
              }}
              placeholderBn="বাংলা বিষয়বস্তু লিখুন..."
              placeholderEn="Enter English content..."
              multiline
              rows={3}
              inputClass="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-primary/70 text-foreground font-bengali text-sm focus:outline-none transition-colors resize-y leading-relaxed"
            />

            {/* Typography Controls */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h5 className="font-bengali font-bold text-xs text-foreground flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-accent" />
                টাইপোগ্রাফি ও স্টাইল (Typography & Style)
              </h5>

              {/* Text Alignment */}
              <div className="flex items-center justify-between gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/10">
                {[
                  { align: "left", Icon: AlignLeft, label: "Left" },
                  { align: "center", Icon: AlignCenter, label: "Center" },
                  { align: "right", Icon: AlignRight, label: "Right" },
                ].map(({ align, Icon, label }) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateStyle("textAlign", align)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-colors active:scale-95 ${
                      styles.textAlign === align
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bengali text-muted-foreground flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-primary" />
                  রঙিন প্যালেট (Text Color)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => updateStyle("color", p.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all active:scale-95 ${
                        styles.color === p.value
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl flex items-center justify-between gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground font-bengali flex items-center gap-1.5">
          <Wand2 className="w-3 h-3 text-primary" />
          লাইভ সিংক সক্রিয়
        </span>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-crimson-dark text-primary-foreground font-bengali font-bold text-xs shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          সম্পন্ন (Done)
        </button>
      </div>

      {/* Image Modal for Upload/Replace */}
      <ImageSelectModal
        open={imgModalOpen}
        onClose={() => setImgModalOpen(false)}
        currentUrl={content.mediaUrl}
        onSelect={(url) => {
          updateContent(pageKey, sectionKey, elementKey, { media_url: url });
          setImgModalOpen(false);
          toast({
            title: lang === "bn" ? "ছবি সফলভাবে প্রতিস্থাপিত হয়েছে" : "Image replaced successfully",
          });
        }}
      />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 3. STORAGE MEDIA BUCKET EXPLORER
// ══════════════════════════════════════════════════════════════
const MediaManager = () => {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="p-4 sm:p-5 space-y-4 pb-12">
      <div>
        <h3 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
          <ImageLucide className="w-4 h-4 text-primary" />
          স্টোরেজ মিডিয়া গ্যালারি (Storage Media Explorer)
        </h3>
        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
          সুপাবেস স্টোরেজের সকল ছবি দেখুন, আপলোড করুন অথবা চিরতরে মুছুন
        </p>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full py-4 px-4 rounded-2xl bg-primary text-primary-foreground font-bengali font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 active:scale-98 transition-all"
      >
        <UploadCloud className="w-4 h-4" />
        স্টোরেজ ফাইল ম্যানেজার খুলুন
      </button>

      <ImageSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => {
          navigator.clipboard.writeText(url);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default VisualEditorDrawer;
