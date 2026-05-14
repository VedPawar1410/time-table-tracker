export const TRACKED_TASKS = [
  { id: "gym",        label: "Gym / Cardio",      icon: "💪", bd: "#B45309", tx: "#FCD34D", bg: "#1C1200" },
  { id: "jobprep",    label: "Job Prep",           icon: "🔥", bd: "#B91C1C", tx: "#FCA5A5", bg: "#2D0000" },
  { id: "book",       label: "Book Reading",       icon: "📘", bd: "#1D4ED8", tx: "#93C5FD", bg: "#0A1628" },
  { id: "catprep",    label: "CAT Prep",           icon: "🎯", bd: "#B45309", tx: "#FDE68A", bg: "#1C0E00" },
  { id: "videditing", label: "Video Editing",      icon: "🎬", bd: "#0369A1", tx: "#7DD3FC", bg: "#031525" },
  { id: "sidehustle", label: "Side Hustle",        icon: "💡", bd: "#D97706", tx: "#FEF08A", bg: "#1A1000" },
  { id: "hobbies",    label: "Hobbies & Projects", icon: "🎨", bd: "#7C3AED", tx: "#DDD6FE", bg: "#0D0520" },
  { id: "sleep",      label: "Sleep by 12 AM",     icon: "😴", bd: "#1E3A8A", tx: "#818CF8", bg: "#0D1533" },
  { id: "office",     label: "Office",             icon: "🏢", bd: "#166534", tx: "#4ADE80", bg: "#052E16" },
  { id: "decompress", label: "Decompress",         icon: "🌿", bd: "#115E59", tx: "#5EEAD4", bg: "#022c22" },
];

export const TASK_MAP = Object.fromEntries(TRACKED_TASKS.map(t => [t.id, t]));

export const C = {
  routine:    { bg: "#111827", bd: "#374151", tx: "#9CA3AF" },
  gym:        { bg: "#1C1200", bd: "#B45309", tx: "#FCD34D" },
  office:     { bg: "#052E16", bd: "#166534", tx: "#4ADE80" },
  meal:       { bg: "#0F172A", bd: "#334155", tx: "#94A3B8" },
  commute:    { bg: "#111827", bd: "#2D3748", tx: "#6B7280" },
  buffer:     { bg: "#022c22", bd: "#115E59", tx: "#5EEAD4" },
  decompress: { bg: "#052E16", bd: "#15803D", tx: "#86EFAC" },
  jobprep:    { bg: "#2D0000", bd: "#B91C1C", tx: "#FCA5A5" },
  catprep:    { bg: "#1C0E00", bd: "#B45309", tx: "#FDE68A" },
  book:       { bg: "#0A1628", bd: "#1D4ED8", tx: "#93C5FD" },
  ps5:        { bg: "#12052E", bd: "#7C3AED", tx: "#C4B5FD" },
  personal:   { bg: "#1A0520", bd: "#BE185D", tx: "#F9A8D4" },
  videditing: { bg: "#031525", bd: "#0369A1", tx: "#7DD3FC" },
  sidehustle: { bg: "#1A1000", bd: "#D97706", tx: "#FEF08A" },
  hobbies:    { bg: "#0D0520", bd: "#7C3AED", tx: "#DDD6FE" },
  sleep:      { bg: "#0D1533", bd: "#1E3A8A", tx: "#818CF8" },
};

export const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  button { cursor: pointer; }
  button:hover { opacity: 0.85; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

export const FONTS = {
  syne: "'Syne', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  sans: "'DM Sans', sans-serif",
};

export const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes", "Core", "Cardio", "Full Body"
];

export const DEFAULT_EXERCISES = {
  Chest: ["Bench Press", "Incline Bench", "Decline Bench", "Cable Fly", "Dumbbell Fly", "Push Up"],
  Back: ["Deadlift", "Pull Up", "Barbell Row", "Cable Row", "Lat Pulldown", "Face Pull"],
  Shoulders: ["Overhead Press", "Lateral Raise", "Front Raise", "Arnold Press", "Shrugs"],
  Biceps: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl"],
  Triceps: ["Skull Crusher", "Tricep Pushdown", "Overhead Tricep", "Close Grip Bench", "Dips"],
  Legs: ["Squat", "Romanian Deadlift", "Leg Press", "Lunges", "Leg Curl", "Leg Extension", "Calf Raise"],
  Glutes: ["Hip Thrust", "Glute Bridge", "Sumo Squat", "Bulgarian Split Squat"],
  Core: ["Plank", "Crunches", "Russian Twist", "Hanging Leg Raise", "Ab Wheel"],
  Cardio: ["Running", "Cycling", "Jump Rope", "HIIT", "Stairmaster", "Elliptical"],
  "Full Body": ["Clean and Press", "Kettlebell Swing", "Burpees", "Thrusters"],
};
