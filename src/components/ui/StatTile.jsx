import { THEME, FONTS } from "../../lib/constants";

export default function StatTile({ label, value, sub, icon, color, style }) {
  const c = color || THEME.primary;
  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.line}`,
        borderRadius: THEME.rMd,
        boxShadow: THEME.shadowSm,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon && (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: THEME.rSm,
              background: c + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: THEME.inkMuted,
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: FONTS.nunito,
          fontSize: 26,
          fontWeight: 800,
          color: THEME.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: 11.5,
            color: THEME.inkMuted,
            lineHeight: 1,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
