import { useNavigate } from "react-router-dom";
import { FONTS, THEME } from "../../../lib/constants.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function typeLabel(t) {
  if (t === "cardio") return { label: "Cardio", color: "#6BAD3A", icon: "🏃" };
  if (t === "mixed")  return { label: "Mixed",  color: "#8C6BD9", icon: "⚡" };
  return { label: "Full Body", color: "#E8623A", icon: "💪" };
}

const chipStyle = (bg, tx) => ({
  fontSize: 11,
  fontFamily: FONTS.mono,
  padding: "3px 9px",
  borderRadius: THEME.rPill,
  background: bg,
  color: tx,
});

const thStyle = {
  fontSize: 9.5,
  fontFamily: FONTS.mono,
  color: THEME.inkFaint,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

export function WorkoutCard({ session }) {
  const navigate = useNavigate();
  const type = typeLabel(session.workout_type);
  const exercises = session.gym_exercises || [];

  let totalVol = 0, prCount = 0;
  for (const ex of exercises) {
    for (const s of ex.gym_sets || []) {
      if (s.weight_kg && s.reps) totalVol += s.weight_kg * s.reps;
      if (s.is_pr) prCount++;
    }
  }

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
        background: THEME.surface,
        border: `1px solid ${THEME.line}`,
        borderRadius: THEME.rMd,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: THEME.shadowSm,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#E8623A55"; e.currentTarget.style.boxShadow = THEME.shadowMd; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.line; e.currentTarget.style.boxShadow = THEME.shadowSm; }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${THEME.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{type.icon}</span>
            <span style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 15, color: THEME.ink }}>
              {session.workout_name || (session.workout_type === "cardio" ? "Cardio Session" : session.workout_type === "mixed" ? "Mixed Session" : "Full Body")}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: FONTS.sans }}>{formatDate(session.log_date)}</div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {session.duration_min && (
            <span style={chipStyle("#D9E4FB", "#5A7CC4")}>⏱ {session.duration_min}m</span>
          )}
          {totalVol > 0 && (
            <span style={chipStyle("#DCEFC8", "#6BAD3A")}>📦 {Math.round(totalVol).toLocaleString()}kg</span>
          )}
          {prCount > 0 && (
            <span style={chipStyle("#FFEDC2", "#D69B1F")}>🏆 {prCount} PR{prCount > 1 ? "s" : ""}</span>
          )}
          {session.overall_feel && (
            <span style={chipStyle("#E6DCFF", "#8C6BD9")}>{"⭐".repeat(session.overall_feel)}</span>
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
              <span style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: FONTS.sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.name}
              </span>
              <span style={{ fontSize: 12, color: THEME.ink, fontFamily: FONTS.mono, textAlign: "right", whiteSpace: "nowrap" }}>
                {row.best ? `${row.best.weight_kg}kg × ${row.best.reps}` : "—"}
              </span>
            </div>
          ))}
          {bestSets.length > 5 && (
            <div style={{ fontSize: 11, color: THEME.inkFaint, marginTop: 4, fontFamily: FONTS.sans }}>
              +{bestSets.length - 5} more exercises
            </div>
          )}
        </div>
      )}
    </div>
  );
}
