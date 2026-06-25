import { useState } from "react";

function FeedbackModal({ onClose, onSubmit, editData }) {
  const [form, setForm] = useState(
    editData || { name: "", location: "", rating: 0, text: "", teachers: 1, image: "" }
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setForm({ ...form, image: imageUrl });
    }
  };

  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:3000/home/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, rating: form.rating, text: form.text }),
      });
    } catch (_) { /* non-fatal — local state still updates */ }
    onSubmit({ ...form, time: "Just now" });
    onClose();
  };

  const inputCls = "w-full mb-4 h-10 border rounded-md p-3 outline-none focus:border-purple-500 text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white p-6 sm:p-10 rounded-xl w-full max-w-[420px] shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <span className="text-gray-600 uppercase tracking-widest font-bold text-lg sm:text-xl mb-4">
          {editData ? "Edit Feedback" : "Add Feedback"}
        </span>

        <input
          type="text"
          placeholder="School Name"
          className={inputCls}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Location"
          className={inputCls}
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full mb-4 text-sm"
          onChange={handleImageUpload}
        />

        <p className="text-sm font-semibold mb-2 self-start">Rating</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setForm({ ...form, rating: star })}
              className={`cursor-pointer text-xl sm:text-2xl transition ${star <= form.rating ? "scale-110" : "opacity-50"} hover:scale-125`}
            >
              {star <= form.rating ? "⭐" : "☆"}
            </span>
          ))}
        </div>

        <p className="text-sm font-semibold mb-2 self-start">Number of teachers hired</p>
        <input
          type="number"
          className={inputCls}
          value={form.teachers}
          onChange={(e) => setForm({ ...form, teachers: e.target.value })}
        />

        <textarea
          placeholder="Your feedback"
          className="w-full mb-6 border rounded-md p-3 outline-none focus:border-purple-500 text-sm resize-none"
          rows={4}
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <div className="flex justify-between w-full">
          <button onClick={onClose} className="text-gray-500 font-semibold text-sm sm:text-base">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 sm:px-5 py-2 rounded-md text-white bg-gradient-to-r from-purple-500 via-blue-500 to-blue-600 hover:scale-105 transition text-sm sm:text-base"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;