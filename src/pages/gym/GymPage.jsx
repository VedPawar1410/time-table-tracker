import { useState, useEffect, useCallback } from "react";
import { FONTS, THEME } from "../../lib/constants.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getGymSessions, getExerciseLibrary } from "../../lib/db.js";
import { WorkoutLogger } from "./components/WorkoutLogger.jsx";
import { HistoryTab } from "./tabs/HistoryTab.jsx";
import { CalendarTab } from "./tabs/CalendarTab.jsx";
import { MeasurementsTab } from "./tabs/MeasurementsTab.jsx";
import { PhotosTab } from "./tabs/PhotosTab.jsx";
import { SettingsTab } from "./tabs/SettingsTab.jsx";

const TABS = [
  { key: "history",      label: "History",  icon: "📋" },
  { key: "calendar",     label: "Calendar", icon: "📅" },
  { key: "measurements", label: "Measure",  icon: "📏" },
  { key: "photos",       label: "Photos",   icon: "📷" },
  { key: "settings",     label: "Settings", icon: "⚙️" },
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
    <div style={{ minHeight: "100%", background: THEME.bg, fontFamily: FONTS.sans }}>
      {/* Page header */}
      <div style={{ padding: "24px 20px 0", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: FONTS.nunito, fontWeight: 900, fontSize: 26, color: THEME.ink, letterSpacing: -0.3 }}>
              💪 Gym
            </div>
            <div style={{ fontSize: 12, color: "#E8623A", fontFamily: FONTS.mono, marginTop: 2, letterSpacing: "0.05em" }}>
              Track every lift · every set · every PR
            </div>
          </div>
          <button
            onClick={() => setLoggerOpen(true)}
            style={{
              padding: "10px 20px",
              background: "#E8623A",
              border: "none",
              borderRadius: THEME.rMd,
              color: "#fff",
              fontFamily: FONTS.nunito,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 0 #c44e2a, 0 6px 16px rgba(232,98,58,0.25)",
            }}
          >
            + Workout
          </button>
        </div>

        {/* Tab strip */}
        <div style={{
          display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none",
          borderBottom: `1px solid ${THEME.line}`,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px", background: "transparent", border: "none",
                borderBottom: activeTab === tab.key ? `2.5px solid #E8623A` : "2.5px solid transparent",
                color: activeTab === tab.key ? "#E8623A" : THEME.inkMuted,
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
        {activeTab === "history"      && <HistoryTab sessions={sessions} loading={loading} onStartWorkout={() => setLoggerOpen(true)} />}
        {activeTab === "calendar"     && <CalendarTab userId={user?.id} sessions={sessions} />}
        {activeTab === "measurements" && <MeasurementsTab userId={user?.id} />}
        {activeTab === "photos"       && <PhotosTab userId={user?.id} />}
        {activeTab === "settings"     && <SettingsTab />}
      </div>

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
