import ContactHero from "../../component/contact/ContactHero";
import ContactForm from "../../component/contact/ContactForm";
import ContactCards from "../../component/contact/ContactInfoCards";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "../../component/shared/animations/pageTransition";
import { fadeUp } from "../../component/shared/animations/fade";
import { slideRight } from "../../component/shared/animations/slide";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gray-50"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <ContactHero />
      </motion.div>

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="order-2 md:order-1"
          variants={slideRight}
          transition={{ duration: 0.5 }}
        >
          <ContactCards />
        </motion.div>

        <motion.div
          className="md:col-span-2 order-1 md:order-2"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ContactForm />
        </motion.div>
      </div>
    </motion.div>
  );
}