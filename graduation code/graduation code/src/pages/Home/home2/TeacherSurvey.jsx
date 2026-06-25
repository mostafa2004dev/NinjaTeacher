import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion"; import {
  Heart,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  Target,
  Trophy,
  Award,
  Sparkles,
  Brain,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
} from "lucide-react";

// ─── API URL ───────────────────────────────────────────────────────────────────
const API_URL = "http://localhost:3000/survey/submit";
async function submitSurveyToBackend(answers) {
 const token = localStorage.getItem("userToken"); // ← غير من "token" لـ "userToken"

  const payload = {
    answers: Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer,
    })),
    submittedAt: new Date().toISOString(),
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  // ← ده اللي ناقص
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}
// ─── Questions ─────────────────────────────────────────────────────────────────
export const questions = [
  // ── Step 1: Classroom Management ──────────────────────────
  {
    id: 1,
    step: 1,
    stepTitle: "Classroom Management",
    text: "How do you handle a disruptive student?",
    options: [
      "Calm them down and explain classroom rules",
      "Ignore the situation",
      "Talk to them individually and understand them",
      "Punish them immediately",
    ],
  },
  {
    id: 2,
    step: 1,
    stepTitle: "Classroom Management",
    text: "How do you help a slow learner understand the required topic?",
    options: [
      "Adjust my teaching method to suit the student's level",
      "Use simplified examples sometimes",
      "Explain in the same way",
    ],
  },
  {
    id: 3,
    step: 1,
    stepTitle: "Classroom Management",
    text: "How do you get uninterested students to participate actively?",
    options: [
      "Use encouragement methods and incentives",
      "Design engaging activities to motivate everyone",
      "Forcefully ask them to participate",
    ],
  },
  {
    id: 4,
    step: 1,
    stepTitle: "Classroom Management",
    text: "How do you deal with a parent who objects to their child's grades?",
    options: [
      "Calmly explain the grading system",
      "Ask to speak later outside the classroom",
      "Apply the policy directly",
    ],
  },
  {
    id: 5,
    step: 1,
    stepTitle: "Classroom Management",
    text: "You noticed a student whose level is declining and has become withdrawn — what do you do?",
    options: [
      "Talk to them to understand the reason and support them",
      "Contact parents directly",
      "Adjust my approach to meet their needs",
    ],
  },

  // ── Step 2: Professional Skills ───────────────────────────
  {
    id: 6,
    step: 2,
    stepTitle: "Professional Skills",
    text: "You disagreed with a colleague teacher or administration about a teaching method — what do you do?",
    options: [
      "Present my point of view calmly",
      "Look for a middle ground",
      "Comply with the policy to avoid conflict",
    ],
  },
  {
    id: 7,
    step: 2,
    stepTitle: "Professional Skills",
    text: "How do you evaluate student interaction in class? Do you think class density affects your teaching quality?",
    options: [
      "Interaction is weak and density strongly affects it",
      "Interaction is average and density sometimes affects it",
      "Interaction is good and density somewhat affects it",
      "Interaction is very good and density doesn't affect it",
      "Interaction is excellent and density doesn't affect my teaching quality",
    ],
  },
  {
    id: 8,
    step: 2,
    stepTitle: "Professional Skills",
    text: "Write a new skill you recently learned and how you applied it?",
    options: [
      "I haven't learned a new skill recently",
      "I learned a simple skill but haven't applied it yet",
      "I learned a skill and started applying it occasionally",
      "I learned a skill and apply it consistently in class",
    ],
  },
  {
    id: 9,
    step: 2,
    stepTitle: "Professional Skills",
    text: "How do you handle a top student who finishes assignments faster than classmates to avoid boredom?",
    options: [
      "Ask them to stay quiet until classmates finish",
      "Have them help weaker classmates",
      "Give them additional questions and challenges",
      "Nothing specific",
    ],
  },
  {
    id: 10,
    step: 2,
    stepTitle: "Professional Skills",
    text: "Do you feel the financial compensation and allowances provided by the school match the effort and tasks required of you?",
    options: [
      "Strongly agree",
      "Agree",
      "Neutral",
      "Disagree",
      "Strongly disagree",
    ],
  },

  // ── Step 3: AI & Technology ───────────────────────────────
  {
    id: 11,
    step: 3,
    stepTitle: "AI & Technology",
    text: "Do you use technology in your teaching?",
    options: [
      "I don't use it",
      "I use it a little",
      "Sometimes",
      "Effectively",
      "Always and skillfully",
    ],
  },
  {
    id: 12,
    step: 3,
    stepTitle: "AI & Technology",
    text: "If you discover a student used AI to complete an entire assignment, what do you do?",
    options: [
      "Reject the assignment immediately and give a zero",
      "Ask them to redo it under my supervision in class",
      "Discuss the written content with them to verify understanding",
      "Encourage them to use it as a support tool while clarifying sources",
    ],
  },
  {
    id: 13,
    step: 3,
    stepTitle: "AI & Technology",
    text: "How do you integrate AI tools (like Gemini or ChatGPT) into your work?",
    options: [
      "I don't use them and prefer traditional methods entirely",
      "I use them only to save time in preparation and writing tests",
      "I use them in class to create interactive activities with students",
      "I train students on how to correctly write prompts for research",
    ],
  },
  {
    id: 14,
    step: 3,
    stepTitle: "AI & Technology",
    text: "When using a new AI-based educational app, what is your first concern?",
    options: [
      "Ease of use and the app's interface",
      "Whether the app is free or paid",
      "Student data safety and privacy on the app",
      "Whether it will save me effort in grading or not",
    ],
  },
];

