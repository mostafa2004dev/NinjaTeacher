export default function TeacherMatchCard({ teacher, match_score, personality_verdict, stage_verdict }) {
  const initials = teacher?.Name
    ? teacher.Name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const verdictLabel = personality_verdict
    ? personality_verdict.replace(/_/g, " ")
    : stage_verdict?.replace(/_/g, " ") ?? "";

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4 transition-shadow hover:shadow-md"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}
    >
      {teacher?.Image ? (
        <img
          src={teacher.Image}
          alt={teacher.Name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
        >
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {teacher?.Name ?? "Unknown Teacher"}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {[teacher?.Specialization, teacher?.Years_of_Experience ? `${teacher.Years_of_Experience}y exp` : null, teacher?.Location]
            .filter(Boolean).join(" · ")}
        </p>
        {verdictLabel && (
          <p className="text-xs mt-0.5 capitalize font-medium text-indigo-500">{verdictLabel}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-lg font-black text-indigo-500">{match_score ?? 0}%</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>match</p>
      </div>
    </div>
  );
}
