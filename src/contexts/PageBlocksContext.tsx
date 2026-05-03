// PageBlocksContext — generic loader for ALL page blocks on a given page.
// Phase 2: supports hero + about/services/events_preview/members/footer.
// Editors read draft (preview), publish (push draft → published_config),
// or revert (copy published → draft). Each row keyed by (page, block_key).

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  mergeHeroConfig, mergeSectionConfig,
  type HeroConfig, type SectionConfig, type AnyBlockKey,
} from "@/lib/pageBlocks";

interface BlockRow {
  id: string;
  page: string;
  block_key: string;
  visible: boolean;
  draft_config: any;
  published_config: any;
  has_unpublished_changes: boolean;
  updated_at: string;
  published_at: string | null;
  sort_order: number;
}

interface PageBlocksContextType {
  // raw rows
  rows: Record<string, BlockRow>;
  loading: boolean;
  saving: boolean;

  // preview toggle (admin draft preview)
  previewDraft: boolean;
  setPreviewDraft: (v: boolean) => void;

  // currently-selected block in the editor (null = nothing open)
  activeBlock: AnyBlockKey | null;
  setActiveBlock: (k: AnyBlockKey | null) => void;

  // ---- hero (back-compat for HeroEditorPanel + HeroSection) ----
  hero: HeroConfig;
  heroVisible: boolean;
  heroDraft: HeroConfig;
  heroRow: BlockRow | null;
  updateHeroDraft: (patch: Partial<HeroConfig> | ((prev: HeroConfig) => HeroConfig)) => Promise<void>;
  setHeroVisible: (v: boolean) => Promise<void>;
  publishHero: () => Promise<void>;
  revertHeroDraft: () => Promise<void>;

  // ---- generic section helpers ----
  getSection: (key: string) => SectionConfig;
  getSectionDraft: (key: string) => SectionConfig;
  getRow: (key: string) => BlockRow | null;
  isVisible: (key: string) => boolean;
  updateSectionDraft: (key: string, patch: Partial<SectionConfig> | ((prev: SectionConfig) => SectionConfig)) => Promise<void>;
  setBlockVisible: (key: string, v: boolean) => Promise<void>;
  publishBlock: (key: string) => Promise<void>;
  revertBlockDraft: (key: string) => Promise<void>;

  refresh: () => Promise<void>;
}

const PageBlocksContext = createContext<PageBlocksContextType | null>(null);

export const PageBlocksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record<string, BlockRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(false);
  const [activeBlock, setActiveBlock] = useState<AnyBlockKey | null>(null);

  const fetchBlocks = useCallback(async () => {
    const { data } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page", "landing")
      .order("sort_order", { ascending: true });
    if (data) {
      const map: Record<string, BlockRow> = {};
      for (const r of data as BlockRow[]) map[r.block_key] = r;
      setRows(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  // When admin closes edit mode entirely, also close any open block panel + preview.
  // (preview toggle is otherwise driven by the active panel.)


  // -------- generic helpers --------
  const getRow = useCallback((key: string) => rows[key] ?? null, [rows]);
  const isVisible = useCallback((key: string) => rows[key]?.visible ?? true, [rows]);

  const persistDraft = useCallback(async (row: BlockRow, next: any) => {
    setRows((prev) => ({ ...prev, [row.block_key]: { ...row, draft_config: next, has_unpublished_changes: true } }));
    setSaving(true);
    await supabase
      .from("page_blocks")
      .update({ draft_config: next, updated_by: user?.id ?? null })
      .eq("id", row.id);
    setSaving(false);
  }, [user?.id]);

  const setBlockVisible = useCallback(async (key: string, v: boolean) => {
    const row = rows[key]; if (!row) return;
    setRows((prev) => ({ ...prev, [key]: { ...row, visible: v } }));
    await supabase.from("page_blocks").update({ visible: v }).eq("id", row.id);
  }, [rows]);

  const publishBlock = useCallback(async (key: string) => {
    const row = rows[key]; if (!row) return;
    setSaving(true);
    const { data } = await supabase
      .from("page_blocks")
      .update({
        published_config: row.draft_config,
        has_unpublished_changes: false,
        published_at: new Date().toISOString(),
        published_by: user?.id ?? null,
      })
      .eq("id", row.id).select().maybeSingle();
    if (data) setRows((prev) => ({ ...prev, [key]: data as BlockRow }));
    setSaving(false);
  }, [rows, user?.id]);

  const revertBlockDraft = useCallback(async (key: string) => {
    const row = rows[key]; if (!row) return;
    setSaving(true);
    const { data } = await supabase
      .from("page_blocks")
      .update({ draft_config: row.published_config, has_unpublished_changes: false })
      .eq("id", row.id).select().maybeSingle();
    if (data) setRows((prev) => ({ ...prev, [key]: data as BlockRow }));
    setSaving(false);
  }, [rows]);

  // -------- section-typed helpers --------
  const getSection = useCallback((key: string): SectionConfig => {
    const r = rows[key];
    return mergeSectionConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);

  const getSectionDraft = useCallback((key: string): SectionConfig => {
    return mergeSectionConfig(rows[key]?.draft_config);
  }, [rows]);

  const updateSectionDraft = useCallback(async (
    key: string,
    patch: Partial<SectionConfig> | ((prev: SectionConfig) => SectionConfig),
  ) => {
    const row = rows[key]; if (!row) return;
    const prev = mergeSectionConfig(row.draft_config);
    const next = typeof patch === "function" ? patch(prev) : mergeSectionConfig({ ...prev, ...patch });
    await persistDraft(row, next);
  }, [rows, persistDraft]);

  // -------- hero back-compat --------
  const heroRow = rows["hero"] ?? null;
  const heroDraft = useMemo(() => mergeHeroConfig(heroRow?.draft_config), [heroRow]);
  const heroPublished = useMemo(() => mergeHeroConfig(heroRow?.published_config), [heroRow]);
  const hero = previewDraft ? heroDraft : heroPublished;
  const heroVisible = heroRow?.visible ?? true;

  const updateHeroDraft = useCallback(async (
    patch: Partial<HeroConfig> | ((prev: HeroConfig) => HeroConfig),
  ) => {
    if (!heroRow) return;
    const next = typeof patch === "function" ? patch(heroDraft) : mergeHeroConfig({ ...heroDraft, ...patch });
    await persistDraft(heroRow, next);
  }, [heroRow, heroDraft, persistDraft]);

  const setHeroVisible = useCallback((v: boolean) => setBlockVisible("hero", v), [setBlockVisible]);
  const publishHero = useCallback(() => publishBlock("hero"), [publishBlock]);
  const revertHeroDraft = useCallback(() => revertBlockDraft("hero"), [revertBlockDraft]);

  return (
    <PageBlocksContext.Provider value={{
      rows, loading, saving,
      previewDraft, setPreviewDraft,
      activeBlock, setActiveBlock,
      hero, heroVisible, heroDraft, heroRow,
      updateHeroDraft, setHeroVisible, publishHero, revertHeroDraft,
      getSection, getSectionDraft, getRow, isVisible,
      updateSectionDraft, setBlockVisible, publishBlock, revertBlockDraft,
      refresh: fetchBlocks,
    }}>
      {children}
    </PageBlocksContext.Provider>
  );
};

export const usePageBlocks = () => {
  const ctx = useContext(PageBlocksContext);
  if (!ctx) throw new Error("usePageBlocks must be inside PageBlocksProvider");
  return ctx;
};
