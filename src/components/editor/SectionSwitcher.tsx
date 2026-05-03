// SectionSwitcher — a floating list of all landing-page blocks.
// Visible only when admin/mod + editMode is on AND no specific block panel is open.
// Lets the admin pick which section to edit and toggle visibility quickly.

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff, Pencil, Layers, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { BLOCK_LABELS } from "@/lib/pageBlocks";

// Group entries by section in the switcher.
const LANDING_ORDER: Array<{ page: string; key: string }> = [
  { page: "landing", key: "hero" },
  { page: "landing", key: "about" },
  { page: "landing", key: "services" },
  { page: "landing", key: "events_preview" },
  { page: "landing", key: "members" },
  { page: "landing", key: "footer" },
];
const GLOBAL_ORDER: Array<{ page: string; key: string }> = [
  { page: "global", key: "nav" },
  { page: "global", key: "footer_links" },
];

const ROUTE_TO_PAGE: Array<{ test: RegExp; page: string }> = [
  { test: /^\/(home)?$/, page: "landing" },
  { test: /^\/about/, page: "about" },
  { test: /^\/members/, page: "members" },
  { test: /^\/blog/, page: "blog" },
  { test: /^\/events/, page: "events" },
  { test: /^\/courses/, page: "courses" },
];

const SectionSwitcher = () => {
  const { role } = useAuth();
  const { editMode, setEditMode } = useVisualEditor();
  const { rows, activeBlock, setActiveBlock, setBlockVisible, setPreviewDraft } = usePageBlocks();
  const { pathname } = useLocation();

  useEffect(() => { setPreviewDraft(editMode); }, [editMode, setPreviewDraft]);

  const isEditor = role === "admin" || role === "moderator";
  const open = isEditor && editMode && activeBlock === null;

  // Build groups based on current route. Landing page shows landing sections;
  // secondary pages show their own page_hero. Global blocks always show.
  const groups = useMemo(() => {
    const currentPage = ROUTE_TO_PAGE.find((r) => r.test.test(pathname))?.page ?? null;
    const result: Array<{ title: string; entries: Array<{ page: string; key: string }> }> = [];

    if (currentPage === "landing") {
      result.push({ title: "Landing Page", entries: LANDING_ORDER });
    } else if (currentPage) {
      result.push({ title: `${currentPage[0].toUpperCase()}${currentPage.slice(1)} Page`, entries: [{ page: currentPage, key: "page_hero" }] });
    }
    result.push({ title: "Global", entries: GLOBAL_ORDER });
    return result;
  }, [pathname]);

  const renderRow = ({ page, key }: { page: string; key: string }) => {
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
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-4 top-4 w-[340px] max-h-[80vh] z-[210] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
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

          <div className="p-2 overflow-y-auto flex-1">
            {groups.map((g) => (
              <div key={g.title} className="mb-2">
                <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</p>
                {g.entries.map(renderRow)}
              </div>
            ))}
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
