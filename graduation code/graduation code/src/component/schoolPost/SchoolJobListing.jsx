import React from 'react';
import { Loader2 } from 'lucide-react';
import SchoolJobCard from './SchoolJobCard';

export default function SchoolJobListing({ jobs, loading, error, onRetry, onView, onEdit, onDelete, onToggleStatus, togglingId }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-500 font-semibold mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-xl bg-[#6B4EFF] text-white text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-lg font-semibold mb-2">No job posts yet</p>
        <p className="text-sm">Click "Post a New Job" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <SchoolJobCard
          key={job.job_id ?? job.Job_ID}
          job={job}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isToggling={togglingId === (job.job_id ?? job.Job_ID)}
        />
      ))}
    </div>
  );
}