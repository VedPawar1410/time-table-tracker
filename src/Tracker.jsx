import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "timetable_tracker";

export const TRACKED_TASKS = [
  { id: "gym",        label: "Gym / Cardio",       icon: "💪", bd: "#B45309", tx: "#FCD34D", bg: "#1C1200" },
  { id: "jobprep",    label: "Job Prep",            icon: "🔥", bd: "#B91C1C", tx: "#FCA5A5", bg: "#2D0000" },
  { id: "book",       label: "Book Reading",        icon: "📘", bd: "#1D4ED8", tx: "#93C5FD", bg: "#0A1628" },
  { id: "catprep",    label: "CAT Prep",            icon: "🎯", bd: "#B45309", tx: "#FDE68A", bg: "#1C0E00" },
  { id: "videditing", label: "Video Editing",       icon: "🎬", bd: "#0369A1", tx: "#7DD3FC", bg: "#031525" },
  { id: "sidehustle", label: "Side Hustle",         icon: "💡", bd: "#D97706", tx: "#FEF08A", bg: "#1A1000" },
  { id: "hobbies",    label: "Hobbies & Projects",  icon: "🎨", bd: "#7C3AED", tx: "#DDD6FE", bg: "#0D0520" },
  { id: "sleep",      label: "Sleep by 12 AM",      icon: "😴", bd: "#1E3A8A", tx: "#818CF8", bg: "#0D1533" },
  { id: "office",     label: "Office",              icon: "🏢", bd: "#166534", tx: "#4ADE80", bg: "#052E16" },
  { id: "decompress", label: "Decompress",          icon: "🌿", bd: "#115E59", tx: "#5EEAD4", bg: "#022c22" },
];

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

function getLastNDays(n = 30) {
  return Array.from({ length: n }, (_, i) => getDateKey(n - 1 - i));
}

function formatDateShort(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatLongDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const todayKey = getDateKey();
  const yestKey = getDateKey(1);
  if (dateKey === todayKey) return "Today, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  if (dateKey === yestKey) return "Yesterday, " + d.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}

// ─── useTracker Hook ──────────────────────────────────────────────────────────

function useTracker() {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Handle both old boolean format and new object format gracefully
  const isDone = useCallback((dateKey, taskId) => {
    const entry = data[dateKey]?.[taskId];
    if (typeof entry === 'object' && entry !== null) return !!entry.done;
    return !!entry;
  }, [data]);

  const getTaskData = useCallback((dateKey, taskId) => {
    const entry = data[dateKey]?.[taskId];
    if (typeof entry === 'object' && entry !== null) return entry;
    if (entry === true) return { done: true };
    return { done: false };
  }, [data]);

  const toggle = useCallback((dateKey, taskId) => {
    setData(prev => {
      const prevDay = prev[dateKey] || {};
      const prevEntry = prevDay[taskId];
      let newEntry;
      
      if (typeof prevEntry === 'object' && prevEntry !== null) {
        newEntry = { ...prevEntry, done: !prevEntry.done };
      } else {
        newEntry = { done: !prevEntry };
      }

      return { ...prev, [dateKey]: { ...prevDay, [taskId]: newEntry } };
    });
  }, []);

  const updateTaskDetails = useCallback((dateKey, taskId, details) => {
    setData(prev => {
      const prevDay = prev[dateKey] || {};
      const prevEntry = prevDay[taskId];
      let baseEntry = { done: false };
      
      if (typeof prevEntry === 'object' && prevEntry !== null) {
        baseEntry = prevEntry;
      } else if (prevEntry === true) {
        baseEntry = { done: true };
      }

      return { ...prev, [dateKey]: { ...prevDay, [taskId]: { ...baseEntry, ...details } } };
    });
  }, []);

  const getStreak = useCallback((taskId) => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      if (isDone(getDateKey(i), taskId)) streak++;
      else break;
    }
    return streak;
  }, [isDone]);

  const getRate = useCallback((taskId) => {
    const days = getLastNDays(30);
    const doneCount = days.filter(d => isDone(d, taskId)).length;
    return Math.round((doneCount / days.length) * 100);
  }, [isDone]);

  const getStatsForDate = useCallback((dateKey) => {
    const doneCount = TRACKED_TASKS.filter(t => isDone(dateKey, t.id)).length;
    const total = TRACKED_TASKS.length;
    return { done: doneCount, total, pct: Math.round((doneCount / total) * 100) };
  }, [isDone]);

  const getBestStreak = useCallback(() => {
    return Math.max(...TRACKED_TASKS.map(t => getStreak(t.id)), 0);
  }, [getStreak]);

  return { toggle, isDone, getTaskData, updateTaskDetails, getStreak, getRate, getStatsForDate, getBestStreak };
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function Ring({ pct, size = 88, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? "#4ADE80" : pct >= 70 ? "#FCD34D" : pct >= 40 ? "#7DD3FC" : "#FCA5A5";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: color, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <label style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#08091A", border: "1px solid #1E293B", borderRadius: 6,
          padding: "8px 10px", color: "#E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: "100%", transition: "border-color 0.2s"
        }}
        onFocus={e => e.target.style.borderColor = "#3D5068"}
        onBlur={e => e.target.style.borderColor = "#1E293B"}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{
          background: "#08091A", border: "1px solid #1E293B", borderRadius: 6,
          padding: "8px 10px", color: "#E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: "100%", resize: "vertical", transition: "border-color 0.2s"
        }}
        onFocus={e => e.target.style.borderColor = "#3D5068"}
        onBlur={e => e.target.style.borderColor = "#1E293B"}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <label style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#08091A", border: "1px solid #1E293B", borderRadius: 6,
          padding: "8px 10px", color: "#E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: "100%", appearance: "none"
        }}
      >
        <option value="" disabled>Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Task Specific Forms ──────────────────────────────────────────────────────

function GymForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, padding: "12px", background: "#05060A", borderRadius: 8, border: "1px solid #1E293B" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Select label="Type" value={data.type} onChange={v => update({ type: v })} options={[{value:"weights", label:"Weights"}, {value:"cardio", label:"Cardio"}, {value:"mixed", label:"Mixed"}]} />
        <Input label="Duration (min)" type="number" value={data.duration} onChange={v => update({ duration: v })} placeholder="60" />
      </div>
      <TextArea label="Workout Notes" value={data.notes} onChange={v => update({ notes: v })} placeholder="e.g. Heavy squats, PR on bench" />
    </div>
  );
}

function JobPrepForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, padding: "12px", background: "#05060A", borderRadius: 8, border: "1px solid #1E293B" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Select label="Focus" value={data.focus} onChange={v => update({ focus: v })} options={[{value:"leetcode", label:"LeetCode"}, {value:"sysdesign", label:"System Design"}, {value:"mock", label:"Mock Interview"}, {value:"other", label:"Other"}]} />
        <Input label="Problems Solved" type="number" value={data.count} onChange={v => update({ count: v })} placeholder="2" />
      </div>
      <TextArea label="What did you learn?" value={data.notes} onChange={v => update({ notes: v })} placeholder="Dynamic programming trick, system design tradeoffs..." />
    </div>
  );
}

function BookReadingForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, padding: "12px", background: "#05060A", borderRadius: 8, border: "1px solid #1E293B" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Input label="Book Title" value={data.book} onChange={v => update({ book: v })} placeholder="Name of the book" />
        <Input label="Pages Read" type="number" value={data.pages} onChange={v => update({ pages: v })} placeholder="15" />
      </div>
      <TextArea label="Key Takeaways" value={data.notes} onChange={v => update({ notes: v })} placeholder="Interesting quotes or ideas..." />
    </div>
  );
}

function SleepForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, padding: "12px", background: "#05060A", borderRadius: 8, border: "1px solid #1E293B" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Input label="Bedtime" type="time" value={data.time} onChange={v => update({ time: v })} />
        <Select label="Quality (1-5)" value={data.quality} onChange={v => update({ quality: v })} options={[{value:"1", label:"1 - Poor"}, {value:"2", label:"2 - Fair"}, {value:"3", label:"3 - Good"}, {value:"4", label:"4 - Very Good"}, {value:"5", label:"5 - Excellent"}]} />
      </div>
      <TextArea label="Notes" value={data.notes} onChange={v => update({ notes: v })} placeholder="Woke up feeling..." />
    </div>
  );
}

function GenericForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, padding: "12px", background: "#05060A", borderRadius: 8, border: "1px solid #1E293B" }}>
      <TextArea label="Daily Notes & Tracking" value={data.notes} onChange={v => update({ notes: v })} placeholder="What did you do? How did it go?" />
    </div>
  );
}

// ─── Task Card Component ──────────────────────────────────────────────────────

