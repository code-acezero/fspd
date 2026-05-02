import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Move, RotateCcw, Trash2, Eye, EyeOff } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";

interface EditableElementProps {
  id: string;
  children: ReactNode;
  className?: string;
}

const EditableElement = ({ id, children, className = "" }: EditableElementProps) => {
  const { editMode, selectedElement, setSelectedElement, overrides, updateOverride, resetOverride } = useVisualEditor();
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const override = overrides[id];

  if (!editMode) {
    if (override && !override.visible) return null;
    return (
      <div
        className={className}
        style={override ? {
          transform: `translate(${override.x}px, ${override.y}px) rotate(${override.rotation}deg) scale(${override.scale})`,
        } : undefined}
      >
        {children}
      </div>
    );
  }

  const isSelected = selectedElement === id;

  return (
    <motion.div
      ref={ref}
      className={`relative group ${className}`}
      style={{
        transform: override ? `translate(${override.x}px, ${override.y}px) rotate(${override.rotation}deg) scale(${override.scale})` : undefined,
        outline: isSelected ? "2px solid hsl(var(--primary))" : "1px dashed hsl(var(--primary) / 0.3)",
        outlineOffset: "2px",
        cursor: dragging ? "grabbing" : "grab",
        opacity: override && !override.visible ? 0.3 : 1,
      }}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
      drag
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        updateOverride(id, {
          x: (override?.x || 0) + info.offset.x,
          y: (override?.y || 0) + info.offset.y,
        });
      }}
    >
      {children}

      {isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-foreground text-primary-foreground rounded-full px-2 py-1 shadow-xl z-[100]">
          <button onClick={(e) => { e.stopPropagation(); updateOverride(id, { rotation: (override?.rotation || 0) - 15 }); }} className="p-1 hover:bg-primary-foreground/10 rounded-full" title="Rotate left">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateOverride(id, { rotation: (override?.rotation || 0) + 15 }); }} className="p-1 hover:bg-primary-foreground/10 rounded-full" title="Rotate right">
            <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateOverride(id, { scale: Math.min((override?.scale || 1) + 0.1, 2) }); }} className="p-1 hover:bg-primary-foreground/10 rounded-full text-xs font-bold" title="Scale up">
            +
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateOverride(id, { scale: Math.max((override?.scale || 1) - 0.1, 0.3) }); }} className="p-1 hover:bg-primary-foreground/10 rounded-full text-xs font-bold" title="Scale down">
            −
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateOverride(id, { visible: !(override?.visible ?? true) }); }} className="p-1 hover:bg-primary-foreground/10 rounded-full" title="Toggle visibility">
            {override?.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); resetOverride(id); }} className="p-1 hover:bg-destructive/20 rounded-full" title="Reset">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Move className="w-3.5 h-3.5 opacity-50" />
        </div>
      )}
    </motion.div>
  );
};

export default EditableElement;
