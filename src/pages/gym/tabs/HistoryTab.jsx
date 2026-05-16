import { FONTS } from "../../../lib/constants.js";
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
      <div style={{ textAlign: "center", padding: 60, color: "#334155", fontFamily: FONTS.mono, fontSize: 12 }}>
        Loading sessions...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(59,130,246,0.15)", borderRadius: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
        <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 18, color: "#F1F5F9", marginBottom: 8 }}>No workouts yet</div>
        <div style={{ color: "#475569", fontSize: 13, fontFamily: FONTS.sans, marginBottom: 24 }}>Log your first session to get started</div>
        <button
          onClick={onStartWorkout}
          style={{ padding: "10px 24px", background: "#3B82F6", border: "none", borderRadius: 10, color: "#fff", fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
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
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
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
