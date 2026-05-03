import { ImgHTMLAttributes, useId } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Size = "sm" | "md" | "lg" | "xl";
type Glow = "off" | "subtle" | "normal" | "bold";

interface LogoTileProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  size?: Size;
  /** Render only the image with no tile background */
  bare?: boolean;
  /** Surrounding liquid blue→crimson halo intensity. Falls back to global setting. */
  glow?: Glow;
  /** Constrain halo so it never escapes a parent with overflow-hidden */
  contained?: boolean;
  /**
   * Per-asset dilation radius (in SVG user units, viewBox 0–100) used to flood-fill
   * internal transparent gaps when generating the background silhouette.
   * Defaults to settings.appearance.logo_dilate, then 8.
   */
  dilateRadius?: number;
}

// Module-level feature detection for inline SVG filter support. Falls back
// to a CSS mask-image silhouette in browsers (very old) without filter support.
const supportsSvgFilter = (() => {
  if (typeof window === "undefined") return true;
  try {
    return (
      typeof (window as unknown as { SVGFEMorphologyElement?: unknown })
        .SVGFEMorphologyElement !== "undefined" &&
      CSS.supports("filter", "url(#x)")
    );
  } catch {
    return true;
  }
})();

// Tile sizes — responsive across mobile / tablet / desktop, no cropping.
const sizeClasses: Record<Size, string> = {
  sm: "w-9 h-9 sm:w-10 sm:h-10",
  md: "w-11 h-11 sm:w-12 sm:h-12",
  lg: "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
  xl: "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24",
};

// Halo dimensions per intensity. Blur radii use clamp() so they scale with viewport
// (small on phones, generous on desktop) — keeping the tile from overpowering the header.
const glowConfig: Record<Exclude<Glow, "off">, {
  outerOpacity: number;
  innerOpacity: number;
  outerBlur: string; // CSS clamp()
  innerBlur: string;
  outerInset: string;
  innerInset: string;
  containedOuterInset: string;
  containedInnerInset: string;
}> = {
  subtle: {
    outerOpacity: 0.32, innerOpacity: 0.28,
    outerBlur: "clamp(8px, 1.6vw, 16px)",
    innerBlur: "clamp(5px, 1vw, 10px)",
    outerInset: "-22%", innerInset: "-8%",
    containedOuterInset: "-8%", containedInnerInset: "-2%",
  },
  normal: {
    outerOpacity: 0.55, innerOpacity: 0.5,
    outerBlur: "clamp(12px, 2.4vw, 24px)",
    innerBlur: "clamp(7px, 1.4vw, 14px)",
    outerInset: "-38%", innerInset: "-14%",
    containedOuterInset: "-12%", containedInnerInset: "-4%",
  },
  bold: {
    outerOpacity: 0.8, innerOpacity: 0.7,
    outerBlur: "clamp(16px, 3.2vw, 34px)",
    innerBlur: "clamp(10px, 1.8vw, 18px)",
    outerInset: "-52%", innerInset: "-18%",
    containedOuterInset: "-16%", containedInnerInset: "-6%",
  },
};

