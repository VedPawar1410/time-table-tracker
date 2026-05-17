import { THEME, shadeDarken } from "../../lib/theme.js";

export default function Toggle({ checked, onChange, color, disabled = false }) {
  const c = color || THEME.primary;
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 999, padding: 3,
        background: checked ? c : THEME.line,
        border: "none", cursor: disabled ? "default" : "pointer",
        boxShadow: checked ? `0 2px 0 0 ${shadeDarken(c, 0.25)}` : "inset 0 1px 3px rgba(0,0,0,0.1)",
        transition: "background 0.2s, box-shadow 0.2s",
        display: "flex", alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <span style={{
        display: "block",
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff",
        transform: checked ? "translateX(18px)" : "translateX(0)",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}
