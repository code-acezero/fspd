import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Loader2, UploadCloud, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Reusable image uploader with drag-and-drop, instant client-side preview,
 * MIME / size / dimension validation, and Supabase Storage upload.
 *
 * Storage RLS expects upload paths under `posts/<auth.uid()>/...` for non-admins.
 * When folder is "post", we apply that scheme; otherwise (avatar/event/logo)
 * the caller is expected to have admin/moderator access.
 */

export type ImageFolder = "post" | "avatar" | "event" | "logo";

const ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPT_LIST = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: ImageFolder;
  bucket?: string; // defaults: post -> content-images, others -> avatars
  maxImages?: number;
  maxFileMB?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  multiple?: boolean;
  className?: string;
}

interface PendingItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "validating" | "uploading" | "done" | "error";
  error?: string;
  progress: number;
}

const buildPath = (folder: ImageFolder, userId: string, fileName: string) => {
  const safeName = `${Date.now()}-${fileName.replace(/[^A-Za-z0-9._-]/g, "_")}`;
  if (folder === "post") return `posts/${userId}/${safeName}`;
  if (folder === "avatar") return `${userId}/${safeName}`;
  if (folder === "event") return `events/${safeName}`;
  return `site/${safeName}`;
};

const defaultBucket = (folder: ImageFolder) =>
  folder === "avatar" ? "avatars" : "content-images";

/** Read intrinsic dimensions of an image File via a temporary object URL. */
const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });

