import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileEdit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocale } from "@/lib/i18nField";
import CorrectionRequestModal from "@/components/common/CorrectionRequestModal";

export interface MemberCardData {
  id: string;
  name?: string | null;
  name_en?: string | null;
  title?: string | null;
  title_en?: string | null;
  bio?: string | null;
  bio_en?: string | null;
  avatar_url?: string | null;
  gradient_class?: string | null;
  role?: string | null;
  gender?: "male" | "female" | string | null;
}

// Strip control chars / collapse whitespace, then truncate.
const sanitize = (raw: string): string =>
  raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

const truncate = (raw: string, max: number): string => {
  const clean = sanitize(raw);
  if (!clean) return "";
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
};

/**
 * Detects member gender based on explicit property or common Bengali/English names & honorifics.
 */
export const detectGender = (member?: MemberCardData): "female" | "male" => {
  if (!member) return "male";
  if (member.gender) {
    const g = String(member.gender).toLowerCase().trim();
    if (g === "female" || g === "f" || g === "woman" || g === "নারী" || g === "মহিলা") return "female";
    if (g === "male" || g === "m" || g === "man" || g === "পুরুষ") return "male";
  }

  const text = `${member.name || ""} ${member.name_en || ""} ${member.title || ""} ${member.title_en || ""} ${member.role || ""}`.toLowerCase();

  const femaleMarkers = [
    "mrs", "ms", "miss", "begum", "khatun", "sultana", "akter", "akteri", "akhter", "parvin", "parveen",
    "nasreen", "nasrin", "fatema", "rokeya", "jahanara", "raziah", "razia", "shirin", "tahmina", "salma",
    "রেহানা", "বেগম", "খাতুন", "সুলতানা", "আক্তার", "পারভীন", "নাসরীন", "ফাতেমা", "রোকেয়া", "জাহানারা", "রাবেয়া", "সেলিনা", "রোকসানা", "শিরীন", "তাহমিনা", "সালমা", "নিলুফার", "মিসেস", "মহিলা"
  ];

  for (const marker of femaleMarkers) {
    if (text.includes(marker)) return "female";
  }

  return "male";
};

// ── Male Person Silhouette SVG ──
export const MaleSilhouette = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <circle cx="50" cy="32" r="19" />
    {/* Shoulders & Bust */}
    <path d="M50 56c-19.5 0-35 12.5-38 31a3 3 0 003 3.5h70a3 3 0 003-3.5c-3-18.5-18.5-31-38-31z" />
  </svg>
);

// ── Female Person Silhouette SVG ──
export const FemaleSilhouette = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hair Contour */}
    <path d="M50 10C35 10 27 22 27 38c0 9 4 17 8 22 1-5 4-10 7-13-1-3-2-6-2-10 0-8 4.5-15 10-15s10 7 10 15c0 4-1 7-2 10 3 3 6 8 7 13 4-5 8-13 8-22 0-16-8-28-23-28z" opacity="0.6" />
    {/* Head */}
    <circle cx="50" cy="33" r="17" />
    {/* Graceful Neck & Shoulders Bust */}
    <path d="M50 57c-17 0-31 11.5-34 29a3 3 0 003 3.5h62a3 3 0 003-3.5c-3-17.5-17-29-34-29z" />
  </svg>
);

interface MemberCardProps {
  member: MemberCardData;
  variant?: "senior" | "general" | "carousel";
  index?: number;
  bioMaxChars?: number;
  active?: boolean;
}

