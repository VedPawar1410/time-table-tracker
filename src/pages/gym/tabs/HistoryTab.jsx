import { useNavigate } from "react-router-dom";
import { THEME, TASK_PALETTE, F, lighten } from "../../../lib/theme.js";
import Card from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";

const p = TASK_PALETTE.gym;

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

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

function typeInfo(t) {
  if (t === "cardio") return { label: "Cardio", color: TASK_PALETTE.diet.fg, icon: "🏃" };
  if (t === "mixed")  return { label: "Mixed",  color: TASK_PALETTE.hobbies.fg, icon: "⚡" };
  return { label: "Strength", color: p.fg, icon: "💪" };
}

function SessionCard({ session }) {
  const navigate = useNavigate();
  const type = typeInfo(session.workout_type);
  const exercises = session.gym_exercises || [];

  let totalVol = 0, prCount = 0;
  for (const ex of exercises) {
    for (const s of ex.gym_sets || []) {
      if (s.weight_kg && s.reps) totalVol += s.weight_kg * s.reps;
      if (s.is_pr) prCount++;
    }
  }

  const exerciseNames = exercises.map(e => e.exercise_name).filter(Boolean).slice(0, 4);

  return (
    <div
      onClick={() => navigate(`/gym/${session.id}`)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "14px 18px", background: THEME.surface,
        border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rMd,
        boxShadow: THEME.shadowSm, cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = THEME.shadowMd; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = THEME.shadowSm; }}
    >
      {/* Date square */}
      <div style={{
        width: 56, height: 56, flexShrink: 0, borderRadius: THEME.rMd,
        background: lighten(type.color, 0.82),
        border: `1.5px solid ${lighten(type.color, 0.6)}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: type.color, fontWeight: 700, letterSpacing: 0.5 }}>
          {new Date(session.log_date + "T00:00:00").toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: type.color, lineHeight: 1.1 }}>
          {new Date(session.log_date + "T00:00:00").getDate()}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 14 }}>{type.icon}</span>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 15, color: THEME.ink }}>
            {session.workout_name || (session.workout_type === "cardio" ? "Cardio Session" : session.workout_type === "mixed" ? "Mixed Session" : "Strength Session")}
          </span>
        </div>
        <div style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: F.body, marginBottom: 8 }}>{formatDate(session.log_date)}</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {session.duration_min && (
            <span style={{ padding: "2px 8px", borderRadius: 999, background: lighten(TASK_PALETTE.book.fg, 0.82), color: TASK_PALETTE.book.fg, fontSize: 11, fontFamily: F.mono, fontWeight: 700 }}>
              ⏱ {session.duration_min}m
            </span>
          )}
          {totalVol > 0 && (
            <span style={{ padding: "2px 8px", borderRadius: 999, background: lighten(TASK_PALETTE.diet.fg, 0.82), color: TASK_PALETTE.diet.fg, fontSize: 11, fontFamily: F.mono, fontWeight: 700 }}>
              📦 {Math.round(totalVol).toLocaleString()} kg
            </span>
          )}
          {prCount > 0 && (
            <span style={{ padding: "2px 8px", borderRadius: 999, background: lighten(TASK_PALETTE.catprep.fg, 0.82), color: TASK_PALETTE.catprep.fg, fontSize: 11, fontFamily: F.mono, fontWeight: 700 }}>
              🏆 {prCount} PR{prCount > 1 ? "s" : ""}
            </span>
          )}
          {exerciseNames.map(name => (
            <span key={name} style={{ padding: "2px 8px", borderRadius: 999, background: THEME.bg, border: `1px solid ${THEME.line}`, color: THEME.inkSoft, fontSize: 11, fontFamily: F.body }}>
              {name}
            </span>
          ))}
          {exercises.length > 4 && (
            <span style={{ padding: "2px 8px", borderRadius: 999, background: THEME.bg, border: `1px solid ${THEME.line}`, color: THEME.inkFaint, fontSize: 11, fontFamily: F.body }}>
              +{exercises.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div style={{ color: THEME.inkFaint, fontSize: 18, flexShrink: 0, marginTop: 4 }}>›</div>
    </div>
  );
}

export function HistoryTab({ sessions, loading, onStartWorkout }) {
  const groups = groupByMonth(sessions);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: THEME.inkFaint, fontFamily: F.mono, fontSize: 12, letterSpacing: 2 }}>
        LOADING...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card padding={48} style={{ textAlign: "center", border: `2px dashed ${THEME.line}` }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 8 }}>No workouts yet</div>
        <div style={{ color: THEME.inkMuted, fontSize: 14, fontFamily: F.body, marginBottom: 24 }}>Log your first session to get started</div>
        <Button variant="primary" size="md" onClick={onStartWorkout}>Start Workout</Button>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {groups.map(g => (
        <div key={g.label}>
          <div style={{
            fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            color: THEME.inkMuted, textTransform: "uppercase", marginBottom: 10,
          }}>
            {g.label} · {g.sessions.length} session{g.sessions.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {g.sessions.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
