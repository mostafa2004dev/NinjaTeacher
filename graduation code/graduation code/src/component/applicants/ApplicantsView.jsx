import { useMemo, useState } from "react";
import { Bell, Info, Star, Calendar, CheckCircle2, Search, ChevronDown, Loader2 } from "lucide-react";
import { useApplicants } from "../../pages/Applicants/hooks/useApplicants";
import ApplicantCard from "./ApplicantCard";

const cardStyle = { background: "var(--surface-card)", border: "1px solid var(--border-default)" };
const inputStyle = { background: "var(--surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

export default function ApplicantsView({ title, subtitle, fixedStatus = null }) {
  const { applicants, loading, error, busyId, changeStatus } = useApplicants();
  const [search, setSearch] = useState("");
  const [manualStatus, setManualStatus] = useState("");

  const activeStatus = fixedStatus !== null ? fixedStatus : manualStatus;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applicants.filter((a) => {
      const okSearch = !q || [a.name, a.role, a.location].some((v) => (v || "").toLowerCase().includes(q));
      const okStatus = !activeStatus || a.status === activeStatus;
      return okSearch && okStatus;
    });
  }, [applicants, search, activeStatus]);

  const stats = useMemo(() => ({
    new: applicants.filter((a) => a.status === "pending").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    interview: applicants.filter((a) => a.status === "interview").length,
    accepted: applicants.filter((a) => a.status === "accepted").length,
  }), [applicants]);

  return (
    <div className="min-h-screen font-sans pb-12" style={{ background: "var(--surface-page)" }}>
      <div className="px-4 sm:px-6 lg:px-8 py-6" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
              <p className="text-sm sm:text-base mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
            </div>
           
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New", icon: Info, count: stats.new, bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", labelColor: "#3b82f6", iconColor: "#3b82f6" },
              { label: "Shortlisted", icon: Star, count: stats.shortlisted, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", labelColor: "#d97706", iconColor: "#f59e0b" },
              { label: "Interview", icon: Calendar, count: stats.interview, bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", labelColor: "#6366f1", iconColor: "#6366f1" },
              { label: "Accepted", icon: CheckCircle2, count: stats.accepted, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", labelColor: "#059669", iconColor: "#10b981" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 flex flex-col justify-between" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold" style={{ color: s.labelColor }}>{s.label}</span>
                  <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="p-4 rounded-2xl flex flex-col md:flex-row gap-4" style={cardStyle}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search applicants by name, subject, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
              style={inputStyle}
            />
          </div>

          {fixedStatus === null && (
            <div className="relative w-full md:w-64 shrink-0">
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                className="w-full appearance-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none transition-all"
                style={inputStyle}
              >
                <option value="">All Statuses</option>
                <option value="pending">New</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16" style={{ color: "var(--text-muted)" }}>
            <Loader2 className="animate-spin w-5 h-5" /> <span className="font-semibold">Loading applicants...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 font-semibold text-red-500">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 font-semibold" style={{ color: "var(--text-muted)" }}>No applicants yet.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                busy={busyId === applicant.id}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}