// ─── Welcome Page ──────────────────────────────────────────────────────────────
export function WelcomePage({ onStart }) {
  const steps = [
    { number: 1, title: "Classroom Management", count: questions.filter((q) => q.step === 1).length },
    { number: 2, title: "Professional Skills", count: questions.filter((q) => q.step === 2).length },
    { number: 3, title: "AI & Technology", count: questions.filter((q) => q.step === 3).length },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-300 via-violet-300 to-fuchsia-300 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-violet-300 to-purple-300 rounded-full opacity-10 blur-3xl"
        />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
          />
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-gray-100 bg-white/70 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="bg-gradient-to-br from-purple-600 to-violet-600 p-2 rounded-xl shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl text-gray-900" style={{ fontWeight: 800 }}>Ninja Teacher</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center">

          {/* Central Visual */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
            className="inline-block mb-12 relative"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 -m-12">
              <div className="w-full h-full border-4 border-dashed border-purple-300 rounded-full opacity-30" />
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 -m-8">
              <div className="w-full h-full border-4 border-dotted border-violet-300 rounded-full opacity-40" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-purple-400 via-violet-400 to-fuchsia-400 rounded-full blur-3xl"
            />
            <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 p-12 rounded-full shadow-2xl">
              <motion.div animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.05, 1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <Award className="w-28 h-28 text-white" />
              </motion.div>
            </div>
            {[
              { icon: Heart, color: "from-pink-500 to-rose-500" },
              { icon: Brain, color: "from-blue-500 to-indigo-500" },
              { icon: Lightbulb, color: "from-amber-500 to-orange-500" },
              { icon: Sparkles, color: "from-emerald-500 to-teal-500" },
            ].map((item, idx) => (
              <motion.div key={idx} animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute inset-0" style={{ transformOrigin: "center" }}>
                <motion.div
                  animate={{ y: [0, -8, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                  style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(${-360}deg) translateY(-120px)` }}
                  className={`bg-gradient-to-br ${item.color} p-4 rounded-xl shadow-xl`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="mb-8">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200 rounded-full shadow-sm">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </motion.div>
              <span className="text-purple-700 text-sm uppercase tracking-wider" style={{ fontWeight: 700 }}>Professional Teacher Assessment</span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-5xl md:text-7xl text-gray-900 mb-6 leading-tight" style={{ fontWeight: 900 }}>
            Discover Your
            <br />
            <motion.span
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% auto" }}
            >
              Teaching Superpower
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed" style={{ fontWeight: 500 }}>
            Complete our interactive assessment to unlock your unique teaching persona and stand out to Egypt's top schools.
          </motion.p>

          {/* Steps Preview */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                  <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-violet-600 text-white text-xs rounded-full flex items-center justify-center" style={{ fontWeight: 700 }}>
                    {step.number}
                  </span>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>{step.title}</span>
                  <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{step.count}Q</span>
                </motion.div>
                {idx < steps.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white rounded-2xl text-xl shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-4 mx-auto overflow-hidden"
            style={{ fontWeight: 800 }}
          >
            <motion.div animate={{ x: ["-200%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-6 h-6 relative z-10" />
            </motion.div>
            <span className="relative z-10">Start Assessment Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
          </motion.button>

          {/* Features Grid */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            {[
              { icon: Target, title: "Interactive Journey", desc: "Engaging real-world teaching scenarios", color: "from-blue-500 to-indigo-500" },
              { icon: Trophy, title: "Professional Badge", desc: "Earn verified teaching certification", color: "from-purple-500 to-violet-500" },
              { icon: Star, title: "Teaching Persona", desc: "Unlock your unique educator identity", color: "from-amber-500 to-orange-500" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.15, type: "spring" }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-hidden"
              >
                <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <motion.div whileHover={{ rotate: [0, -15, 15, 0], scale: 1.1 }} transition={{ duration: 0.6 }} className={`inline-flex p-5 bg-gradient-to-br ${feature.color} rounded-2xl mb-5 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontWeight: 500 }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Survey Page ───────────────────────────────────────────────────────────────
function SurveyPage({ onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const q = questions[current];
  const total = questions.length;
  const progress = (current / total) * 100;
  const answered = answers[q.id] !== undefined;
  const allAnswered = Object.keys(answers).length === total;

  const go = (dir) => { setDirection(dir); setCurrent((c) => c + dir); };
  const handleSelect = (option) => setAnswers((prev) => ({ ...prev, [q.id]: option }));
  const handleSubmit = () => {
    if (!allAnswered) { alert("Please answer all questions 😅"); return; }
    onSubmit(answers);
  };

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: ({ opacity: 1, x: 0 }),
    exit: (d) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  // Group questions by step for the step indicator
  const stepGroups = [
    { step: 1, title: "Classroom Management", ids: questions.filter(q => q.step === 1).map(q => q.id) },
    { step: 2, title: "Professional Skills", ids: questions.filter(q => q.step === 2).map(q => q.id) },
    { step: 3, title: "AI & Technology", ids: questions.filter(q => q.step === 3).map(q => q.id) },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 80, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-br from-purple-300 via-violet-300 to-fuchsia-300 rounded-full opacity-20 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -80, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 rounded-full opacity-20 blur-3xl" />
        {[...Array(12)].map((_, i) => (
          <motion.div key={i} initial={{ x: Math.random() * 1200, y: Math.random() * 800 }} animate={{ x: Math.random() * 1200, y: Math.random() * 800 }} transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, repeatType: "reverse" }} className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20" />
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-gray-100 bg-white/70 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-2 rounded-xl shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-gray-900" style={{ fontWeight: 800 }}>Ninja Teacher</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full">
            <ClipboardList className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-700">{current + 1} / {total}</span>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm px-6 pt-4 pb-2 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 flex-wrap mb-3">
          {stepGroups.map((group, idx) => {
            const isActive = q.step === group.step;
            const isDone = q.step > group.step;
            return (
              <div key={group.step} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${isActive ? "bg-purple-600 text-white shadow-md" : isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 700 }}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${isActive ? "bg-white/30" : isDone ? "bg-green-200" : "bg-gray-200"}`}>
                    {isDone ? "✓" : group.step}
                  </span>
                  {group.title}
                </div>
                {idx < stepGroups.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-full" />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400 font-medium">Start</span>
            <span className="text-xs font-bold text-purple-600">{Math.round(progress)}% Complete</span>
            <span className="text-xs text-gray-400 font-medium">Finish</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200 rounded-full shadow-sm">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </motion.div>
            <span className="text-purple-700 text-sm uppercase tracking-wider font-bold">
              {q.stepTitle}
            </span>
          </div>
        </motion.div>

        {/* Question Card */}
        <div className="relative overflow-hidden" style={{ minHeight: 400 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={q.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeInOut" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white text-lg font-black flex-shrink-0">
                  {q.id}
                </div>
                <h2 className="text-2xl md:text-3xl text-gray-900 leading-snug font-bold">{q.text}</h2>
              </div>

              <div className="flex flex-col gap-3">
                {q.options.map((option, idx) => {
                  const selected = answers[q.id] === option;
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option)}
                      className={`relative w-full text-left px-6 py-4 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${selected ? "border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 shadow-lg shadow-purple-200" : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"}`}
                    >
                      {selected && <motion.div layoutId="selected-bg" className="absolute inset-0 bg-gradient-to-r from-purple-100/60 to-violet-100/60 rounded-2xl" />}
                      <div className="relative flex items-center gap-4">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-purple-500 bg-purple-500" : "border-gray-300"}`}>
                          {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-base leading-relaxed ${selected ? "text-purple-800 font-semibold" : "text-gray-700 font-medium"}`}>{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => go(-1)} disabled={current === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-base transition-all ${current === 0 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-purple-200 text-purple-700 hover:bg-purple-50"}`}
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </motion.button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => (
              <motion.div
                key={idx}
                animate={{ width: idx === current ? 24 : 8, backgroundColor: answers[questions[idx].id] ? "#7c3aed" : idx === current ? "#a78bfa" : "#e5e7eb" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {current < total - 1 ? (
            <motion.button
              whileHover={{ scale: answered ? 1.05 : 1 }} whileTap={{ scale: answered ? 0.95 : 1 }}
              onClick={() => answered && go(1)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base overflow-hidden transition-all ${answered ? "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {answered && <motion.div animate={{ x: ["-200%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />}
              <span className="relative z-10">Next</span>
              <ChevronRight className="w-5 h-5 relative z-10" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: allAnswered ? 1.05 : 1, y: allAnswered ? -2 : 0 }} whileTap={{ scale: allAnswered ? 0.97 : 1 }}
              onClick={handleSubmit}
              className={`relative flex items-center gap-2 px-8 py-3 rounded-xl font-black text-base overflow-hidden transition-all ${allAnswered ? "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/40" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {allAnswered && <motion.div animate={{ x: ["-200%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />}
              <span className="relative z-10">Submit Results</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ onCompleteProfile, onBrowseJobs }) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div key={i} initial={{ y: -100, x: Math.random() * 1200, opacity: 0 }} animate={{ y: 1100, opacity: [0, 0.8, 0.8, 0], rotate: [0, 360] }} transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 3, repeat: Infinity }} className="absolute w-2 h-2 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full" />
        ))}
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200 to-violet-200 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full blur-3xl" />
      </div>

      <div className="border-b border-gray-100 bg-white/70 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-2 rounded-xl shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-gray-900 font-black">Ninja Teacher</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-28 relative z-10 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }} className="inline-block mb-12 relative">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: [1, 2.2, 2.2], opacity: [0.4, 0.15, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }} className="absolute inset-0 border-4 border-green-400 rounded-full" />
            ))}
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-br from-green-300 via-emerald-300 to-teal-300 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-16 rounded-full shadow-2xl">
              <motion.div animate={{ scale: [1, 1.08, 1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <CheckCircle2 className="w-32 h-32 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
            <h1 className="text-5xl md:text-6xl text-gray-900 mb-6 leading-tight font-black">Thank You!</h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              You've successfully completed the assessment. Your answers will be analyzed to help us better understand your teaching style.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={onCompleteProfile}
              className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white rounded-2xl text-xl shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-3 overflow-hidden font-black"
            >
              <motion.div animate={{ x: ["-200%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              <span className="relative z-10">Complete Your Profile</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={onBrowseJobs}
              className="px-12 py-6 bg-white border-2 border-purple-600 hover:bg-purple-50 text-purple-700 rounded-2xl text-xl transition-all flex items-center gap-3 shadow-lg font-black"
            >
              Browse Jobs
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function TeacherApp() {
  const navigate = useNavigate();
  const [page, setPage] = useState("welcome"); // "welcome" | "survey" | "loading" | "results" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if this teacher already submitted the survey (checked against DB)
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    fetch("http://localhost:3000/survey/answers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.submitted_at) {
          navigate("/TeacherPortal", { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (answers) => {
    setPage("loading");
    try {
      await submitSurveyToBackend(answers);
      setPage("results");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong, please try again");
      setPage("error");
    }
  };

  return (
    <AnimatePresence mode="wait">

      {/* Welcome */}
      {page === "welcome" && (
        <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }}>
          <WelcomePage onStart={() => setPage("survey")} />
        </motion.div>
      )}

      {/* Survey */}
      {page === "survey" && (
        <motion.div key="survey" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }}>
          <SurveyPage onSubmit={handleSubmit} />
        </motion.div>
      )}

      {/* Loading */}
      {page === "loading" && (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600" />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30" />
          </div>
          <p className="text-xl font-bold text-gray-700">Submitting your answers...</p>
        </motion.div>
      )}

      {/* Error */}
      {page === "error" && (
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-black text-gray-900">An error occurred</h2>
          <p className="text-gray-500 font-medium">{errorMsg}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => setPage("survey")} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl font-black text-lg shadow-lg">
            Try Again
          </motion.button>
        </motion.div>
      )}

      {/* Results */}
      {page === "results" && (
        <motion.div key="results" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <ResultsPage
            onCompleteProfile={() => navigate("/TeacherProfile")}
            onBrowseJobs={() => navigate("/browse-jobs")}
          />
        </motion.div>
      )}

    </AnimatePresence>
  );
}