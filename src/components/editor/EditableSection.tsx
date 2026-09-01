import { ReactNode } from "react";
import { Eye, EyeOff, Layers, SlidersHorizontal } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";

interface EditableSectionProps {
  pageKey: string;
  sectionKey: string;
  sectionTitle?: string;
  className?: string;
  children: ReactNode;
}

export const EditableSection = ({
  pageKey,
  sectionKey,
  sectionTitle,
  className = "",
  children,
}: EditableSectionProps) => {
  const {
    editMode,
    selectedElement,
    setSelectedElement,
    getContent,
    updateContent,
    setIsDrawerOpen,
  } = useVisualEditor();

  const key = `${pageKey}:${sectionKey}:__section__`;
  const isSelected = selectedElement === key;

  const content = getContent(pageKey, sectionKey, "__section__", {
    isVisible: true,
  });

  if (!content.isVisible && !editMode) {
    return null;
  }

  const toggleVisibility = () => {
    updateContent(pageKey, sectionKey, "__section__", {
      is_visible: !content.isVisible,
    });
  };

  return (
    <section
      id={sectionKey}
      className={`relative ${className} ${
        editMode
          ? isSelected
            ? "ve-section-selected"   // CSS outline — zero layout impact
            : "ve-section-hover"
          : ""
      } ${!content.isVisible && editMode ? "opacity-40 grayscale" : ""}`}
      onClick={(e) => {
        if (editMode) {
          e.stopPropagation();
          setSelectedElement(key);
        }
      }}
    >
      {/* Section Header Toolbar in Edit Mode */}
      {editMode && (
        <div className="absolute top-2 left-4 z-40 flex items-center gap-1.5 bg-slate-900/90 text-white backdrop-blur px-3 py-1 rounded-full text-xs shadow-lg border border-white/20">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="font-bengali font-semibold text-[11px]">
            {sectionTitle || sectionKey}
          </span>
          <div className="w-px h-3 bg-white/20 mx-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleVisibility(); }}
            className={`p-1 rounded-full hover:bg-white/20 transition-colors ${
              !content.isVisible ? "text-destructive" : "text-primary"
            }`}
            title={content.isVisible ? "Hide Section" : "Show Section"}
          >
            {content.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedElement(key); setIsDrawerOpen(true); }}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Section Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {children}
    </section>
  );
};

export default EditableSection;
