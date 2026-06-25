import {
  AlertTriangle, Ban, Bot, CircleCheckBig, Lock,
  Scale, UserPlus, XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const sections = [
  { icon: UserPlus,      title: "Account Registration & Eligibility", points: ["You must be at least 18 years old to use this platform","Teachers must provide accurate educational qualifications and certifications","Schools must be legitimate educational institutions with proper authorization","You are responsible for maintaining the confidentiality of your account credentials","One account per user/institution is permitted","You must notify us immediately of any unauthorized use of your account","We reserve the right to suspend or terminate accounts that violate these terms"] },
  { icon: CircleCheckBig,title: "Acceptable Use", points: ["Use the platform for legitimate teacher-school matching purposes only","Provide truthful and accurate information in your profile and applications","Respect the privacy and intellectual property of other users","Communicate professionally and courteously with all platform users","Do not attempt to circumvent platform fees or payment systems","Report any suspicious activity or policy violations to our team","Comply with all applicable local, national, and international laws"] },
  { icon: Ban,           title: "Prohibited Activities", points: ["Posting false, misleading, or fraudulent information","Harassment, discrimination, or abusive behavior toward other users","Attempting to access or tamper with platform systems or other users' accounts","Using automated systems (bots, scrapers) without permission","Sharing or selling account access to third parties","Posting spam, malware, or malicious content","Using the platform for any illegal or unauthorized purpose","Circumventing the platform to conduct direct transactions"] },
  { icon: Bot,           title: "Assessment & Matching Services", points: ["Assessment results are based on your responses and our proprietary algorithms","Results are provided as guidance only and do not guarantee employment","We do not verify the accuracy of user-provided information","Match scores are calculated based on personality and competency compatibility","Schools make final hiring decisions independently","We are not responsible for the accuracy of job postings or school information","Assessment data may be used to improve our algorithms (anonymized)"] },
  { icon: Scale,         title: "Intellectual Property", points: ["All platform content, design, and algorithms are owned by Ninja Teacher","You retain ownership of content you upload (profile information, documents)","You grant us a license to use your content for platform operations","Do not copy, reproduce, or distribute platform content without permission","Trademarks and logos are property of their respective owners","We respect intellectual property rights and expect users to do the same"] },
  { icon: AlertTriangle, title: "Disclaimers & Limitations", points: ["The platform is provided 'as is' without warranties of any kind","We do not guarantee continuous, error-free, or secure platform operation","We are not liable for employment decisions made by schools or teachers","We do not conduct background checks or verify credentials (users' responsibility)","We are not responsible for disputes between teachers and schools","Maximum liability is limited to the amount paid for platform services","Some jurisdictions may not allow limitation of liability"] },
  { icon: Lock,          title: "Data Protection & Privacy", points: ["Your use of the platform is governed by our Privacy Policy","We implement security measures to protect your data","You are responsible for the security of your own devices and connections","We may process data in accordance with applicable data protection laws","You have rights regarding your personal data (see Privacy Policy)","We may share data with third-party service providers under confidentiality agreements"] },
];

const terminationReasons = [
  "Violation of these Terms of Service",
  "Fraudulent or illegal activity",
  "Harmful behavior toward other users or the platform",
  "Extended period of inactivity",
];

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
};

export default function TermsPage() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center py-16 px-6">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm mb-5">
          <Scale size={15} /> Legal Agreement
        </div>
        <h1 className="text-5xl font-extrabold mt-1">Terms of Service</h1>
        <p className="text-base mt-4 opacity-90 max-w-xl mx-auto leading-relaxed">
          Please read these terms carefully before using the Ninja Teacher platform. By using our services, you agree to be bound by these terms.
        </p>
        <p className="text-xs mt-4 opacity-70">Last Updated: May 16, 2026</p>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">

        {/* Agreement notice */}
        <div className="rounded-2xl p-5 mt-6 flex gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Agreement to Terms</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              By accessing or using Ninja Teacher, you acknowledge that you have read, understood, and agree to
              be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-6 space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl shadow-sm" style={cardStyle}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                  <s.icon size={26} />
                </div>
                <h2 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
              </div>
              <ul className="space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Termination */}
          <div className="p-6 rounded-2xl shadow-sm w-full max-w-2xl mx-auto" style={cardStyle}>
            <h2 className="font-bold text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>Termination & Suspension</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              We reserve the right to suspend or terminate your access to the platform at any time for:
            </p>
            <ul className="space-y-3 mb-4">
              {terminationReasons.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You may also terminate your account at any time through your account settings or by contacting us.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="p-6 rounded-2xl shadow-sm w-full max-w-2xl mx-auto" style={cardStyle}>
            <h2 className="font-bold text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>Changes to Terms</h2>
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>We may update these Terms of Service from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.</p>
              <p>We will notify you of significant changes by email or through a prominent notice on the platform. Your continued use of Ninja Teacher after such changes constitutes acceptance of the updated terms.</p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="p-6 rounded-2xl shadow-sm w-full max-w-2xl mx-auto" style={cardStyle}>
            <h2 className="font-bold text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>Governing Law & Dispute Resolution</h2>
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>These Terms of Service are governed by the laws of the United Arab Emirates.</p>
              <p>Any disputes arising from your use of the platform shall be resolved through good-faith negotiation. If negotiation fails, disputes will be resolved through arbitration in Dubai, UAE.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center p-8 rounded-2xl">
          <h3 className="font-bold text-xl">Questions About These Terms?</h3>
          <p className="text-sm mt-2 opacity-90">If you have any questions about our Terms of Service, please don't hesitate to reach out.</p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
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