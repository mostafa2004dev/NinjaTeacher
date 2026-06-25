import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bell, ChevronLeft, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SchoolJobListing from '../../component/schoolPost/SchoolJobListing';
import ViewJobModal from '../../component/schoolPost/ViewJobModal';
import EditJobWizard from '../../component/schoolPost/EditJobWizard';

const API_BASE = 'http://localhost:3000/job-posts';

function getToken() { return localStorage.getItem('userToken'); }
function authHeaders() {
    const token = getToken();
    return { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────
function DeleteConfirmModal({ job, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
                <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                        <span className="text-rose-500 text-2xl">🗑️</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Delete Job Post?</h3>
                    <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                        Are you sure you want to delete <strong>{job?.Title || job?.title}</strong>? This can't be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onCancel} disabled={isLoading}
                            className="px-5 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)' }}>
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={isLoading}
                            className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2">
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 z-[60] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl"
            style={{ background: type === 'success' ? '#10b981' : '#ef4444', color: '#fff', minWidth: '260px' }}>
            <span className="text-sm font-semibold">{message}</span>
            <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">✕</button>
        </div>
    );
}

// ── JobPosts (Parent) ─────────────────────────────────────────────────────────
export default function JobPosts({ onNavigateToCreate, onNavigateToDashboard }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [viewJob, setViewJob] = useState(null);
    const [editJob, setEditJob] = useState(null);
    const [deleteJob, setDeleteJob] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Job_ID اللي عمليه toggle جارية عليه دلوقتي (عشان نعطل الزرار بتاعه بس وقت الـ request)
    const [togglingId, setTogglingId] = useState(null);

    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/my`, { headers: authHeaders() });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setJobs(json.data?.jobs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleDeleteConfirm = async () => {
        if (!deleteJob) return;
        setDeleteLoading(true);
        try {
            const jobId = deleteJob.job_id ?? deleteJob.Job_ID;
            const res = await fetch(`${API_BASE}/${jobId}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            setJobs(prev => prev.filter(j => (j.job_id ?? j.Job_ID) !== jobId));
            showToast('Job post deleted successfully.');
        } catch (err) {
            showToast(err.message || 'Failed to delete.', 'error');
        } finally {
            setDeleteLoading(false);
            setDeleteJob(null);
        }
    };

    const handleEditSaved = (updatedJob) => {
        setJobs(prev => prev.map(j =>
            (j.job_id ?? j.Job_ID) === (updatedJob.job_id ?? updatedJob.Job_ID) ? updatedJob : j
        ));
        setEditJob(null);
        showToast('Job post updated successfully.');
        onNavigateToDashboard?.();
    };

    // ── Toggle Active/Closed ────────────────────────────────────────────────
    const handleToggleStatus = async (job) => {
        const jobId = job.job_id ?? job.Job_ID;
        const currentStatus = job.Status ?? job.status;
        const nextStatus = currentStatus === 'active' ? 'closed' : 'active';

        // optimistic update: نغير الـ UI فورًا قبل ما نستنى رد السيرفر
        setJobs(prev => prev.map(j =>
            (j.job_id ?? j.Job_ID) === jobId ? { ...j, Status: nextStatus, status: nextStatus } : j
        ));
        setTogglingId(jobId);

        try {
            const res = await fetch(`${API_BASE}/${jobId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();

            // نحدّث بالقيمة الراجعة فعليًا من الباك (مصدر الحقيقة)
            setJobs(prev => prev.map(j =>
                (j.job_id ?? j.Job_ID) === jobId ? json.data : j
            ));
            showToast(nextStatus === 'active' ? 'Job post is now active.' : 'Job post closed.');
        } catch (err) {
            // فشل؟ ارجع للحالة القديمة
            setJobs(prev => prev.map(j =>
                (j.job_id ?? j.Job_ID) === jobId ? { ...j, Status: currentStatus, status: currentStatus } : j
            ));
            showToast(err.message || 'Failed to update status.', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--surface-page)' }}>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delete Confirm */}
            {deleteJob && (
                <DeleteConfirmModal
                    job={deleteJob}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteJob(null)}
                    isLoading={deleteLoading}
                />
            )}

            {/* View Modal */}
            {viewJob && <ViewJobModal job={viewJob} onClose={() => setViewJob(null)} />}

            {/* Edit Wizard */}
            {editJob && (
                <EditJobWizard
                    job={editJob}
                    onClose={() => setEditJob(null)}
                    onSaved={handleEditSaved}
                />
            )}

            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <NavLink to="/"
                            className="flex items-center gap-1 text-sm font-medium hover:text-indigo-500 transition-all mb-4 w-fit"
                            style={{ color: 'var(--text-muted)' }}>
                            <ChevronLeft size={16} /> Back to Home
                        </NavLink>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Job Postings</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Manage your active job positions and applicants
                        </p>
                    </div>
                   
                </div>

                {/* Post New Job */}
                <button
                    onClick={onNavigateToCreate}
                    className="bg-[#6B4EFF] hover:bg-[#5a3fe0] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-100 transition-all mb-8"
                >
                    <Plus size={18} strokeWidth={3} /> Post a New Job
                </button>

                {/* Listing */}
                <SchoolJobListing
                    jobs={jobs}
                    loading={loading}
                    error={error}
                    onRetry={fetchJobs}
                    onView={setViewJob}
                    onEdit={setEditJob}
                    onDelete={setDeleteJob}
                    onToggleStatus={handleToggleStatus}
                    togglingId={togglingId}
                />

            </div>
        </div>
    );
}