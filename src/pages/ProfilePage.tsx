import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Edit3, Save, Camera, Shield, Crown, Star, Sun, Moon, Loader2, ShieldCheck, FileEdit } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import ContentCreator from "@/components/profile/ContentCreator";
import MemberPostComposer from "@/components/profile/MemberPostComposer";
import CorrectionRequestModal from "@/components/common/CorrectionRequestModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { id } = useParams();
  const { user, profile, role, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwnProfile = !id || id === user?.id;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name: "", display_name: "", bio: "", phone: "", avatar_url: "" });
  const [viewProfile, setViewProfile] = useState<any>(null);
  const [linkedMember, setLinkedMember] = useState<any>(null);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOwnProfile && profile) {
      setForm({
        full_name: profile.full_name,
        display_name: profile.display_name,
        bio: profile.bio,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      });
    } else if (id) {
      (supabase.from("profiles") as any)
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }: any) => {
          if (data) setViewProfile(data);
        });
    }
  }, [profile, id, isOwnProfile]);

  useEffect(() => {
    if (user && isOwnProfile) {
      supabase
        .from("members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setLinkedMember(data);
        });
    }
  }, [user, isOwnProfile]);

  useEffect(() => {
    if (!user && isOwnProfile) navigate("/login");
  }, [user, isOwnProfile, navigate]);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("error"), description: t("fileSizeTooLarge"), variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: t("error"), description: t("invalidImageType"), variant: "destructive" });
      return;
    }
    setUploading(true);
    const filePath = `${user.id}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").remove([filePath]);
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: t("uploadFailed"), description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatar_url = urlData.publicUrl;
    const { error: updateError } = await (supabase.from("profiles") as any).update({ avatar_url }).eq("id", user.id);
    if (updateError) {
      toast({ title: t("error"), description: updateError.message, variant: "destructive" });
    } else {
      // Also sync to linked council member profile if exists!
      if (linkedMember) {
        await supabase.from("members").update({ avatar_url }).eq("id", linkedMember.id);
      }
      setForm((prev) => ({ ...prev, avatar_url }));
      toast({ title: t("success"), description: t("profileImageUpdated") });
      await refreshProfile();
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase.from("profiles") as any).update(form).eq("id", user.id);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("success"), description: t("profileUpdated") });
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const displayProfile = isOwnProfile ? profile : viewProfile;
  if (!displayProfile) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  const RoleIcon = role === "admin" ? Crown : role === "moderator" ? Shield : Star;
  const canCreateContent = role === "admin" || role === "moderator";
  const roleLabel = role === "admin" ? t("roleAdmin") : role === "moderator" ? t("roleModerator") : t("roleUser");

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div
                className={`w-28 h-28 rounded-full bg-gradient-to-br ${
                  displayProfile.gradient_class || "from-primary to-crimson"
                } flex items-center justify-center text-primary-foreground text-4xl font-bengali font-bold shadow-2xl border-4 border-primary-foreground/20 overflow-hidden`}
              >
                {(isOwnProfile ? form.avatar_url : displayProfile.avatar_url) ? (
                  <img
                    src={isOwnProfile ? form.avatar_url : displayProfile.avatar_url}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  displayProfile.full_name?.charAt(0) || "?"
                )}
              </div>
              {isOwnProfile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title={lang === "en" ? "Update Profile Photo" : "ছবি পরিবর্তন করুন"}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-bengali text-2xl md:text-3xl font-bold text-primary-foreground drop-shadow-lg">
                {displayProfile.display_name || displayProfile.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
                {role && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold font-bengali">
                    <RoleIcon className="w-3.5 h-3.5" /> {roleLabel}
                  </span>
                )}
                {linkedMember && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold font-bengali border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />{" "}
                    {lang === "en" ? "Council Member: " : "পরিষদ সদস্য: "}
                    {linkedMember.title || linkedMember.role}
                  </span>
                )}
                {role === "admin" && isOwnProfile && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold hover:bg-primary-foreground/30 transition-colors font-bengali"
                  >
                    <Shield className="w-3.5 h-3.5" /> {t("adminPanel")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {isOwnProfile && canCreateContent && <ContentCreator />}
          {isOwnProfile && !canCreateContent && <MemberPostComposer />}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl border border-border p-6 shadow-sm"
          >
            {/* If linked to Council Member, show verified governance banner */}
            {isOwnProfile && linkedMember && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs font-bengali space-y-1">
                  <p className="font-bold text-foreground">
                    {lang === "en" ? "Official Verified Council Profile" : "অফিসিয়াল কার্যকরী পরিষদ সদস্য প্রোফাইল"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {lang === "en"
                      ? "Your profile avatar can be updated directly above. Official name, designation, and bio records are managed under Parishad administration. To request modifications, submit a Change Request with explanation notes."
                      : "আপনার প্রোফাইল ছবি উপরের ক্যামেরা আইকন থেকে সরাসরি পরিবর্তন করতে পারেন। পরিষদের আনুষ্ঠানিক নথির নির্ভুলতা বজায় রাখতে নাম, পদবী বা বিবরণ পরিবর্তনের জন্য অ্যাডমিনের নিকট সংশোধনের আবেদন করতে পারবেন।"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bengali text-lg font-bold text-foreground">{t("profileInfo")}</h2>

              {isOwnProfile && (
                <>
                  {linkedMember ? (
                    <button
                      type="button"
                      onClick={() => setCorrectionModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold font-bengali transition-all active:scale-95 shadow-xs"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Request Correction" : "সংশোধনের আবেদন"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => (editing ? handleSave() : setEditing(true))}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-all shadow-md"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editing ? (
                        <Save className="w-4 h-4" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                      {editing ? t("save") : t("edit")}
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              {[
                { icon: User, label: t("fullName"), key: "full_name" as const },
                { icon: User, label: t("displayName"), key: "display_name" as const },
                { icon: Phone, label: t("phone"), key: "phone" as const },
              ].map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <field.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-bengali">{field.label}</label>
                    {editing && !linkedMember ? (
                      <input
                        type="text"
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full px-4 py-2 rounded-full bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1 text-foreground"
                      />
                    ) : (
                      <p className="text-sm text-foreground font-bengali">
                        {linkedMember && field.key === "full_name"
                          ? linkedMember.name
                          : form[field.key] || "—"}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground font-bengali">{t("bio")}</label>
                  {editing && !linkedMember ? (
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1 resize-none text-foreground"
                    />
                  ) : (
                    <p className="text-sm text-foreground font-bengali">
                      {linkedMember?.bio || form.bio || "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-3xl border border-border p-6 shadow-sm"
            >
              <h2 className="font-bengali text-lg font-bold text-foreground mb-6">{t("settings")}</h2>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-bengali text-sm text-foreground">{t("themeLabel")}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bengali transition-all ${
                      theme === "light"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t("light")}
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bengali transition-all ${
                      theme === "dark"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t("dark")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Correction Request Modal for Council Member Profile */}
      {correctionModalOpen && linkedMember && (
        <CorrectionRequestModal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          targetType="member"
          targetId={linkedMember.id}
          targetTitle={linkedMember.name}
          initialData={{
            name: linkedMember.name,
            name_en: linkedMember.name_en,
            title: linkedMember.title || linkedMember.role,
            title_en: linkedMember.title_en || linkedMember.role_en,
            bio: linkedMember.bio,
            phone: linkedMember.phone || form.phone,
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
