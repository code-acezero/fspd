import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export interface PageContentItem {
  id?: string;
  page_key: string;
  section_key: string;
  element_key: string;
  content_bn: string;
  content_en: string;
  media_url: string;
  styles: Record<string, any>;
  metadata: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export type PreviewDevice = "desktop" | "tablet" | "mobile";

interface ContentResolution {
  text: string;
  textBn: string;
  textEn: string;
  mediaUrl: string;
  styles: Record<string, any>;
  metadata: Record<string, any>;
  isVisible: boolean;
  sortOrder: number;
  isCustomized: boolean;
}

interface VisualEditorContextType {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  selectedElement: string | null;
  setSelectedElement: (key: string | null) => void;
  activeLanguage: "bn" | "en";
  setActiveLanguage: (lang: "bn" | "en") => void;
  previewDevice: PreviewDevice;
  setPreviewDevice: (device: PreviewDevice) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (v: boolean) => void;
  hasUnsavedChanges: boolean;
  unsavedCount: number;
  isSaving: boolean;
  isLoading: boolean;
  getContent: (
    pageKey: string,
    sectionKey: string,
    elementKey: string,
    fallback?: { bn?: string; en?: string; media?: string; styles?: Record<string, any>; isVisible?: boolean }
  ) => ContentResolution;
  updateContent: (
    pageKey: string,
    sectionKey: string,
    elementKey: string,
    updates: Partial<PageContentItem>
  ) => void;
  saveAllChanges: () => Promise<boolean>;
  discardChanges: () => void;
  resetElement: (pageKey: string, sectionKey: string, elementKey: string) => Promise<void>;
  imageElements: Set<string>;
  registerImageElement: (key: string) => void;
  unregisterImageElement: (key: string) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  editMode: false,
  setEditMode: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
  activeLanguage: "bn",
  setActiveLanguage: () => {},
  previewDevice: "desktop",
  setPreviewDevice: () => {},
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  hasUnsavedChanges: false,
  unsavedCount: 0,
  isSaving: false,
  isLoading: true,
  getContent: () => ({
    text: "",
    textBn: "",
    textEn: "",
    mediaUrl: "",
    styles: {},
    metadata: {},
    isVisible: true,
    sortOrder: 0,
    isCustomized: false,
  }),
  updateContent: () => {},
  saveAllChanges: async () => false,
  discardChanges: () => {},
  resetElement: async () => {},
  imageElements: new Set<string>(),
  registerImageElement: () => {},
  unregisterImageElement: () => {},
});

