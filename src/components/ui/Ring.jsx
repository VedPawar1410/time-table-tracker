import { THEME, F, lighten } from "../../lib/theme.js";

export function Ring({ pct, size = 88, stroke = 8, color, trackColor, label, sublabel }) {
  const c = color || (
    pct === 100 ? "#6BAD3A" :
    pct >= 70   ? THEME.primary :
    pct >= 40   ? "#D69B1F" :
    "#E8623A"
  );
  const tc = trackColor || lighten(c, 0.7);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={tc} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={c} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
        <div style={{ fontFamily: F.display, fontSize: size * 0.26, fontWeight: 900, color: THEME.ink }}>
          {label !== undefined ? label : `${Math.round(pct)}%`}
        </div>
        {sublabel && (
          <div style={{ fontFamily: F.mono, fontSize: size * 0.12, color: THEME.inkMuted, marginTop: 2 }}>{sublabel}</div>
        )}
      </div>
    </div>
  );
}
