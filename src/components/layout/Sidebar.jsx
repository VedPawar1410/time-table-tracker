import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/db.js";
import { FONTS } from "../../lib/constants.js";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { to: "/", label: "Home", icon: "🏠", exact: true },
      { to: "/tracker", label: "Tracker", icon: "📊" },
    ],
  },
  {
    label: "Deep Dives",
    items: [
      { to: "/gym", label: "Gym", icon: "💪" },
      { to: "/jobprep", label: "Job Prep", icon: "🔥" },
      { to: "/reading", label: "Reading", icon: "📘" },
      { to: "/catprep", label: "CAT Prep", icon: "🎯" },
      { to: "/video", label: "Video Editing", icon: "🎬" },
      { to: "/sidehustle", label: "Side Hustle", icon: "💡" },
      { to: "/hobbies", label: "Hobbies", icon: "🎨" },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: "📈" },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/tasks", label: "Manage Tasks", icon: "⚙️" },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const linkStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px", borderRadius: 10, textDecoration: "none",
    fontSize: 13.5, fontFamily: FONTS.sans, fontWeight: 400,
    color: isActive ? "#E2E8F0" : "#4A5568",
    background: isActive ? "#1E293B" : "transparent",
    borderLeft: isActive ? "2px solid #4ADE80" : "2px solid transparent",
    transition: "all 0.15s",
    marginBottom: 2,
  });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 220,
      background: "rgba(8,9,26,0.95)", backdropFilter: "blur(12px)",
      borderRight: "1px solid #1E293B", display: "flex", flexDirection: "column",
      padding: "20px 12px", zIndex: 100, overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "4px 14px 20px", borderBottom: "1px solid #1E293B", marginBottom: 12 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: 3, color: "#4ADE80", textTransform: "uppercase", marginBottom: 4 }}>
          Personal OS
        </div>
        <div style={{ fontFamily: FONTS.syne, fontSize: 16, fontWeight: 800, color: "#E2E8F0" }}>
          ⏰ Life Board
        </div>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1 }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 12 }}>
            {section.label && (
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 2, color: "#2D3748", textTransform: "uppercase", padding: "4px 14px 6px", marginBottom: 2 }}>
                {section.label}
              </div>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={({ isActive }) => linkStyle(isActive)}
              >
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
          display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10,
          background: "transparent", border: "1px solid #1E293B", color: "#4A5568",
          fontSize: 12, fontFamily: FONTS.sans, cursor: "pointer", width: "100%",
        }}
      >
        <span>🚪</span> Sign Out
      </button>
    </div>
  );
}
