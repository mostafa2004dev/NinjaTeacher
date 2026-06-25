import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenText, Scale, Shield, Sparkles, ArrowLeft, ArrowRight, Award,
  BriefcaseBusiness, CalendarDays, GraduationCap, HandCoins,
  MapPin, MessageSquareText, MoonStar, Zap, Smile, CircleUserRound, Heart,
  LocateFixed, UserRoundCheck, BadgeCheck, Brain, Lightbulb, Wrench, Rocket,
  CheckCircle2
} from 'lucide-react'
import { useWizardForm } from '../../context/WizardFormContext'

// ⚠️ عدّل المسار ده حسب مكان ملف الـ constants عندك فعليًا
import { GOVERNORATES, GOV_CITIES } from '../../data/schoolOptions'

// ── shared style tokens ───────────────────────────────────────────────────────
const pageBg = { background: 'var(--surface-page)' }
const cardBg = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' }
const headerBg = { background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)' }
const inputStyle = {
  background: 'var(--surface-input)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
}
const inputFocusCls = 'outline-none focus:border-[#155DFC]'
const labelColor = { color: 'var(--text-primary)' }
const subColor = { color: 'var(--text-muted)' }
const stepLabelColor = { color: 'var(--text-secondary)' }

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl"
      style={{
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: '#fff',
        minWidth: '260px',
      }}
    >
      <CheckCircle2 size={22} />
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-auto outline-none opacity-70 hover:opacity-100 text-white">✕</button>
    </motion.div>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ step, total, percent }) {
  return (
    <div className="mb-5 rounded-2xl p-4" style={cardBg}>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <span style={stepLabelColor}>Step {step} of {total}</span>
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
  )
}

