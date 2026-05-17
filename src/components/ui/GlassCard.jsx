import { THEME } from "../../lib/constants.js";

export function GlassCard({ children, style, accentColor }) {
  return (
    <div style={{
      background: THEME.surface,
      border: `1px solid ${accentColor ? accentColor + "44" : THEME.line}`,
      borderRadius: THEME.rMd,
      boxShadow: THEME.shadowSm,
      ...style,
    }}>
      {children}
    </div>
  );
}
