import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: t("forgotPasswordTitle"), description: error.message, variant: "destructive" });
      } else {
        setSent(true);
        toast({ title: t("resetLinkSent"), description: t("resetLinkSentDesc") });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 font-bengali px-4 py-1.5 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("backToLogin")}
        </Link>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {sent ? <CheckCircle className="w-7 h-7 text-primary" /> : <Mail className="w-7 h-7 text-primary" />}
          </div>

          <h1 className="font-bengali text-2xl font-bold text-foreground mb-2 text-center">{t("forgotPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-6 font-bengali text-center">
            {sent ? t("resetLinkSentDesc") : t("forgotPasswordSubtitle")}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email")}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-secondary/50 border border-border text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-crimson-dark transition-all font-bengali shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("sendResetLink")}
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

export default ForgotPasswordPage;
