import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getGymSessions, getExerciseLibrary, getAllLatestMeasurements } from "../../lib/db.js";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import StatTile from "../../components/ui/StatTile.jsx";
import { WorkoutLogger } from "./components/WorkoutLogger.jsx";
import { HistoryTab } from "./tabs/HistoryTab.jsx";
import { CalendarTab } from "./tabs/CalendarTab.jsx";
import { MeasurementsTab } from "./tabs/MeasurementsTab.jsx";
import { PhotosTab } from "./tabs/PhotosTab.jsx";
import { ExercisesTab } from "./tabs/ExercisesTab.jsx";
import { Button } from "../../components/ui/Button.jsx";

const p = TASK_PALETTE.gym;

const TABS = [
  { key: "sessions",   label: "Sessions",   icon: "📋" },
  { key: "calendar",   label: "Calendar",   icon: "📅" },
  { key: "exercises",  label: "Exercises",  icon: "🏋️" },
  { key: "body",       label: "Body",       icon: "📏" },
  { key: "photos",     label: "Photos",     icon: "📸" },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function GymPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sessions");
  const [sessions, setSessions] = useState([]);
  const [library, setLibrary] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggerOpen, setLoggerOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [s, l, m] = await Promise.all([
        getGymSessions(user.id, 100),
        getExerciseLibrary(user.id),
        getAllLatestMeasurements(user.id),
      ]);
      setSessions(s);
      setLibrary(l);
      setMeasurements(m);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Computed stats
  const weekAgo = sevenDaysAgo();
  const thisWeek = sessions.filter(s => s.log_date >= weekAgo).length;
  const totalSessions = sessions.length;
  let totalVolume = 0;
  for (const s of sessions) {
    for (const ex of s.gym_exercises || []) {
      for (const set of ex.gym_sets || []) {
        if (set.weight_kg && set.reps) totalVolume += set.weight_kg * set.reps;
      }
    }
  }
  const activePRs = library.filter(e => e.pr_weight_kg).length;
  const bodyWeightEntry = measurements.find(m => m.metric === "body_weight");
  const bodyWeight = bodyWeightEntry ? `${bodyWeightEntry.value_num} kg` : "—";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        kicker="DEEP DIVE · GYM"
        title="Gym & Training"
        subtitle="Every set, every rep, every PR"
        action={
          <Button variant="primary" size="md" onClick={() => setLoggerOpen(true)}>
            + Log Workout
          </Button>
        }
      />

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
        <StatTile label="This Week" value={thisWeek} sublabel="sessions" color={p.fg} />
        <StatTile label="Total" value={totalSessions} sublabel="sessions" color={p.fg} />
        <StatTile label="Volume" value={totalVolume > 0 ? `${Math.round(totalVolume/1000)}k` : "—"} sublabel="kg total" color={p.fg} />
        <StatTile label="Active PRs" value={activePRs} sublabel="exercises" color={p.fg} />
        <StatTile label="Body Weight" value={bodyWeight} sublabel="latest" color={p.fg} />
      </div>

      {/* Tab strip */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: THEME.surface, borderRadius: THEME.rMd, padding: 5,
        border: `1.5px solid ${THEME.line}`, boxShadow: THEME.shadowSm,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 14px", borderRadius: THEME.rSm, border: "none",
              background: activeTab === tab.key ? lighten(p.fg, 0.78) : "transparent",
              color: activeTab === tab.key ? shadeDarken(p.fg, 0.3) : THEME.inkSoft,
              fontFamily: F.display, fontSize: 13, fontWeight: activeTab === tab.key ? 800 : 600,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: activeTab === tab.key ? THEME.shadowSm : "none",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "sessions"  && <HistoryTab sessions={sessions} loading={loading} onStartWorkout={() => setLoggerOpen(true)} />}
      {activeTab === "calendar"  && <CalendarTab userId={user?.id} sessions={sessions} />}
      {activeTab === "exercises" && <ExercisesTab library={library} userId={user?.id} onReload={load} />}
      {activeTab === "body"      && <MeasurementsTab userId={user?.id} />}
      {activeTab === "photos"    && <PhotosTab userId={user?.id} />}

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
