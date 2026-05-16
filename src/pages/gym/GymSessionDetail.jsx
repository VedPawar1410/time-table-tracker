import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGymSessionById, deleteGymWorkout } from "../../lib/db.js";
import { FONTS } from "../../lib/constants.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function GymSessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getGymSessionById(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  const handleDelete = async () => {
    if (!confirm("Delete this workout? This cannot be undone.")) return;
    setDeleting(true);
    await deleteGymWorkout(sessionId);
    navigate("/gym");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100%", background: "radial-gradient(ellipse at top, #0D1E3F 0%, #08091A 55%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontFamily: FONTS.mono, fontSize: 12 }}>
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#475569", fontFamily: FONTS.sans }}>
        Session not found. <button onClick={() => navigate("/gym")} style={{ color: "#3B82F6", background: "none", border: "none", cursor: "pointer" }}>Back to Gym</button>
      </div>
    );
  }

  const typeIcon = session.workout_type === "cardio" ? "🏃" : session.workout_type === "mixed" ? "⚡" : "💪";
  const exercises = session.gym_exercises || [];
  let totalVol = 0, prCount = 0;
  for (const ex of exercises) {
    for (const s of ex.gym_sets || []) {
      if (s.weight_kg && s.reps) totalVol += s.weight_kg * s.reps;
      if (s.is_pr) prCount++;
    }
  }

  const cardioMeta = session.metadata || {};

  return (
    <div style={{ minHeight: "100%", background: "radial-gradient(ellipse at top, #0D1E3F 0%, #08091A 55%)", fontFamily: FONTS.sans }}>
      <div style={{ padding: "20px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/gym")}
          style={{ background: "transparent", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: FONTS.sans }}
        >
          ‹ Back to Gym
        </button>

        {/* Session header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 24 }}>{typeIcon}</span>
              <span style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: 22, color: "#F1F5F9" }}>
                {session.workout_type === "cardio" ? "Cardio Session" : session.workout_type === "mixed" ? "Mixed Session" : "Full Body"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#475569", fontFamily: FONTS.sans }}>{formatDate(session.log_date)}</div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: "8px 14px", background: "rgba(45,0,0,0.5)", border: "1px solid #B91C1C44", borderRadius: 8, color: "#FCA5A5", fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {/* Stats chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {session.duration_min && <Chip bg="#1E3A5F" tx="#60A5FA">⏱ {session.duration_min} min</Chip>}
          {session.bodyweight_kg && <Chip bg="#1C2B1C" tx="#4ADE80">⚖️ {session.bodyweight_kg} kg</Chip>}
          {totalVol > 0 && <Chip bg="#1C2B1C" tx="#4ADE80">📦 {Math.round(totalVol).toLocaleString()} kg total</Chip>}
          {prCount > 0 && <Chip bg="#2D1E00" tx="#F59E0B">🏆 {prCount} PR{prCount > 1 ? "s" : ""}</Chip>}
          {session.overall_feel && <Chip bg="#1E1B4B" tx="#A78BFA">{"⭐".repeat(session.overall_feel)}</Chip>}
        </div>

        {/* Cardio details */}
        {session.workout_type === "cardio" && (cardioMeta.distance_km || cardioMeta.avg_hr || cardioMeta.calories) && (
          <div style={{ padding: "14px 16px", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {cardioMeta.cardio_type && <Stat label="Type" value={cardioMeta.cardio_type} />}
            {cardioMeta.distance_km && <Stat label="Distance" value={`${cardioMeta.distance_km} km`} />}
            {cardioMeta.avg_hr && <Stat label="Avg HR" value={`${cardioMeta.avg_hr} bpm`} />}
            {cardioMeta.calories && <Stat label="Calories" value={`${cardioMeta.calories} kcal`} />}
          </div>
        )}

        {/* Warmup notes */}
        {cardioMeta.warmup_notes && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Warmup Notes</div>
            <div style={{ padding: "12px 14px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, color: "#94A3B8", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>
              {cardioMeta.warmup_notes}
            </div>
          </div>
        )}

        {/* Exercises */}
        {exercises.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#3B82F6", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Exercises</div>
            {exercises.map((ex, ei) => (
              <div key={ex.id || ei} style={{ marginBottom: 12, border: "1px solid rgba(59,130,246,0.1)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: "rgba(30,41,59,0.5)", padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#3B82F6", fontSize: 14 }}>{ex.exercise_name}</div>
                    {ex.muscle_group && <div style={{ fontSize: 10, color: "#334155", fontFamily: FONTS.mono, marginTop: 2 }}>{ex.muscle_group}</div>}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#334155" }}>{(ex.gym_sets || []).length} sets</div>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", gap: 8, marginBottom: 6 }}>
                    {["Set", "Reps", "Weight", "RPE"].map(h => (
                      <div key={h} style={{ fontSize: 9, color: "#334155", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
                    ))}
                  </div>
                  {(ex.gym_sets || []).map((set, si) => (
                    <div key={set.id || si} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", gap: 8, marginBottom: 5, alignItems: "center", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#475569", textAlign: "center", background: "rgba(30,41,59,0.4)", borderRadius: 5, padding: "3px 0" }}>{set.set_number}</div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: "#CBD5E1" }}>{set.reps || "—"}</div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: set.is_pr ? "#F59E0B" : "#CBD5E1", display: "flex", alignItems: "center", gap: 4 }}>
                        {set.weight_kg ? `${set.weight_kg}kg` : "—"}{set.is_pr ? " 🏆" : ""}
                      </div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: "#475569" }}>{set.rpe || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post-workout journal — prominent section */}
        {session.notes && (
          <div style={{ padding: "18px 18px", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, borderLeft: "3px solid #3B82F6" }}>
            <div style={{ fontSize: 10, color: "#3B82F6", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Post-Workout Journal</div>
            <div style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, fontFamily: FONTS.sans }}>
              {session.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ bg, tx, children }) {
  return (
    <span style={{ fontSize: 12, fontFamily: FONTS.mono, padding: "5px 12px", borderRadius: 20, background: bg, color: tx }}>
      {children}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#475569", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: "#22C55E", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
