import { THEME, F, lighten, shadeDarken } from "../../lib/theme.js";

export default function Chip({ children, label, color, size = "md", icon, onClick, active = false, style = {} }) {
  const sizes = { sm: { padX: 9, padY: 4, fs: 11 }, md: { padX: 12, padY: 6, fs: 12.5 } };
  const s = sizes[size] || sizes.md;
  const c = color || THEME.primary;
  const text = children ?? label;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: `${s.padY}px ${s.padX}px`,
        background: active ? c : lighten(c, 0.78),
        color: active ? "#fff" : shadeDarken(c, 0.4),
        borderRadius: 999,
        fontSize: s.fs, fontWeight: 700, fontFamily: F.display,
        border: `1.5px solid ${active ? c : lighten(c, 0.55)}`,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {text}
    </span>
  );
}
