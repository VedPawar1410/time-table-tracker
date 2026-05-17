import { THEME, F, lighten, shadeDarken } from "../../lib/theme.js";

export function Button({ children, onClick, variant = "primary", color, size = "md", style = {}, disabled, icon, fullWidth }) {
  const sizes = {
    sm: { padX: 14, padY: 8,  fs: 12.5, r: 12 },
    md: { padX: 20, padY: 11, fs: 14,   r: 16 },
    lg: { padX: 28, padY: 14, fs: 15,   r: 20 },
  };
  const s = sizes[size] || sizes.md;
  const c = color || THEME.primary;

  let bg, ink, border, shadow;
  if (variant === "primary") {
    bg = c; ink = "#FFFFFF"; border = c;
    shadow = `0 4px 0 0 ${shadeDarken(c, 0.25)}, 0 8px 18px -4px ${shadeDarken(c, 0.4)}44`;
  } else if (variant === "soft") {
    bg = lighten(c, 0.78); ink = shadeDarken(c, 0.4); border = lighten(c, 0.55); shadow = "none";
  } else if (variant === "ghost") {
    bg = "transparent"; ink = THEME.inkSoft; border = "transparent"; shadow = "none";
  } else if (variant === "outline") {
    bg = THEME.surface; ink = THEME.ink; border = THEME.lineStrong; shadow = THEME.shadowSm;
  } else if (variant === "danger") {
    bg = "#FFD6DF"; ink = "#D6395B"; border = "#F5BEC9"; shadow = "none";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: `${s.padY}px ${s.padX}px`,
        background: bg, color: ink, border: `1.5px solid ${border}`,
        borderRadius: s.r, fontSize: s.fs, fontWeight: 700, fontFamily: F.display,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: shadow,
        transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s",
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      onMouseDown={variant === "primary" ? e => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = `0 2px 0 0 ${shadeDarken(c, 0.25)}`;
      } : undefined}
      onMouseUp={variant === "primary" ? e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = shadow;
      } : undefined}
      onMouseLeave={variant === "primary" ? e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = shadow;
      } : undefined}
    >
      {icon && <span style={{ fontSize: s.fs + 2 }}>{icon}</span>}
      {children}
    </button>
  );
}
