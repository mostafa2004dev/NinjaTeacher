import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/TeacherPortal'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'var(--surface-page)' }}>
      <div className="w-full max-w-md p-8 sm:p-12 rounded-[40px] text-center flex flex-col items-center"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00C07F] rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-green-100">
          <CheckCircle2 size={42} strokeWidth={3} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Application Submitted!
        </h1>

        <p className="font-medium leading-relaxed mb-10 px-2 text-sm sm:text-[15px]" style={{ color: 'var(--text-muted)' }}>
          Your application has been successfully submitted to{' '}
          <span style={{ color: 'var(--text-primary)' }} className="font-bold">Boston Latin Academy</span>.
          They will review your profile and get back to you soon.
        </p>

        <div className="flex flex-col items-center gap-3 w-full">
          <span className="text-[#9810FA] font-black text-sm tracking-wide cursor-pointer hover:underline"
            onClick={() => navigate('/TeacherDashboard')}>
            Redirecting to dashboard...
          </span>

          <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
            <div className="h-full bg-[#9810FA]"
              style={{ animation: 'loading 5s linear forwards', transformOrigin: 'left' }} />
          </div>

          <button onClick={() => navigate('/TeacherDashboard')}
            className="mt-4 w-full sm:w-auto px-8 py-3 rounded-2xl text-white font-black text-sm hover:opacity-90 transition active:scale-95"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            Go to Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;