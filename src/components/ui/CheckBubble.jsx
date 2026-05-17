import { THEME, shadeDarken } from "../../lib/theme.js";

export default function CheckBubble({ checked, onChange, onClick, color, size = 32, disabled = false }) {
  const c = color || THEME.primary;
  const handleClick = onClick || (() => !disabled && onChange?.(!checked));
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: "50%",
        background: checked ? c : "transparent",
        border: `2.5px solid ${checked ? c : THEME.lineStrong}`,
        cursor: disabled ? "default" : "pointer",
        padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: checked ? `0 3px 0 0 ${shadeDarken(c, 0.3)}` : "none",
        transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: disabled ? 0.5 : 1,
      }}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <path d="M 5 12 L 10 17 L 19 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
