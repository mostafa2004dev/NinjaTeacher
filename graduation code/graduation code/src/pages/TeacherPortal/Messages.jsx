import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Phone, Video, MoreVertical, Send, 
  ChevronLeft, School, CheckCheck, GraduationCap 
} from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(1);

    const primaryGradient = "linear-gradient(90deg, #9810FA 0%, #155DFC 100%)";

  const chats = [
    { id: 1, name: "Boston Latin Academy", subtitle: "Senior Mathematics Teacher", lastMsg: "We'd love to schedule an interview with you", time: "2 hours ago", unread: 2 },
    { id: 2, name: "Cambridge International School", subtitle: "Mathematics Teacher", lastMsg: "Thank you for your application. We are revi...", time: "1 day ago", unread: 0 },
    { id: 3, name: "MIT Math Learning Center", subtitle: "Math Tutor & Instructor", lastMsg: "Congratulations! We are pleased to offer yo...", time: "3 days ago", unread: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div style={{ background: primaryGradient }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={22} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Messages</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-sm font-bold text-slate-400">Teacher</span>
           <div className="w-8 h-8 bg-[#A5A6F6] rounded-full flex items-center justify-center font-bold text-white text-xs">T</div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-0 bg-white shadow-sm overflow-hidden rounded-[32px] my-6 border border-slate-100">
        
        {/* Sidebar*/}
        <aside className="border-r border-slate-100 flex flex-col h-[750px]">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-purple-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 px-3">
            {chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-5 rounded-[24px] cursor-pointer transition-all flex gap-4 relative ${activeChat === chat.id ? 'bg-[#F5F3FF]' : 'hover:bg-slate-50'}`}
              >
                {activeChat === chat.id && <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-[#9810FA] rounded-r-full" />}
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-[#9810FA] shadow-sm shrink-0">
                  <School size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-slate-800 truncate text-[15px]">{chat.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <p className="text-[12px] font-black text-[#9810FA] mb-1 truncate">{chat.subtitle}</p>
                  <p className="text-xs font-bold text-slate-400 truncate">{chat.lastMsg}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="absolute right-5 bottom-5 w-5 h-5 bg-[#9810FA] rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-lg shadow-purple-200">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        
        <section className="flex flex-col h-[750px] bg-slate-50/30">
          
          <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-[#9810FA]">
                <School size={24} />
              </div>
              <div>
                <h2 className="font-black text-slate-800">Boston Latin Academy</h2>
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Boston, MA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[Phone, Video, MoreVertical].map((Icon, i) => (
                <button key={i} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages*/}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FCFDFF]">
            <div className="flex justify-center">
               <span className="bg-purple-50 text-[#9810FA] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-purple-100 flex items-center gap-2">
                 <GraduationCap size={14} /> Application for: Senior Mathematics Teacher
               </span>
            </div>

            <div className="flex flex-col gap-2 max-w-[75%]">
              <div className="bg-white border border-slate-100 p-5 rounded-[24px] rounded-tl-none shadow-sm">
                <p className="text-sm font-bold text-slate-600 leading-relaxed">Hello! Thank you for your application to Boston Latin Academy.</p>
                <span className="text-[10px] font-bold text-slate-300 mt-2 block">10:30 AM</span>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-[24px] rounded-tl-none shadow-sm">
                <p className="text-sm font-bold text-slate-600 leading-relaxed">We were very impressed with your profile and would like to move forward with the next steps.</p>
                <span className="text-[10px] font-bold text-slate-300 mt-2 block">10:31 AM</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-[75%] ml-auto">
              <div style={{ background: primaryGradient }} className="p-5 rounded-[24px] rounded-br-none shadow-xl shadow-purple-100 text-white">
                <p className="text-sm font-black leading-relaxed">Thank you! I'm very excited about this opportunity.</p>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[10px] font-bold opacity-80">10:45 AM</span>
                  <CheckCheck size={14} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-[75%]">
              <div className="bg-white border border-slate-100 p-5 rounded-[24px] rounded-tl-none shadow-sm">
                <p className="text-sm font-bold text-slate-600 leading-relaxed">We'd love to schedule an interview with you for next Tuesday at 2 PM. Would that work for you?</p>
                <span className="text-[10px] font-bold text-slate-300 mt-2 block">2:15 PM</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none py-3 px-4 outline-none text-sm font-bold"
              />
              <button style={{ background: primaryGradient }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                <Send size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Messages;