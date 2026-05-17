import { FONTS, THEME } from "../../lib/constants.js";

export function PageHeader({ title, icon, subtitle, action, kicker, sticker }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {kicker && (
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: THEME.inkMuted,
              marginBottom: 6,
            }}>
              {kicker}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon && <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>}
            <h1 style={{
              fontFamily: FONTS.nunito,
              fontSize: 28,
              fontWeight: 800,
              color: THEME.ink,
              lineHeight: 1.1,
              letterSpacing: -0.3,
              margin: 0,
            }}>
              {title}
            </h1>
            {sticker && <span style={{ marginLeft: 4 }}>{sticker}</span>}
          </div>
          {subtitle && (
            <p style={{
              color: THEME.inkSoft,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.6,
              fontFamily: FONTS.sans,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>
        )}
      </div>
    </div>
  );
}
