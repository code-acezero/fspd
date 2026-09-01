import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  UploadCloud, Image as ImageIcon, X, Check, Loader2,
  Link2, Folder, Trash2, RefreshCw, HardDrive,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadSiteImage, ALLOWED_IMAGE_TYPES } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface StorageAsset {
  name: string;
  id: string | null;
  url: string;
  path: string;
  size?: number;
  created_at?: string;
}

interface ImageSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentUrl?: string;
  title?: string;
  folder?: "hero" | "slider" | "site" | "member" | "event" | "post" | "editor" | "course";
}

const FOLDER_MAP: Record<string, string> = {
  hero: "hero",
  slider: "slider",
  site: "site",
  member: "members",
  event: "events",
  post: "posts",
  editor: "editor",
  course: "courses",
};

const ALL_FOLDERS = ["editor", "site", "hero", "slider", "members", "events", "posts", "courses"];

export const ImageSelectModal = ({
  open,
  onClose,
  onSelect,
  currentUrl = "",
  title = "Select or Upload Image",
  folder = "editor",
}: ImageSelectModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const [tab, setTab] = useState<"upload" | "library" | "url">("upload");
  const [customUrl, setCustomUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [assets, setAssets] = useState<StorageAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState(FOLDER_MAP[folder] || "editor");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchStorageAssets(activeFolder);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open, activeFolder]);

  const fetchStorageAssets = async (folderPath: string) => {
    setLoadingAssets(true);
    setAssets([]);
    try {
      const { data, error } = await supabase.storage
        .from("content-images")
        .list(folderPath, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const files = (data || []).filter((item) => item.id !== null);
      const assetsWithUrls: StorageAsset[] = files.map((item) => {
        const { data: urlData } = supabase.storage
          .from("content-images")
          .getPublicUrl(`${folderPath}/${item.name}`);
        return {
          name: item.name,
          id: item.id,
          url: urlData.publicUrl,
          path: `${folderPath}/${item.name}`,
          size: (item as any).metadata?.size,
          created_at: (item as any).created_at,
        };
      });

      setAssets(assetsWithUrls);
    } catch (e) {
      console.error("Failed to list storage assets:", e);
      toast({
        title: "Failed to load library",
        description: "Could not fetch images from storage.",
        variant: "destructive",
      });
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const result = await uploadSiteImage({
      file,
      folder: folder as any,
      userId: user?.id,
    });
    setUploading(false);

    if (!result.success || !result.url) {
      toast({
        title: lang === "bn" ? "আপলোড ব্যর্থ" : "Upload Failed",
        description: result.error || "Could not upload image",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: lang === "bn" ? "ব্যানার সফলভাবে আপলোড ও পরিবর্তন হয়েছে" : "Banner Uploaded & Applied",
      description: lang === "bn" ? "নতুন ছবিটি সক্রিয় করা হয়েছে" : "New image is now active.",
    });

    onSelect(result.url);
    onClose();
  };

  const handleDeleteAsset = async (asset: StorageAsset) => {
    if (
      !window.confirm(
        lang === "bn"
          ? `"${asset.name}" ছবিটি স্টোরেজ থেকে চিরতরে মুছে ফেলবেন? এটি পুনরুদ্ধার করা যাবে না।`
          : `Permanently delete "${asset.name}" from storage? This cannot be undone.`
      )
    )
      return;

    setDeletingId(asset.id);
    try {
      const { error } = await supabase.storage
        .from("content-images")
        .remove([asset.path]);

      if (error) throw error;

      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      toast({
        title: lang === "bn" ? "ছবি চিরতরে মুছে ফেলা হয়েছে" : "Image Permanently Deleted",
        description: asset.name,
      });
    } catch (e: any) {
      toast({
        title: "Delete Failed",
        description: e?.message || "Could not delete image",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col depth-card max-h-[90vh] my-auto relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bengali font-bold text-foreground text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            {([
              { key: "upload", icon: UploadCloud, label: lang === "bn" ? "নতুন আপলোড ও পূর্ববর্তী ব্যানার" : "Upload & Switch" },
              { key: "library", icon: HardDrive, label: lang === "bn" ? "সকল ফোল্ডার গ্যালারি" : "All Folders" },
              { key: "url", icon: Link2, label: lang === "bn" ? "সরাসরি URL" : "Direct URL" },
            ] as const).map(({ key: tabKey, icon: Icon, label }) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setTab(tabKey)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold font-bengali transition-all flex items-center justify-center gap-1.5 ${
                  tab === tabKey
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* ── Upload Tab (With Drag & Drop + Previous Banners Section) ── */}
          {tab === "upload" && (
            <div className="space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className={`flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-9 h-9 text-primary animate-spin" />
                    <p className="font-bengali text-sm text-foreground">
                      {lang === "bn" ? "ছবি আপলোড হচ্ছে..." : "Uploading to Supabase Storage..."}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="font-bengali text-sm font-semibold text-foreground">
                        {lang === "bn"
                          ? "নতুন ব্যানার বা ছবি আপলোড করতে ক্লিক করুন"
                          : "Click to select or drag & drop image"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG · PNG · WEBP · SVG · GIF · AVIF (Max 20MB)
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        ফোল্ডার: <span className="text-foreground font-semibold">{FOLDER_MAP[folder] || folder}</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* ── Previous Banners & Assets in this folder ── */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-primary" />
                    <h4 className="font-bengali font-bold text-xs text-foreground">
                      {lang === "bn"
                        ? `পূর্বের আপলোডকৃত ব্যানারসমূহ (${assets.length})`
                        : `Previous Banners in Folder (${assets.length})`}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchStorageAssets(activeFolder)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors flex items-center gap-1 text-[11px] font-bengali"
                    title="Refresh"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{lang === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
                  </button>
                </div>

                {loadingAssets ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bengali">{lang === "bn" ? "পূর্বের ব্যানার লোড হচ্ছে..." : "Loading previous banners..."}</span>
                  </div>
                ) : assets.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {assets.map((asset) => {
                      const isActive = currentUrl && (currentUrl === asset.url || currentUrl.includes(asset.name));
                      return (
                        <div
                          key={asset.id || asset.name}
                          className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col bg-card/60 ${
                            isActive
                              ? "border-primary ring-2 ring-primary/40 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            <img
                              src={asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isActive && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold font-mono shadow-xs flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> ACTIVE
                              </span>
                            )}
                            {asset.size && (
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                {formatSize(asset.size)}
                              </span>
                            )}
                          </div>

                          <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between bg-card">
                            <p className="text-[10px] font-mono text-muted-foreground truncate" title={asset.name}>
                              {asset.name}
                            </p>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelect(asset.url);
                                  toast({
                                    title: lang === "bn" ? "ব্যানার পরিবর্তন সম্পন্ন" : "Banner Switched",
                                    description: lang === "bn" ? "নির্বাচিত ব্যানার সক্রিয় করা হয়েছে" : "Selected banner is now active.",
                                  });
                                  onClose();
                                }}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bengali font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                                  isActive
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>{isActive ? (lang === "bn" ? "বর্তমান" : "Current") : (lang === "bn" ? "সুইচ করুন" : "Switch")}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAsset(asset);
                                }}
                                disabled={deletingId === asset.id}
                                className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-colors disabled:opacity-50"
                                title={lang === "bn" ? "চিরতরে মুছুন" : "Permanently Delete"}
                              >
                                {deletingId === asset.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-bengali text-center py-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    {lang === "bn"
                      ? "এই ফোল্ডারে পূর্বে আপলোডকৃত কোনো ব্যানার পাওয়া যায়নি।"
                      : "No previous banners found in this folder."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Library Tab ── */}
          {tab === "library" && (
            <div className="space-y-3">
              {/* Folder selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex gap-1.5 flex-wrap">
                  {ALL_FOLDERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFolder(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-colors ${
                        activeFolder === f
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fetchStorageAssets(activeFolder)}
                  className="ml-auto p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Asset grid */}
              {loadingAssets ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bengali">
                    {lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}
                  </span>
                </div>
              ) : assets.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {assets.map((asset) => (
                    <div
                      key={asset.id || asset.name}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    >
                      {/* Image */}
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onClick={() => { onSelect(asset.url); onClose(); }}
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => { onSelect(asset.url); onClose(); }}
                          className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold font-bengali hover:scale-105 transition-transform flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5" />
                          {lang === "bn" ? "নির্বাচন" : "Select"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset); }}
                          disabled={deletingId === asset.id}
                          className="px-2.5 py-1 rounded-full bg-destructive text-white text-[10px] font-bold hover:scale-105 transition-transform flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === asset.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-2.5 h-2.5" />
                          )}
                          {lang === "bn" ? "মুছুন" : "Delete"}
                        </button>
                      </div>

                      {/* Size badge */}
                      {asset.size && (
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono leading-none">
                          {formatSize(asset.size)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground font-bengali">
                    {lang === "bn"
                      ? `"${activeFolder}" ফোল্ডারে কোন ছবি পাওয়া যায়নি।`
                      : `No images found in "${activeFolder}" folder.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className="text-xs text-primary hover:underline font-bengali"
                  >
                    {lang === "bn" ? "নতুন ছবি আপলোড করুন →" : "Upload a new image →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── URL Tab ── */}
          {tab === "url" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground font-bengali">
                {lang === "bn" ? "ছবির সরাসরি লিংক (Image URL):" : "Direct Image URL:"}
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                autoFocus
              />
              {customUrl && (
                <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => { if (customUrl) { onSelect(customUrl); onClose(); } }}
                disabled={!customUrl}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-bengali hover:bg-primary/80 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                {lang === "bn" ? "এই URL ব্যবহার করুন" : "Use this URL"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ImageSelectModal;
