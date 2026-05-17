import { FONTS, THEME } from "../../lib/constants.js";

export function Input({ label, value, onChange, placeholder, type = "text", style, suffix, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, ...style }}>
      {label && (
        <label style={{
          fontSize: 9.5,
          color: THEME.inkMuted,
          fontFamily: FONTS.mono,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 500,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 10,
            color: THEME.inkFaint, fontSize: 14, pointerEvents: "none",
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            background: THEME.surface,
            border: `1.5px solid ${THEME.line}`,
            borderRadius: THEME.rSm,
            padding: icon ? "9px 12px 9px 32px" : "9px 12px",
            paddingRight: suffix ? 36 : 12,
            color: THEME.ink,
            fontSize: 13,
            fontFamily: FONTS.sans,
            outline: "none",
            width: "100%",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = THEME.lineStrong}
          onBlur={e => e.target.style.borderColor = THEME.line}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: 10,
            color: THEME.inkMuted, fontSize: 12, pointerEvents: "none",
            fontFamily: FONTS.mono,
          }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
