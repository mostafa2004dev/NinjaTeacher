import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Edit3, Settings, Star, BookOpen,
  MapPin, User, Briefcase, Search, Calendar, Award,
  Clock, TrendingUp, CheckCircle2, XCircle
} from 'lucide-react';
import { EditProfileModal } from './TeacherProfile'; // named export

const BASE_URL = 'http://localhost:3000';
const card  = { background: 'var(--surface-card)',  border: '1px solid var(--border-default)' };
const muted = { background: 'var(--surface-muted)', border: '1px solid var(--border-default)' };

function isDarkNow() {
  return document.documentElement.classList.contains('dark');
}

function statusStyle(status) {
  const s = (status || '').toLowerCase();
  if (s === 'accepted')  return { label:'Accepted',            statusBg:'rgba(16,185,129,0.1)',  statusColor:'#059669', icon:<CheckCircle2 size={13}/> };
  if (s === 'interview') return { label:'Interview Scheduled', statusBg:'rgba(59,130,246,0.1)',  statusColor:'#3b82f6', icon:<Calendar size={13}/> };
  if (s === 'rejected')  return { label:'Not Selected',        statusBg:'var(--surface-muted)',  statusColor:'var(--text-muted)', icon:<XCircle size={13}/> };
  return                        { label:'Under Review',        statusBg:'rgba(245,158,11,0.1)', statusColor:'#d97706', icon:<Clock size={13}/> };
}

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
  catch { return String(d); }
}

