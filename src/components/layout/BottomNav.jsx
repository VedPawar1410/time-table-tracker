import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/db.js";
import { FONTS } from "../../lib/constants.js";

const MAIN_TABS = [
  { to: "/", label: "Home", icon: "🏠", exact: true },
  { to: "/tracker", label: "Tracker", icon: "📊" },
  { to: "/gym", label: "Gym", icon: "💪" },
  { to: "/jobprep", label: "Prep", icon: "🔥" },
];

const MORE_ITEMS = [
  { to: "/reading", label: "Reading", icon: "📘" },
  { to: "/catprep", label: "CAT Prep", icon: "🎯" },
  { to: "/video", label: "Video Editing", icon: "🎬" },
  { to: "/sidehustle", label: "Side Hustle", icon: "💡" },
  { to: "/hobbies", label: "Hobbies", icon: "🎨" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/tasks", label: "Manage Tasks", icon: "⚙️" },
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
    color: isActive ? "#4ADE80" : "#4A5568",
    fontSize: 18, position: "relative",
  });

  return (
    <>
      {/* Drawer overlay */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 60, left: 0, right: 0,
              background: "#0D1117", borderTop: "1px solid #1E293B",
              borderRadius: "20px 20px 0 0", padding: "20px 16px 8px",
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
                    padding: "14px 8px", borderRadius: 12, textDecoration: "none",
                    background: isActive ? "#1E293B" : "transparent",
                    border: "1px solid #1E293B",
                    color: isActive ? "#E2E8F0" : "#4A5568",
                  })}
                >
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, fontFamily: FONTS.sans, color: "inherit" }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              style={{ width: "100%", padding: "10px", borderRadius: 10, background: "transparent", border: "1px solid #1E293B", color: "#4A5568", fontSize: 13, fontFamily: FONTS.sans }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "rgba(8,9,26,0.95)", backdropFilter: "blur(12px)",
        borderTop: "1px solid #1E293B", height: 60,
        display: "flex", alignItems: "stretch",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {MAIN_TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.exact} style={({ isActive }) => tabStyle(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, borderRadius: 1, background: "#4ADE80" }} />}
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
            color: moreOpen ? "#4ADE80" : "#4A5568", fontSize: 18,
          }}
        >
          {moreOpen && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, borderRadius: 1, background: "#4ADE80" }} />}
          <span>☰</span>
          <span style={{ fontSize: 9.5, fontFamily: FONTS.mono }}>More</span>
        </button>
      </div>
    </>
  );
}
