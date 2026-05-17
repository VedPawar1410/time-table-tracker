import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useTracker } from "../../hooks/useTracker.js";
import { getGymSessions, getLeetcodeProblems, getBooks, getDietLogsForDate, getJobPrepDailyLogsForRange } from "../../lib/db.js";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import { DAY_SCHEDULE } from "../../lib/constants.js";
import Sticker from "../../components/ui/Sticker.jsx";
import Card from "../../components/ui/Card.jsx";
import { Ring } from "../../components/ui/Ring.jsx";
import CheckBubble from "../../components/ui/CheckBubble.jsx";
import Chip from "../../components/ui/Chip.jsx";
import { Button } from "../../components/ui/Button.jsx";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dateOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dayOfWeek(dateStr) {
  const [y,m,d] = dateStr.split("-").map(Number);
  return new Date(y, m-1, d).getDay();
}
function formatElapsed(ms) {
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600);
  const min = Math.floor((s%3600)/60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
    : `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Late session";
}

const DEEP_ROUTES = {
  gym: "/gym", jobprep: "/jobprep", book: "/reading", catprep: "/catprep",
  videditing: "/video", sidehustle: "/sidehustle", hobbies: "/hobbies",
  sleep: "/tracker", office: "/tracker", decompress: "/tracker", diet: "/diet",
};

const WEEKDAY_SCHEDULE = [
  { time: "7:45 – 8:45 AM",     cat: "gym",       label: "Gym or Cardio" },
  { time: "9:20 – 10:20 PM",    cat: "jobprep",   label: "Job Prep" },
  { time: "10:20 – 10:50 PM",   cat: "book",      label: "Book Reading" },
  { time: "10:50 PM – 12:00 AM",cat: "ps5",       label: "Evening Block" },
  { time: "12:00 – 7:30 AM",    cat: "sleep",     label: "Sleep" },
];

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${THEME.line}` }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: lighten(color, 0.78), border: `1.5px solid ${lighten(color, 0.55)}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: THEME.inkMuted, fontWeight: 600, fontFamily: F.body }}>{label}</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 14, color: THEME.ink, lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tracker = useTracker(user?.id);
  const today = todayKey();
  const dow = dayOfWeek(today);
  const todayTaskIds = DAY_SCHEDULE[dow] || [];

  const doneCount = todayTaskIds.filter(id => tracker.isDone(today, id)).length;
  const pct = todayTaskIds.length > 0 ? Math.round((doneCount / todayTaskIds.length) * 100) : 0;
  const bestStreak = tracker.getBestStreak();

  // Focus timer
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!activeTimer) { setElapsed(0); return; }
    const tick = () => setElapsed(Date.now() - activeTimer.startTime);
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeTimer]);

  const startTimer = taskId => setActiveTimer({ taskId, startTime: Date.now() });
  const stopTimer = async () => {
    if (!activeTimer) return;
    const mins = Math.max(1, Math.round(elapsed / 60000));
    await tracker.updateTaskDetails(today, activeTimer.taskId, { done: true, duration_min: mins });
    setActiveTimer(null);
  };

  // Quick stats
  const [gymCount, setGymCount] = useState("—");
  const [leetCount, setLeetCount] = useState("—");
  const [bookCount, setBookCount] = useState("—");
  const [kcalToday, setKcalToday] = useState("—");

  useEffect(() => {
    if (!user?.id) return;
    const weekAgo = dateOffset(-7);
    getGymSessions(user.id, 20).then(sessions => {
      setGymCount(sessions.filter(s => s.workout_date >= weekAgo).length);
    }).catch(() => {});
    getLeetcodeProblems(user.id, {}).then(probs => {
      setLeetCount(probs.filter(p => p.solved_date >= weekAgo).length + " problems");
    }).catch(() => {});
    getBooks(user.id).then(books => {
      const reading = books.filter(b => b.status === "reading").length;
      setBookCount(reading + (reading === 1 ? " book" : " books"));
    }).catch(() => {});
    getDietLogsForDate(user.id, today).then(meals => {
      const kcal = meals.reduce((sum, m) => sum + (m.diet_items || []).reduce((s, i) => s + (i.calories || 0), 0), 0);
      setKcalToday(kcal > 0 ? `${kcal} kcal` : "0 kcal");
    }).catch(() => {});
  }, [user?.id, today]);

  // 7-day strip
  const sevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = dateOffset(-(6 - i));
    const dw = dayOfWeek(date);
    const tasks = DAY_SCHEDULE[dw] || [];
    const done = tasks.filter(id => tracker.isDone(date, id)).length;
    const p = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    return { date, done, total: tasks.length, pct: p };
  });

  const name = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "you";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 24, position: "relative", paddingLeft: 16 }}>
        <div style={{ position: "absolute", top: -2, left: -12, transform: "rotate(-12deg)" }}>
          <Sticker kind="star" color={TASK_PALETTE.catprep.fg} size={18} wiggle />
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: THEME.primary, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          {getGreeting().toUpperCase()}, {name.toUpperCase()} ✨
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 38, fontWeight: 900, color: THEME.ink, lineHeight: 1.05, letterSpacing: -0.8, margin: 0 }}>
          You're {pct}% through today
        </h1>
        <p style={{ color: THEME.inkMuted, fontSize: 14.5, marginTop: 6 }}>
          {doneCount} of {todayTaskIds.length} tasks done
          {bestStreak > 0 ? ` · 🔥 best streak ${bestStreak} days` : " · let's build a streak today"}
        </p>
      </div>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1.1fr) 2fr", gap: 18, marginBottom: 20 }}>
        {/* Progress ring */}
        <Card padding={24} style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -12, right: -12, pointerEvents: "none" }}>
            <Sticker kind="blob" color={TASK_PALETTE.diet.bg} size={80} />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
            <Ring pct={pct} size={108} stroke={12} color={THEME.primary} sublabel="today" />
            <div>
              <div style={{ fontFamily: F.display, fontSize: 12, fontWeight: 800, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Today's Progress
              </div>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: THEME.ink, lineHeight: 1.1 }}>
                {doneCount}/{todayTaskIds.length} done
              </div>
              <div style={{ fontSize: 12.5, color: THEME.inkMuted, marginTop: 4 }}>
                {todayTaskIds.length - doneCount} left · keep going
              </div>
            </div>
          </div>
        </Card>

        {/* Focus timer */}
        <Card padding={0} style={{ overflow: "hidden", background: activeTimer ? TASK_PALETTE[activeTimer.taskId]?.bg : THEME.surface }}>
          {activeTimer ? (
            <div style={{ padding: 24, position: "relative" }}>
              <div style={{ position: "absolute", top: 14, right: 18, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: TASK_PALETTE[activeTimer.taskId].fg, animation: "pulse-soft 2s infinite" }} />
                <span style={{ fontFamily: F.mono, fontSize: 10, color: TASK_PALETTE[activeTimer.taskId].deep, fontWeight: 700, letterSpacing: 1 }}>RUNNING</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                  boxShadow: `0 3px 0 0 ${TASK_PALETTE[activeTimer.taskId].edge}`,
                }}>{TASK_PALETTE[activeTimer.taskId].emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.display, fontSize: 12, fontWeight: 800, color: TASK_PALETTE[activeTimer.taskId].deep, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {TASK_PALETTE[activeTimer.taskId].label} in progress
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 38, fontWeight: 700, color: TASK_PALETTE[activeTimer.taskId].deep, lineHeight: 1, letterSpacing: -1 }}>
                    {formatElapsed(elapsed)}
                  </div>
                </div>
                <Button variant="primary" color={TASK_PALETTE[activeTimer.taskId].fg} size="lg" onClick={stopTimer} icon="⏹">
                  Stop & log
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: lighten(THEME.primary, 0.7),
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
              }}>⏱️</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 17, color: THEME.ink, marginBottom: 4 }}>
                  Start a focus timer
                </div>
                <div style={{ fontSize: 13, color: THEME.inkMuted }}>
                  Pick a task to begin · auto-logs when you stop
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["jobprep","book","gym"].map(t => (
                  <button key={t} onClick={() => startTimer(t)} title={`Start ${TASK_PALETTE[t].label}`} style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: TASK_PALETTE[t].bg, border: `1.5px solid ${TASK_PALETTE[t].edge}`,
                    cursor: "pointer", fontSize: 22,
                    boxShadow: `0 2px 0 0 ${TASK_PALETTE[t].edge}`,
                  }}>{TASK_PALETTE[t].emoji}</button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 7-day strip */}
      <Card padding={18} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 17, color: THEME.ink }}>Past 7 days</div>
            <div style={{ fontSize: 12.5, color: THEME.inkMuted, marginTop: 2 }}>How consistent you've been</div>
          </div>
          <Chip color={TASK_PALETTE.diet.fg} icon="📊" onClick={() => navigate("/analytics")}>See all</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {sevenDays.map((d) => {
            const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            const dw2 = dayOfWeek(d.date);
            const isToday = d.date === today;
            return (
              <button
                key={d.date}
                onClick={() => navigate("/tracker")}
                style={{
                  background: isToday ? lighten(THEME.primary, 0.75) : THEME.bg,
                  border: `1.5px solid ${isToday ? THEME.primary : THEME.line}`,
                  borderRadius: THEME.rMd, padding: "12px 8px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
              >
                <span style={{ fontFamily: F.mono, fontSize: 10, color: THEME.inkMuted, fontWeight: 700 }}>
                  {dayNames[dw2]}
                </span>
                <Ring pct={d.pct} size={48} stroke={5}
                  color={d.pct >= 70 ? "#6BAD3A" : d.pct >= 40 ? THEME.primary : TASK_PALETTE.catprep.fg}
                  label={`${d.pct}`}
                />
                <span style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: F.mono }}>
                  {d.done}/{d.total}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Two-col: today's tasks + up next / quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        {/* Today's tasks */}
        <Card padding={20}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 17, color: THEME.ink }}>Today's tasks</div>
              <div style={{ fontSize: 12.5, color: THEME.inkMuted, marginTop: 2 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              </div>
            </div>
            <Chip color={THEME.primary} onClick={() => navigate("/tracker")}>Open tracker →</Chip>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayTaskIds.map(taskId => {
              const p = TASK_PALETTE[taskId];
              if (!p) return null;
              const done = tracker.isDone(today, taskId);
              const streak = tracker.getStreak(taskId);
              return (
                <div key={taskId} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: THEME.rMd,
                  background: done ? lighten(p.fg, 0.88) : THEME.bg,
                  border: `1.5px solid ${done ? p.edge : THEME.line}`,
                  transition: "all 0.2s",
                }}>
                  <CheckBubble
                    checked={done}
                    onChange={() => tracker.toggle(today, taskId)}
                    color={p.fg} size={28}
                  />
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: p.bg, border: `1.5px solid ${p.edge}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>{p.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 13.5, color: done ? p.deep : THEME.ink, textDecoration: done ? "line-through" : "none", textDecorationColor: p.edge }}>
                      {p.label}
                    </div>
                    {streak > 0 && (
                      <div style={{ fontFamily: F.mono, fontSize: 10.5, color: p.deep, marginTop: 1, fontWeight: 600 }}>🔥 {streak}d</div>
                    )}
                  </div>
                  <button
                    onClick={() => activeTimer ? null : startTimer(taskId)}
                    disabled={!!activeTimer}
                    title="Start timer"
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: activeTimer ? THEME.bg : p.fg, color: "#fff",
                      border: "none", fontSize: 11, cursor: activeTimer ? "not-allowed" : "pointer",
                      opacity: activeTimer ? 0.4 : 1,
                      boxShadow: activeTimer ? "none" : `0 2px 0 0 ${shadeDarken(p.fg, 0.3)}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >▶</button>
                  <button
                    onClick={() => navigate(DEEP_ROUTES[taskId] || "/tracker")}
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "transparent", color: THEME.inkSoft,
                      border: `1.5px solid ${THEME.line}`, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >→</button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: up next + quick stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card padding={20}>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 17, color: THEME.ink, marginBottom: 14 }}>
              Up next today
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {WEEKDAY_SCHEDULE.slice(0, 3).map((b, i) => {
                const p = TASK_PALETTE[b.cat];
                if (!p) return null;
                return (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "10px 12px", borderRadius: THEME.rMd,
                    background: p.bg, border: `1.5px solid ${p.edge}`,
                  }}>
                    <div style={{ minWidth: 88, fontFamily: F.mono, fontSize: 9.5, color: p.deep, fontWeight: 700, lineHeight: 1.3 }}>{b.time}</div>
                    <div style={{ flex: 1, fontFamily: F.display, fontWeight: 800, fontSize: 13, color: p.deep }}>{b.label}</div>
                    <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/timetable")}
              style={{
                width: "100%", marginTop: 12, padding: "8px",
                background: "transparent", border: `1.5px dashed ${THEME.line}`,
                color: THEME.inkSoft, fontFamily: F.display, fontWeight: 700, fontSize: 12,
                borderRadius: THEME.rMd, cursor: "pointer",
              }}
            >View full timetable →</button>
          </Card>

          <Card padding={20} tinted>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 17, color: THEME.ink, marginBottom: 14 }}>
              Quick stats
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <MiniStat icon="💪" label="Workouts this week" value={gymCount} color={TASK_PALETTE.gym.fg} />
              <MiniStat icon="🔥" label="LeetCode this week" value={leetCount} color={TASK_PALETTE.jobprep.fg} />
              <MiniStat icon="📖" label="Currently reading" value={bookCount} color={TASK_PALETTE.book.fg} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: lighten(TASK_PALETTE.diet.fg, 0.78), border: `1.5px solid ${lighten(TASK_PALETTE.diet.fg, 0.55)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>🥗</div>
                <div>
                  <div style={{ fontSize: 12, color: THEME.inkMuted, fontWeight: 600, fontFamily: F.body }}>Calories today</div>
                  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 14, color: THEME.ink }}>{kcalToday}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
