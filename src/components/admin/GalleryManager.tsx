import { useState, useRef, useEffect } from "react";
import {
  Image as ImageLucide,
  Video,
  UploadCloud,
  CheckSquare,
  Square,
  Trash2,
  Link2,
  ExternalLink,
  Calendar,
  FileText,
  GraduationCap,
  Filter,
  Check,
  Loader2,
  Copy,
  FolderPlus,
  Play,
  Layers,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadSiteImage, deleteStorageImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminSearchFilterBar, { type FilterOption } from "@/components/common/AdminSearchFilterBar";

export interface GalleryAsset {
  id: string;
  name: string;
  image_url: string;
  slot: string;
  created_at: string;
}

interface GalleryManagerProps {
  events: Array<{ id: string; title: string; date: string }>;
  posts: Array<{ id: string; title: string }>;
  courses: Array<{ id: string; title: string }>;
  onDataChange?: () => void;
}

const GalleryManager = ({
  events,
  posts,
  courses,
  onDataChange,
}: GalleryManagerProps) => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "events" | "posts" | "courses" | "unassigned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch action selection
  const [targetEventId, setTargetEventId] = useState("");
  const [targetPostId, setTargetPostId] = useState("");
  const [targetCourseId, setTargetCourseId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets((data || []) as GalleryAsset[]);
    } catch (err: any) {
      console.error("Fetch assets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Multi-upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      let uploadedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        const res = await uploadSiteImage(file, "site");
        const publicUrl = typeof res === "string" ? res : (res?.url || "");
        if (publicUrl) {
          const { error } = await supabase.from("site_assets").insert([
            {
              name: file.name.replace(/\.[^/.]+$/, ""),
              image_url: publicUrl,
              slot: "gallery",
            },
          ]);
          if (!error) uploadedCount++;
        }
      }

      toast({
        title:
          lang === "en"
            ? `Successfully uploaded ${uploadedCount} files`
            : `${uploadedCount}টি মিডিয়া ফাইল আপলোড সম্পন্ন হয়েছে`,
      });
      fetchAssets();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      toast({
        title: lang === "en" ? "Upload failed" : "আপলোড ব্যর্থ হয়েছে",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
    }
  };

  // Batch Connect
  const handleBatchConnect = async (type: "event" | "post" | "course" | "unassign", targetId?: string) => {
    if (selectedIds.size === 0) return;
    setIsConnecting(true);

    let slotValue = "gallery";
    if (type === "event" && targetId) slotValue = `event:${targetId}`;
    else if (type === "post" && targetId) slotValue = `post:${targetId}`;
    else if (type === "course" && targetId) slotValue = `course:${targetId}`;

    try {
      const idsArray = Array.from(selectedIds);
      const { error } = await supabase
        .from("site_assets")
        .update({ slot: slotValue })
        .in("id", idsArray);

      if (error) throw error;

      toast({
        title:
          lang === "en"
            ? `Connected ${idsArray.length} items successfully`
            : `${idsArray.length}টি মিডিয়া সফলভাবে সংযুক্ত করা হয়েছে`,
      });

      setSelectedIds(new Set());
      setTargetEventId("");
      setTargetPostId("");
      setTargetCourseId("");
      fetchAssets();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      toast({
        title: lang === "en" ? "Connection failed" : "সংযোগ ব্যর্থ হয়েছে",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Delete single asset
  const handleDeleteAsset = async (asset: GalleryAsset) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this media file?" : "আপনি কি নিশ্চিতভাবে এই ফাইলটি মুছে ফেলতে চান?")) return;

    try {
      await deleteStorageImage(asset.image_url);
      const { error } = await supabase.from("site_assets").delete().eq("id", asset.id);
      if (error) throw error;

      toast({ title: lang === "en" ? "Media file deleted" : "মিডিয়া মুছে ফেলা হয়েছে" });
      fetchAssets();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Delete failed" : "মুছতে ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(lang === "en" ? `Delete ${selectedIds.size} selected files?` : `নির্বাচিত ${selectedIds.size}টি ফাইল কি মুছে ফেলতে চান?`)) return;

    try {
      const idsArray = Array.from(selectedIds);
      const toDelete = assets.filter((a) => selectedIds.has(a.id));

      for (const item of toDelete) {
        await deleteStorageImage(item.image_url);
      }

      const { error } = await supabase.from("site_assets").delete().in("id", idsArray);
      if (error) throw error;

      toast({
        title: lang === "en" ? `Deleted ${idsArray.length} files` : `${idsArray.length}টি ফাইল মুছে ফেলা হয়েছে`,
      });
      setSelectedIds(new Set());
      fetchAssets();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Batch delete failed" : "ব্যাচ ডিলিট ব্যর্থ", description: err.message, variant: "destructive" });
    }
  };

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    // 1. Target Type Filter
    if (activeFilter === "events" && !asset.slot?.startsWith("event:")) return false;
    if (activeFilter === "posts" && !asset.slot?.startsWith("post:")) return false;
    if (activeFilter === "courses" && !asset.slot?.startsWith("course:")) return false;
    if (activeFilter === "unassigned" && asset.slot?.includes(":")) return false;

    // 2. Mini Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const slotLabel = getSlotLabel(asset.slot || "").toLowerCase();
      const matchesName = asset.name?.toLowerCase().includes(q);
      const matchesSlot = (asset.slot || "").toLowerCase().includes(q) || slotLabel.includes(q);
      if (!matchesName && !matchesSlot) return false;
    }

    return true;
  });

  const getSlotLabel = (slot: string) => {
    if (!slot || slot === "gallery") return lang === "en" ? "Unassigned Gallery" : "মুক্ত গ্যালারি";
    if (slot.startsWith("event:")) {
      const eid = slot.replace("event:", "");
      const ev = events.find((e) => e.id === eid);
      return ev ? `📅 ${ev.title}` : `📅 Event (${eid.slice(0, 6)})`;
    }
    if (slot.startsWith("post:")) {
      const pid = slot.replace("post:", "");
      const p = posts.find((po) => po.id === pid);
      return p ? `✍️ ${p.title}` : `✍️ Post (${pid.slice(0, 6)})`;
    }
    if (slot.startsWith("course:")) {
      const cid = slot.replace("course:", "");
      const c = courses.find((co) => co.id === cid);
      return c ? `🎓 ${c.title}` : `🎓 Course (${cid.slice(0, 6)})`;
    }
    return slot;
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video");
  };

  const galleryFilterOptions: FilterOption[] = [
    { key: "all", labelBn: "সকল মিডিয়া", labelEn: "All Media", count: assets.length },
    {
      key: "events",
      labelBn: "ইভেন্ট সম্পর্কিত",
      labelEn: "Event Linked",
      count: assets.filter((a) => a.slot?.startsWith("event:")).length,
    },
    {
      key: "posts",
      labelBn: "পোস্ট সম্পর্কিত",
      labelEn: "Post Linked",
      count: assets.filter((a) => a.slot?.startsWith("post:")).length,
    },
    {
      key: "courses",
      labelBn: "কোর্স সম্পর্কিত",
      labelEn: "Course Linked",
      count: assets.filter((a) => a.slot?.startsWith("course:")).length,
    },
    {
      key: "unassigned",
      labelBn: "মুক্ত গ্যালারি",
      labelEn: "Unassigned",
      count: assets.filter((a) => !a.slot?.includes(":")).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ── */}
      <div className="bg-card rounded-3xl border border-border p-6 depth-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-bengali text-foreground flex items-center gap-2.5">
            <ImageLucide className="w-6 h-6 text-primary" />
            {lang === "en" ? "Gallery & Media Management" : "গ্যালারি ও মিডিয়া ব্যবস্থাপনা (Gallery Manager)"}
          </h2>
          <p className="text-xs text-muted-foreground font-bengali mt-1">
            {lang === "en"
              ? "Upload photos and videos, and connect them directly to events, posts, or courses."
              : "সাইটের যাবতীয় ছবি ও ভিডিও আপলোড করুন এবং যেকোনো ইভেন্ট, পোস্ট বা কোর্সের সাথে সংযুক্ত করুন।"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{lang === "en" ? "+ Upload New Media" : "+ নতুন মিডিয়া আপলোড করুন"}</span>
          </button>
        </div>
      </div>

      {/* ── Mini Search & Single Button Filter Bar ── */}
      <AdminSearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholderBn="মিডিয়ার নাম বা ইভেন্ট/পোস্ট খুঁজুন..."
        searchPlaceholderEn="Search media by name or link..."
        activeFilter={activeFilter}
        onFilterChange={(key) => setActiveFilter(key as any)}
        filterOptions={galleryFilterOptions}
        actionsRight={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bengali text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
            >
              {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>
                {selectedIds.size > 0
                  ? (lang === "en" ? `${selectedIds.size} Selected` : `${selectedIds.size}টি নির্বাচিত`)
                  : (lang === "en" ? "Select All" : "সব নির্বাচন")}
              </span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bengali font-semibold hover:bg-destructive/20 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "en" ? `Delete (${selectedIds.size})` : `মুছুন (${selectedIds.size})`}</span>
              </button>
            )}
          </div>
        }
      />

      {/* ── Floating Batch Connection Action Bar ── */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold font-bengali text-foreground">
              {lang === "en"
                ? `${selectedIds.size} items selected — choose connection destination:`
                : `${selectedIds.size}টি মিডিয়া আইটেম নির্বাচিত হয়েছে — সংযোগের গন্তব্য নির্বাচন করুন:`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Connect to Event Dropdown */}
            <select
              value={targetEventId}
              onChange={(e) => {
                setTargetEventId(e.target.value);
                if (e.target.value) handleBatchConnect("event", e.target.value);
              }}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{lang === "en" ? "📅 Connect to Event..." : "📅 ইভেন্টের সাথে সংযুক্ত করুন..."}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.date})
                </option>
              ))}
            </select>

            {/* Connect to Post Dropdown */}
            <select
              value={targetPostId}
              onChange={(e) => {
                setTargetPostId(e.target.value);
                if (e.target.value) handleBatchConnect("post", e.target.value);
              }}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{lang === "en" ? "✍️ Connect to Post..." : "✍️ পোস্টের সাথে সংযুক্ত করুন..."}</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            {/* Connect to Course Dropdown */}
            <select
              value={targetCourseId}
              onChange={(e) => {
                setTargetCourseId(e.target.value);
                if (e.target.value) handleBatchConnect("course", e.target.value);
              }}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{lang === "en" ? "🎓 Connect to Course..." : "🎓 কোর্সের সাথে সংযুক্ত করুন..."}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Unassign */}
            <button
              type="button"
              onClick={() => handleBatchConnect("unassign")}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bengali transition-colors"
            >
              {lang === "en" ? "Make Unassigned" : "মুক্ত গ্যালারিতে রূপান্তর"}
            </button>
          </div>
        </div>
      )}

      {/* ── Media Grid ── */}
      {filteredAssets.length === 0 ? (
        <div className="py-16 text-center bg-card rounded-3xl border border-dashed border-border p-8">
          <ImageLucide className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-bengali text-sm text-muted-foreground">
            {lang === "en" ? "No media found in this category." : "এই ক্যাটাগরিতে কোনো মিডিয়া পাওয়া যায়নি।"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-5 py-2 rounded-full bg-primary/10 text-primary font-bengali font-bold text-xs hover:bg-primary/20 transition-colors inline-flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {lang === "en" ? "Upload First Media" : "প্রথম মিডিয়া আপলোড করুন"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredAssets.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            const videoItem = isVideo(asset.image_url);

            return (
              <div
                key={asset.id}
                onClick={() => toggleSelect(asset.id)}
                className={`group relative rounded-2xl border transition-all overflow-hidden bg-card cursor-pointer select-none ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 shadow-lg"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {/* Media Preview Box */}
                <div className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center">
                  {videoItem ? (
                    <div className="w-full h-full bg-black/60 flex items-center justify-center relative">
                      <video
                        src={asset.image_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/90 drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={asset.image_url && !asset.image_url.startsWith("[object") ? asset.image_url : "/site-logo.png"}
                      alt={asset.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/site-logo.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(asset.id);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-black/60 text-white/70 hover:text-white"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Video / Photo Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                      {videoItem ? <Video className="w-3 h-3" /> : <ImageLucide className="w-3 h-3" />}
                    </span>
                  </div>
                </div>

                {/* Footer Metadata & Dropdown Connection */}
                <div className="p-2.5 space-y-1.5 bg-card">
                  <span className="text-[11px] font-bold font-bengali text-foreground block truncate" title={asset.name}>
                    {asset.name || "Untitled"}
                  </span>

                  <span className="text-[10px] text-primary font-bengali block truncate" title={getSlotLabel(asset.slot)}>
                    {getSlotLabel(asset.slot)}
                  </span>

                  {/* Single Item Action Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(asset.image_url);
                        toast({ title: lang === "en" ? "URL Copied" : "লিংক কপি করা হয়েছে" });
                      }}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 p-1 rounded"
                      title="Copy URL"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{lang === "en" ? "Copy" : "কপি"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset);
                      }}
                      className="text-destructive/70 hover:text-destructive p-1 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
