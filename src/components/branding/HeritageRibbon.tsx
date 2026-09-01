import { type ReactNode, useId } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeritageRibbonProps {
  children?: ReactNode;
  text?: string;
  textBn?: string;
  textEn?: string;
  className?: string;
}

export const HeritageRibbon = ({ children, text, textBn, textEn, className = "" }: HeritageRibbonProps) => {
  const { lang } = useLanguage();
  const uniqueId = useId().replace(/:/g, "_");
  const textPathId = `ribbon-arc-${uniqueId}`;
  const frontGradId = `front-grad-${uniqueId}`;
  const wingGradId = `wing-grad-${uniqueId}`;
  const shadowGradId = `shadow-grad-${uniqueId}`;

  let displayText = "";
  if (textBn || textEn) {
    displayText = lang === "en" ? (textEn || "ESTD  1975") : (textBn || "প্রতিষ্ঠিত  ১৯৭৫");
  } else if (typeof text === "string") {
    if (lang === "en" && (text.includes("প্রতিষ্ঠিত") || text.includes("১৯৭৫"))) {
      displayText = "ESTD  1975";
    } else {
      displayText = text;
    }
  } else if (typeof children === "string") {
    if (lang === "en" && (children.includes("প্রতিষ্ঠিত") || children.includes("১৯৭৫"))) {
      displayText = "ESTD  1975";
    } else {
      displayText = children;
    }
  } else {
    displayText = lang === "en" ? "ESTD  1975" : "প্রতিষ্ঠিত  ১৯৭৫";
  }

  const isEnglish = lang === "en";

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Main Front Banner Theme Gradient */}
          <linearGradient id={frontGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary-dark, var(--primary)))" stopOpacity="0.92" />
          </linearGradient>

          {/* Side Tails Gradient */}
          <linearGradient id={wingGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.88" />
            <stop offset="100%" stopColor="hsl(var(--primary-dark, var(--primary)))" stopOpacity="0.75" />
          </linearGradient>

          {/* Underfold Shadow Gradient for curved fold depth */}
          <linearGradient id={shadowGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
          </linearGradient>

          {/* Subtle Arch for Text Flow */}
          <path
            id={textPathId}
            d="M 60 45 Q 190 39 320 45"
            fill="none"
            stroke="none"
          />
        </defs>

        {/* 1. Left Wing Tail (Flowing with Fishtail Notch) */}
        <path
          d="M 56 24 C 38 25 24 26 10 27 L 26 44 L 10 61 C 24 62 38 63 56 64 Z"
          fill={`url(#${wingGradId})`}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Left Wing Inner Sleek Trim */}
        <path
          d="M 52 28 C 36 29 24 30 16 31 L 28 44 L 16 57 C 24 58 36 59 52 60"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {/* 2. Right Wing Tail (Symmetrical Mirrored Notch) */}
        <path
          d="M 324 24 C 342 25 356 26 370 27 L 354 44 L 370 61 C 356 62 342 63 324 64 Z"
          fill={`url(#${wingGradId})`}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Right Wing Inner Sleek Trim */}
        <path
          d="M 328 28 C 344 29 356 30 364 31 L 352 44 L 364 57 C 356 58 344 59 328 60"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {/* 3. Smooth Curved Fold Crease Shadows (Under-tuck Bends) */}
        <path
          d="M 56 62 C 56 67 58 70 56 71 L 78 62 Z"
          fill={`url(#${shadowGradId})`}
        />
        <path
          d="M 324 62 C 324 67 322 70 324 71 L 302 62 Z"
          fill={`url(#${shadowGradId})`}
        />

        {/* 4. Main Front Banner (Taller Height with Proper Proportional Text Fit) */}
        <path
          d="M 56 16 Q 190 10 324 16 L 324 62 Q 190 56 56 62 Z"
          fill={`url(#${frontGradId})`}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Front Banner Inner Sleek Accent Lines */}
        <path
          d="M 62 20 Q 190 14 318 20"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.75"
        />
        <path
          d="M 62 58 Q 190 52 318 58"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.75"
        />

        {/* 5. Center High-Contrast Typography with Generous Vertical Breathing Room */}
        <text
          className={`${isEnglish ? "font-serif font-bold text-[17px] sm:text-[19px]" : "font-bengali font-extrabold text-[19px] sm:text-[21px]"} fill-white`}
          letterSpacing={isEnglish ? "0.22em" : "0.32em"}
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
        >
          <textPath href={`#${textPathId}`} startOffset="50%" textAnchor="middle">
            {displayText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default HeritageRibbon;
