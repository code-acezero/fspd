import { useState, useEffect, ImgHTMLAttributes } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Size = "sm" | "md" | "lg" | "xl";
type Glow = "off" | "subtle" | "normal" | "bold";

interface LogoTileProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  size?: Size;
  /** Render only the image with no tile background */
  bare?: boolean;
  /** Legacy prop - default is off for clean sleek aesthetic */
  glow?: Glow;
  contained?: boolean;
  dilateRadius?: number;
}

// Tile sizes — responsive across mobile / tablet / desktop, no cropping.
const sizeClasses: Record<Size, string> = {
  sm: "w-8 h-8 sm:w-9 sm:h-9",
  md: "w-10 h-10 sm:w-11 sm:h-11",
  lg: "w-12 h-12 sm:w-14 sm:h-14",
  xl: "w-16 h-16 sm:w-20 sm:h-20",
};

// Global memory cache for processed logo Data URLs
const logoCache = new Map<string, string>();

function generateCrispLogo(imgSrc: string): Promise<string> {
  if (logoCache.has(imgSrc)) {
    return Promise.resolve(logoCache.get(imgSrc)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = img.naturalWidth || 447;
        const h = img.naturalHeight || 559;

        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = w;
        srcCanvas.height = h;
        const srcCtx = srcCanvas.getContext("2d");
        if (!srcCtx) {
          resolve(imgSrc);
          return;
        }
        srcCtx.drawImage(img, 0, 0);
        const imgData = srcCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Compute row bounds for shield interior
        const bounds: { minX: number; maxX: number }[] = [];
        for (let y = 0; y < h; y++) {
          let minX = -1;
          let maxX = -1;
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 25) {
              if (minX === -1) minX = x;
              maxX = x;
            }
          }
          bounds.push({ minX, maxX });
        }

        // Sleek prominent crest border dilation (~22px at 447px width -> ~2.5px solid border on small icons)
        const borderPx = 22;

        const borderCanvas = document.createElement("canvas");
        borderCanvas.width = w;
        borderCanvas.height = h;
        const bCtx = borderCanvas.getContext("2d");
        if (!bCtx) {
          resolve(imgSrc);
          return;
        }
        const bData = bCtx.createImageData(w, h);
        const bd = bData.data;

        for (let y = 0; y < h; y++) {
          let minX = -1;
          let maxX = -1;
          for (let dy = -borderPx; dy <= borderPx; dy++) {
            const ny = y + dy;
            if (ny >= 0 && ny < h) {
              const b = bounds[ny];
              if (b.minX !== -1) {
                const dx = Math.round(Math.sqrt(Math.max(0, borderPx * borderPx - dy * dy)));
                const rowMin = b.minX - dx;
                const rowMax = b.maxX + dx;
                if (minX === -1 || rowMin < minX) minX = rowMin;
                if (maxX === -1 || rowMax > maxX) maxX = rowMax;
              }
            }
          }

          if (minX !== -1 && maxX !== -1) {
            const startX = Math.max(0, minX);
            const endX = Math.min(w - 1, maxX);
            for (let x = startX; x <= endX; x++) {
              const idx = (y * w + x) * 4;
              bd[idx] = 255;     // R
              bd[idx + 1] = 255; // G
              bd[idx + 2] = 255; // B
              bd[idx + 3] = 255; // A (100% solid white backing & sleek border)
            }
          }
        }
        bCtx.putImageData(bData, 0, 0);

        // Final Composite Canvas: Smooth White Bordered Silhouette + Logo
        const outCanvas = document.createElement("canvas");
        outCanvas.width = w;
        outCanvas.height = h;
        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) {
          resolve(imgSrc);
          return;
        }

        // 1. Draw solid white silhouette with sleek slim border
        outCtx.drawImage(borderCanvas, 0, 0);
        // 2. Draw crisp original logo centered on top
        outCtx.drawImage(srcCanvas, 0, 0);

        const dataUrl = outCanvas.toDataURL("image/png");
        logoCache.set(imgSrc, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        console.warn("Could not generate composite logo:", err);
        resolve(imgSrc);
      }
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

const LogoTile = ({
  size = "md",
  bare = false,
  className = "",
  ...imgProps
}: LogoTileProps) => {
  const { settings, effectivePalette } = useSiteSettings();
  const { lang } = useLanguage();
  const [renderedSrc, setRenderedSrc] = useState<string>("");

  const rawLogoSrc = settings.general.logo_url || "";
  const altText =
    (lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn) || "Site logo";

  const isThemeAdaptive = settings.appearance.theme_adaptive_logo !== false;
  const currentPalette = PALETTES[effectivePalette] || PALETTES["royal"];

  useEffect(() => {
    if (!rawLogoSrc) return;
    let isCurrent = true;
    generateCrispLogo(rawLogoSrc).then((src) => {
      if (isCurrent) setRenderedSrc(src);
    });
    return () => {
      isCurrent = false;
    };
  }, [rawLogoSrc]);

  if (!rawLogoSrc) return null;

  const displaySrc = renderedSrc || rawLogoSrc;

  return (
    <div
      className={`relative ${sizeClasses[size]} flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <img
        src={displaySrc}
        alt={altText}
        loading="eager"
        decoding="async"
        style={{
          filter: isThemeAdaptive && currentPalette ? currentPalette.logoFilter : "none",
          ...(imgProps.style || {}),
        }}
        className={`w-full h-full object-contain transition-all duration-300 ${imgProps.className || ""}`}
        {...imgProps}
      />
    </div>
  );
};

export default LogoTile;
