import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Loader2, UploadCloud, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { uploadSiteImage, ALLOWED_IMAGE_TYPES, ImageFolder } from "@/lib/storage";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: ImageFolder;
  bucket?: "content-images" | "avatars";
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

export const ImageUploader = ({
  value,
  onChange,
  folder = "post",
  bucket,
  maxImages = 4,
  maxFileMB = 20,
  multiple = true,
  className = "",
}: ImageUploaderProps) => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);

  // Revoke any leftover object URLs on unmount.
  useEffect(() => () => {
    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, [pending]);

  const remaining = maxImages - value.length;

  const validate = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isMimeAllowed = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isExtAllowed = ext && ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(ext);

    if (!isMimeAllowed && !isExtAllowed) {
      return lang === "bn"
        ? "শুধুমাত্র JPG, PNG, WEBP, GIF, SVG, AVIF গ্রহণযোগ্য"
        : "Only JPG, PNG, WEBP, GIF, SVG, AVIF allowed";
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

      // Process uploads
      for (const item of items) {
        const mimeErr = validate(item.file);
        if (mimeErr) {
          setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "error", error: mimeErr } : it)));
          continue;
        }

        setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 40 } : it)));

        const res = await uploadSiteImage({
          file: item.file,
          folder,
          bucket,
          userId: user.id,
        });

        if (!res.success || !res.url) {
          setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "error", error: res.error || "Upload failed" } : it)));
          continue;
        }

        // Bubble URL up immediately, then mark item done so it can fade out.
        onChange([...value, res.url].slice(0, maxImages));
        setPending((p) => p.map((it) => (it.id === item.id ? { ...it, status: "done", progress: 100 } : it)));
        setTimeout(() => {
          setPending((p) => p.filter((it) => it.id !== item.id));
          URL.revokeObjectURL(item.previewUrl);
        }, 600);
      }
    },
    [bucket, folder, lang, maxFileMB, maxImages, onChange, remaining, t, toast, user, value]
  );

  const onPicked = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const onDrop = (e: DragEvent) => {
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
        accept={ALLOWED_IMAGE_TYPES.join(",")}
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
                className={`relative aspect-square rounded-xl overflow-hidden border ${
                  p.status === "error" ? "border-destructive" : "border-border"
                }`}
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
                ? "ছবি টেনে আনুন বা ফাইল নির্বাচন করতে ক্লিক করুন"
                : "Drag & drop, or click to select"}
            </p>
            <p className="text-[10px] text-muted-foreground/80">
              JPG · PNG · WEBP · SVG · GIF · AVIF (Max {maxFileMB}MB)
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
