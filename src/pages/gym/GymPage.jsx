import { useState, useEffect, useCallback } from "react";
import { FONTS } from "../../lib/constants.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getGymSessions, getExerciseLibrary } from "../../lib/db.js";
import { WorkoutLogger } from "./components/WorkoutLogger.jsx";
import { HistoryTab } from "./tabs/HistoryTab.jsx";
import { CalendarTab } from "./tabs/CalendarTab.jsx";
import { MeasurementsTab } from "./tabs/MeasurementsTab.jsx";
import { PhotosTab } from "./tabs/PhotosTab.jsx";
import { SettingsTab } from "./tabs/SettingsTab.jsx";

const TABS = [
  { key: "history",      label: "History",     icon: "📋" },
  { key: "calendar",     label: "Calendar",    icon: "📅" },
  { key: "measurements", label: "Measure",     icon: "📏" },
  { key: "photos",       label: "Photos",      icon: "📷" },
  { key: "settings",     label: "Settings",    icon: "⚙️" },
];

export default function GymPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [sessions, setSessions] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggerOpen, setLoggerOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [s, l] = await Promise.all([getGymSessions(user.id, 100), getExerciseLibrary(user.id)]);
      setSessions(s);
      setLibrary(l);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ minHeight: "100%", background: "radial-gradient(ellipse at top, #0D1E3F 0%, #08091A 55%)", fontFamily: FONTS.sans }}>
      {/* Page header */}
      <div style={{ padding: "24px 20px 0", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: 26, color: "#F1F5F9", letterSpacing: -0.5 }}>
              💪 Gym
            </div>
            <div style={{ fontSize: 12, color: "#3B82F6", fontFamily: FONTS.mono, marginTop: 2 }}>
              Track every lift · every set · every PR
            </div>
          </div>
          <button
            onClick={() => setLoggerOpen(true)}
            style={{
              padding: "10px 20px", background: "#3B82F6", border: "none", borderRadius: 12,
              color: "#fff", fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            }}
          >
            + Workout
          </button>
        </div>

        {/* Tab strip */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none", marginBottom: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px", background: "transparent", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #3B82F6" : "2px solid transparent",
                color: activeTab === tab.key ? "#3B82F6" : "#475569",
                fontFamily: FONTS.sans, fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "24px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
        {activeTab === "history" && (
          <HistoryTab sessions={sessions} loading={loading} onStartWorkout={() => setLoggerOpen(true)} />
        )}
        {activeTab === "calendar" && (
          <CalendarTab userId={user?.id} sessions={sessions} />
        )}
        {activeTab === "measurements" && (
          <MeasurementsTab userId={user?.id} />
        )}
        {activeTab === "photos" && (
          <PhotosTab userId={user?.id} />
        )}
        {activeTab === "settings" && (
          <SettingsTab />
        )}
      </div>

      {/* Workout logger */}
      <WorkoutLogger
        open={loggerOpen}
        onClose={() => setLoggerOpen(false)}
        library={library}
        onSaved={load}
        userId={user?.id}
      />
    </div>
  );
}
