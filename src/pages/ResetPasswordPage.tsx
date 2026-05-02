import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PasswordStrength from "@/components/PasswordStrength";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPwd) {
      toast({ title: t("passwordMismatch"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: t("resetPasswordTitle"), description: error.message, variant: "destructive" });
      } else {
        setSuccess(true);
        toast({ title: t("passwordUpdated"), description: t("passwordUpdatedDesc") });
        setTimeout(() => navigate("/home"), 2000);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {success ? <CheckCircle className="w-7 h-7 text-primary" /> : <Lock className="w-7 h-7 text-primary" />}
          </div>
          <h1 className="font-bengali text-2xl font-bold text-foreground mb-2 text-center">{t("resetPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-6 font-bengali text-center">
            {success ? t("passwordUpdatedDesc") : t("resetPasswordSubtitle")}
          </p>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("newPassword")} required minLength={6} className="w-full pl-11 pr-12 py-3 rounded-full bg-secondary/50 border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={t("confirmPassword")} required minLength={6} className="w-full pl-11 pr-4 py-3 rounded-full bg-secondary/50 border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("updatePassword")}
              </button>
            </form>
          ) : (
            <Link to="/login" className="block w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm text-center hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20">
              {t("backToLogin")}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
