import { THEME } from "../../lib/theme.js";

export default function Sticker({ kind = "blob", type, color, size = 40, wiggle = false, style = {} }) {
  const k = kind || type || "blob";
  const c = color || THEME.primary;
  const base = {
    display: "inline-block",
    width: size, height: size,
    flexShrink: 0,
    animation: wiggle ? "stk-wiggle 3.5s ease-in-out infinite" : undefined,
    ...style,
  };

  switch (k) {
    case "blob":
      return <span style={{ ...base, background: c, borderRadius: "62% 38% 47% 53% / 41% 56% 44% 59%" }} />;
    case "blob2":
      return <span style={{ ...base, background: c, borderRadius: "38% 62% 53% 47% / 56% 41% 59% 44%" }} />;
    case "dot":
      return <span style={{ ...base, background: c, borderRadius: "50%" }} />;
    case "donut":
      return <span style={{ ...base, background: "transparent", border: `${Math.max(4, size * 0.18)}px solid ${c}`, borderRadius: "50%" }} />;
    case "diamond":
      return <span style={{ ...base, background: c, transform: `rotate(45deg)`, borderRadius: size * 0.15 }} />;
    case "plus":
      return (
        <span style={{ ...base, position: "relative" }}>
          <span style={{ position: "absolute", top: "50%", left: 0, width: size, height: size * 0.28, background: c, borderRadius: size * 0.1, transform: "translateY(-50%)" }} />
          <span style={{ position: "absolute", left: "50%", top: 0, width: size * 0.28, height: size, background: c, borderRadius: size * 0.1, transform: "translateX(-50%)" }} />
        </span>
      );
    case "star":
      return (
        <span style={{ ...base, position: "relative" }}>
          <span style={{ position: "absolute", inset: 0, background: c, borderRadius: "50% 8% 50% 8% / 8% 50% 8% 50%" }} />
        </span>
      );
    case "sparkle":
      return (
        <span style={{ ...base, position: "relative" }}>
          <span style={{ position: "absolute", left: "50%", top: 0, width: size * 0.18, height: size, background: c, borderRadius: size * 0.1, transform: "translateX(-50%)" }} />
          <span style={{ position: "absolute", top: "50%", left: 0, width: size, height: size * 0.18, background: c, borderRadius: size * 0.1, transform: "translateY(-50%)" }} />
        </span>
      );
    case "squiggle":
      return (
        <svg width={size * 1.6} height={size * 0.5} viewBox="0 0 80 25" style={{ ...base, width: size * 1.6, height: size * 0.5 }}>
          <path d="M 2 12 Q 12 2, 22 12 T 42 12 T 62 12 T 78 12" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return <span style={{ ...base, background: c, borderRadius: "62% 38% 47% 53% / 41% 56% 44% 59%" }} />;
  }
}
