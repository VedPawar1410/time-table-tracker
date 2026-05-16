import { useNavigate } from "react-router-dom";
import { FONTS } from "../../../lib/constants.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function typeLabel(t) {
  if (t === "cardio") return { label: "Cardio", color: "#22C55E", icon: "🏃" };
  if (t === "mixed") return { label: "Mixed", color: "#A78BFA", icon: "⚡" };
  return { label: "Full Body", color: "#3B82F6", icon: "💪" };
}

export function WorkoutCard({ session }) {
  const navigate = useNavigate();
  const type = typeLabel(session.workout_type);
  const exercises = session.gym_exercises || [];

  // Compute total volume and PR count
  let totalVol = 0;
  let prCount = 0;
  for (const ex of exercises) {
    for (const s of ex.gym_sets || []) {
      if (s.weight_kg && s.reps) totalVol += s.weight_kg * s.reps;
      if (s.is_pr) prCount++;
    }
  }

  // Best set per exercise for summary table
  const bestSets = exercises.map(ex => {
    const sets = (ex.gym_sets || []).filter(s => s.weight_kg && s.reps);
    if (sets.length === 0) return { name: ex.exercise_name, best: null };
    const best = sets.reduce((a, b) => (b.weight_kg * b.reps > a.weight_kg * a.reps ? b : a));
    return { name: ex.exercise_name, best };
  });

  return (
    <div
      onClick={() => navigate(`/gym/${session.id}`)}
      style={{
        background: "rgba(15,23,42,0.85)",
        border: "1px solid rgba(59,130,246,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(59,130,246,0.12)"}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{type.icon}</span>
            <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>
              {session.workout_name || (session.workout_type === "cardio" ? "Cardio Session" : session.workout_type === "mixed" ? "Mixed Session" : "Full Body")}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#64748B", fontFamily: FONTS.sans }}>{formatDate(session.log_date)}</div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {session.duration_min && (
            <span style={chipStyle("#1E3A5F", "#60A5FA")}>⏱ {session.duration_min}m</span>
          )}
          {totalVol > 0 && (
            <span style={chipStyle("#0F2D1F", "#4ADE80")}>📦 {Math.round(totalVol).toLocaleString()}kg</span>
          )}
          {prCount > 0 && (
            <span style={chipStyle("#2D1E00", "#F59E0B")}>🏆 {prCount} PR{prCount > 1 ? "s" : ""}</span>
          )}
          {session.overall_feel && (
            <span style={chipStyle("#1E1B4B", "#A78BFA")}>{"⭐".repeat(session.overall_feel)}</span>
          )}
        </div>
      </div>

      {/* Exercise summary */}
      {bestSets.length > 0 && (
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4px 12px", marginBottom: 4 }}>
            <span style={thStyle}>Exercise</span>
            <span style={{ ...thStyle, textAlign: "right" }}>Best Set</span>
          </div>
          {bestSets.slice(0, 5).map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 12px", marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: FONTS.sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.name}
              </span>
              <span style={{ fontSize: 12, color: "#CBD5E1", fontFamily: FONTS.mono, textAlign: "right", whiteSpace: "nowrap" }}>
                {row.best ? `${row.best.weight_kg}kg × ${row.best.reps}` : "—"}
              </span>
            </div>
          ))}
          {bestSets.length > 5 && (
            <div style={{ fontSize: 11, color: "#334155", marginTop: 4, fontFamily: FONTS.sans }}>
              +{bestSets.length - 5} more exercises
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const chipStyle = (bg, tx) => ({
  fontSize: 11,
  fontFamily: FONTS.mono,
  padding: "3px 8px",
  borderRadius: 6,
  background: bg,
  color: tx,
});

const thStyle = {
  fontSize: 10,
  fontFamily: FONTS.mono,
  color: "#334155",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
