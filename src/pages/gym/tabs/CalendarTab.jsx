import { useState, useEffect, useCallback } from "react";
import { FONTS, THEME } from "../../../lib/constants.js";
import { getGymCalendarData } from "../../../lib/db.js";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["M","T","W","T","F","S","S"];

const TYPE_COLOR = {
  weights: { dot: "#E8623A", label: "Weights" },
  cardio:  { dot: "#6BAD3A", label: "Cardio" },
  mixed:   { dot: "#8C6BD9", label: "Mixed" },
  rest:    { dot: "#9C8170", label: "Rest Day" },
};

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

  return (
    <div>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavBtn onClick={() => setYear(y => y - 1)}>«</NavBtn>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: THEME.inkSoft, minWidth: 36, textAlign: "center" }}>{year}</span>
          <NavBtn onClick={() => setYear(y => y + 1)}>»</NavBtn>
        </div>
        <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 17, color: THEME.ink }}>
          {MONTH_NAMES[month - 1]}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <NavBtn onClick={prevMonth}>‹</NavBtn>
          <NavBtn onClick={nextMonth}>›</NavBtn>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(TYPE_COLOR).map(([type, { dot, label }]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
            <span style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: FONTS.sans }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9.5, color: THEME.inkFaint, fontFamily: FONTS.mono, textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: THEME.inkFaint, fontFamily: FONTS.mono, fontSize: 11 }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = calData[dateKey];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDay;
            const dotColor = entry ? (TYPE_COLOR[entry.type]?.dot || THEME.primary) : null;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                style={{
                  aspectRatio: "1",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRadius: THEME.rSm, gap: 3,
                  cursor: entry ? "pointer" : "default",
                  background: isSelected ? THEME.primarySoft : isToday ? THEME.surfaceAlt : "transparent",
                  border: `1.5px solid ${isSelected ? THEME.primary : isToday ? THEME.line : "transparent"}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (entry) e.currentTarget.style.background = THEME.bgAlt; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? THEME.surfaceAlt : "transparent"; }}
              >
                <span style={{ fontSize: 13, fontFamily: FONTS.mono, color: isToday ? THEME.ink : entry ? THEME.inkSoft : THEME.inkFaint }}>
                  {day}
                </span>
                {entry?.type === "rest"
                  ? <span style={{ fontSize: 9, lineHeight: 1 }}>🌙</span>
                  : dotColor && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day detail */}
      {selectedDay && selectedSession && (
        <div style={{
          marginTop: 20, padding: "14px 16px",
          background: THEME.surface, border: `1px solid ${THEME.line}`,
          borderRadius: THEME.rMd, boxShadow: THEME.shadowSm,
        }}>
          <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 14, color: THEME.ink, marginBottom: 8 }}>
            {selectedDay}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Chip bg="#D9E4FB" tx="#5A7CC4">{selectedSession.workout_type}</Chip>
            {selectedSession.duration_min && <Chip bg="#D9E4FB" tx="#5A7CC4">⏱ {selectedSession.duration_min}m</Chip>}
            {selectedSession.overall_feel && <Chip bg="#E6DCFF" tx="#8C6BD9">{"⭐".repeat(selectedSession.overall_feel)}</Chip>}
          </div>
          {selectedSession.gym_exercises?.length > 0 && (
            <div style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: FONTS.sans }}>
              {selectedSession.gym_exercises.map(e => e.exercise_name).join(" · ")}
            </div>
          )}
          {selectedSession.notes && (
            <div style={{ marginTop: 8, fontSize: 12, color: THEME.inkMuted, fontFamily: FONTS.sans, fontStyle: "italic" }}>
              "{selectedSession.notes}"
            </div>
          )}
        </div>
      )}

      {selectedDay && !selectedSession && calData[selectedDay]?.type === "rest" && (
        <div style={{
          marginTop: 20, padding: "14px 16px",
          background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`,
          borderRadius: THEME.rMd, display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <div>
            <div style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 13, color: THEME.inkSoft }}>Rest Day</div>
            <div style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONTS.sans }}>{selectedDay}</div>
          </div>
        </div>
      )}

      {selectedDay && !selectedSession && calData[selectedDay] && calData[selectedDay].type !== "rest" && (
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`,
          borderRadius: THEME.rMd, fontSize: 12, color: THEME.inkSoft, fontFamily: FONTS.sans,
        }}>
          Workout on {selectedDay} — view in History tab for details.
        </div>
      )}
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`,
      borderRadius: THEME.rSm, color: THEME.inkSoft, fontSize: 14, padding: "4px 10px", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}

function Chip({ bg, tx, children }) {
  return (
    <span style={{ fontSize: 11, fontFamily: FONTS.mono, padding: "3px 8px", borderRadius: THEME.rPill, background: bg, color: tx }}>
      {children}
    </span>
  );
}
