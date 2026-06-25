import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:3000";

function authHeaders() {
  const t = localStorage.getItem("userToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function fmtDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d); }
}

// ✅ نفس منطق resolveImage اللي الـ Navbar بيستخدمه
function resolveImage(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // حول الـ backslashes لـ forward slashes
  const normalized = path.replace(/\\/g, "/");
  // تأكد إن فيه / في البداية
  const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${BASE_URL}${withSlash}`;
}

function mapApplicant(a, jobId, jobTitle) {
  const tch = a.teacher || a.Teacher || {};
  return {
    id: `${a.Job_ID || jobId}-${a.Teacher_ID || tch.Teacher_ID}`,
    jobId: a.Job_ID || jobId,
    teacherId: a.Teacher_ID || tch.Teacher_ID,
    name: tch.Name || "Teacher",
    role: jobTitle,
    avatar: resolveImage(tch.Image), // ✅ resolveImage بدل المنطق القديم
    status: (a.Status || a.status || "pending").toLowerCase(),
    match: a.match_score ? `${a.match_score}% Match` : null,
    location: tch.Location || "—",
    experience: tch.Years_of_Experience != null ? `${tch.Years_of_Experience}y exp` : "—",
    rating: tch.Average_Rating ? `${tch.Average_Rating}/10` : "New",
    appliedDate: fmtDate(a.Apply_Date || a.apply_date),
    education: tch.Qualifications || tch.Specialization || "—",
    cv: tch.CV_File ? `${BASE_URL}${tch.CV_File}` : null,
  };
}

export function useApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/school/applicants`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load applicants.");
      const items = json?.data || [];
      setApplicants(items.map((a) => mapApplicant(a, a.Job_ID, a.job_title)));
    } catch (e) {
      setError(e.message || "Failed to load applicants.");
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = useCallback(async (applicant, newStatus) => {
    setBusyId(applicant.id);
    try {
      const res = await fetch(
        `${BASE_URL}/school/jobs/${applicant.jobId}/applicants/${applicant.teacherId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update status.");
      setApplicants((prev) => prev.map((a) => (a.id === applicant.id ? { ...a, status: newStatus } : a)));
      return true;
    } catch (e) {
      setError(e.message || "Failed to update status.");
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  return { applicants, loading, error, busyId, changeStatus, reload: load };
}