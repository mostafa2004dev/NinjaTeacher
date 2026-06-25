import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "../../../schema/profile.schema/education.schema";
import { FiArrowRight, FiArrowLeft, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const cardSt  = { background: 'var(--surface-card)',  border: '1px solid var(--border-default)' }
const inputSt = { background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }
const boxSt   = { border: '1px solid var(--border-default)' }

export default function EducationForm({ onNext, onBack }) {
  const { control, register, handleSubmit } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: [{ degree: "", institution: "", year: "" }] },
  });
  const { fields, append } = useFieldArray({ control, name: "education" });

  return (
    <div className="flex justify-center font-sans p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-xl p-5 sm:p-6 rounded-2xl shadow-md" style={cardSt}>

        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Education</h2>
          <motion.button type="button" whileTap={{ scale: 0.9 }}
            onClick={() => append({ degree: "", institution: "", year: "" })}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-white rounded-lg shadow-md hover:opacity-90 transition flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            <FiPlus size={14} /> Add More
          </motion.button>
        </div>

        {fields.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="rounded-xl p-4 mb-5" style={boxSt}>
            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Degree #{index + 1}</p>

            {[
              { label: 'Degree',      key: 'degree',      ph: 'e.g., Ph.D. in Mathematics Education' },
              { label: 'Institution', key: 'institution', ph: 'e.g., Harvard University'             },
              { label: 'Year',        key: 'year',        ph: 'e.g., 2015'                           },
            ].map(({ label, key, ph }) => (
              <div key={key} className="mb-4 last:mb-0">
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</label>
                <input type="text" placeholder={ph} {...register(`education.${index}.${key}`)}
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
            onClick={handleSubmit((data) => onNext(data.education), () => onNext([]))}
            className="flex items-center gap-2 px-5 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition"
            style={{ background: 'linear-gradient(90deg,#9810FA,#155DFC)' }}>
            Next <FiArrowRight />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}