import Hero from "../../../component/Home/Hero";
import JobsSection from "../../../component/Home/JobsSection";
import FeedbackSection from "../../../component/Home/FeedbackSection";
import CTA from "../../../component/Home/CTA";

function Home() {
  return (
    <div className="bg-gray-50">
      <Hero />
      <JobsSection />
      <FeedbackSection />
      <CTA />
    </div>
  );
}

export default Home;