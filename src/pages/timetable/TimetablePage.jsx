import { useState } from "react";
import { THEME, TASK_PALETTE, F, lighten } from "../../lib/theme.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Chip from "../../components/ui/Chip.jsx";
import Sticker from "../../components/ui/Sticker.jsx";

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
  { cat: "jobprep",   icon: "🔥", title: "Job Prep is Sacred",         body: "9:20–10:20 PM runs every single day without exception. Rough day at work? Still go. Friday night? Still go." },
  { cat: "routine",   icon: "🚿", title: "Bath Goes AFTER Gym",         body: "Don't shower twice. Just brush and splash before gym. Shower after. You save 30 minutes in your morning." },
  { cat: "meal",      icon: "📱", title: "Dinner + Calls = One Block",  body: "You need to eat. You need to connect. Do both at 8:30 PM. Multitasking here frees an entire block later." },
  { cat: "ps5",       icon: "🎮", title: "PS5 is Earned, Not Default",  body: "Weekday PS5 only on Tue and Thu. Other days go to building things. Full gaming freedom returns on weekends." },
  { cat: "buffer",    icon: "🌅", title: "Morning Buffer is Intentional", body: "9:45–10:30 AM is deliberately unstructured. Side hustle research, hobbies, scrolling — pressure valve before office." },
  { cat: "catprep",   icon: "📅", title: "Weekends Are Your Deep Work Zone", body: "Weekdays are optimized around the office. Real progress on CAT, video, and side hustle happens on weekends." },
];

function TimeBlock({ time, cat, label, note, tag }) {
  const p = TASK_PALETTE[cat];
  const bg = p ? p.bg : THEME.surfaceAlt;
  const edge = p ? p.edge : THEME.line;
  const fg = p ? p.fg : THEME.inkSoft;
  const emoji = p ? p.emoji : "✨";
  return (
    <div style={{
      display: "flex", gap: 14, padding: "12px 16px",
      borderRadius: THEME.rMd, background: bg,
      border: `1.5px solid ${edge}`, marginBottom: 6,
    }}>
      <div style={{ minWidth: 130, fontFamily: F.mono, fontSize: 10, color: fg, paddingTop: 2, lineHeight: 1.5, fontWeight: 600 }}>
        {time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>{emoji}</span>
          <span style={{ color: fg, fontWeight: 700, fontSize: 13.5, fontFamily: F.display }}>{label}</span>
          {tag && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 999,
              background: edge + "88", color: fg,
              fontFamily: F.mono, letterSpacing: "0.04em", fontWeight: 600,
            }}>
              {tag}
            </span>
          )}
        </div>
        {note && (
          <div style={{ color: THEME.inkMuted, fontSize: 12, marginTop: 4, lineHeight: 1.55 }}>{note}</div>
        )}
      </div>
    </div>
  );
}

