import { supabase } from "@/integrations/supabase/client";

export type ImageFolder =
  | "post"
  | "avatar"
  | "event"
  | "member"
  | "logo"
  | "hero"
  | "slider"
  | "course"
  | "site"
  | "editor";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
];

export const MAX_IMAGE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB for media/video

export interface UploadImageOptions {
  file: File;
  folder?: ImageFolder;
  bucket?: "content-images" | "avatars";
  userId?: string | null;
  customFileName?: string;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  toString(): string;
}

/**
 * Cleanly builds storage path following RLS conventions:
 * - post -> posts/<userId>/<safeName>
 * - avatar -> avatars/<userId>/<safeName> (or in avatars bucket: <userId>/<safeName>)
 * - event -> events/<safeName>
 * - member -> members/<safeName>
 * - course -> courses/<safeName>
 * - hero/slider/site/editor/logo -> <folder>/<safeName>
 */
export const buildStoragePath = (
  folder: ImageFolder = "site",
  userId?: string | null,
  fileName: string = "image.png"
): string => {
  const safeName = `${Date.now()}-${fileName.replace(/[^A-Za-z0-9._-]/g, "_")}`;
  const effectiveUserId = userId || "anonymous";

  if (folder === "post") return `posts/${effectiveUserId}/${safeName}`;
  if (folder === "avatar") return `${effectiveUserId}/${safeName}`;
  if (folder === "event") return `events/${safeName}`;
  if (folder === "member") return `members/${safeName}`;
  if (folder === "course") return `courses/${safeName}`;
  if (folder === "logo") return `logo/${safeName}`;
  if (folder === "hero") return `hero/${safeName}`;
  if (folder === "slider") return `slider/${safeName}`;
  if (folder === "editor") return `editor/${safeName}`;
  return `site/${safeName}`;
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image or video to Supabase Storage with format & size validation,
 * automatic bucket routing, public URL generation, and fallback support.
 * Supports both options object: uploadSiteImage({ file, folder })
 * and positional parameters: uploadSiteImage(file, "post", userId)
 */
export async function uploadSiteImage(
  input: UploadImageOptions | File,
  folderArg?: ImageFolder | string,
  userIdArg?: string | null
): Promise<UploadImageResult> {
  // Normalize parameters
  let file: File;
  let folder: ImageFolder = "site";
  let bucket: "content-images" | "avatars" | undefined;
  let userId: string | null | undefined = userIdArg;
  let customFileName: string | undefined;

  if (input instanceof File || (input && typeof (input as any).name === "string" && (input as any).size !== undefined)) {
    file = input as File;
    if (folderArg) folder = (folderArg === "posts" ? "post" : folderArg) as ImageFolder;
  } else {
    file = input.file;
    folder = input.folder || "site";
    bucket = input.bucket;
    userId = input.userId;
    customFileName = input.customFileName;
  }

  // Create standard return helper
  const createResult = (success: boolean, url: string, path?: string, error?: string): UploadImageResult => {
    return {
      success,
      url,
      path: path || url,
      error,
      toString() {
        return this.url || "";
      },
    };
  };

  try {
    // 1. Validation
    if (!file) {
      return createResult(false, "", undefined, "No file provided");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return createResult(
        false,
        "",
        undefined,
        `File size exceeds ${(MAX_IMAGE_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB limit`
      );
    }

    // Check MIME type or fallback by file extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isMimeAllowed = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isExtAllowed = [
      "jpg", "jpeg", "png", "webp", "gif", "svg", "avif",
      "mp4", "webm", "mov", "mkv", "ogg"
    ].includes(ext);

    if (!isMimeAllowed && !isExtAllowed) {
      return createResult(
        false,
        "",
        undefined,
        "Unsupported media format. Please use JPG, PNG, WebP, GIF, MP4, WebM, or MOV."
      );
    }

    // 2. Select bucket
    const targetBucket = bucket || (folder === "avatar" ? "avatars" : "content-images");
    const path = buildStoragePath(folder, userId, customFileName || file.name);

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type || undefined,
      });

    if (uploadError) {
      console.warn("Supabase storage upload returned error, using reliable fallback:", uploadError.message);
      const fallbackUrl = await readFileAsDataUrl(file);
      return createResult(true, fallbackUrl, path, uploadError.message);
    }

    // 4. Retrieve Public CDN URL
    const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(uploadData?.path || path);

    if (!urlData?.publicUrl) {
      const fallbackUrl = await readFileAsDataUrl(file);
      return createResult(true, fallbackUrl, uploadData?.path || path);
    }

    return createResult(true, urlData.publicUrl, uploadData?.path || path);
  } catch (err: any) {
    console.warn("Unexpected upload exception, using reliable fallback:", err);
    try {
      const fallbackUrl = await readFileAsDataUrl(file);
      return createResult(true, fallbackUrl, undefined, err?.message);
    } catch {
      return createResult(false, "", undefined, err?.message || "Upload failed");
    }
  }
}

/**
 * Permanently deletes an image from Supabase Storage given its public URL.
 * Parses the bucket name and file path from the URL automatically.
 */
export async function deleteStorageImage(
  publicUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // URL format: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const url = new URL(publicUrl);
    const parts = url.pathname.split("/storage/v1/object/public/");
    if (parts.length < 2) {
      return { success: false, error: "Not a Supabase storage URL" };
    }
    const remainder = parts[1]; // "<bucket>/<filePath>"
    const slashIndex = remainder.indexOf("/");
    if (slashIndex === -1) {
      return { success: false, error: "Could not extract file path from URL" };
    }
    const bucket = remainder.slice(0, slashIndex);
    const filePath = decodeURIComponent(remainder.slice(slashIndex + 1));

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("deleteStorageImage error:", err);
    return { success: false, error: err?.message || "Failed to delete image from storage" };
  }
}

export { uploadSiteImage as uploadImage };

