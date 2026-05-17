import { useState, useEffect, useCallback } from "react";
import { THEME } from "../../lib/constants.js";
import { TASK_PALETTE, F, lighten } from "../../lib/theme.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
const FONTS = { mono: F.mono, sans: F.body, nunito: F.display };
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
  const day = d.getDay();
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
  if (!minutes || minutes <= 0) return THEME.surfaceAlt;
  if (minutes < 30) return "#FFD6DF";
  if (minutes < 60) return "#FBD2E2";
  return "#F5BEC9";
}

const ACCENT     = "#D6395B";
const ACCENT_BG  = "#FFD6DF";
const DAY_NAMES  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── RoadmapPanel ─────────────────────────────────────────────────────────────

function RoadmapPanel({ open, onToggle }) {
  return (
    <div style={{
      border: `1px solid #F5BEC9`,
      borderRadius: THEME.rMd,
      background: THEME.surface,
      marginBottom: 20,
      overflow: "hidden",
      boxShadow: THEME.shadowSm,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 14, color: THEME.ink }}>
            GM Preparation Roadmap
          </span>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 9, color: ACCENT,
            background: ACCENT_BG, border: `1px solid #F5BEC9`,
            borderRadius: THEME.rPill, padding: "1px 6px", letterSpacing: 1, textTransform: "uppercase",
          }}>
            2–3 Month Plan
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: open ? ACCENT_BG : THEME.surfaceAlt,
            border: `1px solid ${open ? "#F5BEC9" : THEME.line}`,
            borderRadius: THEME.rSm, padding: "5px 12px",
            color: open ? ACCENT : THEME.inkSoft,
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
          style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, color: THEME.inkSoft, borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12, cursor: "pointer" }}
        >←</button>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <span style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 15, color: THEME.ink, userSelect: "none" }}>
            {isToday ? "Today" : fmtDate(selectedDate)}
          </span>
          <span style={{ fontSize: 13, color: THEME.inkFaint }}>📅</span>
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
            background: isToday ? "transparent" : THEME.surfaceAlt,
            border: `1px solid ${THEME.line}`,
            color: isToday ? THEME.line : THEME.inkSoft,
            borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: isToday ? "default" : "pointer",
          }}
        >→</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.sans }}>Loading…</div>
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
              padding: "11px", borderRadius: THEME.rMd,
              background: saved ? "#D2EEDB" : saving ? THEME.surfaceAlt : ACCENT_BG,
              border: `1px solid ${saved ? "#BCDFC8" : saving ? THEME.line : "#F5BEC9"}`,
              color: saved ? "#4FA070" : saving ? THEME.inkFaint : ACCENT,
              fontFamily: FONTS.nunito, fontSize: 14, fontWeight: 700,
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
          style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, color: THEME.inkSoft, borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12, cursor: "pointer" }}
        >←</button>
        <span style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 14, color: THEME.ink }}>
          Week of {fmtDate(weekStart)}
        </span>
        <button
          onClick={() => weekOffset < 0 && setWeekOffset(o => o + 1)}
          style={{
            background: weekOffset >= 0 ? "transparent" : THEME.surfaceAlt,
            border: `1px solid ${THEME.line}`, color: weekOffset >= 0 ? THEME.line : THEME.inkSoft,
            borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: weekOffset >= 0 ? "default" : "pointer",
          }}
        >→</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.sans }}>Loading…</div>
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
                    ? `1px solid #F5BEC9`
                    : isToday ? `1px solid ${THEME.lineStrong}` : `1px solid ${THEME.line}`,
                  background: logged ? ACCENT_BG : isToday ? THEME.surfaceAlt : THEME.surface,
                  borderRadius: THEME.rMd, padding: "12px 16px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                  boxShadow: THEME.shadowSm,
                }}
              >
                <div style={{ minWidth: 42, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkFaint, letterSpacing: 1 }}>
                    {DAY_NAMES[i]}
                  </div>
                  <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 16, color: isToday ? ACCENT : THEME.inkSoft, marginTop: 2 }}>
                    {dateStr.slice(8)}
                  </div>
                </div>

                <div style={{ width: 1, height: 36, background: THEME.line, flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {logged ? (
                    <>
                      <div style={{ marginBottom: snippet ? 4 : 0 }}>
                        <span style={{
                          background: ACCENT_BG, border: `1px solid #F5BEC9`,
                          borderRadius: THEME.rPill, padding: "2px 8px",
                          fontFamily: FONTS.mono, fontSize: 10, color: ACCENT,
                        }}>
                          {entry.duration_min} min
                        </span>
                      </div>
                      {snippet && (
                        <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: THEME.inkMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {snippet}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: THEME.inkFaint }}>
                      {isToday ? "Log today's study →" : "Nothing logged"}
                    </div>
                  )}
                </div>

                <span style={{ color: THEME.inkFaint, fontSize: 14, flexShrink: 0 }}>›</span>
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
  const leadBlanks  = (firstDay.getDay() + 6) % 7;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, color: THEME.inkSoft, borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12, cursor: "pointer" }}
        >←</button>
        <span style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 14, color: THEME.ink }}>
          {firstDay.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => monthOffset < 0 && setMonthOffset(o => o + 1)}
          style={{
            background: monthOffset >= 0 ? "transparent" : THEME.surfaceAlt,
            border: `1px solid ${THEME.line}`, color: monthOffset >= 0 ? THEME.line : THEME.inkSoft,
            borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
            cursor: monthOffset >= 0 ? "default" : "pointer",
          }}
        >→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkFaint, letterSpacing: 1, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.sans }}>Loading…</div>
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
                  height: 44, borderRadius: THEME.rSm,
                  background: durationColor(mins),
                  border: isToday ? `2px solid ${ACCENT}` : `1px solid ${THEME.line}`,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", gap: 2,
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: mins > 0 ? ACCENT : THEME.inkFaint, fontWeight: mins > 0 ? 600 : 400 }}>
                  {day}
                </span>
                {mins > 0 && (
                  <span style={{ fontFamily: FONTS.mono, fontSize: 8, color: ACCENT }}>
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

  const jp = TASK_PALETTE.jobprep;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: F.body }}>
      <PageHeader
        kicker="DEEP DIVE · JOB PREP"
        title="GM Job Prep"
        subtitle="General Motors · Automation Controls Engineer · Bangalore"
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Days Logged",  value: daysLogged },
          { label: "Study Hours",  value: `${Math.round(totalMins / 60 * 10) / 10}h` },
          { label: "Day Streak",   value: `${streak} 🔥` },
        ].map(c => (
          <div key={c.label} style={{
            background: lighten(jp.fg, 0.88), border: `1.5px solid ${lighten(jp.fg, 0.7)}`,
            borderRadius: THEME.rMd, padding: "10px 16px",
            display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100,
            boxShadow: THEME.shadowSm,
          }}>
            <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: jp.fg }}>{c.value}</span>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <RoadmapPanel open={roadmapOpen} onToggle={() => setRoadmapOpen(o => !o)} />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: THEME.surface, borderRadius: THEME.rMd, padding: 5,
        border: `1.5px solid ${THEME.line}`, boxShadow: THEME.shadowSm,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "9px 12px", borderRadius: THEME.rSm, border: "none",
              background: activeTab === tab.key ? lighten(jp.fg, 0.78) : "transparent",
              color: activeTab === tab.key ? jp.deep : THEME.inkSoft,
              fontFamily: F.display, fontSize: 13, fontWeight: activeTab === tab.key ? 800 : 600,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: activeTab === tab.key ? THEME.shadowSm : "none",
              transition: "all 0.15s",
            }}
          >{tab.label}</button>
        ))}
      </div>

      <div style={{ paddingBottom: 60 }}>

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