function InfoCallout({ children, cat }) {
  const p = TASK_PALETTE[cat] || {};
  return (
    <div style={{
      padding: "11px 16px", borderRadius: THEME.rMd,
      background: p.bg || THEME.surfaceAlt, border: `1.5px solid ${p.edge || THEME.line}`,
      marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
        <Sticker kind="sparkle" color={p.fg || THEME.primary} size={16} />
      </span>
      <span style={{ fontSize: 12.5, color: THEME.inkSoft, lineHeight: 1.65 }}>{children}</span>
    </div>
  );
}

const TABS = [
  { id: "weekday", label: "Weekday 💼" },
  { id: "evening", label: "Evening Rotation 🌙" },
  { id: "weekend", label: "Weekend 🏖️" },
  { id: "rules",   label: "Key Rules 📜" },
];

export default function TimetablePage() {
  const [tab, setTab] = useState("weekday");

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHeader
        kicker="MASTER TIMETABLE"
        title="Your Daily Blueprint"
        subtitle="Built around your 11–8 office schedule · Job prep as top priority · Morning gym · Weekend freedom"
        sticker="star"
        stickerColor={TASK_PALETTE.catprep.fg}
      />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <Chip key={t.id} active={tab === t.id} color={THEME.primary} onClick={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {tab === "weekday" && (
        <div>
          <InfoCallout cat="gym">
            ⏰ Wake time shifts from 9 AM → <strong>7:30 AM</strong>. That extra 1.5 hrs is where the gym lives.
          </InfoCallout>
          {weekdaySchedule.map((b, i) => <TimeBlock key={i} {...b} />)}
        </div>
      )}

      {tab === "evening" && (
        <div>
          <InfoCallout cat="ps5">
            Every weekday from <strong>10:50 PM – 12:00 AM</strong>: this slot rotates. See each day below.
          </InfoCallout>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
            {rotation.map(r => (
              <Card key={r.day} padding={0} style={{ overflow: "hidden" }}>
                <div style={{
                  background: THEME.bgAlt, padding: "10px 14px",
                  borderBottom: `1.5px solid ${THEME.line}`,
                }}>
                  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink }}>{r.day}</div>
                  <div style={{ fontSize: 10.5, color: THEME.inkMuted, fontFamily: F.mono }}>{r.sub}</div>
                </div>
                <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {r.items.map((item, i) => {
                    const p = TASK_PALETTE[item.cat];
                    return (
                      <div key={i} style={{
                        padding: "8px 10px", borderRadius: THEME.rSm,
                        background: p?.bg || THEME.bg, border: `1.5px solid ${p?.edge || THEME.line}`,
                      }}>
                        <div style={{ color: p?.fg || THEME.inkSoft, fontSize: 12.5, fontWeight: 700, fontFamily: F.display, marginBottom: 2 }}>
                          {p?.emoji} {item.label}
                        </div>
                        <div style={{ color: THEME.inkMuted, fontSize: 10.5, fontFamily: F.mono }}>{item.dur}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
          <div style={{
            padding: "12px 16px", borderRadius: THEME.rMd,
            background: TASK_PALETTE.ps5.bg, border: `1.5px solid ${TASK_PALETTE.ps5.edge}`,
          }}>
            <span style={{ fontSize: 13, color: TASK_PALETTE.ps5.fg, lineHeight: 1.6, fontWeight: 600 }}>
              🎮 <strong>PS5 logic:</strong> 2 sessions per weekday week (Tue + Thu). Full unlimited gaming returns on weekends.
            </span>
          </div>
        </div>
      )}

      {tab === "weekend" && (
        <div>
          <InfoCallout cat="hobbies">
            No fixed times. Work down this list in order. Once top priorities are done, the rest of the day is yours.
          </InfoCallout>
          {weekendList.map(item => {
            const p = TASK_PALETTE[item.cat];
            return (
              <div key={item.rank} style={{
                display: "flex", gap: 14, padding: "13px 18px",
                borderRadius: THEME.rMd, background: p?.bg || THEME.bg,
                border: `1.5px solid ${p?.edge || THEME.line}`, marginBottom: 6,
              }}>
                <div style={{
                  fontFamily: F.mono, fontSize: 20, fontWeight: 700,
                  color: p?.fg || THEME.inkMuted, minWidth: 34, paddingTop: 2,
                }}>
                  {String(item.rank).padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16 }}>{p?.emoji}</span>
                    <span style={{ color: p?.fg || THEME.inkSoft, fontWeight: 700, fontSize: 13.5, fontFamily: F.display }}>{item.label}</span>
                    <span style={{ fontSize: 10.5, color: THEME.inkMuted, fontFamily: F.mono }}>{item.time}</span>
                  </div>
                  <div style={{ color: THEME.inkSoft, fontSize: 12.5, marginTop: 4, lineHeight: 1.55 }}>{item.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "rules" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {rules.map((r, i) => {
            const p = TASK_PALETTE[r.cat];
            return (
              <Card key={i} padding={20} style={{ position: "relative", overflow: "hidden", background: p?.bg || THEME.surface, border: `1.5px solid ${p?.edge || THEME.line}` }}>
                <div style={{ position: "absolute", top: -8, right: -8, opacity: 0.35, pointerEvents: "none" }}>
                  <Sticker kind="blob" color={p?.fg || THEME.primary} size={60} />
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: THEME.surface, border: `1.5px solid ${p?.edge || THEME.line}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 12,
                    boxShadow: THEME.shadowSm,
                  }}>{r.icon}</div>
                  <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14.5, marginBottom: 8, color: p?.deep || THEME.ink, lineHeight: 1.3 }}>
                    {r.title}
                  </div>
                  <div style={{ color: THEME.inkSoft, fontSize: 12.5, lineHeight: 1.7 }}>{r.body}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
