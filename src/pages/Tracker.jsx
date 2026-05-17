import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useTracker } from "../hooks/useTracker.js";
import { TRACKED_TASKS, DAY_SCHEDULE } from "../lib/constants.js";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../lib/theme.js";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import { Ring } from "../components/ui/Ring.jsx";
import StatTile from "../components/ui/StatTile.jsx";
import CheckBubble from "../components/ui/CheckBubble.jsx";
import Chip from "../components/ui/Chip.jsx";
import Sticker from "../components/ui/Sticker.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { TextArea } from "../components/ui/TextArea.jsx";
import { Select } from "../components/ui/Select.jsx";
import EnergyPicker from "../components/ui/EnergyPicker.jsx";
import { JobPrepForm } from "../components/tracker/forms/JobPrepForm.jsx";
import { BookForm } from "../components/tracker/forms/BookForm.jsx";
import { GenericForm } from "../components/tracker/forms/GenericForm.jsx";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getTasksForDay(dateStr) {
  const dow = new Date(dateStr + "T00:00:00").getDay();
  return TRACKED_TASKS.filter(t => (DAY_SCHEDULE[dow] || []).includes(t.id));
}
function formatLongDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const today = todayKey();
  const yest = addDays(today, -1);
  if (dateKey === today) return "Today, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  if (dateKey === yest) return "Yesterday, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}
function formatShortDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const DEEP_ROUTES = {
  gym: "/gym", jobprep: "/jobprep", book: "/reading", catprep: "/catprep",
  videditing: "/video", sidehustle: "/sidehustle", hobbies: "/hobbies",
  sleep: "/tracker", office: "/tracker", decompress: "/tracker", diet: "/diet",
};

