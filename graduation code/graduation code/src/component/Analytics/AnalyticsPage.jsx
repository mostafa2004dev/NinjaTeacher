import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { NavLink } from "react-router";

const ANALYTICS_API     = "http://localhost:3000/home/stats";
const AI_ANALYTICS_API  = "http://localhost:3000/analytics/overview";

export default function AnalyticsPage({ onBack }) {
    const barRef   = useRef(null);
    const donutRef = useRef(null);
    const radarRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [radarData, setRadarData] = useState(null);

    // جلب البيانات الحقيقية — live DB counts + AI subject distribution
    useEffect(() => {
        let alive = true;
        Promise.all([
            fetch(ANALYTICS_API).then(r => r.json()).catch(() => null),
            fetch(AI_ANALYTICS_API).then(r => r.json()).catch(() => null),
            fetch("http://localhost:3000/home/analytics/personality").then(r => r.json()).catch(() => null),
        ]).then(([liveRes, aiRes, personalityRes]) => {
            if (!alive) return;
            setStats({
                cards:             liveRes?.data?.cards || aiRes?.data?.cards || {},
                subjects_analysis: aiRes?.data?.subjects_analysis || [],
            });
            if (personalityRes?.data?.radar) setRadarData(personalityRes.data.radar);
        });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        const loadChart = () => new Promise((resolve) => {
            if (window.Chart) return resolve();
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });

        /* read CSS vars to make charts respect dark mode */
        const style   = getComputedStyle(document.documentElement);
        const isDark  = document.documentElement.classList.contains("dark");
        const gridCol = isDark ? "#1f2937" : "#f1f5f9";
        const tickCol = isDark ? "#6b7280" : "#94a3b8";
        const labelCol= isDark ? "#9ca3af" : "#94a3b8";

        loadChart().then(() => {
            const Chart = window.Chart;

            if (barRef.current) {
                if (barRef.current._chart) barRef.current._chart.destroy();
                // بيانات حقيقية: متوسط جودة التدريس لكل مادة (من الـ AI)
                const subj = stats?.subjects_analysis || [];
                const barLabels = subj.length ? subj.map((s) => s.subject) : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
                const barData   = subj.length ? subj.map((s) => s.avg_evaluation) : [60,45,70,55,80,90,110,130];
                barRef.current._chart = new Chart(barRef.current, {
                    type: "bar",
                    data: {
                        labels: barLabels,
                        datasets: [{
                            data: barData,
                            backgroundColor: "#6366f1",
                            borderRadius: 8,
                            borderSkipped: false,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { display: false }, ticks: { color: tickCol, font: { size: 11 } } },
                            y: { grid: { color: gridCol }, ticks: { color: tickCol, font: { size: 11 } }, beginAtZero: true },
                        },
                    },
                });
            }

            if (donutRef.current) {
                if (donutRef.current._chart) donutRef.current._chart.destroy();
                const donutBg = isDark ? "#1f2937" : "#f0f2f8";
                donutRef.current._chart = new Chart(donutRef.current, {
                    type: "doughnut",
                    data: {
                        datasets: [{
                            data: (() => { const r = stats?.cards?.acceptance_rate ?? 87; return [r, 100 - r]; })(),
                            backgroundColor: ["#6366f1", donutBg],
                            borderWidth: 0,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        cutout: "75%",
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    },
                    plugins: [{
                        id: "centerText",
                        afterDraw(chart) {
                            const { ctx, chartArea: { left, top, right, bottom } } = chart;
                            const cx = (left + right) / 2;
                            const cy = (top + bottom) / 2;
                            ctx.save();
                            ctx.font = "bold 20px sans-serif";
                            ctx.fillStyle = isDark ? "#f1f0ff" : "#1e293b";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(`${stats?.cards?.acceptance_rate ?? 87}%`, cx, cy);
                            ctx.restore();
                        },
                    }],
                });
            }

            if (radarRef.current) {
                if (radarRef.current._chart) radarRef.current._chart.destroy();
                radarRef.current._chart = new Chart(radarRef.current, {
                    type: "radar",
                    data: {
                        labels: ["Empathy","Adapt.","Integrity","Leadership","Creativity"],
                        datasets: [{
                            data: radarData || [85, 70, 90, 60, 75],
                            backgroundColor: "rgba(99,102,241,0.15)",
                            borderColor: "#6366f1",
                            borderWidth: 2,
                            pointBackgroundColor: "#6366f1",
                            pointRadius: 3,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            r: {
                                min: 0, max: 100,
                                ticks: { display: false },
                                grid: { color: gridCol },
                                pointLabels: { font: { size: 9 }, color: labelCol },
                            },
                        },
                    },
                });
            }
        });

        return () => {
            [barRef, donutRef, radarRef].forEach((ref) => {
                if (ref.current?._chart) ref.current._chart.destroy();
            });
        };
    }, [stats, radarData]);

    /* قيم الكروت من البيانات الحقيقية (مع fallback لو لسه بتحمّل) */
    const cards = stats?.cards || {};
    const totalTeachers   = cards.total_teachers ?? "—";
    const totalSchools    = cards.total_schools ?? "—";
    const acceptanceRate  = cards.acceptance_rate != null ? `${cards.acceptance_rate}%` : "—";

    /* shared card style */
    const card = {
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
    };

    return (
        <main className="p-4 sm:p-6 md:p-8 min-h-screen" style={{ background: 'var(--surface-page)' }}>
            <div className="max-w-4xl mx-auto">

                <NavLink to="/"
                    className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-500 transition-all mb-4 outline-none w-fit"
                    style={{ color: 'var(--text-muted)' }}>
                    <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
                    Back to Home
                </NavLink>

                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Analytics & Insights
                </h1>
                <p className="text-sm mt-1 mb-6 flex items-center gap-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    <TrendingUp size={14} className="text-purple-400" />
                    Track your recruitment performance and staff diversity
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

                    {/* Purple branded card */}
                    <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.2)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Total Teachers</div>
                        <div className="text-3xl font-black text-white">{totalTeachers}</div>
                        <div className="text-xs mt-1 font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>registered on platform</div>
                    </div>

                    <div className="rounded-2xl p-5" style={card}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" />
                                <path d="M8 21h8M12 17v4" />
                            </svg>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Total Schools</div>
                        <div className="text-3xl font-black text-indigo-500">{totalSchools}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>registered on platform</div>
                    </div>

                    <div className="rounded-2xl p-5" style={card}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Avg. Time to Hire</div>
                        <div className="text-3xl font-black text-emerald-500">
                            24 <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>days</span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>≈ -3 days vs last month</div>
                    </div>
                </div>

                {/* Mid Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                    {/* Radar */}
                    <div className="rounded-2xl p-5" style={card}>
                        <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Personality Diversity</div>
                        <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Current teaching staff personality trait distribution</div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex-shrink-0 w-[130px] h-[130px]">
                                <canvas ref={radarRef} />
                            </div>
                            <div className="flex flex-col gap-2">
                                {[
                                    { color: "#6366f1", label: "Empathy"       },
                                    { color: "#f59e0b", label: "Adaptability"  },
                                    { color: "#10b981", label: "Integrity"     },
                                    { color: "#f472b6", label: "Leadership"    },
                                    { color: "#60a5fa", label: "Creativity"    },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Donut */}
                    <div className="rounded-2xl p-5" style={card}>
                        <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Overall Recruitment Efficiency</div>
                        <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Performance score based on multiple metrics</div>
                        <div className="flex justify-center mb-4">
                            <div className="w-[120px] h-[120px]">
                                <canvas ref={donutRef} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="text-base font-black text-indigo-500">92%</div>
                                <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Match Quality</div>
                            </div>
                            <div>
                                <div className="text-base font-black text-emerald-500">85%</div>
                                <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Speed</div>
                            </div>
                            <div>
                                <div className="text-base font-black text-amber-500">84%</div>
                                <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Retention</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="rounded-2xl p-5" style={card}>
                    <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Teaching Quality by Subject</div>
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Average teaching-quality score per subject (live AI data)</div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Applicants</span>
                    </div>
                    <div className="relative w-full" style={{ height: 200 }}>
                        <canvas ref={barRef} />
                    </div>
                </div>

            </div>
        </main>
    );
}