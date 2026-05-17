import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";

const MAIN_TABS = [
  { to: "/",        label: "Home",  emoji: "🏠", exact: true },
  { to: "/tracker", label: "Track", emoji: "📊" },
  { to: "/gym",     label: "Gym",   taskId: "gym" },
  { to: "/diet",    label: "Diet",  taskId: "diet" },
];

const MORE_ITEMS = [
  { to: "/jobprep",    label: "Job Prep",   taskId: "jobprep" },
  { to: "/reading",    label: "Reading",    taskId: "book" },
  { to: "/catprep",    label: "CAT Prep",   taskId: "catprep" },
  { to: "/video",      label: "Video",      taskId: "videditing" },
  { to: "/sidehustle", label: "Side Hustle",taskId: "sidehustle" },
  { to: "/hobbies",    label: "Hobbies",    taskId: "hobbies" },
  { to: "/timetable",  label: "Timetable",  emoji: "🗓️" },
  { to: "/analytics",  label: "Analytics",  emoji: "📈" },
  { to: "/settings",   label: "Settings",   emoji: "⚙️" },
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to) && to !== "/";
  const isExactActive = to => location.pathname === to;

  return (
    <>
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(43,30,24,0.4)", backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 72, left: 10, right: 10,
              background: THEME.surface, borderRadius: THEME.rXl,
              border: `1.5px solid ${THEME.line}`,
              boxShadow: THEME.shadowLg,
              padding: 16,
              animation: "pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 13, color: THEME.ink, marginBottom: 12, paddingLeft: 4 }}>
              More
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {MORE_ITEMS.map(item => {
                const p = item.taskId ? TASK_PALETTE[item.taskId] : null;
                const active = isExactActive(item.to);
                return (
                  <button
                    key={item.to}
                    onClick={() => { navigate(item.to); setMoreOpen(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "12px 6px", borderRadius: THEME.rMd,
                      background: p ? p.bg : (active ? lighten(THEME.primary, 0.78) : THEME.bg),
                      border: `1.5px solid ${p ? p.edge : (active ? THEME.primary : THEME.line)}`,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{p?.emoji || item.emoji}</span>
                    <span style={{ fontFamily: F.display, fontSize: 11, fontWeight: 700, color: p ? p.deep : THEME.ink }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav style={{
        position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 410,
        background: THEME.surface,
        borderTop: `1.5px solid ${THEME.line}`,
        boxShadow: "0 -8px 20px -8px rgba(43,30,24,0.08)",
        display: "flex", height: 72,
        padding: "8px 8px calc(8px + env(safe-area-inset-bottom))",
      }}>
        {MAIN_TABS.map(tab => {
          const active = tab.exact ? isExactActive(tab.to) : isActive(tab.to);
          const p = tab.taskId ? TASK_PALETTE[tab.taskId] : null;
          const bgC = active ? (p ? p.bg : lighten(THEME.primary, 0.78)) : "transparent";
          const fgC = active ? (p ? p.deep : THEME.primaryInk) : THEME.inkMuted;
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 2, background: bgC, border: "none", borderRadius: THEME.rMd,
                color: fgC, cursor: "pointer", padding: "4px 2px",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 22 }}>{p?.emoji || tab.emoji}</span>
              <span style={{ fontFamily: F.display, fontSize: 10, fontWeight: active ? 800 : 600 }}>{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen(o => !o)}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 2, background: moreOpen ? THEME.bg : "transparent", border: "none", borderRadius: THEME.rMd,
            color: moreOpen ? THEME.ink : THEME.inkMuted, cursor: "pointer", padding: "4px 2px",
          }}
        >
          <span style={{ fontSize: 22 }}>☰</span>
          <span style={{ fontFamily: F.display, fontSize: 10, fontWeight: moreOpen ? 800 : 600 }}>More</span>
        </button>
      </nav>
    </>
  );
}