// ─── Calendar Strip ────────────────────────────────────────────────────────────
function CalendarStrip({ selectedDate, setSelectedDate, getStatsForDate, onMonthChange }) {
  const today = todayKey();
  const [mode, setMode] = useState("strip");
  const [viewMonth, setViewMonth] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return { year: y, month: m };
  });

  const stripDays = [];
  for (let i = -3; i <= 10; i++) stripDays.push(addDays(today, i));

  const monthDays = useMemo(() => {
    const first = new Date(viewMonth.year, viewMonth.month - 1, 1);
    const startDay = first.getDay();
    const last = new Date(viewMonth.year, viewMonth.month, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= last; d++) cells.push(`${viewMonth.year}-${String(viewMonth.month).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    return cells;
  }, [viewMonth]);

  const monthName = new Date(viewMonth.year, viewMonth.month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const navMonth = (dir) => {
    setViewMonth(v => {
      const nm = v.month + dir;
      const ny = nm === 0 ? v.year - 1 : nm === 13 ? v.year + 1 : v.year;
      const fm = nm === 0 ? 12 : nm === 13 ? 1 : nm;
      const result = { year: ny, month: fm };
      onMonthChange?.(ny, fm);
      return result;
    });
  };

  return (
    <Card padding={16} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: THEME.bg, borderRadius: 999, border: `1.5px solid ${THEME.line}` }}>
          {["strip","month"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "6px 14px", borderRadius: 999,
              background: mode === m ? THEME.surface : "transparent",
              color: mode === m ? THEME.ink : THEME.inkMuted,
              border: "none", boxShadow: mode === m ? THEME.shadowSm : "none",
              fontFamily: F.display, fontSize: 12, fontWeight: 800, cursor: "pointer",
            }}>{m === "strip" ? "Strip" : "Month"}</button>
          ))}
        </div>
        {mode === "month" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => navMonth(-1)} style={{ width: 30, height: 30, borderRadius: 10, background: THEME.surface, border: `1.5px solid ${THEME.line}`, color: THEME.ink, fontSize: 16, cursor: "pointer", fontWeight: 700, boxShadow: THEME.shadowSm }}>‹</button>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: THEME.ink, minWidth: 140, textAlign: "center" }}>{monthName}</span>
            <button onClick={() => navMonth(1)} style={{ width: 30, height: 30, borderRadius: 10, background: THEME.surface, border: `1.5px solid ${THEME.line}`, color: THEME.ink, fontSize: 16, cursor: "pointer", fontWeight: 700, boxShadow: THEME.shadowSm }}>›</button>
          </div>
        )}
        {mode === "strip" && (
          <button onClick={() => setSelectedDate(today)} style={{
            padding: "6px 14px", borderRadius: 999, background: THEME.surface,
            border: `1.5px solid ${THEME.line}`, color: THEME.inkSoft,
            fontFamily: F.display, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: THEME.shadowSm,
          }}>Today</button>
        )}
      </div>

      {mode === "strip" && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {stripDays.map(d => {
            const isSel = d === selectedDate;
            const isToday = d === today;
            const stats = getStatsForDate(d);
            const dt = new Date(d + "T00:00:00");
            const dow = ["S","M","T","W","T","F","S"][dt.getDay()];
            const num = dt.getDate();
            return (
              <button key={d} onClick={() => setSelectedDate(d)} style={{
                flex: "0 0 auto", width: 60, padding: "10px 6px",
                background: isSel ? THEME.primary : (isToday ? lighten(THEME.primary, 0.78) : THEME.bg),
                color: isSel ? "#fff" : THEME.ink,
                border: `1.5px solid ${isSel ? THEME.primary : (isToday ? THEME.primary : THEME.line)}`,
                borderRadius: THEME.rMd, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                boxShadow: isSel ? `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}` : "none",
                transition: "all 0.15s",
              }}>
                <span style={{ fontFamily: F.mono, fontSize: 10, opacity: 0.7, fontWeight: 700 }}>{dow}</span>
                <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 900 }}>{num}</span>
                <div style={{ width: 22, height: 4, borderRadius: 2, background: isSel ? "rgba(255,255,255,0.4)" : THEME.line, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stats.pct}%`, background: isSel ? "#fff" : (stats.pct > 70 ? "#6BAD3A" : THEME.primary) }} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {mode === "month" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ fontFamily: F.display, fontSize: 10.5, fontWeight: 700, color: THEME.inkMuted, textAlign: "center", padding: 4 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} />;
              const isSel = d === selectedDate;
              const isToday = d === today;
              const stats = getStatsForDate(d);
              const num = parseInt(d.slice(-2));
              const isFuture = new Date(d + "T00:00:00") > new Date(today + "T00:00:00");
              return (
                <button key={d} onClick={() => !isFuture && setSelectedDate(d)} disabled={isFuture} style={{
                  aspectRatio: "1/1",
                  background: isSel ? THEME.primary : (isToday ? lighten(THEME.primary, 0.78) : THEME.bg),
                  color: isSel ? "#fff" : (isFuture ? THEME.inkFaint : THEME.ink),
                  border: `1.5px solid ${isSel ? THEME.primary : (isToday ? THEME.primary : THEME.line)}`,
                  borderRadius: THEME.rMd, cursor: isFuture ? "default" : "pointer",
                  position: "relative", padding: 4,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  opacity: isFuture ? 0.4 : 1,
                }}>
                  <span style={{ fontFamily: F.display, fontSize: 12.5, fontWeight: 800 }}>{num}</span>
                  {!isFuture && (
                    <span style={{
                      position: "absolute", bottom: 4, width: 5, height: 5, borderRadius: "50%",
                      background: isSel ? "#fff" : (stats.pct > 80 ? "#6BAD3A" : stats.pct > 40 ? THEME.primary : stats.pct > 0 ? TASK_PALETTE.catprep.fg : THEME.line),
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Task Card Large ────────────────────────────────────────────────────────────
function TaskCardLarge({ task, done, log, streak, rate, onToggle, onOpen, navigate }) {
  const p = TASK_PALETTE[task.id];
  if (!p) return null;
  return (
    <div style={{
      background: done ? lighten(p.fg, 0.85) : THEME.surface,
      border: `1.5px solid ${done ? p.edge : THEME.line}`,
      borderRadius: THEME.rLg, padding: 16,
      position: "relative", overflow: "hidden",
      boxShadow: done ? `0 4px 0 0 ${p.edge}, 0 8px 18px -6px ${p.edge}66` : THEME.shadowChunk,
      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      <div style={{ position: "absolute", top: -16, right: -16, opacity: done ? 0.5 : 0.28, pointerEvents: "none" }}>
        <Sticker kind="blob" color={p.bg} size={80} />
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: p.bg, border: `1.5px solid ${p.edge}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, flexShrink: 0,
        }}>{p.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 15, color: THEME.ink, lineHeight: 1.2 }}>
            {p.label}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {streak > 0 && (
              <span style={{ fontFamily: F.mono, fontSize: 10.5, color: p.deep, fontWeight: 700 }}>🔥 {streak}d</span>
            )}
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: THEME.inkMuted, fontWeight: 600 }}>{rate}% / 30d</span>
          </div>
        </div>
        <CheckBubble checked={done} onClick={onToggle} color={p.fg} size={32} />
      </div>
      {log.duration_min && (
        <div style={{ position: "relative", fontFamily: F.mono, fontSize: 11, color: p.deep, fontWeight: 600, marginBottom: 10 }}>
          ⏱️ {log.duration_min} min logged
        </div>
      )}
      <div style={{ position: "relative", display: "flex", gap: 6 }}>
        <button onClick={onOpen} style={{
          flex: 1, padding: "8px 12px", borderRadius: THEME.rMd,
          background: done ? "#fff" : p.bg, border: `1.5px solid ${p.edge}`,
          color: p.deep, fontFamily: F.display, fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>＋ Add details</button>
        <button
          onClick={() => navigate(DEEP_ROUTES[task.id] || "/tracker")}
          style={{
            width: 38, padding: "8px", borderRadius: THEME.rMd,
            background: done ? "#fff" : p.bg, border: `1.5px solid ${p.edge}`,
            color: p.deep, fontFamily: F.display, fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >→</button>
      </div>
    </div>
  );
}

// ─── Per-task forms ─────────────────────────────────────────────────────────────
function TaskSpecificForm({ taskId, log, onUpdate }) {
  const p = TASK_PALETTE[taskId];

  if (taskId === "gym") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Workout Type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Push","Pull","Legs","Cardio","Core","Rest"].map(t => (
              <Chip key={t} color={p.fg} active={log.type === t} onClick={() => onUpdate({ type: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="Duration" value={log.duration_min || ""} onChange={v => onUpdate({ duration_min: parseInt(v) || null })} suffix="min" placeholder="60" />
          <Input label="Calories" value={log.kcal || ""} onChange={v => onUpdate({ kcal: parseInt(v) || null })} suffix="kcal" placeholder="450" />
        </div>
        <EnergyPicker value={log.energy} onChange={v => onUpdate({ energy: v })} color={p.fg} label="How was energy?" />
        <TextArea label="Quick notes" value={log.notes || ""} onChange={v => onUpdate({ notes: v })} placeholder="PR on bench. Felt strong on incline." rows={2} />
        <div style={{ padding: "10px 14px", borderRadius: THEME.rMd, background: p.bg, border: `1.5px dashed ${p.edge}`, fontSize: 12, color: p.deep }}>
          💡 For full set/rep tracking, go to the <b>Gym</b> page.
        </div>
      </div>
    );
  }

  if (taskId === "jobprep") {
    return <JobPrepForm data={log} update={patch => onUpdate(patch)} />;
  }

  if (taskId === "book") {
    return <BookForm data={log} update={patch => onUpdate(patch)} />;
  }

  if (taskId === "catprep") {
    const data = log;
    const update = patch => onUpdate(patch);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Session Focus</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["QA","VARC","DILR","Full Mock","Topic Review"].map(t => (
              <Chip key={t} color={p.fg} active={data.section === t} onClick={() => update({ section: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="Duration" value={data.duration_min || ""} onChange={v => update({ duration_min: parseInt(v) || null })} suffix="min" />
          <Input label="Questions" value={data.questions || ""} onChange={v => update({ questions: parseInt(v) || null })} placeholder="20" />
        </div>
        <TextArea label="Notes" value={data.notes || ""} onChange={v => update({ notes: v })} placeholder="Track in Google Sheets, note highlights here..." rows={2} />
      </div>
    );
  }

  if (taskId === "sleep") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="Slept at" value={log.sleptAt || ""} onChange={v => onUpdate({ sleptAt: v })} icon="🌙" placeholder="12:00 AM" />
          <Input label="Woke up" value={log.wokeAt || ""} onChange={v => onUpdate({ wokeAt: v })} icon="🌅" placeholder="7:30 AM" />
        </div>
        <Input label="Total hours" value={log.hours || ""} onChange={v => onUpdate({ hours: v })} suffix="hrs" placeholder="7.5" />
        <EnergyPicker value={log.quality} onChange={v => onUpdate({ quality: v })} color={p.fg} label="Sleep quality" />
        <div style={{ padding: "10px 14px", borderRadius: THEME.rMd, background: p.bg, border: `1.5px dashed ${p.edge}`, fontSize: 12, color: p.deep }}>
          🎯 Target bedtime: <b>12:00 AM</b>
        </div>
      </div>
    );
  }

  if (taskId === "office") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Day Type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["WFO","WFH","Hybrid","Off"].map(t => (
              <Chip key={t} color={p.fg} active={log.dayType === t} onClick={() => onUpdate({ dayType: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="In" value={log.checkin || ""} onChange={v => onUpdate({ checkin: v })} icon="🏢" placeholder="11:00 AM" />
          <Input label="Out" value={log.checkout || ""} onChange={v => onUpdate({ checkout: v })} icon="🚪" placeholder="8:00 PM" />
        </div>
        <TextArea label="Biggest win" value={log.win || ""} onChange={v => onUpdate({ win: v })} placeholder="Shipped the auth refactor PR" rows={2} />
      </div>
    );
  }

  if (taskId === "decompress") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>How did you unwind?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[{l:"Walk",e:"🚶"},{l:"Music",e:"🎵"},{l:"Stretch",e:"🧘"},{l:"Tea",e:"🍵"},{l:"Chat",e:"💬"},{l:"Nothing",e:"😶"}].map(t => (
              <Chip key={t.l} color={p.fg} active={log.activity === t.l} onClick={() => onUpdate({ activity: t.l })} icon={t.e}>{t.l}</Chip>
            ))}
          </div>
        </div>
        <Input label="Duration" value={log.duration_min || ""} onChange={v => onUpdate({ duration_min: parseInt(v) || null })} suffix="min" placeholder="20" />
        <EnergyPicker value={log.feeling} onChange={v => onUpdate({ feeling: v })} color={p.fg} label="Feeling after" />
      </div>
    );
  }

  if (taskId === "diet") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "10px 14px", borderRadius: THEME.rMd, background: p.bg, border: `1.5px dashed ${p.edge}`, fontSize: 12.5, color: p.deep }}>
          🥗 For full macro & meal tracking, go to the <b>Diet</b> page.
        </div>
        <TextArea label="Quick notes" value={log.notes || ""} onChange={v => onUpdate({ notes: v })} placeholder="Ate clean. 2600 kcal." rows={2} />
      </div>
    );
  }

  // Generic: videditing, sidehustle, hobbies
  return <GenericForm data={log} update={patch => onUpdate(patch)} />;
}

// ─── Task Detail Sheet Modal ───────────────────────────────────────────────────
function TaskDetailSheet({ taskId, date, log, onClose, onUpdate }) {
  const p = TASK_PALETTE[taskId];
  if (!p) return null;
  const [draft, setDraft] = useState(log || {});
  const update = (patch) => setDraft(d => ({ ...d, ...patch }));

  const save = () => {
    onUpdate({ ...draft, done: true });
    onClose();
  };

  useEffect(() => {
    const handleKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(43,30,24,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="pop-in"
        style={{
          width: "100%", maxWidth: 560, maxHeight: "90vh",
          background: THEME.surface, borderRadius: THEME.rXl,
          border: `1.5px solid ${THEME.line}`,
          boxShadow: THEME.shadowLg,
          overflow: "auto",
        }}
      >
        {/* Banner */}
        <div style={{
          padding: "20px 24px", background: p.bg,
          borderBottom: `1.5px solid ${p.edge}`,
          display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -10, right: -10, pointerEvents: "none" }}>
            <Sticker kind="sparkle" color={p.fg} size={30} wiggle />
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: `0 2px 0 0 ${p.edge}`, flexShrink: 0,
          }}>{p.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: p.deep, fontWeight: 700, letterSpacing: 1 }}>
              LOG TASK · {formatShortDate(date).toUpperCase()}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: p.deep, lineHeight: 1.1, marginTop: 2 }}>
              {p.label}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: "50%", background: "#fff",
            border: `1.5px solid ${p.edge}`, color: p.deep, fontSize: 15,
            cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: 24 }}>
          <TaskSpecificForm taskId={taskId} log={draft} onUpdate={update} />
          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose} size="md">Cancel</Button>
            <Button variant="primary" color={p.fg} fullWidth onClick={save} size="md">
              {p.emoji} Save {p.label}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Tracker Page ──────────────────────────────────────────────────────────
export default function TrackerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const tracker = useTracker(user?.id);
  const [openTask, setOpenTask] = useState(null);

  const tasksForDay = getTasksForDay(selectedDate);
  const doneCount = tasksForDay.filter(t => tracker.isDone(selectedDate, t.id)).length;
  const totalMins = tasksForDay.reduce((s, t) => s + (tracker.getTaskData(selectedDate, t.id).duration_min || 0), 0);
  const pct = tasksForDay.length === 0 ? 0 : Math.round((doneCount / tasksForDay.length) * 100);
  const bestStreak = tracker.getBestStreak();
  const isSunday = new Date(selectedDate + "T00:00:00").getDay() === 0;

  const handleMonthChange = (year, month) => {
    const lastDay = new Date(year, month, 0).getDate();
    tracker.ensureRange(
      `${year}-${String(month).padStart(2,"0")}-01`,
      `${year}-${String(month).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        kicker="DAILY TRACKER"
        title={formatLongDate(selectedDate)}
        subtitle="Check off what you've done · Tap any card for details"
        sticker="blob"
        stickerColor={TASK_PALETTE.gym.bg}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(todayKey())}>Today</Button>
          </div>
        }
      />

      <CalendarStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        getStatsForDate={tracker.getStatsForDate}
        onMonthChange={handleMonthChange}
      />

      {/* Day summary */}
      <Card padding={24} style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, transform: "rotate(15deg)", pointerEvents: "none" }}>
          <Sticker kind="blob" color={lighten(THEME.primary, 0.78)} size={120} />
        </div>
        <div style={{ position: "relative", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <Ring pct={pct} size={100} stroke={10}
            color={pct > 70 ? "#6BAD3A" : pct > 40 ? THEME.primary : TASK_PALETTE.catprep.fg}
            sublabel="of today"
          />
          <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatTile
              label="Done" value={`${doneCount}/${tasksForDay.length}`}
              sublabel="tasks complete" color="#6BAD3A"
              sticker={<Sticker kind="dot" color="#6BAD3A" size={20} />}
            />
            <StatTile
              label="Best Streak" value={`${bestStreak}d`}
              sublabel="across all tasks" color={TASK_PALETTE.catprep.fg}
              sticker={<Sticker kind="star" color={TASK_PALETTE.catprep.fg} size={20} />}
            />
            <StatTile
              label="Mins Logged" value={`${totalMins}m`}
              sublabel="focused time" color={TASK_PALETTE.book.fg}
              sticker={<Sticker kind="donut" color={TASK_PALETTE.book.fg} size={20} />}
            />
          </div>
        </div>
        {isSunday && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: THEME.rMd,
            background: TASK_PALETTE.sleep.bg, border: `1.5px solid ${TASK_PALETTE.sleep.edge}`,
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 18 }}>😴</span>
            <span style={{ fontSize: 12.5, color: TASK_PALETTE.sleep.deep, lineHeight: 1.5 }}>
              <b>Rest day</b> — all tasks are optional. No pressure today.
            </span>
          </div>
        )}
      </Card>

      {/* Task grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {tasksForDay.map(task => (
          <TaskCardLarge
            key={task.id}
            task={task}
            done={tracker.isDone(selectedDate, task.id)}
            log={tracker.getTaskData(selectedDate, task.id)}
            streak={tracker.getStreak(task.id)}
            rate={tracker.getRate(task.id)}
            onToggle={() => tracker.toggle(selectedDate, task.id)}
            onOpen={() => setOpenTask(task.id)}
            navigate={navigate}
          />
        ))}
      </div>

      {tasksForDay.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: THEME.inkMuted, fontFamily: F.display, fontWeight: 600 }}>
          No tasks scheduled for this day.
        </div>
      )}

      <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: THEME.rMd, background: THEME.surfaceAlt, border: `1px solid ${THEME.line}` }}>
        <span style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: F.mono }}>
          ☁️ Synced to cloud · Tap any card to add details
        </span>
      </div>

      {openTask && (
        <TaskDetailSheet
          taskId={openTask}
          date={selectedDate}
          log={tracker.getTaskData(selectedDate, openTask)}
          onClose={() => setOpenTask(null)}
          onUpdate={patch => tracker.updateTaskDetails(selectedDate, openTask, patch)}
        />
      )}
    </div>
  );
}
