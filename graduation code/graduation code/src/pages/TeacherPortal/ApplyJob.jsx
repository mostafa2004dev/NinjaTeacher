import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, School, BookOpen, Target,
  Award, Star, SendHorizontal, CheckCircle2, DollarSign,
  GraduationCap, ChevronLeft,
  TrendingUp
} from 'lucide-react';

const JobDetailsPage = () => {
  const navigate = useNavigate();

  const primaryGradient = "linear-gradient(90deg, #9810FA 0%, #155DFC 100%)";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">

      {/* 1. Navbar*/}


      <main className="max-w-[1440px] mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

        <div className="space-y-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[#A5A6F6] hover:text-[#9810FA] font-bold text-sm flex items-center gap-1.5 mb-2 transition-colors group"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Back to Jobs
          </button>

          <div className="bg-white p-10 rounded-[40px] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-start">
              <div className="flex gap-8">
                <div className="w-24 h-24 bg-[#F5F3FF] rounded-[28px] flex items-center justify-center text-[#5D5FEF]">
                  <School size={48} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Senior Mathematics Teacher</h1>
                  <p className="text-[#9810FA] font-black text-xl">Boston Latin Academy <span className="text-[#F0B100] ml-1 italic">★ 4.8</span></p>
                  <div className="flex flex-wrap gap-8 pt-2 font-bold text-slate-500 text-sm">
                    <span className="flex items-center gap-2.5"><MapPin size={18} className="text-[#9810FA]" /> Boston, MA</span>
                    <span className="flex items-center gap-2.5"><Briefcase size={18} className="text-[#9810FA]" /> Full-time</span>
                    <span className="flex items-center gap-2.5"><DollarSign size={18} className="text-[#9810FA]" /> $65,000 - $85,000</span>
                    <span className="flex items-center gap-2.5"><Clock size={18} className="text-[#9810FA]" /> Posted 2 days ago</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-2 text-[#00C07F] font-black text-4xl">
                  <TrendingUp size={32} fill="#009966" /> 98%
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mt-2">Perfect Match!</p>
              </div>
            </div>


            <div className="flex gap-5 mt-10 pt-10 border-t border-slate-50">
              <button
                style={{ background: primaryGradient }}
                className="flex-1 text-white rounded-2xl h-16 font-black text-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95 hover:opacity-90"
              >
                <SendHorizontal size={22} fill="white" /> Apply Now
              </button>
            </div>
          </div>

          {/* 1. Job Description */}
          <div className="bg-white p-10 rounded-[40px] border border-white shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-widest">
              <BookOpen size={24} className="text-[#9810FA]" /> Job Description
            </h3>
            <p className="text-slate-500 leading-[1.8] font-bold text-base">
              We are seeking an experienced Mathematics teacher to join our award-winning academic team. The ideal candidate will have a passion for teaching and inspiring students to excel in mathematics. You will be responsible for developing engaging lesson plans, fostering a positive learning environment, and helping students achieve their academic goals.
            </p>
          </div>

          {/* 2. Responsibilities */}
          <div className="bg-white p-10 rounded-[40px] border border-white shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8 uppercase tracking-widest">
              <Target size={24} className="text-[#9810FA]" /> Responsibilities
            </h3>
            <div className="grid gap-5 font-bold text-slate-600">
              {[
                "Develop and implement comprehensive lesson plans",
                "Assess student progress and provide constructive feedback",
                "Create a positive and inclusive classroom environment",
                "Collaborate with colleagues and participate in department meetings",
                "Communicate regularly with parents and guardians",
                "Participate in professional development activities"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 size={22} className="text-[#00C07F] shrink-0 mt-0.5" />
                  <span className="text-[15px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Requirements */}
          <div className="bg-white p-10 rounded-[40px] border border-white shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8 uppercase tracking-widest">
              <Award size={24} className="text-[#9810FA]" /> Requirements
            </h3>
            <div className="grid gap-5 font-bold text-slate-600">
              {[
                "Bachelor's degree in Mathematics or related field",
                "5+ years teaching experience",
                "Strong classroom management skills",
                "Experience with AP curriculum",
                "Excellent communication and interpersonal skills",
                "Ability to differentiate instruction for diverse learners"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 size={22} className="text-[#9810FA] shrink-0 mt-0.5" />
                  <span className="text-[15px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Benefits & Perks */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-8">
              <Star size={28} className="text-purple-700" /> Benefits & Perks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Competitive salary package",
                "Comprehensive health insurance",
                "401(k) retirement plan with matching",
                "Professional development opportunities",
                "Paid time off and holidays",
                "Tuition reimbursement for advanced degrees",
                "Collaborative and supportive work environment"
              ].map((perk, i) => (
                <div key={i} className="bg-[#FAF5FF] p-5 rounded-2xl flex items-center gap-3 border border-[#F3E8FF] hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-slate-700 font-black text-sm">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. About School */}
          <div className="bg-white p-10 rounded-[40px] border border-white shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-widest">
              <School size={24} className="text-[#9810FA]" /> About Boston Latin Academy
            </h3>
            <p className="text-slate-500 font-bold leading-relaxed text-base mb-10">
              Boston Latin Academy is a prestigious institution with over 100 years of academic excellence. We pride ourselves on providing a rigorous and supportive learning environment that prepares students for success in college and beyond.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { v: "1878", l: "Founded", c: "bg-purple-50 text-purple-700" },
                { v: "85", l: "Teachers", c: "bg-blue-50 text-blue-700" },
                { v: "98%", l: "Graduation", c: "bg-green-50 text-green-700" },
                { v: "100%", l: "College", c: "bg-orange-50 text-orange-700" }
              ].map((s, i) => (
                <div key={i} className={`${s.c} p-6 rounded-[30px] text-center border-2 border-white shadow-sm transition-transform hover:scale-105`}>
                  <p className="text-2xl font-black mb-1">{s.v}</p>
                  <p className="text-[10px] uppercase font-black opacity-60 tracking-wider">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* العمود الأيمن (الثابت): فورم التقديم */}
        <aside className="lg:sticky lg:top-28 z-40">
          <div className="bg-white p-10 rounded-[40px] border border-white shadow-[0_15px_50px_rgba(0,0,0,0.04)]">
            <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Submit Application</h3>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Applying as:</label>
                <div className="bg-[#F9F8FF] p-5 rounded-[24px] border border-[#F1EFFF] flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#A5A6F6] rounded-full flex items-center justify-center font-bold text-white text-[10px]">T</div>
                  <span className="text-[#9810FA] font-black text-sm">Teacher</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Cover Letter</label>
                <textarea
                  className="w-full bg-[#F8FAFC] border border-slate-100 rounded-[24px] p-6 h-48 focus:ring-4 focus:ring-indigo-50/50 focus:border-[#9810FA] outline-none text-sm font-bold text-slate-600 transition-all placeholder:text-slate-300"
                  placeholder="Tell us why you're a great fit for this position..."
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Start Date Availability</label>
                <input type="date" className="w-full bg-[#F8FAFC] border border-slate-100 rounded-[20px] p-5 outline-none text-sm font-black text-slate-600 focus:ring-4 focus:ring-indigo-50" />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 font-bold">Resume/CV</label>
                <div className="bg-[#E9FBF3] p-5 rounded-[24px] border border-[#D1F5E4] flex items-center gap-3 text-[#00C07F] text-[13px] font-black">
                  <CheckCircle2 size={20} strokeWidth={3} />
                  Your profile will be attached
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <button
                  onClick={() => navigate('/success')}
                  style={{ background: primaryGradient }}
                  className="w-full text-white rounded-[24px] h-16 font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-3"
                >
                  <SendHorizontal size={20} /> Submit Application
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full h-16 bg-white border border-slate-200 rounded-[24px] font-black text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default JobDetailsPage;