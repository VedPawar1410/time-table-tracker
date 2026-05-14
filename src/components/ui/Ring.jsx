import { FONTS } from "../../lib/constants.js";

export function Ring({ pct, size = 88, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? "#4ADE80" : pct >= 70 ? "#FCD34D" : pct >= 40 ? "#7DD3FC" : "#FCA5A5";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: size * 0.22, color, lineHeight: 1 }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}
