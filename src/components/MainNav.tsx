import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, LogOut, Settings, Shield, Sun, Moon, Home, BookOpen, Calendar, GraduationCap, Users, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { courses as mockCourses } from "@/data/mockData";
import { createSlug } from "@/lib/slugify";
import { getBanglaDate } from "@/lib/specialDays";
import demoLogo from "@/assets/site-logo.png";
import LogoTile from "@/components/branding/LogoTile";

const navItems = [
  { key: "home", to: "/home", icon: Home },
  { key: "blog", to: "/blog", icon: BookOpen },
  { key: "events", to: "/events", icon: Calendar },
  { key: "courses", to: "/courses", icon: GraduationCap },
  { key: "members", to: "/members", icon: Users },
  { key: "about", to: "/about", icon: Info },
];

interface Suggestion {
  title: string;
  link: string;
  type: string;
}

const MainNav = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarManuallyHidden, setSidebarManuallyHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  const siteName = lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn;
  const themeToggleLabel = theme === "dark" ? t("lightMode") : t("darkMode");
  const todayBangla = getBanglaDate();

  // Title + theme-tinted favicon. Recolors the source logo via canvas so the
  // tab icon matches the active palette (sitewide) if theme_adaptive_logo is enabled.
  useEffect(() => {
    document.title = `${settings.general.site_name_bn} | ${settings.general.site_name_en}`;
    const favicon = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
    if (!favicon) return;
    const logoUrl = settings.general.logo_url || demoLogo;
    let cancelled = false;

    const apply = (href: string, type: string) => {
      if (cancelled) return;
      favicon.href = href;
      favicon.type = type;
    };

    const isThemeAdaptive = settings.appearance.theme_adaptive_logo !== false;

    // Pull current primary HSL from CSS var so it tracks the palette.
    const primaryHsl = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "350 65% 42%";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no ctx");
        ctx.clearRect(0, 0, size, size);

        // Aspect ratio preserved fit (contain mode)
        const natW = img.naturalWidth || 1;
        const natH = img.naturalHeight || 1;
        const aspect = natW / natH;
        let drawW = size;
        let drawH = size;
        let drawX = 0;
        let drawY = 0;

        if (aspect < 1) {
          drawH = size;
          drawW = size * aspect;
          drawX = (size - drawW) / 2;
          drawY = 0;
        } else {
          drawW = size;
          drawH = size / aspect;
          drawX = 0;
          drawY = (size - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        
        // Re-tint with active palette color if theme adaptive is enabled
        if (isThemeAdaptive) {
          ctx.globalCompositeOperation = "source-in";
          ctx.fillStyle = `hsl(${primaryHsl})`;
          ctx.fillRect(0, 0, size, size);
        }
        
        apply(canvas.toDataURL("image/png"), "image/png");
      } catch {
        const bust = `${logoUrl}${logoUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(logoUrl + primaryHsl)}`;
        apply(bust, logoUrl.endsWith(".svg") ? "image/svg+xml" : "image/png");
      }
    };
    img.onerror = () => {
      const bust = `${logoUrl}${logoUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(logoUrl + primaryHsl)}`;
      apply(bust, logoUrl.endsWith(".svg") ? "image/svg+xml" : "image/png");
    };
    img.src = logoUrl;
    return () => { cancelled = true; };
  }, [
    settings.general.site_name_bn,
    settings.general.site_name_en,
    settings.general.logo_url,
    settings.appearance.palette,
    settings.appearance.theme_adaptive_logo,
  ]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/home");
    setUserMenuOpen(false);
  };

  // Search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const lower = searchQuery.toLowerCase();
    const results: Suggestion[] = [];

    // Course suggestions (demo data)

    mockCourses.forEach((c) => {
      if (c.title.toLowerCase().includes(lower) || c.titleEn.toLowerCase().includes(lower)) {
        results.push({ title: lang === "en" ? c.titleEn : c.title, link: `/courses/${c.id}`, type: t("courses") });
      }
    });

    // DB search (async, append)
    const searchDb = async () => {
      try {
        const { data: posts } = await supabase.from("posts").select("id,title,title_en").eq("published", true);
        if (posts) {
          posts.forEach((p) => {
            if (p.title.toLowerCase().includes(lower) || p.title_en.toLowerCase().includes(lower)) {
              if (!results.find(r => r.link.includes(p.id))) {
                results.push({ title: lang === "en" && p.title_en ? p.title_en : p.title, link: `/blog/${createSlug(p.title_en || p.title, p.id)}`, type: t("blog") });
              }
            }
          });
        }
        const { data: evts } = await supabase.from("events").select("id,title,title_en");
        if (evts) {
          evts.forEach((e) => {
            if (e.title.toLowerCase().includes(lower) || e.title_en.toLowerCase().includes(lower)) {
              if (!results.find(r => r.link.includes(e.id))) {
                results.push({ title: lang === "en" && e.title_en ? e.title_en : e.title, link: `/events/${createSlug(e.title_en || e.title, e.id)}`, type: t("events") });
              }
            }
          });
        }
        const { data: profiles } = await supabase.from("profiles").select("id,full_name,display_name");
        if (profiles) {
          profiles.forEach((p) => {
            if (p.full_name.toLowerCase().includes(lower) || p.display_name.toLowerCase().includes(lower)) {
              results.push({ title: p.full_name || p.display_name, link: `/profile/${p.id}`, type: t("members") });
            }
          });
        }
      } catch {}
      setSuggestions(results.slice(0, 8));
    };
    searchDb();
  }, [searchQuery, lang]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  // Auto-hide sidebar after 8 seconds
  const startAutoHide = useCallback(() => {
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    autoHideTimer.current = setTimeout(() => {
      setSidebarVisible(false);
    }, 8000);
  }, []);

  const showSidebar = useCallback(() => {
    if (sidebarManuallyHidden) return;
    setSidebarVisible(true);
    startAutoHide();
  }, [sidebarManuallyHidden, startAutoHide]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) return;
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastScrollY.current) > 30) {
        if (!sidebarManuallyHidden) {
          setSidebarVisible(true);
          startAutoHide();
        }
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sidebarManuallyHidden, startAutoHide]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleArrowToggle = () => {
    if (sidebarVisible) {
      setSidebarVisible(false);
      setSidebarManuallyHidden(true);
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    } else {
      setSidebarManuallyHidden(false);
      setSidebarVisible(true);
      startAutoHide();
    }
  };

  const logoSrc = settings.general.logo_url || demoLogo;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-sm" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <LogoTile size="sm" />
              <span className="font-bengali font-bold text-foreground text-sm hidden lg:block truncate max-w-[200px]">{siteName}</span>
              <span className="font-bengali font-bold text-foreground text-sm hidden sm:block lg:hidden truncate max-w-[60px]">{settings.general.site_name_en?.split(' ').map(w => w[0]).join('') || 'FSP'}</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} className={`px-4 py-2 text-sm rounded-full font-bengali transition-all duration-300 ${active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Live Bangla Date Pill */}
              <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/60 text-[11px] font-bengali text-foreground select-none shadow-2xs">
                <span className="text-sm">🇧🇩</span>
                <span className="font-bold text-primary">{todayBangla.formattedBn}</span>
              </div>

              {/* Search bar with suggestions */}
              <div className="relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    placeholder={t("search")}
                    className="pl-9 pr-8 py-1.5 w-28 sm:w-40 lg:w-52 rounded-full bg-secondary/80 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-bengali transition-all focus:w-36 sm:focus:w-52 lg:focus:w-60"
                  />
                  {searchQuery.trim() && (
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                      <ChevronRight className="w-3 h-3 text-primary-foreground" />
                    </button>
                  )}
                </form>
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full mt-2 left-0 right-0 min-w-[250px] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden depth-card"
                    >
                      {suggestions.map((s, i) => (
                        <Link
                          key={i}
                          to={s.link}
                          onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-0"
                        >
                          <span className="font-bengali text-xs text-foreground truncate flex-1">{s.title}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{s.type}</span>
                        </Link>
                      ))}
                      <button
                        onClick={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setShowSuggestions(false); setSearchQuery(""); }}
                        className="w-full px-4 py-2.5 text-xs text-primary font-bengali hover:bg-primary/5 transition-colors text-center"
                      >
                        {t("viewAllResults")} →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors border border-border/50" title={themeToggleLabel}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-accent" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-crimson-dark flex items-center justify-center hover:shadow-lg transition-all border border-primary-foreground/10">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-foreground font-bold text-xs">{(profile?.full_name || user.email || "?").charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }} className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-xl p-2 z-50 min-w-[180px] depth-card">
                        <p className="px-3 py-2 text-xs text-muted-foreground font-bengali border-b border-border mb-1">{profile?.full_name || user.email}</p>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-xl font-bengali"><User className="w-4 h-4" /> {t("profile")}</Link>
                        {role === "admin" && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-xl font-bengali"><Shield className="w-4 h-4" /> {t("adminPanel")}</Link>
                        )}
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-xl font-bengali"><Settings className="w-4 h-4" /> {t("settings")}</Link>
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl w-full font-bengali"><LogOut className="w-4 h-4" /> {t("logout")}</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center hover:from-primary/30 hover:to-accent/30 transition-all border border-border/50 shadow-inner">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainNav;
