import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Calendar, GraduationCap,
  Menu, X, Users, Info, Search, User, Shield,
  Sun, Moon, Globe, LogOut, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import LogoTile from "@/components/branding/LogoTile";

export const MobileTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Hide mobile tab bar on admin and auth pages
  const isAuthOrAdmin =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  if (isAuthOrAdmin) return null;

  const tabs = [
    { key: "home", label: t("home") || "হোম", to: "/home", icon: Home },
    { key: "blog", label: t("blog") || "ব্লগ", to: "/blog", icon: BookOpen },
    { key: "events", label: t("events") || "ইভেন্ট", to: "/events", icon: Calendar },
    { key: "courses", label: t("courses") || "কোর্স", to: "/courses", icon: GraduationCap },
  ];

  const isTabActive = (tab: typeof tabs[0]) => {
    if (tab.to === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(tab.to);
  };

  const moreLinks = [
    { label: t("members") || "সদস্যবৃন্দ", to: "/members", icon: Users },
    { label: t("about") || "আমাদের সম্পর্কে", to: "/about", icon: Info },
    { label: t("search") || "অনুসন্ধান", to: "/search", icon: Search },
  ];

  const toggleLang = () => {
    setLang(lang === "bn" ? "en" : "bn");
  };

  return (
    <>
      {/* ── Native iOS Bottom Tab Bar ── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 dark:bg-slate-950/85 backdrop-blur-2xl border-t border-border/50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] px-2 py-1.5"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const active = isTabActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                to={tab.to}
                onClick={() => setSheetOpen(false)}
                className="relative flex-1 py-1.5 flex flex-col items-center justify-center gap-1 group transition-all"
              >
                <div
                  className={`relative p-1 rounded-full transition-all duration-200 ${
                    active
                      ? "text-primary scale-105"
                      : "text-muted-foreground group-active:scale-95"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {active && (
                    <motion.div
                      layoutId="ios-tab-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-xs shadow-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bengali tracking-tight transition-colors duration-200 ${
                    active ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Tab: iOS More / Menu Button */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-1 group transition-all ${
              sheetOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`p-1 rounded-full transition-all duration-200 ${
                sheetOpen ? "text-primary scale-105" : "text-muted-foreground group-active:scale-95"
              }`}
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] font-bengali tracking-tight ${
                sheetOpen ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {t("menu") || "মেনু"}
            </span>
          </button>
        </div>
      </nav>

      {/* ── iOS-Style Action Sheet / Drawer ── */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 bg-card dark:bg-slate-950 border-t border-border/60 rounded-t-[2.25rem] shadow-2xl p-5 pt-3 max-h-[85vh] overflow-y-auto space-y-4 depth-card"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* iOS Grabber Pill */}
              <div className="flex justify-center pb-2">
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <LogoTile size="sm" glow="off" />
                  <div>
                    <h4 className="font-bengali font-bold text-sm text-foreground leading-tight">
                      {settings.general.site_name_bn || "ফরিদপুর সাহিত্য পরিষদ"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                      {settings.general.site_name_en || "FARIDPUR SHAHITTO PARISHAD"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary More Links Group (iOS Grouped Style) */}
              <div className="rounded-2xl bg-secondary/40 dark:bg-white/[0.03] border border-border/50 divide-y divide-border/40 overflow-hidden">
                {moreLinks.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center justify-between p-3.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bengali text-sm font-semibold text-foreground">
                        {label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                  </Link>
                ))}
              </div>

              {/* User Account / Profile Group */}
              <div className="rounded-2xl bg-secondary/40 dark:bg-white/[0.03] border border-border/50 divide-y divide-border/40 overflow-hidden">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center justify-between p-3.5 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bengali text-sm font-semibold text-foreground block leading-tight">
                            {profile?.full_name || t("profile") || "প্রোফাইল"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                    </Link>

                    {role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center justify-between p-3.5 hover:bg-secondary/60 transition-colors bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="font-bengali text-sm font-bold text-primary">
                            {t("adminPanel") || "প্রশাসনিক প্যানেল"}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setSheetOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-bengali text-sm font-semibold">
                        {t("logout") || "লগআউট"}
                      </span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center justify-between p-3.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bengali text-sm font-semibold text-foreground">
                        {t("login") || "লগইন / সাইন আপ"}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                  </Link>
                )}
              </div>

              {/* Quick Settings: Theme & Language (iOS Segmented Controls) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-secondary/50 dark:bg-white/[0.04] border border-border/50 hover:bg-secondary transition-all"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 text-accent" />
                      <span className="text-xs font-semibold font-bengali text-foreground">
                        লাইট মোড
                      </span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold font-bengali text-foreground">
                        ডার্ক মোড
                      </span>
                    </>
                  )}
                </button>

                {/* Language Switch Button */}
                <button
                  type="button"
                  onClick={toggleLang}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-secondary/50 dark:bg-white/[0.04] border border-border/50 hover:bg-secondary transition-all"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold font-bengali text-foreground">
                    {lang === "bn" ? "English (EN)" : "বাংলা (BN)"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileTabBar;
