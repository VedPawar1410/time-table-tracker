import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useTracker } from "../hooks/useTracker.js";
import { CalendarStrip } from "../components/tracker/CalendarStrip.jsx";
import { TaskCard } from "../components/tracker/TaskCard.jsx";
import { Ring } from "../components/ui/Ring.jsx";
import { TRACKED_TASKS, FONTS, THEME, DAY_SCHEDULE } from "../lib/constants.js";

function todayKey() {
  const d = new Date();
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTasksForDay(dateStr) {
  const dow = new Date(dateStr + "T00:00:00").getDay();
  return TRACKED_TASKS.filter(t => DAY_SCHEDULE[dow].includes(t.id));
}

function formatLongDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const today = todayKey();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yy = yest.getFullYear(), ym = String(yest.getMonth() + 1).padStart(2, "0"), yd = String(yest.getDate()).padStart(2, "0");
  const yesterdayKey = `${yy}-${ym}-${yd}`;
  if (dateKey === today) return "Today, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  if (dateKey === yesterdayKey) return "Yesterday, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}

export default function TrackerPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const { loading, toggle, isDone, getTaskData, updateTaskDetails, getStreak, getRate, getStatsForDate, getBestStreak, ensureRange } = useTracker(user?.id);

  const tasksForDay = getTasksForDay(selectedDate);
  const doneCount = tasksForDay.filter(t => isDone(selectedDate, t.id)).length;
  const stats = {
    done: doneCount,
    total: tasksForDay.length,
    pct: tasksForDay.length === 0 ? 0 : Math.round((doneCount / tasksForDay.length) * 100),
  };
  const bestStreak = getBestStreak();
  const isSunday = new Date(selectedDate + "T00:00:00").getDay() === 0;

  const handleMonthChange = (year, month) => {
    const lastDay = new Date(year, month, 0).getDate();
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    ensureRange(start, end);
  };

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans, background: THEME.bg, minHeight: "100vh" }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: "0.22em", color: THEME.primary, textTransform: "uppercase", marginBottom: 6 }}>
          Daily Tracker
        </div>
        <h1 style={{ fontFamily: FONTS.nunito, fontSize: 26, fontWeight: 800, color: THEME.ink, lineHeight: 1.1, margin: 0 }}>
          {formatLongDate(selectedDate)}
        </h1>
      </div>

      <CalendarStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onMonthChange={handleMonthChange}
        getStatsForDate={getStatsForDate}
        onYearView={() => { const now = new Date(); ensureRange(`${now.getFullYear()}-01-01`, todayKey()); }}
      />

      {/* Day summary card */}
      <div style={{
        padding: "16px 20px", borderRadius: THEME.rMd,
        background: THEME.surface, border: `1px solid ${THEME.line}`,
        boxShadow: THEME.shadowSm,
        marginBottom: 18, display: "flex", alignItems: "center", gap: 20,
      }}>
        <Ring pct={stats.pct} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 9, color: THEME.primary,
            letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4,
          }}>
            {selectedDate === todayKey() ? "Today's Progress" : "Daily Progress"}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            <div style={{ fontSize: 12, color: THEME.inkSoft }}>
              <span style={{ color: stats.done > 0 ? "#6BAD3A" : THEME.inkMuted, fontWeight: 700, fontFamily: FONTS.nunito, fontSize: 18 }}>
                {stats.done}
              </span>
              <span style={{ color: THEME.inkMuted }}> / {stats.total} done</span>
            </div>
            {bestStreak > 0 && (
              <div style={{ fontSize: 12, color: THEME.inkSoft }}>
                <span style={{ color: "#E58A2D" }}>🔥 {bestStreak}d</span>
                <span style={{ color: THEME.inkFaint }}> best streak</span>
              </div>
            )}
            {loading && (
              <span style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONTS.mono }}>syncing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Sunday rest day notice */}
      {isSunday && (
        <div style={{
          padding: "10px 14px", borderRadius: THEME.rSm, marginBottom: 12,
          background: "#DCDFFA", border: "1px solid #C8CCEE",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>😴</span>
          <span style={{ fontSize: 12, color: "#6B73C9", lineHeight: 1.5 }}>
            <strong>Rest Day</strong> — all tasks are optional. Check off anything you do, no pressure.
          </span>
        </div>
      )}

      {/* Task grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tasksForDay.map(task => (
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

      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: THEME.rSm,
        background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`,
      }}>
        <span style={{ fontSize: 11.5, color: THEME.inkFaint, fontFamily: FONTS.mono }}>
          ☁️ Synced to cloud · Tap any card to add details
        </span>
      </div>
    </div>
  );
}
