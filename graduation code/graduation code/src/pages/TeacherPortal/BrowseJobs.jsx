import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Star, BookOpen, Filter, TrendingUp, User, XCircle, CheckCircle2, Loader2 } from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

const cardSt = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' }
const inputSt = { background: 'var(--surface-muted)', color: 'var(--text-primary)' }

// "كام يوم فاتت" من تاريخ النشر
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

// تحويل وظيفة الباك → نفس شكل الكارت
function mapJob(raw) {
  const school = raw.school || {};
  const subjects = Array.isArray(raw.subjects) ? raw.subjects : [];
  const reqs = Array.isArray(raw.requirements) ? raw.requirements : [];
  const tags = [];
  if (subjects.length) tags.push(...subjects.slice(0, 2));
  if (reqs.length) tags.push(...reqs.slice(0, 2));
  if (raw.required_experience) tags.push(raw.required_experience);
  const shownTags = tags.slice(0, 3);
  if (tags.length > 3) shownTags.push(`+${tags.length - 3} more`);

  const salary = raw.salary_range || raw.Salary_Range || raw.Salary || raw.salary;
  return {
    id: raw.id || `${raw.School_ID}-${raw.Job_ID}`,
    schoolId: raw.school_id ?? raw.School_ID,
    jobId: raw.job_id ?? raw.Job_ID,
    title: raw.Title || raw.title || 'Teaching Position',
    school: school.name || school.school_name || raw.School_Name || 'School',
    rating: (school.average_rating ?? raw.school_rating ?? 0) ? String(school.average_rating ?? raw.school_rating) : 'New',
    location: raw.Location || raw.location || school.location || '—',
    type: raw.job_type || raw.Job_Type || 'Full-time',
    required_stage: raw.required_stage || raw.Required_Stage || null,
    salary: salary ? String(salary) : 'Negotiable',
    students: school.school_size ? `${school.school_size} students` : '—',
    posted: timeAgo(raw.createdAt || raw.Created_At || raw.Posted_Date),
    match: raw.match_score ? `${raw.match_score}%` : null,
    description: raw.Description || raw.description || 'No description provided.',
    subject: (subjects[0] || raw.Subject || '').toString(),
    tags: shownTags,
  };
}

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [saved, setSaved] = useState([]); // loaded from backend (GET /dashboard/saved)
  const [toast, setToast] = useState(null);
  const [jobView, setJobView] = useState("matches");
  // جلب الوظائف الحقيقية من الباك + درجات التطابق (لو المعلم عامل لوجين)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const jobType = jobView === "matches" ? "myJobs" : "allJobs";
        const jobsRes = await fetch(`${BASE_URL}/job-posts?type=${jobType}`, { headers });
        const jobsJson = await jobsRes.json();
        const data = jobsJson?.data;
        const list = Array.isArray(data) ? data : (data?.jobs || []);

        // درجات التطابق اختيارية: لو فشلت، نعرض الوظائف عادي بدون match score
        let scores = {};
        if (token) {
          try {
            const scoresRes = await fetch(`${BASE_URL}/ai-matching/bulk-scores`, { headers });
            if (scoresRes.ok) {
              const scoresJson = await scoresRes.json();
              scores = scoresJson?.data || {};
            }
          } catch (e) {
            // non-fatal — جدول الوظائف لسه يظهر، بس من غير match %
          }
        }

        const mapped = list.map(raw => {
          const schoolId = raw.school_id ?? raw.School_ID;
          const jobId = raw.job_id ?? raw.Job_ID;
          const score = scores[`${schoolId}-${jobId}`];
          return mapJob(score != null ? { ...raw, match_score: score } : raw);
        });

        if (alive) setAllJobs(mapped);
      } catch (e) {
        if (alive) setError('Failed to load jobs. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [jobView]);

  // قوائم الفلاتر من البيانات الفعلية
  const subjects = useMemo(() => [...new Set(allJobs.map(j => j.subject).filter(Boolean))], [allJobs]);
  const locations = useMemo(() => [...new Set(allJobs.map(j => j.location).filter(l => l && l !== '—'))], [allJobs]);

  // بحث + فلترة
  const jobs = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filteredJobs = [...allJobs];

    return filteredJobs.filter(j => {
      const matchesSearch =
        !q ||
        [j.title, j.school, j.location].some(v =>
          v.toLowerCase().includes(q)
        );

      const matchesSubject =
        !subjectFilter || j.subject === subjectFilter;

      const matchesLocation =
        !locationFilter || j.location === locationFilter;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLocation
      );
    });
  }, [
    allJobs,
    search,
    subjectFilter,
    locationFilter,
  ]);
  // حمّل الوظائف المحفوظة من الباك عند فتح الصفحة
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/dashboard/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        setSaved(rows.map(r => ({
          id: `${r.school_id}-${r.job_id}`,
          schoolId: r.school_id,
          jobId: r.job_id,
        })));
      } catch { /* non-fatal */ }
    })();
  }, []);

  const toggleSave = async (job) => {
    const token = localStorage.getItem('userToken');
    const exists = saved.find(j => j.id === job.id);
    // تحديث متفائل للواجهة
    const updated = exists ? saved.filter(j => j.id !== job.id)
      : [...saved, { id: job.id, schoolId: job.schoolId, jobId: job.jobId }];
    setSaved(updated);
    setToast({ msg: exists ? 'Job removed' : 'Job saved!', type: exists ? 'remove' : 'save' });
    setTimeout(() => setToast(null), 3000);
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (exists) {
        await fetch(`${BASE_URL}/dashboard/saved/${job.schoolId}/${job.jobId}`, { method: 'DELETE', headers });
      } else {
        await fetch(`${BASE_URL}/dashboard/saved`, {
          method: 'POST', headers,
          body: JSON.stringify({ School_ID: job.schoolId, Job_ID: job.jobId }),
        });
      }
    } catch {
      // فشل الحفظ على الباك — ارجع الحالة زي ما كانت
      setSaved(saved);
      setToast({ msg: 'Could not save. Try again.', type: 'remove' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const clearFilters = () => { setSearch(''); setSubjectFilter(''); setLocationFilter(''); };

  return (
    <div className="min-h-screen font-sans pb-20 text-left" style={{ background: 'var(--surface-page)' }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-[14px] shadow-xl text-sm font-black transition-all
          ${toast.type === 'save' ? 'bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white' : 'text-white'}`}
          style={toast.type !== 'save' ? { background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' } : {}}>
          {toast.type === 'save' ? <><CheckCircle2 size={16} /> Job saved!</> : <><XCircle size={16} /> Job removed</>}
        </div>
      )}

      <main className="max-w-[1116px] mx-auto pt-8 px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-black leading-tight" style={{ color: 'var(--text-primary)' }}>Browse Teaching Jobs</h1>
            <p className="font-bold mt-1 text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>Find the perfect teaching position that matches your skills and passion</p>
          </div>
          <button onClick={() => navigate('/TeacherPortal')}
            className="border-[1.6px] border-[#9810FA] text-[#9810FA] px-5 py-2 rounded-[14px] text-sm font-black flex items-center gap-2 hover:bg-purple-500/10 transition-all flex-shrink-0">
            Back to Dashboard
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4 sm:p-6 rounded-[16px] shadow-sm mb-8" style={cardSt}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search jobs, schools, locations..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-bold outline-none"
                style={inputSt} />
            </div>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-44 min-w-[140px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-bold appearance-none outline-none cursor-pointer" style={inputSt}>
                  <option value="">Filter by Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="relative flex-1 sm:w-44 min-w-[140px]">
                <Briefcase
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: 'var(--text-muted)' }}
                />

                <select
                  value={jobView}
                  onChange={(e) => setJobView(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-bold appearance-none outline-none cursor-pointer"
                  style={inputSt}
                >
                  <option value="matches">My Matches</option>
                  <option value="all">All Jobs</option>
                </select>
              </div>
              <div className="relative flex-1 sm:w-44 min-w-[140px]">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-bold appearance-none outline-none cursor-pointer" style={inputSt}>
                  <option value="">Location</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
            <span className="font-black text-[11px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{jobs.length} Jobs found</span>
            <button onClick={clearFilters} className="text-[#6366F1] font-black text-xs hover:opacity-70 transition-all">Clear Filters</button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={22} /> <span className="font-bold">Loading jobs...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 font-bold" style={{ color: 'var(--text-muted)' }}>{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 font-bold" style={{ color: 'var(--text-muted)' }}>No jobs found. Try adjusting your filters.</div>
        )}

        {/* Job Cards */}
        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-6">
            {jobs.map((job) => {
              const isSaved = !!saved.find(j => j.id === job.id);
              return (
                <div key={job.id} className="rounded-[16px] p-5 sm:p-7 transition-all hover:shadow-lg"
                  style={{ ...cardSt, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-[22px] font-black" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[#8B5CF6] font-black text-sm underline decoration-2 underline-offset-4">{job.school}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={13} fill="currentColor" />
                            <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>{job.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {job.match && (
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 text-[#10B981]">
                          <TrendingUp size={20} strokeWidth={3} />
                          <span className="text-xl sm:text-2xl font-black">{job.match}</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Match Score</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 font-bold text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1.5"><MapPin size={15} className="text-[#8B5CF6]" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Briefcase size={15} className="text-[#8B5CF6]" /> {job.type}</span>
                    {job.required_stage && <span className="flex items-center gap-1.5">🎓 {job.required_stage}</span>}
                    <span className="flex items-center gap-1.5"><span className="text-[#8B5CF6] font-black">$</span> {job.salary}</span>
                    <span className="flex items-center gap-1.5"><User size={15} className="text-[#8B5CF6]" /> {job.students}</span>
                    <span className="flex items-center gap-1.5"><Clock size={15} className="text-[#8B5CF6]" /> {job.posted}</span>
                  </div>

                  <p className="text-sm leading-relaxed font-medium mb-5" style={{ color: 'var(--text-muted)' }}>{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-black"
                        style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => navigate(`/JobDetails?school=${job.schoolId}&job=${job.jobId}`)}
                      className="flex-1 min-w-[140px] h-12 bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white rounded-[14px] text-sm font-black shadow-lg hover:opacity-90 transition-all">
                      View Details & Apply
                    </button>
                    <button onClick={() => toggleSave(job)}
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center shadow-md transition-all"
                      style={{ background: isSaved ? '#9810FA' : 'var(--surface-muted)', color: isSaved ? '#fff' : '#9810FA', border: '1px solid var(--border-default)' }}>
                      <BookOpen size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseJobs;