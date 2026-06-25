import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, School, BookOpen, Target, Award,
  Star, SendHorizontal, CheckCircle2, DollarSign,
  Bookmark, ChevronLeft, TrendingUp, Loader2
} from 'lucide-react';

const BASE_URL = 'http://localhost:3000';
const grad = "linear-gradient(90deg,#9810FA 0%,#155DFC 100%)"
const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' }
const inputSt = { background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

// JWT مش بنتحقق من توقيعه هنا، بس بنفك الـ payload عشان نجيب Teacher_ID للعرض في الفرونت.
// لو شكل التوكن مختلف عندك (اسم الحقل غير Teacher_ID/id/sub) لازم تعدل هنا.
function getTeacherIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.Teacher_ID ?? payload.teacherId ?? payload.id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('school');
  const jobId = searchParams.get('job');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Load saved status for this job
  useEffect(() => {
    if (!schoolId || !jobId) return;
    const token = localStorage.getItem('userToken');
    if (!token) return;
    fetch(`${BASE_URL}/dashboard/saved`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        const rows = Array.isArray(json?.data) ? json.data : [];
        setIsSaved(rows.some(r => String(r.school_id) === String(schoolId) && String(r.job_id) === String(jobId)));
      })
      .catch(() => {});
  }, [schoolId, jobId]);

  useEffect(() => {
    if (!schoolId || !jobId) { setError('Missing job reference.'); setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const jobRes = await fetch(`${BASE_URL}/job-posts/${schoolId}/${jobId}`, { headers });
        const jobJson = await jobRes.json();
        if (!jobRes.ok) throw new Error(jobJson?.message || 'Job not found.');
        if (alive) setJob(jobJson.data);

        if (token) {
          const teacherId = getTeacherIdFromToken(token);
          if (teacherId) {
            try {
              const scoreRes = await fetch(`${BASE_URL}/ai-matching/score/${schoolId}/${teacherId}/${jobId}`, { headers });
              if (scoreRes.ok) {
                const scoreJson = await scoreRes.json();
                if (alive) setMatchScore(scoreJson.data?.match_score ?? null);
              }
            } catch { /* non-fatal: page still works without a score */ }
          }
        }
      } catch (e) {
        if (alive) setError(e.message || 'Failed to load job.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [schoolId, jobId]);

  const toggleSave = async () => {
    const token = localStorage.getItem('userToken');
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    setSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (wasSaved) {
        await fetch(`${BASE_URL}/dashboard/saved/${schoolId}/${jobId}`, { method: 'DELETE', headers });
      } else {
        await fetch(`${BASE_URL}/dashboard/saved`, {
          method: 'POST', headers,
          body: JSON.stringify({ School_ID: schoolId, Job_ID: jobId }),
        });
      }
    } catch {
      setIsSaved(wasSaved);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/applied-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // ملحوظة: Cover_Letter و Start_Date مش موجودين في موديل Application بالباك
        // دلوقتي، فمش بيتبعتوا. لو تم إضافة الأعمدة دي للموديل، يتضافوا هنا.
        body: JSON.stringify({ Job_ID: jobId, School_ID: schoolId }),
      });
      const json = await res.json();
      if (res.ok) {
        navigate('/success');
      } else if (res.status === 409) {
        setApplyError('You already applied to this job.');
      } else {
        setApplyError(json?.message || 'Failed to submit application.');
      }
    } catch {
      setApplyError('Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 font-bold" style={{ background: 'var(--surface-page)', color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={22} /> Loading job...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-bold" style={{ background: 'var(--surface-page)', color: 'var(--text-muted)' }}>
        <p>{error || 'Job not found.'}</p>
        <button onClick={() => navigate(-1)} className="text-[#9810FA] underline">Go back</button>
      </div>
    );
  }

  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];

  return (
    <div className="min-h-screen font-sans pb-20" style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        <div className="space-y-6">
          <button onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-[#9810FA] font-bold text-sm flex items-center gap-1.5 transition-colors group">
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Back to Jobs
          </button>

          {/* Header Card */}
          <div className="p-6 sm:p-8 md:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-[28px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-muted)', color: '#5D5FEF' }}>
                  <School size={36} className="sm:w-12 sm:h-12" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {job.title}
                  </h1>
                  <p className="text-[#9810FA] font-black text-base sm:text-xl">
                    {job.school?.name || 'School'} <span className="text-[#F0B100] ml-1 italic">★ {job.school?.rating || 'New'}</span>
                  </p>
                  <div className="flex flex-wrap gap-4 sm:gap-6 pt-1 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-[#9810FA]" /> {job.location || '—'}</span>
                    <span className="flex items-center gap-2"><Briefcase size={16} className="text-[#9810FA]" /> {job.job_type || 'Full-time'}</span>
                    {job.required_stage && <span className="flex items-center gap-2">🎓 {job.required_stage}</span>}
                    <span className="flex items-center gap-2"><DollarSign size={16} className="text-[#9810FA]" /> {job.salary_range || 'Negotiable'}</span>
                    <span className="flex items-center gap-2"><Clock size={16} className="text-[#9810FA]" /> {timeAgo(job.date)}</span>
                  </div>
                </div>
              </div>
              {matchScore != null && (
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <div className="flex items-center gap-2 text-[#00C07F] font-black text-2xl sm:text-4xl">
                    <TrendingUp size={24} fill="#009966" /> {matchScore}%
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: 'var(--text-muted)' }}>Match Score</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 sm:gap-5 mt-8 pt-8" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button onClick={handleApply} disabled={applying} style={{ background: grad }}
                className="flex-1 text-white rounded-xl sm:rounded-2xl h-12 sm:h-16 font-black text-base sm:text-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 hover:opacity-90 transition active:scale-95 disabled:opacity-60">
                {applying ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} fill="white" />}
                {applying ? 'Submitting...' : 'Apply Now'}
              </button>
              <button onClick={toggleSave} disabled={saving}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all hover:border-[#9810FA] hover:text-[#9810FA] disabled:opacity-60"
                style={{ border: `2px solid ${isSaved ? '#9810FA' : 'var(--border-default)'}`, color: isSaved ? '#9810FA' : 'var(--text-muted)', background: 'transparent' }}>
                <Bookmark size={20} fill={isSaved ? '#9810FA' : 'none'} />
              </button>
            </div>
            {applyError && <p className="text-sm font-bold text-red-500 mt-3">{applyError}</p>}
          </div>

          {/* Description */}
          <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
            <h3 className="font-black flex items-center gap-3 mb-6 uppercase tracking-widest text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              <BookOpen size={22} className="text-[#9810FA]" /> Job Description
            </h3>
            <p className="leading-[1.8] font-medium text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
              {job.description || 'No description provided.'}
            </p>
          </div>

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
              <h3 className="font-black flex items-center gap-3 mb-6 uppercase tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>
                <Target size={22} className="text-[#9810FA]" /> Responsibilities
              </h3>
              <div className="grid gap-4 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
                {responsibilities.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#00C07F] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
              <h3 className="font-black flex items-center gap-3 mb-6 uppercase tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>
                <Award size={22} className="text-[#9810FA]" /> Requirements
              </h3>
              <div className="grid gap-4 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
                {requirements.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#9810FA] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="p-6 sm:p-8 rounded-[28px] sm:rounded-[32px]" style={card}>
              <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 mb-6" style={{ color: 'var(--text-primary)' }}>
                <Star size={24} className="text-purple-500" /> Benefits & Perks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((perk, i) => (
                  <div key={i} className="p-4 rounded-2xl flex items-center gap-3"
                    style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-500 flex-shrink-0"
                      style={{ background: 'var(--surface-card)' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-black text-sm" style={{ color: 'var(--text-secondary)' }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About School */}
          <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
            <h3 className="font-black flex items-center gap-3 mb-5 uppercase tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>
              <School size={22} className="text-[#9810FA]" /> About {job.school?.name || 'this school'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { v: job.school?.school_type || '—', label: 'School Type', bg: "rgba(147,51,234,0.08)", c: "#7c3aed" },
                { v: job.school?.school_size || '—', label: 'School Size', bg: "rgba(59,130,246,0.08)", c: "#2563eb" },
                { v: job.school?.rating || 'New', label: 'Rating', bg: "rgba(16,185,129,0.08)", c: "#059669" },
              ].map((s, i) => (
                <div key={i} className="p-4 sm:p-6 rounded-[24px] sm:rounded-[30px] text-center transition-transform hover:scale-105"
                  style={{ background: s.bg, border: '2px solid var(--border-default)' }}>
                  <p className="text-xl sm:text-2xl font-black" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-[10px] uppercase font-black mt-1 opacity-60 tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Application Form */}
        <aside className="lg:sticky lg:top-28 z-40">
          <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px]" style={card}>
            <h3 className="text-xl sm:text-2xl font-black mb-8 tracking-tight" style={{ color: 'var(--text-primary)' }}>Submit Application</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Applying as:</label>
                <div className="p-4 rounded-[20px] flex items-center gap-3"
                  style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)' }}>
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center font-bold text-white text-[10px]">T</div>
                  <span className="text-[#9810FA] font-black text-sm">Teacher</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Cover Letter</label>
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-[20px] p-4 sm:p-6 h-44 focus:outline-none focus:ring-2 focus:ring-[#9810FA]/30 text-sm font-medium transition-all placeholder:text-gray-400 resize-none"
                  style={inputSt} placeholder="Tell us why you're a great fit..." />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Start Date Availability</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-[18px] p-4 outline-none text-sm font-black focus:ring-2 focus:ring-[#9810FA]/20 transition"
                  style={inputSt} />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Resume/CV</label>
                <div className="p-4 rounded-[20px] flex items-center gap-3 text-[#00C07F] text-sm font-black"
                  style={{ background: 'rgba(0,192,127,0.08)', border: '1px solid rgba(0,192,127,0.25)' }}>
                  <CheckCircle2 size={18} strokeWidth={3} /> Your profile will be attached
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <button onClick={handleApply} disabled={applying} style={{ background: grad }}
                  className="w-full text-white rounded-[22px] h-14 font-black text-base shadow-xl hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60">
                  {applying ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={() => navigate(-1)}
                  className="w-full h-14 rounded-[22px] font-black text-sm hover:opacity-70 transition active:scale-95"
                  style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default JobDetailsPage;