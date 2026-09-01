import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getBanglaDate } from "@/lib/specialDays";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Award,
  Settings,
  Users,
  Palette,
  Menu,
  X,
  Eye,
  EyeOff,
  LogOut,
  Save,
  Loader2,
  Trash2,
  Edit3,
  ImagePlus,
  Crown,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  GraduationCap,
  Layers,
  ExternalLink,
  RotateCcw,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Image as ImageLucide,
  TrendingUp,
  BarChart3,
  Clock,
  MapPin,
  FolderTree,
  UploadCloud,
  CheckSquare,
  Square,
  Search,
  Filter,
  Youtube,
  Share2,
  Tag,
  Sun,
  Moon,
  User,
  Bell,
  SlidersHorizontal,
  MoreHorizontal,
  Link2,
  Unlink,
  RefreshCw,
  UserCheck,
  UserPlus,
  Shield,
  Aperture,
  Sliders,
  Paintbrush,
  AlertTriangle,
  Compass,
} from "lucide-react";
import LogoTile from "@/components/branding/LogoTile";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings, applyBrowserFavicon } from "@/contexts/SiteSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PALETTES, PaletteId, applyPalette } from "@/lib/palettes";
import { uploadImage } from "@/lib/storage";
import ModerationPanel from "@/components/admin/ModerationPanel";
import SettingsHistoryPanel from "@/components/admin/SettingsHistoryPanel";
import HealthCheckBanner from "@/components/admin/HealthCheckBanner";
import GalleryManager, { GalleryAsset } from "@/components/admin/GalleryManager";
import PostComposer, { PostData } from "@/components/admin/PostComposer";
import AdminSearchFilterBar, { type FilterOption } from "@/components/common/AdminSearchFilterBar";
import ThemePalettesStudio from "@/components/admin/ThemePalettesStudio";

type AdminTab =
  | "dashboard"
  | "posts"
  | "events"
  | "courses"
  | "gallery"
  | "members"
  | "users"
  | "moderation"
  | "settings"
  | "appearance";

interface Member {
  id: string;
  name: string;
  name_en?: string;
  title?: string;
  title_en?: string;
  role: string;
  role_en?: string;
  category?: string;
  avatar_url?: string;
  bio?: string;
  bio_en?: string;
  phone?: string;
  sort_order?: number;
  user_id?: string | null;
}

interface ProfileItem {
  id: string;
  full_name?: string;
  display_name?: string;
  bio?: string;
  phone?: string;
  position?: string;
  position_en?: string;
  avatar_url?: string;
  is_senior?: boolean;
  created_at?: string;
  user_role?: string;
}

interface Post {
  id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  category: string;
  tags?: string[];
  cover_image?: string;
  images?: string[];
  youtube_url?: string;
  published: boolean;
  featured?: boolean;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  title_en?: string;
  date: string;
  date_en?: string;
  time: string;
  time_en?: string;
  location: string;
  location_en?: string;
  description: string;
  description_en?: string;
  tag: string;
  tag_color?: string;
  cover_image?: string;
}

interface CourseItem {
  id: string;
  title: string;
  title_en?: string;
  instructor?: string;
  instructor_en?: string;
  category?: string;
  fee?: number;
  duration?: string;
  duration_en?: string;
  level?: string;
  description?: string;
  description_en?: string;
  highlights?: string;
  highlights_en?: string;
  cover_image?: string;
  sort_order?: number;
  is_active?: boolean;
}

const CATEGORY_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  "ইতিহাস": { bn: "ইতিহাস", en: "History" },
  "সাহিত্য": { bn: "সাহিত্য", en: "Literature" },
  "কবিতা": { bn: "কবিতা", en: "Poetry" },
  "প্রবন্ধ": { bn: "প্রবন্ধ", en: "Essay" },
  "গবেষণা": { bn: "গবেষণা", en: "Research" },
  "ঘোষণা": { bn: "ঘোষণা", en: "Announcement" },
  "সংবাদ": { bn: "সংবাদ", en: "News" },
};

const ROLE_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  "founder": { bn: "প্রতিষ্ঠাতা ও স্বপ্নদ্রষ্টা", en: "Founder & Visionary" },
  "president": { bn: "সভাপতি", en: "President" },
  "vp": { bn: "সহ-সভাপতি", en: "Vice President" },
  "secretary": { bn: "সাধারণ সম্পাদক", en: "General Secretary" },
  "joint_secretary": { bn: "যুগ্ম সাধারণ সম্পাদক", en: "Joint General Secretary" },
  "treasurer": { bn: "কোষাধ্যক্ষ", en: "Treasurer" },
  "literary": { bn: "সাহিত্য সম্পাদক", en: "Literary Secretary" },
  "cultural": { bn: "সাংস্কৃতিক সম্পাদক", en: "Cultural Secretary" },
  "member": { bn: "কার্যকরী সদস্য", en: "Executive Member" },
  "advisor": { bn: "উপদেষ্টা", en: "Advisor" },
};

const emptyCourseForm = {
  title: "",
  title_en: "",
  instructor: "",
  instructor_en: "",
  category: "সাহিত্য চর্চা",
  fee: 0,
  duration: "৩ মাস",
  duration_en: "3 Months",
  level: "অল লেভেল",
  description: "",
  description_en: "",
  highlights: "",
  highlights_en: "",
  cover_image: "",
  sort_order: 0,
  is_active: true,
};

const emptyEventForm = {
  title: "",
  title_en: "",
  date: "",
  date_en: "",
  time: "",
  time_en: "",
  location: "",
  location_en: "",
  description: "",
  description_en: "",
  tag: "সাহিত্য সভা",
  tag_color: "bg-primary/20 text-primary",
  cover_image: "",
};

interface UserRoleDropdownProps {
  currentRole: string;
  onRoleChange: (newRole: "admin" | "moderator" | "user") => void;
}

