// teacher.sidebar.jsx — أُعيدت كتابته بعد تلف RAR
// شريط جانبي للمعلم — روابط أقسام بوابة المعلم
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Search, FileText, User, Bell, Sparkles } from "lucide-react";

const links = [
  { to: "/TeacherDashboard", label: "Dashboard",      icon: LayoutDashboard },
  { to: "/BrowseJobs",       label: "Browse Jobs",    icon: Search },
  { to: "/recommendations",  label: "My Matches",     icon: Sparkles },
  { to: "/ApplyJobs",        label: "Applications",   icon: FileText },
  { to: "/TeacherProfile",   label: "My Profile",     icon: User },
  { to: "/Notification",     label: "Notifications",  icon: Bell },
];

export default function TeacherSidebar() {
  return (
    <aside
      className="hidden md:flex w-60 shrink-0 flex-col gap-1 border-e p-4"
      style={{ background: "var(--surface-card, #fff)", borderColor: "var(--border-default, #e5e7eb)" }}
    >
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isActive ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