const LogoTile = ({
  size = "md",
  bare = false,
  glow,
  contained = false,
  dilateRadius,
  className = "",
  ...imgProps
}: LogoTileProps) => {
  const { theme } = useTheme();
  const { settings } = useSiteSettings();
  const { lang } = useLanguage();
  const reactId = useId();

  const logoSrc = settings.general.logo_url || "";
  const altText =
    (lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn) || "Site logo";

  // Without an admin-uploaded logo, render nothing (no hardcoded fallback).
  if (!logoSrc) return null;

  // Use the logo URL as-is. The previous `?v=encodeURIComponent(url)` was a
  // no-op cache-buster (token derived from the same URL never changes) but
  // it prevented browsers from caching the asset across visits and broke
  // any future CDN cache headers. Admin uploads always go to new storage
  // paths, so URL change alone is enough to invalidate.
  const cacheBustedSrc = logoSrc;

  // Sitewide intensity (admin can dial down): settings.appearance.logo_glow.
  const appearance = settings.appearance as unknown as {
    logo_glow?: Glow;
    logo_dilate?: number;
  };
  const globalGlow = appearance?.logo_glow ?? "normal";
  const effectiveGlow: Glow = glow ?? globalGlow;
  // Per-asset dilation: prop > admin setting > sensible default. Clamped to a
  // safe range so it never over-expands past the logo's true outer edge.
  const effectiveDilate = Math.max(
    0,
    Math.min(20, dilateRadius ?? appearance?.logo_dilate ?? 8),
  );

  // Logo color is recolored on the fly via a CSS var set by the active palette.
  // Fallback: theme primary tint.
  const themeFilter =
    "var(--logo-filter, brightness(0) saturate(100%) invert(18%) sepia(78%) saturate(3500%) hue-rotate(338deg) brightness(95%) contrast(105%) drop-shadow(0 1px 2px hsl(0 0% 0% / 0.15)))";
  const img = (
    <img
      src={cacheBustedSrc}
      alt={altText}
      loading="lazy"
      decoding="async"
      className={`max-w-full max-h-full object-contain ${className}`}
      style={{ filter: themeFilter }}
      {...imgProps}
    />
  );

  if (bare) return img;

  // White background follows the logo's OUTER silhouette only — inner transparent
  // holes inside the logo are filled (so the white shows through them), and the
  // outside edges are clipped flush to the logo shape.
  //
  // Filter chain (alpha-compositing, hole-filling):
  //   1. SourceAlpha          → strip out color, keep only the logo's alpha mask
  //   2. feMorphology dilate  → grow the silhouette by `effectiveDilate` units to
  //                              flood-fill internal transparent gaps
  //   3. feComponentTransfer  → discrete alpha ramp (semi-transparent → 1) so the
  //                              dilated edges are fully opaque, no soft fringe
  //   4. feFlood + feComposite "in" → paint the resulting solid silhouette with
  //                              the tile background color
  const tileBg = theme === "dark" ? "hsl(0,0%,96%)" : "#ffffff";
  // Unique per-instance id so multiple LogoTiles on the page don't collide.
  const filterId = `logo-silhouette-${reactId.replace(/:/g, "")}-${size}`;

  const silhouetteSvg = (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <filter
          id={filterId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={effectiveDilate}
            result="dilatedAlpha"
          />
          <feComponentTransfer in="dilatedAlpha" result="solidAlpha">
            {/* Snap any partial alpha to fully opaque to kill soft halos */}
            <feFuncA type="discrete" tableValues="0 1 1 1 1" />
          </feComponentTransfer>
          <feFlood floodColor={tileBg} result="flood" />
          <feComposite in="flood" in2="solidAlpha" operator="in" />
        </filter>
      </defs>
      <image
        href={cacheBustedSrc}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />
    </svg>
  );

  // Fallback for environments without SVG filter support: a plain CSS mask
  // clipped to the logo's alpha. Internal holes won't be filled but the
  // outside silhouette stays clean.
  const silhouetteFallback = (
    <div
      aria-hidden
      className={`absolute inset-0 ${theme === "dark" ? "bg-[hsl(0_0%_96%)]" : "bg-white"}`}
      style={{
        WebkitMaskImage: `url(${cacheBustedSrc})`,
        maskImage: `url(${cacheBustedSrc})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );

  const silhouette = supportsSvgFilter ? silhouetteSvg : silhouetteFallback;

  const tile = (
    <div
      className={`relative ${sizeClasses[size]} flex items-center justify-center shrink-0`}
    >
      {silhouette}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {img}
      </div>
    </div>
  );

  if (effectiveGlow === "off") return tile;

  const cfg = glowConfig[effectiveGlow];
  const outerInset = contained ? cfg.containedOuterInset : cfg.outerInset;
  const innerInset = contained ? cfg.containedInnerInset : cfg.innerInset;
  // Slight boost in dark mode so the halo reads against deep charcoal.
  const outerOpacity = theme === "dark" ? Math.min(1, cfg.outerOpacity * 1.2) : cfg.outerOpacity;
  const innerOpacity = theme === "dark" ? Math.min(1, cfg.innerOpacity * 1.15) : cfg.innerOpacity;

  return (
    <div className="relative isolate inline-flex items-center justify-center">
      {/* Outer radial halo — crimson core fading through gold into transparency */}
      <div
        aria-hidden
        className="logo-halo-pulse pointer-events-none absolute rounded-full"
        style={{
          inset: outerInset,
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.85) 0%, hsl(var(--crimson, var(--primary)) / 0.55) 35%, hsl(var(--gold) / 0.45) 65%, transparent 80%)",
          filter: `blur(${cfg.outerBlur})`,
          ["--halo-opacity" as never]: String(outerOpacity),
          opacity: outerOpacity,
          zIndex: 0,
        }}
      />
      {/* Inner conic ring — primary → gold → primary, on-theme rotation */}
      <div
        aria-hidden
        className="logo-halo-spin pointer-events-none absolute rounded-full"
        style={{
          inset: innerInset,
          background:
            "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--gold)), hsl(var(--primary)), hsl(var(--accent, var(--gold))), hsl(var(--primary)))",
          filter: `blur(${cfg.innerBlur})`,
          opacity: innerOpacity,
          zIndex: 0,
        }}
      />
      {tile}
    </div>
  );
};

export default LogoTile;
