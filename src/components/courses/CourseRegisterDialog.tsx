import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(40),
  notes: z.string().trim().max(500).optional().default(""),
});

interface Props {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onClose: () => void;
}

const CourseRegisterDialog = ({ courseId, courseTitle, open, onClose }: Props) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });
  const [existing, setExisting] = useState<any | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setForm((f) => ({
      ...f,
      full_name: profile?.full_name || profile?.display_name || "",
      email: user.email || "",
      phone: profile?.phone || "",
    }));
    (async () => {
      const { data } = await supabase
        .from("course_registrations")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();
      setExisting(data);
    })();
  }, [open, user, profile, courseId]);

  const submit = async () => {
    if (!user) { navigate("/login"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: t("error"), description: parsed.error.errors[0]?.message || "Invalid input", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("course_registrations")
      .insert({ course_id: courseId, user_id: user.id, ...parsed.data, status: "pending" } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card rounded-3xl border border-border p-6 w-full max-w-md depth-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bengali font-bold text-foreground">{t("registerForCourse")}</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground font-bengali mb-4">{courseTitle}</p>

            {!user ? (
              <div className="text-center py-6">
                <p className="font-bengali text-sm text-foreground mb-4">{t("loginToRegister")}</p>
                <Link to="/login" onClick={onClose} className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold font-bengali">{t("login")}</Link>
              </div>
            ) : existing ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-forest mx-auto mb-3" />
                <p className="font-bengali text-sm font-semibold text-foreground">{t("alreadyRegistered")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("statusLabel")}: {existing.status}</p>
              </div>
            ) : done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-forest mx-auto mb-3" />
                <p className="font-bengali text-sm font-semibold text-foreground">{t("registrationSubmitted")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(["full_name", "email", "phone"] as const).map((k) => (
                  <input
                    key={k}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder={t(k === "full_name" ? "fullName" : k === "email" ? "email" : "phone")}
                    className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ))}
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("registrationNotes")}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold font-bengali hover:bg-primary/80 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("submitRegistration")}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseRegisterDialog;
