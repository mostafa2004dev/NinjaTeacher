import { PiGraduationCapLight } from "react-icons/pi";
import { motion } from "framer-motion";

export default function ProfileHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 py-4 flex items-center justify-center gap-3 shadow-sm"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[linear-gradient(90deg,#9810FA,#155DFC)]">
        <PiGraduationCapLight className="text-white text-xl" />
      </div>

      <h1 className="text-lg font-semibold text-gray-800">
        Complete Your Profile
      </h1>
    </motion.div>
  );
}