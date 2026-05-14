export function GlassCard({ children, style, accentColor }) {
  return (
    <div style={{
      background: "rgba(13,17,23,0.7)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${accentColor ? accentColor + "22" : "rgba(255,255,255,0.05)"}`,
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}
