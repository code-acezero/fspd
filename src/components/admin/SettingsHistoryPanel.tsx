import { useEffect, useState } from "react";
import { History, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface HistoryRow {
  id: string;
  setting_key: string;
  value: any;
  changed_at: string;
}

const SettingsHistoryPanel = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { updateSettings } = useSiteSettings();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings_history")
      .select("id,setting_key,value,changed_at")
      .order("changed_at", { ascending: false })
      .limit(50);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const restore = async (row: HistoryRow) => {
    setBusy(row.id);
    try {
      await updateSettings(row.setting_key as any, row.value);
      toast({ title: t("rolledBack") });
      fetch();
    } catch (e: any) {
      toast({ title: t("error"), description: e?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  return (
    <div className="bg-background rounded-3xl border border-border p-6 depth-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bengali font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4" /> {t("settingsHistory")}
        </h3>
        <span className="text-[10px] text-muted-foreground font-bengali">{t("historyHint")}</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground font-bengali text-center py-6">{t("noHistory")}</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-auto">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl border border-border bg-muted/30">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground font-bengali">{r.setting_key}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(r.changed_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => restore(r)}
                disabled={busy === r.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 font-bengali shrink-0"
              >
                {busy === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {t("rollback")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsHistoryPanel;
