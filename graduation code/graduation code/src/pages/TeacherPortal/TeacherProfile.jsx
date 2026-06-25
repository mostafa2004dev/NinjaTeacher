import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext/ThemeContext';
import { GOVERNORATES, GOV_CITIES } from '../../data/schoolOptions';

const BASE_URL = 'http://localhost:3000';

const icons = {
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  MapPin: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Mail: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Briefcase: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  GradCap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Award: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Edit: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  X: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Upload: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  FileText: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Plus: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
};

function isDarkNow() {
  return document.documentElement.classList.contains('dark');
}

function fileUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  return `${BASE_URL}/${p.replace(/^\//, '')}`;
}

function authHeaders() {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD MODALS
// ─────────────────────────────────────────────────────────────────────────────

function AddExperienceModal({ open, onClose, onAdded, t, dark }) {
  const empty = { job_title: '', school_name: '', location: '', subject: '', start_date: '', end_date: '', is_current: false, description: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setForm(empty); setError(''); } }, [open]);
  if (!open) return null;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.job_title || !form.school_name || !form.start_date) {
      setError('Job title, school name, and start date are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/profile/experience`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add experience.');
      onAdded(data.data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add Work Experience" onClose={onClose} onSave={handleSave} saving={saving} error={error} t={t} dark={dark}>
      <ModalGrid>
        <ModalField label="Job Title *" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.job_title} onChange={set('job_title')} placeholder="e.g. Math Teacher" /></ModalField>
        <ModalField label="School / Organization *" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.school_name} onChange={set('school_name')} placeholder="e.g. Nile Academy" /></ModalField>
        <ModalField label="Location" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.location} onChange={set('location')} placeholder="e.g. Cairo" /></ModalField>
        <ModalField label="Subject" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.subject} onChange={set('subject')} placeholder="e.g. Mathematics" /></ModalField>
        <ModalField label="Start Date *" t={t} dark={dark}><input type="date" style={inputSt(t, dark)} value={form.start_date} onChange={set('start_date')} /></ModalField>
        <ModalField label="End Date" t={t} dark={dark}>
          <input type="date" style={inputSt(t, dark)} value={form.end_date} onChange={set('end_date')} disabled={form.is_current} />
        </ModalField>
      </ModalGrid>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: t.textSecondary, marginTop: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.is_current} onChange={set('is_current')} style={{ accentColor: '#8b5cf6', width: 15, height: 15 }} />
        Currently working here
      </label>
      <ModalField label="Description" t={t} dark={dark} style={{ marginTop: 12 }}>
        <textarea style={{ ...inputSt(t, dark), resize: 'vertical' }} rows={3} value={form.description} onChange={set('description')} placeholder="Brief description of your role…" />
      </ModalField>
    </ModalShell>
  );
}

function AddEducationModal({ open, onClose, onAdded, t, dark }) {
  const empty = { degree: '', institution: '', field: '', start_year: '', end_year: '', grade: '', description: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setForm(empty); setError(''); } }, [open]);
  if (!open) return null;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.degree || !form.institution) {
      setError('Degree and institution are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/profile/education`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add education.');
      onAdded(data.data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add Education" onClose={onClose} onSave={handleSave} saving={saving} error={error} t={t} dark={dark}>
      <ModalGrid>
        <ModalField label="Degree *" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.degree} onChange={set('degree')} placeholder="e.g. Bachelor of Education" /></ModalField>
        <ModalField label="Institution *" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.institution} onChange={set('institution')} placeholder="e.g. Cairo University" /></ModalField>
        <ModalField label="Field of Study" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.field} onChange={set('field')} placeholder="e.g. Mathematics" /></ModalField>
        <ModalField label="Grade / GPA" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.grade} onChange={set('grade')} placeholder="e.g. Excellent / 3.8" /></ModalField>
        <ModalField label="Start Year" t={t} dark={dark}><input type="number" style={inputSt(t, dark)} value={form.start_year} onChange={set('start_year')} placeholder="2018" min="1970" max="2100" /></ModalField>
        <ModalField label="End Year" t={t} dark={dark}><input type="number" style={inputSt(t, dark)} value={form.end_year} onChange={set('end_year')} placeholder="2022" min="1970" max="2100" /></ModalField>
      </ModalGrid>
      <ModalField label="Description" t={t} dark={dark} style={{ marginTop: 12 }}>
        <textarea style={{ ...inputSt(t, dark), resize: 'vertical' }} rows={3} value={form.description} onChange={set('description')} placeholder="Optional notes about your studies…" />
      </ModalField>
    </ModalShell>
  );
}

