import { useEffect, useRef, useState } from "react";
import { FONTS } from "../../lib/constants.js";

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year, month) {
  const days = [];
  const count = new Date(year, month, 0).getDate();
  for (let d = 1; d <= count; d++) {
    days.push(toDateKey(new Date(year, month - 1, d)));
  }
  return days;
}

// Build array of all days from Jan 1 of the given year up to today
function getDaysForYear(year) {
  const today = toDateKey(new Date());
  const start = new Date(year, 0, 1);
  const end = new Date(); // today
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(toDateKey(new Date(d)));
  }
  return days;
}

function heatColor(pct) {
  if (pct === 0) return "#0D1117";
  if (pct < 0.25) return "#14532d";
  if (pct < 0.5)  return "#166534";
  if (pct < 0.75) return "#15803d";
  return "#4ADE80";
}

export function CalendarStrip({ selectedDate, setSelectedDate, onMonthChange, getStatsForDate, onYearView }) {
  const today = toDateKey(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [mode, setMode] = useState("strip"); // "strip" | "month" | "year"
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
    if (onMonthChange && mode !== "year") onMonthChange(viewYear, viewMonth);
  }, [viewYear, viewMonth, mode]);

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

  const cycleMode = () => {
    setMode(m => {
      if (m === "strip") return "month";
      if (m === "month") { if (onYearView) onYearView(); return "year"; }
      return "strip";
    });
  };

  const modeLabel = { strip: "MONTH VIEW", month: "YEAR VIEW", year: "STRIP VIEW" }[mode];

  return (
    <div style={{ marginBottom: 18 }}>
      {mode !== "year" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={prevMonth} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>‹</button>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#94A3B8", letterSpacing: 1 }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ background: "transparent", border: "none", color: isCurrentMonth ? "#2D3748" : "#4A5568", fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>›</button>
          </div>
          <button
            onClick={cycleMode}
            style={{ background: "transparent", border: "1px solid #1E293B", borderRadius: 6, color: "#4A5568", fontSize: 10, fontFamily: FONTS.mono, padding: "4px 10px", cursor: "pointer", letterSpacing: 0.5 }}
          >
            {modeLabel}
          </button>
        </div>
      )}

      {mode === "year" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#94A3B8", letterSpacing: 1 }}>{viewYear} — Activity Heatmap</span>
          <button
            onClick={cycleMode}
            style={{ background: "transparent", border: "1px solid #1E293B", borderRadius: 6, color: "#4A5568", fontSize: 10, fontFamily: FONTS.mono, padding: "4px 10px", cursor: "pointer", letterSpacing: 0.5 }}
          >
            STRIP VIEW
          </button>
        </div>
      )}

      {mode === "strip" && (
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
      )}

      {mode === "month" && (
        <MonthGrid year={viewYear} month={viewMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} today={today} />
      )}

      {mode === "year" && (
        <YearHeatmap year={viewYear} today={today} selectedDate={selectedDate} setSelectedDate={date => { setSelectedDate(date); setMode("strip"); }} getStatsForDate={getStatsForDate} />
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

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function YearHeatmap({ year, today, selectedDate, setSelectedDate, getStatsForDate }) {
  const yearDays = getDaysForYear(year);

  // Build a grid: pad the start so Jan 1 falls on its correct weekday (Sun=0)
  const jan1 = new Date(year, 0, 1);
  const startPad = jan1.getDay(); // 0=Sun ... 6=Sat
  const cells = [...Array(startPad).fill(null), ...yearDays];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Month label positions: which column index does each month start at?
  const monthCols = {};
  yearDays.forEach((day, i) => {
    const col = Math.floor((i + startPad) / 7);
    const m = parseInt(day.split("-")[1]) - 1;
    if (monthCols[m] === undefined) monthCols[m] = col;
  });

  const CELL = 11; // px per cell
  const GAP = 2;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      {/* Month labels row */}
      <div style={{ display: "flex", marginBottom: 4, marginLeft: 20, paddingLeft: 0 }}>
        {weeks.map((_, wi) => {
          const monthIdx = Object.entries(monthCols).find(([, col]) => col === wi);
          return (
            <div key={wi} style={{ width: CELL + GAP, flexShrink: 0, fontFamily: FONTS.mono, fontSize: 8, color: "#4A5568" }}>
              {monthIdx ? MONTH_ABBR[Number(monthIdx[0])] : ""}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Day-of-week labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 4, flexShrink: 0 }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} style={{ width: 14, height: CELL, fontFamily: FONTS.mono, fontSize: 7, color: "#2D3748", display: "flex", alignItems: "center" }}>{d}</div>
          ))}
        </div>

        {/* Week columns */}
        <div style={{ display: "flex", gap: GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {week.map((day, di) => {
                if (!day) return <div key={di} style={{ width: CELL, height: CELL }} />;
                const stats = getStatsForDate ? getStatsForDate(day) : { done: 0, total: 11 };
                const pct = stats.total > 0 ? stats.done / stats.total : 0;
                const isSelected = day === selectedDate;
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    title={`${day}: ${stats.done}/${stats.total} tasks`}
                    style={{
                      width: CELL, height: CELL, borderRadius: 2, cursor: "pointer",
                      background: isSelected ? "#4ADE80" : heatColor(pct),
                      outline: isToday ? "1px solid #FCD34D" : isSelected ? "1px solid #4ADE80" : "none",
                      outlineOffset: 1,
                      transition: "background 0.1s",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 20 }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 8, color: "#2D3748" }}>Less</span>
        {[0, 0.2, 0.45, 0.65, 1].map(p => (
          <div key={p} style={{ width: CELL, height: CELL, borderRadius: 2, background: heatColor(p) }} />
        ))}
        <span style={{ fontFamily: FONTS.mono, fontSize: 8, color: "#2D3748" }}>More</span>
      </div>
    </div>
  );
}