export const MemberCard = ({
  member,
  variant = "senior",
  index = 0,
  bioMaxChars = 140,
  active = false,
}: MemberCardProps) => {
  const { lang } = useLanguage();
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

  const gender = detectGender(member);
  const displayName = pickLocale(lang, member.name, member.name_en) || (lang === "en" ? "Member" : "সদস্য");
  const altName =
    lang === "en"
      ? pickLocale("bn", member.name, member.name_en)
      : pickLocale("en", member.name, member.name_en);
  const displayTitle = pickLocale(lang, member.title, member.title_en);
  const displayBio = truncate(pickLocale(lang, member.bio, member.bio_en), bioMaxChars);

  // 1. CAROUSEL VARIANT (Clean, Minimal, Full-Bleed Profile Image & Sleek Edge Shimmer)
  if (variant === "carousel") {
    return (
      <div
        className={`edge-shimmer-card relative w-full h-[290px] md:h-[320px] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 select-none group ${
          active
            ? "shadow-2xl shadow-primary/30 scale-100 ring-1 ring-accent/30"
            : "scale-95 opacity-75 hover:opacity-100"
        }`}
      >
        {/* Full-Bleed Profile Image or Foreshadowed Gender Person Silhouette Background */}
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-primary/25 via-card/95 to-card flex items-center justify-center overflow-hidden">
            {/* Ambient Radial Spotlight */}
            <div className="w-48 h-48 rounded-full bg-primary/35 blur-3xl absolute" />
            {/* Foreshadowed Person Gender Silhouette Icon */}
            <div className="w-40 h-40 flex items-center justify-center text-primary/50 opacity-60 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] select-none pointer-events-none transform -translate-y-3 transition-all duration-700 group-hover:scale-110 group-hover:opacity-85">
              {gender === "female" ? (
                <FemaleSilhouette className="w-full h-full" />
              ) : (
                <MaleSilhouette className="w-full h-full" />
              )}
            </div>
          </div>
        )}

        {/* Cinematic Vignette Overlay (Ensures text legibility) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none z-10" />

        {/* Minimal Symmetrical Bottom Information */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-center z-20 flex flex-col items-center justify-end">
          {displayTitle && (
            <span className="inline-block px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border border-accent/40 text-accent text-[11px] md:text-xs font-semibold font-bengali shadow-md mb-2 tracking-wide">
              {displayTitle}
            </span>
          )}

          <h3 className="font-bengali text-lg md:text-xl font-bold text-white tracking-wide leading-snug drop-shadow-md">
            {displayName}
          </h3>

          {altName && altName !== displayName && (
            <p className="text-[11px] md:text-xs text-white/70 tracking-wider mt-0.5 font-medium">
              {altName}
            </p>
          )}

          {active && displayBio && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="font-bengali text-xs text-white/75 line-clamp-2 mt-2 leading-relaxed max-w-[230px]"
            >
              {displayBio}
            </motion.p>
          )}
        </div>

        {/* Suggest Correction Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCorrectionModalOpen(true);
          }}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xs"
          title={lang === "en" ? "Suggest Correction / Update" : "তথ্য সংশোধনের আবেদন"}
        >
          <FileEdit className="w-3.5 h-3.5" />
        </button>

        {correctionModalOpen && (
          <CorrectionRequestModal
            isOpen={correctionModalOpen}
            onClose={() => setCorrectionModalOpen(false)}
            targetType="member"
            targetId={member.id}
            targetTitle={displayName}
            initialData={{
              name: member.name || "",
              name_en: member.name_en || "",
              title: member.title || member.role || "",
              title_en: member.title_en || "",
              bio: member.bio || "",
            }}
          />
        )}
      </div>
    );
  }

  // 2. GENERAL VARIANT
  if (variant === "general") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="edge-shimmer-card bg-card rounded-3xl p-4 text-center group w-[150px] sm:w-[175px] relative overflow-hidden shadow-lg"
        >
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl mx-auto mb-3 relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/15 border border-white/10 shadow-md flex items-center justify-center">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center text-primary/70 opacity-80">
                {gender === "female" ? (
                  <FemaleSilhouette className="w-full h-full" />
                ) : (
                  <MaleSilhouette className="w-full h-full" />
                )}
              </div>
            )}
          </div>
          <h3 className="font-bengali text-sm font-bold text-foreground truncate">{displayName}</h3>
          {displayTitle && <p className="text-xs text-accent font-medium truncate mt-0.5">{displayTitle}</p>}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCorrectionModalOpen(true);
            }}
            className="absolute top-2 right-2 z-30 p-1 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xs"
            title={lang === "en" ? "Suggest Correction / Update" : "তথ্য সংশোধনের আবেদন"}
          >
            <FileEdit className="w-3 h-3" />
          </button>
        </motion.div>

        {correctionModalOpen && (
          <CorrectionRequestModal
            isOpen={correctionModalOpen}
            onClose={() => setCorrectionModalOpen(false)}
            targetType="member"
            targetId={member.id}
            targetTitle={displayName}
            initialData={{
              name: member.name || "",
              name_en: member.name_en || "",
              title: member.title || member.role || "",
              title_en: member.title_en || "",
              bio: member.bio || "",
            }}
          />
        )}
      </>
    );
  }

  // 3. SENIOR FULL-BLEED ID CARD (Default)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="edge-shimmer-card relative w-[250px] sm:w-[280px] md:w-[300px] h-[380px] sm:h-[420px] rounded-3xl overflow-hidden text-center group shadow-2xl transition-all duration-300"
      >
        {/* Full-Bleed Profile Image or Foreshadowed Gender Person Silhouette Background */}
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-primary/25 via-card/95 to-card flex items-center justify-center overflow-hidden">
            <div className="w-56 h-56 rounded-full bg-primary/35 blur-3xl absolute" />
            <div className="w-48 h-48 flex items-center justify-center text-primary/50 opacity-60 drop-shadow-[0_4px_28px_rgba(0,0,0,0.6)] select-none pointer-events-none transform -translate-y-3 transition-all duration-700 group-hover:scale-110 group-hover:opacity-85">
              {gender === "female" ? (
                <FemaleSilhouette className="w-full h-full" />
              ) : (
                <MaleSilhouette className="w-full h-full" />
              )}
            </div>
          </div>
        )}

        {/* Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none z-10" />

        {/* Symmetrical Minimal Bottom Content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-center z-20 flex flex-col items-center justify-end">
          {displayTitle && (
            <span className="inline-block px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border border-accent/40 text-accent text-xs font-semibold font-bengali shadow-md mb-2.5 tracking-wide">
              {displayTitle}
            </span>
          )}

          <h3 className="font-bengali text-xl font-bold text-white tracking-wide leading-snug drop-shadow-md">
            {displayName}
          </h3>

          {altName && altName !== displayName && (
            <p className="text-xs text-white/70 tracking-wider mt-1 font-medium">{altName}</p>
          )}

          {displayBio && (
            <p className="font-bengali text-xs text-white/75 leading-relaxed mt-2 line-clamp-2 max-w-[240px]">
              {displayBio}
            </p>
          )}
        </div>

        {/* Suggest Correction Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCorrectionModalOpen(true);
          }}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xs"
          title={lang === "en" ? "Suggest Correction / Update" : "তথ্য সংশোধনের আবেদন"}
        >
          <FileEdit className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {correctionModalOpen && (
        <CorrectionRequestModal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          targetType="member"
          targetId={member.id}
          targetTitle={displayName}
          initialData={{
            name: member.name || "",
            name_en: member.name_en || "",
            title: member.title || member.role || "",
            title_en: member.title_en || "",
            bio: member.bio || "",
          }}
        />
      )}
    </>
  );
};

export default MemberCard;