function AddCertificationModal({ open, onClose, onAdded, t, dark }) {
  const empty = { title: '', issuing_org: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '', description: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setForm(empty); setError(''); } }, [open]);
  if (!open) return null;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/profile/certifications`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add certification.');
      onAdded(data.data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add Certification" onClose={onClose} onSave={handleSave} saving={saving} error={error} t={t} dark={dark}>
      <ModalGrid>
        <ModalField label="Certificate Title *" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.title} onChange={set('title')} placeholder="e.g. CELTA" /></ModalField>
        <ModalField label="Issuing Organization" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.issuing_org} onChange={set('issuing_org')} placeholder="e.g. Cambridge" /></ModalField>
        <ModalField label="Issue Date" t={t} dark={dark}><input type="date" style={inputSt(t, dark)} value={form.issue_date} onChange={set('issue_date')} /></ModalField>
        <ModalField label="Expiry Date" t={t} dark={dark}><input type="date" style={inputSt(t, dark)} value={form.expiry_date} onChange={set('expiry_date')} /></ModalField>
        <ModalField label="Credential ID" t={t} dark={dark}><input style={inputSt(t, dark)} value={form.credential_id} onChange={set('credential_id')} placeholder="Optional" /></ModalField>
        <ModalField label="Credential URL" t={t} dark={dark}><input type="url" style={inputSt(t, dark)} value={form.credential_url} onChange={set('credential_url')} placeholder="https://…" /></ModalField>
      </ModalGrid>
      <ModalField label="Description" t={t} dark={dark} style={{ marginTop: 12 }}>
        <textarea style={{ ...inputSt(t, dark), resize: 'vertical' }} rows={3} value={form.description} onChange={set('description')} placeholder="Optional notes…" />
      </ModalField>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MODAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, onSave, saving, error, t, dark, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.6)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 580, maxHeight: '85vh', background: t.card, borderRadius: 22, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.02em' }}>{title}</h2>
          <button className="tp-btn" onClick={onClose} style={{ color: t.textMuted, padding: 6, borderRadius: 8, display: 'flex' }}><icons.X /></button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {children}
          {error && (
            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: `1px solid ${t.border}` }}>
          <button className="tp-btn" onClick={onClose} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: t.textSecondary, border: `1px solid ${t.border}` }}>Cancel</button>
          <button className="tp-btn" onClick={onSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(120deg,#6366f1,#7c3aed)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>;
}

function ModalField({ label, children, t, dark, style: extraStyle }) {
  return (
    <div style={extraStyle}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function inputSt(t, dark) {
  return {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: dark ? '#0b1220' : '#ffffff',
    color: t.textPrimary, fontSize: 13, fontFamily: 'inherit', outline: 'none',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmDeleteModal({ open, onClose, onConfirm, label, t }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.6)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', padding: '28px 24px' }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: t.textPrimary, marginBottom: 10 }}>Delete entry?</div>
        <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6, marginBottom: 22 }}>
          Are you sure you want to delete <strong style={{ color: t.textSecondary }}>{label}</strong>? This cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="tp-btn" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: t.textSecondary, border: `1px solid ${t.border}` }}>Cancel</button>
          <button className="tp-btn" onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(120deg,#ef4444,#dc2626)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT PROFILE MODAL (unchanged logic, same as before)
// ─────────────────────────────────────────────────────────────────────────────

const EDIT_FIELDS = [
  {
    section: 'Personal Information',
    fields: [
      { key: 'Phone', label: 'Phone', type: 'tel', placeholder: '+20 1xx xxx xxxx' },
      { key: 'Date_of_Birth', label: 'Date of Birth', type: 'date' },
      { key: 'Gender', label: 'Gender', type: 'select', options: ['male', 'female'] },
      { key: 'Nationality', label: 'Nationality', type: 'text', placeholder: 'e.g. Egyptian' },
    ],
  },
  {
    section: 'Professional Details',
    fields: [
      { key: 'Specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Math' },
      { key: 'Teacher_Stage', label: 'Teaching Stage', type: 'select', options: ['Kindergarten', 'Primary School', 'Middle School', 'High School'] },
      { key: 'Years_of_Experience', label: 'Years of Experience', type: 'number', min: 0 },
      { key: 'Qualifications', label: 'Qualifications', type: 'text', placeholder: 'e.g. B.Ed Mathematics' },
      { key: 'Job_Type_Preference', label: 'Job Type Preference', type: 'select', options: ['Full-time', 'Part-time', 'Online', 'Hybrid', 'Freelance'] },
      { key: 'Expected_Salary', label: 'Expected Salary', type: 'number', min: 0 },
    ],
  },
  {
    section: 'Links',
    fields: [
      { key: 'LinkedIn_URL', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/...' },
      { key: 'Website_URL', label: 'Website URL', type: 'url', placeholder: 'https://...' },
    ],
  },
];

function toDateInputValue(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function EditProfileModal({ open, onClose, profile, dark, t, onSaved }) {
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvName, setCvName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFormData({
      Phone: profile?.Phone || '',
      Date_of_Birth: toDateInputValue(profile?.Date_of_Birth),
      Gender: profile?.Gender || profile?.gender || '',
      Nationality: profile?.Nationality || '',
      Location: profile?.Location || '',
      Governorate: profile?.Governorate || '',
      Specialization: profile?.Specialization || '',
      Teacher_Stage: profile?.Teacher_Stage || profile?.teacher_stage || '',
      Years_of_Experience: profile?.Years_of_Experience ?? '',
      Qualifications: profile?.Qualifications || '',
      Job_Type_Preference: profile?.Job_Type_Preference || '',
      Expected_Salary: profile?.Expected_Salary ?? '',
      LinkedIn_URL: profile?.LinkedIn_URL || '',
      Website_URL: profile?.Website_URL || '',
    });
    setBio(profile?.Bio || '');
    setImageFile(null);
    setImagePreview(profile?.Image ? fileUrl(profile.Image) : '');
    setCvFile(null);
    setCvName(profile?.CV_File ? profile.CV_File.split('/').pop() : '');
    setError('');
  }, [open, profile]);

  if (!open) return null;

  const handleChange = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  const handleGovernorateChange = (e) => {
    const gov = e.target.value;
    setFormData((prev) => ({ ...prev, Governorate: gov, Location: '' }));
  };
  const cityOptions = GOV_CITIES[formData.Governorate] || [];

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCvPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    setCvName(file.name);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('userToken');
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value === null || value === undefined ? '' : value);
      });
      fd.append('Bio', bio);
      if (imageFile) fd.append('image', imageFile);
      if (cvFile) fd.append('cv', cvFile);

      const res = await fetch(`${BASE_URL}/profile/basic`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Failed to save changes. Please try again.');
      const data = await res.json();
      onSaved(data?.data || { ...formData, Bio: bio });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const iSt = inputSt(t, dark);
  const labelStyle = { display: 'block', fontSize: 11.5, fontWeight: 700, color: t.textMuted, marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, maxHeight: '88vh', background: t.card, borderRadius: 22, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.02em' }}>Edit Profile</h2>
          <button className="tp-btn" onClick={onClose} style={{ color: t.textMuted, padding: 6, borderRadius: 8, display: 'flex' }}><icons.X /></button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {/* Avatar + CV */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 76, height: 76, borderRadius: 16, overflow: 'hidden', border: `2px solid ${t.border}` }}>
                {imagePreview ? <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: t.border }} />}
              </div>
              <label className="tp-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#6366f1', padding: '5px 10px', borderRadius: 8, border: '1px solid #6366f1', cursor: 'pointer' }}>
                <icons.Upload size={11} /> Change photo
                <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={labelStyle}>CV / Resume</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px dashed ${t.border}`, background: dark ? 'rgba(99,102,241,0.06)' : '#f8f7ff' }}>
                <span style={{ color: '#6366f1', flexShrink: 0 }}><icons.FileText size={16} /></span>
                <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cvName || 'No CV uploaded'}</span>
                <label className="tp-btn" style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', cursor: 'pointer', flexShrink: 0 }}>
                  Replace
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvPick} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>

          {EDIT_FIELDS.map((section) => (
            <div key={section.section} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{section.section}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {section.fields.map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={formData[f.key] || ''} onChange={handleChange(f.key)} style={iSt}>
                        <option value="">Select…</option>
                        {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} min={f.min} placeholder={f.placeholder} value={formData[f.key] || ''} onChange={handleChange(f.key)} style={iSt} />
                    )}
                  </div>
                ))}
                {section.section === 'Personal Information' && (
                  <>
                    <div>
                      <label style={labelStyle}>Governorate</label>
                      <select value={formData.Governorate || ''} onChange={handleGovernorateChange} style={iSt}>
                        <option value="">Select governorate…</option>
                        {GOVERNORATES.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>City</label>
                      <select value={formData.Location || ''} onChange={handleChange('Location')} disabled={!formData.Governorate} style={{ ...iSt, opacity: formData.Governorate ? 1 : 0.6, cursor: formData.Governorate ? 'pointer' : 'not-allowed' }}>
                        <option value="">{formData.Governorate ? 'Select city…' : 'Select governorate first'}</option>
                        {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell schools a bit about your teaching style…" style={{ ...iSt, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {error && <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: `1px solid ${t.border}` }}>
          <button className="tp-btn" onClick={onClose} disabled={saving} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: t.textSecondary, border: `1px solid ${t.border}` }}>Cancel</button>
          <button className="tp-btn" onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(120deg,#6366f1,#7c3aed)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TeacherProfile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [dark, setDark] = useState(isDarkNow);
  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // ── Add modals ──
  const [addExpOpen, setAddExpOpen] = useState(false);
  const [addEduOpen, setAddEduOpen] = useState(false);
  const [addCertOpen, setAddCertOpen] = useState(false);

  // ── Delete confirm state ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  // deleteTarget = { type: 'experience'|'education'|'certifications', id, label }

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setLoadError('No auth token found. Make sure you are logged in.');
      setLoading(false);
      return;
    }
    fetch(`${BASE_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body?.message || `Request failed with status ${r.status}`);
        }
        return r.json();
      })
      .then((d) => setProfile(d?.data || null))
      .catch((err) => { console.error('Failed to load profile:', err); setLoadError(err.message || 'Failed to load profile.'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDarkNow()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const t = dark ? themes.dark : themes.light;

  // ── handlers ──
  const handleExpAdded = (exp) => {
    setProfile((prev) => ({ ...prev, experience: [...(prev.experience || []), exp] }));
  };

  const handleEduAdded = (edu) => {
    setProfile((prev) => ({ ...prev, education: [...(prev.education || []), edu] }));
  };

  const handleCertAdded = (cert) => {
    setProfile((prev) => ({ ...prev, certifications: [...(prev.certifications || []), cert] }));
  };

  const confirmDelete = (type, id, label) => setDeleteTarget({ type, id, label });

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/profile/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setProfile((prev) => ({
        ...prev,
        [type]: (prev[type] || []).filter((item) => item.id !== id),
      }));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── derived display data (keeping raw id) ──
  const jobs = (profile?.experience || []).map((e) => ({
    id: e.id,
    title: e.job_title || e.Job_Title || e.title || 'Position',
    place: e.school_name || e.School_Name || e.company || '',
    date: [e.start_date || e.Start_Date, e.is_current ? 'Present' : (e.end_date || e.End_Date || 'Present')].filter(Boolean).join(' – '),
  }));

  const edu = (profile?.education || []).map((e) => ({
    id: e.id,
    degree: e.degree || e.Degree || 'Degree',
    school: e.institution || e.Institution || '',
    year: e.end_year || e.End_Year || '',
  }));

  const certs = (profile?.certifications || []).map((c) => ({
    id: c.id,
    label: c.title || c.Title || c.Certificate_Name || c.name || String(c),
  }));

  // shared "add" button style
  const addBtnSt = (color) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 11, fontWeight: 700, color,
    border: `1px solid ${color}`,
    borderRadius: 8, padding: '4px 10px',
    cursor: 'pointer', background: 'none', fontFamily: 'inherit',
    transition: 'background 0.15s',
  });

  const trashBtnSt = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 7,
    border: 'none', background: 'rgba(239,68,68,0.1)',
    color: '#ef4444', cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.15s',
  };

  return (
    <div className="tp-page-container" style={{ background: t.pageBg, minHeight: '100vh', fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif", color: t.textPrimary, transition: 'background 0.3s, color 0.3s', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .tp-page-container * { box-sizing: border-box; margin: 0; padding: 0; }
        .tp-btn { cursor: pointer; border: none; background: none; font-family: inherit; }
        .tp-back:hover { color: #6366f1 !important; }
        .tp-edit-btn:hover { background: #6366f1 !important; color: #fff !important; }
        .tp-trash:hover { background: rgba(239,68,68,0.22) !important; }
        @media (max-width: 768px) { .tp-page-container .tp-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) {
          .tp-page-container .tp-avatar-row { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .tp-page-container .tp-header-info { flex-direction: column !important; align-items: center !important; gap: 16px !important; }
          .tp-page-container .tp-meta { justify-content: center !important; gap: 12px !important; }
        }
      `}</style>

      {/* Navbar */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, transition: 'background 0.3s' }}>
        <button className="tp-btn tp-back" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.textMuted, fontSize: 13, fontWeight: 600, transition: 'color 0.2s' }}>
          <icons.ChevronLeft /> Back to Dashboard
        </button>
        <button className="tp-btn tp-edit-btn" onClick={() => setEditOpen(true)} disabled={!profile} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1', border: '1.5px solid #6366f1', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, transition: 'background 0.2s, color 0.2s', opacity: profile ? 1 : 0.5 }}>
          <icons.Edit size={13} /> Edit Profile
        </button>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '20px 16px 60px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: t.textMuted, fontSize: 13, fontWeight: 600 }}>Loading profile…</div>}
        {!loading && loadError && <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Couldn't load your profile: {loadError}</div>}
        {!loading && !loadError && !profile && <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#a16207', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>No profile data was returned by the server.</div>}

        {/* Profile Header Card */}
        <div style={{ background: t.card, borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <div style={{ background: 'linear-gradient(120deg,#6366f1 0%,#7c3aed 50%,#9333ea 100%)', padding: '24px 28px 40px' }} />
          <div style={{ padding: '0 28px 24px' }}>
            <div className="tp-avatar-row" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: -32 }}>
                <div style={{ width: 88, height: 88, borderRadius: 18, overflow: 'hidden', border: `4px solid ${t.card}`, boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                  <img src={profile?.Image ? fileUrl(profile.Image) : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'} alt={profile?.Name || 'Teacher'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div className="tp-header-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.03em' }}>{profile?.Name || 'Teacher'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6366f1', marginTop: 3 }}>
                      <icons.Briefcase size={12} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{profile?.Specialization || 'Specialization not set'}</span>
                    </div>
                    {(profile?.Teacher_Stage || profile?.teacher_stage) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#7c3aed', marginTop: 2 }}>
                        <icons.GradCap />
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{profile.Teacher_Stage || profile.teacher_stage}</span>
                      </div>
                    )}
                  </div>
                  <div className="tp-match-score" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '10px 20px', textAlign: 'center', marginTop: -36, boxShadow: t.shadow }}>
                    <div style={{ color: '#10b981', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{profile?.evaluationScore ?? 0}</div>
                    <div style={{ color: t.textMuted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Evaluation Score</div>
                  </div>
                </div>
                <div className="tp-meta" style={{ display: 'flex', gap: '16px 20px', marginTop: 12, flexWrap: 'wrap' }}>
                  {[
                    { icon: <icons.MapPin size={12} />, text: [profile?.Location, profile?.Governorate].filter(Boolean).join(', ') || 'Location not set' },
                    { icon: <icons.Mail size={12} />, text: profile?.Email || '—' },
                    { icon: <icons.Briefcase size={12} />, text: profile?.Years_of_Experience ? `${profile.Years_of_Experience} years experience` : 'Experience N/A' },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: t.textMuted, fontSize: 12, fontWeight: 500 }}>
                      <span style={{ color: '#6366f1' }}>{m.icon}</span>{m.text}
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 12, color: t.textMuted, fontSize: 12.5, lineHeight: 1.7, maxWidth: 560 }}>{profile?.Bio || 'No bio added yet.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="tp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginTop: 16 }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Work Experience */}
            <Section
              icon={<icons.Briefcase size={18} />}
              iconBg={dark ? '#2a1f4a' : '#f5f3ff'}
              iconColor="#8b5cf6"
              title="Work Experience"
              t={t}
              action={
                <button className="tp-btn" style={addBtnSt('#8b5cf6')} onClick={() => setAddExpOpen(true)}>
                  <icons.Plus size={12} /> Add
                </button>
              }
            >
              {jobs.length === 0 ? (
                <EmptyState text="No work experience added yet." t={t} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {jobs.map((job) => (
                    <div key={job.id} style={{ paddingLeft: 16, borderLeft: '3px solid #8b5cf6', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted }}>🕒 {job.date}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: t.textPrimary, marginTop: 2 }}>{job.title}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginTop: 2 }}>{job.place}</div>
                      </div>
                      <button
                        className="tp-btn tp-trash"
                        style={trashBtnSt}
                        title="Delete"
                        onClick={() => confirmDelete('experience', job.id, job.title)}
                      >
                        <icons.Trash size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Education */}
            <Section
              icon={<icons.GradCap />}
              iconBg={dark ? '#0c1a3a' : '#eff6ff'}
              iconColor="#3b82f6"
              title="Education"
              t={t}
              action={
                <button className="tp-btn" style={addBtnSt('#3b82f6')} onClick={() => setAddEduOpen(true)}>
                  <icons.Plus size={12} /> Add
                </button>
              }
            >
              {edu.length === 0 ? (
                <EmptyState text="No education entries added yet." t={t} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {edu.map((e, i) => (
                    <div key={e.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: t.textPrimary }}>{e.degree}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginTop: 2 }}>{e.school}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{e.year}</div>
                        </div>
                        <button
                          className="tp-btn tp-trash"
                          style={trashBtnSt}
                          title="Delete"
                          onClick={() => confirmDelete('education', e.id, e.degree)}
                        >
                          <icons.Trash size={13} />
                        </button>
                      </div>
                      {i < edu.length - 1 && <div style={{ height: 1, background: t.border, margin: '14px 0' }} />}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* CV */}
            <Section icon={<icons.FileText size={18} />} iconBg={dark ? '#1e1033' : '#f5f3ff'} iconColor="#7c3aed" title="CV / Resume" t={t}>
              {profile?.CV_File ? (
                <a href={fileUrl(profile.CV_File)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: dark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.06)', border: `1px solid ${dark ? 'rgba(124,58,237,0.2)' : '#ede9fe'}`, textDecoration: 'none' }}>
                  <span style={{ color: '#7c3aed', flexShrink: 0 }}><icons.FileText size={16} /></span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.CV_File.split('/').pop()}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed' }}>View →</span>
                </a>
              ) : (
                <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>No CV uploaded yet. Add one from Edit Profile.</div>
              )}
            </Section>

            {/* Certifications */}
            <Section
              icon={<icons.Award />}
              iconBg={dark ? '#052e16' : '#ecfdf5'}
              iconColor="#10b981"
              title="Certifications"
              t={t}
              action={
                <button className="tp-btn" style={addBtnSt('#10b981')} onClick={() => setAddCertOpen(true)}>
                  <icons.Plus size={12} /> Add
                </button>
              }
            >
              {certs.length === 0 ? (
                <EmptyState text="No certifications added yet." t={t} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {certs.map((c) => (
                    <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: dark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)', borderRadius: 12, border: `1px solid ${dark ? 'rgba(16,185,129,0.15)' : '#d1fae5'}` }}>
                      <span style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}><icons.Check size={13} /></span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: t.textSecondary, flex: 1 }}>{c.label}</span>
                      <button
                        className="tp-btn tp-trash"
                        style={{ ...trashBtnSt, width: 24, height: 24 }}
                        title="Delete"
                        onClick={() => confirmDelete('certifications', c.id, c.label)}
                      >
                        <icons.Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Quick Stats */}
            <Section icon={<icons.BarChart />} iconBg={dark ? '#2d0a1e' : '#fff1f2'} iconColor="#e11d48" title="Quick Stats" t={t}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatCard label="Years of Experience" value={profile?.Years_of_Experience ?? '—'} bg={dark ? 'rgba(99,102,241,0.1)' : '#f5f3ff'} border={dark ? 'rgba(139,92,246,0.2)' : '#e9d5ff'} color={dark ? '#c4b5fd' : '#581c87'} />
                <StatCard label="Certifications" value={certs.length} bg={dark ? 'rgba(59,130,246,0.1)' : '#f0f9ff'} border={dark ? 'rgba(59,130,246,0.2)' : '#bae6fd'} color={dark ? '#93c5fd' : '#1e40af'} />
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} profile={profile} dark={dark} t={t} onSaved={(updated) => setProfile((prev) => ({ ...prev, ...updated }))} />
      <AddExperienceModal open={addExpOpen} onClose={() => setAddExpOpen(false)} onAdded={handleExpAdded} t={t} dark={dark} />
      <AddEducationModal open={addEduOpen} onClose={() => setAddEduOpen(false)} onAdded={handleEduAdded} t={t} dark={dark} />
      <AddCertificationModal open={addCertOpen} onClose={() => setAddCertOpen(false)} onAdded={handleCertAdded} t={t} dark={dark} />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        label={deleteTarget?.label}
        t={t}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Section({ icon, iconBg, iconColor, title, t, children, action }) {
  return (
    <div style={{ background: t.card, borderRadius: 20, padding: '24px', border: `1px solid ${t.border}`, boxShadow: t.shadow, transition: 'background 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: 9, background: iconBg, borderRadius: 12, color: iconColor }}>{icon}</div>
          <h2 style={{ fontSize: 14.5, fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</h2>
        </div>
        {action && action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text, t }) {
  return (
    <div style={{ textAlign: 'center', padding: '18px 0', color: t.textMuted, fontSize: 12, fontWeight: 600, borderRadius: 10, border: `1px dashed ${t.border}` }}>
      {text}
    </div>
  );
}

function StatCard({ label, value, bg, border, color }) {
  return (
    <div style={{ padding: '14px 16px', background: bg, borderRadius: 14, border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.04em' }}>{value}</span>
    </div>
  );
}

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