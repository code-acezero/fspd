import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Calendar, Settings, Users, Palette, Menu, X, Eye, UserPlus, MessageSquare, Globe, LogOut, Save, Loader2, Trash2, Edit3, Monitor, Smartphone, ShieldCheck, ImagePlus, Crown, Plus, ChevronUp, ChevronDown, Check } from "lucide-react";
import LogoTile from "@/components/branding/LogoTile";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ModerationPanel from "@/components/admin/ModerationPanel";
import SettingsHistoryPanel from "@/components/admin/SettingsHistoryPanel";
import HealthCheckBanner from "@/components/admin/HealthCheckBanner";
import { ShieldAlert } from "lucide-react";

type AdminTab = "dashboard" | "posts" | "events" | "courses" | "members" | "users" | "assets" | "theme" | "settings" | "moderation";

const emptyMemberForm = { name: "", name_en: "", title: "", title_en: "", bio: "", bio_en: "", role: "member", avatar_url: "", gradient_class: "from-primary to-crimson", sort_order: 0, is_senior: false, is_active: true, is_approved: true };

const emptyCourseForm = {
  title: "", title_en: "", instructor: "", instructor_en: "",
  duration: "", duration_en: "", modules: 0, enrolled: 0,
  status: "coming_soon", description: "", description_en: "",
  highlights: "", highlights_en: "", cover_image: "", sort_order: 0, is_active: true,
};

