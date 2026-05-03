// PageBlocksContext — generic loader for ALL page blocks across ALL pages.
// Phase 3: loads landing + global + secondary-page blocks in one shot.
// Editors keyed by `${page}:${block_key}` internally; convenience helpers
// keep landing-page back-compat (single block_key string).

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  mergeHeroConfig, mergeSectionConfig,
  mergeServicesConfig, mergeNavConfig, mergeFooterLinksConfig,
  mergeAboutConfig, mergeEventsConfig, mergeMembersConfig,
  type HeroConfig, type SectionConfig, type AnyBlockKey,
  type ServicesSectionConfig, type NavConfig, type FooterLinksConfig,
  type AboutSectionConfig, type EventsSectionConfig, type MembersSectionConfig,
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

// internal storage key — `${page}:${block_key}`
const k = (page: string, key: string) => `${page}:${key}`;

interface PageBlocksContextType {
  // raw rows by composite key
  rows: Record<string, BlockRow>;
  loading: boolean;
  saving: boolean;

  // preview toggle (admin draft preview)
  previewDraft: boolean;
  setPreviewDraft: (v: boolean) => void;

  // currently-selected block in the editor (composite key `${page}:${block_key}`, or null)
  activeBlock: string | null;
  setActiveBlock: (k: string | null) => void;

  // ---- hero (back-compat for HeroEditorPanel + HeroSection) ----
  hero: HeroConfig;
  heroVisible: boolean;
  heroDraft: HeroConfig;
  heroRow: BlockRow | null;
  updateHeroDraft: (patch: Partial<HeroConfig> | ((prev: HeroConfig) => HeroConfig)) => Promise<void>;
  setHeroVisible: (v: boolean) => Promise<void>;
  publishHero: () => Promise<void>;
  revertHeroDraft: () => Promise<void>;

  // ---- generic helpers (default page = "landing" for back-compat) ----
  getSection: (key: string, page?: string) => SectionConfig;
  getSectionDraft: (key: string, page?: string) => SectionConfig;
  getRow: (key: string, page?: string) => BlockRow | null;
  isVisible: (key: string, page?: string) => boolean;
  updateSectionDraft: (key: string, patch: Partial<SectionConfig> | ((prev: SectionConfig) => SectionConfig), page?: string) => Promise<void>;
  setBlockVisible: (key: string, v: boolean, page?: string) => Promise<void>;
  publishBlock: (key: string, page?: string) => Promise<void>;
  revertBlockDraft: (key: string, page?: string) => Promise<void>;

  // ---- raw draft updater (for blocks that aren't pure SectionConfig: services items, nav, footer_links) ----
  updateRawDraft: (key: string, patch: any | ((prev: any) => any), page?: string) => Promise<void>;
  getRawPublished: (key: string, page?: string) => any;
  getRawDraft: (key: string, page?: string) => any;

  // ---- typed helpers for new blocks ----
  getServices: () => ServicesSectionConfig;
  getServicesDraft: () => ServicesSectionConfig;
  getNav: () => NavConfig;
  getNavDraft: () => NavConfig;
  getFooterLinks: () => FooterLinksConfig;
  getFooterLinksDraft: () => FooterLinksConfig;
  getAbout: () => AboutSectionConfig;
  getAboutDraft: () => AboutSectionConfig;
  getEventsPreview: () => EventsSectionConfig;
  getEventsPreviewDraft: () => EventsSectionConfig;
  getMembers: () => MembersSectionConfig;
  getMembersDraft: () => MembersSectionConfig;

  // ---- ordering ----
  reorderBlocks: (page: string, orderedKeys: string[]) => Promise<void>;
  getOrderedKeys: (page: string) => string[];

  refresh: () => Promise<void>;
}

const PageBlocksContext = createContext<PageBlocksContextType | null>(null);

