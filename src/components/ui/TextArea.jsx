import { FONTS } from "../../lib/constants.js";

export function TextArea({ label, value, onChange, placeholder, rows = 2, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: "#08091A", border: "1px solid #1E293B", borderRadius: 8,
          padding: "9px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: FONTS.sans,
          outline: "none", width: "100%", resize: "vertical", transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#334155"}
        onBlur={e => e.target.style.borderColor = "#1E293B"}
      />
    </div>
  );
}
