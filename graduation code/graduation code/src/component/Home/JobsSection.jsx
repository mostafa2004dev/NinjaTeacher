import { useState, useEffect } from "react";
import JobCard from "./JobCard";
import { School } from "lucide-react";
import Input from "./Input";
import { resolveImage } from "../utilitis/Resolveimage";

const BASE_URL = "http://localhost:3000";

// Fallback static data لو الـ API فارغ أو فشل
const FALLBACK_JOBS = [
  { id: 1,  title: "English Teacher",   school: "Cybress Ranch High School", description: "Teaches English language skills including reading, writing, speaking, and listening.", image: "/JobSection-Image/School-Img1.jpg" },
  { id: 2,  title: "Math Teacher",      school: "Future School",              description: "Responsible for teaching mathematics concepts in a simple and engaging way.",        image: "/JobSection-Image/School-Img2.jpg" },
  { id: 3,  title: "Science Teacher",   school: "Bright School",              description: "Delivers engaging science lessons covering biology, chemistry, and physics.",        image: "/JobSection-Image/School-Img3.jpg" },
  { id: 4,  title: "Physics Teacher",   school: "Elite School",               description: "Explains physical concepts and laws through practical examples and experiments.",    image: "/JobSection-Image/School-Img4.jpg" },
  { id: 5,  title: "Chemistry Teacher", school: "Horizon Language School",    description: "Explains chemical concepts and reactions through practical examples.",              image: "/JobSection-Image/School-Img5.jpg" },
  { id: 6,  title: "Biology Teacher",   school: "Royal Academy School",       description: "Explains biological concepts and processes through practical examples.",            image: "/JobSection-Image/School-Img6.jpg" },
];

// تحويل بيانات الـ API لنفس شكل الـ job object اللي بيستخدمه JobCard
function mapApiJob(raw) {
  return {
    id:          `${raw.School_ID}-${raw.Job_ID}`,
    title:       raw.Title        || raw.title        || "Teaching Position",
    school:      raw.school_name  || raw.School_Name  || "School",
    description: raw.Description  || raw.description  || raw.Content || "No description available.",
    location:    raw.Location     || raw.location     || "",
    salary:      raw.Salary_Range || raw.salary_range || "",
    job_type:    raw.Job_Type     || raw.job_type     || "",
    subjects:    raw.Subjects     || raw.subjects     || [],
    status:      raw.Status       || raw.status       || "active",
    // الصورة مش بتيجي في featured-jobs فبنستخدم placeholder
    image:       resolveImage(raw.Image || raw.image) || "/JobSection-Image/School-Img1.jpg",
  };
}

// Skeleton card للـ loading
function JobCardSkeleton() {
  return (
    <div className="relative w-full rounded-xl shadow-md overflow-hidden bg-white animate-pulse">
      <div className="w-full h-44 sm:h-52 bg-gray-200" />
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

function JobsSection() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAll, setShowAll]     = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Fetch from API ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/home/featured-jobs`);
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        setJobs(rows.length ? rows.map(mapApiJob) : FALLBACK_JOBS);
      } catch {
        setJobs(FALLBACK_JOBS); // non-fatal
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Local delete (UI only — مش بتحذف من الـ DB) ───────────────────────────
  const deleteJob = (id) => setJobs((prev) => prev.filter((j) => j.id !== id));

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filtered  = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.school.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visible   = showAll ? filtered : filtered.slice(0, 3);
  const hasMore   = filtered.length > 3;

  return (
    <section className="w-full mt-10 px-4 sm:px-10 lg:px-20">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-3 mt-10 py-5">
        <School className="text-purple-600" size={22} />
        Teaching Jobs
      </h2>
      <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base max-w-xl">
        Browse available teaching jobs or search by subject to find opportunities that match your passion and expertise.
      </p>

      {/* Search */}
      <div className="flex justify-center mb-7 sm:mb-9">
        <div className="w-full max-w-[400px] [&_.search-orb-container]:!w-full">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
          : visible.length
            ? visible.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDelete={deleteJob}
                />
              ))
            : (
              <p className="col-span-3 text-center text-gray-400 py-10">
                No jobs found matching "{searchTerm}"
              </p>
            )
        }
      </div>

      {/* Show more / less */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-blue-600 text-white px-6 py-2 rounded-full hover:opacity-90 transition shadow-md text-sm sm:text-base"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
}

export default JobsSection;