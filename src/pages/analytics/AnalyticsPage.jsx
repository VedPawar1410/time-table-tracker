import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getHeatmapData } from "../../lib/db.js";
import { useTracker } from "../../hooks/useTracker.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TRACKED_TASKS } from "../../lib/constants.js";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import Card from "../../components/ui/Card.jsx";
import StatTile from "../../components/ui/StatTile.jsx";

function cellColor(count, total) {
  if (!count) return THEME.bg;
  const pct = count / total;
  if (pct >= 0.9) return TASK_PALETTE.diet.fg;
  if (pct >= 0.7) return TASK_PALETTE.diet.edge;
  if (pct >= 0.5) return TASK_PALETTE.catprep.edge;
  if (pct >= 0.3) return TASK_PALETTE.catprep.bg;
  return lighten(TASK_PALETTE.catprep.fg, 0.9);
}

function YearHeatmap({ heatmap, year }) {
  const weeks = [];
  const startDate = new Date(`${year}-01-01`);
  const startDay = startDate.getDay();
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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

  // Month label positions
  const monthLabels = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const dayOfYear = Math.floor((d - new Date(year, 0, 1)) / 86400000);
    const weekIdx = Math.floor((dayOfYear + startDay) / 7);
    if (weekIdx < 53) monthLabels.push({ month: MONTHS[m], weekIdx });
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Month labels */}
      <div style={{ display: "flex", gap: 3, minWidth: 700, marginBottom: 4, paddingLeft: 20 }}>
        {weeks.map((_, wi) => {
          const label = monthLabels.find(m => m.weekIdx === wi);
          return (
            <div key={wi} style={{ width: 11, flexShrink: 0, fontSize: 8, fontFamily: F.mono, color: THEME.inkFaint, whiteSpace: "nowrap" }}>
              {label?.month || ""}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 4 }}>
          {["","M","","W","","F",""].map((d, i) => (
            <div key={i} style={{ height: 11, fontSize: 7, fontFamily: F.mono, color: THEME.inkFaint, lineHeight: "11px" }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: "flex", gap: 3, minWidth: 660 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day?.key ? `${day.key}: ${day.count || 0}/${day.total || 10} done` : ""}
                  style={{
                    width: 11, height: 11, borderRadius: 2, flexShrink: 0,
                    background: !day || day.future ? "transparent" : cellColor(day.count, day.total || 10),
                    border: `1px solid ${day && !day.future ? "transparent" : THEME.line + "22"}`,
                    opacity: day?.future ? 0.15 : 1,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, paddingLeft: 24 }}>
        <span style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: F.mono, marginRight: 4 }}>Less</span>
        {[0, 0.2, 0.45, 0.65, 0.85, 1].map((p, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: cellColor(p * 10, 10) }} />
        ))}
        <span style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: F.mono, marginLeft: 4 }}>More</span>
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

  const taskRates = TRACKED_TASKS.map(t => {
    const tp = TASK_PALETTE[t.id];
    return { ...t, rate: getRate(t.id), streak: getStreak(t.id), palette: tp };
  }).sort((a, b) => b.rate - a.rate);

  const now = new Date().getFullYear();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        kicker="ANALYTICS"
        title="Your Year"
        subtitle="Streaks, heatmap, and 30-day task performance"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setYear(y => y - 1)}
              style={{ background: THEME.surface, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rMd, color: THEME.inkSoft, fontSize: 16, padding: "6px 12px", cursor: "pointer", fontFamily: F.display, fontWeight: 700, boxShadow: THEME.shadowSm }}
            >‹</button>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 700, color: THEME.ink, minWidth: 40, textAlign: "center" }}>{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              disabled={year >= now}
              style={{ background: THEME.surface, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rMd, color: year >= now ? THEME.inkFaint : THEME.inkSoft, fontSize: 16, padding: "6px 12px", cursor: year >= now ? "default" : "pointer", fontFamily: F.display, fontWeight: 700, boxShadow: THEME.shadowSm, opacity: year >= now ? 0.5 : 1 }}
            >›</button>
          </div>
        }
      />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <StatTile label="Active Days" value={totalDaysTracked} sublabel={`in ${year}`} color={TASK_PALETTE.diet.fg} />
        <StatTile label="Best Streak" value={`${bestStreak}d`} sublabel="consecutive" color={TASK_PALETTE.sidehustle.fg} />
        <StatTile label="Avg Completion" value={`${avgCompletion}%`} sublabel="per tracked day" color={THEME.primary} />
      </div>

      {/* Heatmap */}
      <Card padding={24} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 16, color: THEME.ink }}>
            {year} Activity
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
            {totalDaysTracked} active days
          </div>
        </div>
        {loading ? (
          <div style={{ color: THEME.inkFaint, fontSize: 12, fontFamily: F.mono, letterSpacing: 2 }}>LOADING...</div>
        ) : (
          <YearHeatmap heatmap={heatmap} year={year} />
        )}
      </Card>

      {/* Task performance */}
      <Card padding={24}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 16, color: THEME.ink, marginBottom: 18 }}>
          30-Day Task Performance
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {taskRates.map(task => {
            const tp = task.palette || TASK_PALETTE.routine;
            return (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: lighten(tp.fg, 0.82), border: `1.5px solid ${lighten(tp.fg, 0.65)}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>
                  {tp.emoji || task.icon}
                </div>
                <div style={{ width: 110, fontFamily: F.display, fontWeight: 700, fontSize: 12.5, color: THEME.inkSoft, flexShrink: 0 }}>
                  {tp.label || task.label}
                </div>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: THEME.bg, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    background: tp.fg,
                    width: `${task.rate}%`,
                    transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: tp.fg, width: 36, textAlign: "right", flexShrink: 0 }}>
                  {task.rate}%
                </div>
                {task.streak > 0 && (
                  <div style={{ fontFamily: F.mono, fontSize: 10, color: TASK_PALETTE.sidehustle.fg, width: 42, flexShrink: 0 }}>
                    🔥{task.streak}d
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
