import {
  Database, Eye, FileText, Info, Lock, Share2, Shield,
  UserCheck, Cookie, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const sections = [
  { icon: Database, title: "Information We Collect", points: ["Personal information (name, email, phone number) provided during registration","Educational background, qualifications, and certifications","Assessment responses and personality trait data","Employment history and professional references","School information and institutional requirements","Communication and messaging data within the platform","Usage data and platform interaction analytics"] },
  { icon: Eye,      title: "How We Use Your Information", points: ["To match teachers with suitable schools based on personality and competency assessments","To facilitate communication between teachers and schools","To improve our matching algorithms and platform performance","To send relevant job recommendations and platform updates","To verify credentials and maintain platform integrity","To comply with legal obligations and protect user rights","To provide customer support and respond to inquiries"] },
  { icon: Lock,     title: "Data Protection & Security", points: ["We use industry-standard encryption (SSL/TLS) to protect data in transit","Secure databases with access controls and regular security audits","Regular backups to prevent data loss","Limited employee access on a need-to-know basis only","Two-factor authentication for enhanced account security","Regular security updates and vulnerability assessments","Compliance with UAE data protection regulations"] },
  { icon: Share2,   title: "Information Sharing", points: ["We share your profile with schools only when you apply for positions or express interest","Assessment results are shown to schools as match scores, not raw data","We never sell your personal information to third parties","Limited data sharing with trusted service providers under strict confidentiality agreements","Legal disclosures only when required by law or to protect rights and safety","You have full control over profile visibility settings"] },
  { icon: UserCheck,title: "Your Rights", points: ["Access: Request a copy of your personal data at any time","Correction: Update or correct inaccurate information","Deletion: Request deletion of your account and associated data","Portability: Export your data in a machine-readable format","Restriction: Limit how we use your data","Objection: Opt out of marketing communications","Complaint: Lodge a complaint with data protection authorities"] },
  { icon: FileText, title: "Data Retention", points: ["Active accounts: Data retained as long as your account is active","Deleted accounts: Most data deleted within 30 days of account closure","Legal obligations: Some data retained longer to comply with legal requirements","Assessment results: Anonymized data may be retained for research purposes","Communication logs: Retained for dispute resolution and platform improvement","You can request complete data deletion at any time"] },
];

const cookieTypes = [
  { label: "Essential Cookies:",   desc: "Required for platform functionality and security" },
  { label: "Analytics Cookies:",   desc: "Help us understand how you use the platform"      },
  { label: "Preference Cookies:",  desc: "Remember your settings and choices"               },
];

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
};

export default function PrivacyPage() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-500 text-white text-center py-14 px-6">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm mb-4">
          <Shield size={14} /> Your Privacy Matters
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mt-1">Privacy Policy</h1>
        <p className="text-sm mt-4 opacity-90 max-w-lg mx-auto leading-relaxed">
          At Ninja Teacher, we are committed to protecting your privacy and ensuring the security of your personal information.
        </p>
        <p className="text-xs mt-4 opacity-70">Last Updated: May 16, 2026</p>
      </div>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 pb-10">

        {/* Notice */}
        <div className="mt-8 rounded-r-xl p-5"
          style={{ background: 'rgba(59,130,246,0.08)', borderLeft: '4px solid #60a5fa' }}>
          <div className="flex items-center gap-2 mb-2">
            <Info size={18} className="text-blue-400" />
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Important Notice</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            This platform is designed for educational and professional matching purposes. By using Ninja Teacher, you agree to this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="mt-6 space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="p-5 rounded-xl shadow-sm" style={cardStyle}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
                  <s.icon size={18} className="text-white" />
                </div>
                <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cookies */}
        <div className="mt-5 p-6 rounded-xl shadow-sm" style={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <Cookie size={18} className="text-purple-500" />
            <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Cookies & Tracking Technologies</h3>
          </div>
          <ul className="space-y-2.5">
            {cookieTypes.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold">{c.label}</span> {c.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center p-7 rounded-2xl">
          <h3 className="font-bold text-lg">Questions About Privacy?</h3>
          <p className="text-sm mt-2 opacity-90">We're here to help you with any concerns.</p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => navigate('/contact')}
              className="bg-white text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Contact Us
            </button>
            <a href="mailto:legal@ninjateacher.com"
              className="border border-white/50 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
              legal@ninjateacher.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}