const UserRoleDropdown = ({ currentRole, onRoleChange }: UserRoleDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const roles = [
    { key: "user", label: "USER", dot: "bg-zinc-400" },
    { key: "moderator", label: "MODERATOR", dot: "bg-blue-400" },
    { key: "admin", label: "ADMIN", dot: "bg-purple-400" },
  ];

  const activeRoleObj = roles.find((r) => r.key === currentRole) || roles[0];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold font-mono border transition-all shadow-xs active:scale-95 ${
          currentRole === "admin"
            ? "bg-purple-500/15 text-purple-400 border-purple-500/40 hover:bg-purple-500/25"
            : currentRole === "moderator"
            ? "bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25"
            : "bg-secondary/80 hover:bg-secondary text-muted-foreground border-border"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${activeRoleObj.dot}`} />
        <span>{activeRoleObj.label}</span>
        <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-36 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 origin-top-right">
          {roles.map((r) => {
            const isSelected = currentRole === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  onRoleChange(r.key as any);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "hover:bg-secondary text-foreground/80 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : r.dot}`} />
                  <span>{r.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial activeTab & subTab from URL search params or fallback to localStorage
  const validTabs: AdminTab[] = [
    "dashboard",
    "moderation",
    "posts",
    "events",
    "courses",
    "gallery",
    "members",
    "users",
    "settings",
    "appearance",
  ];
  const paramTab = searchParams.get("tab") as AdminTab;
  const localTab = (typeof window !== "undefined" ? localStorage.getItem("fspd_admin_tab") : null) as AdminTab;
  const initialTab: AdminTab = validTabs.includes(paramTab)
    ? paramTab
    : validTabs.includes(localTab)
    ? localTab
    : "dashboard";

  const validSubTabs = ["general", "branding", "palettes", "features", "history"] as const;
  type SubTabType = typeof validSubTabs[number];
  const paramSubTab = searchParams.get("subtab") as SubTabType;
  const localSubTab = (typeof window !== "undefined" ? localStorage.getItem("fspd_admin_subtab") : null) as SubTabType;
  const initialSubTab: SubTabType = validSubTabs.includes(paramSubTab)
    ? paramSubTab
    : validSubTabs.includes(localSubTab)
    ? localSubTab
    : "general";

  const [activeTab, setActiveTabState] = useState<AdminTab>(initialTab);
  const [settingsSubTab, setSettingsSubTabState] = useState<SubTabType>(initialSubTab);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("fspd_admin_tab", tab);
    } catch {}
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        if (tab !== "settings" && tab !== "appearance") {
          next.delete("subtab");
        }
        return next;
      },
      { replace: true }
    );
  };

  const setSettingsSubTab = (sub: SubTabType) => {
    setSettingsSubTabState(sub);
    try {
      localStorage.setItem("fspd_admin_subtab", sub);
    } catch {}
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "settings");
        next.set("subtab", sub);
        return next;
      },
      { replace: true }
    );
  };

  // Sync URL on initial mount if tab is not present in URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!next.has("tab")) next.set("tab", initialTab);
        if ((initialTab === "settings" || initialTab === "appearance") && !next.has("subtab")) {
          next.set("subtab", initialSubTab);
        }
        return next;
      },
      { replace: true }
    );
  }, []);

  const todayBangla = getBanglaDate();

  const { user, profile, role, signOut } = useAuth();
  const avatarUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || "";
  const { settings, updateSettings, refreshSettings } = useSiteSettings();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [usersCount, setUsersCount] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  // New Creation Forms at top
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Inline Editing state (which specific item ID is being edited inline)
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [savingPost, setSavingPost] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [memberForm, setMemberForm] = useState({ name: "", name_en: "", role: "member", bio: "", avatar_url: "" });

  const [profilesList, setProfilesList] = useState<ProfileItem[]>([]);
  const [userRolesList, setUserRolesList] = useState<{ id: string; user_id: string; role: string }[]>([]);

  // Sync / Connect Modal State
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncMember, setSyncMember] = useState<Member | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [syncMode, setSyncMode] = useState<"council_to_user" | "user_to_council" | "link_only">("link_only");
  const [syncing, setSyncing] = useState(false);
  // Search and Filter states across tabs
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postFilter, setPostFilter] = useState("all");

  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const [generalForm, setGeneralForm] = useState({
    site_name_bn: "ফরিদপুর সাহিত্য পরিষদ",
    site_name_en: "Faridpur Shahitto Parishad",
    tagline_bn: "বাংলা সংস্কৃতির পাদপীঠ",
    tagline_en: "The Cradle of Bengali Culture",
    contact_email: "info@fsp.org.bd",
    contact_phone: "01715-015621",
    alt_phone: "",
    address_bn: "ফরিদপুর সাহিত্য পরিষদ, সাহিত্য ভবন, পৌরসভার পূর্ব পার্শ্বে, ফরিদপুর",
    address_en: "Faridpur Shahitto Parishad, Sahitya Bhaban, East of Municipality, Faridpur",
    logo_url: "/site-logo.png",
    facebook_url: "https://facebook.com",
    youtube_url: "",
    established_year_bn: "১৯৮২",
    established_year_en: "1982",
    favicon_bg: "white_circle" as "white_circle" | "white_solid" | "gradient_primary" | "transparent",
  });
  const [appearanceForm, setAppearanceForm] = useState({
    palette: "royal" as PaletteId,
    logo_glow: "normal" as "off" | "subtle" | "normal" | "bold",
    logo_dilate: 8,
    show_particles: true,
    auto_festival_theme: true,
    active_festival_override: null as string | null,
    theme_adaptive_logo: true,
  });
  const [featuresForm, setFeaturesForm] = useState({
    enable_blog: true,
    enable_events: true,
    enable_courses: true,
    enable_members: true,
    enable_gallery: true,
    maintenance_mode: false,
    maintenance_message_bn: "ওয়েবসাইটে রক্ষণাবেক্ষণের কাজ চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।",
    maintenance_message_en: "Site is currently undergoing scheduled maintenance. We will be back shortly.",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, eRes, cRes, mRes, aRes, profRes, rolesRes] = await Promise.all([
        supabase.from("posts").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("created_at", { ascending: false }),
        supabase.from("courses").select("*").order("sort_order", { ascending: true }),
        supabase.from("members").select("*").order("sort_order", { ascending: true }),
        supabase.from("site_assets").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (pRes.data) setPosts(pRes.data as Post[]);
      if (eRes.data) setEvents(eRes.data as EventItem[]);
      if (cRes.data) setCourses(cRes.data as CourseItem[]);
      if (mRes.data) setMembers(mRes.data as Member[]);
      if (aRes.data) setAssets(aRes.data as GalleryAsset[]);
      if (profRes.data) setProfilesList(profRes.data as ProfileItem[]);
      if (rolesRes.data) setUserRolesList(rolesRes.data as any[]);

      // Settings load
      if (settings?.general) {
        setGeneralForm((prev) => ({ ...prev, ...(settings.general as any) }));
      }
      if (settings?.appearance) {
        setAppearanceForm((prev) => ({ ...prev, ...(settings.appearance as any) }));
      }
      if (settings?.features) {
        setFeaturesForm((prev) => ({ ...prev, ...(settings.features as any) }));
      }
    } catch (err: any) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Two-Way Sync / Connect Council Member to User Account
  const handleExecuteSync = async () => {
    if (!syncMember || !selectedUserId) return;
    setSyncing(true);
    try {
      const targetUser = profilesList.find((p) => p.id === selectedUserId);

      if (syncMode === "council_to_user") {
        await supabase.from("profiles").update({
          full_name: syncMember.name || targetUser?.full_name,
          display_name: syncMember.name || targetUser?.display_name,
          position: syncMember.title || syncMember.role || targetUser?.position,
          position_en: syncMember.title_en || syncMember.role_en || targetUser?.position_en,
          bio: syncMember.bio || targetUser?.bio,
          phone: syncMember.phone || targetUser?.phone,
          avatar_url: syncMember.avatar_url || targetUser?.avatar_url,
        }).eq("id", selectedUserId);
      }

      if (syncMode === "user_to_council" && targetUser) {
        await supabase.from("members").update({
          name: targetUser.display_name || targetUser.full_name || syncMember.name,
          title: targetUser.position || syncMember.title || "",
          title_en: targetUser.position_en || syncMember.title_en || "",
          bio: targetUser.bio || syncMember.bio || "",
          phone: targetUser.phone || syncMember.phone || "",
          avatar_url: targetUser.avatar_url || syncMember.avatar_url || "",
          user_id: selectedUserId,
        }).eq("id", syncMember.id);
      } else {
        await supabase.from("members").update({
          user_id: selectedUserId,
        }).eq("id", syncMember.id);
      }

      toast({
        title: lang === "en" ? "Council Member linked & synced!" : "সদস্য প্রোফাইল ও ইউজার একাউন্ট সংযুক্ত হয়েছে!",
      });
      setSyncModalOpen(false);
      setSyncMember(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectMember = async (memberId: string) => {
    if (!confirm(lang === "en" ? "Disconnect this user account from the council member?" : "আপনি কি এই সদস্য থেকে ইউজার একাউন্টের সংযোগ বিচ্ছিন্ন করতে চান?")) return;
    try {
      await supabase.from("members").update({ user_id: null }).eq("id", memberId);
      toast({ title: lang === "en" ? "User account disconnected" : "সংযোগ বিচ্ছিন্ন করা হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Disconnection failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    try {
      const existing = userRolesList.find((r) => r.user_id === userId);
      if (existing) {
        const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert([{ user_id: userId, role: newRole }]);
        if (error) throw error;
      }
      toast({ title: lang === "en" ? "User role updated successfully" : "ইউজার রোল সফলভাবে আপডেট হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Role update failed", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
  }, [settings]);

  // Handle Save Post (Handles both Create New and Inline Edit)
  const handleSavePost = async (postData: PostData, targetId?: string | null) => {
    setSavingPost(true);
    const postToEditId = targetId || editingPostId;

    try {
      if (postToEditId) {
        const { error } = await supabase
          .from("posts")
          .update({
            title: postData.title,
            title_en: postData.title_en,
            content: postData.content,
            excerpt: postData.excerpt,
            excerpt_en: postData.excerpt_en,
            category: postData.category,
            tags: postData.tags,
            cover_image: postData.cover_image,
            images: postData.images,
            youtube_url: postData.youtube_url,
            published: postData.published,
            featured: postData.featured,
          })
          .eq("id", postToEditId);

        if (error) throw error;
        toast({ title: lang === "en" ? "Post updated successfully!" : "পোস্ট সফলভাবে আপডেট হয়েছে!" });
      } else {
        const { error } = await supabase.from("posts").insert([
          {
            title: postData.title,
            title_en: postData.title_en,
            content: postData.content,
            excerpt: postData.excerpt,
            excerpt_en: postData.excerpt_en,
            category: postData.category,
            tags: postData.tags,
            cover_image: postData.cover_image,
            images: postData.images,
            youtube_url: postData.youtube_url,
            published: postData.published,
            featured: postData.featured,
          },
        ]);

        if (error) throw error;
        toast({ title: lang === "en" ? "Post published successfully!" : "পোস্ট সফলভাবে প্রকাশ করা হয়েছে!" });
      }

      setIsCreatingPost(false);
      setEditingPostId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error saving post" : "পোস্ট সংরক্ষণে ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSavingPost(false);
    }
  };

  // Quick Toggle Publish / Unpublish Post
  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    const newStatus = !currentPublished;
    try {
      const { error } = await supabase.from("posts").update({ published: newStatus }).eq("id", id);
      if (error) throw error;
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, published: newStatus } : p)));
      toast({
        title: newStatus
          ? (lang === "en" ? "Post published live!" : "পোস্টটি সফলভাবে প্রকাশ করা হয়েছে!")
          : (lang === "en" ? "Post unpublished (saved as draft)" : "পোস্টটি অপ্রকাশিত (ড্রাফট) করা হয়েছে"),
      });
    } catch (err: any) {
      toast({
        title: lang === "en" ? "Error updating post status" : "পোস্টের অবস্থা পরিবর্তনে ত্রুটি",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this post?" : "আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: lang === "en" ? "Post deleted" : "পোস্ট মুছে ফেলা হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error deleting post" : "পোস্ট মুছতে ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  // Handle Event Submit (Create or Inline Edit)
  const handleSaveEvent = async (e: FormEvent, targetId?: string | null) => {
    e.preventDefault();
    setSavingEvent(true);
    const eventToEditId = targetId || editingEventId;

    try {
      if (eventToEditId) {
        const { error } = await supabase.from("events").update(eventForm).eq("id", eventToEditId);
        if (error) throw error;
        toast({ title: lang === "en" ? "Event updated" : "ইভেন্ট আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("events").insert([eventForm]);
        if (error) throw error;
        toast({ title: lang === "en" ? "Event created" : "নতুন ইভেন্ট তৈরি হয়েছে" });
      }
      setIsCreatingEvent(false);
      setEditingEventId(null);
      setEventForm(emptyEventForm);
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error saving event" : "ইভেন্ট সংরক্ষণে ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSavingEvent(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this event?" : "আপনি কি নিশ্চিতভাবে এই ইভেন্টটি মুছে ফেলতে চান?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: lang === "en" ? "Event deleted" : "ইভেন্ট মুছে ফেলা হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error deleting event" : "ইভেন্ট মুছতে ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  // Handle Course Submit
  const handleSaveCourse = async (e: FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      if (editingCourseId) {
        const { error } = await supabase.from("courses").update(courseForm).eq("id", editingCourseId);
        if (error) throw error;
        toast({ title: lang === "en" ? "Course updated" : "কোর্স আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("courses").insert([courseForm]);
        if (error) throw error;
        toast({ title: lang === "en" ? "Course added" : "নতুন কোর্স যুক্ত হয়েছে" });
      }
      setIsCreatingCourse(false);
      setEditingCourseId(null);
      setCourseForm(emptyCourseForm);
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error saving course" : "কোর্স সংরক্ষণে ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSavingCourse(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this course?" : "আপনি কি নিশ্চিতভাবে এই কোর্সটি মুছে ফেলতে চান?")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: lang === "en" ? "Course deleted" : "কোর্স মুছে ফেলা হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error deleting course" : "কোর্স মুছতে ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  // Handle Member Submit
  const handleSaveMember = async (e: FormEvent) => {
    e.preventDefault();
    setSavingMember(true);
    try {
      if (editingMemberId) {
        const { error } = await supabase.from("members").update(memberForm).eq("id", editingMemberId);
        if (error) throw error;
        toast({ title: lang === "en" ? "Member updated" : "সদস্য তথ্য আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("members").insert([memberForm]);
        if (error) throw error;
        toast({ title: lang === "en" ? "Member added" : "নতুন সদস্য যুক্ত হয়েছে" });
      }
      setIsCreatingMember(false);
      setEditingMemberId(null);
      setMemberForm({ name: "", name_en: "", role: "member", bio: "", avatar_url: "" });
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error saving member" : "সদস্য তথ্য সংরক্ষণে ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSavingMember(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: string) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this member?" : "আপনি কি নিশ্চিতভাবে এই সদস্যকে মুছে ফেলতে চান?")) return;
    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      toast({ title: lang === "en" ? "Member removed" : "সদস্য তালিকা থেকে বাদ দেওয়া হয়েছে" });
      fetchData();
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error removing member" : "সদস্য অপসারণে ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  // Logo Upload Handler for Branding & Favicon
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadImage({
        file,
        folder: "logo",
        userId: user?.id,
      });
      if (res.success && res.url) {
        setGeneralForm((prev) => ({ ...prev, logo_url: res.url }));
        await updateSettings("general", { ...generalForm, logo_url: res.url });
        applyBrowserFavicon(res.url, generalForm.favicon_bg || "white_circle");
        toast({
          title: lang === "en" ? "Logo & Favicon updated!" : "লোগো এবং ফ্যাভিকন আপডেট হয়েছে!",
        });
      } else {
        throw new Error(res.error || "Failed to upload logo");
      }
    } catch (err: any) {
      toast({
        title: lang === "en" ? "Upload failed" : "আপলোড ব্যর্থ হয়েছে",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Settings Section
  const handleSaveSettings = async (section: "general" | "branding" | "palettes" | "features") => {
    setSavingSettings(true);
    try {
      let key: "general" | "appearance" | "features" = "general";
      let payload: any = generalForm;

      if (section === "general") {
        key = "general";
        payload = generalForm;
      } else if (section === "branding") {
        key = "general";
        payload = generalForm;
        // Also update appearance logo settings
        await updateSettings("appearance", {
          ...settings.appearance,
          logo_glow: appearanceForm.logo_glow,
          logo_dilate: appearanceForm.logo_dilate,
          theme_adaptive_logo: appearanceForm.theme_adaptive_logo,
        });
        applyBrowserFavicon(
          generalForm.logo_url || "/site-logo.png",
          generalForm.favicon_bg || "white_circle",
          appearanceForm.palette || "royal",
          appearanceForm.theme_adaptive_logo !== false
        );
      } else if (section === "palettes") {
        key = "appearance";
        payload = {
          ...settings.appearance,
          palette: appearanceForm.palette,
          show_particles: appearanceForm.show_particles,
          auto_festival_theme: appearanceForm.auto_festival_theme,
          active_festival_override: appearanceForm.active_festival_override,
          theme_adaptive_logo: appearanceForm.theme_adaptive_logo,
        };
      } else if (section === "features") {
        key = "features";
        payload = featuresForm;
      }

      const success = await updateSettings(key, payload);
      if (success) {
        toast({ title: lang === "en" ? "Settings saved successfully!" : "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!" });
      } else {
        throw new Error("Update returned false");
      }
    } catch (err: any) {
      toast({ title: lang === "en" ? "Error saving settings" : "সেটিংস সংরক্ষণে ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  // Menu Categories
  const menuCategories = [
    {
      categoryBn: "ওভারভিউ",
      categoryEn: "OVERVIEW",
      items: [
        { key: "dashboard", labelBn: "ড্যাশবোর্ড ওভারভিউ", labelEn: "Dashboard Overview", icon: LayoutDashboard },
        { key: "moderation", labelBn: "অ্যানালিটিক্স ও মডারেশন", labelEn: "Moderation & Logs", icon: Activity },
      ],
    },
    {
      categoryBn: "বিষয়বস্তু ব্যবস্থাপনা",
      categoryEn: "CONTENT MANAGEMENT",
      items: [
        { key: "posts", labelBn: "পোস্টসমূহ", labelEn: "Posts & Articles", icon: FileText, badge: posts.length },
        { key: "events", labelBn: "অনুষ্ঠান ও ইভেন্ট", labelEn: "Events & Festivals", icon: Calendar, badge: events.length },
        { key: "courses", labelBn: "কোর্স ও কর্মশালা", labelEn: "Courses & Workshops", icon: GraduationCap, badge: courses.length },
        { key: "gallery", labelBn: "গ্যালারি ম্যানেজার", labelEn: "Gallery Manager", icon: ImageLucide, badge: assets.length },
      ],
    },
    {
      categoryBn: "সাংগঠনিক ও সদস্য",
      categoryEn: "ORGANIZATION",
      items: [
        { key: "members", labelBn: "সদস্যবৃন্দ", labelEn: "Council Members", icon: Users, badge: members.length },
        { key: "users", labelBn: "ব্যবহারকারী ও রোল", labelEn: "Users & Roles", icon: ShieldCheck, badge: usersCount },
      ],
    },
    {
      categoryBn: "সিস্টেম ও সেটিংস",
      categoryEn: "SYSTEM & CONFIG",
      items: [
        { key: "settings", labelBn: "সাইট সেটিংস", labelEn: "Site Settings", icon: Settings },
      ],
    },
  ];

  const settingsSubItems = [
    { key: "general", labelBn: "মৌলিক তথ্য ও যোগাযোগ", labelEn: "Profile & Contacts", icon: Compass },
    { key: "branding", labelBn: "লোগো ও ফ্যাভিকন", labelEn: "Logo & Favicon Studio", icon: Aperture },
    { key: "palettes", labelBn: "কালার থিম ও প্যালেট", labelEn: "Theme & Palettes", icon: Paintbrush },
    { key: "features", labelBn: "মডিউল ও রক্ষণাবেক্ষণ", labelEn: "Modules & Maintenance", icon: Sliders },
    { key: "history", labelBn: "হিস্ট্রি ও অডিট লগ", labelEn: "History & Logs", icon: RotateCcw },
  ];

  // Active section metadata for top nav
  const getActiveTabMeta = () => {
    for (const cat of menuCategories) {
      const found = cat.items.find((i) => i.key === activeTab);
      if (found) {
        return {
          title: lang === "en" ? found.labelEn : found.labelBn,
          icon: found.icon,
          category: lang === "en" ? cat.categoryEn : cat.categoryBn,
        };
      }
    }
    return {
      title: lang === "en" ? "Admin Central" : "অ্যাডমিন সেন্ট্রাল",
      icon: LayoutDashboard,
      category: "OVERVIEW",
    };
  };

  const currentTabMeta = getActiveTabMeta();
  const CurrentTabIcon = currentTabMeta.icon;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden flex-col md:flex-row">
      {/* ══════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (COLLAPSIBLE)
      ══════════════════════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 255 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="hidden md:flex flex-col bg-card border-r border-border h-screen shrink-0 z-40 select-none"
      >
        {/* Header Branding */}
        <div className={`p-3 border-b border-border flex items-center ${sidebarCollapsed ? "flex-col gap-2 justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <LogoTile size="sm" />
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="truncate"
              >
                <h2 className="font-bengali font-bold text-xs text-foreground truncate">
                  {lang === "en" ? "Faridpur Shahitto Parishad" : "ফরিদপুর সাহিত্য পরিষদ"}
                </h2>
                <span className="text-[10px] text-muted-foreground font-bengali block">
                  {lang === "en" ? "Admin Central" : "অ্যাডমিন সেন্ট্রাল"}
                </span>
              </motion.div>
            )}
          </div>

          {/* 1-Button Collapse Toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-7 h-7 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-xs"
            title={sidebarCollapsed ? (lang === "en" ? "Expand Sidebar" : "মেনু বড় করুন") : (lang === "en" ? "Collapse Sidebar" : "মেনু ছোট করুন")}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Categorized Nav Items */}
        <div className="flex-1 py-2.5 px-2 space-y-2.5 overflow-y-auto custom-scrollbar">
          {menuCategories.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {!sidebarCollapsed && (
                <span className="px-2 text-[9px] font-bold tracking-wider text-muted-foreground/60 uppercase block mb-0.5 font-sans">
                  {lang === "en" ? group.categoryEn : group.categoryBn}
                </span>
              )}
              {sidebarCollapsed && gIdx > 0 && <div className="my-1 border-t border-border/40 mx-1" />}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                const label = lang === "en" ? item.labelEn : item.labelBn;

                return (
                  <div key={item.key} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(item.key as AdminTab);
                        setIsCreatingPost(false);
                        setEditingPostId(null);
                        setEditingEventId(null);
                      }}
                      className={`w-full flex items-center ${
                        sidebarCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5"
                      } rounded-xl font-bengali text-xs font-semibold transition-all relative ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                      title={sidebarCollapsed ? label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-sans ${
                                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.key === "settings" && (
                            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isActive ? "rotate-180" : ""}`} />
                          )}
                        </>
                      )}
                    </button>

                    {/* Small Sub-Menu under Site Settings in Left Panel */}
                    {item.key === "settings" && isActive && !sidebarCollapsed && (
                      <div className="ml-3 pl-2 my-0.5 border-l-2 border-primary/40 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {settingsSubItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = settingsSubTab === sub.key;
                          return (
                            <button
                              key={sub.key}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab("settings");
                                setSettingsSubTab(sub.key as any);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] font-bengali transition-all ${
                                isSubActive
                                  ? "bg-primary/20 text-primary font-bold shadow-2xs"
                                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground font-medium"
                              }`}
                            >
                              <SubIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate text-left">{lang === "en" ? sub.labelEn : sub.labelBn}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Desktop Footer Actions */}
        <div className="p-2.5 border-t border-border space-y-1">
          <Link
            to="/"
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
            } rounded-2xl text-xs font-bengali text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors`}
            title={lang === "en" ? "View Website (Live)" : "ওয়েবসাইট দেখুন"}
          >
            <Globe className="w-4 h-4 shrink-0 text-primary" />
            {!sidebarCollapsed && <span>{lang === "en" ? "View Website (Live)" : "ওয়েবসাইট দেখুন (Live)"}</span>}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
            } rounded-2xl text-xs font-bengali text-destructive hover:bg-destructive/10 transition-colors`}
            title={lang === "en" ? "Sign Out" : "লগআউট"}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>{lang === "en" ? "Sign Out" : "লগআউট (Sign Out)"}</span>}
          </button>
        </div>
      </motion.aside>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE OFF-CANVAS DRAWER WITH BACKDROP
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="md:hidden fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-card border-r border-border z-50 flex flex-col justify-between shadow-2xl overflow-hidden"
            >
              {/* Drawer Header with Brand & Close Button */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <LogoTile size="sm" />
                  <div>
                    <h3 className="font-bengali font-bold text-xs text-foreground truncate">
                      {lang === "en" ? "Faridpur Shahitto Parishad" : "ফরিদপুর সাহিত্য পরিষদ"}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-bengali block">
                      {lang === "en" ? "Admin Central" : "অ্যাডমিন সেন্ট্রাল"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer User Card */}
              <div className="p-3 bg-secondary/30 border-b border-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-crimson-dark flex items-center justify-center text-primary-foreground font-bengali font-bold text-sm shadow-xs shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || "A"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-bengali text-foreground block truncate">
                      {user?.email?.split("@")[0] || "Admin"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                      {role || "admin"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block font-mono truncate">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Categorized Nav List */}
              <div className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto">
                {menuCategories.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <span className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase block mb-1 font-sans">
                      {lang === "en" ? group.categoryEn : group.categoryBn}
                    </span>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.key;
                      const label = lang === "en" ? item.labelEn : item.labelBn;

                      return (
                        <div key={item.key} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab(item.key as AdminTab);
                              if (item.key !== "settings") {
                                setMobileMenuOpen(false);
                              }
                              setIsCreatingPost(false);
                              setEditingPostId(null);
                              setEditingEventId(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl font-bengali text-xs font-semibold transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              {label}
                            </span>
                            {item.badge !== undefined && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.key === "settings" && (
                              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isActive ? "rotate-180" : ""}`} />
                            )}
                          </button>

                          {/* Mobile Drawer Sub-Menu under Site Settings */}
                          {item.key === "settings" && isActive && (
                            <div className="ml-4 pl-2.5 my-1 border-l-2 border-primary/30 space-y-0.5 animate-in fade-in">
                              {settingsSubItems.map((sub) => {
                                const SubIcon = sub.icon;
                                const isSubActive = settingsSubTab === sub.key;
                                return (
                                  <button
                                    key={sub.key}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab("settings");
                                      setSettingsSubTab(sub.key as any);
                                      setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bengali font-semibold transition-all ${
                                      isSubActive
                                        ? "bg-primary/15 text-primary font-bold"
                                        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                                    }`}
                                  >
                                    <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate text-left">{lang === "en" ? sub.labelEn : sub.labelBn}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Drawer Bottom Actions: Language, Theme & Sign Out */}
              <div className="p-3 border-t border-border space-y-2 bg-card/60">
                {/* Language and Theme Switcher Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center p-0.5 rounded-full bg-secondary border border-border">
                    <button
                      type="button"
                      onClick={() => setLang("bn")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        lang === "bn" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-sans transition-all ${
                        lang === "en" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      English
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold"
                  >
                    {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
                    <span className="text-[11px]">{theme === "dark" ? "Light" : "Dark"}</span>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-bengali">
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground py-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>{lang === "en" ? "Live Site" : "ওয়েবসাইট"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex items-center gap-1.5 text-destructive hover:underline py-1 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Sign Out" : "লগআউট"}</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA (NATURAL SCROLL)
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 bg-background relative">
        {/* ── UNIFIED STICKY TOP NAV BAR (MOBILE & DESKTOP) ── */}
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Mobile Hamburger OR Desktop Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground shrink-0 active:scale-95 transition-all"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Icon (No circle background) */}
            <CurrentTabIcon className="w-5 h-5 text-primary shrink-0" />

            <div className="truncate">
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider font-sans">
                <span>{currentTabMeta.category}</span>
                <span>›</span>
              </div>
              <h1 className="font-bengali font-bold text-xs sm:text-base text-foreground truncate">
                {currentTabMeta.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions & Profile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Bangla Date Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-[11px] font-bengali text-foreground select-none">
              <span className="text-sm">🇧🇩</span>
              <span className="font-bold text-primary">{todayBangla.formattedBn}</span>
            </div>

            {/* Quick View Website Link */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bengali transition-colors"
              title="Live Website Preview"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline text-[11px]">{lang === "en" ? "Live Site" : "ওয়েবসাইট"}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>

            {/* Admin Profile Dropdown Menu */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-card hover:bg-secondary border border-border transition-all active:scale-95 shadow-xs"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary to-crimson-dark flex items-center justify-center text-primary-foreground font-bengali font-bold text-xs shadow-xs shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || "A"
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <span className="font-bengali font-bold text-xs text-foreground block truncate max-w-[120px]">
                    {user?.email?.split("@")[0] || (lang === "en" ? "Admin" : "অ্যাডমিন")}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase block tracking-wider">
                    {role || "SUPER ADMIN"}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown Popup (Mobile Safe Alignment) */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] rounded-3xl bg-card border border-border shadow-2xl p-2 z-50 depth-card"
                  >
                    {/* User Information Header */}
                    <div className="p-3 border-b border-border flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-crimson-dark flex items-center justify-center text-primary-foreground font-bengali font-bold text-sm shadow-xs shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user?.email?.charAt(0).toUpperCase() || "A"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-bengali text-foreground block truncate">
                            {user?.email?.split("@")[0] || "Administrator"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                            {role || "admin"}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-mono truncate">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Navigation Options */}
                    <div className="py-1 space-y-0.5 font-bengali text-xs">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-secondary text-foreground text-left transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{lang === "en" ? "My Public Profile" : "আমার প্রোফাইল"}</span>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-destructive hover:bg-destructive/10 text-left text-xs font-bengali font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{lang === "en" ? "Sign Out" : "লগআউট করুন"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── TAB CONTENT BODY (TOUCH PADDING PB-28 ON MOBILE, PB-16 ON DESKTOP) ── */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 min-w-0 pb-28 md:pb-16">
          {/* ── TAB: DASHBOARD OVERVIEW ── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
                {[
                  { titleBn: "মোট পোস্ট", titleEn: "Total Posts", count: posts.length, icon: FileText, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { titleBn: "অনুষ্ঠান ও ইভেন্ট", titleEn: "Events & Festivals", count: events.length, icon: Calendar, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { titleBn: "সক্রিয় কোর্স", titleEn: "Active Courses", count: courses.length, icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { titleBn: "পরিষদ সদস্য", titleEn: "Council Members", count: members.length, icon: Users, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                  { titleBn: "মিডিয়া ফাইল", titleEn: "Media Files", count: assets.length, icon: ImageLucide, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                  { titleBn: "নিবন্ধিত ইউজার", titleEn: "Registered Users", count: usersCount, icon: ShieldCheck, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 sm:p-4 rounded-3xl bg-card border border-border depth-card flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl ${kpi.color} border flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg sm:text-xl font-extrabold font-sans text-foreground">{kpi.count}</span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bengali text-muted-foreground font-semibold leading-tight">
                        {lang === "en" ? kpi.titleEn : kpi.titleBn}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Action Shortcuts */}
              <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border depth-card space-y-3 sm:space-y-4">
                <h3 className="font-bengali font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  {lang === "en" ? "Quick Management Actions" : "দ্রুত কার্যসম্পাদন (Quick Management Actions)"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("posts");
                      setIsCreatingPost(true);
                      setEditingPostId(null);
                    }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left space-y-1 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-primary font-bengali font-bold text-xs">
                      <FileText className="w-4 h-4" />
                      <span>{lang === "en" ? "Publish New Post" : "নতুন পোস্ট প্রকাশ"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bengali">
                      {lang === "en" ? "Compose rich articles & updates" : "আকর্ষণীয় পোস্ট ও প্রবন্ধ লিখুন"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("events");
                      setIsCreatingEvent(true);
                      setEditingEventId(null);
                      setEventForm(emptyEventForm);
                    }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left space-y-1 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-amber-400 font-bengali font-bold text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{lang === "en" ? "Create Event" : "ইভেন্ট তৈরি করুন"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bengali">
                      {lang === "en" ? "Announce new literary assembly" : "নতুন সাহিত্য সভার ঘোষণা"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("gallery")}
                    className="p-3.5 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left space-y-1 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 font-bengali font-bold text-xs">
                      <UploadCloud className="w-4 h-4" />
                      <span>{lang === "en" ? "Upload Gallery Media" : "গ্যালারি মিডিয়া আপলোড"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bengali">
                      {lang === "en" ? "Add photos & videos" : "ছবি ও ভিডিও সংযোগ করুন"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("members")}
                    className="p-3.5 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left space-y-1 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-purple-400 font-bengali font-bold text-xs">
                      <Users className="w-4 h-4" />
                      <span>{lang === "en" ? "Update Member Info" : "সদস্য তথ্য হালনাগাদ"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bengali">
                      {lang === "en" ? "Advisory & executive council" : "উপদেষ্টা ও কার্যকরী পরিষদ"}
                    </p>
                  </button>
                </div>
              </div>

              {/* Live Activity Feeds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Posts Stream */}
                <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border depth-card space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bengali font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>
                        {lang === "en" ? `Recent Posts (${posts.slice(0, 5).length})` : `সাম্প্রতিক পোস্টসমূহ (${posts.slice(0, 5).length})`}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("posts")}
                      className="text-xs text-primary hover:underline font-bengali"
                    >
                      {lang === "en" ? "View All ›" : "সব দেখুন ›"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {posts.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-between gap-3 hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bengali text-xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <h4 className="font-bengali font-bold text-xs text-foreground truncate">
                              {lang === "en" && p.title_en ? p.title_en : p.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-bengali block truncate">
                              {lang === "en" ? (CATEGORY_TRANSLATIONS[p.category]?.en || p.category) : p.category} • {p.published ? (lang === "en" ? "Published" : "প্রকাশিত") : (lang === "en" ? "Draft" : "ড্রাফট")}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPostId(p.id);
                            setIsCreatingPost(false);
                            setActiveTab("posts");
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Events Stream */}
                <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border depth-card space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bengali font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>
                        {lang === "en" ? `Upcoming & Recent Events (${events.slice(0, 5).length})` : `আসন্ন ও সাম্প্রতিক অনুষ্ঠান (${events.slice(0, 5).length})`}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("events")}
                      className="text-xs text-primary hover:underline font-bengali"
                    >
                      {lang === "en" ? "View All ›" : "সব দেখুন ›"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {events.slice(0, 5).map((e) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-between gap-3 hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bengali text-xs">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <h4 className="font-bengali font-bold text-xs text-foreground truncate">
                              {lang === "en" && e.title_en ? e.title_en : e.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-bengali block truncate">
                              {lang === "en" && e.date_en ? e.date_en : e.date} • {lang === "en" && e.location_en ? e.location_en : e.location}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEventId(e.id);
                            setEventForm({
                              title: e.title,
                              title_en: e.title_en || "",
                              date: e.date,
                              date_en: e.date_en || "",
                              time: e.time,
                              time_en: e.time_en || "",
                              location: e.location,
                              location_en: e.location_en || "",
                              description: e.description,
                              description_en: e.description_en || "",
                              tag: e.tag || "সাহিত্য সভা",
                              tag_color: e.tag_color || "bg-primary/20 text-primary",
                              cover_image: e.cover_image || "",
                            });
                            setIsCreatingEvent(false);
                            setActiveTab("events");
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: MODERATION & ANALYTICS ── */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <ModerationPanel />
            </div>
          )}

          {/* ── TAB: POSTS & ARTICLES (RICH INLINE COMPOSER) ── */}
          {activeTab === "posts" && (() => {
            const postFilterOptions: FilterOption[] = [
              { key: "all", labelBn: "সকল পোস্ট", labelEn: "All Posts", count: posts.length },
              { key: "published", labelBn: "প্রকাশিত", labelEn: "Published", count: posts.filter((p) => p.published).length },
              { key: "draft", labelBn: "খসড়া / অপ্রকাশিত", labelEn: "Drafts", count: posts.filter((p) => !p.published).length },
              { key: "featured", labelBn: "বিশেষ নির্বাচিত", labelEn: "Featured", count: posts.filter((p) => p.featured).length },
              { key: "event_linked", labelBn: "ইভেন্ট সংযুক্ত", labelEn: "Event Linked", count: posts.filter((p) => (p.tags || []).some((t) => t.startsWith("event:"))).length },
              { key: "course_linked", labelBn: "কোর্স সংযুক্ত", labelEn: "Course Linked", count: posts.filter((p) => (p.tags || []).some((t) => t.startsWith("course:"))).length },
            ];

            const filteredPosts = posts.filter((p) => {
              if (postFilter === "published" && !p.published) return false;
              if (postFilter === "draft" && p.published) return false;
              if (postFilter === "featured" && !p.featured) return false;
              if (postFilter === "event_linked" && !(p.tags || []).some((t) => t.startsWith("event:"))) return false;
              if (postFilter === "course_linked" && !(p.tags || []).some((t) => t.startsWith("course:"))) return false;

              if (postSearchQuery.trim()) {
                const q = postSearchQuery.toLowerCase();
                const titleMatch = p.title?.toLowerCase().includes(q) || p.title_en?.toLowerCase().includes(q);
                const contentMatch = p.content?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q);
                const catMatch = p.category?.toLowerCase().includes(q);
                if (!titleMatch && !contentMatch && !catMatch) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground font-bengali">
                    {lang === "en"
                      ? "Write and publish rich articles, customize media placement, and link YouTube videos."
                      : "পোস্ট ও প্রবন্ধ লিখুন, ছবি/ভিডিওর অবস্থান নির্ধারণ করুন এবং ইউটিউব ভিডিও যুক্ত করুন।"}
                  </p>
                </div>

                {/* Mini Search & Single Button Filter Bar */}
                <AdminSearchFilterBar
                  searchQuery={postSearchQuery}
                  onSearchChange={setPostSearchQuery}
                  searchPlaceholderBn="পোস্টের শিরোনাম বা বিষয়বস্তু খুঁজুন..."
                  searchPlaceholderEn="Search posts by title or content..."
                  activeFilter={postFilter}
                  onFilterChange={setPostFilter}
                  filterOptions={postFilterOptions}
                  actionsRight={
                    !isCreatingPost && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingPost(true);
                          setEditingPostId(null);
                        }}
                        className="w-full sm:w-auto px-5 py-2 rounded-full bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === "en" ? "Create New Post" : "নতুন পোস্ট তৈরি করুন"}</span>
                      </button>
                    )
                  }
                />

                {/* New Post Composer at Top */}
                {isCreatingPost && (
                  <div className="animate-in fade-in slide-in-from-top-3">
                    <PostComposer
                      events={events}
                      courses={courses}
                      onSave={(data) => handleSavePost(data, null)}
                      onCancel={() => setIsCreatingPost(false)}
                      isSaving={savingPost}
                    />
                  </div>
                )}

                {/* Posts Feed with INLINE Editing directly on the specific post card */}
                {filteredPosts.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border text-center space-y-2">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm font-bengali font-bold text-foreground">
                      {lang === "en" ? "No posts match your filter or search" : "কোনো পোস্ট খুঁজে পাওয়া যায়নি"}
                    </p>
                    <p className="text-xs text-muted-foreground font-bengali">
                      {lang === "en" ? "Try clearing search or changing the filter." : "সার্চ মুছুন অথবা ফিল্টার পরিবর্তন করুন।"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredPosts.map((post) => {
                  const isEditingThisPost = editingPostId === post.id;

                  if (isEditingThisPost) {
                    return (
                      <div key={post.id} className="animate-in fade-in zoom-in-95">
                        <PostComposer
                          initialData={{
                            title: post.title,
                            title_en: post.title_en || "",
                            content: post.content || "",
                            content_en: post.content_en || post.excerpt_en || "",
                            excerpt: post.excerpt || "",
                            excerpt_en: post.excerpt_en || "",
                            category: post.category || "সাহিত্য",
                            tags: post.tags || [],
                            images: post.images || [],
                            media_attachments: (post.images || []).map((url: string, i: number) => {
                              const metaTag = (post.tags || []).find((t: string) => t.startsWith(`media:${i}:`));
                              if (metaTag) {
                                const parts = metaTag.split(":");
                                return {
                                  url,
                                  position: parts[2] || (i === 0 ? "top" : "bottom"),
                                  type: (parts[3] as "image" | "video") || (url.match(/\.(mp4|webm|mov|mkv|ogg)$/i) ? "video" : "image"),
                                };
                              }
                              return {
                                url,
                                position: i === 0 ? "top" : "bottom",
                                type: url.match(/\.(mp4|webm|mov|mkv|ogg)$/i) ? "video" : "image",
                              };
                            }),
                            youtube_url: post.youtube_url || "",
                            published: post.published ?? true,
                            featured: post.featured ?? false,
                            connected_event_id: (post.tags || []).find((t: string) => t.startsWith("event:"))?.replace("event:", "") || "",
                            connected_course_id: (post.tags || []).find((t: string) => t.startsWith("course:"))?.replace("course:", "") || "",
                          }}
                          events={events}
                          courses={courses}
                          onSave={(data) => handleSavePost(data, post.id)}
                          onCancel={() => setEditingPostId(null)}
                          isSaving={savingPost}
                        />
                      </div>
                    );
                  }

                  const displayTitle = lang === "en" && post.title_en ? post.title_en : post.title;
                  const displayExcerpt = lang === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt;
                  const displayCat = lang === "en" ? (CATEGORY_TRANSLATIONS[post.category]?.en || post.category) : post.category;
                  const displayDate = new Date(post.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US");

                  return (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 rounded-3xl bg-card border border-border depth-card space-y-3 transition-all"
                    >
                      {/* Mobile-Friendly Post Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-primary font-bold text-[11px] font-bengali">
                            {displayCat}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bengali">
                            {displayDate}
                          </span>
                          {post.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bengali font-bold flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>{lang === "en" ? "Featured" : "ফিচার্ড"}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-bengali ${
                              post.published
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {post.published ? (lang === "en" ? "Live" : "প্রকাশিত") : (lang === "en" ? "Draft" : "ড্রাফট")}
                          </span>

                          {/* Quick Publish / Unpublish Toggle Action */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(post.id, post.published)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bengali font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs border ${
                              post.published
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                            }`}
                            title={
                              post.published
                                ? (lang === "en" ? "Unpublish this post" : "পোস্টটি অপ্রকাশিত করুন")
                                : (lang === "en" ? "Publish this post live" : "পোস্টটি প্রকাশ করুন")
                            }
                          >
                            {post.published ? (
                              <>
                                <EyeOff className="w-3 h-3 text-amber-400" />
                                <span>{lang === "en" ? "Unpublish" : "অপ্রকাশিত করুন"}</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3 text-emerald-400" />
                                <span>{lang === "en" ? "Publish Live" : "প্রকাশ করুন"}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingPost(false);
                              setEditingPostId(post.id);
                            }}
                            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                            title={lang === "en" ? "Edit Inline" : "এখানেই সম্পাদনা করুন"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                            title={lang === "en" ? "Delete" : "মুছুন"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bengali font-bold text-sm sm:text-base text-foreground leading-snug">
                        {displayTitle}
                      </h3>

                      {displayExcerpt && (
                        <p className="text-xs text-muted-foreground font-bengali line-clamp-3 leading-relaxed">
                          {displayExcerpt}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── TAB: EVENTS & FESTIVALS (INLINE EDITING) ── */}
      {activeTab === "events" && (() => {
        const eventFilterOptions: FilterOption[] = [
          { key: "all", labelBn: "সকল অনুষ্ঠান", labelEn: "All Events", count: events.length },
          { key: "featured", labelBn: "বিশেষ আয়োজন", labelEn: "Featured", count: events.filter((e) => e.featured).length },
          { key: "with_gallery", labelBn: "ছবি/ভিডিও সংযুক্ত", labelEn: "With Media", count: events.filter((e) => assets.some((a) => a.slot === `event:${e.id}`)).length },
        ];

        const filteredEvents = events.filter((e) => {
          if (eventFilter === "featured" && !e.featured) return false;
          if (eventFilter === "with_gallery" && !assets.some((a) => a.slot === `event:${e.id}`)) return false;

          if (eventSearchQuery.trim()) {
            const q = eventSearchQuery.toLowerCase();
            const titleMatch = e.title?.toLowerCase().includes(q) || e.title_en?.toLowerCase().includes(q);
            const locMatch = e.location?.toLowerCase().includes(q) || e.location_en?.toLowerCase().includes(q);
            const descMatch = e.description?.toLowerCase().includes(q) || e.tag?.toLowerCase().includes(q);
            if (!titleMatch && !locMatch && !descMatch) return false;
          }
          return true;
        });

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground font-bengali">
                {lang === "en"
                  ? "Publish and organize council events, fairs, and memorial assemblies."
                  : "পরিষদের সাহিত্য সভা, মেলা ও স্মরণানুষ্ঠানের বিবরণ প্রস্তুত ও প্রকাশ করুন।"}
              </p>
            </div>

            {/* Mini Search & Single Button Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={eventSearchQuery}
              onSearchChange={setEventSearchQuery}
              searchPlaceholderBn="অনুষ্ঠানের নাম, স্থান বা বিবরণ খুঁজুন..."
              searchPlaceholderEn="Search events by title or venue..."
              activeFilter={eventFilter}
              onFilterChange={setEventFilter}
              filterOptions={eventFilterOptions}
              actionsRight={
                !isCreatingEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm(emptyEventForm);
                      setIsCreatingEvent(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2 rounded-full bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "en" ? "Create New Event" : "নতুন ইভেন্ট তৈরি করুন"}</span>
                  </button>
                )
              }
            />

              {/* Create Event Form at Top */}
              {isCreatingEvent && (
                <form
                  onSubmit={(e) => handleSaveEvent(e, null)}
                  className="p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-bengali font-bold text-sm text-foreground">
                      {lang === "en" ? "Create New Event" : "নতুন সাহিত্য সভার ঘোষণা তৈরি"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCreatingEvent(false)}
                      className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Event Title (Bengali)" : "অনুষ্ঠানের নাম (বাংলা)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                        placeholder="যেমন: বার্ষিক সাহিত্য সম্মেলন"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Event Title (English)" : "অনুষ্ঠানের নাম (ইংরেজি)"}
                      </label>
                      <input
                        type="text"
                        value={eventForm.title_en}
                        onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-sans"
                        placeholder="e.g. Annual Literary Conference"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Date" : "তারিখ"}
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                        placeholder="যেমন: ১৫ মে ২০২৬"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Time" : "সময়"}
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                        placeholder="যেমন: বিকাল ৫:০০"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Location / Venue" : "স্থান"}
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                        placeholder="যেমন: ফরিদপুর টাউন হল"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                        {lang === "en" ? "Tag / Category" : "ট্যাগ বা ধরণ"}
                      </label>
                      <select
                        value={eventForm.tag}
                        onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                      >
                        <option value="সাহিত্য">{lang === "en" ? "Literature" : "সাহিত্য"}</option>
                        <option value="কবিতা">{lang === "en" ? "Poetry" : "কবিতা"}</option>
                        <option value="বইমেলা">{lang === "en" ? "Book Fair" : "বইমেলা"}</option>
                        <option value="জাতীয় দিবস">{lang === "en" ? "National Day" : "জাতীয় দিবস"}</option>
                        <option value="সাংস্কৃতিক">{lang === "en" ? "Cultural" : "সাংস্কৃতিক"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                      {lang === "en" ? "Description" : "অনুষ্ঠানের বিবরণ"}
                    </label>
                    <textarea
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                      placeholder="অনুষ্ঠানের বিস্তারিত বিবরণ..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingEvent(false)}
                      className="px-5 py-2 rounded-full border border-border text-xs font-bengali"
                    >
                      {lang === "en" ? "Cancel" : "বাতিল"}
                    </button>
                    <button
                      type="submit"
                      disabled={savingEvent}
                      className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md"
                    >
                      {savingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === "en" ? "Create Event" : "ইভেন্ট সংরক্ষণ")}
                    </button>
                  </div>
                </form>
              )}

              {/* Events List Grid with INLINE Editing where the event is */}
              {filteredEvents.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border text-center space-y-2">
                  <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm font-bengali font-bold text-foreground">
                    {lang === "en" ? "No events match your filter or search" : "কোনো অনুষ্ঠান খুঁজে পাওয়া যায়নি"}
                  </p>
                  <p className="text-xs text-muted-foreground font-bengali">
                    {lang === "en" ? "Try clearing search or changing the filter." : "সার্চ মুছুন অথবা ফিল্টার পরিবর্তন করুন।"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {filteredEvents.map((e) => {
                  const isEditingThisEvent = editingEventId === e.id;

                  if (isEditingThisEvent) {
                    return (
                      <form
                        key={e.id}
                        onSubmit={(evt) => handleSaveEvent(evt, e.id)}
                        className="md:col-span-2 p-4 sm:p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-md space-y-4 animate-in fade-in"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <h3 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-primary" />
                            <span>{lang === "en" ? "Editing Event Inline" : "ইভেন্ট এখানেই সম্পাদনা করুন"}</span>
                          </h3>
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Title (Bengali)" : "অনুষ্ঠানের নাম (বাংলা)"}
                            </label>
                            <input
                              type="text"
                              required
                              value={eventForm.title}
                              onChange={(evt) => setEventForm({ ...eventForm, title: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Title (English)" : "অনুষ্ঠানের নাম (ইংরেজি)"}
                            </label>
                            <input
                              type="text"
                              value={eventForm.title_en}
                              onChange={(evt) => setEventForm({ ...eventForm, title_en: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-sans"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Date" : "তারিখ"}
                            </label>
                            <input
                              type="text"
                              required
                              value={eventForm.date}
                              onChange={(evt) => setEventForm({ ...eventForm, date: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Time" : "সময়"}
                            </label>
                            <input
                              type="text"
                              required
                              value={eventForm.time}
                              onChange={(evt) => setEventForm({ ...eventForm, time: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Location / Venue" : "স্থান"}
                            </label>
                            <input
                              type="text"
                              required
                              value={eventForm.location}
                              onChange={(evt) => setEventForm({ ...eventForm, location: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                              {lang === "en" ? "Tag / Category" : "ট্যাগ বা ধরণ"}
                            </label>
                            <select
                              value={eventForm.tag}
                              onChange={(evt) => setEventForm({ ...eventForm, tag: evt.target.value })}
                              className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                            >
                              <option value="সাহিত্য">{lang === "en" ? "Literature" : "সাহিত্য"}</option>
                              <option value="কবিতা">{lang === "en" ? "Poetry" : "কবিতা"}</option>
                              <option value="বইমেলা">{lang === "en" ? "Book Fair" : "বইমেলা"}</option>
                              <option value="জাতীয় দিবস">{lang === "en" ? "National Day" : "জাতীয় দিবস"}</option>
                              <option value="সাংস্কৃতিক">{lang === "en" ? "Cultural" : "সাংস্কৃতিক"}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bengali text-muted-foreground mb-1 block">
                            {lang === "en" ? "Description" : "অনুষ্ঠানের বিবরণ"}
                          </label>
                          <textarea
                            rows={3}
                            value={eventForm.description}
                            onChange={(evt) => setEventForm({ ...eventForm, description: evt.target.value })}
                            className="w-full px-3.5 py-2 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="px-5 py-2 rounded-full border border-border text-xs font-bengali"
                          >
                            {lang === "en" ? "Cancel" : "বাতিল"}
                          </button>
                          <button
                            type="submit"
                            disabled={savingEvent}
                            className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md"
                          >
                            {savingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === "en" ? "Update Event" : "আপডেট সম্পন্ন করুন")}
                          </button>
                        </div>
                      </form>
                    );
                  }

                  const displayTitle = lang === "en" && e.title_en ? e.title_en : e.title;
                  const displayDate = lang === "en" && e.date_en ? e.date_en : e.date;
                  const displayTime = lang === "en" && e.time_en ? e.time_en : e.time;
                  const displayLoc = lang === "en" && e.location_en ? e.location_en : e.location;
                  const displayDesc = lang === "en" && e.description_en ? e.description_en : e.description;

                  return (
                    <div
                      key={e.id}
                      className="p-4 sm:p-5 rounded-3xl bg-card border border-border depth-card flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold font-bengali ${e.tag_color || "bg-primary/20 text-primary"}`}>
                            {e.tag}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingEvent(false);
                                setEditingEventId(e.id);
                                setEventForm({
                                  title: e.title,
                                  title_en: e.title_en || "",
                                  date: e.date,
                                  date_en: e.date_en || "",
                                  time: e.time,
                                  time_en: e.time_en || "",
                                  location: e.location,
                                  location_en: e.location_en || "",
                                  description: e.description,
                                  description_en: e.description_en || "",
                                  tag: e.tag || "সাহিত্য সভা",
                                  tag_color: e.tag_color || "bg-primary/20 text-primary",
                                  cover_image: e.cover_image || "",
                                });
                              }}
                              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                              title={lang === "en" ? "Edit Inline" : "এখানেই সম্পাদনা করুন"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(e.id)}
                              className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bengali font-bold text-sm sm:text-base text-foreground leading-snug">
                          {displayTitle}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground font-bengali pt-1">
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary">
                            <Calendar className="w-3 h-3" /> {displayDate}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary">
                            <Clock className="w-3 h-3" /> {displayTime}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary">
                            <MapPin className="w-3 h-3" /> {displayLoc}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground font-bengali line-clamp-2 pt-1">
                          {displayDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          );
        })()}

          {/* ── TAB: COURSES & WORKSHOPS ── */}
          {activeTab === "courses" && (() => {
            const courseFilterOptions: FilterOption[] = [
              { key: "all", labelBn: "সকল কোর্স", labelEn: "All Courses", count: courses.length },
              { key: "free", labelBn: "বিনামূল্যে (Free)", labelEn: "Free Courses", count: courses.filter((c) => c.is_free || !c.price).length },
              { key: "paid", labelBn: "পেইড (Paid)", labelEn: "Paid Courses", count: courses.filter((c) => !c.is_free && c.price && c.price > 0).length },
            ];

            const filteredCourses = courses.filter((c) => {
              if (courseFilter === "free" && !c.is_free && c.price && c.price > 0) return false;
              if (courseFilter === "paid" && (c.is_free || !c.price)) return false;

              if (courseSearchQuery.trim()) {
                const q = courseSearchQuery.toLowerCase();
                const titleMatch = c.title?.toLowerCase().includes(q) || c.title_en?.toLowerCase().includes(q);
                const instMatch = c.instructor?.toLowerCase().includes(q);
                const descMatch = c.description?.toLowerCase().includes(q);
                if (!titleMatch && !instMatch && !descMatch) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground font-bengali">
                    {lang === "en"
                      ? "Manage literature and creative writing workshops and courses."
                      : "সাহিত্য চর্চা ও সৃজনশীল রচনা প্রশিক্ষণ কর্মশালা পরিচালনা করুন।"}
                  </p>
                </div>

                {/* Mini Search & Single Button Filter Bar */}
                <AdminSearchFilterBar
                  searchQuery={courseSearchQuery}
                  onSearchChange={setCourseSearchQuery}
                  searchPlaceholderBn="কোর্সের নাম বা ইন্সট্রাক্টর খুঁজুন..."
                  searchPlaceholderEn="Search courses by title or instructor..."
                  activeFilter={courseFilter}
                  onFilterChange={setCourseFilter}
                  filterOptions={courseFilterOptions}
                  actionsRight={
                    !isCreatingCourse && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCourseId(null);
                          setCourseForm(emptyCourseForm);
                          setIsCreatingCourse(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2 rounded-full bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === "en" ? "Create New Course" : "নতুন কোর্স যুক্ত করুন"}</span>
                      </button>
                    )
                  }
                />

                {filteredCourses.length === 0 && (
                  <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border depth-card text-center space-y-3">
                    <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                    <h4 className="font-bengali font-bold text-base text-foreground">
                      {lang === "en" ? "No courses match your filter or search" : "কোনো কোর্স খুঁজে পাওয়া যায়নি"}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bengali">
                      {lang === "en"
                        ? "Click the button above to announce a new course or workshop."
                        : "নতুন কর্মশালা বা কোর্স ঘোষণা করতে উপরের বাটনে ক্লিক করুন।"}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TAB: GALLERY MANAGER ── */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <GalleryManager events={events} posts={posts} courses={courses} onDataChange={fetchData} />
            </div>
          )}

          {/* ── TAB: COUNCIL MEMBERS ── */}
          {activeTab === "members" && (() => {
            const memberFilterOptions: FilterOption[] = [
              { key: "all", labelBn: "সকল সদস্য", labelEn: "All Members", count: members.length },
              { key: "senior", labelBn: "উপদেষ্টা ও প্রতিষ্ঠাতা", labelEn: "Advisory & Founders", count: members.filter((m) => m.is_senior).length },
              { key: "executive", labelBn: "কার্যনির্বাহী পরিষদ", labelEn: "Executive Council", count: members.filter((m) => !m.is_senior && m.role !== "member").length },
              { key: "general", labelBn: "সাধারণ সদস্য", labelEn: "General Members", count: members.filter((m) => !m.is_senior && m.role === "member").length },
              { key: "linked", labelBn: "ইউজার সংযুক্ত (Synced)", labelEn: "Linked to User", count: members.filter((m) => !!m.user_id).length },
              { key: "unlinked", labelBn: "অসংযুক্ত প্রোফাইল", labelEn: "Unlinked Profiles", count: members.filter((m) => !m.user_id).length },
            ];

            const filteredMembers = members.filter((m) => {
              if (memberFilter === "senior" && !m.is_senior) return false;
              if (memberFilter === "executive" && (m.is_senior || m.role === "member")) return false;
              if (memberFilter === "general" && (m.is_senior || m.role !== "member")) return false;
              if (memberFilter === "linked" && !m.user_id) return false;
              if (memberFilter === "unlinked" && !!m.user_id) return false;

              if (memberSearchQuery.trim()) {
                const q = memberSearchQuery.toLowerCase();
                const nameMatch = m.name?.toLowerCase().includes(q) || m.name_en?.toLowerCase().includes(q);
                const roleMatch = m.role?.toLowerCase().includes(q) || (ROLE_TRANSLATIONS[m.role]?.bn || "").toLowerCase().includes(q) || (ROLE_TRANSLATIONS[m.role]?.en || "").toLowerCase().includes(q);
                const bioMatch = m.bio?.toLowerCase().includes(q);
                if (!nameMatch && !roleMatch && !bioMatch) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bengali font-bold text-sm text-foreground">
                      {lang === "en" ? "Council Members & Executive Body" : "কার্যকরী কমিটি ও পরিষদ সদস্যবৃন্দ"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                      {lang === "en"
                        ? "Manage council members, connect with user accounts, and execute two-way profile synchronization."
                        : "পরিষদ সদস্যদের তালিকা নিয়ন্ত্রণ করুন, ইউজার একাউন্টের সাথে আন্তঃসংযোগ ও দ্বিমুখী প্রোফাইল সিঙ্ক পরিচালনা করুন।"}
                    </p>
                  </div>
                </div>

                {/* Mini Search & Single Button Filter Bar */}
                <AdminSearchFilterBar
                  searchQuery={memberSearchQuery}
                  onSearchChange={setMemberSearchQuery}
                  searchPlaceholderBn="সদস্যের নাম, পদবী বা ফোন খুঁজুন..."
                  searchPlaceholderEn="Search members by name or role..."
                  activeFilter={memberFilter}
                  onFilterChange={setMemberFilter}
                  filterOptions={memberFilterOptions}
                  actionsRight={
                    !isCreatingMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMemberId(null);
                          setMemberForm({ name: "", name_en: "", role: "member", bio: "", avatar_url: "" });
                          setIsCreatingMember(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2 rounded-full bg-primary text-primary-foreground font-bengali font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === "en" ? "Add Council Member" : "নতুন সদস্য যুক্ত করুন"}</span>
                      </button>
                    )
                  }
                />

                {/* Members Grid */}
                {filteredMembers.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border depth-card text-center space-y-3">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                    <h4 className="font-bengali font-bold text-base text-foreground">
                      {lang === "en" ? "No members match your filter or search" : "কোনো সদস্য খুঁজে পাওয়া যায়নি"}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bengali">
                      {lang === "en"
                        ? "Try clearing your search or selecting a different filter option."
                        : "সার্চ মুছুন অথবা ফিল্টার পরিবর্তন করুন।"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredMembers.map((m) => {
                  const displayName = lang === "en" && m.name_en ? m.name_en : m.name;
                  const displayRole = lang === "en" ? (ROLE_TRANSLATIONS[m.role]?.en || m.role) : (ROLE_TRANSLATIONS[m.role]?.bn || m.role);
                  const linkedUser = profilesList.find((p) => p.id === m.user_id);

                  return (
                    <div
                      key={m.id}
                      className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-primary flex items-center justify-center font-bold text-sm font-bengali shrink-0 overflow-hidden">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              displayName.charAt(0)
                            )}
                          </div>
                          <div className="truncate">
                            <h4 className="font-bengali font-bold text-xs text-foreground truncate">
                              {displayName}
                            </h4>
                            <span className="text-[11px] text-muted-foreground font-bengali block truncate">
                              {m.title || displayRole}
                            </span>
                            {m.phone && (
                              <span className="text-[10px] text-muted-foreground font-mono block">
                                📞 {m.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMemberId(m.id);
                              setMemberForm({
                                name: m.name,
                                name_en: m.name_en || "",
                                role: m.role || "member",
                                bio: m.bio || "",
                                avatar_url: m.avatar_url || "",
                              });
                              setIsCreatingMember(true);
                            }}
                            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                            title="Edit Member"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Connection & Sync Status Footer */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        {m.user_id ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bengali text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 truncate">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {linkedUser ? (linkedUser.display_name || linkedUser.full_name) : "Linked User Account"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-bengali italic">
                            {lang === "en" ? "Unlinked Profile" : "ইউজার সংযুক্ত নেই"}
                          </span>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSyncMember(m);
                              setSelectedUserId(m.user_id || "");
                              setSyncMode("link_only");
                              setSyncModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bengali font-semibold transition-all border border-primary/20 active:scale-95"
                            title={m.user_id ? "Sync Settings" : "Connect User Account"}
                          >
                            {m.user_id ? <RefreshCw className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                            <span>{m.user_id ? (lang === "en" ? "Sync" : "সিঙ্ক") : (lang === "en" ? "+ Connect" : "+ সংযোগ")}</span>
                          </button>

                          {m.user_id && (
                            <button
                              type="button"
                              onClick={() => handleDisconnectMember(m.id)}
                              className="p-1 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                              title="Disconnect User Account"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TWO-WAY SYNC & CONNECT MODAL ── */}
              {syncModalOpen && syncMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                  <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bengali font-bold text-sm text-foreground">
                            {lang === "en" ? "Inter-Connect & 2-Way Sync Profile" : "পরিষদ সদস্য ও ইউজার একাউন্ট সংযোগ ও দ্বিমুখী সিঙ্ক"}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-bengali">
                            {syncMember.name} • {syncMember.title || syncMember.role}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyncModalOpen(false)}
                        className="w-7 h-7 rounded-xl bg-secondary hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* User Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold font-bengali text-foreground">
                        {lang === "en" ? "Target Registered User Account:" : "সংযুক্ত করার জন্য ইউজার একাউন্ট নির্বাচন করুন:"}
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">{lang === "en" ? "-- Choose a User Account --" : "-- ইউজার নির্বাচন করুন --"}</option>
                        {profilesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.display_name || p.full_name || "User"} ({p.id.slice(0, 8)}...)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3 Synchronization Modes */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold font-bengali text-foreground">
                        {lang === "en" ? "Choose Synchronization Behavior:" : "সিঙ্ক বা সংযোগের ধরন নির্ধারণ করুন:"}
                      </label>

                      <div className="space-y-2">
                        <label
                          className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                            syncMode === "council_to_user"
                              ? "border-primary bg-primary/5 shadow-2xs"
                              : "border-border bg-secondary/20 hover:bg-secondary/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sync_mode"
                            value="council_to_user"
                            checked={syncMode === "council_to_user"}
                            onChange={() => setSyncMode("council_to_user")}
                            className="mt-0.5 text-primary"
                          />
                          <div className="text-xs font-bengali">
                            <span className="font-bold text-foreground block">
                              🔄 {lang === "en" ? "Sync Council ➔ User Profile" : "পরিষদ তথ্য ➔ ইউজার প্রোফাইলে কপি করুন"}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {lang === "en"
                                ? "Updates user profile name, title, bio, avatar, and phone to match this council member."
                                : "ইউজারের নাম, পদবী, বায়ো ও ছবি এই পরিষদ সদস্যের তথ্য অনুযায়ী আপডেট হবে।"}
                            </span>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                            syncMode === "user_to_council"
                              ? "border-primary bg-primary/5 shadow-2xs"
                              : "border-border bg-secondary/20 hover:bg-secondary/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sync_mode"
                            value="user_to_council"
                            checked={syncMode === "user_to_council"}
                            onChange={() => setSyncMode("user_to_council")}
                            className="mt-0.5 text-primary"
                          />
                          <div className="text-xs font-bengali">
                            <span className="font-bold text-foreground block">
                              🔄 {lang === "en" ? "Sync User ➔ Council Member" : "ইউজার প্রোফাইল ➔ পরিষদ সদস্য তথ্যে কপি করুন"}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {lang === "en"
                                ? "Updates this council member's record using the selected user's profile details."
                                : "ইউজারের বর্তমান প্রোফাইল তথ্য অনুযায়ী পরিষদ সদস্যের রেকর্ড আপডেট হবে।"}
                            </span>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                            syncMode === "link_only"
                              ? "border-primary bg-primary/5 shadow-2xs"
                              : "border-border bg-secondary/20 hover:bg-secondary/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sync_mode"
                            value="link_only"
                            checked={syncMode === "link_only"}
                            onChange={() => setSyncMode("link_only")}
                            className="mt-0.5 text-primary"
                          />
                          <div className="text-xs font-bengali">
                            <span className="font-bold text-foreground block">
                              🔗 {lang === "en" ? "Separate Profiles (Link Only)" : "স্বতন্ত্র প্রোফাইল (কেবলমাত্র লিঙ্ক করুন)"}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {lang === "en"
                                ? "Connects the accounts without overwriting either profile's custom data."
                                : "উভয় প্রোফাইলের তথ্য আলাদা থাকবে, তবে অফিসিয়াল সংযোগ প্রতিষ্ঠিত হবে।"}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setSyncModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground text-xs font-bengali transition-colors"
                      >
                        {lang === "en" ? "Cancel" : "বাতিল"}
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteSync}
                        disabled={!selectedUserId || syncing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bengali font-semibold text-xs transition-all active:scale-95 shadow-md shadow-primary/20 disabled:opacity-50"
                      >
                        {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>{lang === "en" ? "Apply Link & Sync" : "সংযোগ ও সিঙ্ক কার্যকর করুন"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── TAB: USERS & ROLES ── */}
        {activeTab === "users" && (() => {
          const userFilterOptions: FilterOption[] = [
            { key: "all", labelBn: "সকল ব্যবহারকারী", labelEn: "All Users", count: profilesList.length },
            { key: "admin", labelBn: "অ্যাডমিন (Admin)", labelEn: "Admins", count: profilesList.filter((p) => userRolesList.some((r) => r.user_id === p.id && r.role === "admin")).length },
            { key: "moderator", labelBn: "মডারেটর (Moderator)", labelEn: "Moderators", count: profilesList.filter((p) => userRolesList.some((r) => r.user_id === p.id && r.role === "moderator")).length },
            { key: "user", labelBn: "সাধারণ সদস্য (User)", labelEn: "Regular Users", count: profilesList.filter((p) => !userRolesList.some((r) => r.user_id === p.id && (r.role === "admin" || r.role === "moderator"))).length },
            { key: "linked_council", labelBn: "পরিষদ সংযুক্ত", labelEn: "Council Linked", count: profilesList.filter((p) => members.some((m) => m.user_id === p.id)).length },
            { key: "unlinked", labelBn: "অসংযুক্ত ইউজার", labelEn: "Unlinked Users", count: profilesList.filter((p) => !members.some((m) => m.user_id === p.id)).length },
          ];

          const filteredUsers = profilesList.filter((p) => {
            const userRoleRecord = userRolesList.find((r) => r.user_id === p.id);
            const currentRole = userRoleRecord?.role || "user";
            const isLinked = members.some((m) => m.user_id === p.id);

            if (userFilter === "admin" && currentRole !== "admin") return false;
            if (userFilter === "moderator" && currentRole !== "moderator") return false;
            if (userFilter === "user" && currentRole !== "user") return false;
            if (userFilter === "linked_council" && !isLinked) return false;
            if (userFilter === "unlinked" && isLinked) return false;

            if (userSearchQuery.trim()) {
              const q = userSearchQuery.toLowerCase();
              const nameMatch = p.full_name?.toLowerCase().includes(q) || p.display_name?.toLowerCase().includes(q);
              const phoneMatch = p.phone?.toLowerCase().includes(q);
              const idMatch = p.id?.toLowerCase().includes(q);
              if (!nameMatch && !phoneMatch && !idMatch) return false;
            }
            return true;
          });

          return (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bengali font-bold text-sm text-foreground">
                    {lang === "en" ? "User Management & Role Access" : "ব্যবহারকারী ও প্রশাসনিক রোল ব্যবস্থাপনা"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                    {lang === "en"
                      ? `Total registered users: ${profilesList.length}. Assign admin privileges and inspect linked council accounts.`
                      : `মোট নিবন্ধিত ব্যবহারকারী: ${profilesList.length} জন। রোল পরিবর্তন এবং পরিষদ সংযোগ পরিচালনা করুন।`}
                  </p>
                </div>
              </div>

              {/* Mini Search & Single Button Filter Bar */}
              <AdminSearchFilterBar
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                searchPlaceholderBn="নাম, ফোন বা আইডি দিয়ে ব্যবহারকারী খুঁজুন..."
                searchPlaceholderEn="Search users by name, phone or ID..."
                activeFilter={userFilter}
                onFilterChange={setUserFilter}
                filterOptions={userFilterOptions}
              />

              {/* Users List Grid */}
              {filteredUsers.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border depth-card text-center space-y-3">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h4 className="font-bengali font-bold text-base text-foreground">
                    {lang === "en" ? "No users match your filter or search" : "কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি"}
                  </h4>
                  <p className="text-xs text-muted-foreground font-bengali">
                    {lang === "en"
                      ? "Try clearing your search or selecting a different filter option."
                      : "সার্চ মুছুন অথবা ফিল্টার পরিবর্তন করুন।"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredUsers.map((p) => {
                    const userRoleRecord = userRolesList.find((r) => r.user_id === p.id);
                    const currentRole = userRoleRecord?.role || "user";
                    const linkedCouncilMember = members.find((m) => m.user_id === p.id);

                    return (
                      <div
                        key={p.id}
                        className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-primary flex items-center justify-center font-bold text-sm font-bengali shrink-0 overflow-hidden">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (p.display_name || p.full_name || "U").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="truncate">
                              <h4 className="font-bengali font-bold text-xs text-foreground truncate">
                                {p.display_name || p.full_name || "Unnamed User"}
                              </h4>
                              <span className="text-[11px] text-muted-foreground font-mono block truncate">
                                {p.phone || `ID: ${p.id.slice(0, 8)}...`}
                              </span>
                            </div>
                          </div>

                          {/* Custom Rounded Role Dropdown */}
                          <UserRoleDropdown
                            currentRole={currentRole}
                            onRoleChange={(newRole) => handleUpdateUserRole(p.id, newRole)}
                          />
                        </div>

                        {/* Council Connection Status Badge */}
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                          {linkedCouncilMember ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-bengali text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 truncate">
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {lang === "en" ? "Council:" : "পরিষদ:"} {linkedCouncilMember.name} ({linkedCouncilMember.title || linkedCouncilMember.role})
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-bengali">
                              {lang === "en" ? "No Council Profile Linked" : "পরিষদ প্রোফাইল যুক্ত নেই"}
                            </span>
                          )}

                          {linkedCouncilMember && (
                            <button
                              type="button"
                              onClick={() => {
                                setSyncMember(linkedCouncilMember);
                                setSelectedUserId(p.id);
                                setSyncMode("link_only");
                                setSyncModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                              title="Manage Council Link & Sync"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

          {/* ── TAB: SETTINGS & APPEARANCE ── */}
          {(activeTab === "settings" || activeTab === "appearance") && (
            <div className="space-y-6">
              {/* ────────────────────────────────────────────────────────
                  SUBTAB 1: ORGANIZATION PROFILE & PUBLIC CONTACTS
              ──────────────────────────────────────────────────────── */}
              {settingsSubTab === "general" && (
                <div className="space-y-6">
                  {/* General Info Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
                          <Compass className="w-4 h-4 text-primary" />
                          <span>{lang === "en" ? "Organization Profile & Coordinates" : "সংস্থার মৌলিক তথ্য ও সার্বজনীন যোগাযোগের ঠিকানা"}</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                          {lang === "en"
                            ? "Configure official names, slogans, founding year, and office communication details."
                            : "সংস্থার নাম, স্লোগান, প্রতিষ্ঠা সাল এবং দাপ্তরিক যোগাযোগের বিবরণ পরিবর্তন করুন।"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Site Name (Bengali)" : "সংস্থার নাম (বাংলা)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.site_name_bn}
                          onChange={(e) => setGeneralForm({ ...generalForm, site_name_bn: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Site Name (English)" : "সংস্থার নাম (ইংরেজি)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.site_name_en}
                          onChange={(e) => setGeneralForm({ ...generalForm, site_name_en: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Tagline / Slogan (Bengali)" : "মূল স্লোগান / ট্যাগলাইন (বাংলা)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.tagline_bn}
                          onChange={(e) => setGeneralForm({ ...generalForm, tagline_bn: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Tagline / Slogan (English)" : "মূল স্লোগান / ট্যাগলাইন (ইংরেজি)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.tagline_en}
                          onChange={(e) => setGeneralForm({ ...generalForm, tagline_en: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Established Year (Bengali)" : "প্রতিষ্ঠা সাল (বাংলা)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.established_year_bn || "১৯৮২"}
                          onChange={(e) => setGeneralForm({ ...generalForm, established_year_bn: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Established Year (English)" : "প্রতিষ্ঠা সাল (ইংরেজি)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.established_year_en || "1982"}
                          onChange={(e) => setGeneralForm({ ...generalForm, established_year_en: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Official Contact Email" : "দাপ্তরিক যোগাযোগের ইমেইল"}
                        </label>
                        <input
                          type="email"
                          value={generalForm.contact_email}
                          onChange={(e) => setGeneralForm({ ...generalForm, contact_email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Primary Hotline / Phone" : "প্রধান হটলাইন / ফোন নম্বর"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.contact_phone}
                          onChange={(e) => setGeneralForm({ ...generalForm, contact_phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Office Physical Address (Bengali)" : "দাপ্তরিক কার্যালয়ের ঠিকানা (বাংলা)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.address_bn}
                          onChange={(e) => setGeneralForm({ ...generalForm, address_bn: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Office Physical Address (English)" : "দাপ্তরিক কার্যালয়ের ঠিকানা (ইংরেজি)"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.address_en}
                          onChange={(e) => setGeneralForm({ ...generalForm, address_en: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Facebook Page / Group URL" : "ফেসবুক পেজ / গ্রুপের লিঙ্ক"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.facebook_url || ""}
                          onChange={(e) => setGeneralForm({ ...generalForm, facebook_url: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "YouTube Channel URL" : "ইউটিউব চ্যানেলের লিঙ্ক"}
                        </label>
                        <input
                          type="text"
                          value={generalForm.youtube_url || ""}
                          onChange={(e) => setGeneralForm({ ...generalForm, youtube_url: e.target.value })}
                          placeholder="https://youtube.com/@..."
                          className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSettings("general")}
                        disabled={savingSettings}
                        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{lang === "en" ? "Save Profile & Coordinates" : "সংস্থার তথ্য সংরক্ষণ করুন"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  SUBTAB 2: BRANDING, LOGO & FAVICON STUDIO
              ──────────────────────────────────────────────────────── */}
              {settingsSubTab === "branding" && (
                <div className="space-y-6">
                  {/* Favicon Background & Live Preview Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
                          <Aperture className="w-4 h-4 text-primary" />
                          <span>{lang === "en" ? "Browser Tab Favicon & Background Customizer" : "ব্রাউজার ট্যাব ফ্যাভিকন ও ব্যাকগ্রাউন্ড কাস্টমাইজেশন"}</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                          {lang === "en"
                            ? "Control the background styling of the browser tab icon to ensure maximum visibility across dark and light OS themes."
                            : "ব্রাউজার ট্যাবে লোগোর জন্য স্পষ্ট ব্যাকগ্রাউন্ড নির্ধারণ করুন যেন ডার্ক ও লাইট ব্রাউজার থিমে ফ্যাভিকন স্পষ্ট দেখা যায়।"}
                        </p>
                      </div>
                    </div>

                    {/* Live Browser Tab Preview Mockups */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bengali font-bold text-foreground">
                        {lang === "en" ? "Live Browser Tab Previews" : "ব্রাউজার ট্যাবে লাইভ প্রিভিউ"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dark Mode Browser Tab Mockup */}
                        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-lg space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>Chrome Dark Mode Tab</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/60 max-w-sm">
                            {/* Favicon Preview */}
                            <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
                              {generalForm.favicon_bg === "white_circle" ? (
                                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center p-0.5 border border-zinc-300 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : generalForm.favicon_bg === "white_solid" ? (
                                <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center p-0.5 border border-zinc-300 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : generalForm.favicon_bg === "gradient_primary" ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm flex items-center justify-center p-0.5 border border-white/40 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : (
                                <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                              )}
                            </div>
                            <span className="text-xs text-zinc-100 font-bengali font-semibold truncate flex-1">
                              {generalForm.site_name_bn}
                            </span>
                            <X className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          </div>
                        </div>

                        {/* Light Mode Browser Tab Mockup */}
                        <div className="p-3.5 rounded-2xl bg-zinc-200 border border-zinc-300 shadow-md space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono">
                            <span>Chrome Light Mode Tab</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-zinc-300 shadow-xs max-w-sm">
                            {/* Favicon Preview */}
                            <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
                              {generalForm.favicon_bg === "white_circle" ? (
                                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center p-0.5 border border-zinc-300 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : generalForm.favicon_bg === "white_solid" ? (
                                <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center p-0.5 border border-zinc-300 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : generalForm.favicon_bg === "gradient_primary" ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm flex items-center justify-center p-0.5 border border-white/40 overflow-hidden">
                                  <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : (
                                <img src={generalForm.logo_url || "/site-logo.png"} alt="Favicon" className="max-w-full max-h-full object-contain" />
                              )}
                            </div>
                            <span className="text-xs text-zinc-900 font-bengali font-semibold truncate flex-1">
                              {generalForm.site_name_bn}
                            </span>
                            <X className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Favicon Background Options Selection */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bengali font-bold text-foreground block">
                        {lang === "en" ? "Favicon Background Style" : "ফ্যাভিকনের ব্যাকগ্রাউন্ড স্টাইল নির্বাচন করুন"}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          {
                            key: "white_circle",
                            titleBn: "সাদা বৃত্তাকার ব্যাজ (সুপারিশকৃত)",
                            titleEn: "Circular White Badge (Recommended)",
                            descBn: "উজ্জ্বল সাদা ব্যাকগ্রাউন্ড ও সীমানা",
                            descEn: "Solid circular white backing & subtle border",
                            icon: "⚪",
                          },
                          {
                            key: "white_solid",
                            titleBn: "সাদা আয়তাকার শিল্ড",
                            titleEn: "Rounded Solid White Shield",
                            descBn: "মসৃণ চারকোনা সাদা ব্যাকগ্রাউন্ড",
                            descEn: "App-like rounded white tile",
                            icon: "⬜",
                          },
                          {
                            key: "gradient_primary",
                            titleBn: "ব্র্যান্ড গ্র্যাডিয়েন্ট রিং",
                            titleEn: "Brand Gradient Ring",
                            descBn: "নীল ও আসমানী রঙের বৃত্ত",
                            descEn: "Vibrant royal brand gradient backing",
                            icon: "🌈",
                          },
                          {
                            key: "transparent",
                            titleBn: "স্বচ্ছ (ট্রান্সপারেন্ট)",
                            titleEn: "Transparent (No BG)",
                            descBn: "কোনো অতিরিক্ত ব্যাকগ্রাউন্ড ছাড়া",
                            descEn: "Raw transparent emblem",
                            icon: "🪟",
                          },
                        ].map((opt) => {
                          const isSelected = (generalForm.favicon_bg || "white_circle") === opt.key;
                          return (
                            <div
                              key={opt.key}
                              onClick={() => {
                                setGeneralForm({ ...generalForm, favicon_bg: opt.key as any });
                                applyBrowserFavicon(generalForm.logo_url || "/site-logo.png", opt.key as any);
                              }}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                                  : "border-border bg-secondary/30 hover:bg-secondary/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-base">{opt.icon}</span>
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                              <h5 className="font-bengali font-bold text-xs text-foreground">
                                {lang === "en" ? opt.titleEn : opt.titleBn}
                              </h5>
                              <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
                                {lang === "en" ? opt.descEn : opt.descBn}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Logo Management & Crest Uploader */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
                          <LogoTile size="sm" bare />
                          <span>{lang === "en" ? "Official Crest & Logo Asset" : "অফিসিয়াল মনোগ্রাম ও লোগো ব্যবস্থাপনা"}</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                          {lang === "en"
                            ? "Upload a high-resolution PNG or SVG of the organization crest."
                            : "সংস্থার উচ্চ রেজোলিউশনের লোগো ইমেজ আপলোড করুন।"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-secondary/30 border border-border">
                      {/* Logo Preview Tile */}
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-card border border-border/80 p-2 flex items-center justify-center shrink-0 shadow-inner">
                        <img
                          src={generalForm.logo_url || "/site-logo.png"}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-2.5 flex-1 text-center sm:text-left">
                        <h4 className="font-bengali font-bold text-sm text-foreground">
                          {lang === "en" ? "Current Emblem Image" : "বর্তমান নির্বাচিত মনোগ্রাম"}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                          {generalForm.logo_url || "/site-logo.png"}
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bengali font-bold flex items-center gap-2 hover:bg-primary/90 active:scale-95 shadow-xs transition-all"
                          >
                            {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            <span>{lang === "en" ? "Upload New Logo" : "নতুন লোগো আপলোড করুন"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Logo Glow & Silhouette Tuning */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                          {lang === "en" ? "Logo Glow Level" : "লোগোর পেছনের গ্লো (Glow) প্রভাব"}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(["off", "subtle", "normal", "bold"] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setAppearanceForm({ ...appearanceForm, logo_glow: g })}
                              className={`py-2 rounded-xl text-xs font-mono font-bold capitalize border transition-all ${
                                appearanceForm.logo_glow === g
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bengali font-semibold text-foreground">
                            {lang === "en" ? "Silhouette Dilation Radius" : "সিলুয়েট বর্ডারের প্রশস্ততা"}
                          </label>
                          <span className="text-xs font-mono font-bold text-primary">
                            {appearanceForm.logo_dilate}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={appearanceForm.logo_dilate}
                          onChange={(e) => setAppearanceForm({ ...appearanceForm, logo_dilate: Number(e.target.value) })}
                          className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Theme-Adaptive Logo & Favicon Toggle */}
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎨</span>
                          <h4 className="font-bengali font-bold text-xs text-foreground">
                            {lang === "en" ? "Theme-Adaptive Logo & Favicon Color" : "থিমের রঙে লোগো ও ফ্যাভিকনের রঙ পরিবর্তন"}
                          </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-bengali">
                          {lang === "en"
                            ? "When enabled, the logo and favicon dynamically tint to match the active theme/festival. When disabled, they stay in original natural colors."
                            : "চালু থাকলে সক্রিয় হেরিটেজ বা জাতীয় উৎসবের থিম রঙের সাথে লোগো ও ফ্যাভিকন স্বয়ংক্রিয়ভাবে মানিয়ে নেবে। বন্ধ থাকলে মূল প্রাকৃতিক রঙে থাকবে।"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearanceForm.theme_adaptive_logo}
                        onChange={(e) =>
                          setAppearanceForm({ ...appearanceForm, theme_adaptive_logo: e.target.checked })
                        }
                        className="w-5 h-5 rounded text-primary cursor-pointer shrink-0"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSettings("branding")}
                        disabled={savingSettings}
                        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{lang === "en" ? "Save Branding & Favicon Settings" : "ব্র্যান্ডিং সেটিংস সংরক্ষণ করুন"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  SUBTAB 3: THEME & COLOR PALETTES (3-LAYER ENGINE)
              ──────────────────────────────────────────────────────── */}
              {settingsSubTab === "palettes" && (
                <ThemePalettesStudio
                  appearanceForm={appearanceForm as any}
                  setAppearanceForm={setAppearanceForm as any}
                  savingSettings={savingSettings}
                  onSave={() => handleSaveSettings("palettes")}
                />
              )}

              {/* ────────────────────────────────────────────────────────
                  SUBTAB 4: MODULE FEATURE SWITCHES & MAINTENANCE LOCK
              ──────────────────────────────────────────────────────── */}
              {settingsSubTab === "features" && (
                <div className="space-y-6">
                  {/* Module Flags Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bengali font-bold text-base text-foreground flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-primary" />
                          <span>{lang === "en" ? "Platform Module Switches" : "ওয়েবসাইট মডিউল সক্রিয়করণ সেটিংস"}</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                          {lang === "en"
                            ? "Enable or disable major public modules on the live site."
                            : "প্রয়োজনে ওয়েবসাইটের যেকোনো প্রধান মডিউল চালু অথবা সাময়িক বন্ধ রাখুন।"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: "enable_blog", labelBn: "সাহিত্য প্রকাশনা ও ব্লগ মডিউল", labelEn: "Blog & Posts Module", descBn: "প্রবন্ধ, গল্প ও কবিতা বিভাগ", descEn: "Articles, stories and poems section" },
                        { key: "enable_events", labelBn: "অনুষ্ঠান ও সাহিত্য সভা ক্যালেন্ডার", labelEn: "Events & Festivals Module", descBn: "আসন্ন ও অতীত সাহিত্য সম্মেলন", descEn: "Upcoming & past literary assemblies" },
                        { key: "enable_courses", labelBn: "কোর্স ও কর্মশালা মডিউল", labelEn: "Courses & Workshops Module", descBn: "সাহিত্য প্রশিক্ষণ ও অনলাইন নিবন্ধন", descEn: "Literature workshops & registrations" },
                        { key: "enable_members", labelBn: "পরিষদ ও উপদেষ্টা পর্ষদ ডিরেক্টরি", labelEn: "Council Members Directory", descBn: "কমিটি ও পরিষদ সদস্যদের তালিকা", descEn: "Council & executive members catalog" },
                        { key: "enable_gallery", labelBn: "ফটোগ্রাফি ও মিডিয়া গ্যালারি", labelEn: "Media Gallery Module", descBn: "ঐতিহাসিক ছবি ও ভিডিও সংগ্রহশালা", descEn: "Photo & video archive" },
                      ].map((feat) => {
                        const isEnabled = (featuresForm as any)[feat.key] !== false;
                        return (
                          <label
                            key={feat.key}
                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                              isEnabled
                                ? "bg-card border-border/80 hover:bg-secondary/40"
                                : "bg-secondary/20 border-border/40 opacity-70"
                            }`}
                          >
                            <div>
                              <span className="font-bengali font-bold text-xs text-foreground block">
                                {lang === "en" ? feat.labelEn : feat.labelBn}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-bengali block mt-0.5">
                                {lang === "en" ? feat.descEn : feat.descBn}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() =>
                                setFeaturesForm({ ...featuresForm, [feat.key]: !isEnabled })
                              }
                              className="w-5 h-5 rounded text-primary cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Maintenance Lock Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border depth-card space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bengali font-bold text-base text-amber-500 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{lang === "en" ? "Maintenance Mode Lock" : "জরুরি রক্ষণাবেক্ষণ মোড (Maintenance Mode)"}</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                          {lang === "en"
                            ? "Locks public access with a maintenance banner while admins can still work."
                            : "এটি চালু করলে সাধারণ পাঠকদের জন্য সাইটে রক্ষণাবেক্ষণ নোটিশ প্রদর্শিত হবে।"}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 cursor-pointer">
                      <div>
                        <span className="font-bengali font-bold text-xs text-foreground block">
                          {lang === "en" ? "Enable Maintenance Mode" : "রক্ষণাবেক্ষণ মোড সক্রিয় করুন"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-bengali block mt-0.5">
                          {featuresForm.maintenance_mode
                            ? (lang === "en" ? "⚠️ Maintenance is currently active" : "⚠️ বর্তমানে রক্ষণাবেক্ষণ মোড চালু রয়েছে")
                            : (lang === "en" ? "Site is live and publicly accessible" : "সাইট সাধারণ পাঠকদের জন্য উন্মুক্ত")}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={featuresForm.maintenance_mode}
                        onChange={(e) => setFeaturesForm({ ...featuresForm, maintenance_mode: e.target.checked })}
                        className="w-5 h-5 rounded text-amber-500 cursor-pointer"
                      />
                    </label>

                    {featuresForm.maintenance_mode && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                            {lang === "en" ? "Maintenance Notice (Bengali)" : "রক্ষণাবেক্ষণের নোটিশ বার্তা (বাংলা)"}
                          </label>
                          <textarea
                            rows={2}
                            value={featuresForm.maintenance_message_bn || ""}
                            onChange={(e) => setFeaturesForm({ ...featuresForm, maintenance_message_bn: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bengali focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bengali font-semibold text-foreground mb-1 block">
                            {lang === "en" ? "Maintenance Notice (English)" : "রক্ষণাবেক্ষণের নোটিশ বার্তা (ইংরেজি)"}
                          </label>
                          <textarea
                            rows={2}
                            value={featuresForm.maintenance_message_en || ""}
                            onChange={(e) => setFeaturesForm({ ...featuresForm, maintenance_message_en: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSettings("features")}
                        disabled={savingSettings}
                        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold font-bengali shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{lang === "en" ? "Save Module & Maintenance Settings" : "মডিউল সেটিংস সংরক্ষণ করুন"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  SUBTAB 5: AUDIT LOGS & SETTINGS HISTORY
              ──────────────────────────────────────────────────────── */}
              {settingsSubTab === "history" && (
                <div className="space-y-6">
                  <SettingsHistoryPanel />
                </div>
              )}
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════════════════════
            ADMIN PANEL MINI FOOTER (DESKTOP & TABLET VIEW)
        ══════════════════════════════════════════════════════════════ */}
        <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-border hidden md:flex items-center justify-between gap-4 text-xs text-muted-foreground font-bengali bg-card/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              {lang === "en"
                ? "Faridpur Shahitto Parishad • Admin Central"
                : "ফরিদপুর সাহিত্য পরিষদ • অ্যাডমিন কন্ট্রোল সিস্টেম"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch Toggle */}
            <div className="flex items-center p-1 rounded-full bg-card border border-border">
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  lang === "bn"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-all ${
                  lang === "en"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
            </div>

            {/* Theme Switch Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border hover:bg-secondary text-foreground text-xs font-semibold transition-all shadow-xs"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{lang === "en" ? "Light Mode" : "লাইট মোড"}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">{lang === "en" ? "Dark Mode" : "ডার্ক মোড"}</span>
                </>
              )}
            </button>
          </div>
        </footer>

        {/* ══════════════════════════════════════════════════════════════
            MOBILE BOTTOM NAVIGATION BAR (APP EXPERIENCE)
        ══════════════════════════════════════════════════════════════ */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 flex items-center justify-around px-2 py-2 shadow-2xl">
          {[
            { key: "dashboard", labelBn: "ওভারভিউ", labelEn: "Overview", icon: LayoutDashboard },
            { key: "posts", labelBn: "পোস্ট", labelEn: "Posts", icon: FileText, badge: posts.length },
            { key: "events", labelBn: "ইভেন্ট", labelEn: "Events", icon: Calendar, badge: events.length },
            { key: "gallery", labelBn: "গ্যালারি", labelEn: "Media", icon: ImageLucide },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const label = lang === "en" ? tab.labelEn : tab.labelBn;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as AdminTab);
                  setIsCreatingPost(false);
                  setEditingPostId(null);
                  setEditingEventId(null);
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                  isActive
                    ? "text-primary font-bold scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-primary-foreground font-sans">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bengali mt-0.5">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTab"
                    className="w-1 h-1 rounded-full bg-primary mt-0.5"
                  />
                )}
              </button>
            );
          })}

          {/* More / Menu Button to open Drawer */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-muted-foreground hover:text-foreground transition-all"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bengali mt-0.5">{lang === "en" ? "Menu" : "মেনু"}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
