import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function NotificationTabs({ notifications = [], children, onMarkAll }) {
  const [activeTab, setActiveTab] = useState("all");

  const allCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.is_read);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl px-4 sm:px-8 py-4 sm:py-5 mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex gap-2 sm:gap-3">
          {["all", "unread"].map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className="px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === tab ? "#9810FA" : "var(--surface-muted)",
                color: activeTab === tab ? "#fff" : "var(--text-secondary)",
              }}
            >
              {tab === "all" ? `All (${allCount})` : `Unread (${unreadCount})`}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMarkAll}
          className="flex items-center gap-2 text-[#9810FA] text-xs sm:text-sm font-semibold hover:opacity-80 transition self-start sm:self-auto"
        >
          <FiCheckCircle />
          Mark All as Read
        </motion.button>
      </motion.div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children(filtered)}
      </motion.div>
    </div>
  );
}