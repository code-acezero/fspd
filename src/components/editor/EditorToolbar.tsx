import { motion, AnimatePresence } from "framer-motion";
import { Edit3, X, Save, Layers } from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";

const EditorToolbar = () => {
  const { role } = useAuth();
  const { editMode, setEditMode, saveOverrides, overrides } = useVisualEditor();
  const { setActiveBlock } = usePageBlocks();
  const { toast } = useToast();
  const { t } = useLanguage();

  if (role !== "admin" && role !== "moderator") return null;

  return (
    <>
      {!editMode && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setEditMode(true)}
          className="fixed bottom-6 right-6 z-[200] w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
          title={t("visualEditor")}
        >
          <Edit3 className="w-5 h-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-card text-card-foreground border border-border rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl"
          >
            <div className="flex items-center gap-2 px-3 border-r border-border">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold font-bengali">{t("visualEditor")}</span>
            </div>

            <span className="text-xs text-muted-foreground font-bengali">{Object.keys(overrides).length} {t("changes")}</span>

            <button
              onClick={() => {
                saveOverrides();
                toast({ title: t("saved"), description: t("changesSaved") });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition-colors font-bengali"
            >
              <Save className="w-3.5 h-3.5" /> {t("save")}
            </button>

            <button
              onClick={() => { setEditMode(false); setActiveBlock(null); }}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorToolbar;
