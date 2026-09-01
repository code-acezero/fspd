import { useState, useEffect, ImgHTMLAttributes } from "react";
import { ImagePlus, SlidersHorizontal } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { isVideoMedia } from "@/lib/storage";
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
  folder = "hero",
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
    activeLanguage,
  } = useVisualEditor();

  const { lang } = useLanguage();
  const currentLang = editMode ? activeLanguage : lang;

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
    if (isVideoMedia(activeSrc)) {
      return (
        <video
          src={activeSrc}
          autoPlay
          loop
          muted
          playsInline
          className={className}
        />
      );
    }
    return <img src={activeSrc} alt={alt} className={className} {...imgProps} />;
  }

  const isVideo = isVideoMedia(activeSrc);

  const handleSelect = async (
    url: string,
    options?: { isCarousel?: boolean; carouselImages?: string[] }
  ) => {
    const isVideoSelected = isVideoMedia(url);
    const isCarousel = isVideoSelected ? false : (options?.isCarousel ?? false);
    const carouselImages = isVideoSelected ? [] : (options?.carouselImages ?? (isCarousel ? [url] : []));

    // 1. Update in-memory visual editor draft state
    updateContent(pageKey, sectionKey, elementKey, {
      media_url: url,
      metadata: {
        is_carousel: isCarousel,
        carousel_images: carouselImages,
      },
    });

    // 2. Broadcast immediately so hero section updates live in real-time
    if (folder === "hero" || sectionKey === "hero" || elementKey === "bg_image") {
      window.dispatchEvent(
        new CustomEvent("fspd:hero_carousel_updated", {
          detail: { isCarousel, carouselImages, primaryUrl: url },
        })
      );
      window.dispatchEvent(new CustomEvent("fspd:hero_image_updated", { detail: url }));
    }

    // 3. Persist to site_settings
    try {
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "visual_editor_page_content")
        .maybeSingle();

      const currentSettings =
        settingsData && settingsData.value && typeof settingsData.value === "object"
          ? { ...settingsData.value }
          : {};

      currentSettings[`${pageKey}:${sectionKey}:${elementKey}`] = {
        page_key: pageKey,
        section_key: sectionKey,
        element_key: elementKey,
        media_url: url,
        is_visible: true,
        metadata: {
          is_carousel: isCarousel,
          carousel_images: carouselImages,
          carousel_interval: 6000,
        },
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("site_settings")
        .upsert(
          {
            key: "visual_editor_page_content",
            value: currentSettings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      try {
        localStorage.setItem("fspd_visual_editor_content", JSON.stringify(currentSettings));
      } catch (_) {}
    } catch (e) {
      console.warn("Could not save to site_settings:", e);
    }

    // 4. Sync to site_assets for hero banners
    if (folder === "hero" || sectionKey === "hero" || elementKey === "bg_image") {
      try {
        await supabase
          .from("site_assets")
          .update({ is_active: false })
          .eq("slot", "hero");

        await supabase.from("site_assets").insert({
          slot: "hero",
          image_url: url,
          is_active: true,
          name: isCarousel ? `Hero Carousel (${carouselImages.length} images)` : "Hero Banner",
          sort_order: 0,
        });
      } catch (assetErr) {
        console.warn("Could not sync to site_assets:", assetErr);
      }
    }

    // 5. Try page_content table if it exists
    try {
      await supabase.from("page_content" as any).upsert(
        {
          page_key: pageKey,
          section_key: sectionKey,
          element_key: elementKey,
          media_url: url,
          is_visible: true,
          metadata: {
            is_carousel: isCarousel,
            carousel_images: carouselImages,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page_key,section_key,element_key" }
      );
    } catch (_) {}
  };

  return (
    <div
      className={`relative inline-block group cursor-pointer ${containerClassName} ${
        isSelected ? "ve-selected" : "ve-editable"
      }`}
      style={{ borderRadius: "inherit" }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(key);
      }}
    >
      {isVideo ? (
        <video
          src={activeSrc}
          autoPlay
          loop
          muted
          playsInline
          className={`${className} ${!content.isVisible ? "opacity-30" : ""}`}
        />
      ) : (
        <img
          src={activeSrc}
          alt={alt}
          className={`${className} ${!content.isVisible ? "opacity-30" : ""}`}
          {...imgProps}
        />
      )}

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit] flex items-center justify-center gap-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(key);
            setModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-bengali shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>{currentLang === "en" ? "Change Media" : "ছবি বা ভিডিও পরিবর্তন"}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(key);
            setIsDrawerOpen(true);
          }}
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
        title={
          currentLang === "en"
            ? `Change Media — ${sectionKey} / ${elementKey}`
            : `ছবি বা ভিডিও পরিবর্তন — ${sectionKey} / ${elementKey}`
        }
        folder={folder}
        isCarouselInitial={!!(content as any)?.metadata?.is_carousel}
        carouselImagesInitial={(content as any)?.metadata?.carousel_images || []}
      />
    </div>
  );
};

export default EditableImage;

