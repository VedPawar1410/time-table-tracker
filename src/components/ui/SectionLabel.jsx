import { THEME, F } from "../../lib/theme.js";
import Sticker from "./Sticker.jsx";

export default function SectionLabel({ children, color, style = {} }) {
  const c = color || THEME.primary;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, ...style }}>
      <Sticker kind="dot" color={c} size={7} />
      <span style={{
        fontFamily: F.display, fontSize: 10.5, fontWeight: 800,
        color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1.5,
      }}>
        {children}
      </span>
    </div>
  );
}
