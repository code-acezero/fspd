import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Database, Shield, Globe, Cloud } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Status = "ok" | "fail" | "checking";

interface Check {
  label: string;
  status: Status;
  detail?: string;
}

const ROUTES = [
  { path: "/", label: "Landing" },
  { path: "/home", label: "Home" },
  { path: "/blog", label: "Blog list" },
  { path: "/events", label: "Events list" },
  { path: "/courses", label: "Courses" },
  { path: "/members", label: "Members" },
  { path: "/about", label: "About" },
  { path: "/search", label: "Search" },
  { path: "/login", label: "Login" },
  { path: "/profile", label: "Profile" },
  { path: "/admin", label: "Admin Dashboard" },
  { path: "/admin/health", label: "Health (this page)" },
];

const HealthPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [checks, setChecks] = useState<Check[]>([
    { label: "Supabase posts table", status: "checking" },
    { label: "Supabase events table", status: "checking" },
    { label: "Supabase members table", status: "checking" },
    { label: "Supabase site_settings table", status: "checking" },
    { label: "Supabase auth session", status: "checking" },
    { label: "Translate edge function", status: "checking" },
  ]);

  useEffect(() => {
    const run = async () => {
      const next: Check[] = [];

      const probe = async (label: string, fn: () => Promise<{ ok: boolean; detail?: string }>) => {
        try {
          const r = await fn();
          next.push({ label, status: r.ok ? "ok" : "fail", detail: r.detail });
        } catch (e: any) {
          next.push({ label, status: "fail", detail: e?.message ?? String(e) });
        }
      };

      await probe("Supabase posts table", async () => {
        const { error, count } = await supabase.from("posts").select("id", { count: "exact", head: true });
        return { ok: !error, detail: error ? error.message : `${count ?? 0} rows` };
      });
      await probe("Supabase events table", async () => {
        const { error, count } = await supabase.from("events").select("id", { count: "exact", head: true });
        return { ok: !error, detail: error ? error.message : `${count ?? 0} rows` };
      });
      await probe("Supabase members table", async () => {
        const { error, count } = await supabase.from("members").select("id", { count: "exact", head: true });
        return { ok: !error, detail: error ? error.message : `${count ?? 0} rows` };
      });
      await probe("Supabase site_settings table", async () => {
        const { error, count } = await supabase.from("site_settings").select("id", { count: "exact", head: true });
        return { ok: !error, detail: error ? error.message : `${count ?? 0} rows` };
      });
      await probe("Supabase auth session", async () => {
        const { data, error } = await supabase.auth.getSession();
        return { ok: !error, detail: data.session ? `Active (${data.session.user.email})` : "Anonymous" };
      });
      await probe("Translate edge function", async () => {
        const { error } = await supabase.functions.invoke("translate", { body: { text: "ping", targetLang: "en" } });
        return { ok: !error, detail: error ? error.message : "Reachable" };
      });

      setChecks(next);
    };
    run();
  }, []);

  const allOk = checks.every((c) => c.status === "ok");
  const anyFail = checks.some((c) => c.status === "fail");
  const stillChecking = checks.some((c) => c.status === "checking");

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>

        <h1 className="font-bengali text-3xl font-bold text-foreground mb-2">Site Health</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Quick diagnostics for routes, authentication, and database connectivity.
        </p>

        {/* Overall banner */}
        <div className={`rounded-2xl border p-5 mb-8 flex items-center gap-3 ${
          stillChecking ? "bg-muted/30 border-border" :
          allOk ? "bg-forest/10 border-forest/30 text-forest" :
          "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {stillChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : allOk ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <div>
            <p className="font-semibold text-sm">
              {stillChecking ? "Running checks…" : allOk ? "All systems operational" : `${checks.filter(c => c.status === "fail").length} check(s) failing`}
            </p>
            <p className="text-xs opacity-80">Last run: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Auth state */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Authentication state</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-2 text-sm">
            <Row label="Loading" value={authLoading ? "yes" : "no"} />
            <Row label="Signed in" value={user ? "yes" : "no"} />
            <Row label="User ID" value={user?.id ?? "—"} mono />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Role" value={role ?? "—"} />
          </div>
        </section>

        {/* DB / edge checks */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Backend connectivity</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  {c.status === "checking" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
                  {c.status === "ok" && <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />}
                  {c.status === "fail" && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{c.label}</p>
                    {c.detail && <p className="text-xs text-muted-foreground truncate">{c.detail}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Routes */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Registered routes</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 grid sm:grid-cols-2 gap-2">
            {ROUTES.map((r) => (
              <Link key={r.path} to={r.path} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm">
                <span className="text-foreground">{r.label}</span>
                <code className="text-xs text-muted-foreground">{r.path}</code>
              </Link>
            ))}
          </div>
        </section>

        {/* Env */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Build / environment</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-2 text-sm">
            <Row label="Mode" value={import.meta.env.MODE} />
            <Row label="Production build" value={import.meta.env.PROD ? "yes" : "no"} />
            <Row label="Supabase URL" value={import.meta.env.VITE_SUPABASE_URL ?? "(hardcoded)"} mono />
            <Row label="User agent" value={typeof navigator !== "undefined" ? navigator.userAgent : "—"} />
          </div>
        </section>

        {anyFail && (
          <div className="text-xs text-muted-foreground">
            Tip: failing edge-function checks usually mean the function hasn't deployed yet. Failing
            table checks usually mean RLS is blocking anonymous access — sign in as admin and reload.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className={`text-foreground text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
  </div>
);

export default HealthPage;
