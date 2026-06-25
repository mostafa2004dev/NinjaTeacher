import React from 'react';
import { Calendar, Users, Clock, Briefcase, Eye, Edit3, Trash2 } from 'lucide-react';

const cardBg = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };

const TRAIT_COLORS = [
  'bg-green-50  text-green-600  border-green-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-blue-50   text-blue-600   border-blue-100',
  'bg-amber-50  text-amber-600  border-amber-100',
  'bg-rose-50   text-rose-600   border-rose-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
];

function getTraitColor(index) {
  return TRAIT_COLORS[index % TRAIT_COLORS.length];
}

// يحوّل الـ personality fields من الباك إلى traits قابلة للعرض
function extractTraits(job) {
  const fields = [
    job.teaching_style,
    job.classroom_energy,
    job.leadership_style,
    job.communication_style,
    job.problem_solving,
  ];
  return fields.filter(Boolean);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

// ── ToggleSwitch (Google-style) ────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: checked ? '#16a34a' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(4px)' }}
      />
    </button>
  );
}

export default function SchoolJobCard({ job, onView, onEdit, onDelete, onToggleStatus, isToggling }) {
  const traits = extractTraits(job);
  const subjects = Array.isArray(job.subjects) ? job.subjects : [];
  const status = job.Status ?? job.status;
  const isActive = status === 'active';

  return (
    <div
      className="rounded-[20px] p-6 transition-all"
      style={{ ...cardBg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {job.Title || job.title}
          </h3>
          <p className="text-purple-500 font-bold text-sm mt-0.5">
            {subjects.join(', ') || '—'}
          </p>
        </div>

        {/* Status badge + Toggle switch */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
              isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isActive ? 'Active' : 'Closed'}
          </span>
          <ToggleSwitch
            checked={isActive}
            disabled={isToggling}
            label={isActive ? 'Close job post' : 'Activate job post'}
            onChange={() => onToggleStatus?.(job)}
          />
        </div>
      </div>

      {/* Description */}
      {(job.Description || job.description) && (
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {job.Description || job.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-4" style={{ color: 'var(--text-muted)' }}>
        {(job.Date || job.date) && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Calendar size={14} className="text-purple-400" />
            Posted {formatDate(job.Date || job.date)}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Users size={14} className="text-purple-400" />
          {job.applicants_count ?? 0} applicants
        </div>
        {(job.Required_Experience || job.required_experience) != null && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Clock size={14} className="text-purple-400" />
            {job.Required_Experience ?? job.required_experience}+ yrs exp
          </div>
        )}
        {(job.Job_Type || job.job_type) && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Briefcase size={14} className="text-purple-400" />
            {job.Job_Type || job.job_type}
          </div>
        )}
        {(job.Required_Stage || job.required_stage) && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
            🎓 {job.Required_Stage || job.required_stage}
          </div>
        )}
        {(job.Salary_Range || job.salary_range) && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            💰 {job.Salary_Range || job.salary_range}
          </div>
        )}
      </div>

      {/* Traits */}
      {traits.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Ideal Personality Traits We're Looking For:
          </p>
          <div className="flex flex-wrap gap-2">
            {traits.map((trait, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getTraitColor(idx)}`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          onClick={() => onView?.(job)}
          className="flex items-center gap-2 bg-[#6B4EFF] hover:bg-[#5a3fe0] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
        >
          <Eye size={14} /> View Post
        </button>
        <button
          onClick={() => onEdit?.(job)}
          className="p-2.5 text-purple-600 rounded-xl transition-all hover:bg-purple-50"
          style={{ ...cardBg }}
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={() => onDelete?.(job)}
          className="p-2.5 text-rose-500 rounded-xl transition-all hover:bg-rose-50"
          style={{ ...cardBg }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}