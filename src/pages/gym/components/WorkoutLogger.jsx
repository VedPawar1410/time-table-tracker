import { useState } from "react";
import { createPortal } from "react-dom";
import { FONTS, THEME, MUSCLE_GROUPS } from "../../../lib/constants.js";
import { CalendarPicker } from "../../../components/ui/CalendarPicker.jsx";
import { createGymWorkout, upsertExerciseInLibrary, updateExercisePR, upsertLog } from "../../../lib/db.js";
import { ExerciseBlock } from "./ExerciseBlock.jsx";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function detectPR(exerciseName, weightKg, reps, library) {
  const lib = library.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  if (!lib || !lib.pr_weight_kg) return false;
  const newVol = weightKg * reps;
  const oldVol = lib.pr_weight_kg * (lib.pr_reps || 1);
  return newVol > oldVol || weightKg > lib.pr_weight_kg;
}

function getGymSettings() {
  try { return JSON.parse(localStorage.getItem("gym_settings") || "{}"); } catch { return {}; }
}

export function WorkoutLogger({ open, onClose, library, onSaved, userId }) {
  const settings = getGymSettings();
  const weightUnit = settings.weightUnit || "kg";
  const restDefault = settings.restDefault || "1:30";

  const [workoutType, setWorkoutType] = useState("weights");
  const [date, setDate] = useState(todayKey());
  const [duration, setDuration] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [feel, setFeel] = useState(0);
  const [warmupNotes, setWarmupNotes] = useState("");
  const [postNotes, setPostNotes] = useState("");
  const [exercises, setExercises] = useState([{ name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
  const [cardioData, setCardioData] = useState({ distance: "", avg_hr: "", calories: "", cardio_type: "Running" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateExercise = (i, ex) => setExercises(exs => exs.map((e, idx) => idx === i ? ex : e));
  const addExercise = () => setExercises(exs => [...exs, { name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
  const removeExercise = (i) => setExercises(exs => exs.filter((_, idx) => idx !== i));

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const meta = {
        log_date: date,
        workout_type: workoutType,
        duration_min: duration ? parseInt(duration) : null,
        bodyweight_kg: bodyweight ? parseFloat(bodyweight) : null,
        overall_feel: feel || null,
        notes: postNotes || null,
        metadata: {
          warmup_notes: warmupNotes || null,
          ...(workoutType === "cardio" ? {
            distance_km: cardioData.distance ? parseFloat(cardioData.distance) : null,
            avg_hr: cardioData.avg_hr ? parseInt(cardioData.avg_hr) : null,
            calories: cardioData.calories ? parseInt(cardioData.calories) : null,
            cardio_type: cardioData.cardio_type,
          } : {}),
        },
        exercises: workoutType !== "cardio"
          ? exercises.filter(e => e.name.trim()).map(e => ({
              exercise_name: e.name.trim(),
              muscle_group: e.muscle_group,
              sets: e.sets.filter(s => s.reps || s.weight_kg).map((s, si) => ({
                set_number: si + 1,
                reps: s.reps ? parseInt(s.reps) : null,
                weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
                rpe: s.rpe ? parseFloat(s.rpe) : null,
                is_pr: s.weight_kg && s.reps ? detectPR(e.name, parseFloat(s.weight_kg), parseInt(s.reps), library) : false,
              })),
            }))
          : [],
      };

      await createGymWorkout(userId, meta);

      for (const ex of exercises.filter(e => e.name.trim() && workoutType !== "cardio")) {
        await upsertExerciseInLibrary(userId, ex.name.trim(), ex.muscle_group).catch(() => {});
        const bestSet = ex.sets.reduce((best, s) => {
          if (!s.weight_kg || !s.reps) return best;
          const vol = parseFloat(s.weight_kg) * parseInt(s.reps);
          return vol > best.vol ? { vol, weight_kg: parseFloat(s.weight_kg), reps: parseInt(s.reps) } : best;
        }, { vol: 0, weight_kg: 0, reps: 0 });
        if (bestSet.weight_kg && detectPR(ex.name, bestSet.weight_kg, bestSet.reps, library)) {
          await updateExercisePR(userId, ex.name.trim(), { weight_kg: bestSet.weight_kg, reps: bestSet.reps, date }).catch(() => {});
        }
      }

      await upsertLog(userId, date, "gym", { done: true, duration_min: duration ? parseInt(duration) : null, notes: postNotes || null }).catch(() => {});

      onSaved();
      handleClose();
    } catch (e) {
      setError(e.message || "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setWorkoutType("weights"); setDate(todayKey()); setDuration(""); setBodyweight("");
    setFeel(0); setWarmupNotes(""); setPostNotes("");
    setExercises([{ name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
    setCardioData({ distance: "", avg_hr: "", calories: "", cardio_type: "Running" });
    setError("");
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(43,30,24,0.5)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", background: THEME.surface,
        borderBottom: `1px solid ${THEME.line}`, flexShrink: 0,
        boxShadow: THEME.shadowSm,
      }}>
        <button onClick={handleClose} style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, borderRadius: THEME.rSm, color: THEME.inkSoft, fontFamily: FONTS.sans, fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>✕ Cancel</button>
        <span style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 15, color: THEME.ink }}>Log Workout</span>
        <button
          onClick={handleFinish}
          disabled={saving}
          style={{ background: "#E8623A", border: "none", borderRadius: THEME.rSm, color: "#fff", fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 13, padding: "8px 18px", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: THEME.shadowSm }}
        >
          {saving ? "Saving..." : "Finish 💪"}
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px", maxWidth: 680, margin: "0 auto", width: "100%", background: THEME.bg }}>
        {error && (
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "#FFD6DF", border: "1px solid #F5BEC9", borderRadius: THEME.rSm, color: "#D6395B", fontSize: 13, fontFamily: FONTS.sans }}>{error}</div>
        )}

        {/* Type pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["weights", "💪 Weights"], ["cardio", "🏃 Cardio"], ["mixed", "⚡ Mixed"]].map(([val, label]) => (
              <button key={val} onClick={() => setWorkoutType(val)} style={{
                padding: "7px 13px", borderRadius: THEME.rPill, fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer",
                border: `1px solid ${workoutType === val ? "#E8623A" : THEME.line}`,
                background: workoutType === val ? "#FFDDD0" : THEME.surfaceAlt,
                color: workoutType === val ? "#E8623A" : THEME.inkSoft,
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <CalendarPicker label="Date" value={date} onChange={v => setDate(v)} />
          <Field label="Duration (min)"><input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" style={inputStyle()} /></Field>
          <Field label={`Bodyweight (${weightUnit})`}><input type="number" value={bodyweight} onChange={e => setBodyweight(e.target.value)} placeholder="70" style={inputStyle()} /></Field>
          <Field label="How did it feel?">
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setFeel(n)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", opacity: n <= feel ? 1 : 0.25, padding: "4px 2px" }}>⭐</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Warmup notes */}
        <Field label="Warmup / Session Notes" style={{ marginBottom: 20 }}>
          <textarea
            value={warmupNotes}
            onChange={e => setWarmupNotes(e.target.value)}
            placeholder="Warmup routine, session focus, energy level..."
            rows={2}
            style={{ ...inputStyle(), resize: "vertical" }}
          />
        </Field>

        {/* Cardio-specific fields */}
        {workoutType === "cardio" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#E8623A", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Cardio Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Type">
                <select value={cardioData.cardio_type} onChange={e => setCardioData(d => ({ ...d, cardio_type: e.target.value }))} style={inputStyle()}>
                  {["Running", "Cycling", "Swimming", "HIIT", "Stairmaster", "Elliptical", "Jump Rope", "Other"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Distance (km)"><input type="number" value={cardioData.distance} onChange={e => setCardioData(d => ({ ...d, distance: e.target.value }))} placeholder="5.0" style={inputStyle()} /></Field>
              <Field label="Avg Heart Rate"><input type="number" value={cardioData.avg_hr} onChange={e => setCardioData(d => ({ ...d, avg_hr: e.target.value }))} placeholder="145" style={inputStyle()} /></Field>
              <Field label="Calories"><input type="number" value={cardioData.calories} onChange={e => setCardioData(d => ({ ...d, calories: e.target.value }))} placeholder="400" style={inputStyle()} /></Field>
            </div>
          </div>
        )}

        {/* Exercises section */}
        {workoutType !== "cardio" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#E8623A", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Exercises</div>
            {exercises.map((ex, i) => (
              <ExerciseBlock
                key={i}
                exercise={ex}
                index={i}
                library={library}
                userId={userId}
                onChange={ex => updateExercise(i, ex)}
                onRemove={() => removeExercise(i)}
                restLabel={restDefault}
                weightUnit={weightUnit}
              />
            ))}
            <button
              onClick={addExercise}
              style={{
                width: "100%", padding: "12px", background: "#FFDDD0",
                border: "1px dashed #F5C4B5", borderRadius: THEME.rMd,
                color: "#E8623A", fontFamily: FONTS.sans, fontSize: 14, cursor: "pointer",
              }}
            >+ Add Exercise</button>
          </div>
        )}

        {/* Post-workout journal */}
        <div style={{ borderTop: `1px solid ${THEME.line}`, paddingTop: 20 }}>
          <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Post-Workout Journal</div>
          <textarea
            value={postNotes}
            onChange={e => setPostNotes(e.target.value)}
            placeholder="How did it feel? What went well? What to improve next time..."
            rows={4}
            style={{ ...inputStyle(), resize: "vertical" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(extra = {}) {
  return {
    background: THEME.surface,
    border: `1.5px solid ${THEME.line}`,
    borderRadius: THEME.rSm,
    padding: "8px 10px",
    color: THEME.ink,
    fontSize: 13,
    fontFamily: FONTS.sans,
    outline: "none",
    width: "100%",
    ...extra,
  };
}
