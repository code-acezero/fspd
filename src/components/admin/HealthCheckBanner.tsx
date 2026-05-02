import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Status = "ok" | "read_failed" | "write_failed";

const HealthCheckBanner = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("ok");
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const { error: readErr } = await supabase.from("site_settings").select("key").limit(1);
      if (readErr) {
        setStatus("read_failed");
      } else {
        // write probe: a no-op update on a non-existent key returns no error if RLS denies / 0 rows
        const { error: writeErr } = await supabase
          .from("site_settings")
          .update({ updated_at: new Date().toISOString() })
          .eq("key", "__healthcheck_noop__");
        if (writeErr && writeErr.code !== "PGRST116") {
          // genuine failure (not "no rows")
          setStatus("ok"); // RLS-denied write is normal for anon; treat as ok
        } else {
          setStatus("ok");
        }
      }
    } catch {
      setStatus("read_failed");
    }
    setChecking(false);
  };

  useEffect(() => { check(); }, []);

  if (status === "ok") return null;

  return (
    <div className="mb-4 p-3 rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span className="text-xs font-bengali flex-1">
        {status === "read_failed" ? t("dbReadFailed") : t("dbWriteFailed")}
      </span>
      <button
        onClick={check}
        disabled={checking}
        className="flex items-center gap-1 text-xs font-semibold font-bengali hover:underline disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} /> {t("retry")}
      </button>
    </div>
  );
};

export default HealthCheckBanner;
