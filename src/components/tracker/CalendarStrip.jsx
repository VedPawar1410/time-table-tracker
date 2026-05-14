import { useEffect, useRef, useState } from "react";
import { FONTS } from "../../lib/constants.js";

function toDateKey(date) {
  return date.toISOString().split("T")[0];
}

function getDaysInMonth(year, month) {
  const days = [];
  const count = new Date(year, month, 0).getDate();
  for (let d = 1; d <= count; d++) {
    days.push(toDateKey(new Date(year, month - 1, d)));
  }
  return days;
}

export function CalendarStrip({ selectedDate, setSelectedDate, onMonthChange }) {
  const today = toDateKey(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [mode, setMode] = useState("strip"); // "strip" | "month"
  const scrollRef = useRef(null);

  const days = getDaysInMonth(viewYear, viewMonth);

  useEffect(() => {
    if (scrollRef.current && mode === "strip") {
      const todayIdx = days.findIndex(d => d === today);
      if (todayIdx >= 0) {
        const el = scrollRef.current.children[todayIdx];
        if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    }
  }, [viewYear, viewMonth, mode]);

  useEffect(() => {
    if (onMonthChange) onMonthChange(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1) return;
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth() + 1;

  return (
    <div style={{ marginBottom: 18 }}>
      {/* Month nav header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>‹</button>
          <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#94A3B8", letterSpacing: 1 }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ background: "transparent", border: "none", color: isCurrentMonth ? "#2D3748" : "#4A5568", fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>›</button>
        </div>
        <button
          onClick={() => setMode(m => m === "strip" ? "month" : "strip")}
          style={{ background: "transparent", border: "1px solid #1E293B", borderRadius: 6, color: "#4A5568", fontSize: 10, fontFamily: FONTS.mono, padding: "4px 10px", cursor: "pointer", letterSpacing: 0.5 }}
        >
          {mode === "strip" ? "MONTH VIEW" : "STRIP VIEW"}
        </button>
      </div>

      {mode === "strip" ? (
        <div ref={scrollRef} style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {days.map(day => {
            const isSelected = day === selectedDate;
            const isToday = day === today;
            const isFuture = day > today;
            const d = new Date(day + "T00:00:00");
            return (
              <div
                key={day}
                onClick={() => !isFuture && setSelectedDate(day)}
                style={{
                  flex: "0 0 48px", height: 60, borderRadius: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                  cursor: isFuture ? "default" : "pointer",
                  background: isSelected ? "#022c22" : "#0D1117",
                  border: `1px solid ${isSelected ? "#115E59" : "#1E293B"}`,
                  opacity: isFuture ? 0.3 : 1,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 9.5, color: isSelected ? "#5EEAD4" : "#4A5568", fontFamily: FONTS.mono }}>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div style={{ fontFamily: FONTS.syne, fontSize: 17, fontWeight: 700, color: isSelected ? "#4ADE80" : "#E2E8F0" }}>
                  {d.getDate()}
                </div>
                {isToday && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#FCD34D" }} />}
              </div>
            );
          })}
        </div>
      ) : (
        <MonthGrid year={viewYear} month={viewMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} today={today} />
      )}
    </div>
  );
}

function MonthGrid({ year, month, selectedDate, setSelectedDate, today }) {
  const days = getDaysInMonth(year, month);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const blanks = Array(firstDay).fill(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
        <div key={d} style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 9, color: "#2D3748", padding: "4px 0" }}>{d}</div>
      ))}
      {blanks.map((_, i) => <div key={`b${i}`} />)}
      {days.map(day => {
        const isSelected = day === selectedDate;
        const isToday = day === today;
        const isFuture = day > today;
        const d = new Date(day + "T00:00:00");
        return (
          <div
            key={day}
            onClick={() => !isFuture && setSelectedDate(day)}
            style={{
              height: 38, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, cursor: isFuture ? "default" : "pointer",
              background: isSelected ? "#022c22" : "transparent",
              border: `1px solid ${isSelected ? "#115E59" : isToday ? "#FCD34D44" : "transparent"}`,
              opacity: isFuture ? 0.3 : 1,
              fontFamily: FONTS.syne, fontWeight: 600, fontSize: 13,
              color: isSelected ? "#4ADE80" : isToday ? "#FCD34D" : "#94A3B8",
            }}
          >
            {d.getDate()}
          </div>
        );
      })}
    </div>
  );
}
