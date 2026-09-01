import { ReactNode } from "react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { SlidersHorizontal, Eye, EyeOff } from "lucide-react";

interface EditableElementProps {
  id: string; // "page:section:element"
  children: ReactNode;
  className?: string;
  defaultBn?: string;
  defaultEn?: string;
}

export const EditableElement = ({
  id,
  children,
  className = "",
  defaultBn = "",
  defaultEn = "",
}: EditableElementProps) => {
  const parts = id.split(":");
  const pageKey = parts[0] || "global";
  const sectionKey = parts[1] || "general";
  const elementKey = parts[2] || parts[0];

  const {
    editMode,
    selectedElement,
    setSelectedElement,
    getContent,
    updateContent,
    setIsDrawerOpen,
  } = useVisualEditor();

  const isSelected = selectedElement === id;
  const content = getContent(pageKey, sectionKey, elementKey, {
    bn: defaultBn,
    en: defaultEn,
    isVisible: true,
  });

  if (!content.isVisible && !editMode) {
    return null;
  }

  if (!editMode) {
    return (
      <div className={className} style={content.styles}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative group ${className} ${
        isSelected
          ? "ring-2 ring-primary ring-offset-2 rounded-xl"
          : "hover:ring-1 hover:ring-primary/40 rounded-xl"
      } ${!content.isVisible ? "opacity-30" : ""}`}
      style={content.styles}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(id);
      }}
    >
      {children}

      {/* Floating Mini Controls */}
      <div
        className={`absolute -top-7 right-0 z-30 flex items-center gap-1 bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded-full shadow-lg border border-white/20 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            updateContent(pageKey, sectionKey, elementKey, {
              is_visible: !content.isVisible,
            });
          }}
          className="hover:text-primary transition-colors p-0.5"
          title={content.isVisible ? "Hide" : "Show"}
        >
          {content.isVisible ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-destructive" />}
        </button>
        <div className="w-px h-3 bg-white/20" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(id);
            setIsDrawerOpen(true);
          }}
          className="hover:text-primary transition-colors p-0.5"
          title="Open Settings"
        >
          <SlidersHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default EditableElement;
