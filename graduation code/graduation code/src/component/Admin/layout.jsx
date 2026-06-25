import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, Shuffle, CreditCard,
  Star, Bell, Settings, Search, Plus,
  ClipboardList, LogOut
} from "lucide-react";
import { gradientBg, gradientText } from "../ui/index";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "teachers", label: "Teachers", icon: Users },
  { key: "schools", label: "Schools", icon: Building2 },
  { key: "matching", label: "Matching System", icon: Shuffle },
  { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { key: "feedback", label: "Feedback", icon: Star },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "postapprovals", label: "Post Approvals", icon: ClipboardList },
  { key: "settings", label: "Settings", icon: Settings },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ activePage, onNavigate, notifCount, onNewAdmin }) {
  const pendingNotif = activePage === "notifications" ? 0 : notifCount;
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white flex flex-col py-6 z-50"
      style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.08)" }}>
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold" style={gradientText}>Ninja Teacher</h1>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#484555]/70 mt-1">Admin Portal</p>
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = activePage === key;
          return (
            <motion.button key={key} onClick={() => onNavigate(key)} whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all relative ${active ? "text-[#5d3bdc] font-bold" : "text-[#484555] hover:bg-[#eff4ff]"}`}>
              {active && <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl" style={{ background: "rgba(93,59,220,0.08)" }} />}
              {active && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" style={{ background: gradientBg }} />}
              <Icon size={18} className="relative z-10" />
              <span className="text-sm relative z-10 flex-1">{label}</span>
              {key === "notifications" && pendingNotif > 0 && (
                <span className="relative z-10 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: gradientBg }}>{pendingNotif}</span>
              )}
            </motion.button>
          );
        })}
      </nav>
      <div className="px-4 mt-4 space-y-3">
        {activePage === "settings" && (
          <motion.button onClick={onNewAdmin} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: gradientBg, boxShadow: "0 4px 14px rgba(93,59,220,0.3)" }}>
            <Plus size={16} /> New Admin
          </motion.button>
        )}
        <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#c9c4d7]/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: gradientBg }}>AS</div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-[#0b1c30] truncate">Admin Sarah</p>
            <p className="text-[10px] text-[#484555]/70">Global Manager</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#484555] text-sm font-semibold hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
export function TopNav({ placeholder = "Search teachers, schools, matches...", onNavigate }) {
  return (
    <header className="fixed top-0 right-0 h-[72px] bg-white/80 backdrop-blur-md border-b border-[#c9c4d7]/40 flex justify-between items-center px-8 z-40" style={{ width: "calc(100% - 260px)" }}>
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484555]/50" />
        <input className="w-full bg-[#eff4ff] border-none pl-9 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30" placeholder={placeholder} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("notifications")} className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#eff4ff]">
          <Bell size={18} className="text-[#484555]" />
        </button>
        <button onClick={() => onNavigate("settings")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#eff4ff]">
          <Settings size={18} className="text-[#484555]" />
        </button>
        <div className="h-6 w-px bg-[#c9c4d7]/60 mx-1" />
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#e6deff] flex items-center justify-center cursor-pointer">
          <span className="text-sm font-bold text-[#5d3bdc]">SJ</span>
        </div>
      </div>
    </header>
  );
}