export const PageBlocksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record<string, BlockRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(false);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    const { data } = await supabase
      .from("page_blocks")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) {
      const map: Record<string, BlockRow> = {};
      for (const r of data as BlockRow[]) map[k(r.page, r.block_key)] = r;
      setRows(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  // -------- generic helpers (default landing for back-compat) --------
  const getRow = useCallback((key: string, page = "landing") => rows[k(page, key)] ?? null, [rows]);
  const isVisible = useCallback((key: string, page = "landing") => rows[k(page, key)]?.visible ?? true, [rows]);

  const persistDraft = useCallback(async (row: BlockRow, next: any) => {
    const ck = k(row.page, row.block_key);
    setRows((prev) => ({ ...prev, [ck]: { ...row, draft_config: next, has_unpublished_changes: true } }));
    setSaving(true);
    await supabase
      .from("page_blocks")
      .update({ draft_config: next, updated_by: user?.id ?? null })
      .eq("id", row.id);
    setSaving(false);
  }, [user?.id]);

  const setBlockVisible = useCallback(async (key: string, v: boolean, page = "landing") => {
    const row = rows[k(page, key)]; if (!row) return;
    setRows((prev) => ({ ...prev, [k(page, key)]: { ...row, visible: v } }));
    await supabase.from("page_blocks").update({ visible: v }).eq("id", row.id);
  }, [rows]);

  const publishBlock = useCallback(async (key: string, page = "landing") => {
    const row = rows[k(page, key)]; if (!row) return;
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
    if (data) setRows((prev) => ({ ...prev, [k(page, key)]: data as BlockRow }));
    setSaving(false);
  }, [rows, user?.id]);

  const revertBlockDraft = useCallback(async (key: string, page = "landing") => {
    const row = rows[k(page, key)]; if (!row) return;
    setSaving(true);
    const { data } = await supabase
      .from("page_blocks")
      .update({ draft_config: row.published_config, has_unpublished_changes: false })
      .eq("id", row.id).select().maybeSingle();
    if (data) setRows((prev) => ({ ...prev, [k(page, key)]: data as BlockRow }));
    setSaving(false);
  }, [rows]);

  // -------- section-typed helpers --------
  const getSection = useCallback((key: string, page = "landing"): SectionConfig => {
    const r = rows[k(page, key)];
    return mergeSectionConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);

  const getSectionDraft = useCallback((key: string, page = "landing"): SectionConfig => {
    return mergeSectionConfig(rows[k(page, key)]?.draft_config);
  }, [rows]);

  const updateSectionDraft = useCallback(async (
    key: string,
    patch: Partial<SectionConfig> | ((prev: SectionConfig) => SectionConfig),
    page = "landing",
  ) => {
    const row = rows[k(page, key)]; if (!row) return;
    const prev = mergeSectionConfig(row.draft_config);
    const next = typeof patch === "function" ? patch(prev) : mergeSectionConfig({ ...prev, ...patch });
    // preserve any non-SectionConfig fields (e.g., services items)
    const merged = { ...row.draft_config, ...next };
    await persistDraft(row, merged);
  }, [rows, persistDraft]);

  // raw draft updater — for non-Section configs (services items, nav, footer_links)
  const updateRawDraft = useCallback(async (
    key: string,
    patch: any | ((prev: any) => any),
    page = "landing",
  ) => {
    const row = rows[k(page, key)]; if (!row) return;
    const prev = row.draft_config ?? {};
    const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
    await persistDraft(row, next);
  }, [rows, persistDraft]);

  const getRawPublished = useCallback((key: string, page = "landing") => rows[k(page, key)]?.published_config ?? {}, [rows]);
  const getRawDraft = useCallback((key: string, page = "landing") => rows[k(page, key)]?.draft_config ?? {}, [rows]);

  // -------- typed helpers --------
  const getServices = useCallback((): ServicesSectionConfig => {
    const r = rows[k("landing", "services")];
    return mergeServicesConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getServicesDraft = useCallback(() => mergeServicesConfig(rows[k("landing", "services")]?.draft_config), [rows]);

  const getNav = useCallback((): NavConfig => {
    const r = rows[k("global", "nav")];
    return mergeNavConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getNavDraft = useCallback(() => mergeNavConfig(rows[k("global", "nav")]?.draft_config), [rows]);

  const getFooterLinks = useCallback((): FooterLinksConfig => {
    const r = rows[k("global", "footer_links")];
    return mergeFooterLinksConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getFooterLinksDraft = useCallback(() => mergeFooterLinksConfig(rows[k("global", "footer_links")]?.draft_config), [rows]);

  const getAbout = useCallback((): AboutSectionConfig => {
    const r = rows[k("landing", "about")];
    return mergeAboutConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getAboutDraft = useCallback(() => mergeAboutConfig(rows[k("landing", "about")]?.draft_config), [rows]);

  const getEventsPreview = useCallback((): EventsSectionConfig => {
    const r = rows[k("landing", "events_preview")];
    return mergeEventsConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getEventsPreviewDraft = useCallback(() => mergeEventsConfig(rows[k("landing", "events_preview")]?.draft_config), [rows]);

  const getMembers = useCallback((): MembersSectionConfig => {
    const r = rows[k("landing", "members")];
    return mergeMembersConfig(previewDraft ? r?.draft_config : r?.published_config);
  }, [rows, previewDraft]);
  const getMembersDraft = useCallback(() => mergeMembersConfig(rows[k("landing", "members")]?.draft_config), [rows]);

  // -------- hero back-compat --------
  const heroRow = rows[k("landing", "hero")] ?? null;
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

  // -------- ordering --------
  const getOrderedKeys = useCallback((page: string) => {
    return Object.values(rows)
      .filter((r) => r.page === page)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((r) => r.block_key);
  }, [rows]);

  const reorderBlocks = useCallback(async (page: string, orderedKeys: string[]) => {
    // optimistic update
    setRows((prev) => {
      const next = { ...prev };
      orderedKeys.forEach((key, idx) => {
        const ck = k(page, key);
        if (next[ck]) next[ck] = { ...next[ck], sort_order: idx };
      });
      return next;
    });
    setSaving(true);
    await Promise.all(orderedKeys.map((key, idx) => {
      const row = rows[k(page, key)];
      if (!row) return Promise.resolve();
      return supabase.from("page_blocks").update({ sort_order: idx }).eq("id", row.id);
    }));
    setSaving(false);
  }, [rows]);

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
      updateRawDraft, getRawPublished, getRawDraft,
      getServices, getServicesDraft,
      getNav, getNavDraft,
      getFooterLinks, getFooterLinksDraft,
      getAbout, getAboutDraft,
      getEventsPreview, getEventsPreviewDraft,
      getMembers, getMembersDraft,
      reorderBlocks, getOrderedKeys,
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
