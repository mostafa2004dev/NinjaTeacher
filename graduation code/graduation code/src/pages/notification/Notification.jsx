import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "./hooks/useNotification";
import NotificationTabs from "../../component/notification/NotificationTabs";
import NotificationList from "../../component/notification/NotificationList";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../component/shared/animations/fade";
import { staggerContainer } from "../../component/shared/animations/stagger";

export default function NotificationPage() {
  const { data, isLoading }     = useNotifications();
  const { mutate: markRead }    = useMarkAsRead();
  const { mutate: markAll }     = useMarkAllAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setNotifications(data.map((n) => ({ ...n, unread: !n.is_read })));
    }
  }, [data]);

  if (isLoading) return (
    <p className="text-center mt-10" style={{ color: "var(--text-muted)" }}>
      Loading...
    </p>
  );

  const handleMarkAsRead = (id) => {
    markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, unread: false } : n))
    );
  };

  const handleMarkAll = () => {
    markAll();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, unread: false }))
    );
  };

  const handleDelete = (id) => {
    deleteNotif(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen py-6 sm:py-10" style={{ background: "var(--surface-page)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h1>
            <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
              Stay updated with your latest activity and messages
            </p>
          </div>

          <button
            onClick={() => navigate(userRole === "teacher" ? "/TeacherPortal" : "/SchoolDashpord")}
            className="self-start sm:self-auto px-5 py-2 rounded-full border border-[#9810FA] text-[#9810FA] text-sm sm:text-base font-semibold hover:bg-[#9810FA]/10 transition whitespace-nowrap"
          >
            Back to Dashboard
          </button>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <NotificationTabs notifications={notifications} onMarkAll={handleMarkAll}>
            {(filtered) => (
              <NotificationList
                notifications={filtered}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )}
          </NotificationTabs>
        </motion.div>

      </div>
    </div>
  );
}