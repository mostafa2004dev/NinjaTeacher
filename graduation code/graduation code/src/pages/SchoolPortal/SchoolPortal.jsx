import { useState, useEffect, useContext } from "react";
import Sidebar from "../../component/layout/sidebar/School.sidebar";
import AccountSettings from "../settings/AccountSettings";
import {
    Search,
    Filter,
    ArrowUpDown,
    Sparkles,
    Users,
    BarChart2,
    ChevronLeft
} from "lucide-react";
import AnalyticsPage from "../../component/Analytics/AnalyticsPage";
import CreatePostPage from "../../component/CreatPost/CreatePostPage";
import AllApplicants from "../Applicants/AllApplicants";
import NewApplications from "../Applicants/NewApplications";
import ShortlistedApplicants from "../Applicants/ShortlistedApplicants";
import InterviewScheduled from "../Applicants/InterviewScheduled";
import JobPosts from "./jobposts";
import { NavLink } from "react-router";
import { WizardFormProvider } from '../../context/WizardFormContext';
import TeacherMatchCard from '../../component/teachers/TeacherMatchCard';
import { Authcontext } from '../../context/Authcontext';
import { resolveImage } from '../../component/utilitis/Resolveimage';

export default function SchoolPortal() {
    const [activePage, setActivePage] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState("");
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [schoolProfile, setSchoolProfile] = useState(null);
    const { userToken, userId } = useContext(Authcontext);

    useEffect(() => {
        if (!userId || !userToken) return;
        setLoadingMatches(true);
        fetch(`http://localhost:3000/recommend/teachers/${userId}?limit=10`, {
            headers: { Authorization: `Bearer ${userToken}` },
        })
            .then(r => r.json())
            .then(res => setMatches(Array.isArray(res?.data) ? res.data : []))
            .catch(() => setMatches([]))
            .finally(() => setLoadingMatches(false));
    }, [userId, userToken]);

    useEffect(() => {
        if (!userToken) return;
        fetch('http://localhost:3000/users/me', {
            headers: { Authorization: `Bearer ${userToken}` },
        })
            .then(r => r.json())
            .then(res => setSchoolProfile(res?.data ?? res ?? null))
            .catch(() => null);
    }, [userToken]);

    const filteredMatches = matches.filter(m =>
        !searchQuery || m.teacher?.Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const avgMatchRate = matches.length
        ? Math.round(matches.reduce((s, m) => s + (m.match_score ?? 0), 0) / matches.length)
        : null;

    // ✅ resolve صورة الـ school قبل ما تتبعت للـ Sidebar
    const schoolImageResolved = schoolProfile?.Image
        ? resolveImage(schoolProfile.Image)
        : null;

    // ✅ resolve صور الـ teachers قبل ما تتبعت للـ TeacherMatchCard
    const resolvedMatches = filteredMatches.map(m => ({
        ...m,
        teacher: m.teacher
            ? {
                ...m.teacher,
                Image: m.teacher.Image ? resolveImage(m.teacher.Image) : null,
              }
            : m.teacher,
    }));

    return (
        <div className="flex min-h-screen font-sans" style={{ background: 'var(--surface-page)' }}>
            <Sidebar
                onNavigate={(id) => setActivePage(id)}
                activePage={activePage}
                matchesCount={filteredMatches.length}
                schoolName={schoolProfile?.School_Name || schoolProfile?.Name || null}
                schoolLocation={schoolProfile?.Location || null}
                schoolImage={schoolImageResolved}
            />

            <div className="flex-1 min-w-0 min-h-screen overflow-x-hidden">

                {activePage === "dashboard" && (
                    <main className="p-6 md:p-8 lg:px-12">
                        <div className="max-w-5xl mx-auto">

                            <div className="flex items-center mb-6">
                                <NavLink
                                    to="/"
                                    className="flex items-center gap-1 text-sm font-medium transition-all mb-4 w-fit hover:text-indigo-500"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <ChevronLeft size={16} /> Back to Home
                                </NavLink>
                            </div>

                            <header className="mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    Top Matches for your Math Teacher position
                                </h1>
                                <p className="text-sm mt-2 flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                                    <Sparkles size={16} className="text-purple-500" />
                                    Based on personality assessment and professional compatibility
                                </p>
                            </header>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-[#6B4EFF] rounded-2xl p-6 text-white shadow-sm flex justify-between items-center h-[120px]">
                                    <div className="flex flex-col justify-between h-full py-1">
                                        <p className="text-sm text-white/90 font-medium">New Matches</p>
                                        <h2 className="text-[40px] leading-none font-bold">{matches.length}</h2>
                                    </div>
                                    <div className="bg-white/20 p-4 rounded-xl">
                                        <Users size={24} />
                                    </div>
                                </div>

                                <div className="rounded-2xl p-6 flex justify-between items-center h-[120px]"
                                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
                                    <div className="flex flex-col justify-between h-full py-1">
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Avg. Match Rate</p>
                                        <h2 className="text-[40px] leading-none font-bold" style={{ color: 'var(--text-primary)' }}>{avgMatchRate != null ? `${avgMatchRate}%` : "—"}</h2>
                                    </div>
                                    <div className="bg-[#dcfce7] p-4 rounded-xl">
                                        <BarChart2 size={24} className="text-[#22c55e]" />
                                    </div>
                                </div>
                            </div>

                            {/* Top Candidates Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Top Candidates</h2>
                                <button
                                    onClick={() => setActivePage("applicants")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#6B4EFF] rounded-xl hover:bg-[#5a3de0] transition-all"
                                >
                                    <Users size={16} /> View All Applicants
                                </button>
                            </div>

                            {/* Search & Filters */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative flex-1 w-full rounded-xl"
                                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, skills, or experience..."
                                        className="w-full bg-transparent py-3 pl-11 pr-4 text-sm focus:outline-none"
                                        style={{ color: 'var(--text-secondary)' }}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap"
                                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                                    <Filter size={16} /> Filter
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap"
                                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                                    <ArrowUpDown size={16} /> Sort
                                </button>
                            </div>

                            {loadingMatches ? (
                                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Loading matches…</p>
                            ) : resolvedMatches.length === 0 ? (
                                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {matches.length === 0
                                        ? "No matches yet. Post a job to see AI-recommended teachers."
                                        : "No teachers match your search."}
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {resolvedMatches.map(m => (
                                        <TeacherMatchCard key={m.teacher?.Teacher_ID} {...m} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {activePage === "jobPosts" && (
                    <JobPosts
                        onBack={() => setActivePage("dashboard")}
                        onNavigateToCreate={() => setActivePage("postings")}
                        onNavigateToDashboard={() => setActivePage("dashboard")}
                    />
                )}

                {activePage === "postings" && (
                    <WizardFormProvider>
                        <CreatePostPage onBack={() => setActivePage("jobPosts")} />
                    </WizardFormProvider>
                )}

                {activePage === "analytics" && <AnalyticsPage onBack={() => setActivePage("dashboard")} />}
                {activePage === "settings" && <AccountSettings />}
                {activePage === "applicants" && <AllApplicants />}
                {activePage === "applicants_new" && <NewApplications />}
                {activePage === "applicants_shortlisted" && <ShortlistedApplicants />}
                {activePage === "applicants_interview" && <InterviewScheduled />}
            </div>
        </div>
    );
}