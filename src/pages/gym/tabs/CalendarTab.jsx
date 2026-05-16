import { useState, useEffect, useCallback } from "react";
import { FONTS } from "../../../lib/constants.js";
import { getGymCalendarData, getGymSessionById } from "../../../lib/db.js";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["M","T","W","T","F","S","S"];

const TYPE_COLOR = {
  weights: { dot: "#3B82F6", label: "Weights" },
  cardio:  { dot: "#22C55E", label: "Cardio" },
  mixed:   { dot: "#A78BFA", label: "Mixed" },
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
    } finally {
      setLoading(false);
    }
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
  // ISO week: Monday = 0
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
    // Find session from already-loaded sessions list (no extra fetch needed for recent data)
    const found = sessions.find(s => s.log_date === dateKey);
    if (found) { setSelectedSession(found); }
  };

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div>
      {/* Year + month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavBtn onClick={() => setYear(y => y - 1)}>«</NavBtn>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: "#94A3B8", minWidth: 36, textAlign: "center" }}>{year}</span>
          <NavBtn onClick={() => setYear(y => y + 1)}>»</NavBtn>
        </div>
        <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 17, color: "#F1F5F9" }}>
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
            <span style={{ fontSize: 11, color: "#475569", fontFamily: FONTS.sans }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: "#334155", fontFamily: FONTS.mono, textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: "#334155", fontFamily: FONTS.mono, fontSize: 11 }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = calData[dateKey];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDay;
            const dotColor = entry ? (TYPE_COLOR[entry.type]?.dot || "#3B82F6") : null;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  cursor: entry ? "pointer" : "default",
                  background: isSelected ? "rgba(59,130,246,0.2)" : isToday ? "rgba(255,255,255,0.06)" : "transparent",
                  border: isToday ? "1px solid rgba(255,255,255,0.15)" : isSelected ? "1px solid #3B82F6" : "1px solid transparent",
                  gap: 3,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (entry) e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? "rgba(255,255,255,0.06)" : "transparent"; }}
              >
                <span style={{ fontSize: 13, fontFamily: FONTS.mono, color: isToday ? "#F1F5F9" : entry ? "#CBD5E1" : "#334155" }}>{day}</span>
                {dotColor && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day popup */}
      {selectedDay && selectedSession && (
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(15,23,42,0.9)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14 }}>
          <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, color: "#F1F5F9", marginBottom: 8 }}>
            {selectedDay}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Chip bg="#1E3A5F" tx="#60A5FA">{selectedSession.workout_type}</Chip>
            {selectedSession.duration_min && <Chip bg="#1E3A5F" tx="#60A5FA">⏱ {selectedSession.duration_min}m</Chip>}
            {selectedSession.overall_feel && <Chip bg="#1E1B4B" tx="#A78BFA">{"⭐".repeat(selectedSession.overall_feel)}</Chip>}
          </div>
          {selectedSession.gym_exercises?.length > 0 && (
            <div style={{ fontSize: 12, color: "#64748B", fontFamily: FONTS.sans }}>
              {selectedSession.gym_exercises.map(e => e.exercise_name).join(" · ")}
            </div>
          )}
          {selectedSession.notes && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#94A3B8", fontFamily: FONTS.sans, fontStyle: "italic" }}>
              "{selectedSession.notes}"
            </div>
          )}
        </div>
      )}

      {selectedDay && !selectedSession && (
        <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 14, fontSize: 12, color: "#475569", fontFamily: FONTS.sans }}>
          Workout on {selectedDay} — detail not loaded yet. View in History tab.
        </div>
      )}
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: "rgba(30,41,59,0.6)", border: "1px solid #1E293B", borderRadius: 6, color: "#94A3B8", fontSize: 14, padding: "4px 10px", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function Chip({ bg, tx, children }) {
  return (
    <span style={{ fontSize: 11, fontFamily: FONTS.mono, padding: "3px 8px", borderRadius: 6, background: bg, color: tx }}>
      {children}
    </span>
  );
}