export const VisualEditorProvider = ({ children }: { children: ReactNode }) => {
  const { user, role } = useAuth();
  const { lang } = useLanguage();
  const { toast } = useToast();

  const [editMode, setEditModeState] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"bn" | "en">(lang);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Persisted content from Supabase
  const [persistedContent, setPersistedContent] = useState<Record<string, PageContentItem>>({});
  // In-memory draft changes
  const [draftContent, setDraftContent] = useState<Record<string, PageContentItem>>({});
  // Track keys that were explicitly modified
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Registry of element keys that are image elements (used by drawer to show image panel)
  const [imageElements, setImageElements] = useState<Set<string>>(new Set());
  const fallbackRegistry = useRef<Record<string, { bn?: string; en?: string; media?: string; styles?: Record<string, any>; isVisible?: boolean }>>({});

  const registerImageElement = useCallback((key: string) => {
    setImageElements((prev) => new Set(prev).add(key));
  }, []);

  const unregisterImageElement = useCallback((key: string) => {
    setImageElements((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isAdminOrMod = role === "admin" || role === "moderator";

  // Sync active language with site language unless manually toggled in editor
  useEffect(() => {
    setActiveLanguage(lang);
  }, [lang]);

  // If user loses admin permissions, disable edit mode
  useEffect(() => {
    if (!isAdminOrMod && editMode) {
      setEditModeState(false);
      setIsDrawerOpen(false);
    }
  }, [isAdminOrMod, editMode]);

  const setEditMode = (value: boolean) => {
    if (value && !isAdminOrMod) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can enable Visual Edit Mode.",
        variant: "destructive",
      });
      return;
    }
    setEditModeState(value);
    if (!value) {
      setIsDrawerOpen(false);
      setSelectedElement(null);
    }
  };

  // Fetch all page_content items on initialization
  const fetchPageContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_content" as any)
        .select("*");

      if (error) {
        console.warn("Could not load page_content table, will use default content:", error.message);
      } else if (data) {
        const map: Record<string, PageContentItem> = {};
        (data as any[]).forEach((row) => {
          const key = `${row.page_key}:${row.section_key}:${row.element_key}`;
          map[key] = {
            id: row.id,
            page_key: row.page_key,
            section_key: row.section_key,
            element_key: row.element_key,
            content_bn: row.content_bn || "",
            content_en: row.content_en || "",
            media_url: row.media_url || "",
            styles: (row.styles as Record<string, any>) || {},
            metadata: (row.metadata as Record<string, any>) || {},
            sort_order: row.sort_order ?? 0,
            is_visible: row.is_visible ?? true,
          };
        });
        setPersistedContent(map);
        setDraftContent(map);
        setDirtyKeys(new Set());
      }
    } catch (e) {
      console.error("Failed to fetch page_content:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  // Read content with fallback resolution
  const getContent = useCallback(
    (
      pageKey: string,
      sectionKey: string,
      elementKey: string,
      fallback?: { bn?: string; en?: string; media?: string; styles?: Record<string, any>; isVisible?: boolean }
    ): ContentResolution => {
      const key = `${pageKey}:${sectionKey}:${elementKey}`;
      if (fallback) {
        fallbackRegistry.current[key] = {
          ...fallbackRegistry.current[key],
          ...fallback,
        };
      }
      const effectiveFallback = fallback || fallbackRegistry.current[key];

      const item = draftContent[key] || persistedContent[key];

      const textBn = item?.content_bn !== undefined && item.content_bn !== "" ? item.content_bn : effectiveFallback?.bn || "";
      const textEn = item?.content_en !== undefined && item.content_en !== "" ? item.content_en : effectiveFallback?.en || "";
      const mediaUrl = item?.media_url !== undefined && item.media_url !== "" ? item.media_url : effectiveFallback?.media || "";
      const styles = { ...(effectiveFallback?.styles || {}), ...(item?.styles || {}) };
      const metadata = item?.metadata || {};
      const isVisible = item?.is_visible !== undefined ? item.is_visible : (effectiveFallback?.isVisible ?? true);
      const sortOrder = item?.sort_order ?? 0;
      const isCustomized = !!item;

      // Select active text based on current language or active editor language
      const currentLang = editMode ? activeLanguage : lang;
      let text = currentLang === "en" ? (textEn || textBn) : (textBn || textEn);

      return {
        text,
        textBn,
        textEn,
        mediaUrl,
        styles,
        metadata,
        isVisible,
        sortOrder,
        isCustomized,
      };
    },
    [draftContent, persistedContent, editMode, activeLanguage, lang]
  );

  // Update in-memory draft content
  const updateContent = useCallback(
    (pageKey: string, sectionKey: string, elementKey: string, updates: Partial<PageContentItem>) => {
      const key = `${pageKey}:${sectionKey}:${elementKey}`;
      setDraftContent((prev) => {
        const existing = prev[key] || persistedContent[key] || {
          page_key: pageKey,
          section_key: sectionKey,
          element_key: elementKey,
          content_bn: "",
          content_en: "",
          media_url: "",
          styles: {},
          metadata: {},
          sort_order: 0,
          is_visible: true,
        };

        const updated: PageContentItem = {
          ...existing,
          ...updates,
          styles: updates.styles ? { ...existing.styles, ...updates.styles } : existing.styles,
          metadata: updates.metadata ? { ...existing.metadata, ...updates.metadata } : existing.metadata,
        };

        return { ...prev, [key]: updated };
      });

      setDirtyKeys((prev) => new Set(prev).add(key));
    },
    [persistedContent]
  );

  // Save all modified drafts to Supabase in a batch
  const saveAllChanges = async (): Promise<boolean> => {
    if (dirtyKeys.size === 0) return true;
    if (!user) {
      toast({ title: "Error", description: "You must be logged in as admin to save.", variant: "destructive" });
      return false;
    }

    setIsSaving(true);
    try {
      const itemsToSave: any[] = [];
      dirtyKeys.forEach((key) => {
        const item = draftContent[key];
        if (item) {
          itemsToSave.push({
            page_key: item.page_key,
            section_key: item.section_key,
            element_key: item.element_key,
            content_bn: item.content_bn,
            content_en: item.content_en,
            media_url: item.media_url,
            styles: item.styles || {},
            metadata: item.metadata || {},
            sort_order: item.sort_order ?? 0,
            is_visible: item.is_visible ?? true,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          });
        }
      });

      // Upsert into public.page_content using unique composite key constraint
      const { error } = await supabase
        .from("page_content" as any)
        .upsert(itemsToSave, { onConflict: "page_key,section_key,element_key" });

      if (error) {
        console.error("Error saving page content:", error);
        toast({
          title: lang === "bn" ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Save Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSaving(false);
        return false;
      }

      // Update persisted state & clear dirty keys
      setPersistedContent({ ...draftContent });
      setDirtyKeys(new Set());
      toast({
        title: lang === "bn" ? "সফলভাবে সংরক্ষিত হয়েছে" : "Changes Published",
        description: lang === "bn" ? `${itemsToSave.length}টি উপাদান আপডেট করা হয়েছে` : `Successfully saved ${itemsToSave.length} elements to live site.`,
      });
      setIsSaving(false);
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        title: "Save Failed",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
  };

  // Discard all unsaved drafts and revert back to persisted DB state
  const discardChanges = useCallback(() => {
    setDraftContent({ ...persistedContent });
    setDirtyKeys(new Set());
    toast({
      title: lang === "bn" ? "পরিবর্তন বাতিল করা হয়েছে" : "Changes Discarded",
      description: lang === "bn" ? "সকল অমীমাংসিত পরিবর্তন মুছে ফেলা হয়েছে।" : "Reverted all unsaved changes.",
    });
  }, [persistedContent, lang, toast]);

  // Reset a specific element to default code values
  const resetElement = async (pageKey: string, sectionKey: string, elementKey: string) => {
    const key = `${pageKey}:${sectionKey}:${elementKey}`;
    try {
      await supabase
        .from("page_content" as any)
        .delete()
        .eq("page_key", pageKey)
        .eq("section_key", sectionKey)
        .eq("element_key", elementKey);

      setPersistedContent((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      setDraftContent((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      setDirtyKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      toast({
        title: lang === "bn" ? "রিসেট সম্পন্ন" : "Reset Complete",
        description: lang === "bn" ? "উপাদানটি ডিফল্ট মানে ফিরিয়ে আনা হয়েছে।" : "Element restored to original default.",
      });
    } catch (e) {
      console.error("Reset error:", e);
    }
  };

  return (
    <VisualEditorContext.Provider
      value={{
        editMode,
        setEditMode,
        selectedElement,
        setSelectedElement,
        activeLanguage,
        setActiveLanguage,
        previewDevice,
        setPreviewDevice,
        isDrawerOpen,
        setIsDrawerOpen,
        hasUnsavedChanges: dirtyKeys.size > 0,
        unsavedCount: dirtyKeys.size,
        isSaving,
        isLoading,
        getContent,
        updateContent,
        saveAllChanges,
        discardChanges,
        resetElement,
        imageElements,
        registerImageElement,
        unregisterImageElement,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
};

export const useVisualEditor = () => useContext(VisualEditorContext);
