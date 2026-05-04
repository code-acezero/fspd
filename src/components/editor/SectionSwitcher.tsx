// SectionSwitcher — floating list of all page blocks with drag-to-reorder.
// Visible only when admin/mod + editMode is on AND no specific block panel is open.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff, Pencil, Layers, X, GripVertical, Plus, Rocket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/contexts/AuthContext";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { BLOCK_LABELS } from "@/lib/pageBlocks";

const ALL_LANDING_KEYS = ["hero", "about", "services", "events_preview", "members", "footer"];
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

interface RowProps {
  page: string;
  blockKey: string;
  draggable?: boolean;
}

const SortableRow = ({ page, blockKey, draggable }: RowProps) => {
  const ck = `${page}:${blockKey}`;
  const { rows, setActiveBlock, setBlockVisible } = usePageBlocks();
  const row = rows[ck];
  const sortable = useSortable({ id: ck, disabled: !draggable });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  if (!row) return null;
  const visible = row.visible;
  const dirty = row.has_unpublished_changes;
  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`flex items-center gap-1 p-2 rounded-lg group ${sortable.isDragging ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-muted/40"}`}
    >
      {draggable && (
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{BLOCK_LABELS[blockKey] ?? blockKey}</span>
          {dirty && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-warning/15 text-warning font-semibold uppercase tracking-wide">Draft</span>}
        </div>
        <p className="text-[10px] text-muted-foreground">{visible ? "Visible to visitors" : "Hidden"}</p>
      </div>
      <button
        onClick={() => setBlockVisible(blockKey, !visible, page)}
        className={`p-1.5 rounded-full ${visible ? "hover:bg-destructive/15 text-muted-foreground hover:text-destructive" : "hover:bg-success/15 text-success"}`}
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

const SectionSwitcher = () => {
  const { role } = useAuth();
  const { editMode, setEditMode } = useVisualEditor();
  const {
    rows, activeBlock, setPreviewDraft, getOrderedKeys, reorderBlocks, setBlockVisible,
    dirtyKeys, publishAll, saving,
  } = usePageBlocks();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [publishingAll, setPublishingAll] = useState(false);

  useEffect(() => { setPreviewDraft(editMode); }, [editMode, setPreviewDraft]);

  const isEditor = role === "admin" || role === "moderator";
  const open = isEditor && editMode && activeBlock === null;

  const currentPage = useMemo(
    () => ROUTE_TO_PAGE.find((r) => r.test.test(pathname))?.page ?? null,
    [pathname]
  );

  // For landing: ordered list comes from DB (footer pinned last visually);
  // hidden blocks appear in the same list, just toggleable. Reorder via DnD.
  const landingOrdered = useMemo(() => {
    if (currentPage !== "landing") return [];
    const fromDb = getOrderedKeys("landing").filter((k) => ALL_LANDING_KEYS.includes(k));
    if (fromDb.length === 0) return ALL_LANDING_KEYS;
    // include any landing keys that exist in rows but missing from order (defensive)
    const missing = ALL_LANDING_KEYS.filter((k) => rows[`landing:${k}`] && !fromDb.includes(k));
    return [...fromDb, ...missing];
  }, [currentPage, getOrderedKeys, rows]);

  // "Add block" — landing keys that aren't present in rows at all (rare; allows recovery)
  const missingLandingKeys = useMemo(
    () => ALL_LANDING_KEYS.filter((k) => !rows[`landing:${k}`]),
    [rows]
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = landingOrdered.map((k) => `landing:${k}`);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(landingOrdered, oldIdx, newIdx);
    reorderBlocks("landing", next);
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
            {currentPage === "landing" && (
              <div className="mb-2">
                <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Landing Page</p>
                  {missingLandingKeys.length > 0 && (
                    <button
                      onClick={() => setShowAddMenu((s) => !s)}
                      className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
                {showAddMenu && missingLandingKeys.length > 0 && (
                  <div className="mx-2 mb-2 p-2 rounded-lg border border-dashed border-border space-y-1">
                    {missingLandingKeys.map((k) => (
                      <button
                        key={k}
                        onClick={async () => {
                          // Re-enable by setting visible=true (row may exist but hidden);
                          // if row truly missing, this is a no-op until DB seeds it.
                          await setBlockVisible(k, true, "landing");
                          setShowAddMenu(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1 rounded hover:bg-primary/10"
                      >
                        + {BLOCK_LABELS[k] ?? k}
                      </button>
                    ))}
                  </div>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={landingOrdered.map((k) => `landing:${k}`)} strategy={verticalListSortingStrategy}>
                    {landingOrdered.map((key) => (
                      <SortableRow key={key} page="landing" blockKey={key} draggable />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {currentPage && currentPage !== "landing" && (
              <div className="mb-2">
                <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {currentPage[0].toUpperCase()}{currentPage.slice(1)} Page
                </p>
                <SortableRow page={currentPage} blockKey="page_hero" />
                {currentPage === "about" && (
                  <>
                    <SortableRow page="about" blockKey="body_intro" />
                    <SortableRow page="about" blockKey="stats" />
                    <SortableRow page="about" blockKey="anniversaries" />
                    <SortableRow page="about" blockKey="honoured" />
                    <SortableRow page="about" blockKey="body_outro" />
                  </>
                )}
                {(currentPage === "blog" || currentPage === "events" || currentPage === "courses") && (
                  <SortableRow page={currentPage} blockKey="listing" />
                )}
              </div>
            )}

            <div className="mb-2">
              <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Global</p>
              {GLOBAL_ORDER.map(({ page, key }) => (
                <SortableRow key={`${page}:${key}`} page={page} blockKey={key} />
              ))}
            </div>
          </div>

          <div className="border-t border-border bg-muted/20">
            {(() => {
              const dirty = dirtyKeys();
              const dirtyOnPage = currentPage ? dirty.filter((d) => d.page === currentPage).length : 0;
              const totalDirty = dirty.length;
              if (totalDirty === 0) {
                return (
                  <p className="px-4 py-2 text-[10px] text-muted-foreground">
                    Drag <GripVertical className="inline w-3 h-3" /> to reorder. All changes published.
                  </p>
                );
              }
              return (
                <div className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold">{totalDirty} unpublished {totalDirty === 1 ? "draft" : "drafts"}</p>
                    {dirtyOnPage > 0 && currentPage && (
                      <p className="text-[10px] text-muted-foreground">{dirtyOnPage} on this page</p>
                    )}
                  </div>
                  <button
                    disabled={publishingAll || saving}
                    onClick={async () => {
                      setPublishingAll(true);
                      const { ok, failed } = await publishAll();
                      setPublishingAll(false);
                      toast({
                        title: failed === 0 ? "All drafts published" : `Published ${ok}, failed ${failed}`,
                        description: `${ok} block${ok === 1 ? "" : "s"} are now live for visitors.`,
                        variant: failed > 0 ? "destructive" : "default",
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 disabled:opacity-50"
                  >
                    {publishingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                    Publish all
                  </button>
                </div>
              );
            })()}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SectionSwitcher;
