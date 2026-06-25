import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getNotifications } from "../../../servises/notification/notification.service"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Bell, User, LogOut, ChevronDown, GraduationCap, Menu, X, CreditCard } from "lucide-react"
import LogoutModal from "../../Logout card/LogoutModal"
import ThemeToggle from "../../ThemeToggle/ThemeToggle"
import { resolveImage } from "../../utilitis/Resolveimage"
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [token, setToken] = useState(localStorage.getItem("userToken"))
  const [userName, setUserName] = useState(null)
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"))
  const [userImage, setUserImage] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  const navigate = useNavigate()

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (d) => (Array.isArray(d) ? d : []),
    enabled: !!token,
    refetchInterval: 60000,
  })
  const unreadCount = (notifData ?? []).filter(n => !n.is_read && !n.IsRead).length
  const dropdownRef = useRef(null)

  // ── جلب بيانات المستخدم ──────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("userToken")
    if (!t) {
      setUserName(null)
      setUserRole(null)
      setUserImage(null)
      setUserLoading(false)
      return
    }
    setUserLoading(true)
    fetch("http://localhost:3000/users/me", { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => {
        const u = d?.data || d || {}
        if (u.Name) setUserName(u.Name)
        if (u.Role) { setUserRole(u.Role); localStorage.setItem("userRole", u.Role) }
        // ✅ resolveImage يتعامل مع / و \\ و URLs كاملة
        setUserImage(u.Image ? resolveImage(u.Image) : null)
      })
      .catch(() => { })
      .finally(() => setUserLoading(false))
  }, [token])

  // ── مزامنة الـ localStorage ───────────────────────────────────────────────
  useEffect(() => {
    function syncStorage() {
      setToken(localStorage.getItem("userToken"))
      setUserRole(localStorage.getItem("userRole"))
    }
    window.addEventListener("storage", syncStorage)
    const interval = setInterval(syncStorage, 500)
    return () => {
      window.removeEventListener("storage", syncStorage)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const navLinkClass = ({ isActive }) =>
    `nav-link text-sm font-medium transition-colors duration-200 relative ${isActive ? "text-[#6d4cff]" : "text-white hover:text-[#a78bfa]"}`

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        .navbar { animation: navSlideDown 0.5s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(109,76,255,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(109,76,255,0); }
        }
        .logo-icon { animation: logoPulse 2.8s ease infinite; }

        @keyframes textShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-text {
          background: linear-gradient(90deg, #6d4cff 30%, #c084fc 50%, #6d4cff 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 3s linear infinite;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after { width: 100%; }

        @keyframes bellShake {
          0%,100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(8deg); }
        }
        .bell-btn:hover .bell-icon { animation: bellShake 0.5s ease; }

        @keyframes dotPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.5; }
        }
        .notif-dot { animation: dotPulse 1.6s ease infinite; }

        .avatar-btn { transition: all 0.3s ease; }
        .avatar-btn:hover .avatar-circle {
          box-shadow: 0 0 0 3px rgba(109,76,255,0.5);
          transform: scale(1.1);
        }
        .avatar-circle { transition: all 0.3s ease; }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .dropdown-menu { animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1) both; }

        .dropdown-item {
          opacity: 0;
          animation: dropIn 0.25s ease forwards;
        }
        .dropdown-item:nth-child(1) { animation-delay: 0.05s; }
        .dropdown-item:nth-child(2) { animation-delay: 0.10s; }
        .dropdown-item:nth-child(3) { animation-delay: 0.15s; }

        @keyframes btnShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cta-btn {
          background: linear-gradient(90deg, #295AFC, #9b59ff, #295AFC);
          background-size: 200% auto;
          transition: background-position 0.4s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109,76,255,0.4);
        }
        .cta-btn:active { transform: translateY(0); }

        @keyframes mobileSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .mobile-menu { animation: mobileSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }

        .mobile-item {
          opacity: 0;
          transform: translateX(10px);
          animation: mobileItemIn 0.3s ease forwards;
        }
        @keyframes mobileItemIn {
          to { opacity: 1; transform: translateX(0); }
        }
        .mobile-item:nth-child(1) { animation-delay: 0.08s; }
        .mobile-item:nth-child(2) { animation-delay: 0.14s; }
        .mobile-item:nth-child(3) { animation-delay: 0.20s; }
        .mobile-item:nth-child(4) { animation-delay: 0.26s; }
        .mobile-item:nth-child(5) { animation-delay: 0.32s; }
        .mobile-item:nth-child(6) { animation-delay: 0.38s; }

        .burger-line {
          display: block;
          width: 22px; height: 2px;
          background: #9ca3af;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
          transform-origin: center;
        }
        .burger-open .burger-line:nth-child(1) { transform: translateY(6px) rotate(45deg); background: #6d4cff; }
        .burger-open .burger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .burger-open .burger-line:nth-child(3) { transform: translateY(-6px) rotate(-45deg); background: #6d4cff; }

        .mobile-overlay { animation: fadeIn 0.3s ease both; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <nav className={`navbar bg-[#111827] px-6 md:px-10 h-[68px] flex items-center justify-between relative z-[999] transition-shadow duration-300 ${scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.4)]" : ""}`}>

        <Link to="/" className="flex items-center gap-3 group">
          <div className="logo-icon w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="logo-text font-bold text-xl tracking-tight">Ninga Teacher</span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-8">
          {!token && (
            <>
              <NavLink to="/welcome" className={navLinkClass}>How it Works</NavLink>
              <NavLink to="/about" className={navLinkClass}>What we do</NavLink>
            </>
          )}
          {token && (
            <div className="flex items-center gap-6">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              {userRole === "school" && <NavLink to="/SchoolDashpord" className={navLinkClass}>School Portal</NavLink>}
              {userRole === "teacher" && <NavLink to="/TeacherPortal" className={navLinkClass}>Teacher Portal</NavLink>}
              {userRole === "teacher" && <NavLink to="/browse-jobs" className={navLinkClass}>Browse Jobs</NavLink>}
            </div>
          )}
        </div>

        {/* ── Desktop actions ── */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {token ? (
            <>
              {/* Bell */}
              <button
                onClick={() => navigate("/notifications")}
                className="bell-btn relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
              >
                <Bell className="bell-icon w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center shadow">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="notif-dot absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="avatar-btn flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {userLoading ? (
                    <div className="avatar-circle w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
                  ) : (
                    <div className="avatar-circle w-8 h-8 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center overflow-hidden">
                      {userImage ? (
                        <img
                          src={userImage}
                          alt={userName || "User"}
                          className="w-full h-full object-cover"
                          onError={() => setUserImage(null)}
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                  {userLoading ? (
                    <span className="inline-block w-12 h-3 bg-gray-700 rounded animate-pulse" />
                  ) : (
                    <span className="text-sm font-medium text-white">{userName || "User"}</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu absolute right-0 top-[52px] bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl w-44 py-1 z-50">
                    <Link
                      to={userRole === "teacher" ? "/profile" : "/SchoolProfile"}
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[#6d4cff] transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/payment"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[#6d4cff] transition-colors"
                    >
                      <CreditCard className="w-4 h-4" /> Payment
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={() => { setIsLogoutOpen(true); setDropdownOpen(false) }}
                      className="dropdown-item w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#a78bfa] font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="cta-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Burger ── */}
        <button
          className={`md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/10 transition-colors ${menuOpen ? "burger-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <>
          <div
            className="mobile-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
            onClick={() => setMenuOpen(false)}
          />

          <div className="mobile-menu fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-[#111827] z-[1000] md:hidden flex flex-col shadow-2xl transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                  <GraduationCap className="text-white" size={18} />
                </div>
                <span className="font-bold text-[#6d4cff] dark:text-[#a78bfa] text-base">Ninga Teacher</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* User card */}
            {token && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                {userLoading ? (
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName || "User"}
                        className="w-full h-full object-cover"
                        onError={() => setUserImage(null)}
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
                {userLoading ? (
                  <span className="inline-block w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{userName || "User"}</span>
                )}
              </div>
            )}

            {/* Nav links */}
            <div className="flex flex-col px-5 py-4 gap-1 flex-1 overflow-y-auto overflow-x-hidden">
              <NavLink to="/" end className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                🏠 Home
              </NavLink>

              {!token && (
                <>
                  <NavLink to="/welcome" className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                    💡 How it Works
                  </NavLink>
                  <NavLink to="/about" className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                    ℹ️ What we do
                  </NavLink>
                </>
              )}

              {userRole === "school" && (
                <NavLink to="/SchoolDashpord" className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                  🏫 School Portal
                </NavLink>
              )}

              {userRole === "teacher" && (
                <>
                  <NavLink to="/TeacherPortal" className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                    👨‍🏫 Teacher Portal
                  </NavLink>
                  <NavLink to="/browse-jobs" className={({ isActive }) => `mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4cff] dark:text-[#a78bfa]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa]"}`} onClick={() => setMenuOpen(false)}>
                    🔍 Browse Jobs
                  </NavLink>
                </>
              )}

              {token && (
                <button
                  onClick={() => { navigate("/notifications"); setMenuOpen(false) }}
                  className="mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa] transition-all text-left"
                >
                  <span className="relative">
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </span>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </button>
              )}

              {token && (
                <Link to="/payment" onClick={() => setMenuOpen(false)} className="mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa] transition-all">
                  💳 Payment
                </Link>
              )}

              {token && (
                <Link
                  to={userRole === "teacher" ? "/profile" : "/SchoolProfile"}
                  onClick={() => setMenuOpen(false)}
                  className="mobile-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#6d4cff] dark:hover:text-[#a78bfa] transition-all"
                >
                  👤 Profile
                </Link>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
              {token ? (
                <button
                  onClick={() => { setIsLogoutOpen(true); setMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center text-[#6d4cff] dark:text-[#a78bfa] font-medium text-sm py-2.5 rounded-xl border border-[#6d4cff]/30 dark:border-[#a78bfa]/30 hover:bg-purple-50 dark:hover:bg-white/5 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="cta-btn text-center text-white font-medium text-sm py-2.5 rounded-xl">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </>
  )
}