import { THEME, F } from "../../lib/theme.js";

export function TextArea({ label, value, onChange, placeholder, rows = 3, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", ...style }}>
      {label && (
        <label style={{
          fontSize: 11, fontFamily: F.display, fontWeight: 700,
          color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          {label}
        </label>
      )}
      <textarea
        value={value ?? ""}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: THEME.surface,
          border: `1.5px solid ${THEME.line}`,
          borderRadius: THEME.rMd,
          padding: "10px 14px",
          color: THEME.ink,
          fontSize: 14,
          fontFamily: F.body,
          outline: "none",
          width: "100%",
          resize: "vertical",
          lineHeight: 1.5,
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = THEME.lineStrong}
        onBlur={e => e.target.style.borderColor = THEME.line}
      />
    </div>
  );
}
