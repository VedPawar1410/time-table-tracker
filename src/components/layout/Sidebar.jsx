import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/db.js";
import { FONTS, THEME } from "../../lib/constants.js";

const PRIMARY_ITEMS = [
  { to: "/", label: "Home", icon: "🏠", exact: true },
  { to: "/tracker", label: "Tracker", icon: "📊" },
];

const DEFAULT_DEEP_DIVES = [
  { to: "/gym",        label: "Gym",          icon: "💪" },
  { to: "/jobprep",    label: "Job Prep",      icon: "🔥" },
  { to: "/reading",    label: "Reading",       icon: "📘" },
  { to: "/catprep",    label: "CAT Prep",      icon: "🎯" },
  { to: "/video",      label: "Video Editing", icon: "🎬" },
  { to: "/sidehustle", label: "Side Hustle",   icon: "💡" },
  { to: "/hobbies",    label: "Hobbies",       icon: "🎨" },
  { to: "/diet",       label: "Diet",          icon: "🥗" },
];

const BOTTOM_SECTIONS = [
  { label: "Insights", items: [{ to: "/analytics", label: "Analytics", icon: "📈" }] },
  { label: "Settings", items: [{ to: "/tasks",     label: "Manage Tasks", icon: "⚙️" }] },
];

const STORAGE_KEY = "sidebar_task_order";

function loadOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!Array.isArray(saved)) return DEFAULT_DEEP_DIVES;
    const savedTos = saved.map(i => i.to);
    const defaultMap = Object.fromEntries(DEFAULT_DEEP_DIVES.map(i => [i.to, i]));
    const ordered = saved.filter(i => defaultMap[i.to]).map(i => defaultMap[i.to]);
    const extra = DEFAULT_DEEP_DIVES.filter(i => !savedTos.includes(i.to));
    return [...ordered, ...extra];
  } catch {
    return DEFAULT_DEEP_DIVES;
  }
}

export function Sidebar() {
  const navigate = useNavigate();
  const [deepDives, setDeepDives] = useState(() => loadOrder());
  const [hoveredTo, setHoveredTo] = useState(null);
  const dragIdx = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const linkStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px", borderRadius: THEME.rSm,
    textDecoration: "none",
    fontSize: 13.5, fontFamily: FONTS.sans, fontWeight: isActive ? 600 : 400,
    color: isActive ? THEME.primary : THEME.inkSoft,
    background: isActive ? THEME.primarySoft : "transparent",
    borderLeft: `2px solid ${isActive ? THEME.primary : "transparent"}`,
    transition: "all 0.15s",
    marginBottom: 2,
  });

  const onDragStart = (e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const newOrder = [...deepDives];
    const [moved] = newOrder.splice(dragIdx.current, 1);
    newOrder.splice(idx, 0, moved);
    dragIdx.current = idx;
    setDeepDives(newOrder);
  };

  const onDragEnd = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deepDives));
    dragIdx.current = null;
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 220,
      background: THEME.surface,
      borderRight: `1px solid ${THEME.line}`,
      display: "flex", flexDirection: "column",
      padding: "20px 12px", zIndex: 100, overflowY: "auto",
      boxShadow: "2px 0 12px rgba(122,46,14,0.06)",
    }}>
      {/* Brand */}
      <div style={{
        padding: "4px 14px 20px",
        borderBottom: `1px solid ${THEME.line}`,
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 8, letterSpacing: "0.22em",
          color: THEME.primary, textTransform: "uppercase", marginBottom: 5,
        }}>
          Personal OS
        </div>
        <div style={{ fontFamily: FONTS.nunito, fontSize: 17, fontWeight: 900, color: THEME.ink }}>
          ⏰ Life Board
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {/* Primary nav */}
        <div style={{ marginBottom: 12 }}>
          {PRIMARY_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact} style={({ isActive }) => linkStyle(isActive)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Deep Dives — draggable */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: "0.16em",
            color: THEME.inkFaint, textTransform: "uppercase",
            padding: "4px 14px 6px", marginBottom: 2,
          }}>
            Deep Dives
          </div>
          {deepDives.map((item, idx) => (
            <div
              key={item.to}
              draggable
              onDragStart={e => onDragStart(e, idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              onMouseEnter={() => setHoveredTo(item.to)}
              onMouseLeave={() => setHoveredTo(null)}
              style={{ position: "relative", cursor: "grab" }}
            >
              <NavLink to={item.to} style={({ isActive }) => ({ ...linkStyle(isActive), paddingRight: 30 })}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
              {hoveredTo === item.to && (
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  color: THEME.inkFaint, fontSize: 13, pointerEvents: "none", lineHeight: 1,
                }}>⠿</span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom sections */}
        {BOTTOM_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: "0.16em",
              color: THEME.inkFaint, textTransform: "uppercase",
              padding: "4px 14px 6px", marginBottom: 2,
            }}>
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => linkStyle(isActive)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
          borderRadius: THEME.rSm, background: "transparent",
          border: `1px solid ${THEME.line}`, color: THEME.inkMuted,
          fontSize: 12, fontFamily: FONTS.sans, cursor: "pointer", width: "100%",
        }}
      >
        <span>🚪</span> Sign Out
      </button>
    </div>
  );
}
