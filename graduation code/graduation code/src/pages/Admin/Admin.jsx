import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, Shuffle, CreditCard,
  Star, Bell, Settings, Search, Plus, TrendingUp, Link2,
  Filter, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, MessageSquare, RefreshCw, Download,
  Zap, ArrowRight, Eye, Edit2, Trash2, Check, X, Save,
  ClipboardList, FileText, Shield, Camera, UserPlus, LogOut
} from "lucide-react";
import LogoutModal from "../../component/Logout card/LogoutModal";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const gradientBg = "linear-gradient(135deg, #4F39F6 0%, #9810FA 100%)";
const gradientText = { background: gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INIT_TEACHERS = [
  { id: 1, initials: "SM", color: "#5d3bdc", bg: "#e6deff", name: "Sarah Miller", email: "sarah.m@example.com", skills: ["ESL", "IELTS"], exp: "6 Years", personality: "The Protagonist (ENFP)", sub: "Premium", subPeriod: "Yearly", status: "active" },
  { id: 2, initials: "DC", color: "#b1008c", bg: "#ffd8ec", name: "David Chen", email: "d.chen@example.com", skills: ["Physics", "Math"], exp: "4 Years", personality: "The Logistician (ISTJ)", sub: "Basic", subPeriod: "Monthly", status: "expired" },
  { id: 3, initials: "EL", color: "#8d4b00", bg: "#ffdcc3", name: "Elena Lucas", email: "elena.edu@example.com", skills: ["Primary Ed", "Montessori"], exp: "12 Years", personality: "The Giver (ENFJ)", sub: "Premium", subPeriod: "Yearly", status: "active" },
  { id: 4, initials: "JB", color: "#484555", bg: "#e5eeff", name: "James Brown", email: "j.brown@example.com", skills: ["History", "Social Studies"], exp: "8 Years", personality: "The Architect (INTJ)", sub: "Basic", subPeriod: "Monthly", status: "pending" },
  { id: 5, initials: "AR", color: "#5d3bdc", bg: "#e6deff", name: "Aisha Rahman", email: "a.rahman@example.com", skills: ["Arabic", "ESL"], exp: "3 Years", personality: "The Mentor (ENFJ)", sub: "Premium", subPeriod: "Yearly", status: "active" },
];

const INIT_SCHOOLS = [
  { id: 1, initials: "GH", color: "#5d3bdc", bg: "#e6deff", name: "Greenwood High", city: "Berlin, Germany", type: "IB School", sub: "Gold", status: "active", teachers: 12, rating: 4.9 },
  { id: 2, initials: "NS", color: "#b1008c", bg: "#ffd8ec", name: "North Star Academy", city: "Munich, Germany", type: "STEAM Focus", sub: "Silver", status: "active", teachers: 8, rating: 4.7 },
  { id: 3, initials: "WA", color: "#8d4b00", bg: "#ffdcc3", name: "Westside Arts", city: "Hamburg, Germany", type: "Arts School", sub: "Gold", status: "active", teachers: 15, rating: 4.8 },
  { id: 4, initials: "BC", color: "#484555", bg: "#e5eeff", name: "Beacon College", city: "Frankfurt, Germany", type: "Comprehensive", sub: "Basic", status: "pending", teachers: 4, rating: 4.2 },
  { id: 5, initials: "RM", color: "#5d3bdc", bg: "#e6deff", name: "Royal Montessori", city: "Cologne, Germany", type: "Montessori", sub: "Silver", status: "active", teachers: 7, rating: 4.6 },
];

const INIT_MATCHES = [
  { id: 1, t1: "GH", t2: "SJ", school: "Greenwood High", teacher: "Sarah Jenkins", score: 98, tags: ["Mathematics", "IB Curriculum"], insight: "Perfect skills alignment and complementary teaching philosophies detected.", status: "pending" },
  { id: 2, t1: "NS", t2: "DC", school: "North Star Academy", teacher: "David Chen", score: 94, tags: ["Physics", "Leadership"], insight: "High leadership compatibility score matches Senior Head of Science role.", status: "pending" },
  { id: 3, t1: "WA", t2: "ER", school: "Westside Arts", teacher: "Elena Rossi", score: 91, tags: ["Fine Arts", "Berlin-based"], insight: "Geographic proximity reduces relocation friction. Studio art is a direct match.", status: "approved" },
];

const INIT_NOTIFICATIONS = [
  { id: 1, icon: Shuffle, iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.1)", title: "New Match Found", body: "AI engine found a 96% compatibility match between Beacon College and James Miller.", time: "5 min ago", unread: true, actions: ["Review Match", "Dismiss"] },
  { id: 2, icon: Users, iconColor: "#b1008c", iconBg: "rgba(177,0,140,0.1)", title: "Teacher Application Pending", body: "Aisha Rahman completed her profile and is awaiting admin approval.", time: "1 hr ago", unread: true, actions: ["View Profile"] },
  { id: 3, icon: CreditCard, iconColor: "#059669", iconBg: "rgba(5,150,105,0.1)", title: "Subscription Renewed", body: "Royal Montessori successfully renewed their Silver plan for another year.", time: "3 hrs ago", unread: false, actions: [] },
  { id: 4, icon: Star, iconColor: "#d97706", iconBg: "rgba(217,119,6,0.1)", title: "New School Review", body: "Greenwood High left a 5-star review for Sarah Jenkins. Match #4421 closed.", time: "Yesterday", unread: false, actions: [] },
  { id: 5, icon: Settings, iconColor: "#484555", iconBg: "rgba(72,69,85,0.1)", title: "System Maintenance Completed", body: "Scheduled maintenance window completed. All systems operating normally.", time: "2 days ago", unread: false, actions: [] },
];

const INIT_FEEDBACK = [
  { id: 1, initials: "SJ", color: "#5d3bdc", bg: "#e6deff", name: "Sarah Jenkins", school: "Greenwood High", rating: 5, text: "Absolutely exceptional teacher. Her methodology transformed our students' engagement levels entirely.", time: "2 days ago", critical: false },
  { id: 2, initials: "MC", color: "#b1008c", bg: "#ffd8ec", name: "Michael Chen", school: "North Star Academy", rating: 4, text: "Very professional and knowledgeable. Minor communication issues at the start but resolved quickly.", time: "4 days ago", critical: false },
  { id: 3, initials: "ER", color: "#ba1a1a", bg: "#ffdad6", name: "Elena Rodriguez", school: "Westside Arts", rating: 2, text: "Unfortunately did not meet the school's expectations. Cultural fit was a significant challenge.", time: "1 week ago", critical: true },
  { id: 4, initials: "LW", color: "#059669", bg: "rgba(5,150,105,0.1)", name: "Linda Wu", school: "Royal Montessori", rating: 5, text: "A perfect match from day one. Linda's Montessori expertise is exactly what our school needed.", time: "2 weeks ago", critical: false },
];

const INIT_POSTS = [
  { id: 1, initials: "SE", color: "#5d3bdc", bg: "#e6deff", school: "Star English Academy", city: "Ho Chi Minh City, VN", position: "Senior ESL Teacher", salary: "$2,800 - $3,500 /mo", date: "Oct 24, 2023", status: "pending" },
  { id: 2, initials: "LB", color: "#b1008c", bg: "#ffd8ec", school: "Little Bears Kindergarten", city: "Bangkok, TH", position: "Early Childhood Educator", salary: "$2,200 - $2,600 /mo", date: "Oct 23, 2023", status: "pending" },
  { id: 3, initials: "GV", color: "#8d4b00", bg: "#ffdcc3", school: "Global Voices International", city: "Hanoi, VN", position: "IELTS Exam Specialist", salary: "$3,000 - $4,200 /mo", date: "Oct 23, 2023", status: "pending" },
  { id: 4, initials: "ES", color: "#484555", bg: "#e5eeff", school: "Elite Scholars Prep", city: "Seoul, KR", position: "Academic Writing Coach", salary: "$3,500 - $4,000 /mo", date: "Oct 22, 2023", status: "pending" },
  { id: 5, initials: "BI", color: "#5d3bdc", bg: "#e6deff", school: "Bright Minds Institute", city: "Tokyo, JP", position: "Science Curriculum Designer", salary: "$4,000 - $5,000 /mo", date: "Oct 21, 2023", status: "pending" },
  { id: 6, initials: "AS", color: "#b1008c", bg: "#ffd8ec", school: "Asia Pacific School", city: "Singapore, SG", position: "Mathematics Department Head", salary: "$5,000 - $6,500 /mo", date: "Oct 20, 2023", status: "approved" },
];

const EMPTY_TEACHER = { name: "", email: "", skills: "", exp: "", personality: "", sub: "Basic", subPeriod: "Monthly", status: "pending" };
const EMPTY_SCHOOL = { name: "", city: "", type: "", sub: "Basic", status: "pending", teachers: 0, rating: 0 };

// ─── Data normalizers: map DB column names → UI field names ──────────────────
function _initials(name) {
  return (name || "?").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}
function _timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days <= 0) return "Today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const w = Math.floor(days / 7);
  return `${w} week${w > 1 ? "s" : ""} ago`;
}
function normalizeTeacher(t) {
  const name = t.Name ?? t.name ?? "";
  return {
    id: t.Teacher_ID ?? t.id,
    Teacher_ID: t.Teacher_ID ?? t.id,
    name,
    email: t.Email ?? t.email ?? "",
    role: (t.Role ?? t.role ?? "teacher").toLowerCase(),
    location: t.Location ?? t.location ?? "",
    specialization: t.Specialization ?? t.specialization ?? "",
    teacher_stage: t.Teacher_Stage ?? t.teacher_stage ?? null,
    status: (t.Status ?? t.status ?? "active").toLowerCase(),
    sub: t.sub ?? "Basic",
    subPeriod: t.subPeriod ?? "Monthly",
    exp: t.Years_of_Experience ? `${t.Years_of_Experience} Yrs` : (t.exp ?? ""),
    skills: Array.isArray(t.skills) ? t.skills : t.Specialization ? [t.Specialization] : [],
    personality: t.personality ?? "",
    initials: _initials(name),
    color: "#5d3bdc",
    bg: "#e6deff",
  };
}
function normalizeSchool(s) {
  const name = s.School_Name ?? s.Name ?? s.name ?? "";
  return {
    id: s.Teacher_ID ?? s.id,
    Teacher_ID: s.Teacher_ID ?? s.id,
    name,
    email: s.Email ?? s.email ?? "",
    city: s.Location ?? s.location ?? s.city ?? "",
    type: s.School_Type ?? s.type ?? "",
    status: (s.Status ?? s.status ?? "active").toLowerCase(),
    sub: s.sub ?? "Basic",
    teachers: s.teachers ?? 0,
    rating: parseFloat(s.Average_Rating ?? s.rating ?? 0),
    initials: _initials(name),
    color: "#5d3bdc",
    bg: "#e6deff",
  };
}
function normalizeJob(j) {
  const title = j.Title ?? j.title ?? j.position ?? "";
  return {
    id: j.Job_ID ?? j.id,
    Job_ID: j.Job_ID ?? j.id,
    School_ID: j.School_ID,
    school: j.school ?? j.School_Name ?? `School #${j.School_ID}`,
    position: title,
    city: j.Location ?? j.location ?? j.city ?? "",
    salary: j.Salary_Range ? `${j.Salary_Range} EGP` : (j.salary ?? ""),
    date: j.Date ? new Date(j.Date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (j.date ?? ""),
    status: (j.Status ?? j.status ?? "pending").toLowerCase(),
    required_stage: j.Required_Stage ?? j.required_stage ?? null,
    initials: _initials(title),
    color: "#5d3bdc",
    bg: "#e6deff",
  };
}
function normalizeFeedback(f) {
  const name = f.reviewer_name ?? f.name ?? "Anonymous";
  const rating = parseFloat(f.rating) || 0;
  return {
    id: f.id,
    name,
    school: f.job_title ?? f.school ?? "",
    rating,
    text: f.comment ?? f.text ?? "",
    time: _timeAgo(f.createdAt),
    critical: rating > 0 && rating < 3,
    initials: _initials(name),
    color: rating < 3 ? "#ba1a1a" : "#5d3bdc",
    bg: rating < 3 ? "#ffdad6" : "#e6deff",
  };
}
function buildMatchesFromApps(apps, teachers, jobs) {
  return apps.map((app, idx) => {
    const teacher = teachers.find(t => t.id === app.Teacher_ID);
    const job = jobs.find(j => j.id === app.Job_ID);
    const teacherName = teacher?.name ?? `Teacher #${app.Teacher_ID}`;
    const schoolName = job?.school ?? `School #${app.School_ID}`;
    const score = app.Big5_Score ? Math.round(parseFloat(app.Big5_Score)) : 0;
    return {
      id: `${app.Teacher_ID}-${app.Job_ID}-${idx}`,
      t1: _initials(schoolName),
      t2: _initials(teacherName),
      school: schoolName,
      teacher: teacherName,
      score,
      tags: job?.position ? [job.position] : [],
      insight: score > 0 ? `AI compatibility score: ${score}%.` : "Application submitted, awaiting AI analysis.",
      status: (app.Status ?? "pending").toLowerCase() === "pending" ? "pending" : "approved",
    };
  });
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconColor, iconBg, label, value, trend, trendColor = "text-green-600", trendBg = "bg-green-50" }) {
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

function Badge({ children, variant = "active" }) {
  const v = { active: "bg-green-100 text-green-700", expired: "bg-[#ffdad6] text-[#ba1a1a]", pending: "bg-amber-100 text-amber-700", premium: "bg-[#e6deff] text-[#5d3bdc]", basic: "bg-[#eff4ff] text-[#484555]", gold: "bg-amber-50 text-amber-600", silver: "bg-slate-100 text-slate-600", approved: "bg-green-100 text-green-700", rejected: "bg-[#ffdad6] text-[#ba1a1a]" };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${v[variant] || v.active}`}>{children}</span>;
}

function GradientButton({ children, onClick, className = "", type = "button" }) {
  return (
    <motion.button type={type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`text-white font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg ${className}`}
      style={{ background: gradientBg, boxShadow: "0 4px 14px rgba(93,59,220,0.3)" }}>
      {children}
    </motion.button>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ open, title, body, onConfirm, onCancel }) {
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

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  const colors = { success: "bg-green-600", error: "bg-[#ba1a1a]", info: "bg-[#5d3bdc]" };
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${colors[type]}`}>
      {type === "success" && <Check size={16} />}
      {type === "error" && <X size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Field Input ──────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, options, required, placeholder }) {
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

// ─── Teacher Modal ────────────────────────────────────────────────────────────
function TeacherModal({ open, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_TEACHER);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  if (!open) return null;
  const isEdit = !!initial?.id;

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    onSave({ ...form, initials, color: "#5d3bdc", bg: "#e6deff", skills: typeof form.skills === "string" ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : form.skills });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[#c9c4d7]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#0b1c30]">{isEdit ? "Edit Teacher" : "Add New Teacher"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#484555]"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="Full Name" value={form.name} onChange={set("name")} required /></div>
          <div className="col-span-2"><Field label="Email" value={form.email} onChange={set("email")} type="email" required /></div>
          <Field label="Experience" value={form.exp} onChange={set("exp")} />
          <Field label="Skills (comma separated)" value={typeof form.skills === "string" ? form.skills : form.skills?.join(", ")} onChange={set("skills")} />
          <Field label="Personality" value={form.personality} onChange={set("personality")}
            options={["The Mentor (ENFJ)", "The Logistician (ISTJ)", "The Protagonist (ENFP)", "The Architect (INTJ)", "The Giver (ENFJ)"]} />
          <Field label="Status" value={form.status} onChange={set("status")} options={["active", "pending", "expired"]} />
          <Field label="Subscription" value={form.sub} onChange={set("sub")} options={["Basic", "Premium", "Gold"]} />
          <Field label="Period" value={form.subPeriod} onChange={set("subPeriod")} options={["Monthly", "Yearly"]} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#f8f9ff] transition-colors">Cancel</button>
          <GradientButton onClick={handleSubmit} className="flex-1 justify-center"><Save size={14} /> {isEdit ? "Save Changes" : "Add Teacher"}</GradientButton>
        </div>
      </motion.div>
    </div>
  );
}

// ─── School Modal ─────────────────────────────────────────────────────────────
function SchoolModal({ open, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_SCHOOL);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  if (!open) return null;
  const isEdit = !!initial?.id;

  const handleSubmit = () => {
    if (!form.name || !form.city) return;
    const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    onSave({ ...form, initials, color: "#5d3bdc", bg: "#e6deff", rating: parseFloat(form.rating) || 0, teachers: parseInt(form.teachers) || 0 });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[#c9c4d7]/40">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#0b1c30]">{isEdit ? "Edit School" : "Add New School"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#484555]"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="School Name" value={form.name} onChange={set("name")} required /></div>
          <div className="col-span-2"><Field label="City" value={form.city} onChange={set("city")} required /></div>
          <Field label="Type" value={form.type} onChange={set("type")} options={["IB School", "STEAM Focus", "Arts School", "Comprehensive", "Montessori"]} />
          <Field label="Status" value={form.status} onChange={set("status")} options={["active", "pending", "expired"]} />
          <Field label="Subscription" value={form.sub} onChange={set("sub")} options={["Basic", "Silver", "Gold", "Enterprise"]} />
          <Field label="Teachers #" value={form.teachers} onChange={set("teachers")} type="number" />
          <Field label="Rating (0–5)" value={form.rating} onChange={set("rating")} type="number" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#f8f9ff] transition-colors">Cancel</button>
          <GradientButton onClick={handleSubmit} className="flex-1 justify-center"><Save size={14} /> {isEdit ? "Save Changes" : "Add School"}</GradientButton>
        </div>
      </motion.div>
    </div>
  );
}

// ─── New Admin Modal ───────────────────────────────────────────────────────────
function NewAdminModal({ open, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Administrator", password: "", confirm: "" });
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return;
    if (form.password !== form.confirm) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#c9c4d7]/40">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#0b1c30]">Add New Admin</h3>
            <p className="text-xs text-[#484555] mt-0.5">Create a new administrator account</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#484555]"><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. John Smith" />
          <Field label="Email Address" value={form.email} onChange={set("email")} type="email" required placeholder="admin@ninjateacher.com" />
          <Field label="Role" value={form.role} onChange={set("role")} options={["Master Administrator", "Administrator", "Moderator"]} />
          <Field label="Password" value={form.password} onChange={set("password")} type="password" required placeholder="Min 8 characters" />
          <Field label="Confirm Password" value={form.confirm} onChange={set("confirm")} type="password" required placeholder="Re-type password" />
          {form.password && form.confirm && form.password !== form.confirm && (
            <p className="text-xs text-[#ba1a1a] flex items-center gap-1"><AlertCircle size={12} />Passwords do not match</p>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#f8f9ff] transition-colors">Cancel</button>
          <GradientButton onClick={handleSubmit} className="flex-1 justify-center"><UserPlus size={14} />Create Admin</GradientButton>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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

function Sidebar({ activePage, onNavigate, notifCount, onNewAdmin }) {
  const pendingNotif = activePage === "notifications" ? 0 : notifCount;

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-screen w-[260px] bg-white flex flex-col py-6 z-50"
        style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.08)" }}
      >
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold" style={gradientText}>Ninja Teacher</h1>
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#484555]/70 mt-1">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = activePage === key;
            return (
              <motion.button
                key={key}
                onClick={() => onNavigate(key)}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all relative ${active
                    ? "text-[#5d3bdc] font-bold"
                    : "text-[#484555] hover:bg-[#eff4ff]"
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(93,59,220,0.08)" }}
                  />
                )}

                {active && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: gradientBg }}
                  />
                )}

                <Icon size={18} className="relative z-10" />
                <span className="text-sm relative z-10 flex-1">{label}</span>

                {key === "notifications" && pendingNotif > 0 && (
                  <span
                    className="relative z-10 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: gradientBg }}
                  >
                    {pendingNotif}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="px-4 mt-4 space-y-3">
          {activePage === "settings" && (
            <motion.button
              onClick={onNewAdmin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{
                background: gradientBg,
                boxShadow: "0 4px 14px rgba(93,59,220,0.3)"
              }}
            >
              <Plus size={16} /> New Admin
            </motion.button>
          )}

          <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#c9c4d7]/40 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: gradientBg }}
            >
              AS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[#0b1c30] truncate">Admin Sarah</p>
              <p className="text-[10px] text-[#484555]/70">Global Manager</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#484555] text-sm font-semibold hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </>
  );
}

function TopNav({ placeholder = "Search teachers, schools, matches...", onNavigate }) {
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

function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }} className="pt-[calc(72px+32px)] px-8 pb-8 max-w-[1400px] mx-auto">
      {children}
    </motion.div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ teachers, schools, matches }) {
  const active = teachers.filter((t) => (t.Status || t.status) === "active").length;
  const approved = matches.filter((m) => m.status === "approved").length;
  const subs = teachers.filter((t) => t.sub === "Premium" || t.sub === "Gold").length;

  const activities = [
    { icon: Users, iconBg: "rgba(93,59,220,0.1)", iconColor: "#5d3bdc", text: "Total active teachers in the platform.", time: "Live" },
    { icon: CheckCircle, iconBg: "rgba(5,150,105,0.1)", iconColor: "#059669", text: "Approved matches so far.", time: "Live" },
    { icon: Building2, iconBg: "rgba(177,0,140,0.1)", iconColor: "#b1008c", text: "Partner schools onboarded.", time: "Live" },
    { icon: CreditCard, iconBg: "rgba(141,75,0,0.08)", iconColor: "#8d4b00", text: "Premium subscribers.", time: "Live" },
  ];
  const liveVals = [active, approved, schools.length, subs];

  return (
    <PageWrapper>
      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { icon: Users, iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.1)", label: "Total Teachers", value: teachers.length.toLocaleString(), trend: `${active} active`, trendColor: "text-green-600", trendBg: "bg-green-50" },
          { icon: Building2, iconColor: "#b1008c", iconBg: "rgba(177,0,140,0.1)", label: "Total Schools", value: schools.length.toLocaleString(), trend: `+${schools.filter((s) => (s.Status || s.status) === "active").length} active` },
          { icon: Link2, iconColor: "#8d4b00", iconBg: "rgba(141,75,0,0.1)", label: "Active Matches", value: approved.toLocaleString(), trend: `${matches.length} total` },
          { icon: CreditCard, iconColor: "#5d3bdc", iconBg: "rgba(93,59,220,0.08)", label: "Premium Subs", value: subs.toLocaleString(), trend: "Active" },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
              <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2"><TrendingUp size={14} style={{ color: "#5d3bdc" }} />Teachers per Subject</h4>
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {[{ l: "Math", h: "80%", c: "rgba(93,59,220,0.2)", v: 450 }, { l: "Science", h: "65%", c: "rgba(177,0,140,0.2)", v: 320 }, { l: "Arts", h: "95%", c: "rgba(141,75,0,0.2)", v: 580 }, { l: "Lang", h: "50%", c: "rgba(93,59,220,0.15)", v: 210 }].map(b => (
                  <div key={b.l} className="w-full flex flex-col items-center group">
                    <div className="w-full rounded-t-lg transition-colors relative" style={{ height: b.h, background: b.c }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-[#0b1c30] text-white px-1.5 py-0.5 rounded">{b.v}</div>
                    </div>
                    <span className="text-[10px] mt-2 text-[#484555]">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
              <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2"><Star size={14} style={{ color: "#b1008c" }} />Teacher Personality</h4>
              <div className="flex items-center gap-6 h-40">
                <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e6deff" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#ffd8ec" strokeWidth="14" strokeDasharray="238" strokeDashoffset="137" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#cbdbf5" strokeWidth="14" strokeDasharray="238" strokeDashoffset="183" transform="rotate(128 50 50)" />
                  <text x="50" y="54" textAnchor="middle" fontSize="9" fill="#484555">Active</text>
                </svg>
                <div className="space-y-2">
                  {[{ c: "#5d3bdc", l: "Leader (42%)" }, { c: "#b1008c", l: "Creative (35%)" }, { c: "#cbdbf5", l: "Calm (23%)" }].map(item => (
                    <div key={item.l} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: item.c }} /><span className="text-[11px] text-[#484555]">{item.l}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
            <h4 className="text-sm font-semibold text-[#0b1c30] mb-5 flex items-center gap-2"><TrendingUp size={14} style={{ color: "#8d4b00" }} />Matching Success Rate (6 Months)</h4>
            <div className="h-44 relative">
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lg1" x1="0%" x2="100%" y1="0%" y2="0%"><stop offset="0%" stopColor="#5d3bdc" /><stop offset="50%" stopColor="#b1008c" /><stop offset="100%" stopColor="#fd4ccb" /></linearGradient>
                  <linearGradient id="lgFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5d3bdc" stopOpacity="0.1" /><stop offset="100%" stopColor="#5d3bdc" stopOpacity="0" /></linearGradient>
                </defs>
                {[0, 35, 70, 105].map(y => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />)}
                <path d="M 0 100 C 60 120 80 80 120 70 S 200 40 240 50 S 340 80 380 30 S 480 5 600 40" fill="url(#lgFill)" />
                <path d="M 0 100 C 60 120 80 80 120 70 S 200 40 240 50 S 340 80 380 30 S 480 5 600 40" fill="none" stroke="url(#lg1)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between mt-2 text-[10px] text-[#484555] uppercase tracking-widest">
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN"].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30 flex flex-col" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <h4 className="text-sm font-semibold text-[#0b1c30] mb-5">Live Stats</h4>
          <div className="flex-1 space-y-5">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: a.iconBg }}>
                    <a.icon size={16} style={{ color: a.iconColor }} />
                  </div>
                  {i < activities.length - 1 && <div className="absolute top-9 left-1/2 -translate-x-1/2 w-px h-5 bg-[#c9c4d7]/40" />}
                </div>
                <div>
                  <p className="text-xl font-bold text-[#0b1c30]">{liveVals[i]}</p>
                  <p className="text-xs text-[#484555]">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0b1c30]">AI Recommendations</h2>
            <p className="text-sm text-[#484555]">Top potential matches from the matching engine</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {matches.slice(0, 4).map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl border border-[#c9c4d7]/30 hover:shadow-lg transition-all"
              style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex -space-x-3">
                  {[m.t1, m.t2].map((init, j) => (
                    <div key={j} className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold"
                      style={{ background: j === 0 ? "rgba(93,59,220,0.1)" : "rgba(177,0,140,0.1)", color: j === 0 ? "#5d3bdc" : "#b1008c" }}>{init}</div>
                  ))}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(93,59,220,0.08)", color: "#5d3bdc" }}>{m.score}%</span>
              </div>
              <p className="text-sm font-semibold text-[#0b1c30] mb-1">{m.school} & {m.teacher}</p>
              <p className="text-xs text-[#484555] mb-3 italic">"{m.insight.slice(0, 60)}..."</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {m.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[10px] text-[#484555]">{t}</span>)}
              </div>
              <Badge variant={m.status}>{m.status}</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── TEACHERS PAGE ─────────────────────────────────────────────────────────────
function TeachersPage({ teachers, onAdd, onEdit, onDelete }) {
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSub, setFilterSub] = useState("All");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchS = filterSub === "All" || t.sub === filterSub;
    return matchQ && matchS;
  });

  const handleSave = (data) => {
    if (data.id) onEdit(data); else onAdd(data);
    setModal(null);
  };

  return (
    <PageWrapper>
      <TeacherModal open={!!modal} initial={modal === "add" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      <ConfirmModal open={!!confirm} title="Delete Teacher?" body="This action cannot be undone. The teacher's data will be permanently removed."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">Teachers</h2>
          <p className="text-sm text-[#484555] mt-1">Manage, screen, and monitor your global educator network.</p>
        </div>
        <GradientButton onClick={() => setModal("add")}><Plus size={16} />Add Teacher</GradientButton>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#c9c4d7]/30 mb-6 flex flex-wrap items-end gap-4"
        style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[11px] font-semibold text-[#484555] tracking-wide">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9c4d7]" />
            <input className="w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
              placeholder="Name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 w-40">
          <label className="text-[11px] font-semibold text-[#484555] tracking-wide">Subscription</label>
          <select className="bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
            value={filterSub} onChange={(e) => setFilterSub(e.target.value)}>
            {["All", "Basic", "Premium", "Gold"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <button onClick={() => { setSearch(""); setFilterSub("All"); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e5eeff] text-[#5d3bdc] rounded-xl text-sm font-semibold hover:bg-[#dce9ff]">
          <Filter size={14} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <KpiCard icon={Users} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Total" value={teachers.length} trend={`${teachers.filter((t) => t.status === "active").length} active`} />
        <KpiCard icon={Star} iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)" label="Premium" value={teachers.filter((t) => t.sub === "Premium").length} trend="subscribers" trendColor="text-[#b1008c]" trendBg="bg-[#ffd8ec]" />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Active" value={teachers.filter((t) => t.status === "active").length} trend="placed" />
        <KpiCard icon={AlertCircle} iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)" label="Pending" value={teachers.filter((t) => t.status === "pending").length} trend="review" trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
      </div>

      <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#484555] text-sm">No teachers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#eff4ff]/50">
                  {["Name", "Skills", "Exp.", "Personality", "Subscription", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold tracking-wide text-[#484555] border-b border-[#c9c4d7]/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9c4d7]/20">
                {filtered.map((t, i) => (
                  <motion.tr key={t.id} className="hover:bg-[#f8f9ff] transition-colors group relative"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: t.bg, color: t.color }}>{t.initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-[#0b1c30]">{t.name}</p>
                          <p className="text-xs text-[#484555]/70">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.skills || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: "rgba(93,59,220,0.05)", color: "#5d3bdc", borderColor: "rgba(93,59,220,0.15)" }}>{s}</span>
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
                        <button onClick={() => setModal(t)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#5d3bdc] transition-colors" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => setConfirm(t.id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors" title="Delete"><Trash2 size={14} /></button>
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

// ─── SCHOOLS PAGE ──────────────────────────────────────────────────────────────
function SchoolsPage({ schools, onAdd, onEdit, onDelete }) {
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = schools.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (data) => {
    if (data.id) onEdit(data); else onAdd(data);
    setModal(null);
  };

  return (
    <PageWrapper>
      <SchoolModal open={!!modal} initial={modal === "add" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      <ConfirmModal open={!!confirm} title="Delete School?" body="This will permanently remove the school and all associated data."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">Schools Directory</h2>
          <p className="text-sm text-[#484555] mt-1">Manage and monitor your partner school network.</p>
        </div>
        <GradientButton onClick={() => setModal("add")}><Plus size={16} />Add School</GradientButton>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <KpiCard icon={Building2} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Total Schools" value={schools.length} />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Active" value={schools.filter((s) => s.status === "active").length} />
        <KpiCard icon={Clock} iconColor="#d97706" iconBg="rgba(217,119,6,0.1)" label="Pending" value={schools.filter((s) => s.status === "pending").length} trendColor="text-amber-700" trendBg="bg-amber-50" />
        <KpiCard icon={Star} iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)" label="Gold Tier" value={schools.filter((s) => s.sub === "Gold").length} />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#c9c4d7]/30 mb-5 flex items-center gap-4"
        style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9c4d7]" />
          <input className="w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
            placeholder="Search schools…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#484555]">No schools found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eff4ff]/50">
                {["School", "Location", "Type", "Subscription", "Teachers", "Rating", "Status", "Actions"].map(h => (
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
        )}
      </div>
    </PageWrapper>
  );
}

// ─── MATCHING PAGE ─────────────────────────────────────────────────────────────
function MatchingPage({ matches, onApprove, onDismiss, onRunAI, onRefresh }) {
  return (
    <PageWrapper>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">AI Matching Recommendations</h2>
          <p className="text-sm text-[#484555] mt-1">Review and act on AI-generated teacher–school matches.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="px-5 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#eff4ff] flex items-center gap-2">
            <RefreshCw size={14} />Refresh
          </button>
          <GradientButton onClick={onRunAI}><Zap size={14} />Run AI Engine</GradientButton>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <KpiCard icon={Shuffle} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Total Matches" value={matches.length} />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Approved" value={matches.filter((m) => m.status === "approved").length} />
        <KpiCard icon={Clock} iconColor="#d97706" iconBg="rgba(217,119,6,0.1)" label="Pending Review" value={matches.filter((m) => m.status === "pending").length} trendColor="text-amber-700" trendBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {matches.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[m.t1, m.t2].map((init, j) => (
                    <div key={j} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                      style={{ background: j === 0 ? "rgba(93,59,220,0.1)" : "rgba(177,0,140,0.1)", color: j === 0 ? "#5d3bdc" : "#b1008c" }}>{init}</div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">{m.school}</p>
                  <p className="text-xs text-[#484555]">+ {m.teacher}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: "#5d3bdc" }}>{m.score}%</p>
                <p className="text-[10px] text-[#484555]">Match Score</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#eff4ff]/60 mb-4">
              <p className="text-xs font-semibold text-[#5d3bdc] mb-1">AI Insight</p>
              <p className="text-xs text-[#484555]">{m.insight}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {m.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[10px] text-[#484555]">{t}</span>)}
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
            {m.status === "approved" && (
              <div className="flex items-center gap-2 py-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-semibold text-green-600">Match Approved</span>
              </div>
            )}
          </motion.div>
        ))}
        {matches.length === 0 && (
          <div className="col-span-2 py-20 text-center text-sm text-[#484555]">No matches yet. Run the AI Engine to generate recommendations.</div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─── SUBSCRIPTIONS PAGE ────────────────────────────────────────────────────────
function SubscriptionsPage({ teachers }) {
  const premium = teachers.filter((t) => t.sub === "Premium");
  const gold = teachers.filter((t) => t.sub === "Gold");
  const basic = teachers.filter((t) => t.sub === "Basic");
  const revenue = premium.length * 49 + gold.length * 99 + basic.length * 19;

  return (
    <PageWrapper>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">Subscription Analytics</h2>
          <p className="text-sm text-[#484555] mt-1">Track revenue, renewals, and plan performance.</p>
        </div>
        <GradientButton><Download size={14} />Export Report</GradientButton>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <KpiCard icon={CreditCard} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Est. Monthly Revenue" value={`$${revenue.toLocaleString()}`} trend="+8.2%" />
        <KpiCard icon={Users} iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)" label="Active Subscribers" value={teachers.filter((t) => t.status === "active").length} />
        <KpiCard icon={XCircle} iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)" label="Expired" value={teachers.filter((t) => t.status === "expired").length} trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
        <KpiCard icon={TrendingUp} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Premium Rate" value={`${Math.round((premium.length / Math.max(teachers.length, 1)) * 100)}%`} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <h4 className="text-base font-bold text-[#0b1c30] mb-4">Subscription Tiers</h4>
          {[{ name: "Gold", price: "$99/mo", count: gold.length, c: "#d97706" }, { name: "Premium", price: "$49/mo", count: premium.length, c: "#5d3bdc" }, { name: "Basic", price: "$19/mo", count: basic.length, c: "#484555" }].map(tier => (
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

        <div className="col-span-2 bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#c9c4d7]/30 flex items-center justify-between">
            <h4 className="font-bold text-[#0b1c30]">Subscriber List</h4>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9ff]">
                {["Name", "Plan", "Period", "Status"].map(h => <th key={h} className="px-5 py-3 text-xs font-semibold tracking-wide text-[#484555]">{h}</th>)}
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
    </PageWrapper>
  );
}

// ─── FEEDBACK PAGE ──────────────────────────────────────────────────────────────
function FeedbackPage({ feedback, onDelete }) {
  const [confirm, setConfirm] = useState(null);

  return (
    <PageWrapper>
      <ConfirmModal open={!!confirm} title="Delete Review?" body="This feedback will be permanently deleted."
        onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">School Feedback</h2>
          <p className="text-sm text-[#484555] mt-1">Monitor satisfaction and address critical reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <KpiCard icon={MessageSquare} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)" label="Total Reviews" value={feedback.length} />
        <KpiCard icon={Star} iconColor="#d97706" iconBg="rgba(217,119,6,0.1)" label="5-Star Reviews" value={feedback.filter((f) => f.rating === 5).length} />
        <KpiCard icon={AlertCircle} iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)" label="Critical Reviews" value={feedback.filter((f) => f.critical).length} trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
        <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)" label="Avg Rating" value={feedback.length ? (feedback.reduce((a, f) => a + (parseFloat(f.rating) || 0), 0) / feedback.length).toFixed(1) : "N/A"} />
      </div>

      <div className="grid grid-cols-2 gap-5">
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
                <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-[#c9c4d7]"} />)}</div>
                <button onClick={() => setConfirm(r.id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm text-[#484555] mb-3 leading-relaxed">"{r.text}"</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#484555]/60">{r.time}</span>
              {r.critical && <motion.button whileTap={{ scale: 0.97 }} className="px-3.5 py-1.5 text-white text-xs font-bold rounded-full" style={{ background: gradientBg }}>Address Issue</motion.button>}
            </div>
          </motion.div>
        ))}
        {feedback.length === 0 && <div className="col-span-2 py-20 text-center text-sm text-[#484555]">No feedback yet.</div>}
      </div>
    </PageWrapper>
  );
}

// ─── NOTIFICATIONS PAGE ────────────────────────────────────────────────────────
function NotificationsPage({ notifications, onMarkRead, onDelete, onMarkAllRead, onClearAll, onNavigate }) {
  const [filter, setFilter] = useState("All Notifications");
  const filters = ["All Notifications", "Matches", "Approvals", "Billing"];

  const visible = notifications.filter((n) => {
    if (filter === "All Notifications") return true;
    if (filter === "Matches") return n.title.toLowerCase().includes("match");
    if (filter === "Approvals") return n.title.toLowerCase().includes("applic") || n.title.toLowerCase().includes("approv");
    if (filter === "Billing") return n.title.toLowerCase().includes("sub") || n.title.toLowerCase().includes("renew");
    return true;
  });

  return (
    <PageWrapper>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">System Alerts</h2>
          <p className="text-sm text-[#484555] mt-1">Stay up to date with matches, approvals, and billing.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onMarkAllRead} className="px-4 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#5d3bdc] hover:bg-[#eff4ff] flex items-center gap-2">
            <Check size={14} />Mark All Read
          </button>
          <button onClick={onClearAll} className="px-4 py-2.5 rounded-xl bg-[#ffdad6] text-sm font-semibold text-[#ba1a1a] hover:bg-[#ffc9c5] flex items-center gap-2">
            <Trash2 size={14} />Clear All
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? "text-white shadow-lg" : "bg-white border border-[#c9c4d7]/60 text-[#484555] hover:border-[#5d3bdc]/40"}`}
            style={filter === f ? { background: gradientBg } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {visible.map((n) => (
            <motion.div key={n.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className={`bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all ${n.unread ? "border-[#5d3bdc]/25" : "border-[#c9c4d7]/30"}`}
              style={n.unread ? { boxShadow: "0 2px 12px rgba(93,59,220,0.08)" } : {}}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? "" : "opacity-0"}`} style={{ background: "#5d3bdc" }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.iconBg }}>
                <n.icon size={18} style={{ color: n.iconColor }} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-bold ${n.unread ? "text-[#0b1c30]" : "text-[#484555]"}`}>{n.title}</h4>
                    <p className="text-sm text-[#484555] mt-0.5">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className="text-[11px] text-[#484555]/60">{n.time}</span>
                    {n.unread && (
                      <button onClick={() => onMarkRead(n.id)} className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#5d3bdc]" title="Mark read"><Check size={12} /></button>
                    )}
                    <button onClick={() => onDelete(n.id)} className="p-1 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Delete"><X size={12} /></button>
                  </div>
                </div>
                {n.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {n.actions.map((action, j) => (
                      <button key={j}
                        onClick={() => {
                          if (action === "Dismiss") onDelete(n.id);
                          else if (action === "Review Match") onNavigate?.("matching");
                          else if (action === "View Profile") onNavigate?.("teachers");
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${j === 0 ? "text-white" : "border border-[#c9c4d7]/60 text-[#484555] hover:bg-[#eff4ff]"}`}
                        style={j === 0 ? { background: gradientBg } : {}}>{action}</button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
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

// ─── POST APPROVALS PAGE ──────────────────────────────────────────────────────
function PostApprovalsPage({ posts, onApprove, onReject }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const filtered = posts.filter((p) =>
    p.school.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pending = posts.filter((p) => p.status === "pending").length;
  const approved = posts.filter((p) => p.status === "approved").length;
  const rejected = posts.filter((p) => p.status === "rejected").length;
  const rejRate = posts.length > 0 ? ((rejected / posts.length) * 100).toFixed(1) : "0.0";

  return (
    <PageWrapper>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">Post Approvals</h2>
          <p className="text-sm text-[#484555] mt-1 max-w-md">Review and manage job postings from partner schools. Ensure all listings meet the Ninja Teacher quality standards for ESL education.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#eff4ff] transition-colors">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#eff4ff] transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <KpiCard icon={ClipboardList} iconColor="#5d3bdc" iconBg="rgba(93,59,220,0.1)"
            label="PENDING POSTS" value={pending}
            trend={`+3 today`} trendColor="text-green-600" trendBg="bg-green-50" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <KpiCard icon={Clock} iconColor="#b1008c" iconBg="rgba(177,0,140,0.1)"
            label="AVG. REVIEW TIME" value="4.2h"
            trend="-12% vs last week" trendColor="text-[#b1008c]" trendBg="bg-[#ffd8ec]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <KpiCard icon={CheckCircle} iconColor="#059669" iconBg="rgba(5,150,105,0.1)"
            label="APPROVED THIS MONTH" value={186} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <KpiCard icon={XCircle} iconColor="#ba1a1a" iconBg="rgba(186,26,26,0.1)"
            label="REJECTION RATE" value={`${rejRate}%`}
            trendColor="text-[#ba1a1a]" trendBg="bg-[#ffdad6]" />
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#c9c4d7]/30 mb-5 flex items-center"
        style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484555]/50" />
          <input className="w-full bg-[#f8f9ff] border border-[#c9c4d7]/60 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30"
            placeholder="Search approvals..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(93,59,220,0.06)" }}>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f8f9ff] border-b border-[#c9c4d7]/30">
              {["School", "Position", "Date Posted", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-4 text-xs font-semibold tracking-wide text-[#484555]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c9c4d7]/20">
            {paginated.map((post, i) => (
              <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                className="hover:bg-[#f8f9ff] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: post.bg, color: post.color }}>{post.initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30]">{post.school}</p>
                      <p className="text-xs text-[#484555]">{post.city}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[#0b1c30]">{post.position}</p>
                  <p className="text-xs text-[#484555]">{post.salary}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#484555] whitespace-nowrap">{post.date}</td>
                <td className="px-5 py-4">
                  <Badge variant={post.status}>{post.status}</Badge>
                </td>
                <td className="px-5 py-4">
                  {post.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => onReject(post.id)}
                        className="px-4 py-2 rounded-xl border border-[#c9c4d7]/60 text-sm font-semibold text-[#484555] hover:bg-[#ffdad6] hover:text-[#ba1a1a] hover:border-[#ba1a1a]/30 transition-colors">
                        Reject
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => onApprove(post.id)}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{ background: gradientBg, boxShadow: "0 4px 12px rgba(93,59,220,0.3)" }}>
                        Approve
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant={post.status}>{post.status}</Badge>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-[#484555]">No posts found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-[#c9c4d7]/30 flex items-center justify-between">
            <p className="text-sm text-[#484555]">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#c9c4d7]/60 text-[#484555] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === p ? "text-white" : "border border-[#c9c4d7]/60 text-[#484555] hover:bg-[#eff4ff]"}`}
                  style={page === p ? { background: gradientBg } : {}}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#c9c4d7]/60 text-[#484555] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Review Assistant */}
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl"
        style={{ background: gradientBg, boxShadow: "0 8px 24px rgba(93,59,220,0.4)" }}>
        <Zap size={16} />Bulk Review Assistant
      </motion.button>
    </PageWrapper>
  );
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage({ adminProfile, onSaveProfile, showToast, admins, onAddAdmin }) {
  const [tab, setTab] = useState("profile");

  // Profile form state
  const [form, setForm] = useState({
    name: adminProfile.name,
    email: adminProfile.email,
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSaveProfile = () => {
    if (form.newPw && form.newPw !== form.confirmPw) {
      showToast("Passwords do not match.", "error");
      return;
    }
    onSaveProfile({ name: form.name, email: form.email });
    showToast("Profile updated successfully!");
    setForm(p => ({ ...p, currentPw: "", newPw: "", confirmPw: "" }));
  };

  const inputCls = "w-full bg-white border border-[#c9c4d7]/60 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5d3bdc]/30 text-[#0b1c30]";

  return (
    <PageWrapper>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0b1c30]">Admin Settings</h2>
        <p className="text-sm text-[#484555] mt-1">Manage your global portal preferences and administrator permissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#c9c4d7]/40 mb-8">
        {[{ id: "profile", label: "Profile Settings" }, { id: "management", label: "Admin Management" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`pb-4 text-sm font-semibold relative transition-colors ${tab === t.id ? "text-[#5d3bdc]" : "text-[#484555] hover:text-[#0b1c30]"}`}>
            {t.label}
            {tab === t.id && <motion.div layoutId="settingsTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: gradientBg }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="grid grid-cols-3 gap-6">
              {/* Left: Profile Form */}
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.06)" }}>
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#484555] tracking-wide">Full Name</label>
                    <input className={inputCls} value={form.name} onChange={(e) => set("name")(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#484555] tracking-wide">Email Address</label>
                    <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="text-xs font-semibold text-[#484555] tracking-wide block mb-1.5">Current Password</label>
                  <input className={inputCls} type="password" value={form.currentPw} onChange={(e) => set("currentPw")(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-5 mb-8">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#484555] tracking-wide">New Password</label>
                    <input className={inputCls} type="password" value={form.newPw} onChange={(e) => set("newPw")(e.target.value)} placeholder="Min 8 characters" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#484555] tracking-wide">Confirm New Password</label>
                    <input className={inputCls} type="password" value={form.confirmPw} onChange={(e) => set("confirmPw")(e.target.value)} placeholder="Re-type new password" />
                  </div>
                </div>
                {form.newPw && form.confirmPw && form.newPw !== form.confirmPw && (
                  <p className="text-xs text-[#ba1a1a] flex items-center gap-1 mb-4"><AlertCircle size={12} />Passwords do not match</p>
                )}
                <div className="flex justify-end">
                  <GradientButton onClick={handleSaveProfile}><Save size={14} />Save Changes</GradientButton>
                </div>
              </div>

              {/* Right: Profile Card + Security */}
              <div className="flex flex-col gap-5">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30 flex flex-col items-center text-center" style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.06)" }}>
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: gradientBg }}>
                        {form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    </div>
                  </div>
                  <p className="text-base font-bold text-[#0b1c30]">{form.name}</p>
                  <p className="text-xs text-[#484555] mb-5">{adminProfile.role}</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: gradientBg }}>
                    <Camera size={14} />Upload New Photo
                  </motion.button>
                </div>

                {/* Account Security */}
                <div className="bg-white p-6 rounded-2xl border border-[#c9c4d7]/30" style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.06)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} style={{ color: "#5d3bdc" }} />
                    <h4 className="text-sm font-bold text-[#0b1c30]">Account Security</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#484555]">Two-Factor Auth</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#484555]">Last login</span>
                      <span className="text-sm text-[#484555]">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "management" && (
          <motion.div key="management" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="bg-white rounded-2xl border border-[#c9c4d7]/30 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(93,59,220,0.06)" }}>
              <div className="px-6 py-5 border-b border-[#c9c4d7]/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0b1c30]">Administrator Accounts</h4>
                  <p className="text-xs text-[#484555] mt-0.5">Manage admin access and permissions</p>
                </div>
                <GradientButton onClick={onAddAdmin}><UserPlus size={14} />Add Admin</GradientButton>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8f9ff]">
                    {["Admin", "Email", "Role", "Last Active", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-xs font-semibold tracking-wide text-[#484555]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9c4d7]/20">
                  {admins.map((admin, i) => (
                    <motion.tr key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: gradientBg }}>
                            {admin.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-[#0b1c30]">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#484555]">{admin.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6deff] text-[#5d3bdc] uppercase tracking-wider">{admin.role}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#484555]">{admin.lastActive}</td>
                      <td className="px-5 py-4">
                        {admin.id !== 1 && (
                          <button className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"><Trash2 size={14} /></button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
let _nextId = 100;
const nextId = () => ++_nextId;

const ADMIN_API = "http://localhost:3000/admin";
function adminHeaders() {
  const t = localStorage.getItem("userToken");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [matches, setMatches] = useState(INIT_MATCHES);
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS);
  const [feedback, setFeedback] = useState([]);
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState(null);
  const [newAdminModal, setNewAdminModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ name: "", email: "", role: "Administrator" });
  const [admins, setAdmins] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Bootstrap: load real data from backend on mount ──────────────────────
  useEffect(() => {
    const h = adminHeaders();
    Promise.all([
      fetch(`${ADMIN_API}/users?role=teacher&limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${ADMIN_API}/users?role=school&limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${ADMIN_API}/jobs?limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`http://localhost:3000/reviews/testimonials`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${ADMIN_API}/applications?limit=50`, { headers: h }).then(r => r.json()).catch(() => null),
    ]).then(([tRes, sRes, jRes, fRes, aRes]) => {
      const ts = tRes?.data?.users ? tRes.data.users.map(normalizeTeacher) : [];
      const ss = sRes?.data?.users ? sRes.data.users.map(normalizeSchool) : [];
      const js = jRes?.data?.jobs  ? jRes.data.jobs.map(normalizeJob)  : [];
      const fs = fRes?.data        ? (Array.isArray(fRes.data) ? fRes.data : []).map(normalizeFeedback) : [];
      const as = aRes?.data?.applications ?? [];
      if (ts.length) setTeachers(ts);
      if (ss.length) setSchools(ss);
      if (js.length) setPosts(js);
      if (fs.length) setFeedback(fs);
      if (as.length) setMatches(buildMatchesFromApps(as, ts, js));
    });

    fetch(`${ADMIN_API}/auth/me`, { headers: adminHeaders() })
      .then(r => r.json())
      .then(res => { if (res?.data) setAdminProfile(res.data); })
      .catch(() => {});
  }, []);

  // Refresh matches from backend (used by Run AI Engine + Refresh buttons)
  const refreshMatches = useCallback(async () => {
    const h = adminHeaders();
    const [tRes, jRes, aRes] = await Promise.all([
      fetch(`${ADMIN_API}/users?role=teacher&limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${ADMIN_API}/jobs?limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${ADMIN_API}/applications?limit=50`, { headers: h }).then(r => r.json()).catch(() => null),
    ]);
    const ts = tRes?.data?.users ? tRes.data.users.map(normalizeTeacher) : teachers;
    const js = jRes?.data?.jobs  ? jRes.data.jobs.map(normalizeJob)  : posts;
    const as = aRes?.data?.applications ?? [];
    if (as.length) { setMatches(buildMatchesFromApps(as, ts, js)); showToast("Matches refreshed!"); }
    else showToast("No applications found.", "info");
  }, [teachers, posts, showToast]);

  // Run AI Engine — recomputes Big5_Score for all applications, then refreshes UI
  const runAIEngine = useCallback(async () => {
    showToast("Running AI matching engine…", "info");
    try {
      const res = await fetch(`${ADMIN_API}/run-ai-matching`, { method: "POST", headers: adminHeaders() });
      const data = await res.json();
      if (!res.ok) { showToast("AI engine error.", "error"); return; }
      const { updated, total } = data.data || {};
      // Now reload applications with newly computed scores
      const h = adminHeaders();
      const [tRes, jRes, aRes] = await Promise.all([
        fetch(`${ADMIN_API}/users?role=teacher&limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
        fetch(`${ADMIN_API}/jobs?limit=100`, { headers: h }).then(r => r.json()).catch(() => null),
        fetch(`${ADMIN_API}/applications?limit=50`, { headers: h }).then(r => r.json()).catch(() => null),
      ]);
      const ts = tRes?.data?.users ? tRes.data.users.map(normalizeTeacher) : teachers;
      const js = jRes?.data?.jobs  ? jRes.data.jobs.map(normalizeJob)  : posts;
      const as = aRes?.data?.applications ?? [];
      if (as.length) setMatches(buildMatchesFromApps(as, ts, js));
      showToast(`AI engine done — ${updated}/${total} scores updated.`);
    } catch { showToast("AI engine failed.", "error"); }
  }, [teachers, posts, showToast]);

  // Teachers CRUD
  const addTeacher = async (t) => {
    try {
      const res = await fetch(`${ADMIN_API}/users`, { method: "POST", headers: adminHeaders(), body: JSON.stringify({ ...t, role: "teacher" }) });
      const data = await res.json();
      if (data?.data) setTeachers(p => [...p, data.data]);
      showToast("Teacher added successfully!");
    } catch { showToast("Failed to add teacher.", "error"); }
  };
  const editTeacher = async (t) => {
    try {
      const id = t.id || t.Teacher_ID;
      const res = await fetch(`${ADMIN_API}/users/${id}`, { method: "PUT", headers: adminHeaders(), body: JSON.stringify(t) });
      const data = await res.json();
      if (data?.data) setTeachers(p => p.map(x => (x.id === id || x.Teacher_ID === id) ? data.data : x));
      showToast("Teacher updated!");
    } catch { showToast("Failed to update teacher.", "error"); }
  };
  const deleteTeacher = async (id) => {
    try {
      await fetch(`${ADMIN_API}/users/${id}`, { method: "DELETE", headers: adminHeaders() });
      setTeachers(p => p.filter(x => x.id !== id && x.Teacher_ID !== id));
      showToast("Teacher deleted.", "error");
    } catch { showToast("Failed to delete teacher.", "error"); }
  };

  // Schools CRUD
  const addSchool = async (s) => {
    try {
      const res = await fetch(`${ADMIN_API}/users`, { method: "POST", headers: adminHeaders(), body: JSON.stringify({ ...s, role: "school" }) });
      const data = await res.json();
      if (data?.data) setSchools(p => [...p, data.data]);
      showToast("School added successfully!");
    } catch { showToast("Failed to add school.", "error"); }
  };
  const editSchool = async (s) => {
    try {
      const id = s.id || s.Teacher_ID;
      const res = await fetch(`${ADMIN_API}/users/${id}`, { method: "PUT", headers: adminHeaders(), body: JSON.stringify(s) });
      const data = await res.json();
      if (data?.data) setSchools(p => p.map(x => (x.id === id || x.Teacher_ID === id) ? data.data : x));
      showToast("School updated!");
    } catch { showToast("Failed to update school.", "error"); }
  };
  const deleteSchool = async (id) => {
    try {
      await fetch(`${ADMIN_API}/users/${id}`, { method: "DELETE", headers: adminHeaders() });
      setSchools(p => p.filter(x => x.id !== id && x.Teacher_ID !== id));
      showToast("School deleted.", "error");
    } catch { showToast("Failed to delete school.", "error"); }
  };

  // Matches — no bulk admin endpoint yet; keep local state
  const approveMatch = (id) => { setMatches(p => p.map(m => m.id === id ? { ...m, status: "approved" } : m)); showToast("Match approved!"); };
  const dismissMatch = (id) => { setMatches(p => p.filter(m => m.id !== id)); showToast("Match dismissed.", "info"); };

  // Notifications — keep local state (no admin-scoped notif endpoint needed)
  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, unread: false } : n));
  const deleteNotif = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread: false })));
  const clearAll = () => setNotifications([]);

  // Feedback — soft-delete via backend, then remove from local state
  const deleteFeedback = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/reviews/${id}`, { method: "DELETE", headers: adminHeaders() });
      if (!res.ok) { showToast("Failed to delete review.", "error"); return; }
      setFeedback(p => p.filter(f => f.id !== id));
      showToast("Review deleted.", "error");
    } catch { showToast("Failed to delete review.", "error"); }
  };

  // Posts — approve/reject via job-posts endpoint
  const approvePost = async (id) => {
    try {
      await fetch(`http://localhost:3000/admin/posts/${id}/approve`, { method: "PATCH", headers: adminHeaders() });
      setPosts(p => p.map(post => post.id === id ? { ...post, status: "approved" } : post));
      showToast("Post approved!");
    } catch {
      setPosts(p => p.map(post => post.id === id ? { ...post, status: "approved" } : post));
      showToast("Post approved!");
    }
  };
  const rejectPost = async (id) => {
    try {
      await fetch(`http://localhost:3000/admin/posts/${id}/reject`, { method: "PATCH", headers: adminHeaders() });
      setPosts(p => p.map(post => post.id === id ? { ...post, status: "rejected" } : post));
      showToast("Post rejected.", "error");
    } catch {
      setPosts(p => p.map(post => post.id === id ? { ...post, status: "rejected" } : post));
      showToast("Post rejected.", "error");
    }
  };

  // Admin profile
  const saveProfile = (data) => setAdminProfile(p => ({ ...p, ...data }));

  // New Admin
  const addAdmin = async (data) => {
    try {
      const res = await fetch(`${ADMIN_API}/users`, { method: "POST", headers: adminHeaders(), body: JSON.stringify({ ...data, role: "admin" }) });
      const json = await res.json();
      setAdmins(p => [...p, json?.data || { ...data, id: nextId(), lastActive: "Just now" }]);
    } catch {
      setAdmins(p => [...p, { id: nextId(), ...data, lastActive: "Just now" }]);
    }
    showToast(`Admin ${data.name} added successfully!`);
    setNewAdminModal(false);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const topNavPlaceholder = {
    postapprovals: "Search approvals...",
    settings: "Search parameters...",
    teachers: "Search teachers...",
    schools: "Search schools...",
  };

  const pages = {
    dashboard: <DashboardPage teachers={teachers} schools={schools} matches={matches} />,
    teachers: <TeachersPage teachers={teachers} onAdd={addTeacher} onEdit={editTeacher} onDelete={deleteTeacher} />,
    schools: <SchoolsPage schools={schools} onAdd={addSchool} onEdit={editSchool} onDelete={deleteSchool} />,
    matching: <MatchingPage matches={matches} onApprove={approveMatch} onDismiss={dismissMatch} onRunAI={runAIEngine} onRefresh={refreshMatches} />,
    subscriptions: <SubscriptionsPage teachers={teachers} />,
    feedback: <FeedbackPage feedback={feedback} onDelete={deleteFeedback} />,
    notifications: <NotificationsPage notifications={notifications} onMarkRead={markRead} onDelete={deleteNotif} onMarkAllRead={markAllRead} onClearAll={clearAll} onNavigate={setPage} />,
    postapprovals: <PostApprovalsPage posts={posts} onApprove={approvePost} onReject={rejectPost} />,
    settings: <SettingsPage adminProfile={adminProfile} onSaveProfile={saveProfile} showToast={showToast} admins={admins} onAddAdmin={() => setNewAdminModal(true)} />,
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff", fontFamily: "Inter,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <NewAdminModal open={newAdminModal} onSave={addAdmin} onClose={() => setNewAdminModal(false)} />
      <Sidebar activePage={page} onNavigate={setPage} notifCount={unreadCount} onNewAdmin={() => setNewAdminModal(true)} />
      <div className="ml-[260px]">
        <TopNav placeholder={topNavPlaceholder[page] || "Search teachers, schools, matches..."} onNavigate={setPage} />
        <AnimatePresence mode="wait">
          {pages[page]}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
