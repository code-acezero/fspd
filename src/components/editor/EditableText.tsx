import { useState, useRef, useEffect, ReactNode, createElement, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Check, X, Globe, SlidersHorizontal } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";

interface EditableTextProps {
  pageKey: string;
  sectionKey: string;
  elementKey: string;
  defaultBn?: string;
  defaultEn?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "a" | "button";
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  href?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export const EditableText = ({
  pageKey,
  sectionKey,
  elementKey,
  defaultBn = "",
  defaultEn = "",
  as = "span",
  className = "",
  multiline = false,
  placeholder = "Click to edit text...",
  href,
  style = {},
  children,
}: EditableTextProps) => {
  const {
    editMode,
    selectedElement,
    setSelectedElement,
    activeLanguage,
    getContent,
    updateContent,
    setIsDrawerOpen,
    isDrawerOpen,
  } = useVisualEditor();

  const key = `${pageKey}:${sectionKey}:${elementKey}`;
  const isSelected = selectedElement === key;

  const initialBn = defaultBn || (typeof children === "string" ? children : "");
  const initialEn = defaultEn || initialBn;

  const content = getContent(pageKey, sectionKey, elementKey, {
    bn: initialBn,
    en: initialEn,
    isVisible: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draftBn, setDraftBn] = useState(content.textBn);
  const [draftEn, setDraftEn] = useState(content.textEn);
  const [activeTab, setActiveTab] = useState<"bn" | "en">(activeLanguage);
  const [badgeRect, setBadgeRect] = useState<DOMRect | null>(null);
  const elemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setDraftBn(content.textBn);
    setDraftEn(content.textEn);
  }, [content.textBn, content.textEn]);

  useEffect(() => {
    setActiveTab(activeLanguage);
  }, [activeLanguage]);

  const updateBadgeRect = useCallback(() => {
    if (elemRef.current) {
      setBadgeRect(elemRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (isSelected && !isDrawerOpen) {
      updateBadgeRect();
      window.addEventListener("scroll", updateBadgeRect, { passive: true });
      window.addEventListener("resize", updateBadgeRect, { passive: true });
      return () => {
        window.removeEventListener("scroll", updateBadgeRect);
        window.removeEventListener("resize", updateBadgeRect);
      };
    } else {
      setBadgeRect(null);
    }
  }, [isSelected, isDrawerOpen, updateBadgeRect]);

  if (!content.isVisible && !editMode) return null;

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(content.styles.color ? { color: content.styles.color } : {}),
    ...(content.styles.fontSize ? { fontSize: content.styles.fontSize } : {}),
    ...(content.styles.fontWeight ? { fontWeight: content.styles.fontWeight } : {}),
    ...(content.styles.textAlign ? { textAlign: content.styles.textAlign as any } : {}),
    ...(content.styles.lineHeight ? { lineHeight: content.styles.lineHeight } : {}),
    ...(content.styles.letterSpacing ? { letterSpacing: content.styles.letterSpacing } : {}),
  };

  const currentDisplayText =
    content.text || (activeLanguage === "en" ? draftEn : draftBn) || placeholder;

  if (!editMode) {
    if (as === "a") {
      return (
        <a href={content.metadata.href || href} className={className} style={mergedStyle}>
          {currentDisplayText}
        </a>
      );
    }
    return createElement(as, { className, style: mergedStyle }, currentDisplayText);
  }

  const handleApply = () => {
    updateContent(pageKey, sectionKey, elementKey, {
      content_bn: draftBn,
      content_en: draftEn,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftBn(content.textBn);
    setDraftEn(content.textEn);
    setIsEditing(false);
  };

  const editProps: any = {
    ref: (el: HTMLElement | null) => { elemRef.current = el; },
    className: `${className} ve-editable ${isSelected ? "ve-selected" : ""} ${
      !content.isVisible ? "opacity-30 line-through" : ""
    }`,
    style: mergedStyle,
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedElement(key); },
    onDoubleClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedElement(key); setIsEditing(true); },
  };

  if (as === "a") {
    editProps.href = content.metadata.href || href;
    editProps.onClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setSelectedElement(key); };
  }

  const badgeStyle: React.CSSProperties | null = (badgeRect && !isDrawerOpen)
    ? {
        position: "fixed",
        top: Math.max(8, badgeRect.top - 36),
        left: Math.min(window.innerWidth - 210, Math.max(8, badgeRect.right - 200)),
        zIndex: 120,
        pointerEvents: "auto",
      }
    : null;

  return (
    <>
      {createElement(as, editProps, currentDisplayText)}

      {badgeStyle &&
        createPortal(
          <div
            style={badgeStyle}
            className="flex items-center gap-1 bg-slate-900/96 text-white text-[11px] px-2.5 py-1 rounded-full shadow-xl border border-white/20 backdrop-blur-sm select-none animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="flex items-center gap-1 hover:text-accent font-medium transition-colors"
            >
              <Edit2 className="w-3 h-3" /><span>Edit</span>
            </button>
            <div className="w-px h-3 bg-white/20" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedElement(key); setIsDrawerOpen(true); }}
              className="hover:text-accent p-0.5 transition-colors"
              title="Styles & Inspector"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          </div>,
          document.body
        )}

      <AnimatePresence>
        {isEditing &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => { e.stopPropagation(); handleCancel(); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card text-card-foreground border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 depth-card"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-bengali text-foreground">সরাসরি টেক্সট এডিটর</h4>
                      <p className="text-[11px] text-muted-foreground">{pageKey} › {sectionKey} › {elementKey}</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleCancel} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex rounded-2xl bg-muted p-1 gap-1">
                  {(["bn", "en"] as const).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setActiveTab(lng)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold font-bengali transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === lng ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      {lng === "bn" ? "বাংলা (Bengali)" : "English (ইংরেজি)"}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground font-bengali">
                    {activeTab === "bn" ? "বাংলা কনটেন্ট:" : "English Content:"}
                  </label>
                  {multiline ? (
                    <textarea
                      value={activeTab === "bn" ? draftBn : draftEn}
                      onChange={(e) => activeTab === "bn" ? setDraftBn(e.target.value) : setDraftEn(e.target.value)}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground ${activeTab === "bn" ? "font-bengali" : ""}`}
                      placeholder={activeTab === "bn" ? "এখানে বাংলা টেক্সট লিখুন..." : "Write English text here..."}
                      autoFocus
                    />
                  ) : (
                    <input
                      type="text"
                      value={activeTab === "bn" ? draftBn : draftEn}
                      onChange={(e) => activeTab === "bn" ? setDraftBn(e.target.value) : setDraftEn(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground ${activeTab === "bn" ? "font-bengali" : ""}`}
                      placeholder={activeTab === "bn" ? "এখানে বাংলা টেক্সট লিখুন..." : "Write English text here..."}
                      autoFocus
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => { setSelectedElement(key); setIsDrawerOpen(true); setIsEditing(false); }}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1 font-bengali"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> স্টাইলিং সেটিংস
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-full text-xs font-semibold font-bengali text-muted-foreground hover:bg-muted transition-colors">
                      বাতিল
                    </button>
                    <button type="button" onClick={handleApply} className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-bengali hover:bg-primary/80 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20">
                      <Check className="w-3.5 h-3.5" /> প্রয়োগ করুন
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>,
            document.body
          )}
      </AnimatePresence>
    </>
  );
};

export default EditableText;
