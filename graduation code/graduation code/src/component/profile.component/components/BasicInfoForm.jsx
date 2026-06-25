import { useState } from "react";
import { FiUser, FiMapPin, FiPhone, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicInfoSchema } from "../../../schema/profile.schema/basicInfo.schema";

export default function BasicInfoForm({ onNext, onBack, defaultValues, defaultImage }) {
  const [imageFile, setImageFile] = useState(null);
  // ✅ الـ defaultImage جاهز كـ URL كامل من الـ parent
  const [imagePreview, setImagePreview] = useState(defaultImage ?? null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    // ✅ القيم الموجودة من الـ API
    defaultValues: defaultValues ?? {},
  });

  const bio = watch("bio") || "";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const iconStyle = "text-[#9810FA] w-5 h-5";

  return (
    <div className="flex justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Basic Information</h2>

        {/* Image Upload */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mb-6"
        >
          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center relative cursor-pointer
              bg-[linear-gradient(135deg,#F3E8FF,#DBEAFE)]
              border-[1.6px] border-[#9810FA] shadow-sm overflow-hidden"
            onClick={() => document.getElementById("imageInput").click()}
          >
            {imagePreview
              ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              : <FiUser className="text-[#9810FA] text-4xl" />
            }
            <div className="absolute bottom-1 right-1 w-9 h-9 flex items-center justify-center
              bg-[linear-gradient(90deg,#9810FA,#155DFC)] text-white rounded-xl shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l1-2h12l1 2h2v12H3V7z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
          </div>
          <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <p className="text-sm text-gray-400 mt-3">Upload your photo</p>
        </motion.div>

        {/* Subject */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800">Subject / Specialization *</label>
          <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mt-1 focus-within:ring-1 focus-within:ring-[#9810FA] transition">
            <BookOpen className={`${iconStyle} mr-2`} />
            <input type="text" placeholder="e.g., Mathematics, Science, English"
              className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              {...register("subject")} />
          </div>
          {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800">Location *</label>
          <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mt-1 focus-within:ring-1 focus-within:ring-[#9810FA] transition">
            <FiMapPin className={`${iconStyle} mr-2`} />
            <input type="text" placeholder="City, State/Country"
              className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              {...register("location")} />
          </div>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800">Phone Number</label>
          <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mt-1 focus-within:ring-1 focus-within:ring-[#9810FA] transition">
            <FiPhone className={`${iconStyle} mr-2`} />
            <input type="text" placeholder="+1 (555) 000-0000"
              className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              {...register("phone")} />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800">Years of Experience *</label>
          <input type="number" placeholder="0"
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#9810FA] text-gray-700"
            {...register("experience")} />
          {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800">Professional Bio</label>
          <textarea rows="4" maxLength={500} placeholder="Tell us about yourself..."
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#9810FA] text-gray-700"
            {...register("bio")} />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/500 characters</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition">
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={handleSubmit((data) => onNext(data, imageFile))}
            className="flex items-center gap-2 px-5 py-2 bg-[linear-gradient(90deg,#9810FA,#155DFC)] text-white rounded-lg shadow-md hover:opacity-90 transition">
            Next <FiArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
}