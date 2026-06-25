import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import {
  Zap, Database, CheckCircle, User, ClipboardList, Star, Users,
  MessageSquare, ArrowRight, GraduationCap, Target, Award, Shield,
  ChevronRight, Sparkles, Briefcase, MessageCircle, School, UserPlus,
} from 'lucide-react'

// ─── Star Canvas ──────────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let w = (c.width = c.offsetWidth)
    let h = (c.height = c.offsetHeight)
    const onResize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    window.addEventListener('resize', onResize)
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
      r: Math.random() * 1.6 + .3,
      a: Math.random() * .55 + .15,
      ph: Math.random() * Math.PI * 2,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.ph += .018
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0
        const a = s.a * (.55 + .45 * Math.sin(s.ph))
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3)
        g.addColorStop(0, `rgba(200,170,255,${a})`)
        g.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill()
      })
      for (let i = 0; i < stars.length; i++)
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(180,150,255,${.1 * (1 - d / 100)})`; ctx.lineWidth = .5; ctx.stroke()
          }
        }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [wi, setWi] = useState(0)
  const [ci, setCi] = useState(0)
  const [del, setDel] = useState(false)
  const [txt, setTxt] = useState('')
  useEffect(() => {
    const word = words[wi]
    const t = setTimeout(() => {
      if (!del) {
        setTxt(word.slice(0, ci + 1))
        if (ci + 1 === word.length) setTimeout(() => setDel(true), 1800)
        else setCi(c => c + 1)
      } else {
        setTxt(word.slice(0, ci - 1))
        if (ci - 1 === 0) { setDel(false); setWi(i => (i + 1) % words.length); setCi(0) }
        else setCi(c => c - 1)
      }
    }, del ? 40 : 88)
    return () => clearTimeout(t)
  }, [ci, del, wi, words])
  return (
    <span>
      <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{txt}</span>
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-violet-300">|</motion.span>
    </span>
  )
}

// ─── Counter ─────────────────────────────────────────────────────────────────
function Counter({ to, suffix = '', delay = 0 }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf
    const timer = setTimeout(() => {
      const duration = to >= 10000 ? 2000 : to >= 1000 ? 1600 : 1200
      let startTime = 0
      const step = (ts) => {
        if (!startTime) startTime = ts
        const p = Math.min((ts - startTime) / duration, 1)
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay + 200)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [to, delay])
  return <span>{n.toLocaleString()}{suffix}</span>
}

// ─── Tilt Card ────────────────────────────────────────────────────────────────
function TiltCard({ children, className }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 300, damping: 30 })
  const sry = useSpring(ry, { stiffness: 300, damping: 30 })
  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -18)
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 18)
  }
  return (
    <motion.div ref={ref} style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0) }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Flip Step Card ───────────────────────────────────────────────────────────
function StepCard({ step, index, accent }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, type: 'spring', bounce: 0.3 }}
      viewport={{ once: true }}
      className="relative h-52"
      style={{ perspective: 1000 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-shadow"
          style={{ backfaceVisibility: 'hidden', background: 'var(--surface-card)', border: '2px solid var(--border-default)' }}>
          <div className="flex items-center justify-between">
            <div className={`bg-gradient-to-br ${step.color} p-3 rounded-xl shadow-lg`}>
              <step.icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-2xl font-black bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>0{index + 1}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 mt-auto">
            <span>Hover to learn more</span><ChevronRight className="w-3 h-3" />
          </div>
        </div>
        {/* Back */}
        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl p-6 flex flex-col justify-center shadow-xl`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <step.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
          <p className="text-sm text-white/90 leading-relaxed">{step.detail}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const teacherSteps = [
  { icon: UserPlus, title: 'Create Account', description: 'Sign up as a teacher and build your identity in minutes.', color: 'from-purple-500 to-violet-600', detail: 'Fill in your details, choose your subjects, and set your availability. Your profile is the foundation of your perfect match.' },
  { icon: ClipboardList, title: 'Complete Assessment', description: 'Take our personality & competency assessment.', color: 'from-blue-500 to-cyan-600', detail: "Our 'Journey of the Impactful Teacher' assessment reveals your unique teaching style, core values, and professional strengths." },
  { icon: Star, title: 'Get Matched', description: 'Our AI finds your perfect school matches.', color: 'from-violet-500 to-purple-600', detail: 'Machine learning analyzes 50+ data points to surface schools whose culture, values, and needs align precisely with your profile.' },
  { icon: Briefcase, title: 'Apply to Jobs', description: 'Browse curated recommendations tailored to you.', color: 'from-emerald-500 to-green-600', detail: 'Every job recommendation is scored for fit. Apply with one click and track status in your personalized dashboard.' },
  { icon: Users, title: 'Connect & Interview', description: 'Chat directly and schedule interviews seamlessly.', color: 'from-indigo-500 to-blue-600', detail: 'Integrated messaging and video scheduling means you go from matched to interviewed without leaving the platform.' },
  { icon: MessageSquare, title: 'Get Hired', description: 'Receive offers and start your journey at the perfect school.', color: 'from-teal-500 to-emerald-600', detail: 'Negotiate terms, review offers side-by-side, and accept with one click. Your dream school awaits.' },
]

