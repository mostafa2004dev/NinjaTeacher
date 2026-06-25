import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Facebook, Linkedin, Twitter, Youtube } from 'lucide-react'

const socialIcons = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Youtube, label: 'YouTube' },
]

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/browse-jobs', label: 'Browse Jobs' },
  {
    to: '/TeacherPortal',
    label: 'Teacher Portal',
    role: 'teacher',
  },
  {
    to: '/SchoolDashpord',
    label: 'School Portal',
    role: 'school',
  },
]

const categoryLinks = [
  { to: '/jobs/math', label: 'Mathematics' },
  { to: '/jobs/science', label: 'Science' },
  { to: '/jobs/english', label: 'English' },
  { to: '/jobs/online', label: 'Online Teaching' },
]

const supportLinks = [

  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
]

function AnimatedLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        className="footer-link text-sm text-gray-400 hover:text-white transition-colors duration-300 relative inline-block"
      >
        {label}
      </Link>
    </li>
  )
}

export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cols = entry.target.querySelectorAll('.footer-col')
            cols.forEach((col, i) => {
              setTimeout(() => {
                col.classList.add('footer-col--visible')
              }, i * 120)
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* ── Column fade-in ── */
        .footer-col {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .footer-col--visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Logo shimmer ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-icon {
          animation: shimmer 3s linear infinite;
          background: linear-gradient(
            110deg,
            #6366f1 20%,
            #a855f7 40%,
            #ec4899 55%,
            #a855f7 70%,
            #6366f1 80%
          );
          background-size: 200% auto;
        }

        /* ── Pulsing ring on logo hover ── */
        .logo-wrap {
          position: relative;
          display: inline-flex;
        }
        .logo-wrap::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          border: 2px solid transparent;
          background: linear-gradient(#111827, #111827) padding-box,
                      linear-gradient(135deg, #6366f1, #a855f7) border-box;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .logo-wrap:hover::after {
          opacity: 1;
        }

        /* ── Social button hover ── */
        .social-btn {
          position: relative;
          overflow: hidden;
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .social-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
        }
        .social-btn:hover::before { opacity: 1; }
        .social-btn svg {
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
        }
        .social-btn:hover svg { transform: scale(1.2); }

        /* ── Link animated underline ── */
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transition: width 0.3s ease;
        }
        .footer-link:hover::after { width: 100%; }

        /* ── Divider shimmer ── */
        @keyframes borderShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .footer-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #6366f1 30%,
            #a855f7 50%,
            #6366f1 70%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: borderShimmer 4s linear infinite;
        }

        /* ── Bottom row fade ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .footer-bottom {
          animation: fadeUp 0.7s ease 0.8s both;
        }
      `}</style>

      <footer className="bg-[#111827] text-gray-400 pt-14 pb-8 px-6 md:px-10">

        {/* Top shimmer divider */}
        <div className="footer-divider mb-14" />

        <div
          ref={footerRef}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12"
        >

          {/* Brand */}
          <div className="footer-col sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="logo-wrap">
                <div className="logo-icon w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="text-white" size={22} />
                </div>
              </div>
              <h2 className="text-white text-lg font-bold tracking-tight">
                Ninga Teacher
              </h2>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Smart hiring platform connecting schools with top teaching talent through AI-powered matching.
            </p>

            <div className="flex gap-2">
              {socialIcons.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="social-btn w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-transparent hover:text-white flex items-center justify-center"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {/* Navigation */}
<div className="footer-col">

  <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">
    Navigation
  </h3>

  {(() => {

    const userRole = localStorage.getItem("userRole")

    const filteredNavLinks = navLinks.filter((link) => {

      // اللينكات العامة تظهر للكل
      if (!link.role) return true

      // يظهر اللينك حسب الرول
      return link.role === userRole
    })

    return (
      <ul className="flex flex-col gap-2">
        {filteredNavLinks.map((l) => (
          <AnimatedLink key={l.to} {...l} />
        ))}
      </ul>
    )

  })()}

</div>

          {/* Categories */}
          <div className="footer-col">
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">Categories</h3>
            <ul className="flex flex-col gap-2">
              {categoryLinks.map((l) => <AnimatedLink key={l.to} {...l} />)}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">Support</h3>
            <ul className="flex flex-col gap-2">
              {supportLinks.map((l) => <AnimatedLink key={l.to} {...l} />)}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto footer-bottom">
          <div className="footer-divider mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500">© 2026 Ninga Teacher. All rights reserved.</p>
            <div className="flex gap-5">
              {[
                { to: '/privacy', label: 'Privacy' },
                { to: '/terms',   label: 'Terms'   },
                { to: '/sitemap', label: 'Sitemap' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="footer-link text-xs text-gray-500 hover:text-white transition-colors duration-300 relative inline-block"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </footer>
    </>
  )
}