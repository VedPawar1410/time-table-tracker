import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FONTS, THEME, MEASUREMENT_METRICS, METRIC_UNITS } from "../../../lib/constants.js";
import { CalendarPicker } from "../../../components/ui/CalendarPicker.jsx";
import { getAllLatestMeasurements, getMeasurements, addMeasurement, deleteMeasurement } from "../../../lib/db.js";

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
      <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {metrics.map(metric => {
          const rec = latestMap[metric];
          const unit = unitFor(metric);
          const isActive = activeMetric === metric;
          return (
            <div key={metric}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 14px",
                background: isActive ? "#FFEADE" : THEME.surface,
                borderRadius: isActive ? `${THEME.rSm} ${THEME.rSm} 0 0` : THEME.rSm,
                border: `1px solid ${isActive ? THEME.primary : THEME.line}`,
                borderBottom: isActive ? "none" : undefined,
                cursor: "pointer",
                transition: "background 0.15s",
                boxShadow: isActive ? "none" : THEME.shadowSm,
              }}
                onClick={() => openMetric(metric)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: THEME.ink, fontWeight: 500 }}>{metric}</span>
                  {rec && (
                    <span style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONTS.sans }}>
                      Last: {rec.log_date}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {rec && (
                    <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: "#E8623A", fontWeight: 600 }}>
                      {rec.value_num} <span style={{ fontSize: 11, color: THEME.inkMuted }}>{unit}</span>
                    </span>
                  )}
                  {!rec && <span style={{ color: THEME.inkFaint, fontSize: 12, fontFamily: FONTS.sans }}>—</span>}
                  <button
                    onClick={e => { e.stopPropagation(); setAddingFor(metric); setAddVal(""); setAddDate(todayKey()); }}
                    style={{
                      width: 28, height: 28, borderRadius: THEME.rSm, background: "#FFDDD0",
                      border: "1px solid #F5C4B5", color: "#E8623A",
                      fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, flexShrink: 0,
                    }}
                  >+</button>
                </div>
              </div>

              {/* Expanded chart + history */}
              {isActive && (
                <div style={{ padding: "14px", background: THEME.surfaceAlt, border: `1px solid ${THEME.primary}`, borderTop: "none", borderRadius: `0 0 ${THEME.rSm} ${THEME.rSm}` }}>
                  {chartLoading ? (
                    <div style={{ textAlign: "center", padding: 20, color: THEME.inkFaint, fontFamily: FONTS.mono, fontSize: 11 }}>Loading chart...</div>
                  ) : chartData.length < 2 ? (
                    <div style={{ textAlign: "center", padding: 16, color: THEME.inkMuted, fontFamily: FONTS.sans, fontSize: 12 }}>
                      Add {2 - chartData.length} more {chartData.length === 1 ? "entry" : "entries"} to see chart
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: THEME.inkFaint, fontFamily: FONTS.mono }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: THEME.inkFaint, fontFamily: FONTS.mono }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 8, fontFamily: FONTS.mono, fontSize: 11 }}
                          labelStyle={{ color: THEME.inkMuted }}
                          itemStyle={{ color: "#E8623A" }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#E8623A" strokeWidth={2} dot={{ r: 3, fill: "#E8623A" }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {/* History list (last 5) */}
                  {chartData.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      {[...chartData].reverse().slice(0, 5).map(row => (
                        <div key={row.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${THEME.line}` }}>
                          <span style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: FONTS.sans }}>{row.date}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, color: THEME.ink, fontFamily: FONTS.mono }}>{row.value} {unit}</span>
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
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.mono, fontSize: 12 }}>Loading...</div>
      ) : (
        <>
          {renderSection("CORE", MEASUREMENT_METRICS.CORE)}
          {renderSection("BODY PART", MEASUREMENT_METRICS.BODY_PART)}
        </>
      )}

      {/* Add measurement modal */}
      {addingFor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(43,30,24,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: THEME.rLg, padding: 24, width: "100%", maxWidth: 360, boxShadow: THEME.shadowMd }}>
            <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 15, color: THEME.ink, marginBottom: 4 }}>Add {addingFor}</div>
            <div style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: FONTS.sans, marginBottom: 16 }}>Unit: {unitFor(addingFor)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <CalendarPicker label="Date" value={addDate} onChange={v => setAddDate(v)} />
              <Field label={`Value (${unitFor(addingFor)})`}><input type="number" value={addVal} onChange={e => setAddVal(e.target.value)} placeholder="0.0" step="0.1" autoFocus style={iStyle()} /></Field>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAddingFor(null)} style={{ flex: 1, padding: "9px", background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, borderRadius: THEME.rSm, color: THEME.inkSoft, fontFamily: FONTS.sans, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !addVal} style={{ flex: 2, padding: "9px", background: "#E8623A", border: "none", borderRadius: THEME.rSm, color: "#fff", fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving || !addVal ? 0.6 : 1 }}>
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
      <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function iStyle() {
  return { background: THEME.surface, border: `1.5px solid ${THEME.line}`, borderRadius: THEME.rSm, padding: "8px 10px", color: THEME.ink, fontSize: 13, fontFamily: FONTS.sans, outline: "none", width: "100%" };
}