const schoolSteps = [
  { icon: School, title: 'Register School', description: "Create your school profile with culture & values.", color: 'from-blue-500 to-cyan-600', detail: "Build a rich profile showcasing your school's ethos, curriculum style, and what makes your institution unique to top educators." },
  { icon: ClipboardList, title: 'Define Requirements', description: 'Post jobs and specify ideal personality traits.', color: 'from-purple-500 to-violet-600', detail: 'Go beyond qualifications. Define the personality archetype, teaching philosophy, and competencies that thrive in your environment.' },
  { icon: Users, title: 'Browse Candidates', description: 'View pre-screened teachers ranked by fit.', color: 'from-violet-500 to-purple-600', detail: 'Every candidate is compatibility-scored. Filter by subject, experience, and personality type to find your ideal educator fast.' },
  { icon: MessageCircle, title: 'Interview Top Matches', description: 'Connect with truly aligned candidates.', color: 'from-emerald-500 to-green-600', detail: 'Our platform surfaces only the top matches — reducing interview-to-hire ratios and dramatically improving hiring accuracy.' },
  { icon: CheckCircle, title: 'Hire with Confidence', description: 'Data-driven decisions backed by real insights.', color: 'from-indigo-500 to-blue-600', detail: 'Detailed compatibility reports, assessment results, and behavioral insights give you full confidence before extending an offer.' },
  { icon: Star, title: 'Build Your Team', description: 'Grow a team of educators who share your vision.', color: 'from-teal-500 to-emerald-600', detail: 'Track team culture health over time. Our dashboard shows retention predictions and culture-fit trends across your whole staff.' },
]

const stats = [
  { icon: Award, label: 'Teachers Matched', value: 10000, suffix: '+', delay: 0 },
  { icon: Users, label: 'Jobs Posted', value: 25500, suffix: '+', delay: 150 },
  { icon: Shield, label: 'Partner Schools', value: 2900, suffix: '+', delay: 300 },
  { icon: Zap, label: 'Placement Success', value: 95, suffix: '%', delay: 450 },
]

