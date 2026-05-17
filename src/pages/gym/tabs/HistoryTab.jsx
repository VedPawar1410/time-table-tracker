import { FONTS, THEME } from "../../../lib/constants.js";
import { WorkoutCard } from "../components/WorkoutCard.jsx";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function groupByMonth(sessions) {
  const groups = {};
  for (const s of sessions) {
    const [year, month] = s.log_date.split("-");
    const key = `${year}-${month}`;
    if (!groups[key]) groups[key] = { label: `${MONTH_NAMES[parseInt(month) - 1]} ${year}`, sessions: [] };
    groups[key].sessions.push(s);
  }
  return Object.values(groups);
}

export function HistoryTab({ sessions, loading, onStartWorkout }) {
  const groups = groupByMonth(sessions);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: THEME.inkFaint, fontFamily: FONTS.mono, fontSize: 12 }}>
        Loading sessions...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 20px",
        border: `2px dashed ${THEME.line}`, borderRadius: THEME.rLg,
        background: THEME.surfaceAlt,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
        <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 18, color: THEME.ink, marginBottom: 8 }}>No workouts yet</div>
        <div style={{ color: THEME.inkMuted, fontSize: 13, fontFamily: FONTS.sans, marginBottom: 24 }}>Log your first session to get started</div>
        <button
          onClick={onStartWorkout}
          style={{
            padding: "10px 24px", background: "#E8623A", border: "none",
            borderRadius: THEME.rMd, color: "#fff",
            fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 3px 0 #c44e2a",
          }}
        >
          Start Workout
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {groups.map(group => (
        <div key={group.label}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 9.5, color: THEME.inkFaint, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
            {group.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {group.sessions.map(s => <WorkoutCard key={s.id} session={s} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
