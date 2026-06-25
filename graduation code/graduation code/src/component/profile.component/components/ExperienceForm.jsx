import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema } from "../../../schema/profile.schema/experience.schema";
import { FiArrowRight, FiArrowLeft, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const cardSt  = { background: 'var(--surface-card)',  border: '1px solid var(--border-default)' }
const inputSt = { background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }
const boxSt   = { border: '1px solid var(--border-default)' }

export default function ExperienceForm({ onNext, onBack }) {
  const { control, register, handleSubmit } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: { jobs: [{ title: "", school: "", period: "" }] },
  });
  const { fields, append } = useFieldArray({ control, name: "jobs" });

  return (
    <div className="flex justify-center font-sans p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-xl p-5 sm:p-6 rounded-2xl shadow-md" style={cardSt}>

        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Work Experience</h2>
          <motion.button type="button" whileTap={{ scale: 0.9 }}
            onClick={() => append({ title: "", school: "", period: "" })}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-white rounded-lg shadow-md hover:opacity-90 transition flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            <FiPlus size={14} /> Add More
          </motion.button>
        </div>

        {fields.map((job, index) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="rounded-xl p-4 mb-5" style={boxSt}>
            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Position #{index + 1}</p>

            {[
              { label: 'Job Title',    key: 'title',  ph: 'e.g., Senior Mathematics Teacher' },
              { label: 'School Name',  key: 'school', ph: 'e.g., Boston Latin Academy'       },
              { label: 'Period',       key: 'period', ph: 'e.g., 2018 - Present'             },
            ].map(({ label, key, ph }) => (
              <div key={key} className="mb-4 last:mb-0">
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</label>
                <input type="text" placeholder={ph} {...register(`jobs.${index}.${key}`)}
                  className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#9810FA] transition"
                  style={inputSt} />
              </div>
            ))}
          </motion.div>
        ))}

        <div className="my-5" style={{ borderTop: '1px solid var(--border-default)' }} />

        <div className="flex justify-between flex-wrap gap-3">
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80"
            style={{ border: '1px solid #9810FA', color: '#9810FA', background: 'transparent' }}>
            <FiArrowLeft /> Back
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.9 }}
            onClick={handleSubmit((data) => onNext(data.jobs), () => onNext([]))}
            className="flex items-center gap-2 px-5 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            Next <FiArrowRight />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}