// نفس الـ themes اللي في TeacherProfile عشان الـ modal يتلوّن صح
const themes = {
  light: {
    pageBg: 'linear-gradient(135deg,#f0f4ff 0%,#fdf2f8 100%)',
    navBg: 'rgba(255,255,255,0.9)',
    card: '#ffffff',
    border: '#e5e7eb',
    shadow: '0 2px 16px rgba(99,102,241,0.07)',
    textPrimary: '#1e1b4b',
    textSecondary: '#374151',
    textMuted: '#6b7280',
  },
  dark: {
    pageBg: 'linear-gradient(135deg,#0d0f1a 0%,#130d1f 100%)',
    navBg: 'rgba(13,15,26,0.95)',
    card: '#111827',
    border: '#1f2937',
    shadow: '0 2px 16px rgba(0,0,0,0.3)',
    textPrimary: '#f1f0ff',
    textSecondary: '#d1d5db',
    textMuted: '#6b7280',
  },
};

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [user,      setUser]      = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [apps,      setApps]      = useState([]);

  // ── Edit Profile Modal ──────────────────────────────────────────────────
  const [profile,     setProfile]     = useState(null);   // بيانات البروفايل الكاملة للـ modal
  const [editOpen,    setEditOpen]    = useState(false);
  const [dark,        setDark]        = useState(isDarkNow);
  const t = dark ? themes.dark : themes.light;

  // track dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDarkNow()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  // ───────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    // بيانات الـ user (header الـ dashboard)
    fetch(`${BASE_URL}/users/me`, { headers: h })
      .then(r => r.json()).then(d => setUser(d?.data || d)).catch(() => {});

    // stats
    fetch(`${BASE_URL}/dashboard/stats`, { headers: h })
      .then(r => r.json()).then(d => setStatsData(d?.data || null)).catch(() => {});

    // applications
    fetch(`${BASE_URL}/applied-jobs`, { headers: h })
      .then(r => r.json()).then(d => {
        const list = Array.isArray(d?.data) ? d.data : [];
        setApps(list.map(a => {
          const job = a.job || {};
          const st  = statusStyle(a.status || a.Status);
          return {
            title:       job.title || job.Title || 'Job',
            school:      (job.school && (job.school.name || job.school.school_name)) || job.School_Name || 'School',
            loc:         job.location || job.Location || '—',
            status:      st.label, statusBg: st.statusBg, statusColor: st.statusColor, icon: st.icon,
            date:        fmtDate(a.apply_date || a.Apply_Date),
            match:       a.match_score ? `${a.match_score}%` : null,
          };
        }));
      }).catch(() => {});

    // ── جلب الـ profile الكامل للـ Edit Modal ──────────────────────────
    fetch(`${BASE_URL}/profile`, { headers: h })
      .then(r => r.json())
      .then(d => setProfile(d?.data || null))
      .catch(() => {});
    // ──────────────────────────────────────────────────────────────────
  }, []);

  const stats = [
    { label:'Profile Views', value: String(statsData?.profileViews ?? 0), icon:<Eye size={20}/>,       color:'text-purple-500',  bg:'rgba(147,51,234,0.1)' },
    { label:'Applications',  value: String(statsData?.applications  ?? 0), icon:<Briefcase size={20}/>, color:'text-blue-500',    bg:'rgba(59,130,246,0.1)' },
    { label:'Interviews',    value: String(statsData?.interviews     ?? 0), icon:<Calendar size={20}/>,  color:'text-emerald-500', bg:'rgba(16,185,129,0.1)' },
    { label:'Offers',        value: String(statsData?.offers         ?? 0), icon:<Award size={20}/>,     color:'text-emerald-500', bg:'rgba(16,185,129,0.1)' },
  ];

  const savedJobs = (statsData?.saved_jobs || []).map((s) => {
    const j = s.job || s.Post || {};
    return {
      title:    j.title    || j.Title    || 'Job',
      school:   (j.school && (j.school.name || j.school.school_name)) || 'School',
      location: j.location || j.Location || '—',
      salary:   j.salary_range || j.Salary_Range || 'Negotiable',
      schoolId: s.school_id ?? j.school_id ?? j.School_ID,
      jobId:    s.job_id    ?? j.job_id    ?? j.Job_ID,
    };
  });

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.Name || user?.name || 'Teacher'}! 👋
          </h1>
          <p className="mt-1 font-medium text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
            Here's what's happening with your applications today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-[22px] sm:rounded-[24px]" style={card}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 ${s.color}`}
                style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* Applications */}
          <div className="lg:col-span-8">
            <div className="p-5 sm:p-8 rounded-[28px] sm:rounded-[32px]" style={card}>
              <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
                <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>My Applications</h2>
                <button
                  onClick={() => navigate('/browse-jobs')}
                  className="bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white px-5 py-2.5 rounded-full text-sm font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  <Search size={16} strokeWidth={3} /> Browse Jobs
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {apps.length === 0 && (
                  <p className="text-sm font-bold text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No applications yet. Browse jobs to apply!
                  </p>
                )}
                {apps.map((app, i) => (
                  <div key={i} className="rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 hover:shadow-md transition-all"
                    style={{ ...card, background: 'var(--surface-muted)' }}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-base sm:text-[19px] font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{app.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-[#8B5CF6]" /> {app.school}</span>
                          <span className="flex items-center gap-1.5"><MapPin     size={14} className="text-[#8B5CF6]" /> {app.loc}</span>
                        </div>
                      </div>
                      {app.match && (
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center justify-end gap-1 text-[#10B981]">
                            <TrendingUp size={18} strokeWidth={3} />
                            <span className="text-lg sm:text-xl font-black">{app.match}</span>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Match</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between pt-4 flex-wrap gap-2"
                      style={{ borderTop: '1px solid var(--border-default)' }}>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-black"
                        style={{ background: app.statusBg, color: app.statusColor }}>
                        {app.icon} <span>{app.status}</span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: 'var(--text-muted)' }}>Applied {app.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Profile Card */}
            <div className="p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] relative overflow-hidden" style={card}>
              <div className="absolute top-0 left-0 w-full h-20 opacity-10"
                style={{ background: 'linear-gradient(90deg,#8B5CF6,#6366F1,#3B82F6)' }} />

              <div className="relative pt-3 z-10 flex items-start gap-3">
                <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-[22px] p-1 shadow-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1,#3B82F6)' }}>
                  <div className="w-full h-full rounded-[18px] overflow-hidden flex items-center justify-center"
                    style={{ background: 'var(--surface-card)', border: '2px solid var(--border-default)' }}>
                    {profile?.Image ? (
                      <img
                        src={profile.Image.startsWith('http') ? profile.Image : `${BASE_URL}/${profile.Image.replace(/^\//, '')}`}
                        alt={user?.Name || 'Teacher'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{ display: profile?.Image ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={36} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pt-1 flex-1 min-w-0">
                  <h3 className="text-lg sm:text-[20px] font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {user?.Name || user?.name || 'Teacher'}
                  </h3>
                  <p className="text-[#8B5CF6] font-bold text-base sm:text-[20px]">
                    {user?.Specialization || user?.specialization || 'Teacher'}
                  </p>
                  <div className="flex items-center gap-1 text-[#FBBF24] mt-1">
                    <Star size={13} fill="currentColor" />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {user?.Average_Rating ? `${user.Average_Rating} Rating` : 'New'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {/* View My Profile */}
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full py-3.5 bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white rounded-full text-xs font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
                  <Eye size={16} /> View My Profile
                </button>

                {/* ── Edit Profile → يفتح الـ modal ── */}
                <button
                  onClick={() => setEditOpen(true)}
                  disabled={!profile}
                  className="w-full py-3.5 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '2px solid rgba(139,92,246,0.4)', color: '#8B5CF6', background: 'transparent' }}>
                  <Edit3 size={16} /> Edit Profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full py-3.5 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ border: '2px solid var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }}>
                  <Settings size={16} /> Settings
                </button>
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="p-5 sm:p-6 rounded-[22px] sm:rounded-[24px]" style={card}>
              <div className="flex items-center gap-3 mb-5">
                <BookOpen size={18} className="text-[#8B5CF6]" />
                <h2 className="text-base sm:text-[18px] font-black" style={{ color: 'var(--text-primary)' }}>
                  Saved Jobs ({savedJobs.length})
                </h2>
              </div>
              <div className="space-y-3">
                {savedJobs.length === 0 ? (
                  <p className="text-sm font-bold text-center py-4" style={{ color: 'var(--text-muted)' }}>No saved jobs yet</p>
                ) : savedJobs.map((job, i) => (
                  <div key={i} className="rounded-[18px] sm:rounded-[20px] p-4 transition-all hover:shadow-md"
                    style={{ ...card, background: 'var(--surface-muted)' }}>
                    <h4 className="text-sm font-black pr-2" style={{ color: 'var(--text-primary)' }}>{job.title}</h4>
                    <p className="text-[13px] font-bold text-[#8B5CF6] mt-1">{job.school}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      <span>$ {job.salary}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/JobDetails?school=${job.schoolId}&job=${job.jobId}`)}
                      className="w-full mt-3 py-2 rounded-xl text-[12px] font-black transition-all hover:bg-[#8B5CF6] hover:text-white"
                      style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}>
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Edit Profile Modal ────────────────────────────────────────────── */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        dark={dark}
        t={t}
        onSaved={(updated) => {
          // حدّث الـ profile state + الـ user state (عشان الاسم والـ specialization يتحدثوا في الـ sidebar)
          setProfile((prev) => ({ ...prev, ...updated }));
          setUser((prev)    => ({ ...prev, ...updated }));
        }}
      />
    </div>
  );
};

export default TeacherDashboard;