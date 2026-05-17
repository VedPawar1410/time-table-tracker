import { THEME } from "../../lib/constants";

const SHAPES = {
  blob: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <path d="M40 8 C55 8 72 18 72 35 C72 52 62 72 45 72 C28 72 8 60 8 44 C8 28 25 8 40 8Z" />
    </svg>
  ),
  blob2: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <path d="M38 6 C54 4 74 20 74 38 C74 56 56 76 38 74 C20 72 6 56 8 38 C10 20 22 8 38 6Z" />
    </svg>
  ),
  dot: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <circle cx="40" cy="40" r="32" />
    </svg>
  ),
  donut: (color) => (
    <svg viewBox="0 0 80 80" fill="none" stroke={color} strokeWidth="12">
      <circle cx="40" cy="40" r="26" />
    </svg>
  ),
  diamond: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <rect x="16" y="16" width="48" height="48" rx="8" transform="rotate(45 40 40)" />
    </svg>
  ),
  plus: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <rect x="32" y="6" width="16" height="68" rx="8" />
      <rect x="6" y="32" width="68" height="16" rx="8" />
    </svg>
  ),
  star: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <polygon points="40,6 49,30 74,30 54,46 62,72 40,56 18,72 26,46 6,30 31,30" />
    </svg>
  ),
  sparkle: (color) => (
    <svg viewBox="0 0 80 80" fill={color}>
      <path d="M40 4 L44 36 L76 40 L44 44 L40 76 L36 44 L4 40 L36 36Z" />
    </svg>
  ),
  squiggle: (color) => (
    <svg viewBox="0 0 80 80" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round">
      <path d="M8 40 Q20 20 32 40 Q44 60 56 40 Q68 20 72 40" />
    </svg>
  ),
};

export default function Sticker({ type = "blob", color, size = 40, wiggle = false, style }) {
  const c = color || THEME.primary;
  const shape = SHAPES[type] ? SHAPES[type](c) : SHAPES.blob(c);
  return (
    <span
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
        animation: wiggle ? "stk-wiggle 2s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      {shape}
    </span>
  );
}
