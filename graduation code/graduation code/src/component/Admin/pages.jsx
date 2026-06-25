// ─── TeachersPage ──────────────────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Users, Star, CheckCircle, AlertCircle,
  Edit2, Trash2, Check, X, Download, TrendingUp, RefreshCw, Zap,
  CreditCard, XCircle, Shuffle, MessageSquare, Bell, Building2,
  Settings,
} from "lucide-react";
import {
  KpiCard, Badge, GradientButton, ConfirmModal,
  TeacherModal, SchoolModal,
} from "./ui.jsx";
import { PageWrapper } from "./layout.jsx";
import { gradientBg, gradientText } from "./index.js";

// ─────────────────────────────────────────────────────────────────────────────
export function TeachersPage({ teachers, onAdd, onEdit, onDelete }) {
  const [modal,     setModal]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const [search,    setSearch]    = useState("");
  const [filterSub, setFilterSub] = useState("All");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) &&
      (filterSub === "All" || t.sub === filterSub)
    );
  });

  const handleSave = (data) => {
    data.id ? onEdit(data) : onAdd(data);
    setModal(null);
  };

  return (
    <PageWrapper>
      <TeacherModal open={!!modal} initial={modal === "add" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      <ConfirmModal open={!!confirm} title="Delete Teacher?"
        body="This action cannot be undone. The teacher's data will be permanently removed."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">Teachers</h2>
          <p className="text-sm text-[#484555] mt-1">Manage, screen, and monitor your global educator network.</p>
        </div>
        <GradientButton onClick={() => setModal("add")}><Plus size={16} />Add Teacher</GradientButton>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9c4d7]/30 mb-6 flex flex-wrap items-end gap-4"
        style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-[11px] font-semibold text-[#484555] tracking-wide">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9c4d7]" />
            <input
              className="w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
              placeholder="Name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 w-36">
          <label className="text-[11px] font-semibold text-[#484555] tracking-wide">Subscription</label>
          <select
            className="bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
            value={filterSub} onChange={(e) => setFilterSub(e.target.value)}
          >
            {["All", "Basic", "Premium", "Gold"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setSearch(""); setFilterSub("All"); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e5eeff] text-[#5d3bdc] rounded-xl text-sm font-semibold hover:bg-[#dce9ff] shrink-0"
        >
          <Filter size={14} /> Reset
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        <KpiCard icon={Users}       iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)"    label="Total"   value={teachers.length} trend={`${teachers.filter((t) => t.status === "active").length} active`} />
        <KpiCard icon={Star}        iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)"    label="Premium" value={teachers.filter((t) => t.sub === "Premium").length} trend="subscribers" trendColor="text-[#b1008c]" trendBg="bg-[#ffd8ec]" />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)"    label="Active"  value={teachers.filter((t) => t.status === "active").length} trend="placed" />
        <KpiCard icon={AlertCircle} iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)"    label="Pending" value={teachers.filter((t) => t.status === "pending").length} trend="review" trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#484555] text-sm">No teachers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#eff4ff]/50">
                  {["Name", "Skills", "Exp.", "Personality", "Subscription", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold tracking-wide text-[#484555] border-b border-[#c9c4d7]/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9c4d7]/20">
                {filtered.map((t, i) => (
                  <motion.tr key={t.id} className="hover:bg-[#f8f9ff] transition-colors"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: t.bg, color: t.color }}>{t.initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-[#0b1c30]">{t.name}</p>
                          <p className="text-xs text-[#484555]/70">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.skills || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                            style={{ background: "rgba(93,59,220,0.05)", color: "#5d3bdc", borderColor: "rgba(93,59,220,0.15)" }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#0b1c30]">{t.exp}</td>
                    <td className="px-5 py-4 text-sm text-[#484555] italic">{t.personality}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold" style={{ color: t.sub === "Premium" ? "#b1008c" : "#484555" }}>{t.sub}</p>
                      <p className="text-[10px] text-[#484555]/60 uppercase tracking-wider">{t.subPeriod}</p>
                    </td>
                    <td className="px-5 py-4"><Badge variant={t.status}>{t.status}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(t)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#5d3bdc]" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => setConfirm(t.id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function SchoolsPage({ schools, onAdd, onEdit, onDelete }) {
  const [modal,   setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search,  setSearch]  = useState("");

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = (data) => {
    data.id ? onEdit(data) : onAdd(data);
    setModal(null);
  };

  return (
    <PageWrapper>
      <SchoolModal open={!!modal} initial={modal === "add" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      <ConfirmModal open={!!confirm} title="Delete School?"
        body="This will permanently remove the school and all associated data."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">Schools Directory</h2>
          <p className="text-sm text-[#484555] mt-1">Manage and monitor your partner school network.</p>
        </div>
        <GradientButton onClick={() => setModal("add")}><Plus size={16} />Add School</GradientButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        <KpiCard icon={Building2}  iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)"  label="Total Schools" value={schools.length} />
        <KpiCard icon={CheckCircle}iconColor="#059669" iconBg="rgba(5,150,105,0.1)"  label="Active"        value={schools.filter((s) => s.status === "active").length} />
        <KpiCard icon={AlertCircle}iconColor="#d97706" iconBg="rgba(217,119,6,0.1)"  label="Pending"       value={schools.filter((s) => s.status === "pending").length} trendColor="text-amber-700" trendBg="bg-amber-50" />
        <KpiCard icon={Star}       iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)"  label="Gold Tier"     value={schools.filter((s) => s.sub === "Gold").length} />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#c9c4d7]/30 mb-5 flex items-center gap-4"
        style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9c4d7]" />
          <input
            className="w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
            placeholder="Search schools…" value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#484555]">No schools found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#eff4ff]/50">
                  {["School", "Location", "Type", "Subscription", "Teachers", "Rating", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold tracking-wide text-[#484555] border-b border-[#c9c4d7]/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9c4d7]/20">
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: s.bg, color: s.color }}>{s.initials}</div>
                        <span className="text-sm font-semibold text-[#0b1c30]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#484555]">{s.city}</td>
                    <td className="px-5 py-4 text-sm text-[#484555]">{s.type}</td>
                    <td className="px-5 py-4"><Badge variant={s.sub === "Gold" ? "gold" : s.sub === "Silver" ? "pending" : "basic"}>{s.sub}</Badge></td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#0b1c30]">{s.teachers}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-[#0b1c30]">{s.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Badge variant={s.status}>{s.status}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(s)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#5d3bdc]"><Edit2 size={14} /></button>
                        <button onClick={() => setConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function MatchingPage({ matches, onApprove, onDismiss }) {
  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">AI Matching Recommendations</h2>
          <p className="text-sm text-[#484555] mt-1">Review and act on AI-generated teacher–school matches.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#eff4ff] flex items-center gap-2">
            <RefreshCw size={14} />Refresh
          </button>
          <GradientButton><Zap size={14} />Run AI Engine</GradientButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        <KpiCard icon={Shuffle}     iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Pending Matches" value={matches.filter((m) => m.status === "pending").length} trend="Review" trendColor="text-amber-700" trendBg="bg-amber-50" />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Approved"        value={matches.filter((m) => m.status === "approved").length} trend="confirmed" />
        <KpiCard icon={TrendingUp}  iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)" label="Total Matches"   value={matches.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matches.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex -space-x-3">
                {[m.t1, m.t2].map((init, j) => (
                  <div key={j} className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold"
                    style={{ background: j === 0 ? "rgba(93,59,220,0.1)" : "rgba(177,0,140,0.1)", color: j === 0 ? "#5d3bdc" : "#b1008c" }}>{init}</div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={gradientText}>{m.score}%</span>
                <Badge variant={m.status}>{m.status}</Badge>
              </div>
            </div>
            <h4 className="text-base font-bold text-[#0b1c30] mb-1">{m.school} ↔ {m.teacher}</h4>
            <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(93,59,220,0.05)", borderLeft: "3px solid #5d3bdc" }}>
              <p className="text-xs font-semibold text-[#5d3bdc] mb-1">AI Insight</p>
              <p className="text-xs text-[#484555]">{m.insight}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {m.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[10px] text-[#484555]">{t}</span>
              ))}
            </div>
            {m.status === "pending" && (
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => onApprove(m.id)}
                  className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                  style={{ background: gradientBg }}>
                  <Check size={14} />Approve Match
                </motion.button>
                <button onClick={() => onDismiss(m.id)}
                  className="px-4 py-2.5 border border-[#c9c4d7]/60 rounded-xl text-sm text-[#484555] hover:bg-[#ffdad6] hover:text-[#ba1a1a] hover:border-[#ba1a1a]/30 transition-colors flex items-center gap-1">
                  <X size={14} />Dismiss
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {matches.length === 0 && (
          <div className="col-span-2 py-20 text-center text-sm text-[#484555]">
            No matches yet. Run the AI Engine to generate recommendations.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function SubscriptionsPage({ teachers }) {
  const premium = teachers.filter((t) => t.sub === "Premium");
  const gold    = teachers.filter((t) => t.sub === "Gold");
  const basic   = teachers.filter((t) => t.sub === "Basic");
  const revenue = premium.length * 49 + gold.length * 99 + basic.length * 19;

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">Subscription Analytics</h2>
          <p className="text-sm text-[#484555] mt-1">Track revenue, renewals, and plan performance.</p>
        </div>
        <GradientButton><Download size={14} />Export Report</GradientButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <KpiCard icon={CreditCard} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)"  label="Est. Monthly Revenue" value={`$${revenue.toLocaleString()}`} trend="+8.2%" />
        <KpiCard icon={Users}      iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)"  label="Active Subscribers"   value={teachers.filter((t) => t.status === "active").length} />
        <KpiCard icon={XCircle}    iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)"  label="Expired"              value={teachers.filter((t) => t.status === "expired").length} trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
        <KpiCard icon={TrendingUp} iconColor="#059669" iconBg="rgba(5,150,105,0.1)"  label="Premium Rate"         value={`${Math.round((premium.length / Math.max(teachers.length, 1)) * 100)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tiers */}
        <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <h4 className="text-base font-bold text-[#0b1c30] mb-4">Subscription Tiers</h4>
          {[
            { name: "Gold",    price: "$99/mo", count: gold.length,    c: "#d97706" },
            { name: "Premium", price: "$49/mo", count: premium.length, c: "#5d3bdc" },
            { name: "Basic",   price: "$19/mo", count: basic.length,   c: "#484555" },
          ].map((tier) => (
            <div key={tier.name} className="p-4 rounded-xl border border-[#c9c4d7]/40 mb-3">
              <div className="flex justify-between mb-1">
                <h5 className="font-bold text-sm" style={{ color: tier.c }}>{tier.name}</h5>
                <span className="text-sm font-bold text-[#0b1c30]">{tier.price}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(tier.count / Math.max(teachers.length, 1)) * 100}%`, background: gradientBg }} />
                </div>
                <span className="text-xs font-bold text-[#484555]">{tier.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subscriber list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#c9c4d7]/30">
            <h4 className="font-bold text-[#0b1c30]">Subscriber List</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead>
                <tr className="bg-[#f8f9ff]">
                  {["Name", "Plan", "Period", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold tracking-wide text-[#484555]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9c4d7]/20">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: t.bg, color: t.color }}>{t.initials}</div>
                        <span className="text-sm font-semibold text-[#0b1c30]">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><Badge variant={t.sub === "Gold" ? "gold" : t.sub === "Premium" ? "premium" : "basic"}>{t.sub}</Badge></td>
                    <td className="px-5 py-3.5 text-xs text-[#484555] uppercase tracking-wider">{t.subPeriod}</td>
                    <td className="px-5 py-3.5"><Badge variant={t.status}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function FeedbackPage({ feedback, onDelete }) {
  const [confirm, setConfirm] = useState(null);

  return (
    <PageWrapper>
      <ConfirmModal open={!!confirm} title="Delete Review?"
        body="This feedback will be permanently deleted."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)} />

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">School Feedback</h2>
          <p className="text-sm text-[#484555] mt-1">Monitor satisfaction and address critical reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <KpiCard icon={MessageSquare} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)"  label="Total Reviews"    value={feedback.length} />
        <KpiCard icon={Star}          iconColor="#d97706" iconBg="rgba(217,119,6,0.1)"  label="5-Star Reviews"   value={feedback.filter((f) => f.rating === 5).length} />
        <KpiCard icon={AlertCircle}   iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)"  label="Critical Reviews" value={feedback.filter((f) => f.critical).length} trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
        <KpiCard icon={CheckCircle}   iconColor="#059669" iconBg="rgba(5,150,105,0.1)"  label="Avg Rating"       value={feedback.length ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1) : "N/A"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {feedback.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-white p-5 rounded-2xl border transition-all ${r.critical ? "border-[#ba1a1a]/30" : "border-[#c9c4d7]/30"}`}
            style={{ boxShadow: r.critical ? "0 2px 12px rgba(186,26,26,0.08)" : "0 2px 12px rgba(93,59,220,0.06)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: r.bg, color: r.color }}>{r.initials}</div>
                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">{r.name}</p>
                  <p className="text-xs text-[#484555]">{r.school}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={13} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-[#c9c4d7]"} />)}</div>
                <button onClick={() => setConfirm(r.id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm text-[#484555] mb-3 leading-relaxed">"{r.text}"</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#484555]/60">{r.time}</span>
              {r.critical && (
                <motion.button whileTap={{ scale: 0.97 }} className="px-3.5 py-1.5 text-white text-xs font-bold rounded-full" style={{ background: gradientBg }}>
                  Address Issue
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
        {feedback.length === 0 && (
          <div className="col-span-2 py-20 text-center text-sm text-[#484555]">No feedback yet.</div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_ICONS = { Shuffle, Users, CreditCard, Star, Settings, Bell, Building2 };

export function NotificationsPage({ notifications, onMarkRead, onDelete, onMarkAllRead, onClearAll }) {
  const [filter, setFilter] = useState("All Notifications");
  const filters = ["All Notifications", "Matches", "Approvals", "Billing"];

  const visible = notifications.filter((n) => {
    if (filter === "All Notifications") return true;
    if (filter === "Matches")   return n.title.toLowerCase().includes("match");
    if (filter === "Approvals") return n.title.toLowerCase().includes("applic") || n.title.toLowerCase().includes("approv");
    if (filter === "Billing")   return n.title.toLowerCase().includes("sub") || n.title.toLowerCase().includes("renew");
    return true;
  });

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">System Alerts</h2>
          <p className="text-sm text-[#484555] mt-1">Stay up to date with matches, approvals, and billing.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={onMarkAllRead}
            className="px-4 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#5d3bdc] hover:bg-[#eff4ff] flex items-center gap-2">
            <Check size={14} />Mark All Read
          </button>
          <button onClick={onClearAll}
            className="px-4 py-2.5 rounded-xl bg-[#ffdad6] text-sm font-semibold text-[#ba1a1a] hover:bg-[#ffc9c5] flex items-center gap-2">
            <Trash2 size={14} />Clear All
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? "text-white shadow-lg" : "bg-white border border-[#c9c4d7]/60 text-[#484555] hover:border-[#5d3bdc]/40"}`}
            style={filter === f ? { background: gradientBg } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {visible.map((n) => {
            const Icon = NOTIF_ICONS[n.iconKey] || Bell;
            return (
              <motion.div key={n.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className={`bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all ${n.unread ? "border-[#5d3bdc]/25" : "border-[#c9c4d7]/30"}`}
                style={n.unread ? { boxShadow: "0 2px 12px rgba(93,59,220,0.08)" } : {}}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? "" : "opacity-0"}`} style={{ background: "#5d3bdc" }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.iconBg }}>
                  <Icon size={18} style={{ color: n.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold ${n.unread ? "text-[#0b1c30]" : "text-[#484555]"}`}>{n.title}</h4>
                      <p className="text-sm text-[#484555] mt-0.5">{n.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#484555]/60 hidden sm:block">{n.time}</span>
                      {n.unread && (
                        <button onClick={() => onMarkRead(n.id)} className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#5d3bdc]" title="Mark read">
                          <Check size={12} />
                        </button>
                      )}
                      <button onClick={() => onDelete(n.id)} className="p-1 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Delete">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {n.actions.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {n.actions.map((action, j) => (
                        <button key={j}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${j === 0 ? "text-white" : "border border-[#c9c4d7]/60 text-[#484555] hover:bg-[#eff4ff]"}`}
                          style={j === 0 ? { background: gradientBg } : {}}>
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && (
          <div className="py-20 text-center">
            <CheckCircle size={40} className="mx-auto mb-4 text-green-400" />
            <p className="text-base font-semibold text-[#0b1c30]">All caught up!</p>
            <p className="text-sm text-[#484555] mt-1">No notifications in this category.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
