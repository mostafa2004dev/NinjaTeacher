import NotificationCard from "./NotificationCard";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICONS = {
  job_match: "💼",
  application_received: "📩",
  status_update: "🔔",
  new_application: "📋",
  subscription: "⭐",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationList({ notifications, onRead, onDelete }) {
  if (!notifications?.length) {
    return (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-6 text-sm sm:text-base"
        style={{ color: "var(--text-muted)" }}
      >
        No notifications yet
      </motion.p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className="space-y-3 sm:space-y-4"
    >
      <AnimatePresence>
        {notifications.map((item) => {
          const notifId = item.id || item.Notification_ID;

          // ── job data — بييجي جاهز من الـ backend في الـ notification ──
          const job = item.job || item.related?.job || null;

          return (
            <motion.div
              key={notifId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationCard
                title={item.title || item.Title}
                desc={item.message || item.Message}
                time={timeAgo(item.created_at || item.createdAt)}
                icon={TYPE_ICONS[item.type || item.Type] || "🔔"}
                unread={!item.is_read}
                job={job}
                onRead={() => onRead(notifId)}
                onDelete={() => onDelete(notifId)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}