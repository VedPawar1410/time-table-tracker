import { useState } from "react";
import { C, FONTS, THEME } from "../lib/constants.js";
import Chip from "../components/ui/Chip.jsx";

const weekdaySchedule = [
  { time: "7:30 – 7:45 AM",      cat: "routine",    label: "Wake up + Quick Freshen",    note: "Brush, face wash only — save the full bath for after gym" },
  { time: "7:45 – 8:45 AM",      cat: "gym",        label: "Gym or Cardio",              note: "Mon / Wed / Fri → Gym   ·   Tue / Thu → Cardio", tag: "60 min" },
  { time: "8:45 – 9:15 AM",      cat: "routine",    label: "Shower + Get Dressed",       note: "Proper post-workout bath here, not before" },
  { time: "9:15 – 9:45 AM",      cat: "meal",       label: "Breakfast",                  note: "At PG — sit down, don't rush it" },
  { time: "9:45 – 10:30 AM",     cat: "buffer",     label: "Morning Buffer",             note: "Side hustle browsing, hobbies, mindless scroll — completely pressure-free", tag: "Flex" },
  { time: "10:30 – 11:00 AM",    cat: "commute",    label: "Commute to Office",          note: "" },
  { time: "11:00 AM – 8:00 PM",  cat: "office",     label: "Office",                     note: "Lunch at 2 PM included — give 100% here, nothing productive expected outside", tag: "9 hrs" },
  { time: "8:00 – 8:30 PM",      cat: "commute",    label: "Commute Home",               note: "" },
  { time: "8:30 – 9:00 PM",      cat: "meal",       label: "Dinner + Calls",             note: "Eat while calling GF / family / friends — multitask and recover an entire block", tag: "💡 Tip" },
  { time: "9:00 – 9:20 PM",      cat: "decompress", label: "Decompress",                 note: "No obligations. No screen pressure. Just breathe after 9 hrs at office." },
  { time: "9:20 – 10:20 PM",     cat: "jobprep",    label: "Job Prep",                   note: "DSA · LeetCode · System Design · Mock Interviews — this block NEVER moves", tag: "🔥 Daily" },
  { time: "10:20 – 10:50 PM",    cat: "book",       label: "Book Reading",               note: "30 min daily — non-negotiable, even 20 pages counts" },
  { time: "10:50 PM – 12:00 AM", cat: "ps5",        label: "Rotating Evening Block",     note: "See the Evening Rotation tab for what fills this slot each day →", tag: "→ Next tab" },
  { time: "12:00 – 7:30 AM",     cat: "sleep",      label: "Sleep",                      note: "7.5 hours — do not negotiate with this", tag: "7.5 hrs" },
];

const rotation = [
  { day: "MON", sub: "Gym",    items: [{ cat: "catprep", label: "CAT Prep", dur: "35 min" }, { cat: "videditing", label: "Video Editing", dur: "35 min" }] },
  { day: "TUE", sub: "Cardio", items: [{ cat: "ps5", label: "PS5", dur: "60 min" }, { cat: "decompress", label: "Wind Down", dur: "10 min" }] },
  { day: "WED", sub: "Gym",    items: [{ cat: "catprep", label: "CAT Prep", dur: "35 min" }, { cat: "sidehustle", label: "Side Hustle", dur: "35 min" }] },
  { day: "THU", sub: "Cardio", items: [{ cat: "ps5", label: "PS5", dur: "60 min" }, { cat: "decompress", label: "Wind Down", dur: "10 min" }] },
  { day: "FRI", sub: "Gym",    items: [{ cat: "hobbies", label: "Hobbies / Projects", dur: "40 min" }, { cat: "sidehustle", label: "Side Hustle", dur: "30 min" }] },
];