function StatBadge({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: "#08091A", border: "1px solid #1E293B", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "#3D5068", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function TaskCard({ task, selectedDate, isDone, getTaskData, toggle, updateTaskDetails, streak, rate }) {
  const [expanded, setExpanded] = useState(false);
  const done = isDone(selectedDate, task.id);
  const taskData = getTaskData(selectedDate, task.id);

  const update = (newDetails) => {
    updateTaskDetails(selectedDate, task.id, newDetails);
  };

  // Select form based on task ID
  let SpecificForm = GenericForm;
  if (task.id === "gym") SpecificForm = GymForm;
  if (task.id === "jobprep") SpecificForm = JobPrepForm;
  if (task.id === "book") SpecificForm = BookReadingForm;
  if (task.id === "sleep") SpecificForm = SleepForm;

  return (
    <div style={{
      borderRadius: 12, background: done ? task.bg : "#0D1117", border: `1px solid ${done ? task.bd : "#1E293B"}`,
      overflow: "hidden", transition: "border-color 0.25s, background 0.25s",
    }}>
      {/* Main row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{task.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: done ? task.tx : "#94A3B8", fontWeight: 500, fontSize: 13, transition: "color 0.25s",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {task.label}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center", flexWrap: "wrap" }}>
            {streak > 0 && <span style={{ fontSize: 10, color: task.tx, opacity: 0.85, fontFamily: "'IBM Plex Mono', monospace" }}>🔥{streak}d</span>}
            <span style={{ fontSize: 10, color: "#2D3748", fontFamily: "'IBM Plex Mono', monospace" }}>{rate}%</span>
          </div>
        </div>

        {/* Done toggle button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(selectedDate, task.id); }}
          style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            border: `1.5px solid ${done ? task.bd : "#374151"}`, background: done ? task.bd + "44" : "transparent",
            color: done ? task.tx : "#374151", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", fontWeight: 700,
          }}
        >
          {done ? "✓" : "○"}
        </button>

        {/* Chevron */}
        <span style={{ color: "#1E293B", fontSize: 10, flexShrink: 0, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▼
        </span>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div style={{ padding: "2px 14px 14px", borderTop: `1px solid ${task.bd}22` }}>
          
          <SpecificForm data={taskData} update={update} />

          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <StatBadge label="Current Streak" value={streak > 0 ? `${streak}d` : "—"} color={task.tx} />
            <StatBadge label="30-Day Rate" value={`${rate}%`} color={task.tx} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Header & Calendar Component ──────────────────────────────────────────────

function SelectedDateHeader({ dateKey, stats, bestStreak }) {
  return (
    <div style={{
      padding: "18px 20px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 20,
    }}>
      <Ring pct={stats.pct} />

      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#4ADE80",
          letterSpacing: 3, textTransform: "uppercase", marginBottom: 5,
        }}>
          {dateKey === getDateKey() ? "Today's Progress" : "Daily Progress"}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#E2E8F0", marginBottom: 5, lineHeight: 1.2 }}>
          {formatLongDate(dateKey)}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#3D5068" }}>
            <span style={{ color: stats.done > 0 ? "#4ADE80" : "#3D5068", fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{stats.done}</span>
            <span style={{ color: "#2D3748" }}> / {stats.total} done</span>
          </div>
          {bestStreak > 0 && (
            <div style={{ fontSize: 12, color: "#3D5068" }}>
              <span style={{ color: "#FCD34D" }}>🔥 {bestStreak}d</span>
              <span style={{ color: "#2D3748" }}> best streak</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ selectedDate, setSelectedDate }) {
  const scrollRef = useRef(null);
  const days = getLastNDays(14).reverse(); // Show last 14 days

  // Scroll to right most (today) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: "#4A5568", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Select a Day
      </div>
      <div 
        ref={scrollRef}
        style={{ 
          display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8,
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE
        }}
      >
        {days.map(day => {
          const isSelected = day === selectedDate;
          const isToday = day === getDateKey();
          const d = new Date(day + "T00:00:00");
          const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
          const dom = d.getDate();

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(day)}
              style={{
                flex: "0 0 54px", height: 60, borderRadius: 10,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                cursor: "pointer", transition: "all 0.2s",
                background: isSelected ? "#022c22" : "#0D1117",
                border: `1px solid ${isSelected ? "#115E59" : "#1E293B"}`,
                boxShadow: isSelected ? "0 0 10px rgba(17, 94, 89, 0.5)" : "none",
              }}
            >
              <div style={{ fontSize: 10, color: isSelected ? "#5EEAD4" : "#94A3B8", fontFamily: "'IBM Plex Mono', monospace" }}>
                {weekday}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: isSelected ? "#4ADE80" : "#E2E8F0" }}>
                {dom}
              </div>
              {isToday && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#FCD34D", marginTop: 2 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Tracker Component ───────────────────────────────────────────────────

export default function Tracker() {
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const { toggle, isDone, getTaskData, updateTaskDetails, getStreak, getRate, getStatsForDate, getBestStreak } = useTracker();
  
  const stats = getStatsForDate(selectedDate);
  const bestStreak = getBestStreak();

  return (
    <div>
      <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <SelectedDateHeader dateKey={selectedDate} stats={stats} bestStreak={bestStreak} />

      {/* Task grid — 2 columns */}
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

      {/* Footer */}
      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "#0D1117", border: "1px solid #1E293B" }}>
        <span style={{ fontSize: 11.5, color: "#2D3748" }}>
          💾 Data saved in your browser · Tap any card to add details & view history · Tap the circle button to mark done
        </span>
      </div>
    </div>
  );
}
