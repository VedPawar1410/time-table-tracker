import { THEME, FONTS } from "../../lib/constants";

export default function Chip({ label, active, color, size = "md", onClick, style }) {
  const c = color || THEME.primary;
  const sm = size === "sm";
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: sm ? "3px 10px" : "5px 14px",
        borderRadius: THEME.rPill,
        fontSize: sm ? 11 : 12.5,
        fontFamily: FONTS.sans,
        fontWeight: 600,
        cursor: onClick ? "pointer" : "default",
        border: `1.5px solid ${active ? c : THEME.line}`,
        background: active ? c + "22" : THEME.surfaceAlt,
        color: active ? c : THEME.inkMuted,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        lineHeight: 1,
        ...style,
      }}
    >
      {label}
    </button>
  );
}
