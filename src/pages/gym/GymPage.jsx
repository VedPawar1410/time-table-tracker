import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getGymSessions, createGymWorkout, getExerciseLibrary, upsertExerciseInLibrary, updateExercisePR, upsertLog } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { TextArea } from "../../components/ui/TextArea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { GlassCard } from "../../components/ui/GlassCard.jsx";
import { FONTS, MUSCLE_GROUPS, DEFAULT_EXERCISES } from "../../lib/constants.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

function detectPR(exerciseName, weightKg, reps, library) {
  const lib = library.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  if (!lib || !lib.pr_weight_kg) return true;
  const newVol = weightKg * reps;
  const oldVol = lib.pr_weight_kg * (lib.pr_reps || 1);
  return newVol > oldVol || weightKg > lib.pr_weight_kg;
}

function ExerciseBlock({ exercise, index, library, onChange, onRemove }) {
  const { name, muscle_group, sets } = exercise;

  const updateSet = (si, field, val) => {
    const newSets = sets.map((s, i) => i === si ? { ...s, [field]: val } : s);
    onChange({ ...exercise, sets: newSets });
  };
  const addSet = () => onChange({ ...exercise, sets: [...sets, { reps: "", weight_kg: "", rpe: "" }] });
  const removeSet = (si) => onChange({ ...exercise, sets: sets.filter((_, i) => i !== si) });

  const suggestions = name.length >= 2
    ? [...new Set([
        ...library.filter(e => e.name.toLowerCase().includes(name.toLowerCase())).map(e => e.name),
        ...(Object.values(DEFAULT_EXERCISES).flat().filter(e => e.toLowerCase().includes(name.toLowerCase()))),
      ])].slice(0, 6)
    : [];

  return (
    <div style={{ border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ background: "#111827", padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Input
            label="Exercise"
            value={name}
            onChange={v => onChange({ ...exercise, name: v })}
            placeholder="e.g. Bench Press"
          />
          {suggestions.length > 0 && name.length >= 2 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0D1117", border: "1px solid #1E293B", borderRadius: 8, zIndex: 10, marginTop: 2 }}>
              {suggestions.map(s => (
                <div key={s} onClick={() => {
                  const lib = library.find(e => e.name === s);
                  onChange({ ...exercise, name: s, muscle_group: lib?.muscle_group || muscle_group });
                }} style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#94A3B8", borderBottom: "1px solid #1E293B22" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: 130, flexShrink: 0 }}>
          <Select label="Muscle Group" value={muscle_group} onChange={v => onChange({ ...exercise, muscle_group: v })}
            options={MUSCLE_GROUPS.map(m => ({ value: m, label: m }))} />
        </div>
        <button onClick={onRemove} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0 }}>✕</button>
      </div>

      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 24px", gap: 6, marginBottom: 6 }}>
          {["#", "REPS", "KG", "RPE", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 9, color: "#2D3748", fontFamily: FONTS.mono, textAlign: i === 0 || i === 4 ? "center" : "left", letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>
        {sets.map((set, si) => {
          const isPR = set.weight_kg && set.reps ? detectPR(name, parseFloat(set.weight_kg), parseInt(set.reps), library) : false;
          return (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 24px", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <div style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748" }}>{si + 1}</div>
              <input value={set.reps || ""} onChange={e => updateSet(si, "reps", e.target.value)} type="number" placeholder="8"
                style={{ background: "#08091A", border: "1px solid #1E293B", borderRadius: 6, padding: "6px 8px", color: "#E2E8F0", fontSize: 13, fontFamily: FONTS.sans, outline: "none", width: "100%" }} />
              <div style={{ position: "relative" }}>
                <input value={set.weight_kg || ""} onChange={e => updateSet(si, "weight_kg", e.target.value)} type="number" placeholder="60"
                  style={{ background: "#08091A", border: `1px solid ${isPR ? "#FCD34D66" : "#1E293B"}`, borderRadius: 6, padding: "6px 8px", color: "#E2E8F0", fontSize: 13, fontFamily: FONTS.sans, outline: "none", width: "100%" }} />
                {isPR && <span style={{ position: "absolute", right: -2, top: -6, fontSize: 10 }}>🏆</span>}
              </div>
              <input value={set.rpe || ""} onChange={e => updateSet(si, "rpe", e.target.value)} type="number" placeholder="7" min="1" max="10"
                style={{ background: "#08091A", border: "1px solid #1E293B", borderRadius: 6, padding: "6px 8px", color: "#E2E8F0", fontSize: 13, fontFamily: FONTS.sans, outline: "none", width: "100%" }} />
              <button onClick={() => removeSet(si)} style={{ background: "transparent", border: "none", color: "#2D3748", fontSize: 14, cursor: "pointer", textAlign: "center" }}>—</button>
            </div>
          );
        })}
        <Button variant="ghost" small onClick={addSet} style={{ marginTop: 4 }}>+ Add Set</Button>
      </div>
    </div>
  );
}

function NewSessionModal({ open, onClose, library, onSaved, userId }) {
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState({ log_date: todayKey(), workout_type: "weights", duration_min: "", bodyweight_kg: "", overall_feel: "", notes: "" });
  const [exercises, setExercises] = useState([{ name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
  const [saving, setSaving] = useState(false);

  const updateMeta = (k, v) => setMeta(m => ({ ...m, [k]: v }));
  const updateExercise = (i, ex) => setExercises(exs => exs.map((e, idx) => idx === i ? ex : e));
  const addExercise = () => setExercises(exs => [...exs, { name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
  const removeExercise = (i) => setExercises(exs => exs.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = todayKey();
      await createGymWorkout(userId, {
        log_date: meta.log_date,
        workout_type: meta.workout_type,
        duration_min: meta.duration_min ? parseInt(meta.duration_min) : null,
        bodyweight_kg: meta.bodyweight_kg ? parseFloat(meta.bodyweight_kg) : null,
        overall_feel: meta.overall_feel ? parseInt(meta.overall_feel) : null,
        notes: meta.notes || null,
        exercises: exercises.filter(e => e.name.trim()).map(e => ({
          exercise_name: e.name.trim(),
          muscle_group: e.muscle_group,
          sets: e.sets.filter(s => s.reps || s.weight_kg).map(s => ({
            reps: s.reps ? parseInt(s.reps) : null,
            weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
            rpe: s.rpe ? parseFloat(s.rpe) : null,
            is_pr: s.weight_kg && s.reps ? detectPR(e.name, parseFloat(s.weight_kg), parseInt(s.reps), library) : false,
          })),
        })),
      });

      // Upsert exercise library + PRs
      for (const ex of exercises.filter(e => e.name.trim())) {
        await upsertExerciseInLibrary(userId, ex.name.trim(), ex.muscle_group).catch(() => {});
        const prSet = ex.sets.reduce((best, s) => {
          if (!s.weight_kg || !s.reps) return best;
          const vol = parseFloat(s.weight_kg) * parseInt(s.reps);
          return vol > best.vol ? { vol, weight_kg: parseFloat(s.weight_kg), reps: parseInt(s.reps) } : best;
        }, { vol: 0, weight_kg: 0, reps: 0 });
        if (prSet.weight_kg && detectPR(ex.name, prSet.weight_kg, prSet.reps, library)) {
          await updateExercisePR(userId, ex.name.trim(), { weight_kg: prSet.weight_kg, reps: prSet.reps, date: meta.log_date }).catch(() => {});
        }
      }

      // Sync daily log
      await upsertLog(userId, meta.log_date, "gym", {
        done: true,
        duration_min: meta.duration_min ? parseInt(meta.duration_min) : null,
        notes: meta.notes || null,
      }).catch(() => {});

      onSaved();
      onClose();
      setStep(1);
      setMeta({ log_date: todayKey(), workout_type: "weights", duration_min: "", bodyweight_kg: "", overall_feel: "", notes: "" });
      setExercises([{ name: "", muscle_group: "Chest", sets: [{ reps: "", weight_kg: "", rpe: "" }] }]);
    } finally {
      setSaving(false);
    }
  };

  const pillBtn = (val, current, label) => (
    <button key={val} onClick={() => updateMeta("workout_type", val)} style={{
      padding: "8px 16px", borderRadius: 8, border: `1px solid ${current === val ? "#B45309" : "#1E293B"}`,
      background: current === val ? "#1C1200" : "transparent",
      color: current === val ? "#FCD34D" : "#4A5568",
      fontFamily: FONTS.sans, fontSize: 13, cursor: "pointer",
    }}>{label}</button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Log Workout" maxWidth={640}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["Workout Info", "Exercises"].map((s, i) => (
          <div key={i} onClick={() => setStep(i + 1)} style={{
            flex: 1, padding: "8px", borderRadius: 8, textAlign: "center", cursor: "pointer",
            background: step === i + 1 ? "#1C1200" : "#08091A",
            border: `1px solid ${step === i + 1 ? "#B45309" : "#1E293B"}`,
            color: step === i + 1 ? "#FCD34D" : "#4A5568",
            fontSize: 12, fontFamily: FONTS.sans,
          }}>{s}</div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Type</div>
            <div style={{ display: "flex", gap: 8 }}>
              {pillBtn("weights", meta.workout_type, "💪 Weights")}
              {pillBtn("cardio", meta.workout_type, "🏃 Cardio")}
              {pillBtn("mixed", meta.workout_type, "⚡ Mixed")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Date" type="date" value={meta.log_date} onChange={v => updateMeta("log_date", v)} />
            <Input label="Duration (min)" type="number" value={meta.duration_min} onChange={v => updateMeta("duration_min", v)} placeholder="60" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Bodyweight (kg)" type="number" value={meta.bodyweight_kg} onChange={v => updateMeta("bodyweight_kg", v)} placeholder="70" />
            <Select label="How did it feel?" value={meta.overall_feel} onChange={v => updateMeta("overall_feel", v)}
              options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${"⭐".repeat(n)} ${["", "Poor", "Fair", "Good", "Great", "Beast"][n]}` }))} />
          </div>
          <TextArea label="Notes" value={meta.notes} onChange={v => updateMeta("notes", v)} placeholder="General notes about today's session..." rows={2} />
          {meta.workout_type !== "cardio" && (
            <Button variant="primary" color="#FCD34D" onClick={() => setStep(2)}>Next: Log Exercises →</Button>
          )}
          {meta.workout_type === "cardio" && (
            <Button variant="solid" color="#FCD34D" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Cardio Session"}</Button>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          {exercises.map((ex, i) => (
            <ExerciseBlock key={i} exercise={ex} index={i} library={library} onChange={ex => updateExercise(i, ex)} onRemove={() => removeExercise(i)} />
          ))}
          <Button variant="ghost" onClick={addExercise} style={{ marginBottom: 20, width: "100%" }}>+ Add Exercise</Button>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
            <Button variant="solid" color="#FCD34D" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
              {saving ? "Saving..." : "Save Workout 💪"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function GymPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [s, l] = await Promise.all([getGymSessions(user.id), getExerciseLibrary(user.id)]);
    setSessions(s);
    setLibrary(l);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const prs = library.filter(e => e.pr_weight_kg);

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader
        title="Gym"
        icon="💪"
        subtitle="Track every lift, every set, every PR."
        action={<Button variant="solid" color="#FCD34D" onClick={() => setModalOpen(true)}>+ Log Workout</Button>}
      />

      <NewSessionModal open={modalOpen} onClose={() => setModalOpen(false)} library={library} onSaved={load} userId={user?.id} />

      {loading ? (
        <div style={{ color: "#2D3748", fontFamily: FONTS.mono, fontSize: 12, textAlign: "center", padding: 40 }}>Loading...</div>
      ) : (
        <>
          {/* PR Board */}
          {prs.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#FCD34D", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>🏆 Personal Records</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                {prs.map(ex => (
                  <div key={ex.id} style={{ padding: "14px", borderRadius: 12, background: "#1C1200", border: "1px solid #B4530944" }}>
                    <div style={{ fontSize: 11, color: "#B45309", fontFamily: FONTS.mono, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{ex.muscle_group}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#FCD34D", marginBottom: 6, lineHeight: 1.3 }}>{ex.name}</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: "#E2E8F0", fontWeight: 700 }}>{ex.pr_weight_kg}kg × {ex.pr_reps}</div>
                    <div style={{ fontSize: 10, color: "#3D5068", marginTop: 4 }}>{ex.pr_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#4A5568", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Recent Sessions</div>
            {sessions.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💪</div>
                <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>No workouts logged yet</div>
                <Button variant="primary" color="#FCD34D" onClick={() => setModalOpen(true)}>Log Your First Workout</Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/gym/${s.id}`)}
                    style={{ padding: "14px 16px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B", cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}
                  >
                    <div style={{ fontFamily: FONTS.mono, fontSize: 26, color: "#1E2A3A", minWidth: 36, textAlign: "center" }}>
                      {s.workout_type === "cardio" ? "🏃" : s.workout_type === "mixed" ? "⚡" : "💪"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#FCD34D", fontWeight: 600, fontSize: 14, marginBottom: 4, textTransform: "capitalize" }}>
                        {s.workout_type} session
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#4A5568", fontFamily: FONTS.mono }}>{s.log_date}</span>
                        {s.duration_min && <span style={{ fontSize: 11, color: "#4A5568" }}>⏱ {s.duration_min} min</span>}
                        {s.gym_exercises && <span style={{ fontSize: 11, color: "#4A5568" }}>{s.gym_exercises.length} exercises</span>}
                        {s.overall_feel && <span style={{ fontSize: 11 }}>{"⭐".repeat(s.overall_feel)}</span>}
                      </div>
                    </div>
                    <span style={{ color: "#2D3748", fontSize: 14 }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
