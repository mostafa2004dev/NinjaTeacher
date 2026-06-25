import { MapPin, Award, Star, Clock, Eye, MessageSquare, Check, X } from "lucide-react";

const cardStyle = { background: "var(--surface-card)", border: "1px solid var(--border-default)" };

function statusBadge(status) {
  const s = (status || "").toLowerCase();
  if (s === "accepted") return { label: "Accepted", cls: "bg-emerald-100 text-emerald-700" };
  if (s === "shortlisted") return { label: "Shortlisted", cls: "bg-amber-100 text-amber-700" };
  if (s === "interview") return { label: "Interview", cls: "bg-indigo-100 text-indigo-700" };
  if (s === "rejected") return { label: "Rejected", cls: "bg-red-100 text-red-700" };
  return { label: "New", cls: "bg-blue-100 text-blue-700" };
}

export default function ApplicantCard({ applicant, busy, onStatusChange }) {
  const badge = statusBadge(applicant.status);

  return (
    <div className="p-5 sm:p-6 rounded-2xl flex flex-col gap-5" style={cardStyle}>
      <div className="flex flex-col sm:flex-row gap-5">
        {applicant.avatar ? (
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
            style={{ border: "1px solid var(--border-default)" }}
          />
        ) : (
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-bold"
            style={{ border: "1px solid var(--border-default)", background: "var(--surface-muted)", color: "#8b5cf6" }}
          >
            {applicant.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h3 className="font-bold text-lg sm:text-xl" style={{ color: "var(--text-primary)" }}>{applicant.name}</h3>
              <p className="text-purple-500 font-semibold text-sm mt-0.5">{applicant.role}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${badge.cls}`}>{badge.label}</span>
              {applicant.match && (
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{applicant.match}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mt-4" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-400" /> {applicant.location}</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple-400" /> {applicant.experience}</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {applicant.rating}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> Applied {applicant.appliedDate}</span>
          </div>

          <div
            className="mt-4 text-sm inline-block px-3 py-1.5 rounded-lg"
            style={{ background: "var(--surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Education:</span> {applicant.education}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-5 mt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
        {applicant.cv ? (
          <a
            href={applicant.cv}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" /> View Details
          </a>
        ) : (
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Eye className="w-4 h-4" /> View Details
          </button>
        )}
        
        
        <button
          onClick={() => onStatusChange(applicant, "shortlisted")}
          disabled={busy}
          className="px-5 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
        >
          Shortlist
        </button>
        <button
          onClick={() => onStatusChange(applicant, "interview")}
          disabled={busy}
          className="px-5 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50"
        >
          Interview
        </button>
        <button
          onClick={() => onStatusChange(applicant, "accepted")}
          disabled={busy}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm ml-auto disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Accept
        </button>
        <button
          onClick={() => onStatusChange(applicant, "rejected")}
          disabled={busy}
          className="flex items-center gap-1.5 px-5 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      </div>
    </div>
  );
}