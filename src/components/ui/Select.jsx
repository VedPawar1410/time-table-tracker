import { THEME, F } from "../../lib/theme.js";

export function Select({ label, value, onChange, options, style = {}, placeholder }) {
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
      <select
        value={value ?? ""}
        onChange={e => onChange?.(e.target.value)}
        style={{
          background: THEME.surface,
          border: `1.5px solid ${THEME.line}`,
          borderRadius: THEME.rMd,
          padding: "10px 14px",
          color: value ? THEME.ink : THEME.inkFaint,
          fontSize: 14, fontFamily: F.body,
          outline: "none", width: "100%",
          appearance: "none", cursor: "pointer",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E7B6E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: 36,
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = THEME.lineStrong}
        onBlur={e => e.target.style.borderColor = THEME.line}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}
