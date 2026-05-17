import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { signOut } from "../../lib/db.js";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import Sticker from "../ui/Sticker.jsx";

const NAV_PRIMARY = [
  { to: "/",         label: "Dashboard",        emoji: "🏠", exact: true },
  { to: "/tracker",  label: "Daily Tracker",     emoji: "📊" },
  { to: "/timetable",label: "Master Timetable",  emoji: "🗓️" },
];

const DEFAULT_DEEP_DIVES = [
  { to: "/gym",        label: "Gym",          taskId: "gym" },
  { to: "/diet",       label: "Diet",         taskId: "diet" },
  { to: "/jobprep",    label: "Job Prep",      taskId: "jobprep" },
  { to: "/reading",    label: "Reading",       taskId: "book" },
  { to: "/catprep",    label: "CAT Prep",      taskId: "catprep" },
  { to: "/video",      label: "Video Editing", taskId: "videditing" },
  { to: "/sidehustle", label: "Side Hustle",   taskId: "sidehustle" },
  { to: "/hobbies",    label: "Hobbies",       taskId: "hobbies" },
];

const NAV_BOTTOM = [
  { to: "/analytics", label: "Analytics", emoji: "📈" },
  { to: "/settings",  label: "Settings",  emoji: "⚙️" },
];

const STORAGE_KEY = "sidebar_task_order";

function loadOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!Array.isArray(saved)) return DEFAULT_DEEP_DIVES;
    const defaultMap = Object.fromEntries(DEFAULT_DEEP_DIVES.map(i => [i.to, i]));
    const ordered = saved.filter(i => defaultMap[i.to]).map(i => defaultMap[i.to]);
    const extra = DEFAULT_DEEP_DIVES.filter(i => !saved.some(s => s.to === i.to));
    return [...ordered, ...extra];
  } catch {
    return DEFAULT_DEEP_DIVES;
  }
}

function NavBtn({ item, active, onClick }) {
  const p = item.taskId ? TASK_PALETTE[item.taskId] : null;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", textAlign: "left",
        padding: "9px 12px", borderRadius: THEME.rMd,
        background: active ? THEME.surface : "transparent",
        border: `1.5px solid ${active ? THEME.line : "transparent"}`,
        boxShadow: active ? THEME.shadowSm : "none",
        color: active ? THEME.ink : THEME.inkSoft,
        fontSize: 14, fontFamily: F.display, fontWeight: active ? 800 : 600,
        cursor: "pointer", transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = THEME.bg; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {p ? (
        <span style={{
          width: 30, height: 30, borderRadius: 10,
          background: p.bg, border: `1.5px solid ${p.edge}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>{p.emoji}</span>
      ) : (
        <span style={{
          width: 30, height: 30, borderRadius: 10,
          background: active ? lighten(THEME.primary, 0.7) : THEME.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
          border: `1.5px solid ${THEME.line}`,
        }}>{item.emoji}</span>
      )}
      <span style={{ flex: 1 }}>{item.label}</span>
      {active && <span style={{ fontSize: 8, color: THEME.primary }}>●</span>}
    </button>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deepDives, setDeepDives] = useState(() => loadOrder());
  const [hoveredTo, setHoveredTo] = useState(null);
  const dragIdx = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
  const initial = name[0]?.toUpperCase() || "V";
  const city = "Hyderabad";

  const onDragStart = (e, idx) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...deepDives];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    setDeepDives(next);
  };
  const onDragEnd = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deepDives));
    dragIdx.current = null;
  };

  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: THEME.bgAlt,
      borderRight: `1.5px solid ${THEME.line}`,
      display: "flex", flexDirection: "column",
      padding: "20px 14px",
      position: "sticky", top: 0, height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "4px 12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14,
          background: THEME.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
          position: "relative", flexShrink: 0,
        }}>
          <span style={{ fontSize: 22 }}>⏰</span>
          <span style={{ position: "absolute", top: -6, right: -6 }}>
            <Sticker kind="sparkle" color="#FFD480" size={14} />
          </span>
        </div>
        <div>
          <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 900, color: THEME.ink, lineHeight: 1 }}>Lifeboard</div>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: THEME.inkMuted, marginTop: 2, letterSpacing: 1 }}>personal os</div>
        </div>
      </div>

      <div style={{ height: 1, background: THEME.line, margin: "0 4px 14px" }} />

      {/* Primary nav — using window.location instead of NavLink to avoid import issues */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 16 }}>
        {NAV_PRIMARY.map(item => {
          const path = window.location.pathname;
          const active = item.exact ? path === item.to : path.startsWith(item.to) && item.to !== "/";
          const exactActive = item.exact && path === "/";
          return (
            <NavBtn key={item.to} item={item} active={active || exactActive} onClick={() => navigate(item.to)} />
          );
        })}
      </div>

      {/* Deep Dives */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          padding: "0 14px 8px",
          fontFamily: F.display, fontSize: 10, fontWeight: 800,
          color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1.5,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Sticker kind="dot" color={THEME.primary} size={6} />
          Deep Dives
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {deepDives.map((item, idx) => {
            const active = window.location.pathname === item.to;
            return (
              <div
                key={item.to} draggable
                onDragStart={e => onDragStart(e, idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                onMouseEnter={() => setHoveredTo(item.to)}
                onMouseLeave={() => setHoveredTo(null)}
                style={{ position: "relative" }}
              >
                <NavBtn item={item} active={active} onClick={() => navigate(item.to)} />
                {hoveredTo === item.to && !active && (
                  <span style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    color: THEME.inkFaint, fontSize: 13, pointerEvents: "none",
                  }}>⠿</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
        {NAV_BOTTOM.map(item => {
          const active = window.location.pathname === item.to;
          return <NavBtn key={item.to} item={item} active={active} onClick={() => navigate(item.to)} />;
        })}
      </div>

      {/* User card */}
      <div style={{
        padding: "10px 12px", borderRadius: THEME.rMd,
        background: THEME.surface, border: `1.5px solid ${THEME.line}`,
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: THEME.shadowSm,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: THEME.primary,
          color: "#fff", fontFamily: F.display, fontWeight: 900, fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 2px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
          flexShrink: 0,
        }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, color: THEME.ink, fontSize: 13, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 10.5, color: THEME.inkMuted, marginTop: 2 }}>🏙️ {city}</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{ background: "transparent", border: "none", color: THEME.inkMuted, fontSize: 14, cursor: "pointer", padding: 4, lineHeight: 1 }}
        >↗</button>
      </div>
    </aside>
  );
}
