import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  X,
  Save,
  Layers,
  FolderTree,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import VisualEditorDrawer from "@/components/editor/VisualEditorDrawer";

export const EditorToolbar = () => {
  const { role } = useAuth();
  const location = useLocation();
  const {
    editMode,
    setEditMode,
    hasUnsavedChanges,
    unsavedCount,
    saveAllChanges,
    discardChanges,
    isSaving,
    activeLanguage,
    setActiveLanguage,
    previewDevice,
    setPreviewDevice,
    setSelectedElement,
    setIsDrawerOpen,
    isDrawerOpen,
  } = useVisualEditor();

  const { lang } = useLanguage();

  if (role !== "admin" && role !== "moderator") return null;
  // Hide editor floating dock on Admin dashboard and auth pages
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/login")) return null;

  return (
    <>
      <VisualEditorDrawer />

      {/* Floating launcher when Edit Mode is OFF: compact icon, expands on desktop hover */}
      {!editMode && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setEditMode(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[200] group flex items-center justify-center h-11 md:h-12 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 px-3.5 transition-all duration-300 ease-out overflow-hidden"
          title={lang === "bn" ? "লাইভ ভিজ্যুয়াল এডিটর চালু করুন" : "Enable Live Visual Editor"}
        >
          <Edit3 className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden md:inline-block max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:pl-2 group-hover:pr-1 text-xs font-bold font-bengali tracking-wide whitespace-nowrap transition-all duration-300 ease-out overflow-hidden">
            {lang === "bn" ? "লাইভ ভিজ্যুয়াল এডিটর" : "Live Visual Editor"}
          </span>
        </motion.button>
      )}

      {/* Floating Control Dock when Edit Mode is ON */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] sm:w-auto bg-slate-950/95 text-white backdrop-blur-xl border border-white/15 rounded-full px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between sm:justify-start gap-1 sm:gap-2 shadow-2xl ring-1 ring-black/40 ${
              isDrawerOpen ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Left cluster: Editor badge & Pages button */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <div className="flex items-center gap-1 pl-1 pr-1.5 border-r border-white/15">
                <Edit3 className="w-3 h-3 text-primary shrink-0" />
                <span className="text-[11px] font-bold font-bengali hidden lg:inline">
                  {lang === "bn" ? "এডিটর" : "Editor"}
                </span>
              </div>

              {/* Pages & Sections Navigator Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedElement(null);
                  setIsDrawerOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 text-[11px] font-bold font-bengali transition-all shrink-0"
                title="Browse all pages and sections"
              >
                <FolderTree className="w-3 h-3 text-accent shrink-0" />
                <span>{lang === "bn" ? "পেজ তালিকা" : "Pages"}</span>
              </button>
            </div>

            {/* Language Switcher for In-Page Editing */}
            <div className="flex items-center rounded-full bg-white/10 p-0.5 border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setActiveLanguage("bn")}
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold font-bengali transition-colors ${
                  activeLanguage === "bn" ? "bg-primary text-primary-foreground shadow-xs" : "text-white/70 hover:text-white"
                }`}
                title="Edit Bengali Content"
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => setActiveLanguage("en")}
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-colors ${
                  activeLanguage === "en" ? "bg-accent text-accent-foreground shadow-xs" : "text-white/70 hover:text-white"
                }`}
                title="Edit English Content"
              >
                EN
              </button>
            </div>

            {/* Device Viewport Simulation (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center rounded-full bg-white/10 p-0.5 border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-full transition-colors ${
                  previewDevice === "desktop" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={`p-1.5 rounded-full transition-colors ${
                  previewDevice === "tablet" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-full transition-colors ${
                  previewDevice === "mobile" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right cluster: Save, Admin & Exit */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Save & Publish Button */}
              <button
                type="button"
                onClick={saveAllChanges}
                disabled={isSaving || !hasUnsavedChanges}
                className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] font-bold font-bengali transition-all shadow-md shrink-0 active:scale-95 ${
                  hasUnsavedChanges
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30 animate-pulse"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>
                  {hasUnsavedChanges
                    ? (lang === "bn" ? `সংরক্ষণ (${unsavedCount})` : `Save (${unsavedCount})`)
                    : (lang === "bn" ? "সংরক্ষণ" : "Save")}
                </span>
              </button>

              {/* Discard Changes */}
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={discardChanges}
                  disabled={isSaving}
                  className="p-1 rounded-full bg-white/10 hover:bg-destructive/20 hover:text-destructive text-white/80 transition-colors shrink-0"
                  title="Discard unsaved changes"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              {/* Link to Admin Panel */}
              <Link
                to="/admin"
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors shrink-0 hidden xs:inline-flex"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </Link>

              {/* Exit Edit Mode Button */}
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-destructive/30 hover:text-destructive text-white/80 hover:text-white transition-colors shrink-0"
                title="Exit Visual Editor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorToolbar;
