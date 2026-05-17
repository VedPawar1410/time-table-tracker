import { THEME, F, lighten, shadeDarken } from "../../lib/theme.js";

export default function MacroBar({ label, value, target, color, unit = "g" }) {
  const c = color || THEME.primary;
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontFamily: F.display, fontWeight: 700, color: shadeDarken(c, 0.3) }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: F.mono, color: THEME.inkMuted }}>
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <div style={{ height: 7, background: lighten(c, 0.72), borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: c, borderRadius: 999,
          transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }} />
      </div>
    </div>
  );
}
