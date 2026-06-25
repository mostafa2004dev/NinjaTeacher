import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../../context/Authcontext";
import { Sparkles, MapPin, Star, ArrowLeft } from "lucide-react";

export default function Recommendations() {
  const { userToken } = useContext(Authcontext);
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userToken) return;
    fetch("http://localhost:3000/recommend/schools", {
      headers: { Authorization: `Bearer ${userToken}` },
    })
      .then(r => r.json())
      .then(res => {
        setSchools(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => setError("Could not load recommendations. Make sure you have completed the personality assessment."))
      .finally(() => setLoading(false));
  }, [userToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-page)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading your matched schools…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--surface-page)" }}>
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm mb-6 hover:text-indigo-500 transition"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Your Matched Schools
          </h1>
          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Sparkles size={14} className="text-purple-500" />
            AI-ranked based on your personality assessment and teaching style
          </p>
        </div>

        {error && (
          <div className="rounded-2xl p-5 mb-6 text-sm" style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
            {error}
          </div>
        )}

        {!error && schools.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No recommendations yet. Complete the personality assessment to unlock matched schools.
            </p>
            <button
              onClick={() => navigate("/TeacherSurvey")}
              className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(90deg,#6366f1,#818cf8)" }}
            >
              Take Assessment
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {schools.map((item, i) => {
            const school = item.school || item;
            const score = item.match_score ?? item.score ?? 0;
            const verdict = item.personality_verdict || item.verdict;
            return (
              <div
                key={school.Teacher_ID || school.id || i}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}
              >
                {school.Image ? (
                  <img src={school.Image} alt={school.School_Name || school.Name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
                  >
                    {(school.School_Name || school.Name || "S").slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {school.School_Name || school.Name || "School"}
                  </p>
                  {school.School_Type && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{school.School_Type}</p>
                  )}
                  {school.Location && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                      <MapPin size={10} /> {school.Location}
                    </p>
                  )}
                  {school.Average_Rating > 0 && (
                    <p className="text-xs flex items-center gap-1 mt-0.5 text-amber-500">
                      <Star size={10} fill="currentColor" /> {school.Average_Rating}
                    </p>
                  )}
                  {verdict && (
                    <p className="text-xs mt-1 capitalize font-medium text-indigo-500">
                      {verdict.replace(/_/g, " ")}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-indigo-500">{score}%</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>match</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
