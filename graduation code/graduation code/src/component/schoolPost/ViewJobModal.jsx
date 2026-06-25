import React from 'react';
import {
  X, MapPin, Calendar, Users, Clock, Briefcase, GraduationCap,
  HandCoins, BookOpenText, Brain, MessageSquareText
} from 'lucide-react';

const cardBg = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
const labelColor = { color: 'var(--text-primary)' };
const subColor = { color: 'var(--text-muted)' };

const TRAIT_COLORS = [
  'bg-green-50  text-green-600  border-green-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-blue-50   text-blue-600   border-blue-100',
  'bg-amber-50  text-amber-600  border-amber-100',
  'bg-rose-50   text-rose-600   border-rose-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
];

function Section({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-muted)' }}>
      <h4 className="text-sm font-bold mb-3" style={labelColor}>{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-purple-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={subColor}>{label}</p>
        <p className="text-sm font-medium" style={labelColor}>{value}</p>
      </div>
    </div>
  );
}

function TraitBadge({ value, index }) {
  if (!value) return null;
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${TRAIT_COLORS[index % TRAIT_COLORS.length]}`}>
      {value}
    </span>
  );
}

export default function ViewJobModal({ job, onClose }) {
  if (!job) return null;

  const subjects = Array.isArray(job.subjects) ? job.subjects : [];
  const isActive = job.Status === 'active' || job.status === 'active';

  const traits = [
    job.teaching_style || job.Teaching_Style,
    job.classroom_energy || job.Classroom_Energy,
    job.leadership_style || job.Leadership_Style,
    job.communication_style || job.Communication_Style,
    job.problem_solving || job.Problem_Solving,
  ].filter(Boolean);

  const traitLabels = [
    { key: 'teaching_style', label: 'Teaching Style' },
    { key: 'classroom_energy', label: 'Classroom Energy' },
    { key: 'leadership_style', label: 'Leadership Style' },
    { key: 'communication_style', label: 'Communication Style' },
    { key: 'problem_solving', label: 'Problem Solving' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={cardBg}
      >
        {/* Top bar */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 rounded-t-2xl z-10"
          style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)' }}
        >
          <div>
            <h2 className="text-xl font-bold" style={labelColor}>
              {job.Title || job.title}
            </h2>
            <p className="text-purple-500 text-sm font-semibold">
              {subjects.join(', ') || '—'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {isActive ? 'Active' : 'Expired'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition-all"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Description */}
          {(job.Description || job.description) && (
            <p className="text-sm leading-relaxed" style={subColor}>
              {job.Description || job.description}
            </p>
          )}

          {/* Job Info */}
          <Section title="Job Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<MapPin size={15} />} label="Location" value={job.Location || job.location} />
              <InfoRow icon={<HandCoins size={15} />} label="Salary Range" value={job.Salary_Range || job.salary_range} />
              <InfoRow icon={<Clock size={15} />} label="Required Experience" value={
                (job.Required_Experience ?? job.required_experience) != null
                  ? `${job.Required_Experience ?? job.required_experience}+ years`
                  : null
              } />
              <InfoRow icon={<Calendar size={15} />} label="Start Date" value={
                (job.Start_Date || job.start_date)
                  ? new Date(job.Start_Date || job.start_date).toLocaleDateString()
                  : null
              } />
              <InfoRow icon={<Briefcase size={15} />} label="Job Type" value={job.Job_Type || job.job_type} />
              <InfoRow icon={<GraduationCap size={15} />} label="Required Stage" value={job.Required_Stage || job.required_stage} />
              <InfoRow icon={<Users size={15} />} label="Applicants" value={job.applicants_count} />
            </div>

            {(job.Required_Qualifications || job.required_qualifications) && (
              <div className="mt-3">
                <InfoRow
                  icon={<GraduationCap size={15} />}
                  label="Qualifications"
                  value={job.Required_Qualifications || job.required_qualifications}
                />
              </div>
            )}
          </Section>

          {/* Subjects */}
          {subjects.length > 0 && (
            <Section title="Subjects">
              <div className="flex flex-wrap gap-2">
                {subjects.map(s => (
                  <span key={s} className="rounded-full bg-gradient-to-r from-[#9810FA] to-[#155DFC] px-3 py-1 text-xs font-semibold text-white">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Personality Traits */}
          {traits.length > 0 && (
            <Section title="Ideal Teacher Personality">
              <div className="space-y-3">
                {traitLabels.map(({ key, label }) => {
                  const val = job[key] || job[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
                  if (!val) return null;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold w-36 shrink-0" style={subColor}>{label}</span>
                      <TraitBadge value={val} index={traitLabels.findIndex(t => t.key === key)} />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* School Info */}
          {job.school && (
            <Section title="School">
              <div className="flex items-center gap-3">
                {job.school.image && (
                  <img src={job.school.image} alt={job.school.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-sm" style={labelColor}>{job.school.school_name || job.school.name}</p>
                  <p className="text-xs" style={subColor}>{job.school.location}</p>
                </div>
                {job.school.rating > 0 && (
                  <span className="ml-auto text-xs font-bold text-amber-500">⭐ {job.school.rating}</span>
                )}
              </div>
            </Section>
          )}

        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 rounded-b-2xl flex justify-end"
          style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-default)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
