import { useState } from "react";
import { THEME, F, lighten, shadeDarken } from "../../lib/theme.js";

const LEVELS = [
  { value: 1, emoji: "😩", label: "Rough" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

export default function EnergyPicker({ value, onChange, color, label }) {
  const c = color || THEME.primary;
  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {LEVELS.map(l => {
          const active = value === l.value;
          return (
            <button
              key={l.value}
              onClick={() => onChange?.(l.value)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "8px 6px",
                background: active ? lighten(c, 0.75) : THEME.bg,
                border: `1.5px solid ${active ? c : THEME.line}`,
                borderRadius: THEME.rMd,
                cursor: "pointer",
                boxShadow: active ? `0 3px 0 0 ${shadeDarken(c, 0.2)}` : "none",
                transform: active ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <span style={{ fontSize: 22 }}>{l.emoji}</span>
              <span style={{ fontSize: 10, fontFamily: F.display, fontWeight: 700, color: active ? shadeDarken(c, 0.4) : THEME.inkMuted }}>
                {l.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
