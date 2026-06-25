import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import ProfileHeader from "../../component/profile.component/components/ProfileHeader";
import BasicInfoForm from "../../component/profile.component/components/BasicInfoForm";
import EducationForm from "../../component/profile.component/components/EducationForm";
import ExperienceForm from "../../component/profile.component/components/ExperienceForm";
import CertificationForm from "../../component/profile.component/components/CertificationForm";
import ProfileStepper from "../../component/profile.component/components/ProfileSterpper";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransition } from "../../component/shared/animations/pageTransition";

const API_URL = "http://localhost:3000/profile/complete-teacher-profile";

async function completeTeacherProfile({ basicInfo, experience, education, certifications, image }) {
  const token = localStorage.getItem("userToken");
  const formData = new FormData();

  formData.append("Specialization",      basicInfo.subject);
  formData.append("Location",            basicInfo.location);
  formData.append("Phone",               basicInfo.phone || "");
  formData.append("Years_of_Experience", basicInfo.experience);
  formData.append("Bio",                 basicInfo.bio || "");

  if (image) formData.append("image", image);

  formData.append("experience", JSON.stringify(
    experience.map((j) => {
      const parts = (j.period || "").split("-").map((s) => s.trim());
      const isCurrent = parts[1]?.toLowerCase() === "present";
      return {
        job_title:   j.title,
        school_name: j.school,
        start_date:  parts[0] || null,
        end_date:    isCurrent ? null : parts[1] || null,
        is_current:  isCurrent,
      };
    })
  ));

  formData.append("education", JSON.stringify(
    education.map((e) => ({
      degree:      e.degree,
      institution: e.institution,
      end_year:    e.year ? Number(e.year) : null,
    }))
  ));

  formData.append("certifications", JSON.stringify(
    certifications.filter(Boolean).map((title) => ({ title }))
  ));

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export default function Profile() {
  const [step, setStep]             = useState(0);
  const [basicInfo, setBasicInfo]   = useState(null);
  const [image, setImage]           = useState(null);
  const [experience, setExperience] = useState([]);
  const [education, setEducation]   = useState([]);
  const [loading, setLoading]       = useState(false);

  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  if (userRole !== "teacher") return <Navigate to="/" replace />;

  const handleSkip = () => navigate("/TeacherProfile");

  const handleComplete = async (certifications) => {
    setLoading(true);
    try {
      const res = await completeTeacherProfile({ basicInfo, image, experience, education, certifications });
      console.log("✅ Response:", res);
      navigate("/TeacherProfile");
    } catch (err) {
      console.error("❌ Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const forms = [
    <BasicInfoForm
      onNext={(data, img) => { setBasicInfo(data); setImage(img); setStep(1); }}
    />,
    <ExperienceForm
      onNext={(data) => { setExperience(data); setStep(2); }}
      onBack={() => setStep(0)}
    />,
    <EducationForm
      onNext={(data) => { setEducation(data); setStep(3); }}
      onBack={() => setStep(1)}
    />,
    <CertificationForm
      onBack={() => setStep(2)}
      onComplete={handleComplete}
      loading={loading}
    />,
  ];

  return (
    <div className="min-h-screen mb-2" style={{ background: 'var(--surface-page)' }}>
      <ProfileHeader />

      <div className="mt-10 max-w-2xl mx-auto px-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            className="text-sm underline underline-offset-2 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Skip for now →
          </button>
        </div>

        <ProfileStepper currentStep={step} />

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              {forms[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}