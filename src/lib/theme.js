// Design tokens for Lifeboard — Marshmallow theme
// Single source of truth for colors, fonts, shadows, radii

export const THEME = {
  bg:          "#FBF5EC",
  bgAlt:       "#F4EBDA",
  surface:     "#FFFFFF",
  surfaceAlt:  "#FFF9F0",
  line:        "#EDE0CB",
  lineStrong:  "#E2D2B5",
  ink:         "#2B1E18",
  inkSoft:     "#5C4B40",
  inkMuted:    "#8E7B6E",
  inkFaint:    "#B8A795",
  primary:     "#FF9F7A",
  primaryInk:  "#7A2E0E",
  primarySoft: "#FFE0D2",
  shadowSm:    "0 2px 0 0 #E5D3B7",
  shadowMd:    "0 8px 24px -8px rgba(122,46,14,0.18), 0 2px 0 0 #E5D3B7",
  shadowLg:    "0 24px 48px -16px rgba(122,46,14,0.22), 0 4px 0 0 #E5D3B7",
  shadowChunk: "0 6px 0 -1px #E5D3B7, 0 14px 30px -10px rgba(122,46,14,0.2)",
  rSm:  12,
  rMd:  18,
  rLg:  24,
  rXl:  32,
  rPill: 999,
};

export const TASK_PALETTE = {
  gym:        { fg: "#E8623A", bg: "#FFDDD0", edge: "#FFB89C", deep: "#B0421F", emoji: "💪", label: "Gym & Cardio" },
  jobprep:    { fg: "#D6395B", bg: "#FFD6DF", edge: "#FFA9BC", deep: "#94203D", emoji: "🔥", label: "Job Prep" },
  book:       { fg: "#5A7CC4", bg: "#D9E4FB", edge: "#B0C2EF", deep: "#36528C", emoji: "📘", label: "Reading" },
  catprep:    { fg: "#D69B1F", bg: "#FFEDC2", edge: "#FFD480", deep: "#8F6210", emoji: "🎯", label: "CAT Prep" },
  videditing: { fg: "#3FA0CF", bg: "#CFEAF8", edge: "#9CD2EE", deep: "#1F6E96", emoji: "🎬", label: "Video Editing" },
  sidehustle: { fg: "#E58A2D", bg: "#FFE3C2", edge: "#FFC480", deep: "#9C5410", emoji: "💡", label: "Side Hustle" },
  hobbies:    { fg: "#8C6BD9", bg: "#E6DCFF", edge: "#C3AFFF", deep: "#553D9C", emoji: "🎨", label: "Hobbies" },
  sleep:      { fg: "#6B73C9", bg: "#DCDFFA", edge: "#B0B5EE", deep: "#3D438C", emoji: "😴", label: "Sleep" },
  office:     { fg: "#4FA070", bg: "#D2EEDB", edge: "#9ED5B0", deep: "#226740", emoji: "🏢", label: "Office" },
  decompress: { fg: "#3FAA94", bg: "#CCEDE5", edge: "#94D9C8", deep: "#1B7A65", emoji: "🌿", label: "Decompress" },
  diet:       { fg: "#6BAD3A", bg: "#DCEFC8", edge: "#B4DC8C", deep: "#3F721C", emoji: "🥗", label: "Diet" },
  routine:    { fg: "#8E7B6E", bg: "#EFE6D8", edge: "#D6C6B0", deep: "#5C4B40", emoji: "✨", label: "Routine" },
  meal:       { fg: "#C97FA0", bg: "#FBD9E6", edge: "#F2B0CB", deep: "#7E3A5A", emoji: "🍽️", label: "Meal" },
  commute:    { fg: "#9E8F7A", bg: "#EBE2D2", edge: "#CFC0A8", deep: "#5C4F3A", emoji: "🚌", label: "Commute" },
  buffer:     { fg: "#C29A4A", bg: "#FFEEC9", edge: "#F2D480", deep: "#8C6515", emoji: "🌅", label: "Buffer" },
  ps5:        { fg: "#7E5BC4", bg: "#E0D2FB", edge: "#BFA5EF", deep: "#4A2B8C", emoji: "🎮", label: "PS5" },
  personal:   { fg: "#D4538F", bg: "#FBD2E2", edge: "#F2A5C5", deep: "#902A5C", emoji: "💗", label: "Personal" },
};

export const F = {
  display: "'Nunito', system-ui, sans-serif",
  body:    "'DM Sans', system-ui, sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
};

// Lerp hex color towards white (amount 0–1)
export function lighten(hex, amount) {
  if (!hex || hex[0] !== "#") return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

// Multiply hex color towards black (amount 0–1)
export function shadeDarken(hex, amount) {
  if (!hex || hex[0] !== "#") return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - amount))},${Math.round(g * (1 - amount))},${Math.round(b * (1 - amount))})`;
}
