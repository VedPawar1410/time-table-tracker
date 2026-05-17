import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getHeatmapData } from "../../lib/db.js";
import { useTracker } from "../../hooks/useTracker.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { StatBadge } from "../../components/ui/StatBadge.jsx";
import { TRACKED_TASKS, FONTS, THEME } from "../../lib/constants.js";

function cellColor(count, total) {
  if (!count) return THEME.bgAlt;
  const pct = count / total;
  if (pct >= 0.9) return "#6BAD3A";
  if (pct >= 0.7) return THEME.primary;
  if (pct >= 0.5) return "#D69B1F";
  if (pct >= 0.3) return "#F0DAAB";
  return "#FFEDC2";
}

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
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
      if (date > new Date()) { days.push({ key, future: true }); continue; }
      const entry = heatmap[key];
      const count = entry?.count || 0;
      days.push({ key, count, total: 10 });
    }
    weeks.push(days);
  }

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
                  border: `1px solid ${day && !day.future ? cellColor(day.count, day.total || 10) + "66" : THEME.line + "44"}`,
                  opacity: day?.future ? 0.2 : 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
        <span style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: FONTS.mono, marginRight: 4 }}>Less</span>
        {[0, 0.2, 0.45, 0.65, 0.85, 1].map((p, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: cellColor(p * 10, 10) }} />
        ))}
        <span style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: FONTS.mono, marginLeft: 4 }}>More</span>
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
    <div style={{ padding: "24px 20px 40px", maxWidth: 900, margin: "0 auto", fontFamily: FONTS.sans, background: THEME.bg, minHeight: "100vh" }}>
      <PageHeader title="Analytics" icon="📈" subtitle="Trends, heatmap, and task performance." />

      {/* Year nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setYear(y => y - 1)} style={{ background: "transparent", border: "none", color: THEME.inkSoft, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>‹</button>
        <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: THEME.ink }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} disabled={year >= now} style={{ background: "transparent", border: "none", color: year >= now ? THEME.inkFaint : THEME.inkSoft, fontSize: 18, cursor: year >= now ? "default" : "pointer", lineHeight: 1 }}>›</button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <StatBadge label="Active Days" value={totalDaysTracked} color="#6BAD3A" />
        <StatBadge label="Best Streak" value={`${bestStreak}d`} color="#E58A2D" />
        <StatBadge label="Avg Completion" value={`${avgCompletion}%`} color={THEME.primary} />
      </div>

      {/* Heatmap */}
      <div style={{
        padding: "20px", borderRadius: THEME.rMd,
        background: THEME.surface, border: `1px solid ${THEME.line}`,
        boxShadow: THEME.shadowSm, marginBottom: 24,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
          {year} Activity Heatmap
        </div>
        {loading ? (
          <div style={{ color: THEME.inkFaint, fontSize: 12, fontFamily: FONTS.mono }}>Loading...</div>
        ) : (
          <YearHeatmap heatmap={heatmap} year={year} />
        )}
      </div>

      {/* Task performance */}
      <div style={{
        padding: "20px", borderRadius: THEME.rMd,
        background: THEME.surface, border: `1px solid ${THEME.line}`,
        boxShadow: THEME.shadowSm,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
          30-Day Task Performance
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {taskRates.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{task.icon}</span>
              <div style={{ width: 120, fontSize: 12, color: THEME.inkSoft, flexShrink: 0, fontFamily: FONTS.sans }}>{task.label}</div>
              <div style={{ flex: 1, height: 8, borderRadius: THEME.rPill, background: THEME.bgAlt, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: THEME.rPill, background: task.tx, width: `${task.rate}%`, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: task.tx, width: 36, textAlign: "right", flexShrink: 0 }}>{task.rate}%</div>
              {task.streak > 0 && (
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#E58A2D", width: 40, flexShrink: 0 }}>🔥{task.streak}d</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
