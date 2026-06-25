import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Check, X, AlertCircle, Save, UserPlus
} from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const gradientBg = "linear-gradient(135deg, #4F39F6 0%, #9810FA 100%)";
export const gradientText = { background: gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };

// ─── KpiCard ──────────────────────────────────────────────────────────────────
export function KpiCard({ icon: Icon, iconColor, iconBg, label, value, trend, trendColor = "text-green-600", trendBg = "bg-green-50" }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 400 }}
      className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30 relative overflow-hidden cursor-default"
      style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.08)" }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-5" style={{ background: gradientBg }} />
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {trend && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trendColor} ${trendBg}`}>{trend}</span>}
      </div>
      <p className="text-xs font-semibold tracking-wide text-[#484555] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#0b1c30]">{value}</p>
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "active" }) {
  const v = { active:"bg-green-100 text-green-700", expired:"bg-[#ffdad6] text-[#ba1a1a]", pending:"bg-amber-100 text-amber-700", premium:"bg-[#e6deff] text-[#5d3bdc]", basic:"bg-[#eff4ff] text-[#484555]", gold:"bg-amber-50 text-amber-600", silver:"bg-slate-100 text-slate-600", approved:"bg-green-100 text-green-700", rejected:"bg-[#ffdad6] text-[#ba1a1a]" };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${v[variant]||v.active}`}>{children}</span>;
}

// ─── GradientButton ───────────────────────────────────────────────────────────
export function GradientButton({ children, onClick, className = "", type = "button" }) {
  return (
    <motion.button type={type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`text-white font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg ${className}`}
      style={{ background: gradientBg, boxShadow: "0 4px 14px rgba(93,59,220,0.3)" }}>
      {children}
    </motion.button>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ open, title, body, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100]">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl border border-[#c9c4d7]/40">
        <div className="w-12 h-12 rounded-full bg-[#ffdad6] flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-[#ba1a1a]" />
        </div>
        <h3 className="text-base font-bold text-[#0b1c30] mb-2">{title}</h3>
        <p className="text-sm text-[#484555] mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#f8f9ff] transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] text-white text-sm font-semibold hover:bg-[#9b1515] transition-colors">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  const colors = { success: "bg-green-600", error: "bg-[#ba1a1a]", info: "bg-[#5d3bdc]" };
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${colors[type]}`}>
      {type === "success" && <Check size={16} />}
      {type === "error"   && <X    size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, type = "text", value, onChange, options, required, placeholder }) {
  const cls = "w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#484555] tracking-wide">{label}{required && " *"}</label>
      {options ? (
        <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </div>
  );
}

// ─── PageWrapper ──────────────────────────────────────────────────────────────
export function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
      transition={{ duration:0.22 }} className="pt-[calc(72px+32px)] px-8 pb-8 max-w-[1400px] mx-auto">
      {children}
    </motion.div>
  );
}