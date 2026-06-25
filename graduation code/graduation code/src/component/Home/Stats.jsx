import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:3000";

// Skeleton واحد للـ loading
function StatSkeleton() {
  return (
    <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl animate-pulse">
      <div className="h-5 w-12 bg-white/40 rounded mb-1" />
      <div className="h-3 w-10 bg-white/30 rounded" />
    </div>
  );
}

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/home/stats`);
        const json = await res.json();
        if (json?.data) setStats(json.data);
      } catch {
        // non-fatal — fallback values تتعرض
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // fallback لو الـ API فشل
  const items = stats
    ? [
        { value: `${stats.active_jobs ?? stats.total_jobs ?? 500}+`, label: "Jobs"     },
        { value: `${stats.total_teachers ?? 1200}+`,                 label: "Teachers" },
        { value: `${stats.match_rate ?? 95}%`,                       label: "Success"  },
      ]
    : [
        { value: "500+",  label: "Jobs"     },
        { value: "1200+", label: "Teachers" },
        { value: "95%",   label: "Success"  },
      ];

  if (loading) {
    return (
      <div className="flex gap-3 sm:gap-4 flex-wrap">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 flex-wrap">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl"
        >
          <h2 className="font-bold text-lg sm:text-xl">{item.value}</h2>
          <p className="text-xs sm:text-sm text-white/80">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default Stats;