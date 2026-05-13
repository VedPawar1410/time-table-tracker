import { useState } from "react";
import Tracker from "./Tracker.jsx";

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button:hover { opacity: 0.85; }
`;

const C = {
  routine:    { bg: "#111827", bd: "#374151", tx: "#9CA3AF" },
  gym:        { bg: "#1C1200", bd: "#B45309", tx: "#FCD34D" },
  office:     { bg: "#052E16", bd: "#166534", tx: "#4ADE80" },
  meal:       { bg: "#0F172A", bd: "#334155", tx: "#94A3B8" },
  commute:    { bg: "#111827", bd: "#2D3748", tx: "#6B7280" },
  buffer:     { bg: "#022c22", bd: "#115E59", tx: "#5EEAD4" },
  decompress: { bg: "#052E16", bd: "#15803D", tx: "#86EFAC" },
  jobprep:    { bg: "#2D0000", bd: "#B91C1C", tx: "#FCA5A5" },
  catprep:    { bg: "#1C0E00", bd: "#B45309", tx: "#FDE68A" },
  book:       { bg: "#0A1628", bd: "#1D4ED8", tx: "#93C5FD" },
  ps5:        { bg: "#12052E", bd: "#7C3AED", tx: "#C4B5FD" },
  personal:   { bg: "#1A0520", bd: "#BE185D", tx: "#F9A8D4" },
  videditing: { bg: "#031525", bd: "#0369A1", tx: "#7DD3FC" },
  sidehustle: { bg: "#1A1000", bd: "#D97706", tx: "#FEF08A" },
  hobbies:    { bg: "#0D0520", bd: "#7C3AED", tx: "#DDD6FE" },
  sleep:      { bg: "#0D1533", bd: "#1E3A8A", tx: "#818CF8" },
};

const weekdaySchedule = [
  { time: "7:30 – 7:45 AM",     cat: "routine",    label: "Wake up + Quick Freshen",    note: "Brush, face wash only — save the full bath for after gym" },
  { time: "7:45 – 8:45 AM",     cat: "gym",        label: "Gym or Cardio",              note: "Mon / Wed / Fri → Gym   ·   Tue / Thu → Cardio", tag: "60 min" },
  { time: "8:45 – 9:15 AM",     cat: "routine",    label: "Shower + Get Dressed",       note: "Proper post-workout bath here, not before" },
  { time: "9:15 – 9:45 AM",     cat: "meal",       label: "Breakfast",                  note: "At PG — sit down, don't rush it" },
  { time: "9:45 – 10:30 AM",    cat: "buffer",     label: "Morning Buffer",             note: "Side hustle browsing, hobbies, mindless scroll — completely pressure-free", tag: "Flex" },
  { time: "10:30 – 11:00 AM",   cat: "commute",    label: "Commute to Office",          note: "" },
  { time: "11:00 AM – 8:00 PM", cat: "office",     label: "Office",                     note: "Lunch at 2 PM included — give 100% here, nothing productive expected outside this block", tag: "9 hrs" },
  { time: "8:00 – 8:30 PM",     cat: "commute",    label: "Commute Home",               note: "" },
  { time: "8:30 – 9:00 PM",     cat: "meal",       label: "Dinner + Calls",             note: "Eat while calling GF / family / friends — multitask and recover an entire block", tag: "💡 Tip" },
  { time: "9:00 – 9:20 PM",     cat: "decompress", label: "Decompress",                 note: "No obligations. No screen pressure. Just breathe after 9 hrs at office." },
  { time: "9:20 – 10:20 PM",    cat: "jobprep",    label: "Job Prep",                   note: "DSA · LeetCode · System Design · Mock Interviews — this block NEVER moves", tag: "🔥 Daily" },
  { time: "10:20 – 10:50 PM",   cat: "book",       label: "Book Reading",               note: "30 min daily — non-negotiable, even 20 pages counts" },
  { time: "10:50 PM – 12:00 AM", cat: "ps5",       label: "Rotating Evening Block",     note: "See the Evening Rotation tab for what fills this slot each day →", tag: "→ Next tab" },
  { time: "12:00 – 7:30 AM",    cat: "sleep",      label: "Sleep",                      note: "7.5 hours — do not negotiate with this", tag: "7.5 hrs" },
];

const rotation = [
  { day: "MON", sub: "Gym", items: [
    { cat: "catprep",    label: "CAT Prep",       dur: "35 min" },
    { cat: "videditing", label: "Video Editing",  dur: "35 min" },
  ]},
  { day: "TUE", sub: "Cardio", items: [
    { cat: "ps5",        label: "PS5",            dur: "60 min" },
    { cat: "decompress", label: "Wind Down",      dur: "10 min" },
  ]},
  { day: "WED", sub: "Gym", items: [
    { cat: "catprep",    label: "CAT Prep",       dur: "35 min" },
    { cat: "sidehustle", label: "Side Hustle",    dur: "35 min" },
  ]},
  { day: "THU", sub: "Cardio", items: [
    { cat: "ps5",        label: "PS5",            dur: "60 min" },
    { cat: "decompress", label: "Wind Down",      dur: "10 min" },
  ]},
  { day: "FRI", sub: "Gym", items: [
    { cat: "hobbies",    label: "Hobbies / Projects", dur: "40 min" },
    { cat: "sidehustle", label: "Side Hustle",    dur: "30 min" },
  ]},
];

const weekendList = [
  { rank: 1,  cat: "gym",        label: "Gym or Cardio",        time: "~1 hr",             note: "Continue the alternating rotation from weekdays" },
  { rank: 2,  cat: "jobprep",    label: "Job Prep",             time: "2 hrs",             note: "More time = go deeper — harder problems, mock interviews, full system design" },
  { rank: 3,  cat: "catprep",    label: "CAT Prep",             time: "1.5 hrs",           note: "Weekend is your main CAT session — quant, verbal, full mock tests" },
  { rank: 4,  cat: "videditing", label: "Video Editing",        time: "1 hr",              note: "Follow a course, edit something real, ship a small project" },
  { rank: 5,  cat: "sidehustle", label: "Side Hustle Work",     time: "1–2 hrs",           note: "Active building — not just researching, actually making things" },
  { rank: 6,  cat: "hobbies",    label: "Hobbies & Projects",   time: "1–2 hrs",           note: "Blog, podcast, personal software — your creative & builder time" },
  { rank: 7,  cat: "ps5",        label: "PS5 Gaming",           time: "No limit",          note: "Fully guilt-free. You've earned this. Don't clock-watch here." },
  { rank: 8,  cat: "book",       label: "Book Reading",         time: "30+ min",           note: "Can extend here since weekends have more breathing room" },
  { rank: 9,  cat: "routine",    label: "Laundry + Chores",     time: "30–45 min",         note: "Batch all chores on Sunday to keep Saturday free" },
  { rank: 10, cat: "personal",   label: "Friends Outing",       time: "As needed",         note: "Max once per weekend — protect everything else around it" },
  { rank: 11, cat: "decompress", label: "Free Time / YouTube",  time: "Whatever's left",   note: "Completely guilt-free rest. You're not behind." },
];

const rules = [
  { icon: "🔥", title: "Job Prep is Sacred", body: "9:20–10:20 PM runs every single day without exception. Rough day at work? Still go. Friday night? Still go. This is the one block that never moves, never gets traded, never shrinks." },
  { icon: "🚿", title: "Bath Goes AFTER Gym", body: "Don't shower twice. Just brush and splash water before gym. Shower after the workout. You save 30 minutes in your morning without cutting anything real." },
  { icon: "📱", title: "Dinner + Calls = One Block", body: "You need to eat. You need to connect with people you love. Do both at 8:30 PM. Multitasking here frees an entire 30-min block later in the evening." },
  { icon: "🎮", title: "PS5 is Earned, Not Default", body: "Weekday PS5 only happens on Tue and Thu evenings. Other days the slot goes to CAT/Video Editing/Side Hustle. Full gaming freedom returns on weekends — no guilt there." },
  { icon: "🌅", title: "Morning Buffer is Intentional", body: "9:45–10:30 AM is deliberately unstructured. Side hustle research, hobbies, scrolling, or just sitting. It's a pressure valve before a 9-hour office stretch." },
  { icon: "📅", title: "Weekends Are Your Deep Work Zone", body: "Weekdays are optimized around the office. Real progress on CAT, video editing, and side hustle happens on weekends. Guard that time like you guard sleep." },
];

function Block({ time, cat, label, note, tag }) {
  const c = C[cat];
  return (
    <div style={{ display: "flex", gap: 14, padding: "11px 16px", borderRadius: 10, background: c.bg, border: `1px solid ${c.bd}`, marginBottom: 5 }}>
      <div style={{ minWidth: 148, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#3D5068", paddingTop: 3, lineHeight: 1.4 }}>{time}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: c.tx, fontWeight: 500, fontSize: 13.5 }}>{label}</span>
          {tag && <span style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 4, background: c.bd + "99", color: c.tx, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.3 }}>{tag}</span>}
        </div>
        {note && <div style={{ color: "#3D5068", fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{note}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("weekday");

  const tabs = [
    { id: "weekday", label: "Weekday" },
    { id: "evening", label: "Evening Rotation" },
    { id: "weekend", label: "Weekend" },
    { id: "rules",   label: "Key Rules" },
    { id: "tracker", label: "📊 Tracker" },
  ];

  return (
    <>
      <style>{FONT}</style>
      <div style={{ minHeight: "100vh", background: "#08091A", fontFamily: "'DM Sans', sans-serif", color: "#E2E8F0", padding: "28px 20px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 4, color: "#4ADE80", textTransform: "uppercase", marginBottom: 10 }}>
              Personal Productivity System · 22 · Hyderabad
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, letterSpacing: -1 }}>
              Your Master<br />Timetable
            </h1>
            <p style={{ color: "#3D5068", fontSize: 13.5, lineHeight: 1.7 }}>
              Built around your 11–8 office schedule · Job prep as top priority · Morning gym · Weekend freedom
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {tabs.map(t => {
              const isTracker = t.id === "tracker";
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "8px 18px", borderRadius: 8,
                  border: `1px solid ${
                    isActive
                      ? isTracker ? "#5EEAD4" : "#4ADE80"
                      : "#1E293B"
                  }`,
                  background: isActive
                    ? isTracker ? "#022c22" : "#052E16"
                    : "transparent",
                  color: isActive
                    ? isTracker ? "#5EEAD4" : "#4ADE80"
                    : "#4A5568",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: isActive ? 500 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                }}>{t.label}</button>
              );
            })}
          </div>

          {/* Weekday Tab */}
          {tab === "weekday" && (
            <div>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "#4A5568" }}>
                  ⏰ Wake time shifts from your current 9 AM → <strong style={{ color: "#94A3B8" }}>7:30 AM</strong>.
                  That extra 1.5 hrs is where the gym lives. Everything else stays intact.
                </span>
              </div>
              {weekdaySchedule.map((b, i) => <Block key={i} {...b} />)}
            </div>
          )}

          {/* Evening Rotation Tab */}
          {tab === "evening" && (
            <div>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 20 }}>
                <span style={{ fontSize: 12.5, color: "#4A5568", lineHeight: 1.6 }}>
                  Every weekday from <strong style={{ color: "#94A3B8" }}>10:50 PM – 12:00 AM</strong>, after Job Prep + Book Reading, this is what fills the slot:
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                {rotation.map((r) => (
                  <div key={r.day} style={{ flex: "0 0 130px", borderRadius: 10, border: "1px solid #1E293B", background: "#0D1117", overflow: "hidden" }}>
                    <div style={{ background: "#111827", padding: "10px 12px", borderBottom: "1px solid #1E293B" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#E2E8F0" }}>{r.day}</div>
                      <div style={{ fontSize: 11, color: "#4A5568", fontFamily: "'IBM Plex Mono', monospace" }}>{r.sub}</div>
                    </div>
                    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {r.items.map((item, i) => {
                        const c = C[item.cat];
                        return (
                          <div key={i} style={{ padding: "9px 10px", borderRadius: 8, background: c.bg, border: `1px solid ${c.bd}` }}>
                            <div style={{ color: c.tx, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                            <div style={{ color: "#3D5068", fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace" }}>{item.dur}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#12052E", border: "1px solid #5B21B6" }}>
                <span style={{ fontSize: 12.5, color: "#A78BFA", lineHeight: 1.6 }}>
                  🎮 <strong>PS5 logic:</strong> You get 2 PS5 sessions per weekday week (Tue + Thu), not 5.
                  The other 3 evenings go to building things that matter right now.
                  Full unlimited gaming returns on weekends.
                </span>
              </div>
            </div>
          )}

          {/* Weekend Tab */}
          {tab === "weekend" && (
            <div>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, color: "#4A5568", lineHeight: 1.6 }}>
                  No fixed times. Work down this list in order. Once the top priorities are done, the rest of the day is yours.
                  Suggested wake: <strong style={{ color: "#94A3B8" }}>8:30–9 AM</strong> — slight lie-in, but not a full reset of your schedule.
                </span>
              </div>
              {weekendList.map((p) => {
                const c = C[p.cat];
                return (
                  <div key={p.rank} style={{ display: "flex", gap: 14, padding: "12px 16px", borderRadius: 10, background: c.bg, border: `1px solid ${c.bd}`, marginBottom: 5 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500, color: "#1E2A3A", minWidth: 30, paddingTop: 3 }}>
                      {p.rank < 10 ? `0${p.rank}` : p.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ color: c.tx, fontWeight: 500, fontSize: 13.5 }}>{p.label}</span>
                        <span style={{ fontSize: 10.5, color: "#3D5068", fontFamily: "'IBM Plex Mono', monospace" }}>{p.time}</span>
                      </div>
                      <div style={{ color: "#3D5068", fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{p.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rules Tab */}
          {tab === "rules" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {rules.map((r, i) => (
                <div key={i} style={{ padding: "18px 18px", borderRadius: 12, background: "#0D1117", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{r.icon}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 8, color: "#E2E8F0", lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ color: "#4A5568", fontSize: 12.5, lineHeight: 1.7 }}>{r.body}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tracker Tab */}
          {tab === "tracker" && <Tracker />}

        </div>
      </div>
    </>
  );
}
