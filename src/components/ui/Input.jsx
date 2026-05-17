import { THEME, F } from "../../lib/theme.js";

export function Input({ label, value, onChange, placeholder, type = "text", style = {}, suffix, icon, autoFocus, min, max, step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, ...style }}>
      {label && (
        <label style={{
          fontSize: 11, fontFamily: F.display, fontWeight: 700,
          color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: THEME.surface,
        border: `1.5px solid ${THEME.line}`,
        borderRadius: THEME.rMd,
        padding: "10px 14px",
      }}>
        {icon && <span style={{ fontSize: 16, color: THEME.inkMuted, flexShrink: 0 }}>{icon}</span>}
        <input
          type={type}
          value={value ?? ""}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          min={min}
          max={max}
          step={step}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 14, fontFamily: F.body, color: THEME.ink, width: "100%",
          }}
          onFocus={e => e.target.parentElement.style.borderColor = THEME.lineStrong}
          onBlur={e => e.target.parentElement.style.borderColor = THEME.line}
        />
        {suffix && (
          <span style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: F.mono, flexShrink: 0 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}
