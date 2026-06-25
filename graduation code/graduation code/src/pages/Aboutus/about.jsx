import { Link } from "react-router";
import { motion } from "framer-motion"; import { useRef, useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Target,
  Heart,
  Brain,
  Zap,
  CheckCircle,
  Star,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

// ─── Star Canvas ──────────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = (c.width = c.offsetWidth);
    let h = (c.height = c.offsetHeight);
    const onResize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    window.addEventListener("resize", onResize);
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
      r: Math.random() * 1.6 + .3,
      a: Math.random() * .55 + .15,
      ph: Math.random() * Math.PI * 2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.ph += .018;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
        const a = s.a * (.55 + .45 * Math.sin(s.ph));
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        g.addColorStop(0, `rgba(200,170,255,${a})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      });
      for (let i = 0; i < stars.length; i++)
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(180,150,255,${.1 * (1 - d / 100)})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [txt, setTxt] = useState("");
  useEffect(() => {
    const word = words[wi];
    const t = setTimeout(() => {
      if (!del) {
        setTxt(word.slice(0, ci + 1));
        if (ci + 1 === word.length) setTimeout(() => setDel(true), 1800);
        else setCi(c => c + 1);
      } else {
        setTxt(word.slice(0, ci - 1));
        if (ci - 1 === 0) { setDel(false); setWi(i => (i + 1) % words.length); setCi(0); }
        else setCi(c => c - 1);
      }
    }, del ? 40 : 88);
    return () => clearTimeout(t);
  }, [ci, del, wi, words]);
  return (
    <span>
      <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{txt}</span>
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-violet-300">|</motion.span>
    </span>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">


      <div className="relative" style={{ background: "linear-gradient(160deg,#1e1b4b 0%,#4c1d95 55%,#7c3aed 100%)" }}>
        <StarCanvas />

        {/* Ambient blobs — فوق وتحت animation */}
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(147,51,234,.25),transparent)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(99,102,241,.18),transparent)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

   

        {/* ── Hero (dark) ── */}
        <section className="relative py-28 overflow-hidden z-10">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 px-5 py-2 rounded-full mb-8"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <Target className="w-4 h-4 text-purple-300" />
              </motion.div>
              <span className="text-white/80 text-sm font-semibold">About Ninja Teacher</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Connecting Great Teachers
              <br />
              <Typewriter words={["with the Right Schools", "with the Right Culture", "with the Right Future", "with the Right Match"]} />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-white/60 max-w-2xl mx-auto mt-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Ninja Teacher is an AI-powered platform that evaluates teachers across multiple dimensions — academic, soft skills, and more — then matches them with schools looking for exactly their profile.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup?type=teacher"
                  className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-900/30 transition-all flex items-center gap-2"
                >
                  Join as Teacher <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup?type=school"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/15 transition-all"
                >
                  Register School
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
      {/* ══ END DARK ZONE ══ */}

      {/* What We Do Section */}
      <section className="relative py-20 z-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 800 }}>
              What We Do
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontWeight: 500 }}>
              We built a two-sided system — one that understands teachers deeply, and one that understands what schools actually need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Teachers Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex p-5 bg-gray-100 group-hover:bg-white/20 rounded-2xl mb-6 shadow-xl transition-colors"
                  >
                    <Users className="w-10 h-10 text-[#7C3AED] group-hover:text-white transition-colors" />
                  </motion.div>
                  <h3 className="text-2xl text-gray-900 group-hover:text-white mb-4 transition-colors" style={{ fontWeight: 700 }}>
                    For Teachers
                  </h3>
                  <p className="text-gray-700 group-hover:text-white/90 leading-relaxed transition-colors" style={{ fontWeight: 500 }}>
                    We evaluate each teacher through a structured assessment covering academic knowledge, soft skills, communication, classroom management, and more.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* For Schools Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex p-5 bg-gray-100 group-hover:bg-white/20 rounded-2xl mb-6 shadow-xl transition-colors"
                  >
                    <BookOpen className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors" />
                  </motion.div>
                  <h3 className="text-2xl text-gray-900 group-hover:text-white mb-4 transition-colors" style={{ fontWeight: 700 }}>
                    For Schools
                  </h3>
                  <p className="text-gray-700 group-hover:text-white/90 leading-relaxed transition-colors" style={{ fontWeight: 500 }}>
                    Schools post their open positions with specific requirements. Our AI surfaces the teachers who are the best fit — not just on paper, but in personality and culture too.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Score Section */}
      <section className="relative py-20 z-10 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 border rounded-full mb-6"
              style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', borderColor: 'rgba(124, 58, 237, 0.3)' }}
            >
              <Brain className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-[#7C3AED] text-sm" style={{ fontWeight: 700 }}>The Evaluation System</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 800 }}>
              How We Score Teachers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontWeight: 500 }}>
              Every teacher goes through a multi-layered assessment across four key dimensions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: BookOpen, title: "Academic Knowledge", description: "Subject mastery, curriculum depth, and pedagogical methods.", score: 92, gradient: "from-cyan-400 to-blue-500" },
              { icon: Users, title: "Soft Skills", description: "Communication, empathy, adaptability, and teamwork.", score: 87, gradient: "from-[#7C3AED] to-[#A78BFA]" },
              { icon: Target, title: "Classroom Management", description: "Creating structured, engaging, productive learning environments.", score: 89, gradient: "from-emerald-400 to-teal-500" },
              { icon: Heart, title: "Personality Fit", description: "Values and teaching philosophy matched against school culture.", score: 94, gradient: "from-pink-400 to-fuchsia-500" },
            ].map((dimension, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${dimension.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.6 }}
                        className={`p-3 bg-gradient-to-br ${dimension.gradient} rounded-xl shadow-lg`}
                      >
                        <dimension.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl text-gray-900 group-hover:text-white mb-2 transition-colors" style={{ fontWeight: 700 }}>
                          {dimension.title}
                        </h3>
                        <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors" style={{ fontWeight: 500 }}>
                          {dimension.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 group-hover:text-white/80 transition-colors" style={{ fontWeight: 600 }}>Avg. Score</span>
                        <span className={`text-lg bg-gradient-to-r ${dimension.gradient} bg-clip-text text-transparent group-hover:text-white transition-colors`} style={{ fontWeight: 800 }}>
                          {dimension.score}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 group-hover:bg-white/30 rounded-full overflow-hidden shadow-inner transition-colors">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${dimension.score}%` }}
                          transition={{ delay: 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                          viewport={{ once: true }}
                          className={`h-full bg-gradient-to-r ${dimension.gradient} group-hover:bg-white rounded-full shadow-lg`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching Process Section */}
      <section className="relative py-20 z-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-100 border border-emerald-200 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm" style={{ fontWeight: 700 }}>AI Recommendation Engine</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 800 }}>
              How the Matching Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontWeight: 500 }}>
              Once a school posts a job, our model analyzes every teacher's profile against the role requirements in real time.
            </p>
          </motion.div>

          <div className="space-y-5">
            {[
              { icon: Award, title: "Teacher Gets Evaluated", description: "Each teacher completes our multi-criteria assessment. Scores are stored and kept up to date in their profile.", gradient: "from-[#7C3AED] to-[#A78BFA]" },
              { icon: BookOpen, title: "School Posts a Job", description: "Schools define the role, required competencies, grade level, subject, and cultural preferences for the ideal candidate.", gradient: "from-emerald-500 to-teal-500" },
              { icon: Brain, title: "AI Runs the Recommendation", description: "Our model compares teacher scores against the job's requirements across all dimensions and generates a compatibility score.", gradient: "from-cyan-500 to-blue-500" },
              { icon: CheckCircle, title: "Best Matches Surface", description: "Teachers who are genuinely suitable are shown to the school — ranked by fit, not just availability. No noise, just signal.", gradient: "from-pink-500 to-fuchsia-500" },
              { icon: Star, title: "Teacher Sees the Opportunity", description: "Matched teachers are notified about the role and can see why they're a good fit — making the process transparent for both sides.", gradient: "from-amber-500 to-orange-500" },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white/20 flex items-center justify-center shadow-inner transition-colors">
                    <span className="text-gray-400 group-hover:text-white text-sm transition-colors" style={{ fontWeight: 800 }}>{idx + 1}</span>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`flex-shrink-0 p-4 bg-gradient-to-br ${step.gradient} rounded-2xl shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-900 group-hover:text-white mb-2 pr-12 transition-colors" style={{ fontWeight: 700 }}>
                        {step.title}
                      </h3>
                      <p className="text-gray-600 group-hover:text-white/90 leading-relaxed transition-colors" style={{ fontWeight: 500 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="relative py-20 z-10 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 800 }}>
              Why It Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontWeight: 500 }}>
              The right teacher in the right school changes outcomes — for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Honest Assessment", description: "No guesswork. Teachers are evaluated fairly and transparently so schools know exactly who they're hiring.", gradient: "from-[#7C3AED] to-[#A78BFA]", iconBg: "from-[#7C3AED] to-[#6D28D9]" },
              { icon: Zap, title: "Faster Hiring", description: "Schools stop wading through hundreds of CVs. The right candidates are surfaced automatically.", gradient: "from-amber-400 to-orange-500", iconBg: "from-amber-500 to-orange-600" },
              { icon: CheckCircle, title: "Better Retention", description: "When teachers are well-matched to their school's culture, they stay longer and perform better.", gradient: "from-emerald-400 to-teal-500", iconBg: "from-emerald-500 to-teal-600" },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, type: "spring" }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl text-center transition-all overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -15, 15, 0], scale: 1.15 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex p-5 bg-gradient-to-br ${benefit.iconBg} rounded-2xl mb-6 shadow-xl`}
                    >
                      <benefit.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl text-gray-900 group-hover:text-white mb-4 transition-colors" style={{ fontWeight: 700 }}>
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-white/90 leading-relaxed transition-colors" style={{ fontWeight: 500 }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section (dark card — نفس نمط الكود الأول) ── */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-14 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#7c3aed 100%)" }}
          >
            {/* Dot pattern */}
            <motion.div
              className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "24px 24px" }}
              animate={{ backgroundPosition: ["0px 0px", "24px 24px"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Floating glows */}
            {[
              { pos: "top-8 left-8", size: "w-24 h-24", d: 0 },
              { pos: "bottom-8 right-8", size: "w-32 h-32", d: 1 },
              { pos: "top-1/2 right-16", size: "w-16 h-16", d: 0.5 },
            ].map((o, i) => (
              <motion.div
                key={i}
                className={`absolute ${o.pos} ${o.size} bg-white/10 rounded-full blur-2xl`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: o.d }}
              />
            ))}

            {/* Sparkles icon */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
              className="relative z-10"
            >
              <Sparkles className="w-14 h-14 text-yellow-300 mx-auto mb-6" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 relative z-10">
              Ready to Find Your Match?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto relative z-10">
              Whether you're a teacher looking for the right school or a school searching for the right teacher — Ninja Teacher makes it simple, smart, and fair.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup?type=teacher"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:shadow-2xl transition-all"
                >
                  <Users className="w-5 h-5" />
                  Join as Teacher
                  <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup?type=school"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-black text-lg hover:bg-white/20 transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  Register School
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    

    </div>
  );
}
