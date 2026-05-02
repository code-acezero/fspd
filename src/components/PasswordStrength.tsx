import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const { lang } = useLanguage();

  const rules = useMemo(() => [
    { label: lang === "bn" ? "৬+ অক্ষর" : "6+ characters", met: password.length >= 6 },
    { label: lang === "bn" ? "বড় হাতের অক্ষর" : "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: lang === "bn" ? "ছোট হাতের অক্ষর" : "Lowercase letter", met: /[a-z]/.test(password) },
    { label: lang === "bn" ? "সংখ্যা" : "Number", met: /[0-9]/.test(password) },
    { label: lang === "bn" ? "বিশেষ চিহ্ন" : "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ], [password, lang]);

  const strength = rules.filter(r => r.met).length;
  const strengthLabel = strength <= 1 ? (lang === "bn" ? "দুর্বল" : "Weak") : strength <= 3 ? (lang === "bn" ? "মাঝারি" : "Medium") : (lang === "bn" ? "শক্তিশালী" : "Strong");
  const strengthColor = strength <= 1 ? "bg-destructive" : strength <= 3 ? "bg-accent" : "bg-forest";

  if (!password) return null;

  return (
    <div className="space-y-2 px-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-muted"}`} />
        ))}
      </div>
      <p className={`text-[10px] font-bengali font-semibold ${strength <= 1 ? "text-destructive" : strength <= 3 ? "text-accent" : "text-forest"}`}>{strengthLabel}</p>
      <div className="grid grid-cols-2 gap-1">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {rule.met ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-muted-foreground" />}
            <span className={`text-[10px] font-bengali ${rule.met ? "text-foreground" : "text-muted-foreground"}`}>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
