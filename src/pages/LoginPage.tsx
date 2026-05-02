import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PasswordStrength from "@/components/PasswordStrength";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import demoLogo from "@/assets/demo-logo.png";

type AuthView = "login" | "signup" | "otp";

const LoginPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLanguage();
  const { signIn } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) {
        toast({ title: lang === "bn" ? "নিবন্ধন ব্যর্থ" : "Signup failed", description: error.message, variant: "destructive" });
        return;
      }
      // Detect "user already exists" — Supabase returns a user object with no identities
      const identities = (data?.user as any)?.identities;
      if (data?.user && Array.isArray(identities) && identities.length === 0) {
        toast({
          title: lang === "bn" ? "ইমেইল ইতিমধ্যে নিবন্ধিত" : "Email already registered",
          description: lang === "bn" ? "অনুগ্রহ করে লগইন করুন" : "Please sign in instead",
          variant: "destructive",
        });
        setView("login");
        return;
      }
      // If session is returned, signup auto-confirmed → straight to app
      if (data?.session) {
        navigate("/home");
        return;
      }
      toast({
        title: lang === "bn" ? "OTP পাঠানো হয়েছে" : "OTP sent",
        description: lang === "bn" ? "আপনার ইমেইলে কোড পাঠানো হয়েছে" : "Check your email for the verification code",
      });
      setView("otp");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });
      if (error) {
        toast({ title: lang === "bn" ? "যাচাই ব্যর্থ" : "Verification failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: lang === "bn" ? "সফল!" : "Success!", description: lang === "bn" ? "অ্যাকাউন্ট যাচাই হয়েছে" : "Account verified successfully" });
        navigate("/home");
      }
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast({ title: lang === "bn" ? "লগইন ব্যর্থ" : "Login failed", description: error.message, variant: "destructive" });
      } else {
        // Check role and route admins/moderators to dashboard
        let dest = "/home";
        const uid = data?.user?.id;
        if (uid) {
          const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", uid)
            .maybeSingle();
          const role = (roleRow as any)?.role;
          if (role === "admin" || role === "moderator") dest = "/admin";
        }
        toast({ title: lang === "bn" ? "সফলভাবে লগইন হয়েছে" : "Signed in successfully" });
        navigate(dest);
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { toast({ title: lang === "bn" ? "গুগল লগইন ব্যর্থ" : "Google login failed", description: String(error.message), variant: "destructive" }); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast({ title: lang === "bn" ? "পুনরায় পাঠাতে ব্যর্থ" : "Resend failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: lang === "bn" ? "কোড পাঠানো হয়েছে" : "Code resent" });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex w-1/2 bg-hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 alpona-pattern opacity-20" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center relative z-10">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <img src={settings.general.logo_url || demoLogo} alt="" className="max-w-full max-h-full object-contain" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 12px rgba(255,255,255,0.6))' }} />
          </div>
          <h2 className="font-bengali text-3xl font-bold text-primary-foreground mb-4 drop-shadow-lg">{lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn}</h2>
          <p className="font-bengali text-primary-foreground/70 max-w-md">{t("heroSubtitle")}</p>
        </motion.div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 font-bengali px-4 py-1.5 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("backToHome")}
          </Link>

          <AnimatePresence mode="wait">
            {/* OTP Verification View */}
            {view === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-bengali text-2xl font-bold text-foreground mb-2">
                  {lang === "bn" ? "OTP যাচাইকরণ" : "OTP Verification"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6 font-bengali">
                  {lang === "bn" ? `${email} ইমেইলে কোড পাঠানো হয়েছে` : `Code sent to ${email}`}
                </p>
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="flex justify-center">
                    <InputOTP maxLength={8} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={1} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={2} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={3} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={4} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={5} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={6} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                        <InputOTPSlot index={7} className="w-10 h-12 text-lg rounded-xl border-border bg-card" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <button type="submit" disabled={loading || otpCode.length < 6} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {lang === "bn" ? "যাচাই করুন" : "Verify"}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-xs text-primary hover:underline font-bengali">
                      {lang === "bn" ? "পুনরায় কোড পাঠান" : "Resend code"}
                    </button>
                  </div>
                </form>
                <button onClick={() => setView("signup")} className="mt-4 text-xs text-muted-foreground hover:text-foreground font-bengali flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> {lang === "bn" ? "পিছনে যান" : "Go back"}
                </button>
              </motion.div>
            )}

            {/* Login View */}
            {view === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-bengali text-2xl font-bold text-foreground mb-2">{t("loginTitle")}</h1>
                <p className="text-sm text-muted-foreground mb-8 font-bengali">{t("loginSubtitle")}</p>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} required className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} required minLength={6} className="w-full pl-11 pr-12 py-3 rounded-full bg-card border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline font-bengali">{t("forgotPassword")}</Link>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("login")}
                  </button>
                </form>
                <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground font-bengali">{t("orContinueWith")}</span><div className="flex-1 h-px bg-border" /></div>
                <button onClick={handleGoogleSignIn} className="w-full py-3 rounded-full border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2 depth-card">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {t("continueWithGoogle")}
                </button>
                <p className="text-center text-sm text-muted-foreground mt-6 font-bengali">
                  {t("noAccount")} <button onClick={() => setView("signup")} className="text-primary hover:underline font-semibold">{t("signup")}</button>
                </p>
              </motion.div>
            )}

            {/* Signup View */}
            {view === "signup" && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-bengali text-2xl font-bold text-foreground mb-2">{t("signupTitle")}</h1>
                <p className="text-sm text-muted-foreground mb-8 font-bengali">{t("signupSubtitle")}</p>
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("fullName")} required className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} required className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} required minLength={6} className="w-full pl-11 pr-12 py-3 rounded-full bg-card border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <PasswordStrength password={password} />
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("signup")}
                  </button>
                </form>
                <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground font-bengali">{t("orContinueWith")}</span><div className="flex-1 h-px bg-border" /></div>
                <button onClick={handleGoogleSignIn} className="w-full py-3 rounded-full border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2 depth-card">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {t("continueWithGoogle")}
                </button>
                <p className="text-center text-sm text-muted-foreground mt-6 font-bengali">
                  {t("hasAccount")} <button onClick={() => setView("login")} className="text-primary hover:underline font-semibold">{t("login")}</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
