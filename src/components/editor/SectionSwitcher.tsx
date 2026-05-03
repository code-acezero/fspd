// SectionSwitcher — a floating list of all landing-page blocks.
// Visible only when admin/mod + editMode is on AND no specific block panel is open.
// Lets the admin pick which section to edit and toggle visibility quickly.

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Pencil, Layers, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { BLOCK_LABELS } from "@/lib/pageBlocks";

// Composite [page, block_key] entries. Switcher only shows entries that exist
// in the loaded rows for the current page context.
const ORDER: Array<{ page: string; key: string }> = [
  { page: "landing", key: "hero" },
  { page: "landing", key: "about" },
  { page: "landing", key: "services" },
  { page: "landing", key: "events_preview" },
  { page: "landing", key: "members" },
  { page: "landing", key: "footer" },
];

const SectionSwitcher = () => {
  const { role } = useAuth();
  const { editMode, setEditMode } = useVisualEditor();
  const { rows, activeBlock, setActiveBlock, setBlockVisible, setPreviewDraft } = usePageBlocks();

  useEffect(() => { setPreviewDraft(editMode); }, [editMode, setPreviewDraft]);

  const isEditor = role === "admin" || role === "moderator";
  const open = isEditor && editMode && activeBlock === null;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-4 top-4 w-[340px] z-[210] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Page Sections</p>
            </div>
            <button onClick={() => setEditMode(false)} className="p-1.5 rounded-full hover:bg-foreground/10" title="Exit edit mode">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 max-h-[70vh] overflow-y-auto">
            {ORDER.map(({ page, key }) => {
              const ck = `${page}:${key}`;
              const row = rows[ck];
              if (!row) return null;
              const visible = row.visible;
              const dirty = row.has_unpublished_changes;
              return (
                <div key={ck} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{BLOCK_LABELS[key] ?? key}</span>
                      {dirty && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-semibold uppercase tracking-wide">Draft</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{visible ? "Visible to visitors" : "Hidden"}</p>
                  </div>
                  <button
                    onClick={() => setBlockVisible(key, !visible, page)}
                    className={`p-1.5 rounded-full ${visible ? "hover:bg-destructive/15 text-muted-foreground hover:text-destructive" : "hover:bg-emerald-500/15 text-emerald-600"}`}
                    title={visible ? "Hide" : "Show"}
                  >
                    {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setActiveBlock(ck)}
                    className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground">
            Tip: edits autosave as draft. Publish from each section's panel to push live.
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SectionSwitcher;
