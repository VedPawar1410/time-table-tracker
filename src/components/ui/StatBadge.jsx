import { FONTS, THEME } from "../../lib/constants.js";

export function StatBadge({ label, value, color, style }) {
  const c = color || THEME.primary;
  return (
    <div style={{
      flex: 1, padding: "12px 14px", borderRadius: THEME.rMd,
      background: THEME.surface, border: `1px solid ${THEME.line}`,
      boxShadow: THEME.shadowSm,
      display: "flex", flexDirection: "column", gap: 3, ...style,
    }}>
      <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 22, color: c, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: FONTS.mono, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
