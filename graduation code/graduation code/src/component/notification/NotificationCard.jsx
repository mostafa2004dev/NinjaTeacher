import { useState } from "react";
import { FiClock, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import JobPostModal from "./JobPostModal";

export default function NotificationCard({
  title,
  desc,
  time,
  icon,
  unread,
  onRead,
  onDelete,
  job,        // ← بيانات البوست من الـ notification
}) {
  const [showModal, setShowModal] = useState(false);

  const hasJob = !!job;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.35 }}
        className="relative px-4 sm:px-6 py-4 sm:py-5 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300"
        style={{
          background: "var(--surface-card)",
          border: `1px solid ${unread ? "#E9D5FF" : "var(--border-default)"}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {unread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-2.5 h-2.5 bg-[#9810FA] rounded-full"
          />
        )}

        <div className="flex gap-3 sm:gap-4 items-start">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-lg sm:text-xl flex-shrink-0"
            style={{ background: "var(--surface-muted)" }}
          >
            {icon}
          </motion.div>

          <div className="min-w-0">
            <h3
              className="font-semibold text-sm sm:text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p
              className="text-xs sm:text-sm mt-1 max-w-md"
              style={{ color: "var(--text-secondary)" }}
            >
              {desc}
            </p>
            <div
              className="flex items-center gap-1 text-xs mt-2 sm:mt-3"
              style={{ color: "var(--text-muted)" }}
            >
              <FiClock />
              {time}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-auto">
          {/* ── View button — يظهر بس لو في job data ── */}
          {hasJob && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-[#9810FA] text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg shadow"
            >
              View
            </motion.button>
          )}

          {unread && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={onRead}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md hover:opacity-80"
              style={{ background: "rgba(0,153,102,0.1)", color: "#009966" }}
            >
              <FiCheck />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Modal ── */}
      {showModal && (
        <JobPostModal
          job={job}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}