const ASSET_SLOTS = ["hero", "slider", "course_cover", "blog_cover", "gallery"] as const;
type AssetSlot = typeof ASSET_SLOTS[number];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const { user, role, signOut } = useAuth();
  const { settings, updateSettings } = useSiteSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postForm, setPostForm] = useState({ title: "", title_en: "", content: "", excerpt: "", category: "সাহিত্য", tags: "", youtube_url: "", featured: false, published: false, cover_image: "" });
  const [savingPost, setSavingPost] = useState(false);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [uploadingEventImage, setUploadingEventImage] = useState(false);
  const postImageRef = useRef<HTMLInputElement>(null);
  const eventImageRef = useRef<HTMLInputElement>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({ title: "", title_en: "", date: "", time: "", location: "", description: "", tag: "", tag_color: "bg-primary text-primary-foreground", cover_image: "" });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({ ...emptyMemberForm });
  const [savingMember, setSavingMember] = useState(false);
  const [uploadingMemberAvatar, setUploadingMemberAvatar] = useState(false);
  const memberAvatarRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [assetSlotFilter, setAssetSlotFilter] = useState<AssetSlot>("hero");
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const assetUploadRef = useRef<HTMLInputElement>(null);
  
  const [generalForm, setGeneralForm] = useState(settings.general);
  const [appearanceForm, setAppearanceForm] = useState(settings.appearance);
  const [featuresForm, setFeaturesForm] = useState(settings.features);
  const [savingSettings, setSavingSettings] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [courses, setCourses] = useState<any[]>([]);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({ ...emptyCourseForm });
  const [savingCourse, setSavingCourse] = useState(false);
  const [uploadingCourseImage, setUploadingCourseImage] = useState(false);
  const courseImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (role && role !== "admin") { navigate("/home"); toast({ title: t("permissionDenied"), variant: "destructive" }); }
  }, [user, role]);

  useEffect(() => { fetchData(); }, [activeTab]);

  useEffect(() => {
    setGeneralForm(settings.general);
    setAppearanceForm(settings.appearance);
    setFeaturesForm(settings.features);
  }, [settings]);

  const fetchData = async () => {
    if (activeTab === "posts" || activeTab === "dashboard") { const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }); if (data) setPosts(data); }
    if (activeTab === "events" || activeTab === "dashboard") { const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }); if (data) setEvents(data); }
    if (activeTab === "users") {
      const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (profilesData) setUsers(profilesData);
      const { data: rolesData } = await supabase.from("user_roles").select("*");
      if (rolesData) {
        const roleMap: Record<string, string> = {};
        rolesData.forEach((r) => { roleMap[r.user_id] = r.role; });
        setUserRoles(roleMap);
      }
    }
    if (activeTab === "members" || activeTab === "dashboard") {
      const { data } = await supabase.from("members").select("*").order("sort_order", { ascending: true });
      if (data) setMembers(data);
    }
    if (activeTab === "courses" || activeTab === "dashboard") {
      const { data } = await supabase.from("courses").select("*").order("sort_order", { ascending: true });
      if (data) setCourses(data);
    }
    if (activeTab === "assets") {
      const { data } = await supabase.from("site_assets").select("*").order("slot", { ascending: true }).order("sort_order", { ascending: true });
      if (data) setAssets(data);
    }
  };

  const reorderMember = async (m: any, direction: "up" | "down") => {
    const sameGroup = members.filter((x) => x.is_senior === m.is_senior);
    const idx = sameGroup.findIndex((x) => x.id === m.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameGroup.length) return;
    const other = sameGroup[swapIdx];
    await Promise.all([
      supabase.from("members").update({ sort_order: other.sort_order }).eq("id", m.id),
      supabase.from("members").update({ sort_order: m.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  const uploadAsset = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast({ title: t("error"), description: "Max 8MB", variant: "destructive" }); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast({ title: t("error"), description: t("invalidImageType"), variant: "destructive" }); return; }
    setUploadingAsset(true);
    const filePath = `${assetSlotFilter}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("content-images").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: t("uploadFailed"), description: uploadError.message, variant: "destructive" }); setUploadingAsset(false); return; }
    const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(filePath);
    const maxSort = assets.filter((a) => a.slot === assetSlotFilter).reduce((m, a) => Math.max(m, a.sort_order), 0);
    const { error } = await supabase.from("site_assets").insert({ slot: assetSlotFilter, name: newAssetName || file.name, image_url: urlData.publicUrl, sort_order: maxSort + 1, created_by: user?.id });
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("success"), description: t("imageUploaded") }); setNewAssetName(""); fetchData(); }
    setUploadingAsset(false);
  };

  const updateAsset = async (id: string, patch: Record<string, any>) => {
    await supabase.from("site_assets").update(patch as any).eq("id", id);
    fetchData();
  };

  const deleteAsset = async (id: string) => {
    await supabase.from("site_assets").delete().eq("id", id);
    toast({ title: t("deleted") });
    fetchData();
  };

  const reorderAsset = async (a: any, direction: "up" | "down") => {
    const slotItems = assets.filter((x) => x.slot === a.slot).sort((x, y) => x.sort_order - y.sort_order);
    const idx = slotItems.findIndex((x) => x.id === a.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= slotItems.length) return;
    const other = slotItems[swapIdx];
    await Promise.all([
      supabase.from("site_assets").update({ sort_order: other.sort_order }).eq("id", a.id),
      supabase.from("site_assets").update({ sort_order: a.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  const saveMember = async () => {
    setSavingMember(true);
    let form = { ...memberForm };
    if (form.name && !form.name_en) form.name_en = await autoTranslate(form.name, "en");
    else if (form.name_en && !form.name) form.name = await autoTranslate(form.name_en, "bn");
    if (form.title && !form.title_en) form.title_en = await autoTranslate(form.title, "en");
    else if (form.title_en && !form.title) form.title = await autoTranslate(form.title_en, "bn");
    if (form.bio && !form.bio_en) form.bio_en = await autoTranslate(form.bio, "en");
    else if (form.bio_en && !form.bio) form.bio = await autoTranslate(form.bio_en, "bn");
    const payload = { ...form, sort_order: Number(form.sort_order) || 0, created_by: user?.id };
    const { error } = editingMember
      ? await supabase.from("members").update(payload).eq("id", editingMember.id)
      : await supabase.from("members").insert(payload);
    if (error) { toast({ title: t("error"), description: error.message, variant: "destructive" }); }
    else { toast({ title: t("success"), description: t("memberSaved") }); setEditingMember(null); setMemberForm({ ...emptyMemberForm }); fetchData(); }
    setSavingMember(false);
  };

  const deleteMember = async (id: string) => {
    await supabase.from("members").delete().eq("id", id);
    toast({ title: t("deleted") });
    fetchData();
  };

  const handleMemberAvatarUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast({ title: t("error"), description: "Max 5MB", variant: "destructive" }); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast({ title: t("error"), description: t("invalidImageType"), variant: "destructive" }); return; }
    setUploadingMemberAvatar(true);
    const filePath = `members/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("content-images").upload(filePath, file, { upsert: true });
    if (uploadError) toast({ title: t("uploadFailed"), description: uploadError.message, variant: "destructive" });
    else {
      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(filePath);
      setMemberForm((p) => ({ ...p, avatar_url: urlData.publicUrl }));
      toast({ title: t("success"), description: t("imageUploaded") });
    }
    setUploadingMemberAvatar(false);
  };

  const autoTranslate = async (text: string, targetLang: "en" | "bn"): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, targetLang },
      });
      if (error) throw error;
      return data?.translatedText || "";
    } catch (e) {
      console.error("Auto-translate failed:", e);
      return "";
    }
  };

  const savePost = async () => {
    setSavingPost(true);
    let form = { ...postForm };
    // Auto-translate: if title is provided but title_en is empty, or vice versa
    if (form.title && !form.title_en) {
      form.title_en = await autoTranslate(form.title, "en");
    } else if (form.title_en && !form.title) {
      form.title = await autoTranslate(form.title_en, "bn");
    }
    // Auto-translate content/excerpt if needed
    if (form.content && !form.excerpt) {
      form.excerpt = form.content.substring(0, 150) + "...";
    }
    const payload = { ...form, tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean), author_id: user?.id };
    if (editingPost) { await supabase.from("posts").update(payload).eq("id", editingPost.id); }
    else { await supabase.from("posts").insert(payload); }
    toast({ title: t("success"), description: t("postSaved") });
    setEditingPost(null);
    setPostForm({ title: "", title_en: "", content: "", excerpt: "", category: "সাহিত্য", tags: "", youtube_url: "", featured: false, published: false, cover_image: "" });
    setSavingPost(false);
    fetchData();
  };

  const deletePost = async (id: string) => { await supabase.from("posts").delete().eq("id", id); toast({ title: t("deleted") }); fetchData(); };

  const saveEvent = async () => {
    let form = { ...eventForm };
    // Auto-translate event title
    if (form.title && !form.title_en) {
      form.title_en = await autoTranslate(form.title, "en");
    } else if (form.title_en && !form.title) {
      form.title = await autoTranslate(form.title_en, "bn");
    }
    const payload = { ...form, created_by: user?.id };
    if (editingEvent) { await supabase.from("events").update(payload).eq("id", editingEvent.id); }
    else { await supabase.from("events").insert(payload); }
    toast({ title: t("success"), description: t("eventSaved") });
    setEditingEvent(null);
    setEventForm({ title: "", title_en: "", date: "", time: "", location: "", description: "", tag: "", tag_color: "bg-primary text-primary-foreground", cover_image: "" });
    fetchData();
  };

  const handleSaveSettings = async (key: "general" | "appearance" | "features") => {
    setSavingSettings(true);
    const value = key === "general" ? generalForm : key === "appearance" ? appearanceForm : featuresForm;
    await updateSettings(key, value);
    toast({ title: t("success"), description: t("settingsUpdated") });
    setSavingSettings(false);
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) { toast({ title: t("error"), description: error.message, variant: "destructive" }); }
    else { toast({ title: t("success"), description: t("roleChanged") }); setUserRoles((prev) => ({ ...prev, [userId]: newRole })); }
  };

  const handleImageUpload = async (file: File, type: "post" | "event") => {
    if (file.size > 5 * 1024 * 1024) { toast({ title: t("error"), description: "Max 5MB", variant: "destructive" }); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast({ title: t("error"), description: t("invalidImageType"), variant: "destructive" }); return; }
    type === "post" ? setUploadingPostImage(true) : setUploadingEventImage(true);
    const filePath = `${type}s/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("content-images").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: t("uploadFailed"), description: uploadError.message, variant: "destructive" }); } else {
      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(filePath);
      if (type === "post") setPostForm(p => ({ ...p, cover_image: urlData.publicUrl }));
      else setEventForm(p => ({ ...p, cover_image: urlData.publicUrl }));
      toast({ title: t("success"), description: t("imageUploaded") });
    }
    type === "post" ? setUploadingPostImage(false) : setUploadingEventImage(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl bg-muted border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground";

  const sidebarItems = [
    { icon: LayoutDashboard, label: t("dashboard"), tab: "dashboard" as AdminTab },
    { icon: FileText, label: t("postManagement"), tab: "posts" as AdminTab },
    { icon: ShieldAlert, label: t("moderation"), tab: "moderation" as AdminTab },
    { icon: Calendar, label: t("eventManagement"), tab: "events" as AdminTab },
    { icon: Crown, label: t("membersAdmin"), tab: "members" as AdminTab },
    { icon: Users, label: t("memberManagement"), tab: "users" as AdminTab },
    { icon: ImagePlus, label: t("assetManager"), tab: "assets" as AdminTab },
    { icon: Palette, label: t("themeCustomization"), tab: "theme" as AdminTab },
    { icon: Settings, label: t("siteSettingsLabel"), tab: "settings" as AdminTab },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 260 : 64 }} className="bg-slate-900 text-slate-100 flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden z-40 rounded-r-3xl">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <LogoTile size="sm" glow="subtle" contained />
            {sidebarOpen && <span className="font-bengali font-bold text-sm text-white truncate">{t("adminPanel")}</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-full hover:bg-white/10 text-white shrink-0">{sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}</button>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (<button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all w-full ${activeTab === item.tab ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 ring-1 ring-white/20" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}><item.icon className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-bengali">{item.label}</span>}</button>))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"><UserPlus className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-bengali">{t("profile")}</span>}</Link>
          <Link to="/admin/health" className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"><ShieldCheck className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-bengali">Health</span>}</Link>
          <Link to="/home" className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"><Globe className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-bengali">{t("openSite")}</span>}</Link>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors w-full"><LogOut className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-bengali">{t("logout")}</span>}</button>
        </div>
      </motion.aside>


      <div className="flex-1 overflow-auto">
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-background/90">
          <h1 className="font-bengali text-lg font-bold text-foreground">{sidebarItems.find(s => s.tab === activeTab)?.label || t("dashboard")}</h1>
        </header>
        <main className="p-6">
          <HealthCheckBanner />
          {activeTab === "moderation" && <ModerationPanel />}
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ icon: Eye, label: t("totalPosts"), value: posts.length.toString(), color: "text-primary" }, { icon: Calendar, label: t("totalEvents"), value: events.length.toString(), color: "text-accent" }, { icon: UserPlus, label: t("totalMembers"), value: members.length.toString(), color: "text-accent" }, { icon: MessageSquare, label: t("totalComments"), value: "—", color: "text-muted-foreground" }].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-background rounded-3xl border border-border p-5 depth-card">
                    <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div></div>
                    <p className="font-bengali text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="font-bengali text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              {/* CMS Builder hint card (Phase 1: Hero only) */}
              <Link to="/" className="block bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/30 rounded-3xl p-5 hover:from-primary/15 hover:to-accent/15 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bengali font-bold text-foreground">Visual CMS Builder · Phase 1</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Open the landing page → click the floating pencil button → edit Hero text, visibility, presets, animations, and advanced styles inline. Draft autosaves; click Publish to go live.</p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground rotate-90 shrink-0" />
                </div>
              </Link>
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("recentPosts")}</h3>
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post) => (<div key={post.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><span className="font-bengali text-sm text-foreground">{post.title}</span><span className={`px-3 py-0.5 rounded-full text-xs ${post.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{post.published ? t("publishedStatus") : t("draftStatus")}</span></div>))}
                  {posts.length === 0 && <p className="text-sm text-muted-foreground font-bengali text-center py-4">{t("noPostsYet")}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{editingPost ? t("editPost") : t("newPost")}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder={t("titleBangla")} className={inputClass} />
                  <input value={postForm.title_en} onChange={(e) => setPostForm({ ...postForm, title_en: e.target.value })} placeholder={t("titleEnglish")} className={inputClass} />
                  <input value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} placeholder={t("categoryLabel")} className={inputClass} />
                  <input value={postForm.tags} onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })} placeholder={t("tagsCommaSeparated")} className={inputClass} />
                </div>
                <textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} placeholder={t("excerptLabel")} rows={2} className={inputClass + " mb-4 resize-none"} />
                <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder={t("contentBody")} rows={8} className={inputClass + " mb-4 resize-none"} />
                {/* Cover image upload */}
                <div className="mb-4">
                  <input ref={postImageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "post")} className="hidden" />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => postImageRef.current?.click()} disabled={uploadingPostImage} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-bengali hover:bg-secondary/80 transition-all disabled:opacity-50">
                      {uploadingPostImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {t("coverImage")}
                    </button>
                    {postForm.cover_image && <img src={postForm.cover_image} alt="" className="w-16 h-10 rounded-lg object-cover border border-border" />}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 text-sm font-bengali text-foreground"><input type="checkbox" checked={postForm.featured} onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })} className="rounded" /> {t("featuredPost")}</label>
                  <label className="flex items-center gap-2 text-sm font-bengali text-foreground"><input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })} className="rounded" /> {t("publishNow")}</label>
                  <button onClick={savePost} disabled={savingPost || !postForm.title} className="ml-auto px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">{savingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{t("save")}</button>
                </div>
              </div>
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("allPosts")}</h3>
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div><p className="font-bengali text-sm font-semibold text-foreground">{post.title}</p><p className="text-xs text-muted-foreground">{post.category}</p></div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-0.5 rounded-full text-xs ${post.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{post.published ? t("publishedStatus") : t("draftStatus")}</span>
                        <button onClick={() => { setEditingPost(post); setPostForm({ title: post.title, title_en: post.title_en || "", content: post.content || "", excerpt: post.excerpt || "", category: post.category || "সাহিত্য", tags: (post.tags || []).join(", "), youtube_url: post.youtube_url || "", featured: post.featured, published: post.published, cover_image: (post as any).cover_image || "" }); }} className="p-2 rounded-full hover:bg-secondary"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => deletePost(post.id)} className="p-2 rounded-full hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </div>
                  ))}
                  {posts.length === 0 && <p className="text-sm text-muted-foreground font-bengali text-center py-8">{t("noPostsCreateHint")}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Events */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{editingEvent ? t("editEvent") : t("newEvent")}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder={t("eventTitleLabel")} className={inputClass} />
                  <input value={eventForm.title_en} onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })} placeholder={t("titleEnglish")} className={inputClass} />
                  <input value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} placeholder={t("dateLabel")} type="date" className={inputClass} />
                  <input value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} placeholder={t("timeLabel")} className={inputClass} />
                  <input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder={t("locationLabel")} className={inputClass} />
                  <input value={eventForm.tag} onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })} placeholder={t("tagLabel")} className={inputClass} />
                </div>
                <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder={t("descriptionLabel")} rows={3} className={inputClass + " mb-4 resize-none"} />
                <button onClick={saveEvent} disabled={!eventForm.title || !eventForm.date} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali"><Save className="w-4 h-4" /> {t("save")}</button>
              </div>
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("allEventsLabel")}</h3>
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div><p className="font-bengali text-sm font-semibold text-foreground">{event.title}</p><p className="text-xs text-muted-foreground">{event.date} • {event.location}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingEvent(event); setEventForm({ title: event.title, title_en: event.title_en || "", date: event.date, time: event.time, location: event.location, description: event.description, tag: event.tag, tag_color: event.tag_color, cover_image: (event as any).cover_image || "" }); }} className="p-2 rounded-full hover:bg-secondary"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={async () => { await supabase.from("events").delete().eq("id", event.id); fetchData(); }} className="p-2 rounded-full hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-sm text-muted-foreground font-bengali text-center py-8">{t("noEventsYet")}</p>}
              </div>
            </div>
          )}

          {/* Members (organization showcase) */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{editingMember ? t("editMember") : t("newMember")}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder={t("nameBangla")} className={inputClass} />
                  <input value={memberForm.name_en} onChange={(e) => setMemberForm({ ...memberForm, name_en: e.target.value })} placeholder={t("nameEnglish")} className={inputClass} />
                  <input value={memberForm.title} onChange={(e) => setMemberForm({ ...memberForm, title: e.target.value })} placeholder={t("titleRoleBn")} className={inputClass} />
                  <input value={memberForm.title_en} onChange={(e) => setMemberForm({ ...memberForm, title_en: e.target.value })} placeholder={t("titleRoleEn")} className={inputClass} />
                  <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} className={inputClass}>
                    <option value="president">{t("rolePresident")}</option>
                    <option value="vp">{t("roleVp")}</option>
                    <option value="secretary">{t("roleSecretary")}</option>
                    <option value="cultural">{t("roleCultural")}</option>
                    <option value="treasurer">{t("roleTreasurer")}</option>
                    <option value="member">{t("roleMember")}</option>
                  </select>
                  <input type="number" value={memberForm.sort_order} onChange={(e) => setMemberForm({ ...memberForm, sort_order: Number(e.target.value) })} placeholder={t("sortOrder")} className={inputClass} />
                  <input value={memberForm.gradient_class} onChange={(e) => setMemberForm({ ...memberForm, gradient_class: e.target.value })} placeholder={t("gradientClass")} className={inputClass} />
                </div>
                <textarea value={memberForm.bio} onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })} placeholder={t("bioBangla")} rows={2} className={inputClass + " mb-3 resize-none"} />
                <textarea value={memberForm.bio_en} onChange={(e) => setMemberForm({ ...memberForm, bio_en: e.target.value })} placeholder={t("bioEnglish")} rows={2} className={inputClass + " mb-4 resize-none"} />
                <div className="mb-4">
                  <input ref={memberAvatarRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleMemberAvatarUpload(e.target.files[0])} className="hidden" />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => memberAvatarRef.current?.click()} disabled={uploadingMemberAvatar} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-bengali hover:bg-secondary/80 transition-all disabled:opacity-50">
                      {uploadingMemberAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {t("avatarImage")}
                    </button>
                    {memberForm.avatar_url && <img src={memberForm.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-border" />}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 text-sm font-bengali text-foreground"><input type="checkbox" checked={memberForm.is_senior} onChange={(e) => setMemberForm({ ...memberForm, is_senior: e.target.checked })} className="rounded" /> {t("isSenior")}</label>
                  <label className="flex items-center gap-2 text-sm font-bengali text-foreground"><input type="checkbox" checked={memberForm.is_active} onChange={(e) => setMemberForm({ ...memberForm, is_active: e.target.checked })} className="rounded" /> {t("isActive")}</label>
                  <label className="flex items-center gap-2 text-sm font-bengali text-foreground"><input type="checkbox" checked={memberForm.is_approved} onChange={(e) => setMemberForm({ ...memberForm, is_approved: e.target.checked })} className="rounded" /> {t("isApproved")}</label>
                  {editingMember && <button onClick={() => { setEditingMember(null); setMemberForm({ ...emptyMemberForm }); }} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-bengali"><Plus className="w-4 h-4 inline mr-1" />{t("newMember")}</button>}
                  <button onClick={saveMember} disabled={savingMember || (!memberForm.name && !memberForm.name_en)} className="ml-auto px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">{savingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{t("save")}</button>
                </div>
              </div>
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("allMembersLabel")}</h3>
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.gradient_class} flex items-center justify-center overflow-hidden shrink-0`}>
                          {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="font-bengali text-sm font-bold text-primary-foreground">{(m.name || "?").charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bengali text-sm font-semibold text-foreground truncate">{m.name} <span className="text-xs text-muted-foreground">/ {m.name_en}</span></p>
                          <p className="text-xs text-muted-foreground truncate">{m.title} • #{m.sort_order} {m.is_senior ? "• ★" : ""} {!m.is_active ? "• ✕" : ""} {m.is_approved === false ? `• ${t("pending")}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => reorderMember(m, "up")} className="p-2 rounded-full hover:bg-secondary" title="↑"><ChevronUp className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => reorderMember(m, "down")} className="p-2 rounded-full hover:bg-secondary" title="↓"><ChevronDown className="w-4 h-4 text-muted-foreground" /></button>
                        {m.is_approved === false && <button onClick={() => updateAsset && supabase.from("members").update({ is_approved: true }).eq("id", m.id).then(() => { toast({ title: t("approvedToast") }); fetchData(); })} className="p-2 rounded-full hover:bg-primary/10" title={t("approve")}><Check className="w-4 h-4 text-primary" /></button>}
                        <button onClick={() => { setEditingMember(m); setMemberForm({ name: m.name || "", name_en: m.name_en || "", title: m.title || "", title_en: m.title_en || "", bio: m.bio || "", bio_en: m.bio_en || "", role: m.role || "member", avatar_url: m.avatar_url || "", gradient_class: m.gradient_class || "from-primary to-crimson", sort_order: m.sort_order || 0, is_senior: !!m.is_senior, is_active: !!m.is_active, is_approved: m.is_approved !== false }); }} className="p-2 rounded-full hover:bg-secondary"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => deleteMember(m.id)} className="p-2 rounded-full hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && <p className="text-sm text-muted-foreground font-bengali text-center py-8">{t("noMembersYet")}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Asset Manager */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="font-bengali font-bold text-foreground">{t("assetManager")}</h3>
                  <div className="ml-auto flex flex-wrap gap-2">
                    {ASSET_SLOTS.map((s) => (
                      <button key={s} onClick={() => setAssetSlotFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-bengali transition-all ${assetSlotFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t(`slot_${s}`)}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center mb-4">
                  <input value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} placeholder={t("assetName")} className={inputClass + " flex-1 min-w-[200px]"} />
                  <input ref={assetUploadRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0])} className="hidden" />
                  <button onClick={() => assetUploadRef.current?.click()} disabled={uploadingAsset} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">
                    {uploadingAsset ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {t("uploadToSlot", )} ({t(`slot_${assetSlotFilter}`)})
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-bengali mb-4">{t("assetManagerHint")}</p>
              </div>

              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t(`slot_${assetSlotFilter}`)} — {assets.filter(a => a.slot === assetSlotFilter).length}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets.filter((a) => a.slot === assetSlotFilter).sort((x, y) => x.sort_order - y.sort_order).map((a) => (
                    <div key={a.id} className="rounded-2xl border border-border overflow-hidden bg-muted/30 group relative">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
                        {!a.is_active && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="text-xs font-bengali text-muted-foreground">{t("inactive")}</span></div>}
                      </div>
                      <div className="p-3 space-y-2">
                        <input value={a.name} onChange={(e) => setAssets(prev => prev.map(x => x.id === a.id ? { ...x, name: e.target.value } : x))} onBlur={(e) => updateAsset(a.id, { name: e.target.value })} className="w-full text-xs font-bengali px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex gap-0.5">
                            <button onClick={() => reorderAsset(a, "up")} className="p-1 rounded hover:bg-secondary"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => reorderAsset(a, "down")} className="p-1 rounded hover:bg-secondary"><ChevronDown className="w-3.5 h-3.5" /></button>
                          </div>
                          <span className="text-[10px] text-muted-foreground">#{a.sort_order}</span>
                          <div className="flex gap-0.5">
                            <button onClick={() => updateAsset(a.id, { is_active: !a.is_active })} className="p-1 rounded hover:bg-secondary" title={a.is_active ? t("deactivate") : t("activate")}><Eye className={`w-3.5 h-3.5 ${a.is_active ? "text-primary" : "text-muted-foreground"}`} /></button>
                            <button onClick={() => navigator.clipboard.writeText(a.image_url).then(() => toast({ title: t("copied") }))} className="p-1 rounded hover:bg-secondary" title={t("copyUrl")}><Globe className="w-3.5 h-3.5 text-muted-foreground" /></button>
                            <button onClick={() => deleteAsset(a.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {assets.filter((a) => a.slot === assetSlotFilter).length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground font-bengali text-center py-8">{t("noAssetsInSlot")}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="bg-background rounded-3xl border border-border p-6 depth-card">
              <h3 className="font-bengali font-bold text-foreground mb-4">{t("memberManagement")}</h3>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="font-bengali text-sm font-bold">{(u.full_name || "?").charAt(0)}</span>}
                      </div>
                      <div>
                        <p className="font-bengali text-sm font-semibold text-foreground">{u.full_name || t("noName")}</p>
                        <p className="text-xs text-muted-foreground">{u.position || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        <select
                          value={userRoles[u.id] || "user"}
                          onChange={(e) => changeUserRole(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          className="px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground disabled:opacity-50"
                        >
                          <option value="user">{t("roleUser")}</option>
                          <option value="moderator">{t("roleModerator")}</option>
                          <option value="admin">{t("roleAdmin")}</option>
                        </select>
                      </div>
                      <Link to={`/profile/${u.id}`} className="text-xs text-primary hover:underline font-bengali">{t("profile")}</Link>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-muted-foreground font-bengali text-center py-8">{t("noMembersYet")}</p>}
              </div>
            </div>
          )}

          {/* Theme */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-1">{t("heritagePalette")}</h3>
                <p className="text-xs text-muted-foreground mb-4 font-bengali">{t("heritagePaletteDesc")}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {([
                    { id: "crimson",  labelKey: "paletteCrimson"  as const, primary: "350 65% 42%", accent: "40 78% 52%" },
                    { id: "forest",   labelKey: "paletteForest"   as const, primary: "152 55% 30%", accent: "42 85% 55%" },
                    { id: "royal",    labelKey: "paletteRoyal"    as const, primary: "222 70% 42%", accent: "35 90% 55%" },
                    { id: "marigold", labelKey: "paletteMarigold" as const, primary: "22 85% 50%",  accent: "45 90% 55%" },
                    { id: "magenta",  labelKey: "paletteMagenta"  as const, primary: "320 70% 48%", accent: "45 85% 58%" },
                    { id: "midnight", labelKey: "paletteMidnight" as const, primary: "248 55% 38%", accent: "190 85% 58%" },
                    { id: "saffron",  labelKey: "paletteSaffron"  as const, primary: "32 90% 50%",  accent: "350 70% 50%" },
                    { id: "ocean",    labelKey: "paletteOcean"    as const, primary: "188 65% 38%", accent: "12 80% 58%" },
                    { id: "rose",     labelKey: "paletteRose"     as const, primary: "338 70% 52%", accent: "38 85% 60%" },
                    { id: "emerald",  labelKey: "paletteEmerald"  as const, primary: "162 70% 32%", accent: "38 90% 55%" },
                  ] as const).map((p) => {
                    const active = ((appearanceForm as any).palette ?? "crimson") === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAppearanceForm({ ...appearanceForm, palette: p.id } as any)}
                        className={`palette-card group relative rounded-2xl border-2 p-3 text-left transition-all palette-depth ${active ? "palette-card-active border-primary shadow-lg shadow-primary/30" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="palette-card-swatch h-12 w-full rounded-xl mb-2 relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${p.primary}), hsl(${p.accent}))` }}>
                          <span className="palette-card-layer-back absolute inset-0" style={{ background: `radial-gradient(70% 60% at 20% 10%, hsl(${p.primary} / 0.55), transparent 70%)` }} />
                          <span className="palette-card-layer-mid absolute inset-0" style={{ background: `linear-gradient(135deg, transparent 30%, hsl(${p.accent} / 0.35) 100%)` }} />
                          <span className="palette-card-layer-front absolute inset-0" style={{ background: `radial-gradient(45% 40% at 80% 80%, hsl(${p.accent} / 0.7), transparent 70%)` }} />
                        </div>
                        <div className="font-bengali text-xs font-semibold text-foreground">{t(p.labelKey)}</div>
                        {active && <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary shadow ring-2 ring-background animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("appearanceSettings")}</h3>
                <div className="space-y-4">
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("heroStyle")}</label>
                    <select value={appearanceForm.hero_style} onChange={(e) => setAppearanceForm({ ...appearanceForm, hero_style: e.target.value })} className={inputClass}>
                      <option value="default">{t("defaultStyle")}</option>
                      <option value="minimal">{t("minimalStyle")}</option>
                      <option value="cinematic">{t("cinematicStyle")}</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-bengali text-foreground">
                    <input type="checkbox" checked={appearanceForm.show_particles} onChange={(e) => setAppearanceForm({ ...appearanceForm, show_particles: e.target.checked })} className="rounded" />
                    {t("showParticles")}
                  </label>
                  <button onClick={() => handleSaveSettings("appearance")} disabled={savingSettings} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("save")}
                  </button>
                </div>
              </div>

              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bengali font-bold text-foreground">{t("livePreview")}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewDevice("desktop")} className={`p-2 rounded-full ${previewDevice === "desktop" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><Monitor className="w-4 h-4" /></button>
                    <button onClick={() => setPreviewDevice("mobile")} className={`p-2 rounded-full ${previewDevice === "mobile" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><Smartphone className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className={`border border-border rounded-2xl overflow-hidden mx-auto transition-all ${previewDevice === "mobile" ? "max-w-[375px]" : "w-full"}`}>
                  <iframe src="/" className="w-full h-[500px] rounded-2xl" title={t("livePreview")} />
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("generalSettings")}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("siteNameBnLabel")}</label><input value={generalForm.site_name_bn} onChange={(e) => setGeneralForm({ ...generalForm, site_name_bn: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("siteNameEnLabel")}</label><input value={generalForm.site_name_en} onChange={(e) => setGeneralForm({ ...generalForm, site_name_en: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("taglineBnLabel")}</label><input value={generalForm.tagline_bn} onChange={(e) => setGeneralForm({ ...generalForm, tagline_bn: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("taglineEnLabel")}</label><input value={generalForm.tagline_en} onChange={(e) => setGeneralForm({ ...generalForm, tagline_en: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("contactEmailLabel")}</label><input value={generalForm.contact_email} onChange={(e) => setGeneralForm({ ...generalForm, contact_email: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div><label className="text-xs text-muted-foreground font-bengali">{t("contactPhoneLabel")}</label><input value={generalForm.contact_phone} onChange={(e) => setGeneralForm({ ...generalForm, contact_phone: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground font-bengali">{t("addressBnLabel")}</label><input value={generalForm.address_bn} onChange={(e) => setGeneralForm({ ...generalForm, address_bn: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground font-bengali">{t("addressEnLabel")}</label><input value={generalForm.address_en} onChange={(e) => setGeneralForm({ ...generalForm, address_en: e.target.value })} className={inputClass + " mt-1"} /></div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground font-bengali">{t("siteLogo")}</label>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <button type="button" onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/svg+xml,image/webp'; input.onchange = async (e: any) => { const file = e.target.files?.[0]; if (!file) return; const filePath = `logo/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from('content-images').upload(filePath, file, { upsert: true }); if (!error) { const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(filePath); setGeneralForm(f => ({ ...f, logo_url: urlData.publicUrl })); toast({ title: t('success'), description: t('imageUploaded') }); } }; input.click(); }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-bengali hover:bg-secondary/80 transition-all">
                        <ImagePlus className="w-4 h-4" /> {t("siteLogo")}
                      </button>
                      {generalForm.logo_url && <img src={generalForm.logo_url} alt="" className="h-8 object-contain" />}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground font-bengali">{t("logoHaloIntensity")}</label>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {(["off", "subtle", "normal", "bold"] as const).map((g) => {
                        const active = ((appearanceForm as any).logo_glow ?? "normal") === g;
                        const labelKey = (
                          { off: "haloOff", subtle: "haloSubtle", normal: "haloNormal", bold: "haloBold" } as const
                        )[g];
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setAppearanceForm({ ...appearanceForm, logo_glow: g } as any)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-bengali transition-all ${active ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                          >
                            {t(labelKey)}
                          </button>
                        );
                      })}
                      <button onClick={() => handleSaveSettings("appearance")} disabled={savingSettings} className="ml-auto px-4 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold font-bengali hover:bg-primary transition-all flex items-center gap-1.5 disabled:opacity-50">
                        {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {t("apply")}
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground font-bengali">
                      {t("logoDilation")}{" "}
                      <span className="text-[10px] opacity-70 font-bengali">{t("logoDilationHint")}</span>
                    </label>
                    {(() => {
                      const DILATE_MIN = 0;
                      const DILATE_MAX = 20;
                      const DILATE_DEFAULT = 8;
                      const raw = (appearanceForm as any).logo_dilate;
                      const current =
                        typeof raw === "number" && Number.isFinite(raw)
                          ? Math.min(DILATE_MAX, Math.max(DILATE_MIN, raw))
                          : DILATE_DEFAULT;
                      const clamp = (n: number) =>
                        Number.isFinite(n)
                          ? Math.min(DILATE_MAX, Math.max(DILATE_MIN, Math.round(n * 10) / 10))
                          : DILATE_DEFAULT;
                      return (
                        <div className="flex items-center gap-3 mt-1">
                          <input
                            type="range"
                            min={DILATE_MIN}
                            max={DILATE_MAX}
                            step={0.5}
                            value={current}
                            onChange={(e) =>
                              setAppearanceForm({
                                ...appearanceForm,
                                logo_dilate: clamp(parseFloat(e.target.value)),
                              } as any)
                            }
                            className="flex-1 accent-primary"
                          />
                          <input
                            type="number"
                            min={DILATE_MIN}
                            max={DILATE_MAX}
                            step={0.5}
                            inputMode="decimal"
                            value={current}
                            onChange={(e) => {
                              const next = clamp(parseFloat(e.target.value));
                              setAppearanceForm({
                                ...appearanceForm,
                                logo_dilate: next,
                              } as any);
                            }}
                            onBlur={(e) => {
                              // Re-clamp on blur so any out-of-range typed value snaps back.
                              const next = clamp(parseFloat(e.target.value));
                              setAppearanceForm({
                                ...appearanceForm,
                                logo_dilate: next,
                              } as any);
                            }}
                            className={`${inputClass} w-20 text-center`}
                            aria-label="Logo background dilation radius"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAppearanceForm({
                                ...appearanceForm,
                                logo_dilate: DILATE_DEFAULT,
                              } as any)
                            }
                            className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                          >
                            {t("reset")}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <button onClick={() => handleSaveSettings("general")} disabled={savingSettings} className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("save")}
                </button>
              </div>

              <div className="bg-background rounded-3xl border border-border p-6 depth-card">
                <h3 className="font-bengali font-bold text-foreground mb-4">{t("featureToggles")}</h3>
                <div className="space-y-3">
                  {[
                    { key: "enable_blog" as const, label: t("blog") },
                    { key: "enable_events" as const, label: t("events") },
                    { key: "enable_courses" as const, label: t("courses") },
                    { key: "enable_members" as const, label: t("members") },
                    { key: "maintenance_mode" as const, label: t("maintenanceModeLabel") },
                  ].map((feat) => (
                    <label key={feat.key} className="flex items-center justify-between py-2">
                      <span className="text-sm font-bengali text-foreground">{feat.label}</span>
                      <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${featuresForm[feat.key] ? "bg-primary" : "bg-muted-foreground/30"}`} onClick={() => setFeaturesForm({ ...featuresForm, [feat.key]: !featuresForm[feat.key] })}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow-md transition-transform ${featuresForm[feat.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                  ))}
                </div>
                <button onClick={() => handleSaveSettings("features")} disabled={savingSettings} className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-bengali">
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("save")}
                </button>
              </div>
              <SettingsHistoryPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
