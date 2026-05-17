import { THEME } from "../../lib/constants";

export default function CheckBubble({ checked, onChange, color, size = 32, disabled = false }) {
  const c = color || THEME.primary;
  return (
    <button
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: checked ? "none" : `2px solid ${THEME.line}`,
        background: checked ? c : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
        transition: "background 0.15s, border 0.15s, transform 0.1s",
        animation: checked ? "pop 0.25s ease" : undefined,
        boxShadow: checked ? `0 2px 6px ${c}55` : undefined,
        opacity: disabled ? 0.5 : 1,
        padding: 0,
      }}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg
          width={size * 0.44}
          height={size * 0.44}
          viewBox="0 0 18 18"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3,9 7,13 15,5" />
        </svg>
      )}
    </button>
  );
}
