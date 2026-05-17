import { useState, useEffect } from "react";
import { FONTS, THEME, MUSCLE_GROUPS, DEFAULT_EXERCISES } from "../../../lib/constants.js";
import { getExerciseHistory } from "../../../lib/db.js";

function detectPR(exerciseName, weightKg, reps, library) {
  const lib = library.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  if (!lib || !lib.pr_weight_kg) return false;
  const newVol = weightKg * reps;
  const oldVol = lib.pr_weight_kg * (lib.pr_reps || 1);
  return newVol > oldVol || weightKg > lib.pr_weight_kg;
}

export function ExerciseBlock({ exercise, index, library, userId, onChange, onRemove, restLabel, weightUnit }) {
  const { name, muscle_group, sets } = exercise;
  const [prevSets, setPrevSets] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const unit = weightUnit || "kg";

  useEffect(() => {
    if (!userId || name.length < 2) return;
    const isKnown = library.some(e => e.name.toLowerCase() === name.toLowerCase()) ||
      Object.values(DEFAULT_EXERCISES).flat().some(e => e.toLowerCase() === name.toLowerCase());
    if (!isKnown) return;
    getExerciseHistory(userId, name).then(setPrevSets).catch(() => {});
  }, [userId, name, library]);

  const updateSet = (si, field, val) => {
    const newSets = sets.map((s, i) => i === si ? { ...s, [field]: val } : s);
    onChange({ ...exercise, sets: newSets });
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    onChange({ ...exercise, sets: [...sets, { reps: last?.reps || "", weight_kg: last?.weight_kg || "", rpe: "" }] });
  };

  const removeSet = (si) => onChange({ ...exercise, sets: sets.filter((_, i) => i !== si) });

  const suggestions = name.length >= 2
    ? [...new Set([
        ...library.filter(e => e.name.toLowerCase().includes(name.toLowerCase())).map(e => e.name),
        ...Object.values(DEFAULT_EXERCISES).flat().filter(e => e.toLowerCase().includes(name.toLowerCase())),
      ])].slice(0, 6)
    : [];

  return (
    <div style={{ borderRadius: THEME.rMd, overflow: "hidden", marginBottom: 16, border: `1px solid ${THEME.line}`, background: THEME.surface, boxShadow: THEME.shadowSm }}>
      {/* Exercise name header */}
      <div style={{ padding: "12px 14px 10px", background: THEME.surfaceAlt, borderBottom: `1px solid ${THEME.line}` }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ fontSize: 10, color: "#E8623A", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>
              Exercise {index + 1}
            </div>
            <input
              value={name}
              onChange={e => { onChange({ ...exercise, name: e.target.value }); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Bench Press"
              style={inputStyle({ color: "#E8623A", fontWeight: 600, borderColor: name ? "#F5C4B5" : THEME.line })}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: THEME.rSm, zIndex: 20, marginTop: 2, maxHeight: 200, overflowY: "auto", boxShadow: THEME.shadowMd }}>
                {suggestions.map(s => (
                  <div
                    key={s}
                    onMouseDown={() => {
                      const lib = library.find(e => e.name === s);
                      onChange({ ...exercise, name: s, muscle_group: lib?.muscle_group || muscle_group });
                      setShowSuggestions(false);
                    }}
                    style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: THEME.inkSoft, borderBottom: `1px solid ${THEME.line}` }}
                    onMouseEnter={e => e.currentTarget.style.background = THEME.surfaceAlt}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 120, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Muscle</div>
            <select
              value={muscle_group}
              onChange={e => onChange({ ...exercise, muscle_group: e.target.value })}
              style={{ ...inputStyle(), width: "100%" }}
            >
              {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={onRemove}
            style={{ background: "transparent", border: "none", color: THEME.inkFaint, fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0, marginBottom: 2 }}
          >✕</button>
        </div>
      </div>

      {/* Sets table */}
      <div style={{ padding: "10px 14px 12px" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "28px 80px 1fr 1fr 28px", gap: 6, marginBottom: 6 }}>
          {["Set", "Previous", unit.toUpperCase(), "Reps", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: FONTS.mono, textAlign: "center", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {sets.map((set, si) => {
          const prev = prevSets[si];
          const isPR = set.weight_kg && set.reps
            ? detectPR(name, parseFloat(set.weight_kg), parseInt(set.reps), library)
            : false;

          return (
            <div key={si}>
              <div style={{ display: "grid", gridTemplateColumns: "28px 80px 1fr 1fr 28px", gap: 6, marginBottom: 4, alignItems: "center" }}>
                <div style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 12, color: THEME.inkSoft, background: THEME.surfaceAlt, borderRadius: 6, padding: "6px 0" }}>{si + 1}</div>
                <div style={{ textAlign: "center", fontSize: 11, color: THEME.inkFaint, fontFamily: FONTS.mono, padding: "6px 4px" }}>
                  {prev ? `${prev.weight_kg ?? "—"}×${prev.reps ?? "—"}` : "—"}
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    value={set.weight_kg || ""}
                    onChange={e => updateSet(si, "weight_kg", e.target.value)}
                    type="number"
                    placeholder="0"
                    style={{ ...inputStyle({ border: isPR ? "1.5px solid #D69B1F" : `1.5px solid ${THEME.line}` }), textAlign: "center" }}
                  />
                  {isPR && <span style={{ position: "absolute", right: -4, top: -6, fontSize: 10 }}>🏆</span>}
                </div>
                <input
                  value={set.reps || ""}
                  onChange={e => updateSet(si, "reps", e.target.value)}
                  type="number"
                  placeholder="0"
                  style={{ ...inputStyle(), textAlign: "center" }}
                />
                <button
                  onClick={() => removeSet(si)}
                  style={{ background: "transparent", border: "none", color: THEME.inkFaint, fontSize: 16, cursor: "pointer", textAlign: "center", padding: 0 }}
                >—</button>
              </div>

              {si < sets.length - 1 && (
                <div style={{ textAlign: "center", fontSize: 10, color: THEME.inkFaint, fontFamily: FONTS.mono, letterSpacing: 1, marginBottom: 4 }}>
                  ─── rest {restLabel || "1:30"} ───
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addSet}
          style={{
            marginTop: 6, width: "100%", padding: "8px", background: "#FFDDD0",
            border: "1px dashed #F5C4B5", borderRadius: THEME.rSm,
            color: "#E8623A", fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer",
          }}
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}

function inputStyle(extra = {}) {
  return {
    background: THEME.surface,
    border: `1.5px solid ${THEME.line}`,
    borderRadius: THEME.rSm,
    padding: "7px 8px",
    color: THEME.ink,
    fontSize: 13,
    fontFamily: FONTS.sans,
    outline: "none",
    width: "100%",
    ...extra,
  };
}