// ── WizardHeader ──────────────────────────────────────────────────────────────
function WizardHeader({ onBack, backLabel = 'Back' }) {
  return (
    <header style={headerBg}>
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold cursor-pointer hover:text-[#9810FA] transition-colors"
          style={stepLabelColor} onClick={onBack}>
          <ArrowLeft size={16} /> {backLabel}
        </p>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-[#9810FA] to-[#155DFC] p-3 text-white">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl" style={labelColor}>Post a Teaching Position</h1>
            <p className="text-base" style={subColor}>Find the perfect teacher match for your school</p>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── FieldLabel ────────────────────────────────────────────────────────────────
function FieldLabel({ icon, label, required = false }) {
  return (
    <p className="mb-1 flex items-center gap-2 text-base font-semibold" style={labelColor}>
      <span style={{ color: '#9810FA' }}>{icon}</span>
      {label}
      {required ? <span className="text-[#FB2C36]">*</span> : null}
    </p>
  )
}

// ── Nav Buttons ───────────────────────────────────────────────────────────────
function NavButtons({ onBack, onNext, nextDisabled = false, nextLabel = 'Next' }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <Button
        variant="flat"
        onPress={onBack}
        className="h-12 min-w-[120px] rounded-xl px-6 text-base font-semibold"
        style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
        startContent={<ArrowLeft size={16} />}
      >
        Back
      </Button>
      <Button
        isDisabled={nextDisabled}
        onPress={onNext}
        className={`h-12 min-w-[120px] rounded-xl px-6 text-base font-semibold transition-all ${!nextDisabled
          ? 'bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white shadow-lg'
          : 'text-[#99A1AF]'
          }`}
        style={nextDisabled ? { background: 'var(--surface-muted)' } : {}}
        endContent={<ArrowRight size={16} />}
      >
        {nextLabel}
      </Button>
    </div>
  )
}

// ── TraitSelection ────────────────────────────────────────────────────────────
function TraitSelection({ step, percent, title, subtitle, helperText, options, selectionKey, multiSelect = false, onBack, onNext }) {
  const { selections, setSelection } = useWizardForm()
  const current = selections[selectionKey] || []
  const MotionButton = motion.button

  const handleSelect = (id) => {
    if (multiSelect) {
      setSelection(selectionKey, current.includes(id) ? current.filter(i => i !== id) : [...current, id])
    } else {
      setSelection(selectionKey, [id])
    }
  }

  return (
    <div className="min-h-screen" style={pageBg}>
      <WizardHeader onBack={onBack} />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-5">
        <ProgressBar step={step} total={7} percent={percent} />

        <section className="rounded-2xl p-6 shadow-sm" style={cardBg}>
          <h2 className="text-3xl font-bold" style={labelColor}>{title}</h2>
          <p className="mb-2 text-base" style={subColor}>{subtitle}</p>
          {helperText && <p className="mb-5 text-sm font-medium" style={{ color: '#9810FA' }}>{helperText}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {options.map((opt) => {
              const isSelected = current.includes(opt.id)
              return (
                <MotionButton
                  key={opt.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(opt.id)}
                  className="p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left w-full"
                  style={{
                    background: isSelected ? 'rgba(152,16,250,0.06)' : 'var(--surface-card)',
                    borderColor: isSelected ? '#9810FA' : 'var(--border-default)',
                    boxShadow: isSelected ? '0 4px 16px rgba(152,16,250,0.12)' : 'none',
                  }}
                >
                  <div className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg,#9810FA,#155DFC)' : 'var(--surface-muted)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                    }}>
                    <opt.icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base" style={labelColor}>{opt.title}</h4>
                    <p className="text-sm" style={subColor}>{opt.description}</p>
                  </div>
                </MotionButton>
              )
            })}
          </div>

          <NavButtons onBack={onBack} onNext={onNext} nextDisabled={current.length === 0} />
        </section>
      </main>
    </div>
  )
}

// ── Step 1: Job Details ───────────────────────────────────────────────────────
function StepJobDetails({ onNext, onBack }) {
  const { jobDetails, setJobField } = useWizardForm()
  const subjects = useMemo(() => [
    'Mathematics', 'Science', 'English', 'Arabic', 'Physics', 'Chemistry',
    'Biology', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
  ], [])
  const MotionButton = motion.button

  // ── Governorate / City (مستخرجين من jobDetails.location لو فيها قيمة محفوظة قبل كده) ──
  const [governorate, city] = useMemo(() => {
    const loc = jobDetails.location || ''
    const [gov, c] = loc.split(',').map(s => s.trim())
    return [GOVERNORATES.includes(gov) ? gov : '', c || '']
  }, [jobDetails.location])

  const availableCities = governorate ? (GOV_CITIES[governorate] || []) : []

  const handleGovernorateChange = (gov) => {
    // كل ما نغير المحافظة، لازم نصفر المدينة لأنها بتتفلتر حسب المحافظة الجديدة
    setJobField('location', gov)
  }

  const handleCityChange = (ct) => {
    setJobField('location', ct ? `${governorate}, ${ct}` : governorate)
  }

  const isFormValid =
    jobDetails.location?.trim() !== '' &&
    jobDetails.positionTitle?.trim() !== '' &&
    jobDetails.subjects?.length > 0 &&
    jobDetails.required_stage?.trim() !== '' &&
    jobDetails.requiredExperience?.trim() !== '' &&
    jobDetails.salaryRange?.trim() !== ''

  const toggleSubject = (subject) => {
    const next = jobDetails.subjects?.includes(subject)
      ? jobDetails.subjects.filter(i => i !== subject)
      : [...(jobDetails.subjects || []), subject]
    setJobField('subjects', next)
  }

  const sharedInput = `w-full rounded-xl px-3 py-3 text-sm ${inputFocusCls}`
  const sharedSelect = "w-full rounded-xl px-3 py-3 text-sm outline-none focus:border-[#155DFC]"

  return (
    <div className="min-h-screen" style={pageBg}>
      <WizardHeader onBack={onBack} backLabel="Back to Dashboard" />

      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-5">
        <ProgressBar step={1} total={7} percent={13} />

        <section className="rounded-2xl p-4 shadow-sm md:p-5" style={cardBg}>
          <h2 className="text-3xl font-bold" style={labelColor}>Job Details</h2>
          <p className="mb-5 text-base" style={subColor}>Let's start with the basic information about the position</p>

          <div className="space-y-4">
            {/* School Name اتشال من هنا — الاسم بييجي تلقائي من حساب المدرسة في الباك، مش محتاج اليوزر يكتبه */}

            <FieldLabel icon={<MapPin size={16} />} label="Governorate" required />
            <select
              value={governorate}
              onChange={e => handleGovernorateChange(e.target.value)}
              className={sharedSelect}
              style={inputStyle}
            >
              <option value="">Select governorate</option>
              {GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>

            {governorate && availableCities.length > 0 && (
              <>
                <FieldLabel icon={<MapPin size={16} />} label="City" />
                <select
                  value={city}
                  onChange={e => handleCityChange(e.target.value)}
                  className={sharedSelect}
                  style={inputStyle}
                >
                  <option value="">Select city (optional)</option>
                  {availableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </>
            )}

            <FieldLabel icon={<GraduationCap size={16} />} label="Position Title" required />
            <input value={jobDetails.positionTitle} onChange={e => setJobField('positionTitle', e.target.value)}
              placeholder="e.g., High School Math Teacher" className={sharedInput} style={inputStyle} />

            <FieldLabel icon={<BookOpenText size={16} />} label="Subjects" required />
            <div className="flex flex-wrap gap-2.5">
              {subjects.map((subject) => {
                const selected = jobDetails?.subjects?.includes(subject)
                return (
                  <MotionButton
                    key={subject}
                    type="button"
                    whileHover={{ y: -2, x: 1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleSubject(subject)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-left transition sm:text-base"
                    style={{
                      background: selected ? 'linear-gradient(135deg,#9810FA,#155DFC)' : 'var(--surface-muted)',
                      color: selected ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {subject}
                  </MotionButton>
                )
              })}
            </div>

            <FieldLabel icon={<GraduationCap size={16} />} label="Required Stage" required />
            <select value={jobDetails.required_stage} onChange={e => setJobField('required_stage', e.target.value)}
              className="w-full rounded-xl border-2 border-[#9810FA] px-4 py-3 text-base outline-none focus:border-[#155DFC] md:text-lg"
              style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}>
              <option value="">Select teaching stage</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="Primary School">Primary School</option>
              <option value="Middle School">Middle School</option>
              <option value="High School">High School</option>
            </select>

            <FieldLabel icon={<Award size={16} />} label="Required Experience" required />
            <select value={jobDetails.requiredExperience} onChange={e => setJobField('requiredExperience', e.target.value)}
              className="w-full rounded-xl border-2 border-[#9810FA] px-4 py-3 text-base outline-none focus:border-[#155DFC] md:text-lg"
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
        </section>

        <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isFormValid} />
      </main>
    </div>
  )
}

// ── Step 7: Report ────────────────────────────────────────────────────────────
const labelMaps = {
  teachingStyle: { strict: 'Strict', flexible: 'Flexible', structured: 'Structured', 'free-flowing': 'Free-flowing' },
  classroomEnergy: { calm: 'Calm', energetic: 'Energetic', balanced: 'Balanced', playful: 'Playful' },
  leadershipStyle: { leader: 'Leader', supporter: 'Supporter', collaborator: 'Collaborator', mentor: 'Mentor' },
  communicationStyle: { direct: 'Direct', empathetic: 'Empathetic', formal: 'Formal', casual: 'Casual' },
  problemSolving: { analytical: 'Analytical', creative: 'Creative', practical: 'Practical', innovative: 'Innovative' },
}

function DetailItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold" style={subColor}>{label}</p>
      <p className="font-medium" style={labelColor}>{value || '-'}</p>
    </div>
  )
}

function TagRow({ title, values }) {
  return (
    <div className="rounded-xl p-4" style={cardBg}>
      <p className="mb-2 text-sm font-semibold" style={labelColor}>{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.length > 0 ? values.map(v => (
          <span key={v} className="rounded-full bg-gradient-to-r from-[#9810FA] to-[#155DFC] px-3 py-1 text-xs font-semibold text-white">{v}</span>
        )) : <span className="text-sm" style={subColor}>No data selected</span>}
      </div>
    </div>
  )
}

function StepReport({ onBack, onPublish, isLoading }) {
  const { jobDetails, selections } = useWizardForm()
  const navigate = useNavigate()
  const getLabels = (key) => (selections[key] ?? []).map(i => labelMaps[key]?.[i] ?? i)

  return (
    <div className="min-h-screen" style={pageBg}>
      <WizardHeader onBack={() => navigate('/SchoolDashpord')} backLabel="Back to Dashboard" />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
        <ProgressBar step={7} total={7} percent={100} />

        <section className="rounded-2xl p-5 shadow-sm md:p-6" style={cardBg}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-2xl font-bold md:text-4xl" style={labelColor}>Review Your Job Posting</h2>
            <p className="text-sm md:text-base" style={subColor}>Please review all details before publishing</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="mb-3 text-lg font-bold" style={labelColor}>Job Details</h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2" style={subColor}>
                <DetailItem label="Position" value={jobDetails.positionTitle} />
                <DetailItem label="Location" value={jobDetails.location} />
                <DetailItem label="Required Stage" value={jobDetails.required_stage} />
                <DetailItem label="Salary Range" value={jobDetails.salaryRange} />
                <DetailItem label="Experience Required" value={jobDetails.requiredExperience} />
                <DetailItem label="Start Date" value={jobDetails.startDate} />
              </div>
              <div className="mt-3 text-sm" style={subColor}>
                <p className="font-semibold" style={labelColor}>Subjects</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(jobDetails.subjects || []).map(s => (
                    <span key={s} className="rounded-full bg-gradient-to-r from-[#9810FA] to-[#155DFC] px-3 py-1 text-xs font-semibold text-white">{s}</span>
                  ))}
                </div>
              </div>
              <DetailItem label="Qualifications" value={jobDetails.qualifications} className="mt-3" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold" style={labelColor}>Ideal Teacher Personality</h3>
              <TagRow title="Teaching Style" values={getLabels('teachingStyle')} />
              <TagRow title="Classroom Energy" values={getLabels('classroomEnergy')} />
              <TagRow title="Leadership Style" values={getLabels('leadershipStyle')} />
              <TagRow title="Communication Style" values={getLabels('communicationStyle')} />
              <TagRow title="Problem-Solving Approach" values={getLabels('problemSolving')} />
            </div>
          </div>
        </section>

        {/* 🆕 المعلمون المطابقون عبر الـ AI — يظهر بعد ما المدرسة تخلّص الأسئلة */}
       

        <div className="mt-5 flex items-center justify-between">
          <Button variant="flat" onPress={onBack}
            className="h-11 min-w-[110px] rounded-xl px-5 text-sm font-semibold shadow"
            style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)' }}
            startContent={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Button
            onPress={onPublish}
            isLoading={isLoading}
            className="h-11 min-w-[140px] rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600 transition-all"
          >
            {isLoading ? 'Publishing...' : 'Publish Job'}
          </Button>
        </div>
      </main>
    </div>
  )
}

// ── Main Wizard Controller ────────────────────────────────────────────────────
const API_URL = "http://localhost:3000/job-posts"

async function submitSurveyToBackend(data) {
  const token = localStorage.getItem("userToken")

  const payload = {
    jobDetails: data.jobDetails,
    personality: {
      teachingStyle: data.selections.teachingStyle || [],
      classroomEnergy: data.selections.classroomEnergy || [],
      leadershipStyle: data.selections.leadershipStyle || [],
      communicationStyle: data.selections.communicationStyle || [],
      problemSolving: data.selections.problemSolving || [],
    },
    submittedAt: new Date().toISOString(),
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Server error: ${response.status}`)
  }

  return response.json()
}

export default function WizardPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { jobDetails, selections } = useWizardForm()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      await submitSurveyToBackend({ jobDetails, selections })
      showToast('Job posted successfully! Redirecting to dashboard...')
      setTimeout(() => navigate('/SchoolDashpord'), 2000)
    } catch (error) {
      showToast(error.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const steps = [
    <StepJobDetails onNext={next} onBack={() => navigate('/SchoolDashpord')} />,

    <TraitSelection step={2} percent={25} title="Teaching Style"
      subtitle="How should the teacher approach classroom management?"
      options={[
        { id: 'strict', title: 'Strict', description: 'Firm rules and high expectations', icon: Shield },
        { id: 'flexible', title: 'Flexible', description: 'Adaptable and open to change', icon: Scale },
        { id: 'structured', title: 'Structured', description: 'Organized with clear routines', icon: BookOpenText },
        { id: 'free-flowing', title: 'Free-flowing', description: 'Spontaneous and creative approach', icon: Sparkles },
      ]}
      selectionKey="teachingStyle" onBack={back} onNext={next} />,

    <TraitSelection step={3} percent={38} title="Classroom Energy"
      subtitle="What energy level works best for your students?"
      options={[
        { id: 'calm', title: 'Calm', description: 'Peaceful and composed atmosphere', icon: MoonStar },
        { id: 'energetic', title: 'Energetic', description: 'High-energy and dynamic', icon: Zap },
        { id: 'balanced', title: 'Balanced', description: 'Mix of calm and energetic', icon: Scale },
        { id: 'playful', title: 'Playful', description: 'Fun and engaging environment', icon: Smile },
      ]}
      selectionKey="classroomEnergy" onBack={back} onNext={next} />,

    <TraitSelection step={4} percent={50} title="Leadership Style"
      subtitle="How should the teacher lead and interact with students?"
      helperText="You can select multiple traits" multiSelect
      options={[
        { id: 'leader', title: 'Leader', description: 'Takes charge and guides decisively', icon: LocateFixed },
        { id: 'supporter', title: 'Supporter', description: 'Nurtures and encourages growth', icon: Heart },
        { id: 'collaborator', title: 'Collaborator', description: 'Works together as a team', icon: CircleUserRound },
        { id: 'mentor', title: 'Mentor', description: 'Guides through experience', icon: UserRoundCheck },
      ]}
      selectionKey="leadershipStyle" onBack={back} onNext={next} />,

    <TraitSelection step={5} percent={63} title="Communication Style"
      subtitle="How should the teacher communicate with students?"
      options={[
        { id: 'direct', title: 'Direct', description: 'Clear and straightforward', icon: LocateFixed },
        { id: 'empathetic', title: 'Empathetic', description: 'Understanding and compassionate', icon: Heart },
        { id: 'formal', title: 'Formal', description: 'Professional and respectful', icon: BadgeCheck },
        { id: 'casual', title: 'Casual', description: 'Friendly and approachable', icon: Smile },
      ]}
      selectionKey="communicationStyle" onBack={back} onNext={next} />,

    <TraitSelection step={6} percent={75} title="Problem-Solving Approach"
      subtitle="How should the teacher tackle challenges?"
      helperText="You can select multiple traits" multiSelect
      options={[
        { id: 'analytical', title: 'Analytical', description: 'Data-driven and logical', icon: Brain },
        { id: 'creative', title: 'Creative', description: 'Innovative and imaginative', icon: Lightbulb },
        { id: 'practical', title: 'Practical', description: 'Hands-on and realistic', icon: Wrench },
        { id: 'innovative', title: 'Innovative', description: 'Forward-thinking and bold', icon: Rocket },
      ]}
      selectionKey="problemSolving" onBack={back} onNext={next} />,

    <StepReport onBack={back} onPublish={handlePublish} isLoading={isLoading} />,
  ]

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {steps[step - 1]}
        </motion.div>
      </AnimatePresence>
    </>
  )
}