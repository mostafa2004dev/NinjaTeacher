// ═══════════════════════════════════════════════════════════════════
//  MatchedTeachers.jsx — shows AI-matched teachers
//  Rendered inside the wizard report step (Step 7). Standalone component,
//  doesn't change anything existing. Takes jobDetails + selections.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import { Sparkles, Loader2, Star, GraduationCap } from "lucide-react";

const AI_VIA_BACKEND = "http://localhost:3000/ai/match-from-wizard";

// first selected subject (model matches per subject)
function firstSubject(jobDetails) {
  const subs = jobDetails?.subjects || [];
  return subs.length ? subs[0] : "Math";
}

export default function MatchedTeachers({ jobDetails, selections }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function findTeachers() {
    setState("loading"); setError("");
    try {
      const token = localStorage.getItem("userToken");
      const payload = {
        jobDetails: {
          subject: firstSubject(jobDetails),
          city: jobDetails?.location || "Cairo",
          schoolType: jobDetails?.schoolType || "Private",
          schoolName: jobDetails?.schoolName || "",
        },
        personality: {
          teachingStyle: selections?.teachingStyle || [],
          classroomEnergy: selections?.classroomEnergy || [],
          leadershipStyle: selections?.leadershipStyle || [],
          communicationStyle: selections?.communicationStyle || [],
          problemSolving: selections?.problemSolving || [],
        },
        limit: 8,
      };
      const res = await fetch(AI_VIA_BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "AI matching failed");
      setData(json.data);
      setState("done");
    } catch (e) {
      setError(e.message || "Something went wrong");
      setState("error");
    }
  }

  const labelColor = { color: "var(--text-primary)" };
  const subColor = { color: "var(--text-secondary)" };

  return (
    <div className="mt-5 rounded-2xl p-5 shadow-sm md:p-6" style={{ background: "var(--surface-card)" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-white">
          <Sparkles size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={labelColor}>AI-Matched Teachers</h3>
          <p className="text-sm" style={subColor}>Based on the traits you selected, AI recommends the best-matching teachers with scores</p>
        </div>
      </div>

      {state === "idle" && (
        <button
          onClick={findTeachers}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9810FA] to-[#155DFC] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Sparkles size={16} /> Find Best Teachers
        </button>
      )}

      {state === "loading" && (
        <div className="mt-5 flex items-center gap-3" style={subColor}>
          <Loader2 className="h-5 w-5 animate-spin" /> AI is analyzing and matching teachers...
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
          <button onClick={findTeachers} className="ms-2 underline font-semibold">Retry</button>
        </div>
      )}

      {state === "done" && data && (
        <div className="mt-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" style={subColor}>
            <span className="font-semibold" style={labelColor}>Matched personalities:</span>
            {(data.school?.matched_personalities || []).map((p) => (
              <span key={p} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{p}</span>
            ))}
            <span className="ms-auto">Total accepted: <b style={labelColor}>{data.total_accepted}</b></span>
          </div>

          {Object.entries(data.teachers_by_subject || {}).map(([subject, list]) => (
            <div key={subject} className="mb-5">
              <h4 className="mb-2 flex items-center gap-2 font-bold" style={labelColor}>
                <GraduationCap size={18} /> {subject}
                <span className="text-xs font-normal" style={subColor}>({list.length} candidates)</span>
              </h4>
              {list.length === 0 ? (
                <p className="text-sm" style={subColor}>No teachers match these criteria.</p>
              ) : (
                <div className="space-y-2">
                  {list.map((t) => (
                    <div
                      key={t.teacher_id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                      style={{ borderColor: "var(--border-default, #e5e7eb)", background: "var(--surface-muted)" }}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9810FA] to-[#155DFC] text-sm font-bold text-white">
                        {t.effective_score}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold" style={labelColor}>{t.name}</p>
                        <p className="text-xs" style={subColor}>
                          Classroom {t.classroom} · Professional {t.professional} · Tech {t.tech} · {t.personality_type}
                        </p>
                      </div>
                      {t.personality_match && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                          <Star size={12} /> Personality match
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
