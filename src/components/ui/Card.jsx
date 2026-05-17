import { THEME } from "../../lib/theme.js";

export default function Card({ children, style = {}, padding = 20, tinted = false, hover = false, onClick, chunky = true }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: tinted ? THEME.surfaceAlt : THEME.surface,
        border: `1.5px solid ${THEME.line}`,
        borderRadius: THEME.rLg,
        padding,
        boxShadow: chunky ? THEME.shadowChunk : THEME.shadowSm,
        transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={hover ? e => { e.currentTarget.style.transform = "translateY(-3px)"; } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.transform = "translateY(0)"; } : undefined}
    >
      {children}
    </div>
  );
}
