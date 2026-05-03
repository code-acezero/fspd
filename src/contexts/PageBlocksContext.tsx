// PageBlocksContext — loads + caches page block configs from Supabase.
// Phase 1: only the landing.hero block is wired.
// Editors can read draft (preview), publish (push draft → published_config),
// or revert (copy published → draft).

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mergeHeroConfig, type HeroConfig } from "@/lib/pageBlocks";

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
}

interface PageBlocksContextType {
  /** Public-facing config (published or draft if previewing). */
  hero: HeroConfig;
  heroVisible: boolean;
  /** Draft config (for the editor panel). */
  heroDraft: HeroConfig;
  heroRow: BlockRow | null;
  /** When true, the live page renders draft instead of published. */
  previewDraft: boolean;
  setPreviewDraft: (v: boolean) => void;
  /** Update draft locally + persist to DB (auto-save while editing). */
  updateHeroDraft: (patch: Partial<HeroConfig> | ((prev: HeroConfig) => HeroConfig)) => Promise<void>;
  setHeroVisible: (v: boolean) => Promise<void>;
  publishHero: () => Promise<void>;
  revertHeroDraft: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const PageBlocksContext = createContext<PageBlocksContextType | null>(null);

export const PageBlocksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [heroRow, setHeroRow] = useState<BlockRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(false);

  const fetchBlocks = useCallback(async () => {
    const { data } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page", "landing")
      .eq("block_key", "hero")
      .maybeSingle();
    if (data) setHeroRow(data as BlockRow);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const heroDraft = mergeHeroConfig(heroRow?.draft_config);
  const heroPublished = mergeHeroConfig(heroRow?.published_config);
  const hero = previewDraft ? heroDraft : heroPublished;
  const heroVisible = heroRow?.visible ?? true;

  const updateHeroDraft = useCallback(async (
    patch: Partial<HeroConfig> | ((prev: HeroConfig) => HeroConfig)
  ) => {
    if (!heroRow) return;
    const next = typeof patch === "function"
      ? patch(heroDraft)
      : mergeHeroConfig({ ...heroDraft, ...patch });
    // Optimistic local update
    setHeroRow({ ...heroRow, draft_config: next, has_unpublished_changes: true });
    setSaving(true);
    await supabase
      .from("page_blocks")
      .update({ draft_config: next as any, updated_by: user?.id ?? null })
      .eq("id", heroRow.id);
    setSaving(false);
  }, [heroRow, heroDraft, user?.id]);

  const setHeroVisible = useCallback(async (v: boolean) => {
    if (!heroRow) return;
    setHeroRow({ ...heroRow, visible: v });
    await supabase.from("page_blocks").update({ visible: v }).eq("id", heroRow.id);
  }, [heroRow]);

  const publishHero = useCallback(async () => {
    if (!heroRow) return;
    setSaving(true);
    const { data } = await supabase
      .from("page_blocks")
      .update({
        published_config: heroRow.draft_config as any,
        has_unpublished_changes: false,
        published_at: new Date().toISOString(),
        published_by: user?.id ?? null,
      })
      .eq("id", heroRow.id)
      .select()
      .maybeSingle();
    if (data) setHeroRow(data as BlockRow);
    setSaving(false);
  }, [heroRow, user?.id]);

  const revertHeroDraft = useCallback(async () => {
    if (!heroRow) return;
    setSaving(true);
    const { data } = await supabase
      .from("page_blocks")
      .update({
        draft_config: heroRow.published_config as any,
        has_unpublished_changes: false,
      })
      .eq("id", heroRow.id)
      .select()
      .maybeSingle();
    if (data) setHeroRow(data as BlockRow);
    setSaving(false);
  }, [heroRow]);

  return (
    <PageBlocksContext.Provider value={{
      hero, heroVisible, heroDraft, heroRow, previewDraft, setPreviewDraft,
      updateHeroDraft, setHeroVisible, publishHero, revertHeroDraft,
      refresh: fetchBlocks, loading, saving,
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