const weekendList = [
  { rank: 1,  cat: "gym",        label: "Gym or Cardio",        time: "~1 hr",           note: "Continue the alternating rotation from weekdays" },
  { rank: 2,  cat: "jobprep",    label: "Job Prep",             time: "2 hrs",           note: "More time = go deeper — harder problems, mock interviews" },
  { rank: 3,  cat: "catprep",    label: "CAT Prep",             time: "1.5 hrs",         note: "Weekend is your main CAT session — quant, verbal, full mocks" },
  { rank: 4,  cat: "videditing", label: "Video Editing",        time: "1 hr",            note: "Follow a course, edit something real, ship a small project" },
  { rank: 5,  cat: "sidehustle", label: "Side Hustle Work",     time: "1–2 hrs",         note: "Active building — not just researching, actually making things" },
  { rank: 6,  cat: "hobbies",    label: "Hobbies & Projects",   time: "1–2 hrs",         note: "Blog, podcast, personal software — your creative time" },
  { rank: 7,  cat: "ps5",        label: "PS5 Gaming",           time: "No limit",        note: "Fully guilt-free. You've earned this. Don't clock-watch here." },
  { rank: 8,  cat: "book",       label: "Book Reading",         time: "30+ min",         note: "Can extend here since weekends have more breathing room" },
  { rank: 9,  cat: "routine",    label: "Laundry + Chores",     time: "30–45 min",       note: "Batch all chores on Sunday to keep Saturday free" },
  { rank: 10, cat: "personal",   label: "Friends Outing",       time: "As needed",       note: "Max once per weekend — protect everything else around it" },
  { rank: 11, cat: "decompress", label: "Free Time / YouTube",  time: "Whatever's left", note: "Completely guilt-free rest. You're not behind." },
];

const rules = [
  { icon: "🔥", title: "Job Prep is Sacred", body: "9:20–10:20 PM runs every single day without exception. Rough day at work? Still go. Friday night? Still go." },
  { icon: "🚿", title: "Bath Goes AFTER Gym", body: "Don't shower twice. Just brush and splash before gym. Shower after. You save 30 minutes in your morning." },
  { icon: "📱", title: "Dinner + Calls = One Block", body: "You need to eat. You need to connect. Do both at 8:30 PM. Multitasking here frees an entire block later." },
  { icon: "🎮", title: "PS5 is Earned, Not Default", body: "Weekday PS5 only on Tue and Thu. Other days go to building things. Full gaming freedom returns on weekends." },
  { icon: "🌅", title: "Morning Buffer is Intentional", body: "9:45–10:30 AM is deliberately unstructured. Side hustle research, hobbies, scrolling — pressure valve before office." },
  { icon: "📅", title: "Weekends Are Your Deep Work Zone", body: "Weekdays are optimized around the office. Real progress on CAT, video, and side hustle happens on weekends." },
];

