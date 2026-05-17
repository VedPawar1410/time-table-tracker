import { FONTS, THEME } from "../../lib/constants.js";

export function TextArea({ label, value, onChange, placeholder, rows = 2, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {label && (
        <label style={{
          fontSize: 9.5, color: THEME.inkMuted, fontFamily: FONTS.mono,
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500,
        }}>
          {label}
        </label>
      )}
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: THEME.surface,
          border: `1.5px solid ${THEME.line}`,
          borderRadius: THEME.rSm,
          padding: "9px 12px",
          color: THEME.ink,
          fontSize: 13,
          fontFamily: FONTS.sans,
          outline: "none",
          width: "100%",
          resize: "vertical",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = THEME.lineStrong}
        onBlur={e => e.target.style.borderColor = THEME.line}
      />
    </div>
  );
}
