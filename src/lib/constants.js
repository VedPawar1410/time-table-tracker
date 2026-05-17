// ─── Design tokens (re-exported from theme.js) ────────────────────────────────
export { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "./theme.js";

// ─── Task definitions ─────────────────────────────────────────────────────────
// bd = edge/border color, tx = foreground accent, bg = pastel background
export const TRACKED_TASKS = [
  { id: "gym",        label: "Gym / Cardio",      icon: "💪", bd: "#F5C4B5", tx: "#E8623A", bg: "#FFDDD0" },
  { id: "jobprep",    label: "Job Prep",           icon: "🔥", bd: "#F5BEC9", tx: "#D6395B", bg: "#FFD6DF" },
  { id: "book",       label: "Book Reading",       icon: "📘", bd: "#C2D0F0", tx: "#5A7CC4", bg: "#D9E4FB" },
  { id: "catprep",    label: "CAT Prep",           icon: "🎯", bd: "#F0DAAB", tx: "#D69B1F", bg: "#FFEDC2" },
  { id: "videditing", label: "Video Editing",      icon: "🎬", bd: "#B8DAF0", tx: "#3FA0CF", bg: "#CFEAF8" },
  { id: "sidehustle", label: "Side Hustle",        icon: "💡", bd: "#F0CFA8", tx: "#E58A2D", bg: "#FFE3C2" },
  { id: "hobbies",    label: "Hobbies & Projects", icon: "🎨", bd: "#D4C8F5", tx: "#8C6BD9", bg: "#E6DCFF" },
  { id: "sleep",      label: "Sleep by 12 AM",     icon: "😴", bd: "#C8CCEE", tx: "#6B73C9", bg: "#DCDFFA" },
  { id: "office",     label: "Office",             icon: "🏢", bd: "#BCDFC8", tx: "#4FA070", bg: "#D2EEDB" },
  { id: "decompress", label: "Decompress",         icon: "🌿", bd: "#B8E0D8", tx: "#3FAA94", bg: "#CCEDE5" },
  { id: "diet",       label: "Diet Tracking",      icon: "🥗", bd: "#CADBB5", tx: "#6BAD3A", bg: "#DCEFC8" },
];

export const TASK_MAP = Object.fromEntries(TRACKED_TASKS.map(t => [t.id, t]));

export const C = {
  routine:    { bg: "#EFE6D8", bd: "#E0D4C0", tx: "#8E7B6E" },
  gym:        { bg: "#FFDDD0", bd: "#F5C4B5", tx: "#E8623A" },
  office:     { bg: "#D2EEDB", bd: "#BCDFC8", tx: "#4FA070" },
  meal:       { bg: "#FBD9E6", bd: "#F0BED5", tx: "#C97FA0" },
  commute:    { bg: "#EBE2D2", bd: "#DDD0BE", tx: "#9E8F7A" },
  buffer:     { bg: "#FFEEC9", bd: "#F0DAAB", tx: "#C29A4A" },
  decompress: { bg: "#CCEDE5", bd: "#B8E0D8", tx: "#3FAA94" },
  jobprep:    { bg: "#FFD6DF", bd: "#F5BEC9", tx: "#D6395B" },
  catprep:    { bg: "#FFEDC2", bd: "#F0DAAB", tx: "#D69B1F" },
  book:       { bg: "#D9E4FB", bd: "#C2D0F0", tx: "#5A7CC4" },
  ps5:        { bg: "#E0D2FB", bd: "#C8B8F5", tx: "#7E5BC4" },
  personal:   { bg: "#FBD2E2", bd: "#F0BED5", tx: "#D4538F" },
  videditing: { bg: "#CFEAF8", bd: "#B8DAF0", tx: "#3FA0CF" },
  sidehustle: { bg: "#FFE3C2", bd: "#F0CFA8", tx: "#E58A2D" },
  hobbies:    { bg: "#E6DCFF", bd: "#D4C8F5", tx: "#8C6BD9" },
  sleep:      { bg: "#DCDFFA", bd: "#C8CCEE", tx: "#6B73C9" },
  diet:       { bg: "#DCEFC8", bd: "#CADBB5", tx: "#6BAD3A" },
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
  nunito: "'Nunito', sans-serif",
  syne:   "'Nunito', sans-serif", // alias — existing code using FONTS.syne still works
  mono:   "'JetBrains Mono', monospace",
  sans:   "'DM Sans', sans-serif",
};

export const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #FBF5EC; }
  button { cursor: pointer; }
  button:hover { opacity: 0.9; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #DDD0BE; border-radius: 4px; }
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
  @keyframes pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.22); }
    70%  { transform: scale(0.92); }
    100% { transform: scale(1); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  @keyframes stk-wiggle {
    0%, 100% { transform: rotate(-4deg); }
    50%      { transform: rotate(4deg); }
  }
  @keyframes toast-in {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes slide-up {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
`;

// ─── Gym data ─────────────────────────────────────────────────────────────────
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

// ─── Diet ─────────────────────────────────────────────────────────────────────
export const DIET_MEAL_DEFS = [
  { type: "breakfast", label: "Breakfast", icon: "🌅", defaultTime: "08:00", sortOrder: 0 },
  { type: "lunch",     label: "Lunch",     icon: "☀️",  defaultTime: "13:00", sortOrder: 10 },
  { type: "dinner",    label: "Dinner",    icon: "🌙",  defaultTime: "19:00", sortOrder: 20 },
];

// ─── Measurements ─────────────────────────────────────────────────────────────
export const MEASUREMENT_METRICS = {
  CORE: ["Weight", "Body Fat %", "Caloric Intake"],
  BODY_PART: [
    "Neck", "Shoulders", "Chest",
    "Left Bicep", "Right Bicep", "Left Forearm", "Right Forearm",
    "Upper Abs", "Waist", "Lower Abs", "Hips",
    "Left Thigh", "Right Thigh", "Left Calf", "Right Calf",
  ],
};

export const METRIC_UNITS = {
  "Weight": "kg",
  "Body Fat %": "%",
  "Caloric Intake": "kcal",
};

// ─── Schedule ─────────────────────────────────────────────────────────────────
export const DAY_SCHEDULE = {
  0: ["gym","jobprep","catprep","videditing","sidehustle","hobbies","book","diet","sleep","decompress"], // Sun
  1: ["gym","jobprep","book","catprep","videditing","office","decompress","diet","sleep"],               // Mon
  2: ["gym","jobprep","book","office","decompress","diet","sleep"],                                      // Tue
  3: ["gym","jobprep","book","catprep","sidehustle","office","decompress","diet","sleep"],               // Wed
  4: ["gym","jobprep","book","office","decompress","diet","sleep"],                                      // Thu
  5: ["gym","jobprep","book","hobbies","sidehustle","office","decompress","diet","sleep"],               // Fri
  6: ["gym","jobprep","catprep","videditing","sidehustle","hobbies","book","diet","sleep","decompress"], // Sat
};