function Block({ time, cat, label, note, tag }) {
  const c = C[cat];
  return (
    <div style={{
      display: "flex", gap: 14, padding: "11px 16px",
      borderRadius: THEME.rSm, background: c.bg,
      border: `1px solid ${c.bd}`, marginBottom: 5,
    }}>
      <div style={{
        minWidth: 148, fontFamily: FONTS.mono, fontSize: 10.5,
        color: THEME.inkMuted, paddingTop: 3, lineHeight: 1.4,
      }}>
        {time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: c.tx, fontWeight: 600, fontSize: 13.5, fontFamily: FONTS.nunito }}>{label}</span>
          {tag && (
            <span style={{
              fontSize: 9.5, padding: "2px 7px", borderRadius: THEME.rPill,
              background: c.bd + "66", color: c.tx,
              fontFamily: FONTS.mono, letterSpacing: "0.04em",
            }}>
              {tag}
            </span>
          )}
        </div>
        {note && (
          <div style={{ color: THEME.inkMuted, fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{note}</div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("weekday");
  const tabs = [
    { id: "weekday", label: "Weekday" },
    { id: "evening", label: "Evening Rotation" },
    { id: "weekend", label: "Weekend" },
    { id: "rules",   label: "Key Rules" },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONTS.sans, color: THEME.ink, padding: "28px 20px 60px", background: THEME.bg }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.22em", color: THEME.primary, textTransform: "uppercase", marginBottom: 10 }}>
            Personal Productivity System · 22 · Hyderabad
          </div>
          <h1 style={{ fontFamily: FONTS.nunito, fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: -0.5, color: THEME.ink }}>
            Your Master<br />Timetable
          </h1>
          <p style={{ color: THEME.inkSoft, fontSize: 13.5, lineHeight: 1.7 }}>
            Built around your 11–8 office schedule · Job prep as top priority · Morning gym · Weekend freedom
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <Chip
              key={t.id}
              label={t.label}
              active={tab === t.id}
              color={THEME.primary}
              onClick={() => setTab(t.id)}
            />
          ))}
        </div>

        {tab === "weekday" && (
          <div>
            <div style={{
              padding: "10px 14px", borderRadius: THEME.rSm,
              background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, marginBottom: 16,
            }}>
              <span style={{ fontSize: 12, color: THEME.inkSoft }}>
                ⏰ Wake time shifts from your current 9 AM → <strong style={{ color: THEME.ink }}>7:30 AM</strong>. That extra 1.5 hrs is where the gym lives.
              </span>
            </div>
            {weekdaySchedule.map((b, i) => <Block key={i} {...b} />)}
          </div>
        )}

        {tab === "evening" && (
          <div>
            <div style={{
              padding: "10px 14px", borderRadius: THEME.rSm,
              background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, marginBottom: 20,
            }}>
              <span style={{ fontSize: 12.5, color: THEME.inkSoft, lineHeight: 1.6 }}>
                Every weekday from <strong style={{ color: THEME.ink }}>10:50 PM – 12:00 AM</strong>:
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {rotation.map(r => (
                <div key={r.day} style={{
                  flex: "0 0 130px", borderRadius: THEME.rMd,
                  border: `1px solid ${THEME.line}`,
                  background: THEME.surface,
                  boxShadow: THEME.shadowSm,
                  overflow: "hidden",
                }}>
                  <div style={{
                    background: THEME.surfaceAlt, padding: "10px 12px",
                    borderBottom: `1px solid ${THEME.line}`,
                  }}>
                    <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 18, color: THEME.ink }}>{r.day}</div>
                    <div style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: FONTS.mono }}>{r.sub}</div>
                  </div>
                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.items.map((item, i) => {
                      const c = C[item.cat];
                      return (
                        <div key={i} style={{
                          padding: "9px 10px", borderRadius: THEME.rSm,
                          background: c.bg, border: `1px solid ${c.bd}`,
                        }}>
                          <div style={{ color: c.tx, fontSize: 12, fontWeight: 600, fontFamily: FONTS.nunito, marginBottom: 2 }}>{item.label}</div>
                          <div style={{ color: THEME.inkMuted, fontSize: 10.5, fontFamily: FONTS.mono }}>{item.dur}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: THEME.rSm,
              background: C.ps5.bg, border: `1px solid ${C.ps5.bd}`,
            }}>
              <span style={{ fontSize: 12.5, color: C.ps5.tx, lineHeight: 1.6, fontWeight: 500 }}>
                🎮 <strong>PS5 logic:</strong> 2 sessions per weekday week (Tue + Thu). Full unlimited gaming returns on weekends.
              </span>
            </div>
          </div>
        )}

        {tab === "weekend" && (
          <div>
            <div style={{
              padding: "10px 14px", borderRadius: THEME.rSm,
              background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, marginBottom: 16,
            }}>
              <span style={{ fontSize: 12.5, color: THEME.inkSoft, lineHeight: 1.6 }}>
                No fixed times. Work down this list in order. Once top priorities are done, the rest of the day is yours.
              </span>
            </div>
            {weekendList.map(p => {
              const c = C[p.cat];
              return (
                <div key={p.rank} style={{
                  display: "flex", gap: 14, padding: "12px 16px",
                  borderRadius: THEME.rSm, background: c.bg,
                  border: `1px solid ${c.bd}`, marginBottom: 5,
                }}>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700,
                    color: c.tx, minWidth: 30, paddingTop: 3,
                  }}>
                    {p.rank < 10 ? `0${p.rank}` : p.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: c.tx, fontWeight: 600, fontSize: 13.5, fontFamily: FONTS.nunito }}>{p.label}</span>
                      <span style={{ fontSize: 10.5, color: THEME.inkMuted, fontFamily: FONTS.mono }}>{p.time}</span>
                    </div>
                    <div style={{ color: THEME.inkSoft, fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{p.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rules" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {rules.map((r, i) => (
              <div key={i} style={{
                padding: "20px", borderRadius: THEME.rMd,
                background: THEME.surface, border: `1px solid ${THEME.line}`,
                boxShadow: THEME.shadowSm,
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
                <div style={{
                  fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 14.5,
                  marginBottom: 8, color: THEME.ink, lineHeight: 1.3,
                }}>
                  {r.title}
                </div>
                <div style={{ color: THEME.inkSoft, fontSize: 12.5, lineHeight: 1.7 }}>{r.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