export const ImageUploader = ({
  value,
  onChange,
  folder = "post",
  bucket,
  maxImages = 4,
  maxFileMB = 5,
  minWidth = 200,
  minHeight = 200,
  maxWidth = 8000,
  maxHeight = 8000,
  multiple = true,
  className = "",
}: ImageUploaderProps) => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const activeBucket = bucket || defaultBucket(folder);

  // Revoke any leftover object URLs on unmount.
  useEffect(() => () => {
    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, [pending]);

  const remaining = maxImages - value.length;

  const validate = (file: File): string | null => {
    if (!ACCEPT_LIST.includes(file.type)) {
      return lang === "bn"
        ? "শুধুমাত্র JPG, PNG, WEBP গ্রহণযোগ্য"
        : "Only JPG, PNG, WEBP allowed";
    }
    if (file.size > maxFileMB * 1024 * 1024) {
      return lang === "bn"
        ? `ফাইলের আকার ${maxFileMB}MB এর কম হতে হবে`
        : `Max ${maxFileMB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!user) {
        toast({ title: t("error"), description: t("login"), variant: "destructive" });
        return;
      }
      if (files.length === 0) return;
      const slice = files.slice(0, remaining);
      if (files.length > remaining) {
        toast({
          title: lang === "bn" ? "সর্বোচ্চ পৌঁছেছে" : "Limit reached",
          description: lang === "bn" ? `সর্বোচ্চ ${maxImages}টি ছবি` : `Max ${maxImages} images`,
        });
      }

      const items: PendingItem[] = slice.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "validating",
        progress: 0,
      }));
      setPending((p) => [...p, ...items]);

      // Validate + upload sequentially to avoid storage rate spikes.
      for (const item of items) {
        const mimeErr = validate(item.file);
        if (mimeErr) {
          setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "error", error: mimeErr } : it)));
          continue;
        }
        try {
          const dim = await readImageDimensions(item.file);
          if (dim.width < minWidth || dim.height < minHeight) {
            setPending((p) =>
              p.map((it) =>
                it.id === item.id
                  ? { ...it, status: "error", error: `${minWidth}×${minHeight}+ ${lang === "bn" ? "প্রয়োজন" : "required"}` }
                  : it,
              ),
            );
            continue;
          }
          if (dim.width > maxWidth || dim.height > maxHeight) {
            setPending((p) =>
              p.map((it) =>
                it.id === item.id
                  ? { ...it, status: "error", error: `${lang === "bn" ? "ছবি অনেক বড়" : "Image too large"} (max ${maxWidth}×${maxHeight})` }
                  : it,
              ),
            );
            continue;
          }
        } catch {
          setPending((p) =>
            p.map((it) =>
              it.id === item.id ? { ...it, status: "error", error: lang === "bn" ? "ছবি পড়া যায়নি" : "Cannot read image" } : it,
            ),
          );
          continue;
        }

        setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 25 } : it)));
        const path = buildPath(folder, user.id, item.file.name);
        const { error } = await supabase.storage.from(activeBucket).upload(path, item.file, {
          upsert: false,
          cacheControl: "3600",
          contentType: item.file.type,
        });
        if (error) {
          setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "error", error: error.message } : it)));
          continue;
        }
        const { data: pub } = supabase.storage.from(activeBucket).getPublicUrl(path);
        // Bubble URL up immediately, then mark item done so it can fade out.
        onChange([...value, pub.publicUrl].slice(0, maxImages));
        setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "done", progress: 100 } : it)));
        // Remove the pending tile shortly after it's persisted in `value`.
        setTimeout(() => {
          setPending((p) => p.filter((it) => it.id !== item.id));
          URL.revokeObjectURL(item.previewUrl);
        }, 800);
      }
    },
    [activeBucket, folder, lang, maxFileMB, maxImages, maxWidth, maxHeight, minWidth, minHeight, onChange, remaining, t, toast, user, value],
  );

  const onPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    // Reset so picking the same file again still triggers onChange.
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files?.length) return;
    handleFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  };

  const removeUploaded = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const dismissPending = (id: string) => {
    setPending((p) => {
      const item = p.find((it) => it.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return p.filter((it) => it.id !== id);
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        onChange={onPicked}
        className="hidden"
        aria-label={lang === "bn" ? "ছবি যুক্ত করুন" : "Add images"}
      />

      {(value.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group"
            >
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              <button
                type="button"
                onClick={() => removeUploaded(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={lang === "bn" ? "ছবি মুছুন" : "Remove image"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <AnimatePresence>
            {pending.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative aspect-square rounded-xl overflow-hidden border ${p.status === "error" ? "border-destructive" : "border-border"}`}
              >
                <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-2 gap-1">
                  {p.status === "validating" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-[10px] font-bengali text-muted-foreground">
                        {lang === "bn" ? "যাচাই করা হচ্ছে…" : "Validating…"}
                      </span>
                    </>
                  )}
                  {p.status === "uploading" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-[10px] font-bengali text-foreground">
                        {lang === "bn" ? "আপলোড হচ্ছে…" : "Uploading…"}
                      </span>
                    </>
                  )}
                  {p.status === "error" && (
                    <>
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-[10px] font-bengali text-destructive line-clamp-2">{p.error}</span>
                      <button
                        type="button"
                        onClick={() => dismissPending(p.id)}
                        className="text-[10px] text-muted-foreground underline"
                      >
                        {lang === "bn" ? "বন্ধ করুন" : "Dismiss"}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => remaining > 0 && fileRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && remaining > 0) {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-disabled={remaining <= 0}
        className={`flex flex-col items-center justify-center gap-1.5 py-5 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all
          ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          ${remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {remaining > 0 ? (
          <>
            <UploadCloud className="w-5 h-5 text-muted-foreground" />
            <p className="text-xs font-bengali text-muted-foreground text-center">
              {lang === "bn"
                ? "ছবি টেনে আনুন বা ক্লিক করুন"
                : "Drag & drop, or click to select"}
            </p>
            <p className="text-[10px] text-muted-foreground/80">
              JPG · PNG · WEBP · ≤{maxFileMB}MB · {value.length}/{maxImages}
            </p>
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            <p className="text-xs font-bengali text-muted-foreground">
              {lang === "bn" ? `সর্বোচ্চ ${maxImages}টি ছবি` : `Max ${maxImages} images`}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
