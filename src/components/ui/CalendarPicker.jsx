import { useEffect, useRef, useState } from "react";
import { FONTS } from "../../lib/constants.js";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  const count = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= count; d++) {
    days.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return days;
}

function formatDisplay(dateStr) {
  if (!dateStr) return "Select date";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function CalendarPicker({ value, onChange, label, maxDate }) {
  const max = maxDate || todayStr();
  const today = todayStr();

  const initYear = value ? Number(value.split("-")[0]) : new Date().getFullYear();
  const initMonth = value ? Number(value.split("-")[1]) : new Date().getMonth() + 1;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const containerRef = useRef(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(Number(value.split("-")[0]));
      setViewMonth(Number(value.split("-")[1]));
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const [maxY, maxM] = max.split("-").map(Number);
    if (viewYear === maxY && viewMonth === maxM) return;
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [maxY, maxM] = max.split("-").map(Number);
  const atMax = viewYear === maxY && viewMonth === maxM;

  const selectDay = (day) => {
    if (day > max) return;
    onChange(day);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {label && (
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#4A5568", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left", background: "#0D1117", border: "1px solid #1E293B",
          borderRadius: 8, padding: "10px 14px", color: value ? "#E2E8F0" : "#4A5568",
          fontFamily: FONTS.sans, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span>{formatDisplay(value)}</span>
        <span style={{ color: "#4A5568", fontSize: 12 }}>📅</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 1000,
          background: "#0D1117", border: "1px solid #1E293B", borderRadius: 12,
          padding: 16, minWidth: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button
              type="button" onClick={prevMonth}
              style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 18, cursor: "pointer", padding: "2px 8px", lineHeight: 1 }}
            >‹</button>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#94A3B8", letterSpacing: 0.5 }}>{monthLabel}</span>
            <button
              type="button" onClick={nextMonth}
              style={{ background: "transparent", border: "none", color: atMax ? "#2D3748" : "#4A5568", fontSize: 18, cursor: atMax ? "default" : "pointer", padding: "2px 8px", lineHeight: 1 }}
            >›</button>
          </div>

          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d} style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 9, color: "#2D3748", padding: "3px 0" }}>{d}</div>
            ))}
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(day => {
              const isSelected = day === value;
              const isToday = day === today;
              const isFuture = day > max;
              const d = new Date(day + "T00:00:00");
              return (
                <div
                  key={day}
                  onClick={() => !isFuture && selectDay(day)}
                  style={{
                    height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 7, cursor: isFuture ? "default" : "pointer",
                    background: isSelected ? "#022c22" : "transparent",
                    border: `1px solid ${isSelected ? "#115E59" : isToday ? "#FCD34D44" : "transparent"}`,
                    opacity: isFuture ? 0.25 : 1,
                    fontFamily: FONTS.syne, fontWeight: 600, fontSize: 13,
                    color: isSelected ? "#4ADE80" : isToday ? "#FCD34D" : "#94A3B8",
                    transition: "background 0.15s",
                  }}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