const whyCards = [
  { icon: Zap, title: 'AI-Powered Matching', desc: '50+ data points analyzed per match. Our algorithm gets smarter with every placement.', color: 'from-yellow-400 to-orange-500', glow: 'rgba(251,191,36,.15)', value: 10000, suffix: '+', label: 'Matches Made' },
  { icon: Target, title: 'Personality Profiling', desc: 'We match beyond qualifications — on values, teaching philosophy, and cultural fit.', color: 'from-purple-500 to-violet-600', glow: 'rgba(147,51,234,.15)', value: 50, suffix: '+', label: 'Match Signals' },
  { icon: Shield, title: 'Verified Network', desc: 'Every school is vetted. Every teacher is verified. No fake listings, ever.', color: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,.15)', value: 3000, suffix: '+', label: 'Partner Schools' },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Welcome() {
  const [activeTab, setActiveTab] = useState('teachers')
  const steps = activeTab === 'teachers' ? teacherSteps : schoolSteps
  const tabAccent = activeTab === 'teachers' ? 'from-purple-600 to-blue-600' : 'from-blue-600 to-cyan-600'

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">

      {/* ══ DARK ZONE — Hero ══ */}
      <div className="relative" style={{ background: 'linear-gradient(160deg,#1e1b4b 0%,#4c1d95 55%,#7c3aed 100%)' }}>
        <StarCanvas />

        {/* Ambient blobs */}
        <motion.div className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(147,51,234,.25),transparent)' }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,.18),transparent)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

        {/* ── Hero ── */}
        <section className="relative py-28 overflow-hidden z-10">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 px-5 py-2 rounded-full mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <Target className="w-4 h-4 text-purple-300" />
              </motion.div>
              <span className="text-white/80 text-sm font-semibold">AI-Powered Teacher Matching</span>
            </motion.div>

            <motion.h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}>
              Ninja Teacher
              <br />
              <Typewriter words={['Matches Teachers!', 'Empowers Schools!', 'Changes Careers!', 'Works its Magic!']} />
            </motion.h1>

            <motion.p className="text-xl text-white/60 max-w-2xl mx-auto mt-6 leading-relaxed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
              We connect exceptional teachers with leading schools through data-driven personality matching — on a simple basis.
            </motion.p>

            <motion.div className="flex items-center justify-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-900/30 transition-all flex items-center gap-2">
                  Join Free <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/15 transition-all">
                  Explore Jobs
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
      {/* ══ END DARK ZONE ══ */}

      {/* ── Stats Strip ── */}
      <section className="bg-gradient-to-r from-[#2e1065] via-[#4c1d95] to-[#6d28d9] py-10 relative overflow-hidden">
        <motion.div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '28px 28px' }}
          animate={{ backgroundPosition: ['0px 0px', '28px 28px'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-5 h-5 text-purple-300" />
                </div>
                <div className="text-3xl font-black text-white"><Counter to={s.value} suffix={s.suffix} delay={s.delay} /></div>
                <p className="text-white/55 text-sm font-medium mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps Section ── */}
      <section className="py-20 relative z-10" style={{ background: 'var(--surface-page)' }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Tab Switcher */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }} className="flex justify-center mb-16">
            <div className="p-1.5 rounded-2xl flex gap-1" style={{ background: 'var(--surface-muted)' }}>
              {['teachers', 'schools'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="relative px-8 py-3 rounded-xl font-bold text-sm capitalize z-10 transition-colors duration-200"
                  style={{ color: activeTab === tab ? 'white' : 'var(--text-muted)' }}>
                  {activeTab === tab && (
                    <motion.div layoutId="tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg"
                      style={{ zIndex: -1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                  )}
                  <span className="flex items-center gap-2">
                    {tab === 'teachers' ? <GraduationCap className="w-4 h-4" /> : <School className="w-4 h-4" />}
                    For {tab === 'teachers' ? 'Teachers' : 'Schools'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                {activeTab === 'teachers' ? 'Your Journey to the Perfect School' : 'Find Teachers Who Fit Your Culture'}
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'teachers' ? 'Find teaching positions that truly match your personality and skills' : "Hire educators who align with your school's values and vision"}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab + '-cards'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {steps.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} accent={tabAccent} />
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }} viewport={{ once: true }} className="flex justify-center mt-14">
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register"
                className={`inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r ${tabAccent} text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-200 transition-all`}>
                {activeTab === 'teachers' ? 'Start as a Teacher' : 'Register Your School'}
                <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Section ── */}
      <section className="py-20 relative z-10" style={{ background: 'var(--surface-card)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-bold tracking-widest uppercase text-purple-600 mb-3">Why Ninja Teacher?</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>The numbers<br />speak for themselves</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>The smarter way to match educators with institutions</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {whyCards.map((f, i) => (
              <TiltCard key={i} className="cursor-pointer">
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }} viewport={{ once: true }}
                  className="rounded-3xl p-8 text-center h-full group hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                  style={{ background: 'var(--surface-page)', border: '1px solid var(--border-default)' }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                    style={{ background: `radial-gradient(circle at 50% 0%,${f.glow},transparent 70%)` }} />
                  <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}>
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}>
                      <f.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  <div className={`text-5xl font-black mb-1 bg-gradient-to-r ${f.color} bg-clip-text text-transparent relative z-10`}>
                    <Counter to={f.value} suffix={f.suffix} />
                  </div>
                  <p className={`text-sm font-semibold mb-4 bg-gradient-to-r ${f.color} bg-clip-text text-transparent relative z-10`}>{f.label}</p>
                  <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="leading-relaxed relative z-10" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 relative z-10" style={{ background: 'var(--surface-page)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }} viewport={{ once: true }}
            className="relative rounded-3xl p-14 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#7c3aed 100%)' }}>
            <motion.div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }}
              animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            {[
              { pos: 'top-8 left-8', size: 'w-24 h-24', d: 0 },
              { pos: 'bottom-8 right-8', size: 'w-32 h-32', d: 1 },
              { pos: 'top-1/2 right-16', size: 'w-16 h-16', d: 0.5 },
            ].map((o, i) => (
              <motion.div key={i} className={`absolute ${o.pos} ${o.size} bg-white/10 rounded-full blur-2xl`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: o.d }} />
            ))}
            <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
              className="relative z-10">
              <Sparkles className="w-14 h-14 text-yellow-300 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 relative z-10">Ready to Find Your Match?</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto relative z-10">
              Join <Counter to={10000} suffix="+" /> teachers and schools who found their perfect fit on Ninja Teacher.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="px-10 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:shadow-2xl transition-all block">
                  Join as Teacher →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-black text-lg hover:bg-white/20 transition-all block">
                  Register School →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}