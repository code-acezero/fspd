import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface ElementOverride {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scale: number;
  visible: boolean;
}

interface VisualEditorContextType {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  overrides: Record<string, ElementOverride>;
  updateOverride: (id: string, partial: Partial<ElementOverride>) => void;
  resetOverride: (id: string) => void;
  saveOverrides: () => void;
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  editMode: false,
  setEditMode: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
  overrides: {},
  updateOverride: () => {},
  resetOverride: () => {},
  saveOverrides: () => {},
});

export const VisualEditorProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ElementOverride>>(() => {
    try {
      const stored = localStorage.getItem("fsp-editor-overrides");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const updateOverride = useCallback((id: string, partial: Partial<ElementOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0, rotation: 0, scale: 1, visible: true, ...prev[id], ...partial },
    }));
  }, []);

  const resetOverride = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const saveOverrides = useCallback(() => {
    localStorage.setItem("fsp-editor-overrides", JSON.stringify(overrides));
  }, [overrides]);

  return (
    <VisualEditorContext.Provider value={{ editMode, setEditMode, selectedElement, setSelectedElement, overrides, updateOverride, resetOverride, saveOverrides }}>
      {children}
    </VisualEditorContext.Provider>
  );
};

export const useVisualEditor = () => useContext(VisualEditorContext);
