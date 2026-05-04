// RevisionsDialog — view, diff (vs current draft), and restore previous published configs.
// Snapshots are written by the snapshot_page_blocks_publish trigger (90-day retention).

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, RotateCcw, Loader2, FileText } from "lucide-react";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { useToast } from "@/hooks/use-toast";

interface HistoryRow {
  id: string;
  page: string;
  block_key: string;
  config: any;
  published_at: string;
  published_by: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  page: string;
  blockKey: string;
  blockLabel: string;
  /** current draft config, used for the "diff vs draft" view */
  currentDraft: any;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

// Naive line-by-line JSON diff highlight: pretty-prints both sides and marks
// added/removed lines. Good enough for a CMS audit log without pulling a diff lib.
const buildLineDiff = (a: any, b: any) => {
  const aLines = JSON.stringify(a ?? {}, null, 2).split("\n");
  const bLines = JSON.stringify(b ?? {}, null, 2).split("\n");
  const max = Math.max(aLines.length, bLines.length);
  const rows: Array<{ left: string; right: string; changed: boolean }> = [];
  for (let i = 0; i < max; i++) {
    const left = aLines[i] ?? "";
    const right = bLines[i] ?? "";
    rows.push({ left, right, changed: left !== right });
  }
  return rows;
};

const RevisionsDialog = ({ open, onClose, page, blockKey, blockLabel, currentDraft }: Props) => {
  const { fetchHistory, restoreRevision } = usePageBlocks();
  const { toast } = useToast();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<HistoryRow | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchHistory(blockKey, page).then((rows) => {
      setItems(rows);
      setSelected(rows[0] ?? null);
      setLoading(false);
    });
  }, [open, blockKey, page, fetchHistory]);

  const handleRestore = async () => {
    if (!selected) return;
    setRestoring(true);
    try {
      await restoreRevision(blockKey, page, selected.config);
      toast({ title: "Revision restored", description: `${blockLabel} restored to ${formatDate(selected.published_at)}` });
      onClose();
    } catch (e: any) {
      toast({ title: "Restore failed", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  const diff = selected ? buildLineDiff(selected.config, currentDraft) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Revision history — {blockLabel}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-foreground/10" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-[260px_1fr] min-h-0">
              {/* Revision list */}
              <aside className="border-r border-border overflow-y-auto bg-muted/20">
                {loading ? (
                  <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">
                    No revisions yet. Each Publish creates a snapshot here (kept 90 days).
                  </div>
                ) : (
                  <ul className="p-1.5">
                    {items.map((r) => {
                      const active = selected?.id === r.id;
                      return (
                        <li key={r.id}>
                          <button
                            onClick={() => setSelected(r)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start gap-2 ${active ? "bg-primary/15 text-primary" : "hover:bg-muted/60"}`}
                          >
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{formatDate(r.published_at)}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{r.id.slice(0, 8)}</p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </aside>

              {/* Diff viewer */}
              <main className="overflow-y-auto p-4">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Select a revision to view its contents.</p>
                ) : (
                  <>
                    <div className="mb-3 grid grid-cols-2 gap-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>This revision ({formatDate(selected.published_at)})</span>
                      <span>Current draft</span>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden text-[11px] font-mono">
                      <div className="grid grid-cols-2 max-h-[55vh] overflow-y-auto">
                        <pre className="p-3 bg-muted/30 whitespace-pre-wrap break-words border-r border-border">
                          {diff.map((d, i) => (
                            <div key={`l${i}`} className={d.changed ? "bg-destructive/10 text-destructive" : ""}>
                              {d.left || "\u00A0"}
                            </div>
                          ))}
                        </pre>
                        <pre className="p-3 bg-muted/10 whitespace-pre-wrap break-words">
                          {diff.map((d, i) => (
                            <div key={`r${i}`} className={d.changed ? "bg-success/10 text-success" : ""}>
                              {d.right || "\u00A0"}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </main>
            </div>

            <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Restoring writes to both draft and published immediately, and creates a new snapshot.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={!selected || restoring}
                  className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {restoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Restore this revision
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RevisionsDialog;
