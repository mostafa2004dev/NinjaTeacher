import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, X, BriefcaseBusiness, BookOpenText, Scale, Shield,
  Sparkles, Award, Building2, CalendarDays, GraduationCap, HandCoins,
  MapPin, MessageSquareText, MoonStar, Zap, Smile, CircleUserRound, Heart,
  LocateFixed, UserRoundCheck, BadgeCheck, Brain, Lightbulb, Wrench, Rocket,
  CheckCircle2, Loader2
} from 'lucide-react';
import { Button } from '@heroui/react';

const API_BASE = 'http://localhost:3000/job-posts';

function getToken() { return localStorage.getItem('userToken'); }
function authHeaders() {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };
}

// ── Style tokens (same as wizard) ─────────────────────────────────────────────
const pageBg   = { background: 'var(--surface-page)' };
const cardBg   = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
const headerBg = { background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)' };
const inputStyle = { background: 'var(--surface-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const inputFocusCls = 'outline-none focus:border-[#155DFC]';
const labelColor = { color: 'var(--text-primary)' };
const subColor   = { color: 'var(--text-muted)' };

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseExperience(val) {
  if (!val && val !== 0) return '';
  const m = String(val).match(/\d+/);
  return m ? `${m[0]}+ years` : String(val);
}

/** Map backend job object → local form state */
function jobToForm(job) {
  return {
    positionTitle:      job.Title        || job.title        || '',
    location:           job.Location     || job.location     || '',
    subjects:           Array.isArray(job.subjects) ? job.subjects : [],
    required_stage:     job.Required_Stage || job.required_stage || '',
    salaryRange:        job.Salary_Range || job.salary_range || '',
    requiredExperience: parseExperience(job.Required_Experience ?? job.required_experience),
    qualifications:     job.Required_Qualifications || job.required_qualifications || '',
    startDate:          job.Start_Date   || job.start_date   || '',
    additionalInfo:     job.Description  || job.description  || '',
  };
}

function formToPayload(jobDetails, selections) {
  return {
    jobDetails: {
      positionTitle:      jobDetails.positionTitle,
      location:           jobDetails.location,
      subjects:           jobDetails.subjects,
      required_stage:     jobDetails.required_stage,
      salaryRange:        jobDetails.salaryRange,
      requiredExperience: jobDetails.requiredExperience,
      qualifications:     jobDetails.qualifications,
      startDate:          jobDetails.startDate,
      additionalInfo:     jobDetails.additionalInfo,
    },
    personality: {
      teachingStyle:      selections.teachingStyle      || [],
      classroomEnergy:    selections.classroomEnergy    || [],
      leadershipStyle:    selections.leadershipStyle    || [],
      communicationStyle: selections.communicationStyle || [],
      problemSolving:     selections.problemSolving     || [],
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ProgressBar({ step, total, percent }) {
  return (
    <div className="mb-5 rounded-2xl p-4" style={cardBg}>
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span style={{ color: 'var(--text-secondary)' }}>Step {step} of {total}</span>
        <span style={{ color: '#9810FA' }}>{percent}% Complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--border-default)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full rounded-full bg-gradient-to-r from-[#9810FA] to-[#155DFC]"
        />
      </div>
    </div>
  );
}

function FieldLabel({ icon, label, required = false }) {
  return (
    <p className="mb-1 flex items-center gap-2 text-base font-semibold" style={labelColor}>
      <span style={{ color: '#9810FA' }}>{icon}</span>
      {label}
      {required && <span className="text-[#FB2C36]">*</span>}
    </p>
  );
}

function NavButtons({ onBack, onNext, nextDisabled = false, nextLabel = 'Next' }) {
  return (
    <div className="mt-5 flex justify-between">
      <Button variant="flat" onPress={onBack}
        className="h-12 min-w-[120px] rounded-xl px-6 text-base font-semibold"
        style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
        startContent={<ArrowLeft size={16} />}>
        Back
      </Button>
      <Button isDisabled={nextDisabled} onPress={onNext}
        className={`h-12 min-w-[120px] rounded-xl px-6 text-base font-semibold transition-all ${!nextDisabled ? 'bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white shadow-lg' : 'text-[#99A1AF]'}`}
        style={nextDisabled ? { background: 'var(--surface-muted)' } : {}}
        endContent={<ArrowRight size={16} />}>
        {nextLabel}
      </Button>
    </div>
  );
}

function TraitStep({ step, percent, title, subtitle, helperText, options, selectionKey, multiSelect = false,
  selections, setSelection, onBack, onNext }) {
  const current = selections[selectionKey] || [];

  const handleSelect = (id) => {
    if (multiSelect) {
      setSelection(selectionKey, current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
    } else {
      setSelection(selectionKey, [id]);
    }
  };

  return (
    <section className="rounded-2xl p-6 shadow-sm" style={cardBg}>
      <ProgressBar step={step} total={6} percent={percent} />
      <h2 className="text-2xl font-bold mb-1" style={labelColor}>{title}</h2>
      <p className="text-sm mb-2" style={subColor}>{subtitle}</p>
      {helperText && <p className="text-sm font-medium mb-4" style={{ color: '#9810FA' }}>{helperText}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {options.map(opt => {
          const isSelected = current.includes(opt.id);
          return (
            <motion.button key={opt.id} type="button"
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(opt.id)}
              className="p-4 rounded-2xl border-2 flex items-start gap-3 text-left w-full transition-all"
              style={{
                background: isSelected ? 'rgba(152,16,250,0.06)' : 'var(--surface-card)',
                borderColor: isSelected ? '#9810FA' : 'var(--border-default)',
              }}>
              <div className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: isSelected ? 'linear-gradient(135deg,#9810FA,#155DFC)' : 'var(--surface-muted)', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                <opt.icon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm" style={labelColor}>{opt.title}</h4>
                <p className="text-xs" style={subColor}>{opt.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={current.length === 0} />
    </section>
  );
}

// ── Main EditJobWizard ────────────────────────────────────────────────────────
export default function EditJobWizard({ job, onClose, onSaved }) {
  const jobId   = job.job_id   ?? job.Job_ID;
  const schoolId = job.school_id ?? job.School_ID;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [jobDetails, setJobDetails] = useState(jobToForm(job));
  const [selections, setSelections] = useState({
    teachingStyle:      job.teaching_style      ? [job.teaching_style]      : [],
    classroomEnergy:    job.classroom_energy    ? [job.classroom_energy]    : [],
    leadershipStyle:    job.leadership_style    ? [job.leadership_style]    : [],
    communicationStyle: job.communication_style ? [job.communication_style] : [],
    problemSolving:     job.problem_solving     ? [job.problem_solving]     : [],
  });

  const setJobField = (key, val) => setJobDetails(prev => ({ ...prev, [key]: val }));
  const setSelection = (key, val) => setSelections(prev => ({ ...prev, [key]: val }));

  const subjects = [
    'Mathematics', 'Science', 'English', 'Arabic', 'Physics', 'Chemistry',
    'Biology', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
  ];

  const toggleSubject = (s) => {
    const next = jobDetails.subjects.includes(s)
      ? jobDetails.subjects.filter(i => i !== s)
      : [...jobDetails.subjects, s];
    setJobField('subjects', next);
  };

  const isStep1Valid =
    jobDetails.positionTitle?.trim() &&
    jobDetails.location?.trim() &&
    jobDetails.subjects?.length > 0 &&
    jobDetails.required_stage?.trim() &&
    jobDetails.requiredExperience?.trim() &&
    jobDetails.salaryRange?.trim();

  const sharedInput = `w-full rounded-xl px-3 py-3 text-sm ${inputFocusCls}`;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = formToPayload(jobDetails, selections);
      const res = await fetch(`${API_BASE}/${jobId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const json = await res.json();
      onSaved?.(json.data ?? json);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const next = () => setStep(s => s + 1);
  const back = () => { if (step === 1) onClose(); else setStep(s => s - 1); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={pageBg}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[80] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl"
          style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', minWidth: '260px' }}>
          <span className="text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <header style={headerBg}>
        <div className="mx-auto w-full max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-[#9810FA] to-[#155DFC] p-3 text-white">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={labelColor}>Edit Job Post</h1>
              <p className="text-sm" style={subColor}>Update the details for this position</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-all" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-5">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}>

            {/* ── Step 1: Job Details ── */}
            {step === 1 && (
              <div className="rounded-2xl p-5 shadow-sm" style={cardBg}>
                <ProgressBar step={1} total={6} percent={17} />
                <h2 className="text-2xl font-bold mb-1" style={labelColor}>Job Details</h2>
                <p className="text-sm mb-5" style={subColor}>Update the basic information about the position</p>

                <div className="space-y-4">
                  <FieldLabel icon={<MapPin size={16} />} label="Location" required />
                  <input value={jobDetails.location} onChange={e => setJobField('location', e.target.value)}
                    placeholder="City, Country" className={sharedInput} style={inputStyle} />

                  <FieldLabel icon={<GraduationCap size={16} />} label="Position Title" required />
                  <input value={jobDetails.positionTitle} onChange={e => setJobField('positionTitle', e.target.value)}
                    placeholder="e.g., High School Math Teacher" className={sharedInput} style={inputStyle} />

                  <FieldLabel icon={<BookOpenText size={16} />} label="Subjects" required />
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(s => {
                      const sel = jobDetails.subjects.includes(s);
                      return (
                        <motion.button key={s} type="button"
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                          onClick={() => toggleSubject(s)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold transition-all"
                          style={{ background: sel ? 'linear-gradient(135deg,#9810FA,#155DFC)' : 'var(--surface-muted)', color: sel ? '#fff' : 'var(--text-secondary)' }}>
                          {s}
                        </motion.button>
                      );
                    })}
                  </div>

                  <FieldLabel icon={<GraduationCap size={16} />} label="Required Stage" required />
                  <select value={jobDetails.required_stage} onChange={e => setJobField('required_stage', e.target.value)}
                    className="w-full rounded-xl border-2 border-[#9810FA] px-4 py-3 text-base outline-none focus:border-[#155DFC]"
                    style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}>
                    <option value="">Select teaching stage</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Primary School">Primary School</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                  </select>

                  <FieldLabel icon={<Award size={16} />} label="Required Experience" required />
                  <select value={jobDetails.requiredExperience} onChange={e => setJobField('requiredExperience', e.target.value)}
                    className="w-full rounded-xl border-2 border-[#9810FA] px-4 py-3 text-base outline-none focus:border-[#155DFC]"
                    style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}>
                    <option value="">Select experience level</option>
                    <option>0-2 years</option>
                    <option>3-5 years</option>
                    <option>6-10 years</option>
                    <option>10+ years</option>
                  </select>

                  <FieldLabel icon={<GraduationCap size={16} />} label="Required Qualifications" />
                  <textarea rows={2} value={jobDetails.qualifications} onChange={e => setJobField('qualifications', e.target.value)}
                    placeholder="e.g., Bachelor's Education, Teaching License"
                    className={`${sharedInput} resize-none`} style={inputStyle} />

                  <FieldLabel icon={<CalendarDays size={16} />} label="Start Date" />
                  <input type="date" value={jobDetails.startDate} onChange={e => setJobField('startDate', e.target.value)}
                    className={sharedInput} style={inputStyle} />

                  <FieldLabel icon={<HandCoins size={16} />} label="Salary Range" required />
                  <input value={jobDetails.salaryRange} onChange={e => setJobField('salaryRange', e.target.value)}
                    placeholder="e.g., $40,000 - $60,000 per year" className={sharedInput} style={inputStyle} />

                  <FieldLabel icon={<MessageSquareText size={16} />} label="Additional Information" />
                  <textarea rows={3} value={jobDetails.additionalInfo} onChange={e => setJobField('additionalInfo', e.target.value)}
                    placeholder="Any other details about the position..."
                    className={`${sharedInput} resize-none`} style={inputStyle} />
                </div>

                <NavButtons onBack={back} onNext={next} nextDisabled={!isStep1Valid} />
              </div>
            )}

            {/* ── Steps 2-6: Traits ── */}
            {step === 2 && <TraitStep step={2} percent={33} title="Teaching Style"
              subtitle="How should the teacher approach classroom management?"
              options={[
                { id: 'strict', title: 'Strict', description: 'Firm rules and high expectations', icon: Shield },
                { id: 'flexible', title: 'Flexible', description: 'Adaptable and open to change', icon: Scale },
                { id: 'structured', title: 'Structured', description: 'Organized with clear routines', icon: BookOpenText },
                { id: 'free-flowing', title: 'Free-flowing', description: 'Spontaneous and creative approach', icon: Sparkles },
              ]}
              selectionKey="teachingStyle" selections={selections} setSelection={setSelection}
              onBack={back} onNext={next} />}

            {step === 3 && <TraitStep step={3} percent={50} title="Classroom Energy"
              subtitle="What energy level works best for your students?"
              options={[
                { id: 'calm', title: 'Calm', description: 'Peaceful and composed atmosphere', icon: MoonStar },
                { id: 'energetic', title: 'Energetic', description: 'High-energy and dynamic', icon: Zap },
                { id: 'balanced', title: 'Balanced', description: 'Mix of calm and energetic', icon: Scale },
                { id: 'playful', title: 'Playful', description: 'Fun and engaging environment', icon: Smile },
              ]}
              selectionKey="classroomEnergy" selections={selections} setSelection={setSelection}
              onBack={back} onNext={next} />}

            {step === 4 && <TraitStep step={4} percent={67} title="Leadership Style"
              subtitle="How should the teacher lead and interact with students?"
              helperText="You can select multiple traits" multiSelect
              options={[
                { id: 'leader', title: 'Leader', description: 'Takes charge and guides decisively', icon: LocateFixed },
                { id: 'supporter', title: 'Supporter', description: 'Nurtures and encourages growth', icon: Heart },
                { id: 'collaborator', title: 'Collaborator', description: 'Works together as a team', icon: CircleUserRound },
                { id: 'mentor', title: 'Mentor', description: 'Guides through experience', icon: UserRoundCheck },
              ]}
              selectionKey="leadershipStyle" selections={selections} setSelection={setSelection}
              onBack={back} onNext={next} />}

            {step === 5 && <TraitStep step={5} percent={83} title="Communication Style"
              subtitle="How should the teacher communicate with students?"
              options={[
                { id: 'direct', title: 'Direct', description: 'Clear and straightforward', icon: LocateFixed },
                { id: 'empathetic', title: 'Empathetic', description: 'Understanding and compassionate', icon: Heart },
                { id: 'formal', title: 'Formal', description: 'Professional and respectful', icon: BadgeCheck },
                { id: 'casual', title: 'Casual', description: 'Friendly and approachable', icon: Smile },
              ]}
              selectionKey="communicationStyle" selections={selections} setSelection={setSelection}
              onBack={back} onNext={next} />}

            {step === 6 && <TraitStep step={6} percent={95} title="Problem-Solving Approach"
              subtitle="How should the teacher tackle challenges?"
              helperText="You can select multiple traits" multiSelect
              options={[
                { id: 'analytical', title: 'Analytical', description: 'Data-driven and logical', icon: Brain },
                { id: 'creative', title: 'Creative', description: 'Innovative and imaginative', icon: Lightbulb },
                { id: 'practical', title: 'Practical', description: 'Hands-on and realistic', icon: Wrench },
                { id: 'innovative', title: 'Innovative', description: 'Forward-thinking and bold', icon: Rocket },
              ]}
              selectionKey="problemSolving" selections={selections} setSelection={setSelection}
              onBack={back}
              onNext={handleSave} />}

          </motion.div>
        </AnimatePresence>

        {/* Save loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-2xl px-6 py-4 shadow-xl" style={cardBg}>
              <Loader2 size={22} className="animate-spin text-purple-500" />
              <span className="text-sm font-semibold" style={labelColor}>Saving changes...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}