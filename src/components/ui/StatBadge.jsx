import { FONTS } from "../../lib/constants.js";

export function StatBadge({ label, value, color = "#E2E8F0", style }) {
  return (
    <div style={{
      flex: 1, padding: "10px 12px", borderRadius: 10,
      background: "rgba(13,17,23,0.6)", border: "1px solid #1E293B",
      display: "flex", flexDirection: "column", gap: 3, ...style,
    }}>
      <div style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: 22, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "#3D5068", fontFamily: FONTS.mono, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
