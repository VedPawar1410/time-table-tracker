import { THEME, F } from "../../lib/theme.js";
import Sticker from "../ui/Sticker.jsx";

export function PageHeader({ kicker, title, subtitle, action, sticker, stickerColor, icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
      <div style={{ position: "relative" }}>
        {sticker && (
          <div style={{ position: "absolute", top: -6, left: -42, transform: "rotate(-15deg)", pointerEvents: "none" }}>
            <Sticker kind={sticker} color={stickerColor || THEME.primary} size={32} wiggle />
          </div>
        )}
        {kicker && (
          <div style={{ fontFamily: F.mono, fontSize: 11, color: THEME.primary, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            {kicker}
          </div>
        )}
        <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: THEME.ink, lineHeight: 1.05, letterSpacing: -0.5, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {icon && <span style={{ fontSize: 30 }}>{icon}</span>}
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: THEME.inkMuted, fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>{subtitle}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
