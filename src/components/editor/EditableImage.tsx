import { useState, useEffect, ImgHTMLAttributes } from "react";
import { ImagePlus, SlidersHorizontal } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { supabase } from "@/integrations/supabase/client";
import ImageSelectModal from "@/components/editor/ImageSelectModal";

interface EditableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  pageKey: string;
  sectionKey: string;
  elementKey: string;
  defaultSrc: string;
  folder?: "hero" | "slider" | "site" | "member" | "event" | "post" | "editor" | "course";
  containerClassName?: string;
}

export const EditableImage = ({
  pageKey,
  sectionKey,
  elementKey,
  defaultSrc,
  folder = "editor",
  containerClassName = "",
  className = "",
  alt = "",
  ...imgProps
}: EditableImageProps) => {
  const {
    editMode,
    selectedElement,
    setSelectedElement,
    getContent,
    updateContent,
    setIsDrawerOpen,
    registerImageElement,
    unregisterImageElement,
  } = useVisualEditor();

  const key = `${pageKey}:${sectionKey}:${elementKey}`;
  const isSelected = selectedElement === key;

  const content = getContent(pageKey, sectionKey, elementKey, {
    media: defaultSrc,
    isVisible: true,
  });

  const [modalOpen, setModalOpen] = useState(false);

  // Register this element as an image element so the drawer shows the image panel
  useEffect(() => {
    registerImageElement(key);
    return () => unregisterImageElement(key);
  }, [key, registerImageElement, unregisterImageElement]);

  const activeSrc = content.mediaUrl || defaultSrc;

  if (!content.isVisible && !editMode) {
    return null;
  }

  if (!editMode) {
    return <img src={activeSrc} alt={alt} className={className} {...imgProps} />;
  }

  const handleSelect = (url: string) => {
    updateContent(pageKey, sectionKey, elementKey, { media_url: url });
    if (folder === "hero" || elementKey === "bg_image") {
      supabase
        .from("site_assets")
        .update({ is_active: false })
        .eq("slot", "hero")
        .then(() => {
          supabase.from("site_assets").insert({
            slot: "hero",
            image_url: url,
            is_active: true,
            title_bn: "হিরো ব্যানার",
            title_en: "Hero Banner",
          });
        });
    }
  };

  return (
    <div
      className={`relative inline-block group cursor-pointer ${containerClassName} ${
        isSelected
          ? "ve-selected"
          : "ve-editable"
      }`}
      style={{ borderRadius: "inherit" }}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(key); }}
    >
      <img
        src={activeSrc}
        alt={alt}
        className={`${className} ${!content.isVisible ? "opacity-30" : ""}`}
        {...imgProps}
      />

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit] flex items-center justify-center gap-2 z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSelectedElement(key); setModalOpen(true); }}
          className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-bengali shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>ছবি পরিবর্তন</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSelectedElement(key); setIsDrawerOpen(true); }}
          className="p-2 rounded-full bg-slate-900/90 text-white hover:bg-slate-900 text-xs shadow-lg transition-transform hover:scale-105"
          title="Image Properties"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <ImageSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
        currentUrl={activeSrc}
        title={`ছবি পরিবর্তন — ${sectionKey} / ${elementKey}`}
        folder={folder}
      />
    </div>
  );
};

export default EditableImage;
