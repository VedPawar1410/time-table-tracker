import { useState } from "react";
import { FONTS, THEME } from "../../../lib/constants.js";

function getSettings() {
  try { return JSON.parse(localStorage.getItem("gym_settings") || "{}"); } catch { return {}; }
}
function saveSettings(s) {
  localStorage.setItem("gym_settings", JSON.stringify(s));
}

export function SettingsTab() {
  const [settings, setSettings] = useState(getSettings());

  const set = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Section title="Log Workout">
        <Row label="Weight Unit" hint="Used in the workout logger">
          <Pills
            options={[["kg", "kg"], ["lbs", "lbs"]]}
            value={settings.weightUnit || "kg"}
            onChange={v => set("weightUnit", v)}
          />
        </Row>
        <Row label="Distance Unit" hint="Used in cardio logging">
          <Pills
            options={[["km", "km"], ["mi", "mi"]]}
            value={settings.distanceUnit || "km"}
            onChange={v => set("distanceUnit", v)}
          />
        </Row>
        <Row label="Default Rest Time" hint="Shown as label between sets">
          <Pills
            options={[["1:00", "1 min"], ["1:30", "1:30"], ["2:00", "2 min"], ["3:00", "3 min"]]}
            value={settings.restDefault || "1:30"}
            onChange={v => set("restDefault", v)}
          />
        </Row>
      </Section>

      <Section title="Calendar">
        <Row label="Week Starts On">
          <Pills
            options={[["monday", "Monday"], ["sunday", "Sunday"]]}
            value={settings.weekStart || "monday"}
            onChange={v => set("weekStart", v)}
          />
        </Row>
      </Section>

      <Section title="Measurements">
        <Row label="Body Measurement Unit">
          <Pills
            options={[["cm", "cm"], ["in", "inches"]]}
            value={settings.measureUnit || "cm"}
            onChange={v => set("measureUnit", v)}
          />
        </Row>
      </Section>

      <div style={{ marginTop: 16, padding: "12px 14px", background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, borderRadius: THEME.rSm }}>
        <div style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: FONTS.sans }}>
          Settings are saved locally on this device. They apply immediately to the workout logger.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingLeft: 2 }}>{title}</div>
      <div style={{ borderRadius: THEME.rSm, overflow: "hidden", border: `1px solid ${THEME.line}` }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", background: THEME.surface, borderBottom: `1px solid ${THEME.line}`, gap: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: THEME.ink, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: THEME.inkMuted, fontFamily: FONTS.sans, marginTop: 1 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Pills({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          style={{
            padding: "5px 12px", borderRadius: THEME.rPill, fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer",
            border: `1px solid ${value === val ? "#E8623A" : THEME.line}`,
            background: value === val ? "#FFDDD0" : THEME.surfaceAlt,
            color: value === val ? "#E8623A" : THEME.inkSoft,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
