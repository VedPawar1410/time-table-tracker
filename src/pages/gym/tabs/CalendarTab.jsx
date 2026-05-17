import { useState, useEffect, useCallback } from "react";
import { THEME, TASK_PALETTE, F, lighten } from "../../../lib/theme.js";
import { getGymCalendarData } from "../../../lib/db.js";
import Card from "../../../components/ui/Card.jsx";

const p = TASK_PALETTE.gym;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["M","T","W","T","F","S","S"];

const TYPE_COLOR = {
  weights: { dot: TASK_PALETTE.gym.fg, label: "Strength" },
  cardio:  { dot: TASK_PALETTE.diet.fg, label: "Cardio" },
  mixed:   { dot: TASK_PALETTE.hobbies.fg, label: "Mixed" },
  rest:    { dot: THEME.inkFaint, label: "Rest Day" },
};

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: THEME.surface, border: `1.5px solid ${THEME.line}`,
      borderRadius: THEME.rSm, color: THEME.inkSoft, fontSize: 14,
      padding: "5px 12px", cursor: "pointer", fontFamily: F.display, fontWeight: 700,
    }}>
      {children}
    </button>
  );
}

export function CalendarTab({ userId, sessions }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calData, setCalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getGymCalendarData(userId, year, month);
      setCalData(data);
    } finally { setLoading(false); }
  }, [userId, year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleDayClick = async (day) => {
    if (!day) return;
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = calData[dateKey];
    if (!entry) { setSelectedDay(null); setSelectedSession(null); return; }
    setSelectedDay(dateKey);
    const found = sessions.find(s => s.log_date === dateKey);
    if (found) setSelectedSession(found);
  };

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const workoutsThisMonth = Object.values(calData).filter(e => e.type !== "rest").length;

  return (
    <Card padding={24}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavBtn onClick={() => setYear(y => y - 1)}>«</NavBtn>
          <span style={{ fontFamily: F.mono, fontSize: 12, color: THEME.inkSoft, minWidth: 36, textAlign: "center" }}>{year}</span>
          <NavBtn onClick={() => setYear(y => y + 1)}>»</NavBtn>
        </div>
        <div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 18, color: THEME.ink, textAlign: "center" }}>
            {MONTH_NAMES[month - 1]}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: p.fg, textAlign: "center", fontWeight: 700 }}>
            {workoutsThisMonth} workout{workoutsThisMonth !== 1 ? "s" : ""} this month
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <NavBtn onClick={prevMonth}>‹</NavBtn>
          <NavBtn onClick={nextMonth}>›</NavBtn>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {Object.entries(TYPE_COLOR).map(([type, { dot, label }]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
            <span style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: F.body }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: THEME.inkFaint, fontFamily: F.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>{d}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: THEME.inkFaint, fontFamily: F.mono, fontSize: 11, letterSpacing: 2 }}>LOADING...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = calData[dateKey];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDay;
            const dotColor = entry ? (TYPE_COLOR[entry.type]?.dot || p.fg) : null;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", borderRadius: THEME.rSm, gap: 3,
                  cursor: entry ? "pointer" : "default",
                  background: isSelected ? lighten(p.fg, 0.78) : isToday ? THEME.surfaceAlt : "transparent",
                  border: `1.5px solid ${isSelected ? lighten(p.fg, 0.55) : isToday ? THEME.line : "transparent"}`,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 12, fontFamily: F.mono, fontWeight: isToday ? 700 : 400, color: isToday ? THEME.ink : entry ? THEME.inkSoft : THEME.inkFaint }}>
                  {day}
                </span>
                {entry?.type === "rest"
                  ? <span style={{ fontSize: 9 }}>🌙</span>
                  : dotColor && <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
                }
              </div>
            );
          })}
        </div>
      )}

      {selectedDay && selectedSession && (
        <div style={{
          marginTop: 20, padding: "14px 16px",
          background: lighten(p.fg, 0.9), border: `1.5px solid ${lighten(p.fg, 0.7)}`,
          borderRadius: THEME.rMd,
        }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: THEME.ink, marginBottom: 8 }}>
            {selectedDay}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: lighten(TASK_PALETTE.book.fg, 0.82), color: TASK_PALETTE.book.fg, fontSize: 11, fontFamily: F.mono, fontWeight: 700 }}>
              {selectedSession.workout_type}
            </span>
            {selectedSession.duration_min && (
              <span style={{ padding: "2px 8px", borderRadius: 999, background: lighten(TASK_PALETTE.book.fg, 0.82), color: TASK_PALETTE.book.fg, fontSize: 11, fontFamily: F.mono, fontWeight: 700 }}>
                ⏱ {selectedSession.duration_min}m
              </span>
            )}
          </div>
          {selectedSession.gym_exercises?.length > 0 && (
            <div style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: F.body }}>
              {selectedSession.gym_exercises.map(e => e.exercise_name).join(" · ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
