import { LogOut, AlertCircle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";

export default function LogoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-100 p-8 rounded-4xl shadow-2xl flex flex-col items-center text-center">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-md">
            <GraduationCap className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ninja Teacher</h2>
        </div>

        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-orange-500" size={32} />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirm Logout</h3>
        <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
          School, are you sure you want to log out?
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-linear-to-r from-[#9333ea] to-[#2563eb] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <LogOut size={18} />
            Yes, Log Me Out
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}