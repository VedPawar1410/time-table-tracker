import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useTracker } from "../hooks/useTracker.js";
import { CalendarStrip } from "../components/tracker/CalendarStrip.jsx";
import { TaskCard } from "../components/tracker/TaskCard.jsx";
import { Ring } from "../components/ui/Ring.jsx";
import { TRACKED_TASKS, FONTS } from "../lib/constants.js";

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatLongDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const today = todayKey();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yesterdayKey = yest.toISOString().split("T")[0];
  if (dateKey === today) return "Today, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  if (dateKey === yesterdayKey) return "Yesterday, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}

export default function TrackerPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const { loading, toggle, isDone, getTaskData, updateTaskDetails, getStreak, getRate, getStatsForDate, getBestStreak, ensureRange } = useTracker(user?.id);

  const stats = getStatsForDate(selectedDate);
  const bestStreak = getBestStreak();

  const handleMonthChange = (year, month) => {
    const lastDay = new Date(year, month, 0).getDate();
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    ensureRange(start, end);
  };

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 3, color: "#4ADE80", textTransform: "uppercase", marginBottom: 6 }}>Daily Tracker</div>
        <h1 style={{ fontFamily: FONTS.syne, fontSize: 26, fontWeight: 800, color: "#E2E8F0", lineHeight: 1.1 }}>
          {formatLongDate(selectedDate)}
        </h1>
      </div>

      <CalendarStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} onMonthChange={handleMonthChange} />

      {/* Day summary */}
      <div style={{
        padding: "16px 20px", borderRadius: 16, background: "#0D1117", border: "1px solid #1E293B",
        marginBottom: 18, display: "flex", alignItems: "center", gap: 20,
      }}>
        <Ring pct={stats.pct} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#4ADE80", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            {selectedDate === todayKey() ? "Today's Progress" : "Daily Progress"}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            <div style={{ fontSize: 12, color: "#3D5068" }}>
              <span style={{ color: stats.done > 0 ? "#4ADE80" : "#3D5068", fontWeight: 600, fontFamily: FONTS.mono }}>{stats.done}</span>
              <span style={{ color: "#2D3748" }}> / {stats.total} done</span>
            </div>
            {bestStreak > 0 && (
              <div style={{ fontSize: 12, color: "#3D5068" }}>
                <span style={{ color: "#FCD34D" }}>🔥 {bestStreak}d</span>
                <span style={{ color: "#2D3748" }}> best streak</span>
              </div>
            )}
            {loading && <span style={{ fontSize: 11, color: "#2D3748", fontFamily: FONTS.mono }}>syncing...</span>}
          </div>
        </div>
      </div>

      {/* Task grid — 2 cols */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {TRACKED_TASKS.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            selectedDate={selectedDate}
            isDone={isDone}
            getTaskData={getTaskData}
            toggle={toggle}
            updateTaskDetails={updateTaskDetails}
            streak={getStreak(task.id)}
            rate={getRate(task.id)}
          />
        ))}
      </div>

      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "#0D1117", border: "1px solid #1E293B" }}>
        <span style={{ fontSize: 11.5, color: "#2D3748" }}>
          ☁️ Synced to cloud · Tap any card to add details · Tap ○ to mark done
        </span>
      </div>
    </div>
  );
}
