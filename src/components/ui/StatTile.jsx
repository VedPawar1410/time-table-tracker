import { THEME, F, lighten, shadeDarken } from "../../lib/theme.js";

export default function StatTile({ label, value, sublabel, sub, color, icon, sticker, style = {} }) {
  const c = color || THEME.primary;
  return (
    <div style={{
      flex: 1, minWidth: 120,
      background: lighten(c, 0.82),
      border: `1.5px solid ${lighten(c, 0.6)}`,
      borderRadius: THEME.rLg,
      padding: "14px 16px",
      position: "relative", overflow: "hidden",
      ...style,
    }}>
      {sticker && (
        <div style={{ position: "absolute", top: -8, right: -8, opacity: 0.35 }}>{sticker}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <div style={{ fontFamily: F.display, fontSize: 11, fontWeight: 700, color: shadeDarken(c, 0.4), textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: shadeDarken(c, 0.55), lineHeight: 1.05 }}>
        {value}
      </div>
      {(sublabel || sub) && (
        <div style={{ fontSize: 11.5, color: shadeDarken(c, 0.3), marginTop: 3, fontWeight: 600 }}>
          {sublabel || sub}
        </div>
      )}
    </div>
  );
}
