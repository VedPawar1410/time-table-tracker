import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/db.js";
import { FONTS, THEME } from "../../lib/constants.js";

const MAIN_TABS = [
  { to: "/",        label: "Home",    icon: "🏠", exact: true },
  { to: "/tracker", label: "Tracker", icon: "📊" },
  { to: "/gym",     label: "Gym",     icon: "💪" },
  { to: "/jobprep", label: "Prep",    icon: "🔥" },
];

const MORE_ITEMS = [
  { to: "/reading",    label: "Reading",      icon: "📘" },
  { to: "/catprep",    label: "CAT Prep",     icon: "🎯" },
  { to: "/video",      label: "Video",        icon: "🎬" },
  { to: "/sidehustle", label: "Side Hustle",  icon: "💡" },
  { to: "/hobbies",    label: "Hobbies",      icon: "🎨" },
  { to: "/diet",       label: "Diet",         icon: "🥗" },
  { to: "/analytics",  label: "Analytics",    icon: "📈" },
  { to: "/tasks",      label: "Tasks",        icon: "⚙️" },
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const tabStyle = (isActive) => ({
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 3, flex: 1, padding: "8px 4px", textDecoration: "none",
    color: isActive ? THEME.primary : THEME.inkMuted,
    fontSize: 18, position: "relative",
  });

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(43,30,24,0.3)", backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 60, left: 0, right: 0,
              background: THEME.surface,
              borderTop: `1px solid ${THEME.line}`,
              borderRadius: `${THEME.rLg} ${THEME.rLg} 0 0`,
              padding: "20px 16px 8px",
              boxShadow: THEME.shadowMd,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {MORE_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  style={({ isActive }) => ({
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "14px 8px", borderRadius: THEME.rSm, textDecoration: "none",
                    background: isActive ? THEME.primarySoft : THEME.surfaceAlt,
                    border: `1px solid ${isActive ? THEME.primary + "44" : THEME.line}`,
                    color: isActive ? THEME.primary : THEME.inkSoft,
                  })}
                >
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 10.5, fontFamily: FONTS.sans, fontWeight: 500, color: "inherit" }}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                width: "100%", padding: "10px", borderRadius: THEME.rSm,
                background: "transparent", border: `1px solid ${THEME.line}`,
                color: THEME.inkMuted, fontSize: 13, fontFamily: FONTS.sans, cursor: "pointer",
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: THEME.surface,
        borderTop: `1px solid ${THEME.line}`,
        height: 60,
        display: "flex", alignItems: "stretch",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -2px 12px rgba(122,46,14,0.08)",
      }}>
        {MAIN_TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.exact} style={({ isActive }) => tabStyle(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 24, height: 3,
                    borderRadius: "0 0 3px 3px",
                    background: THEME.primary,
                  }} />
                )}
                <span>{tab.icon}</span>
                <span style={{ fontSize: 9.5, fontFamily: FONTS.mono, color: "inherit" }}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen(o => !o)}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 3, background: "transparent", border: "none",
            color: moreOpen ? THEME.primary : THEME.inkMuted, fontSize: 18,
            position: "relative",
          }}
        >
          {moreOpen && (
            <div style={{
              position: "absolute", top: 0, left: "50%",
              transform: "translateX(-50%)",
              width: 24, height: 3,
              borderRadius: "0 0 3px 3px",
              background: THEME.primary,
            }} />
          )}
          <span>☰</span>
          <span style={{ fontSize: 9.5, fontFamily: FONTS.mono }}>More</span>
        </button>
      </div>
    </>
  );
}
