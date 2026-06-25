import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiDollarSign, FiBriefcase, FiCalendar, FiBook } from "react-icons/fi";

// ─── config ─────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";

function resolveImage(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Badge({ children }) {
  return (
    <span
      className="inline-block text-xs font-medium px-3 py-1 rounded-full"
      style={{ background: "rgba(152,16,250,0.1)", color: "#9810FA" }}
    >
      {children}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-base"
        style={{ background: "var(--surface-muted)", color: "#9810FA" }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function JobPostModal({ job, onClose }) {
  if (!job) return null;

  const subjects = Array.isArray(job.subjects || job.Subjects)
    ? (job.subjects || job.Subjects)
    : [];

  const school = job.school || {};
  const schoolName  = school.school_name || school.name || "Unknown School";
  const schoolImage = resolveImage(school.image);
  const location    = job.location    || job.Location    || null;
  const salary      = job.salary_range || job.Salary_Range || null;
  const jobType     = job.job_type    || job.Job_Type    || null;
  const date        = job.date        || job.Date        || null;
  const title       = job.title       || job.Title       || "Job Post";
  const description = job.description || job.Description || job.content || job.Content || null;
  const status      = job.status      || job.Status      || null;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const statusColor =
    status === "active"
      ? { bg: "rgba(0,153,102,0.1)", text: "#009966" }
      : { bg: "rgba(200,50,50,0.1)", text: "#cc3300" };

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* ── Modal ── */}
        <motion.div
          key="modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          }}
        >
          {/* ── Close button ── */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <FiX />
          </motion.button>

          {/* ── Header ── */}
          <div
            className="px-6 pt-6 pb-5 rounded-t-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(152,16,250,0.08) 0%, transparent 70%)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            {/* School row */}
            <div className="flex items-center gap-3 mb-4">
              {schoolImage ? (
                <img
                  src={schoolImage}
                  alt={schoolName}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                  style={{ border: "2px solid rgba(152,16,250,0.2)" }}
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: "rgba(152,16,250,0.12)", color: "#9810FA" }}
                >
                  {schoolName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Posted by
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {schoolName}
                </p>
              </div>

              {status && (
                <span
                  className="ml-auto text-xs font-semibold px-3 py-1 rounded-full capitalize"
                  style={{ background: statusColor.bg, color: statusColor.text }}
                >
                  {status}
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              className="text-xl sm:text-2xl font-bold leading-snug pr-8"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<FiMapPin />}      label="Location"   value={location}      />
              <InfoRow icon={<FiDollarSign />}  label="Salary"     value={salary}        />
              <InfoRow icon={<FiBriefcase />}   label="Job Type"   value={jobType}       />
              <InfoRow icon={<FiCalendar />}    label="Posted On"  value={formattedDate} />
            </div>

            {/* Subjects */}
            {subjects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiBook size={14} style={{ color: "var(--text-muted)" }} />
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Subjects
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s, i) => (
                    <Badge key={i}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  About the Role
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="px-6 py-4 rounded-b-3xl"
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}