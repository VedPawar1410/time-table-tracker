import { useState, useEffect, useCallback } from "react";
import { FONTS } from "../../lib/constants.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getJobPrepDailyLog,
  upsertJobPrepDailyLog,
  getJobPrepDailyLogsForRange,
} from "../../lib/db.js";
import { Input } from "../../components/ui/Input.jsx";
import { TextArea } from "../../components/ui/TextArea.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr, n) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  date.setDate(date.getDate() + n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fmtDate(dateStr) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function getWeekStart(offset) {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset + offset * 7);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getMonthBounds(offset) {
  const now = new Date();
  const month = now.getMonth() + offset;
  const first = new Date(now.getFullYear(), month, 1);
  const last  = new Date(now.getFullYear(), month + 1, 0);
  const y = first.getFullYear(), m = first.getMonth();
  return {
    year: y, month: m,
    start: `${y}-${pad(m + 1)}-01`,
    end:   `${y}-${pad(m + 1)}-${pad(last.getDate())}`,
  };
}

function durationColor(minutes) {
  if (!minutes || minutes <= 0) return "#1A1A2E";
  if (minutes < 30) return "#4A0000";
  if (minutes < 60) return "#7F1D1D";
  return "#B91C1C";
}

const ACCENT     = "#FCA5A5";
const ACCENT_DIM = "rgba(252,165,165,0.12)";
const DAY_NAMES  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── RoadmapPanel ─────────────────────────────────────────────────────────────

function RoadmapPanel({ open, onToggle }) {
  return (
    <div style={{
      border: "1px solid rgba(185,28,28,0.3)",
      borderRadius: 12,
      background: "rgba(45,0,0,0.4)",
      marginBottom: 20,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>
            GM Preparation Roadmap
          </span>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 9, color: "#B91C1C",
            background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.3)",
            borderRadius: 4, padding: "1px 6px", letterSpacing: 1, textTransform: "uppercase",
          }}>
            2–3 Month Plan
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: open ? ACCENT_DIM : "transparent",
            border: `1px solid ${open ? "rgba(252,165,165,0.3)" : "#1E293B"}`,
            borderRadius: 8, padding: "5px 12px",
            color: open ? ACCENT : "#4A5568",
            fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer",
          }}
        >
          {open ? "Collapse ▲" : "View Roadmap ▼"}
        </button>
      </div>
      {open && (
        <iframe
          src="/gm-prep.html"
          style={{ width: "100%", height: 620, border: "none", display: "block" }}
          title="GM Preparation Roadmap"
        />
      )}
    </div>
  );
}

// ─── DailyLogTab ──────────────────────────────────────────────────────────────

const EMPTY_FORM = { duration_min: "", activities: "", resources_used: "", learnings: "", notes: "" };

