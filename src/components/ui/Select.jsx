import { FONTS } from "../../lib/constants.js";

export function Select({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, ...style }}>
      {label && (
        <label style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "#08091A", border: "1px solid #1E293B", borderRadius: 8,
          padding: "9px 12px", color: value ? "#E2E8F0" : "#3D5068", fontSize: 13, fontFamily: FONTS.sans,
          outline: "none", width: "100%", appearance: "none", cursor: "pointer",
        }}
      >
        <option value="" disabled>Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
