import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGymSessionById, deleteGymWorkout } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FONTS } from "../../lib/constants.js";

export default function GymSessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGymSessionById(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  const handleDelete = async () => {
    if (!confirm("Delete this workout?")) return;
    await deleteGymWorkout(sessionId);
    navigate("/gym");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#4A5568", fontFamily: FONTS.mono, fontSize: 12 }}>Loading...</div>;
  if (!session) return <div style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>Session not found.</div>;

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <button onClick={() => navigate("/gym")} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ‹ Back to Gym
      </button>

      <PageHeader
        title={`${session.workout_type.charAt(0).toUpperCase() + session.workout_type.slice(1)} Session`}
        icon={session.workout_type === "cardio" ? "🏃" : session.workout_type === "mixed" ? "⚡" : "💪"}
        subtitle={session.log_date}
        action={<Button variant="danger" small onClick={handleDelete}>Delete</Button>}
      />

      {/* Meta chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {session.duration_min && (
          <span style={{ padding: "6px 14px", borderRadius: 20, background: "#1C1200", border: "1px solid #B4530944", color: "#FCD34D", fontSize: 12, fontFamily: FONTS.mono }}>
            ⏱ {session.duration_min} min
          </span>
        )}
        {session.bodyweight_kg && (
          <span style={{ padding: "6px 14px", borderRadius: 20, background: "#0D1117", border: "1px solid #1E293B", color: "#94A3B8", fontSize: 12, fontFamily: FONTS.mono }}>
            ⚖️ {session.bodyweight_kg} kg
          </span>
        )}
        {session.overall_feel && (
          <span style={{ padding: "6px 14px", borderRadius: 20, background: "#0D1117", border: "1px solid #1E293B", color: "#94A3B8", fontSize: 12 }}>
            {"⭐".repeat(session.overall_feel)}
          </span>
        )}
      </div>

      {session.notes && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 20, color: "#94A3B8", fontSize: 13, lineHeight: 1.6 }}>
          {session.notes}
        </div>
      )}

      {/* Exercises */}
      {(session.gym_exercises || []).map((ex, ei) => (
        <div key={ex.id || ei} style={{ marginBottom: 16, border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ background: "#111827", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, color: "#E2E8F0", fontSize: 15 }}>{ex.exercise_name}</div>
              {ex.muscle_group && <div style={{ fontSize: 11, color: "#4A5568", fontFamily: FONTS.mono, marginTop: 2 }}>{ex.muscle_group}</div>}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748" }}>
              {(ex.gym_sets || []).length} sets
            </div>
          </div>

          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr", gap: 8, marginBottom: 6 }}>
              {["SET", "REPS", "WEIGHT", "RPE"].map(h => (
                <div key={h} style={{ fontSize: 9, color: "#2D3748", fontFamily: FONTS.mono, letterSpacing: 0.5 }}>{h}</div>
              ))}
            </div>
            {(ex.gym_sets || []).map((set, si) => (
              <div key={set.id || si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748" }}>{set.set_number}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: "#E2E8F0" }}>{set.reps || "—"}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: set.is_pr ? "#FCD34D" : "#E2E8F0" }}>
                  {set.weight_kg ? `${set.weight_kg} kg` : "—"}{set.is_pr ? " 🏆" : ""}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: "#4A5568" }}>{set.rpe || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
