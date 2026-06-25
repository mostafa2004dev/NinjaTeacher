import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import heroImg from "../../assets/hero.png";
import TeacherAssessmentButton from "./HeroButton1";
import BrowseJobsButton from "./HeroButton2";
import Stats from "./Stats";

function Hero() {
  const text = "Find Your Dream Teaching Job";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (index < text.length) {
          setDisplayText(text.substring(0, index + 1));
          setIndex(index + 1);
        } else {
          setIsPaused(true);
          setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, 1500);
        }
      } else {
        if (index > 0) {
          setDisplayText(text.substring(0, index - 1));
          setIndex(index - 1);
        } else {
          setIsDeleting(false);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [index, isDeleting, isPaused]);

  const teachingIndex = displayText.indexOf("Teaching");
  const jobIndex = displayText.indexOf("Job");
  const beforeTeaching = teachingIndex >= 0 ? displayText.substring(0, teachingIndex) : displayText;
  const teachingWord = teachingIndex >= 0 ? displayText.substring(teachingIndex, teachingIndex + 8) : "";
  const betweenTeachingJob = teachingIndex >= 0 && jobIndex >= 0 ? displayText.substring(teachingIndex + 8, jobIndex) : "";
  const jobWord = jobIndex >= 0 ? displayText.substring(jobIndex, jobIndex + 3) : "";

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between overflow-hidden">
      <img
        src={heroImg}
        className="absolute inset-0 w-full object-cover"
        style={{ height: '100%', minHeight: '90vh' }}
        alt="hero-img"
      />      <div className="absolute w-full h-full bg-black/45" />

      <div className="relative z-10 px-5 sm:px-10 pt-12 sm:pt-16 text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6 sm:mb-9 tracking-tight">
            Ninja Teacher
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-400" size={18} />
            <span className="bg-gradient-to-r from-purple-500 via-blue-300 to-blue-500 text-white rounded-full px-3 py-1 text-xs sm:text-sm font-medium">
              AI-Powered Teacher Matching Platform
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold leading-tight min-h-[80px] sm:min-h-[100px]">
            {beforeTeaching}
            <span className="text-blue-400">{teachingWord}</span>
            {betweenTeachingJob}
            <span className="text-purple-400">{jobWord}</span>
            <span className="animate-pulse text-white">|</span>
          </h2>

          <p className="mt-4 text-gray-200 max-w-md text-sm sm:text-base leading-relaxed">
            Connect with top schools that match your personality and teaching style.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 items-center">
            <TeacherAssessmentButton />
            <BrowseJobsButton />
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 px-5 sm:px-10 pb-8 sm:pb-10">
        <Stats />
      </div>
    </section>
  );
}

export default Hero;