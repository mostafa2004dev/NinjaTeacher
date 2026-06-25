import { FiMessageCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const ContactHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[linear-gradient(90deg,#9810FA,#155DFC)] text-white py-20 text-center"
    >
     <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.08 }}
        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-base px-5 py-2 rounded-full mb-6 cursor-pointer"
      >
        <FiMessageCircle className="text-lg" />
        We're Here to Help
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-5 tracking-tight"
      >
        Contact Us
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/80 max-w-xl mx-auto text-sm sm:text-base leading-relaxed hover:text-white transition"
      >
        Have questions or need assistance? Our team is ready to help you find the perfect match for your teaching or hiring needs.
      </motion.p>

    </motion.div>
  );
};

export default ContactHero;