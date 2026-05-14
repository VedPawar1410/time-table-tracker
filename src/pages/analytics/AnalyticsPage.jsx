import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getHeatmapData } from "../../lib/db.js";
import { useTracker } from "../../hooks/useTracker.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { StatBadge } from "../../components/ui/StatBadge.jsx";
import { TRACKED_TASKS, FONTS } from "../../lib/constants.js";

function YearHeatmap({ heatmap, year }) {
  const weeks = [];
  const startDate = new Date(`${year}-01-01`);
  const startDay = startDate.getDay();

  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dayIdx = w * 7 + d - startDay;
      if (dayIdx < 0 || dayIdx >= 366) { days.push(null); continue; }
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIdx);
      const key = date.toISOString().split("T")[0];
      if (date > new Date()) { days.push({ key, future: true }); continue; }
      const entry = heatmap[key];
      const count = entry?.count || 0;
      days.push({ key, count, total: 10 });
    }
    weeks.push(days);
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const cellColor = (count, total) => {
    if (!count) return "#0D1117";
    const pct = count / total;
    if (pct >= 0.9) return "#22C55E";
    if (pct >= 0.7) return "#4ADE80";
    if (pct >= 0.5) return "#7DD3FC";
    if (pct >= 0.3) return "#FCD34D";
    return "#FCA5A5";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 3, minWidth: 700 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={day?.key ? `${day.key}: ${day.count || 0}/${day.total || 10} done` : ""}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: !day || day.future ? "transparent" : cellColor(day.count, day.total || 10),
                  border: day && !day.future ? `1px solid ${cellColor(day.count, day.total || 10)}44` : "1px solid #1E293B22",
                  opacity: day?.future ? 0.2 : 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
        <span style={{ fontSize: 9, color: "#2D3748", fontFamily: FONTS.mono, marginRight: 4 }}>Less</span>
        {["#0D1117", "#FCA5A5", "#FCD34D", "#7DD3FC", "#4ADE80", "#22C55E"].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c, border: "1px solid #1E293B" }} />
        ))}
        <span style={{ fontSize: 9, color: "#2D3748", fontFamily: FONTS.mono, marginLeft: 4 }}>More</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [heatmap, setHeatmap] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { getStreak, getRate, ensureRange } = useTracker(user?.id);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getHeatmapData(user.id, year).then(setHeatmap).finally(() => setLoading(false));
    ensureRange(`${year}-01-01`, `${year}-12-31`);
  }, [user?.id, year]);

  const totalDaysTracked = Object.values(heatmap).filter(d => d.count > 0).length;
  const bestStreak = Math.max(...TRACKED_TASKS.map(t => getStreak(t.id)), 0);
  const avgCompletion = totalDaysTracked > 0
    ? Math.round(Object.values(heatmap).reduce((sum, d) => sum + (d.count / 10) * 100, 0) / Object.keys(heatmap).length)
    : 0;

  const taskRates = TRACKED_TASKS.map(t => ({ ...t, rate: getRate(t.id), streak: getStreak(t.id) }))
    .sort((a, b) => b.rate - a.rate);

  const now = new Date().getFullYear();

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 900, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="Analytics" icon="📈" subtitle="Trends, heatmap, and task performance." />

      {/* Year nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setYear(y => y - 1)} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 16, cursor: "pointer" }}>‹</button>
        <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: "#94A3B8" }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} disabled={year >= now} style={{ background: "transparent", border: "none", color: year >= now ? "#1E293B" : "#4A5568", fontSize: 16, cursor: year >= now ? "default" : "pointer" }}>›</button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <StatBadge label="Active Days" value={totalDaysTracked} color="#4ADE80" />
        <StatBadge label="Best Streak" value={`${bestStreak}d`} color="#FCD34D" />
        <StatBadge label="Avg Completion" value={`${avgCompletion}%`} color="#7DD3FC" />
      </div>

      {/* Heatmap */}
      <div style={{ padding: "20px", borderRadius: 16, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 24 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#4A5568", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
          {year} Activity Heatmap
        </div>
        {loading ? (
          <div style={{ color: "#2D3748", fontSize: 12, fontFamily: FONTS.mono }}>Loading...</div>
        ) : (
          <YearHeatmap heatmap={heatmap} year={year} />
        )}
      </div>

      {/* Task performance */}
      <div style={{ padding: "20px", borderRadius: 16, background: "#0D1117", border: "1px solid #1E293B" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#4A5568", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
          30-Day Task Performance
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {taskRates.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{task.icon}</span>
              <div style={{ width: 120, fontSize: 12, color: "#94A3B8", flexShrink: 0 }}>{task.label}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#1E293B", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: task.bd, width: `${task.rate}%`, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: task.tx, width: 36, textAlign: "right", flexShrink: 0 }}>{task.rate}%</div>
              {task.streak > 0 && <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#FCD34D", width: 36, flexShrink: 0 }}>🔥{task.streak}d</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
