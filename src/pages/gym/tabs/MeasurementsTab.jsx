import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { THEME, MEASUREMENT_METRICS, METRIC_UNITS } from "../../../lib/constants.js";
import { TASK_PALETTE, F, lighten } from "../../../lib/theme.js";
import { CalendarPicker } from "../../../components/ui/CalendarPicker.jsx";
import { getAllLatestMeasurements, getMeasurements, addMeasurement, deleteMeasurement } from "../../../lib/db.js";

const p = TASK_PALETTE.gym;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function unitFor(metric) { return METRIC_UNITS[metric] || "cm"; }

export function MeasurementsTab({ userId }) {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [addingFor, setAddingFor] = useState(null);
  const [addVal, setAddVal] = useState("");
  const [addDate, setAddDate] = useState(todayKey());
  const [saving, setSaving] = useState(false);

  const loadLatest = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setLatest(await getAllLatestMeasurements(userId)); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadLatest(); }, [loadLatest]);

  const openMetric = async (metric) => {
    if (activeMetric === metric) { setActiveMetric(null); setChartData([]); return; }
    setActiveMetric(metric);
    setChartLoading(true);
    try {
      const rows = await getMeasurements(userId, metric);
      setChartData(rows.map(r => ({ date: r.log_date, value: parseFloat(r.value_num), id: r.id })));
    } finally { setChartLoading(false); }
  };

  const handleAdd = async () => {
    if (!addVal || !addingFor) return;
    setSaving(true);
    try {
      await addMeasurement(userId, { log_date: addDate, metric: addingFor, value_num: parseFloat(addVal), unit: unitFor(addingFor) });
      setAddingFor(null); setAddVal(""); setAddDate(todayKey());
      await loadLatest();
      if (activeMetric === addingFor) {
        const rows = await getMeasurements(userId, addingFor);
        setChartData(rows.map(r => ({ date: r.log_date, value: parseFloat(r.value_num), id: r.id })));
      }
    } finally { setSaving(false); }
  };

  const latestMap = Object.fromEntries(latest.map(r => [r.metric, r]));

  const renderSection = (title, metrics) => (
    <div style={{ marginBottom: 28 }} key={title}>
      <div style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {metrics.map(metric => {
          const rec = latestMap[metric];
          const unit = unitFor(metric);
          const isActive = activeMetric === metric;
          return (
            <div key={metric}>
              <div
                onClick={() => openMetric(metric)}
                style={{
                  padding: "14px 16px",
                  background: isActive ? lighten(p.fg, 0.88) : THEME.surface,
                  borderRadius: isActive ? `${THEME.rMd}px ${THEME.rMd}px 0 0` : THEME.rMd,
                  border: `1.5px solid ${isActive ? lighten(p.fg, 0.65) : THEME.line}`,
                  borderBottom: isActive ? "none" : undefined,
                  cursor: "pointer", transition: "background 0.15s",
                  boxShadow: isActive ? "none" : THEME.shadowSm,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 13, color: THEME.ink, marginBottom: 4 }}>{metric}</div>
                    {rec ? (
                      <div style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: p.fg }}>
                        {rec.value_num} <span style={{ fontSize: 11, color: THEME.inkMuted }}>{unit}</span>
                      </div>
                    ) : (
                      <div style={{ fontFamily: F.mono, fontSize: 16, color: THEME.inkFaint }}>—</div>
                    )}
                    {rec && <div style={{ fontFamily: F.body, fontSize: 11, color: THEME.inkFaint, marginTop: 2 }}>{rec.log_date}</div>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setAddingFor(metric); setAddVal(""); setAddDate(todayKey()); }}
                    style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: lighten(p.fg, 0.82), border: `1.5px solid ${lighten(p.fg, 0.65)}`,
                      color: p.fg, fontSize: 16, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                    }}
                  >+</button>
                </div>
              </div>

              {isActive && (
                <div style={{ padding: "14px", background: THEME.surfaceAlt, border: `1.5px solid ${lighten(p.fg, 0.65)}`, borderTop: "none", borderRadius: `0 0 ${THEME.rMd}px ${THEME.rMd}px` }}>
                  {chartLoading ? (
                    <div style={{ textAlign: "center", padding: 20, color: THEME.inkFaint, fontFamily: F.mono, fontSize: 11, letterSpacing: 2 }}>LOADING...</div>
                  ) : chartData.length < 2 ? (
                    <div style={{ textAlign: "center", padding: 16, color: THEME.inkMuted, fontFamily: F.body, fontSize: 12 }}>
                      Add {2 - chartData.length} more {chartData.length === 1 ? "entry" : "entries"} to see chart
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: THEME.inkFaint, fontFamily: F.mono }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: THEME.inkFaint, fontFamily: F.mono }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 8, fontFamily: F.mono, fontSize: 11 }}
                          labelStyle={{ color: THEME.inkMuted }}
                          itemStyle={{ color: p.fg }}
                        />
                        <Line type="monotone" dataKey="value" stroke={p.fg} strokeWidth={2} dot={{ r: 3, fill: p.fg }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {chartData.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      {[...chartData].reverse().slice(0, 5).map(row => (
                        <div key={row.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${THEME.line}` }}>
                          <span style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: F.body }}>{row.date}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, color: THEME.ink, fontFamily: F.mono }}>{row.value} {unit}</span>
                            <button onClick={() => deleteMeasurement(row.id).then(() => { setChartData(d => d.filter(r => r.id !== row.id)); loadLatest(); })}
                              style={{ background: "transparent", border: "none", color: THEME.inkFaint, cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: F.mono, fontSize: 12, letterSpacing: 2 }}>LOADING...</div>
      ) : (
        <>
          {renderSection("CORE", MEASUREMENT_METRICS.CORE)}
          {renderSection("BODY PART", MEASUREMENT_METRICS.BODY_PART)}
        </>
      )}

      {addingFor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(43,30,24,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="pop-in" style={{ background: THEME.surface, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rLg, padding: 28, width: "100%", maxWidth: 360, boxShadow: THEME.shadowLg }}>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 16, color: THEME.ink, marginBottom: 4 }}>Add {addingFor}</div>
            <div style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: F.body, marginBottom: 18 }}>Unit: {unitFor(addingFor)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <CalendarPicker label="Date" value={addDate} onChange={v => setAddDate(v)} />
              <Field label={`Value (${unitFor(addingFor)})`}><input type="number" value={addVal} onChange={e => setAddVal(e.target.value)} placeholder="0.0" step="0.1" autoFocus style={iStyle()} /></Field>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAddingFor(null)} style={{ flex: 1, padding: "10px", background: THEME.bg, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rMd, color: THEME.inkSoft, fontFamily: F.display, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !addVal} style={{ flex: 2, padding: "10px", background: p.fg, border: "none", borderRadius: THEME.rMd, color: "#fff", fontFamily: F.display, fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: saving || !addVal ? 0.6 : 1, boxShadow: `0 3px 0 0 ${p.deep}` }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function iStyle() {
  return { background: THEME.surface, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rMd, padding: "10px 14px", color: THEME.ink, fontSize: 14, fontFamily: F.body, outline: "none", width: "100%" };
}
