import { motion } from "framer-motion";
import { Crown, Shield, Star, Award, UserRound } from "lucide-react";
import type { ComponentType } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocale } from "@/lib/i18nField";

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
}

const roleIcons: Record<string, ComponentType<{ className?: string }>> = {
  president: Crown,
  vp: Shield,
  secretary: Star,
  cultural: Award,
  treasurer: Shield,
  member: Star,
};

// Strip control chars / collapse whitespace, then truncate.
const sanitize = (raw: string): string =>
  raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

const truncate = (raw: string, max: number): string => {
  const clean = sanitize(raw);
  if (!clean) return "";
  if (clean.length <= max) return clean;
  // Trim back to last word boundary when possible.
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
};

const warned = new Set<string>();
const warnMissing = (m: MemberCardData) => {
  if (!import.meta.env.DEV) return;
  const missing: string[] = [];
  if (!m.name?.trim() && !m.name_en?.trim()) missing.push("name/name_en");
  if (!m.title?.trim() && !m.title_en?.trim()) missing.push("title/title_en");
  if (!m.bio?.trim() && !m.bio_en?.trim()) missing.push("bio/bio_en");
  if (missing.length === 0) return;
  const key = `${m.id}:${missing.join(",")}`;
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[MemberCard] Member ${m.id} missing locale fields: ${missing.join(", ")}`);
};

interface AvatarBlockProps {
  member: MemberCardData;
  displayName: string;
  className: string;
  iconClass?: string;
}

const Avatar = ({ member, displayName, className, iconClass = "w-1/2 h-1/2" }: AvatarBlockProps) => {
  if (member.avatar_url) {
    return (
      <img
        src={member.avatar_url}
        alt={displayName || "member avatar"}
        className={`${className} object-cover`}
      />
    );
  }
  return (
    <div className={`${className} flex items-center justify-center bg-muted/40 text-muted-foreground`}>
      <UserRound className={iconClass} aria-hidden="true" />
    </div>
  );
};

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
  bioMaxChars = 160,
  active = false,
}: MemberCardProps) => {
  const { lang } = useLanguage();
  warnMissing(member);

  const displayName = pickLocale(lang, member.name, member.name_en);
  const altName =
    lang === "en"
      ? pickLocale("bn", member.name, member.name_en)
      : pickLocale("en", member.name, member.name_en);
  const displayTitle = pickLocale(lang, member.title, member.title_en);
  const displayBio = truncate(pickLocale(lang, member.bio, member.bio_en), bioMaxChars);

  const RoleIcon = roleIcons[member.role || "member"] || Star;
  const gradient = member.gradient_class || "from-primary to-crimson";

  if (variant === "general") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -3, scale: 1.03 }}
        className="bg-card rounded-3xl border border-border p-4 sm:p-5 text-center depth-card group w-[140px] sm:w-[170px] md:w-[180px] relative hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5" />
        <div
          className={`w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full bg-gradient-to-br ${gradient} mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow duration-300 overflow-hidden`}
        >
          <Avatar member={member} displayName={displayName} className="w-full h-full rounded-full" iconClass="w-7 h-7" />
        </div>
        <h3 className="font-bengali text-sm font-bold text-foreground">{displayName || "—"}</h3>
        {displayTitle && <p className="text-xs text-muted-foreground">{displayTitle}</p>}
      </motion.div>
    );
  }

  if (variant === "carousel") {
    return (
      <div className="bg-primary-foreground/8 backdrop-blur-xl border border-primary-foreground/15 rounded-2xl overflow-hidden shadow-2xl">
        <div className={`h-16 md:h-18 bg-gradient-to-br ${gradient} relative rounded-t-2xl`}>
          <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="w-10 h-10 rounded-xl rotate-45 bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/5 border-2 border-primary-foreground/25 flex items-center justify-center shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="-rotate-45 w-full h-full">
                <Avatar member={member} displayName={displayName} className="w-full h-full" iconClass="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-7 pb-3 px-3 text-center">
          <h3 className="font-bengali text-xs md:text-sm font-bold text-primary-foreground">{displayName || "—"}</h3>
          {altName && altName !== displayName && (
            <p className="text-[9px] text-primary-foreground/50 mb-0.5">{altName}</p>
          )}
          {displayTitle && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[9px] font-semibold font-bengali">
              {displayTitle}
            </span>
          )}
          {active && displayBio && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="font-bengali text-[10px] text-primary-foreground/60 leading-relaxed mt-1 line-clamp-2"
            >
              {displayBio}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  // senior variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-card rounded-3xl border border-border overflow-hidden text-center group depth-card-3d w-[240px] sm:w-[280px] md:w-[300px] relative hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5" />
      <div className={`h-28 bg-gradient-to-br ${gradient} relative group-hover:brightness-110 transition-all duration-300`}>
        <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-xl relative group-hover:shadow-2xl group-hover:shadow-primary/20 transition-shadow duration-300 overflow-hidden">
            <Avatar member={member} displayName={displayName} className="w-full h-full rounded-full" iconClass="w-10 h-10" />
            {member.role === "president" && (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-lg bengali-glow"
              >
                <Crown className="w-4 h-4 text-accent-foreground" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-14 pb-6 px-5">
        <h3 className="font-bengali text-lg font-bold text-foreground">{displayName || "—"}</h3>
        {altName && altName !== displayName && (
          <p className="text-xs text-muted-foreground mb-1">{altName}</p>
        )}
        {displayTitle && (
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 font-bengali">
            <RoleIcon className="w-3 h-3" /> {displayTitle}
          </span>
        )}
        {displayBio && <p className="font-bengali text-sm text-muted-foreground">{displayBio}</p>}
      </div>
    </motion.div>
  );
};

export default MemberCard;
