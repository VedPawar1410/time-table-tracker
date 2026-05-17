import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../../lib/theme.js";
import Card from "../../../components/ui/Card.jsx";
import Sticker from "../../../components/ui/Sticker.jsx";

const p = TASK_PALETTE.gym;

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function muscleColor(muscle) {
  const map = {
    "Chest": TASK_PALETTE.gym,
    "Back": TASK_PALETTE.book,
    "Legs": TASK_PALETTE.diet,
    "Shoulders": TASK_PALETTE.catprep,
    "Arms": TASK_PALETTE.hobbies,
    "Core": TASK_PALETTE.sidehustle,
    "Cardio": TASK_PALETTE.videditing,
  };
  return map[muscle] || TASK_PALETTE.routine;
}

export function ExercisesTab({ library }) {
  const withPRs = library.filter(e => e.pr_weight_kg);
  const withoutPRs = library.filter(e => !e.pr_weight_kg);

  if (library.length === 0) {
    return (
      <Card padding={48} style={{ textAlign: "center", border: `2px dashed ${THEME.line}` }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏋️</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 8 }}>No exercises yet</div>
        <div style={{ color: THEME.inkMuted, fontSize: 14, fontFamily: F.body }}>Log a workout to start tracking PRs</div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {withPRs.length > 0 && (
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: THEME.inkMuted, textTransform: "uppercase", marginBottom: 12 }}>
            Personal Records · {withPRs.length}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {withPRs.map(ex => {
              const mc = muscleColor(ex.muscle_group);
              return (
                <div key={ex.id} style={{
                  padding: "16px 18px", borderRadius: THEME.rMd,
                  background: lighten(mc.fg, 0.88), border: `1.5px solid ${lighten(mc.fg, 0.7)}`,
                  boxShadow: THEME.shadowSm, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: -8, right: -8, opacity: 0.3, pointerEvents: "none" }}>
                    <Sticker kind="blob" color={mc.fg} size={64} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <div style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: mc.fg, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                      🏆 PR
                    </div>
                    <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: THEME.ink, marginBottom: 8 }}>
                      {ex.name}
                    </div>
                    {ex.muscle_group && (
                      <span style={{
                        padding: "2px 8px", borderRadius: 999,
                        background: lighten(mc.fg, 0.72), color: shadeDarken(mc.fg, 0.2),
                        fontSize: 11, fontFamily: F.mono, fontWeight: 700, marginBottom: 10, display: "inline-block",
                      }}>
                        {ex.muscle_group}
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 700, color: mc.fg }}>
                        {ex.pr_weight_kg}
                      </span>
                      <span style={{ fontFamily: F.mono, fontSize: 13, color: mc.fg }}>kg</span>
                      {ex.pr_reps && (
                        <span style={{ fontFamily: F.mono, fontSize: 13, color: THEME.inkMuted, marginLeft: 4 }}>
                          × {ex.pr_reps}
                        </span>
                      )}
                    </div>
                    {ex.pr_date && (
                      <div style={{ fontFamily: F.mono, fontSize: 11, color: THEME.inkMuted, marginTop: 4 }}>
                        {formatDate(ex.pr_date)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {withoutPRs.length > 0 && (
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: THEME.inkMuted, textTransform: "uppercase", marginBottom: 12 }}>
            All Exercises · {withoutPRs.length} without PR
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {withoutPRs.map(ex => {
              const mc = muscleColor(ex.muscle_group);
              return (
                <div key={ex.id} style={{
                  padding: "12px 14px", borderRadius: THEME.rMd,
                  background: THEME.surface, border: `1.5px solid ${THEME.line}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: lighten(mc.fg, 0.85), border: `1.5px solid ${lighten(mc.fg, 0.65)}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: F.mono, fontSize: 11, fontWeight: 700, color: mc.fg,
                  }}>
                    {(ex.muscle_group || "?")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 13, color: THEME.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ex.name}
                    </div>
                    {ex.muscle_group && (
                      <div style={{ fontFamily: F.body, fontSize: 11, color: THEME.inkMuted }}>{ex.muscle_group}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
