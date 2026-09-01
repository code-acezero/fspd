import { useEffect, useState, useMemo } from "react";
import {
  Check, X, Loader2, ImageIcon, FileEdit, ShieldCheck, User,
  Calendar, GraduationCap, Tag, MessageSquare, CheckCircle, XCircle,
  ArrowRight, Search, Filter, RefreshCw, Clock, TrendingUp,
  AlertTriangle, Eye, ChevronDown, ChevronRight, Activity,
  Hash, BarChart3, Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { fetchChangeRequests, approveChangeRequest, rejectChangeRequest, ChangeRequest } from "@/lib/changeRequests";

interface PendingPost {
  id: string;
  title: string;
  title_en: string;
  excerpt: string;
  cover_image: string;
  images: string[];
  author_id: string | null;
  approval_status: string;
  created_at: string;
  author_name?: string;
}

const TYPE_META: Record<string, { label: string; labelBn: string; color: string; bg: string; border: string }> = {
  member:  { label: "Council Member", labelBn: "পরিষদ সদস্য", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30" },
  post:    { label: "Post / Article", labelBn: "পোস্ট / প্রবন্ধ", color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30" },
  event:   { label: "Event",          labelBn: "অনুষ্ঠান",         color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  course:  { label: "Course",         labelBn: "কোর্স",            color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
};

const STATUS_META = {
  pending:  { label: "Pending Review",      labelBn: "বিচারাধীন",              color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  approved: { label: "Approved & Applied",  labelBn: "অনুমোদিত ও প্রয়োগকৃত", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  rejected: { label: "Rejected",           labelBn: "প্রত্যাখ্যাত",           color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
};

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === "en") {
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } else {
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return `${mins} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return `${days} দিন আগে`;
  }
}

const ModerationPanel = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<"corrections" | "posts" | "activity">("corrections");
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("posts")
        .select("id,title,title_en,excerpt,cover_image,images,author_id,approval_status,created_at")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const ids = Array.from(new Set(data.map(p => p.author_id).filter(Boolean))) as string[];
        let map: Record<string, string> = {};
        if (ids.length) {
          const { data: profs } = await supabase.from("profiles").select("id,display_name,full_name").in("id", ids);
          profs?.forEach(p => { map[p.id] = p.display_name || p.full_name || ""; });
        }
        setPosts(data.map(p => ({ ...(p as any), author_name: p.author_id ? map[p.author_id] : "" })));
      } else {
        setPosts([]);
      }

      const crs = await fetchChangeRequests();
      setChangeRequests(crs);
    } catch (err) {
      console.error("Moderation load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const decidePost = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    const { error } = await supabase.from("posts").update({ approval_status: decision, published: decision === "approved" }).eq("id", id);
    setBusy(null);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { toast({ title: decision === "approved" ? t("approvedToast") : t("rejected") }); loadData(); }
  };

  const handleApproveRequest = async (request: ChangeRequest) => {
    setBusy(request.id);
    const note = adminNoteInput[request.id] || "";
    const res = await approveChangeRequest(request, note);
    setBusy(null);
    if (res.success) {
      toast({ title: lang === "en" ? "Changes Approved & Applied!" : "আবেদন অনুমোদিত ও তথ্য প্রয়োগ হয়েছে!" });
      loadData();
    } else {
      toast({ title: lang === "en" ? "Approval Failed" : "অনুমোদন ব্যর্থ হয়েছে", description: res.error, variant: "destructive" });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setBusy(requestId);
    const note = adminNoteInput[requestId] || "";
    const res = await rejectChangeRequest(requestId, note);
    setBusy(null);
    if (res.success) {
      toast({ title: lang === "en" ? "Request Rejected" : "আবেদন প্রত্যাখ্যান করা হয়েছে" });
      loadData();
    } else {
      toast({ title: "Rejection failed", description: res.error, variant: "destructive" });
    }
  };

  // Computed stats
  const stats = useMemo(() => ({
    pending:  changeRequests.filter(r => r.status === "pending").length,
    approved: changeRequests.filter(r => r.status === "approved").length,
    rejected: changeRequests.filter(r => r.status === "rejected").length,
    total:    changeRequests.length,
    byType:   {
      member:  changeRequests.filter(r => r.target_type === "member").length,
      post:    changeRequests.filter(r => r.target_type === "post").length,
      event:   changeRequests.filter(r => r.target_type === "event").length,
      course:  changeRequests.filter(r => r.target_type === "course").length,
    },
  }), [changeRequests]);

  // Filtered + searched requests
  const filteredRequests = useMemo(() => {
    return changeRequests.filter(r => {
      const typeOk = typeFilter === "all" || r.target_type === typeFilter;
      const statusOk = statusFilter === "all" || r.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const searchOk = !q || (
        r.target_title?.toLowerCase().includes(q) ||
        r.user_name?.toLowerCase().includes(q) ||
        r.user_email?.toLowerCase().includes(q) ||
        r.target_type?.toLowerCase().includes(q)
      );
      return typeOk && statusOk && searchOk;
    });
  }, [changeRequests, typeFilter, statusFilter, searchQuery]);

  // Recent activity (last 30 non-pending)
  const recentActivity = useMemo(() =>
    changeRequests
      .filter(r => r.status !== "pending")
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 15),
    [changeRequests]
  );

  const TabBtn = ({ tab, label, count, icon }: { tab: typeof activeSubTab; label: string; count?: number; icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setActiveSubTab(tab)}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bengali font-bold transition-all ${
        activeSubTab === tab
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeSubTab === tab ? "bg-white/20 text-white" : "bg-amber-500 text-white"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: lang === "en" ? "Pending" : "বিচারাধীন", value: stats.pending, color: "text-amber-400", icon: <Clock className="w-4 h-4 text-amber-400" /> },
          { label: lang === "en" ? "Approved" : "অনুমোদিত", value: stats.approved, color: "text-emerald-400", icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
          { label: lang === "en" ? "Rejected" : "প্রত্যাখ্যাত", value: stats.rejected, color: "text-destructive", icon: <XCircle className="w-4 h-4 text-destructive" /> },
          { label: lang === "en" ? "Total Requests" : "মোট আবেদন", value: stats.total, color: "text-primary", icon: <BarChart3 className="w-4 h-4 text-primary" /> },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold font-sans ${s.color}`}>{s.value}</p>
              <p className="text-[11px] font-bengali text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sub-Tab Navigation ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-secondary/50 border border-border w-fit">
        <TabBtn
          tab="corrections"
          label={lang === "en" ? "Change Requests" : "সংশোধন আবেদন"}
          count={stats.pending}
          icon={<FileEdit className="w-3.5 h-3.5" />}
        />
        <TabBtn
          tab="posts"
          label={lang === "en" ? "Pending Posts" : "পোস্ট মডারেশন"}
          count={posts.length}
          icon={<MessageSquare className="w-3.5 h-3.5" />}
        />
        <TabBtn
          tab="activity"
          label={lang === "en" ? "Activity Log" : "অ্যাক্টিভিটি লগ"}
          icon={<Activity className="w-3.5 h-3.5" />}
        />
      </div>

      {/* ══ TAB: CORRECTION REQUESTS ══ */}
      {activeSubTab === "corrections" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2.5 p-3.5 bg-card rounded-2xl border border-border">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === "en" ? "Search by title, requester, type..." : "শিরোনাম, আবেদনকারী বা ধরন দিয়ে খুঁজুন..."}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">{lang === "en" ? "All Types" : "সকল ধরন"}</option>
              <option value="member">{lang === "en" ? "Council Members" : "পরিষদ সদস্য"}</option>
              <option value="post">{lang === "en" ? "Posts" : "পোস্ট"}</option>
              <option value="event">{lang === "en" ? "Events" : "অনুষ্ঠান"}</option>
              <option value="course">{lang === "en" ? "Courses" : "কোর্স"}</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">{lang === "en" ? "All Status" : "সকল অবস্থা"}</option>
              <option value="pending">{lang === "en" ? "Pending" : "বিচারাধীন"}</option>
              <option value="approved">{lang === "en" ? "Approved" : "অনুমোদিত"}</option>
              <option value="rejected">{lang === "en" ? "Rejected" : "প্রত্যাখ্যাত"}</option>
            </select>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bengali text-foreground border border-border transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{lang === "en" ? "Refresh" : "রিফ্রেশ"}</span>
            </button>
          </div>

          {/* Results count */}
          {!loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bengali px-1">
              <Hash className="w-3.5 h-3.5" />
              <span>
                {lang === "en"
                  ? `Showing ${filteredRequests.length} of ${changeRequests.length} requests`
                  : `${changeRequests.length}টির মধ্যে ${filteredRequests.length}টি দেখাচ্ছে`}
              </span>
              {(typeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <button onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setSearchQuery(""); }} className="text-primary hover:underline">
                  {lang === "en" ? "Clear filters" : "ফিল্টার মুছুন"}
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-3xl border border-border space-y-2">
              <Inbox className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-bengali font-bold text-foreground">
                {lang === "en" ? "No requests found" : "কোনো আবেদন পাওয়া যায়নি"}
              </p>
              <p className="text-xs text-muted-foreground font-bengali">
                {lang === "en" ? "Try adjusting your filters or check back later." : "ফিল্টার পরিবর্তন করুন বা পরে আবার চেক করুন।"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => {
                const isPending = req.status === "pending";
                const meta = STATUS_META[req.status as keyof typeof STATUS_META] || STATUS_META.pending;
                const typeMeta = TYPE_META[req.target_type] || TYPE_META.post;
                const isExpanded = expandedId === req.id;

                return (
                  <div
                    key={req.id}
                    className={`rounded-3xl bg-card border transition-all ${isPending ? "border-amber-500/30" : req.status === "approved" ? "border-emerald-500/20 opacity-85" : "border-destructive/20 opacity-80"}`}
                  >
                    {/* Card Header — always visible */}
                    <button
                      type="button"
                      className="w-full text-left p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3"
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Type badge */}
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase border ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}`}>
                          {lang === "en" ? typeMeta.label : typeMeta.labelBn}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bengali font-bold text-sm text-foreground truncate">{req.target_title}</p>
                          <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
                            {lang === "en" ? "By" : "আবেদনকারী:"} {req.user_name || req.user_email || "—"}
                            {" · "}
                            {timeAgo(req.created_at, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-bengali border ${meta.bg} ${meta.color} ${meta.border}`}>
                          {lang === "en" ? meta.label : meta.labelBn}
                        </span>
                        {isPending && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 space-y-3.5 border-t border-border/60 pt-3.5">
                        {/* Requester Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-secondary/30 p-3.5 rounded-2xl border border-border/50">
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bengali font-semibold uppercase tracking-wide mb-1">{lang === "en" ? "Submitted By" : "আবেদনকারী"}</p>
                            <p className="text-xs font-bengali font-semibold text-foreground">{req.user_name || "—"}</p>
                            {req.user_email && <p className="text-[11px] text-muted-foreground font-mono">{req.user_email}</p>}
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bengali font-semibold uppercase tracking-wide mb-1">{lang === "en" ? "Submitted At" : "জমার সময়"}</p>
                            <p className="text-xs font-bengali text-foreground">{new Date(req.created_at).toLocaleString()}</p>
                            <p className="text-[11px] text-muted-foreground font-bengali">{timeAgo(req.created_at, lang)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bengali font-semibold uppercase tracking-wide mb-1">{lang === "en" ? "Target Record" : "সংশ্লিষ্ট রেকর্ড"}</p>
                            <p className="text-xs font-bengali text-foreground">{req.target_type?.toUpperCase()} #{req.target_id?.slice(0, 8)}</p>
                          </div>
                        </div>

                        {/* User Notes */}
                        {req.notes && (
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <p className="text-[10px] font-semibold font-bengali text-amber-400 uppercase tracking-wide mb-1">{lang === "en" ? "User's Note:" : "আবেদনকারীর মন্তব্য:"}</p>
                            <p className="text-xs font-bengali text-foreground italic">"{req.notes}"</p>
                          </div>
                        )}

                        {/* Proposed Changes — before/after diff */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold font-bengali text-foreground flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            {lang === "en" ? "Proposed Changes:" : "প্রস্তাবিত পরিবর্তন:"}
                          </p>
                          <div className="rounded-2xl border border-border overflow-hidden">
                            {Object.entries(req.proposed_data).map(([k, v]) => (
                              <div key={k} className="flex flex-wrap items-start gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                                <span className="shrink-0 font-semibold text-[11px] text-primary font-sans capitalize w-24">
                                  {k.replace(/_/g, " ")}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bengali text-foreground break-words">
                                    {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Bar — only for pending */}
                        {isPending && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-border">
                            <input
                              type="text"
                              value={adminNoteInput[req.id] || ""}
                              onChange={e => setAdminNoteInput({ ...adminNoteInput, [req.id]: e.target.value })}
                              placeholder={lang === "en" ? "Admin feedback / reason (optional)..." : "অ্যাডমিন মন্তব্য / কারণ (ঐচ্ছিক)..."}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRejectRequest(req.id)}
                                disabled={busy === req.id}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bengali font-semibold transition-all disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                {lang === "en" ? "Reject" : "প্রত্যাখ্যান"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveRequest(req)}
                                disabled={busy === req.id}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bengali font-semibold transition-all active:scale-95 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                              >
                                {busy === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                {lang === "en" ? "Approve & Apply" : "অনুমোদন ও প্রয়োগ"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Completed info */}
                        {!isPending && (
                          <div className={`p-3 rounded-xl border ${req.status === "approved" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-destructive/5 border-destructive/20"}`}>
                            <p className={`text-xs font-bengali font-semibold ${req.status === "approved" ? "text-emerald-400" : "text-destructive"}`}>
                              {req.status === "approved"
                                ? (lang === "en" ? "✓ This request was approved and data has been applied." : "✓ এই আবেদনটি অনুমোদিত হয়েছে এবং তথ্য প্রয়োগ করা হয়েছে।")
                                : (lang === "en" ? "✕ This request was rejected." : "✕ এই আবেদনটি প্রত্যাখ্যান করা হয়েছে।")}
                            </p>
                            {req.updated_at && (
                              <p className="text-[11px] text-muted-foreground font-bengali mt-0.5">
                                {new Date(req.updated_at).toLocaleString()} · {timeAgo(req.updated_at, lang)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: PENDING POSTS ══ */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div>
              <h3 className="font-bengali font-bold text-sm text-foreground">
                {lang === "en" ? "Member Post Moderation" : "সদস্যদের পোস্ট মডারেশন"}
              </h3>
              <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                {lang === "en"
                  ? "Review and approve or reject member-submitted posts."
                  : "সদস্যদের পাঠানো পোস্টগুলো পর্যালোচনা করে অনুমোদন বা প্রত্যাখ্যান করুন।"}
              </p>
            </div>
            <button type="button" onClick={loadData} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bengali border border-border">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{lang === "en" ? "Refresh" : "রিফ্রেশ"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-3xl border border-border space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bengali font-bold text-foreground">
                {lang === "en" ? "No Pending Posts" : "কোনো অপেক্ষমাণ পোস্ট নেই"}
              </p>
              <p className="text-xs text-muted-foreground font-bengali">
                {lang === "en" ? "All submitted posts have been reviewed." : "সকল পোস্ট পর্যালোচিত হয়েছে।"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className="flex gap-4 p-4 rounded-2xl border border-amber-500/30 bg-card">
                  {/* Cover Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {p.cover_image || p.images?.[0] ? (
                      <img src={p.cover_image || p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="font-bengali text-sm font-bold text-foreground truncate">{p.title || p.title_en}</p>
                    <p className="text-xs text-muted-foreground font-bengali flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {p.author_name || "—"}
                      <span className="opacity-40">·</span>
                      <Clock className="w-3 h-3" />
                      {timeAgo(p.created_at, lang)}
                    </p>
                    {p.excerpt && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-bengali">{p.excerpt}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0 justify-center">
                    <button
                      onClick={() => decidePost(p.id, "approved")}
                      disabled={busy === p.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm font-bengali"
                    >
                      {busy === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {lang === "en" ? "Approve" : "অনুমোদন"}
                    </button>
                    <button
                      onClick={() => decidePost(p.id, "rejected")}
                      disabled={busy === p.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition-all disabled:opacity-50 font-bengali"
                    >
                      {busy === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      {lang === "en" ? "Reject" : "প্রত্যাখ্যান"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: ACTIVITY LOG ══ */}
      {activeSubTab === "activity" && (
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-2xl border border-border flex items-center justify-between">
            <div>
              <h3 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {lang === "en" ? "Recent Moderation Activity" : "সাম্প্রতিক মডারেশন কার্যক্রম"}
              </h3>
              <p className="text-xs text-muted-foreground font-bengali mt-0.5">
                {lang === "en" ? "Last 15 completed decisions (approved or rejected)" : "সর্বশেষ ১৫টি সম্পন্ন সিদ্ধান্ত (অনুমোদিত বা প্রত্যাখ্যাত)"}
              </p>
            </div>
            <button type="button" onClick={loadData} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bengali border border-border">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Type breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(stats.byType).map(([type, count]) => {
              const m = TYPE_META[type];
              return (
                <div key={type} className={`p-3 rounded-2xl border ${m.border} ${m.bg} flex items-center gap-2`}>
                  <span className={`text-sm font-bold font-sans ${m.color}`}>{count}</span>
                  <span className={`text-xs font-bengali ${m.color}`}>{lang === "en" ? m.label : m.labelBn}</span>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-3xl border border-border">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-bengali text-sm text-muted-foreground">
                {lang === "en" ? "No completed decisions yet." : "এখনো কোনো সিদ্ধান্ত নেওয়া হয়নি।"}
              </p>
            </div>
          ) : (
            <div className="space-y-0 rounded-3xl border border-border bg-card overflow-hidden">
              {recentActivity.map((req, idx) => {
                const typeMeta = TYPE_META[req.target_type] || TYPE_META.post;
                const isApproved = req.status === "approved";
                return (
                  <div key={req.id} className={`flex items-center gap-4 px-4 py-3 ${idx < recentActivity.length - 1 ? "border-b border-border/50" : ""} hover:bg-secondary/20 transition-colors`}>
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isApproved ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                      {isApproved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bengali font-semibold text-foreground truncate">{req.target_title}</p>
                      <p className="text-[11px] text-muted-foreground font-bengali">
                        {req.user_name || req.user_email || "—"}
                        <span className="mx-1 opacity-40">·</span>
                        <span className={`font-semibold ${typeMeta.color}`}>{lang === "en" ? typeMeta.label : typeMeta.labelBn}</span>
                      </p>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className={`text-[10px] font-bold font-bengali ${isApproved ? "text-emerald-400" : "text-destructive"}`}>
                        {isApproved ? (lang === "en" ? "Approved" : "অনুমোদিত") : (lang === "en" ? "Rejected" : "প্রত্যাখ্যাত")}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bengali mt-0.5">
                        {timeAgo(req.updated_at || req.created_at, lang)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
