import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificationSchema } from "../../../schema/profile.schema/certification.schema";
import { FiArrowLeft, FiPlus, FiCheckCircle, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

const cardSt  = { background: 'var(--surface-card)',  border: '1px solid var(--border-default)' }
const inputSt = { background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }

export default function CertificationForm({ onBack, onComplete }) {
  const { control, register, handleSubmit } = useForm({
    resolver: zodResolver(certificationSchema),
    defaultValues: { certifications: [""] },
  });
  const { fields, append } = useFieldArray({ control, name: "certifications" });

  return (
    <div className="flex justify-center font-sans p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-xl p-5 sm:p-6 rounded-2xl shadow-md" style={cardSt}>

        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Certifications & Licenses
          </h2>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => append("")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-white rounded-lg flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            <FiPlus size={14} /> Add More
          </motion.button>
        </div>

        {fields.map((field, index) => (
          <motion.div key={field.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }} className="mb-4 flex items-center gap-3">
            <div className="text-purple-500 flex-shrink-0"><FiAward size={18} /></div>
            <input type="text" placeholder="e.g., Massachusetts Teaching License (Mathematics 8-12)"
              {...register(`certifications.${index}`)}
              className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition"
              style={inputSt} />
          </motion.div>
        ))}

        {/* Almost done banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl p-4 mt-5"
          style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.25)' }}>
          <p className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>🎉</span> Almost Done!
          </p>
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            You're one step away from completing your profile. Schools will be able to see your profile and match with you.
          </p>
          <div className="flex items-center gap-2 text-purple-500 text-sm font-medium">
            <FiCheckCircle size={18} /> Profile will be 100% complete
          </div>
        </motion.div>

        <div className="my-5" style={{ borderTop: '1px solid var(--border-default)' }} />

        <div className="flex justify-between items-center flex-wrap gap-3">
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80"
            style={{ border: '1px solid #9810FA', color: '#9810FA', background: 'transparent' }}>
            <FiArrowLeft /> Back
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.9 }}
            onClick={handleSubmit((data) => onComplete(data.certifications), () => onComplete([]))}
            className="flex items-center gap-2 px-5 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
            <FiCheckCircle size={18} /> Complete Profile
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}