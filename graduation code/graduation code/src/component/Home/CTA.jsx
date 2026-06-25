import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router";

function CTA() {
  const navigate = useNavigate();
  return (
    <div className="px-4 sm:px-6 mt-12 sm:mt-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl py-12 sm:py-16 px-5 sm:px-6 text-center text-white bg-gradient-to-r from-purple-500 via-blue-500 to-blue-600"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur">
            <Rocket size={28} />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Boost Your Job Match Rate
        </h2>

        <p className="text-white/90 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
          Take our personality and skills assessment to get matched with schools that fit your teaching style perfectly.
        </p>

        <div className="flex justify-center">
          <button onClick={() => navigate("/TeacherSurvey")} className="flex items-center gap-2 bg-white text-purple-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition text-sm sm:text-base">
            🎯 Start Free Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default CTA;