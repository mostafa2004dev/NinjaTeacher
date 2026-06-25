import { useState, useEffect } from "react";
import FeedbackCard from "./FeedbackCard";
import AddFeedbackButton from "./AddFeedbackButton";
import FeedbackModal from "./FeedbackModal";
import { resolveImage } from "../utilitis/Resolveimage";

const BASE_URL = "http://localhost:3000";

// Demo fallback — يتعرض لو الـ DB فاضي
const FALLBACK_DATA = [
  { name: "Al Noor International School", location: "Dubai, UAE",     rating: 5, text: "We hired 3 excellent teachers through this platform.", teachers: 3, time: "2 weeks ago", image: "" },
  { name: "Future Leaders Academy",        location: "Abu Dhabi, UAE", rating: 5, text: "Outstanding platform!",                                teachers: 2, time: "3 weeks ago", image: "" },
  { name: "Bright Horizons School",        location: "Sharjah, UAE",   rating: 4, text: "The quality of candidates is exceptional.",            teachers: 2, time: "3 weeks ago", image: "" },
];

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

// تحويل الـ Review row من الـ API للشكل اللي يفهمه FeedbackCard
function mapApiReview(r) {
  return {
    name:     r.reviewer_name || "A School",
    location: r.job_title     || "",
    rating:   Math.round(Number(r.rating) || 0),
    text:     r.comment       || "",
    teachers: null,
    time:     timeAgo(r.createdAt || r.created_at),
    image:    "",
  };
}

function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState(FALLBACK_DATA);
  const [open, setOpen]           = useState(false);
  const [editData, setEditData]   = useState(null);
  const [visibleCount, setVisibleCount] = useState(2);
  const [loading, setLoading]     = useState(true);

  // ── Fetch testimonials from DB ──────────────────────────────────────────────
  const fetchTestimonials = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/home/testimonials`);
      if (!res.ok) return;
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      if (rows.length) setFeedbacks(rows.map(mapApiReview));
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    fetchTestimonials().finally(() => setLoading(false));
  }, []);

  // ── After submit: re-fetch from DB then expand list so new record is visible ─
  const addFeedback = () => {
    setEditData(null);
    fetchTestimonials().then(() => setVisibleCount(999));
  };

  const deleteFeedback = (index) =>
    setFeedbacks((prev) => prev.filter((_, i) => i !== index));

  const handleEdit = (item) => { setEditData(item); setOpen(true); };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-10 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">What Schools Say About Us</h2>
        <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Hear from schools that hired teachers through our platform
        </p>
        <div className="flex flex-col gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-10 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2">What Schools Say About Us</h2>
      <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
        Hear from schools that hired teachers through our platform
      </p>

      <div className="flex flex-col gap-4 sm:gap-6">
        {feedbacks.slice(0, visibleCount).map((item, index) => (
          <FeedbackCard
            key={index}
            data={item}
            onDelete={() => deleteFeedback(index)}
            onEdit={() => handleEdit(item)}
          />
        ))}
      </div>

      {feedbacks.length > 2 && (
        <div className="flex justify-center mt-5 sm:mt-6">
          <button
            onClick={() => setVisibleCount((c) => (c >= feedbacks.length ? 2 : feedbacks.length))}
            className="text-purple-500 font-medium text-sm sm:text-base hover:underline transition"
          >
            {visibleCount >= feedbacks.length ? "Show Less" : "See More"}
          </button>
        </div>
      )}

      <AddFeedbackButton onClick={() => setOpen(true)} />

      {open && (
        <FeedbackModal
          onClose={() => { setOpen(false); setEditData(null); }}
          onSubmit={addFeedback}
          editData={editData}
        />
      )}
    </div>
  );
}

export default FeedbackSection;