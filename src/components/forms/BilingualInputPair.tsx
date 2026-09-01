import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Loader2, ArrowRightLeft } from "lucide-react";
import { translateText } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

interface BilingualInputPairProps {
  label?: string;
  valueBn: string;
  valueEn: string;
  onChangeBn: (val: string) => void;
  onChangeEn: (val: string) => void;
  placeholderBn?: string;
  placeholderEn?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  inputClass?: string;
  autoTranslateDefault?: boolean;
}

export const BilingualInputPair: React.FC<BilingualInputPairProps> = ({
  label,
  valueBn,
  valueEn,
  onChangeBn,
  onChangeEn,
  placeholderBn = "বাংলায় লিখুন...",
  placeholderEn = "Write in English...",
  multiline = false,
  rows = 3,
  className = "",
  inputClass = "w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
  autoTranslateDefault = true,
}) => {
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(autoTranslateDefault);
  const [translatingToBn, setTranslatingToBn] = useState(false);
  const [translatingToEn, setTranslatingToEn] = useState(false);

  // Keep track of which input the user actively typed in
  const lastEdited = useRef<"bn" | "en" | null>(null);

  // Auto-translate from BN to EN
  useEffect(() => {
    if (!autoSync || lastEdited.current !== "bn" || !valueBn.trim()) return;

    const timer = setTimeout(async () => {
      setTranslatingToEn(true);
      const en = await translateText(valueBn, "bn", "en");
      setTranslatingToEn(false);
      if (en && (!valueEn.trim() || autoSync)) {
        onChangeEn(en);
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [valueBn, autoSync]);

  // Auto-translate from EN to BN
  useEffect(() => {
    if (!autoSync || lastEdited.current !== "en" || !valueEn.trim()) return;

    const timer = setTimeout(async () => {
      setTranslatingToBn(true);
      const bn = await translateText(valueEn, "en", "bn");
      setTranslatingToBn(false);
      if (bn && (!valueBn.trim() || autoSync)) {
        onChangeBn(bn);
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [valueEn, autoSync]);

  // Manual Trigger: Translate BN -> EN
  const handleTranslateToEn = async () => {
    if (!valueBn.trim()) return;
    setTranslatingToEn(true);
    const en = await translateText(valueBn, "bn", "en");
    setTranslatingToEn(false);
    if (en) {
      onChangeEn(en);
      toast({ title: "English translation complete!" });
    }
  };

  // Manual Trigger: Translate EN -> BN
  const handleTranslateToBn = async () => {
    if (!valueEn.trim()) return;
    setTranslatingToBn(true);
    const bn = await translateText(valueEn, "en", "bn");
    setTranslatingToBn(false);
    if (bn) {
      onChangeBn(bn);
      toast({ title: "বাংলা অনুবাদ সম্পন্ন হয়েছে!" });
    }
  };

  const Component = multiline ? "textarea" : "input";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Title & Auto-Translate Badge */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold font-bengali text-foreground flex items-center gap-1.5">
            <span>{label}</span>
          </label>
        )}
        <button
          type="button"
          onClick={() => setAutoSync(!autoSync)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bengali font-semibold border flex items-center gap-1 transition-all ${
            autoSync
              ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle automatic live translation between Bangla and English"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>{autoSync ? "অটো-অনুবাদ সক্রিয়" : "অটো-অনুবাদ নিষ্ক্রিয়"}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Bengali Field */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bengali font-semibold text-muted-foreground flex items-center gap-1">
              বাংলা (Bengali)
            </span>
            <button
              type="button"
              onClick={handleTranslateToBn}
              disabled={translatingToBn || !valueEn.trim()}
              className="text-[10px] text-accent hover:underline font-bengali flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
              title="Translate from English to Bengali"
            >
              {translatingToBn ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <RefreshCw className="w-2.5 h-2.5" />
              )}
              ইংরেজি থেকে অনুবাদ
            </button>
          </div>

          <Component
            value={valueBn}
            rows={multiline ? rows : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              lastEdited.current = "bn";
              onChangeBn(e.target.value);
            }}
            placeholder={placeholderBn}
            className={`${inputClass} ${multiline ? "resize-y" : ""}`}
          />
        </div>

        {/* English Field */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              English
            </span>
            <button
              type="button"
              onClick={handleTranslateToEn}
              disabled={translatingToEn || !valueBn.trim()}
              className="text-[10px] text-accent hover:underline font-bengali flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
              title="Translate from Bengali to English"
            >
              {translatingToEn ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <RefreshCw className="w-2.5 h-2.5" />
              )}
              বাংলা থেকে অনুবাদ
            </button>
          </div>

          <Component
            value={valueEn}
            rows={multiline ? rows : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              lastEdited.current = "en";
              onChangeEn(e.target.value);
            }}
            placeholder={placeholderEn}
            className={`${inputClass} ${multiline ? "resize-y" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default BilingualInputPair;
