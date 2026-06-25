import { motion } from "framer-motion";
import { TrendingUp, Users, Building2, Link2, CreditCard, Star } from "lucide-react";
import { KpiCard, Badge } from "./ui.jsx";
import { PageWrapper } from "./layout.jsx";
import { gradientBg, gradientText } from "./index.js";

export default function DashboardPage({ teachers, schools, matches }) {
  const active   = teachers.filter((t) => t.status === "active").length;
  const approved = matches.filter((m) => m.status === "approved").length;
  const subs     = teachers.filter((t) => t.sub === "Premium" || t.sub === "Gold").length;

  const liveStats = [
    {
      iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.1)",
      icon: Users,      value: active,           label: "Active teachers in the platform.",
    },
    {
      iconColor: "#059669", iconBg: "rgba(5,150,105,0.1)",
      icon: Link2,      value: approved,         label: "Approved matches so far.",
    },
    {
      iconColor: "#b1008c", iconBg: "rgba(177,0,140,0.1)",
      icon: Building2,  value: schools.length,   label: "Partner schools onboarded.",
    },
    {
      iconColor: "#8d4b00", iconBg: "rgba(141,75,0,0.08)",
      icon: CreditCard, value: subs,             label: "Premium subscribers.",
    },
  ];

  return (
    <PageWrapper>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { icon: Users,     iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.1)",  label: "Total Teachers", value: teachers.length, trend: `${active} active` },
          { icon: Building2, iconColor: "#b1008c", iconBg: "rgba(177,0,140,0.1)",  label: "Total Schools",  value: schools.length,  trend: `+${schools.filter((s) => s.status === "active").length} active` },
          { icon: Link2,     iconColor: "#8d4b00", iconBg: "rgba(141,75,0,0.1)",   label: "Active Matches", value: approved,         trend: `${matches.length} total` },
          { icon: CreditCard,iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.08)", label: "Premium Subs",   value: subs,             trend: "Active" },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* Charts + live stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Bar chart + donut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
              <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "#5d3bdc" }} />
                Teachers per Subject
              </h4>
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {[
                  { l: "Math",    h: "80%", c: "rgba(93,59,220,0.2)",  v: 450 },
                  { l: "Science", h: "65%", c: "rgba(177,0,140,0.2)",  v: 320 },
                  { l: "Arts",    h: "95%", c: "rgba(141,75,0,0.2)",   v: 580 },
                  { l: "Lang",    h: "50%", c: "rgba(93,59,220,0.15)", v: 210 },
                ].map((b) => (
                  <div key={b.l} className="w-full flex flex-col items-center group">
                    <div className="w-full rounded-t-lg transition-colors relative" style={{ height: b.h, background: b.c }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-[#0b1c30] text-white px-1.5 py-0.5 rounded">
                        {b.v}
                      </div>
                    </div>
                    <span className="text-[10px] mt-2 text-[#484555]">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
              <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2">
                <Star size={14} style={{ color: "#b1008c" }} />
                Teacher Personality
              </h4>
              <div className="flex items-center gap-6 h-40">
                <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e6deff" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#ffd8ec" strokeWidth="14"
                    strokeDasharray="238" strokeDashoffset="137" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#cbdbf5" strokeWidth="14"
                    strokeDasharray="238" strokeDashoffset="183" transform="rotate(128 50 50)" />
                  <text x="50" y="54" textAnchor="middle" fontSize="9" fill="#484555">Active</text>
                </svg>
                <div className="space-y-2">
                  {[
                    { c: "#5d3bdc", l: "Leader (42%)" },
                    { c: "#b1008c", l: "Creative (35%)" },
                    { c: "#cbdbf5", l: "Calm (23%)" },
                  ].map((item) => (
                    <div key={item.l} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.c }} />
                      <span className="text-[11px] text-[#484555]">{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Line chart */}
          <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
            <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "#8d4b00" }} />
              Matching Success Rate (6 Months)
            </h4>
            <div className="h-44 relative">
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lg1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%"   stopColor="#5d3bdc" />
                    <stop offset="50%"  stopColor="#b1008c" />
                    <stop offset="100%" stopColor="#fd4ccb" />
                  </linearGradient>
                  <linearGradient id="lgFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"   stopColor="#5d3bdc" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#5d3bdc" stopOpacity="0"   />
                  </linearGradient>
                </defs>
                {[0, 35, 70, 105].map((y) => (
                  <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                <path d="M 0 100 C 60 120 80 80 120 70 S 200 40 240 50 S 340 80 380 30 S 480 5 600 40"
                  fill="url(#lgFill)" />
                <path d="M 0 100 C 60 120 80 80 120 70 S 200 40 240 50 S 340 80 380 30 S 480 5 600 40"
                  fill="none" stroke="url(#lg1)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between mt-2 text-[10px] text-[#484555] uppercase tracking-widest">
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30 flex flex-col"
          style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <h4 className="text-sm font-semibold text-[#0b1c30] mb-5">Live Stats</h4>
          <div className="flex-1 space-y-5">
            {liveStats.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: a.iconBg }}>
                    <a.icon size={16} style={{ color: a.iconColor }} />
                  </div>
                  {i < liveStats.length - 1 && (
                    <div className="absolute top-9 left-1/2 -translate-x-1/2 w-px h-5 bg-[#c9c4d7]/40" />
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold text-[#0b1c30]">{a.value}</p>
                  <p className="text-xs text-[#484555]">{a.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0b1c30]">AI Recommendations</h2>
            <p className="text-sm text-[#484555]">Top potential matches from the matching engine</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {matches.slice(0, 4).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="bg-white p-5 rounded-2xl border border-[#c9c4d7]/30 hover:shadow-lg transition-all"
              style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex -space-x-3">
                  {[m.t1, m.t2].map((init, j) => (
                    <div
                      key={j}
                      className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold"
                      style={{
                        background: j === 0 ? "rgba(93,59,220,0.1)"  : "rgba(177,0,140,0.1)",
                        color:      j === 0 ? "#5d3bdc"               : "#b1008c",
                      }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(93,59,220,0.08)", color: "#5d3bdc" }}
                >
                  {m.score}%
                </span>
              </div>
              <p className="text-sm font-semibold text-[#0b1c30] mb-1">
                {m.school} &amp; {m.teacher}
              </p>
              <p className="text-xs text-[#484555] mb-3 italic">
                "{m.insight.slice(0, 60)}..."
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {m.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[10px] text-[#484555]">
                    {t}
                  </span>
                ))}
              </div>
              <Badge variant={m.status}>{m.status}</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
