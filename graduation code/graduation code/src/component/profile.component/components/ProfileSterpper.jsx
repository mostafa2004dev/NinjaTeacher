import { FiUser, FiBriefcase, FiAward, FiCheckCircle } from "react-icons/fi";
import { PiGraduationCapLight } from "react-icons/pi";
import { motion } from "framer-motion";

export default function ProfileStepper({ currentStep }) {
  const steps = [
    { label: "Basic Info",      icon: <FiUser /> },
    { label: "Experience",      icon: <FiBriefcase /> },
    { label: "Education",       icon: <PiGraduationCapLight /> },
    { label: "Certifications",  icon: <FiAward /> },
  ];

  return (
    <div className="flex justify-center items-center mb-10 flex-wrap gap-y-4 px-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive    = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-lg sm:text-xl transition"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(90deg,#00C950,#009966)'
                    : isActive
                    ? 'linear-gradient(90deg,#9810FA,#155DFC)'
                    : 'var(--surface-muted)',
                  color: isCompleted || isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 4px 16px rgba(152,16,250,0.3)' : 'none',
                }}
              >
                {isCompleted ? <FiCheckCircle size={20} /> : step.icon}
              </motion.div>

              <span className="mt-2 text-xs sm:text-sm transition font-medium"
                style={{
                  color: isCompleted ? '#009966' : isActive ? '#9810FA' : 'var(--text-muted)',
                }}>
                {step.label}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div className="mx-2 sm:mx-3 mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '48px' }}
                  className="h-1 rounded sm:w-20"
                  style={{
                    background: index < currentStep
                      ? 'linear-gradient(90deg,#00C950,#009966)'
                      : 'var(--border-default)',
                    width: '48px',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}