function DailyLogTab({ userId, selectedDate, setSelectedDate }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    getJobPrepDailyLog(userId, selectedDate)
      .then(entry => {
        if (cancelled) return;
        setForm(entry ? {
          duration_min:   String(entry.duration_min ?? ""),
          activities:     entry.activities     ?? "",
          resources_used: entry.resources_used ?? "",
          learnings:      entry.learnings      ?? "",
          notes:          entry.notes          ?? "",
        } : EMPTY_FORM);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, selectedDate]);

  const setField = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertJobPrepDailyLog(userId, selectedDate, {
        duration_min:   Number(form.duration_min) || 0,
        activities:     form.activities,
        resources_used: form.resources_used,
        learnings:      form.learnings,
        notes:          form.notes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const isToday = selectedDate === today();

  return (
    <div>
      {/* Date nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button
          onClick={() => setSelectedDate(d => addDays(d, -1))}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12 }}
        >←</button>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 15, color: "#E2E8F0", userSelect: "none" }}>
            {isToday ? "Today" : fmtDate(selectedDate)}
          </span>
          <span style={{ fontSize: 13, color: "#4A5568" }}>📅</span>
          <input
            type="date"
            value={selectedDate}
            max={today()}
            onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", fontSize: 16 }}
          />
        </div>

        <button
          onClick={() => !isToday && setSelectedDate(d => addDays(d, 1))}
          style={{
            background: isToday ? "transparent" : "rgba(255,255,255,0.05)",
            border: "1px solid #1E293B",
            color: isToday ? "#1E293B" : "#94A3B8",
            borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: isToday ? "default" : "pointer",
          }}
        >→</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.sans }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Study Duration (min)"
            type="number"
            placeholder="e.g. 60"
            value={form.duration_min}
            onChange={setField("duration_min")}
          />
          <TextArea
            label="Activities — What did you work on?"
            placeholder="e.g. Week 2: wrote motor start/stop program in RSLogix 500 simulator"
            rows={3}
            value={form.activities}
            onChange={setField("activities")}
          />
          <TextArea
            label="Resources Used — Sources, links, tools"
            placeholder="e.g. RealPars YouTube PLC series, SolisPlc.com, RSLogix 500"
            rows={2}
            value={form.resources_used}
            onChange={setField("resources_used")}
          />
          <TextArea
            label="Learnings — Key concepts and takeaways"
            placeholder="e.g. Understood scan cycle, NO vs NC contacts, latch logic"
            rows={3}
            value={form.learnings}
            onChange={setField("learnings")}
          />
          <TextArea
            label="Notes — Anything else"
            placeholder="e.g. Need to revisit timer instructions tomorrow"
            rows={2}
            value={form.notes}
            onChange={setField("notes")}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "11px", borderRadius: 10,
              background: saved ? "rgba(74,222,128,0.12)" : saving ? "#1E293B" : ACCENT_DIM,
              border: `1px solid ${saved ? "rgba(74,222,128,0.35)" : saving ? "#334155" : "rgba(252,165,165,0.3)"}`,
              color: saved ? "#4ADE80" : saving ? "#475569" : ACCENT,
              fontFamily: FONTS.syne, fontSize: 14, fontWeight: 700,
              cursor: saving ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {saved ? "✓ Saved" : saving ? "Saving…" : "Save Log"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── WeekViewTab ──────────────────────────────────────────────────────────────

function WeekViewTab({ userId, weekOffset, setWeekOffset, onDayClick }) {
  const [weekData, setWeekData] = useState({});
  const [loading,  setLoading]  = useState(false);

  const weekStart = getWeekStart(weekOffset);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const start = getWeekStart(weekOffset);
    const end   = addDays(start, 6);
    getJobPrepDailyLogsForRange(userId, start, end)
      .then(rows => {
        const map = {};
        for (const r of rows) map[r.log_date] = r;
        setWeekData(map);
      })
      .finally(() => setLoading(false));
  }, [userId, weekOffset]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12 }}
        >←</button>
        <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>
          Week of {fmtDate(weekStart)}
        </span>
        <button
          onClick={() => weekOffset < 0 && setWeekOffset(o => o + 1)}
          style={{
            background: weekOffset >= 0 ? "transparent" : "rgba(255,255,255,0.05)",
            border: "1px solid #1E293B", color: weekOffset >= 0 ? "#1E293B" : "#94A3B8",
            borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: weekOffset >= 0 ? "default" : "pointer",
          }}
        >→</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.sans }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {days.map((dateStr, i) => {
            const entry  = weekData[dateStr];
            const logged = !!(entry?.duration_min);
            const snippet = entry?.activities
              ? entry.activities.slice(0, 80) + (entry.activities.length > 80 ? "…" : "")
              : null;
            const isToday = dateStr === today();

            return (
              <div
                key={dateStr}
                onClick={() => onDayClick(dateStr)}
                style={{
                  border: logged
                    ? "1px solid rgba(185,28,28,0.5)"
                    : isToday ? `1px solid rgba(252,165,165,0.3)` : "1px solid #1E293B",
                  background: logged ? "rgba(45,0,0,0.5)" : "#0D1117",
                  borderRadius: 10, padding: "12px 16px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{ minWidth: 42, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#4A5568", letterSpacing: 1 }}>
                    {DAY_NAMES[i]}
                  </div>
                  <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 16, color: isToday ? ACCENT : "#94A3B8", marginTop: 2 }}>
                    {dateStr.slice(8)}
                  </div>
                </div>

                <div style={{ width: 1, height: 36, background: "#1E293B", flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {logged ? (
                    <>
                      <div style={{ marginBottom: snippet ? 4 : 0 }}>
                        <span style={{
                          background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.4)",
                          borderRadius: 6, padding: "2px 8px",
                          fontFamily: FONTS.mono, fontSize: 10, color: ACCENT,
                        }}>
                          {entry.duration_min} min
                        </span>
                      </div>
                      {snippet && (
                        <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {snippet}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#334155" }}>
                      {isToday ? "Log today's study →" : "Nothing logged"}
                    </div>
                  )}
                </div>

                <span style={{ color: "#334155", fontSize: 14, flexShrink: 0 }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MonthViewTab ─────────────────────────────────────────────────────────────

function MonthViewTab({ userId, monthOffset, setMonthOffset, onDayClick }) {
  const [monthData, setMonthData] = useState({});
  const [loading,   setLoading]   = useState(false);

  const bounds = getMonthBounds(monthOffset);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const b = getMonthBounds(monthOffset);
    getJobPrepDailyLogsForRange(userId, b.start, b.end)
      .then(rows => {
        const map = {};
        for (const r of rows) map[r.log_date] = r;
        setMonthData(map);
      })
      .finally(() => setLoading(false));
  }, [userId, monthOffset]);

  const firstDay    = new Date(bounds.year, bounds.month, 1);
  const totalDays   = new Date(bounds.year, bounds.month + 1, 0).getDate();
  const leadBlanks  = (firstDay.getDay() + 6) % 7; // Monday-based

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12 }}
        >←</button>
        <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>
          {firstDay.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => monthOffset < 0 && setMonthOffset(o => o + 1)}
          style={{
            background: monthOffset >= 0 ? "transparent" : "rgba(255,255,255,0.05)",
            border: "1px solid #1E293B", color: monthOffset >= 0 ? "#1E293B" : "#94A3B8",
            borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: monthOffset >= 0 ? "default" : "pointer",
          }}
        >→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 9, color: "#334155", letterSpacing: 1, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.sans }}>Loading…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: leadBlanks }).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: totalDays }, (_, i) => {
            const day     = i + 1;
            const dateStr = `${bounds.year}-${pad(bounds.month + 1)}-${pad(day)}`;
            const entry   = monthData[dateStr];
            const mins    = entry?.duration_min || 0;
            const isToday = dateStr === today();

            return (
              <div
                key={dateStr}
                onClick={() => onDayClick(dateStr)}
                style={{
                  height: 44, borderRadius: 6,
                  background: durationColor(mins),
                  border: isToday ? `2px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.04)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", gap: 2,
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: mins > 0 ? ACCENT : "#334155", fontWeight: mins > 0 ? 600 : 400 }}>
                  {day}
                </span>
                {mins > 0 && (
                  <span style={{ fontFamily: FONTS.mono, fontSize: 8, color: "rgba(252,165,165,0.65)" }}>
                    {mins >= 60 ? `${Math.round(mins / 60 * 10) / 10}h` : `${mins}m`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── JobPrepPage ──────────────────────────────────────────────────────────────

const TABS = [
  { key: "daily", label: "📅 Daily Log" },
  { key: "week",  label: "🗓 Week"      },
  { key: "month", label: "📆 Month"     },
];

export default function JobPrepPage() {
  const { user } = useAuth();

  const [activeTab,    setActiveTab]    = useState("daily");
  const [roadmapOpen,  setRoadmapOpen]  = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [statsData,    setStatsData]    = useState([]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await getJobPrepDailyLogsForRange(user.id, addDays(today(), -89), today());
      setStatsData(rows);
    } catch {}
  }, [user?.id]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const daysLogged = statsData.filter(r => r.duration_min > 0).length;
  const totalMins  = statsData.reduce((s, r) => s + (r.duration_min || 0), 0);
  const streak = (() => {
    const keys = new Set(statsData.filter(r => r.duration_min > 0).map(r => r.log_date));
    let count = 0, d = today();
    while (keys.has(d)) { count++; d = addDays(d, -1); }
    return count;
  })();

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveTab("daily");
  };

  return (
    <div style={{
      minHeight: "100%",
      background: "radial-gradient(ellipse at top, #2D0000 0%, #08091A 55%)",
      fontFamily: FONTS.sans,
    }}>
      <div style={{ padding: "24px 20px 80px", maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: 26, color: "#F1F5F9", letterSpacing: -0.5 }}>
            🔥 GM Job Prep
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#B91C1C", marginTop: 4, letterSpacing: 1 }}>
            General Motors · Automation Controls Engineer · Bangalore
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Days Logged",  value: daysLogged },
            { label: "Study Hours",  value: `${Math.round(totalMins / 60 * 10) / 10}h` },
            { label: "Day Streak",   value: `${streak} 🔥` },
          ].map(c => (
            <div key={c.label} style={{
              background: "rgba(252,165,165,0.05)", border: "1px solid rgba(252,165,165,0.15)",
              borderRadius: 10, padding: "8px 14px",
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90,
            }}>
              <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 18, color: ACCENT }}>{c.value}</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <RoadmapPanel open={roadmapOpen} onToggle={() => setRoadmapOpen(o => !o)} />

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24, overflowX: "auto" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px", background: "transparent", border: "none",
                borderBottom: activeTab === tab.key ? `2px solid ${ACCENT}` : "2px solid transparent",
                color: activeTab === tab.key ? ACCENT : "#4A5568",
                fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                marginBottom: -1, whiteSpace: "nowrap", cursor: "pointer",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === "daily" && (
          <DailyLogTab
            userId={user?.id}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {activeTab === "week" && (
          <WeekViewTab
            userId={user?.id}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            onDayClick={handleDayClick}
          />
        )}
        {activeTab === "month" && (
          <MonthViewTab
            userId={user?.id}
            monthOffset={monthOffset}
            setMonthOffset={setMonthOffset}
            onDayClick={handleDayClick}
          />
        )}

      </div>
    </div>
  );
}
