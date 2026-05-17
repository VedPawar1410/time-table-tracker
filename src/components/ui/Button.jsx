import { FONTS, THEME } from "../../lib/constants.js";

export function Button({ children, onClick, variant = "primary", color, disabled, style, small }) {
  const base = {
    border: "none",
    borderRadius: THEME.rMd,
    cursor: "pointer",
    fontFamily: FONTS.nunito,
    fontWeight: 700,
    transition: "all 0.15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: small ? "7px 16px" : "10px 20px",
    fontSize: small ? 12.5 : 13.5,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...style,
  };

  if (variant === "primary") {
    const c = color || THEME.primary;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: c, color: THEME.ink, boxShadow: THEME.shadowChunk, border: "none" }}
      >
        {children}
      </button>
    );
  }

  if (variant === "soft") {
    const c = color || THEME.primary;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: c + "22", border: `1.5px solid ${c}44`, color: c }}
      >
        {children}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: "transparent", border: `1.5px solid ${THEME.line}`, color: THEME.inkSoft }}
      >
        {children}
      </button>
    );
  }

  if (variant === "danger") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: "#FFD6DF", border: "1.5px solid #F5BEC9", color: "#D6395B" }}
      >
        {children}
      </button>
    );
  }

  if (variant === "solid") {
    const c = color || THEME.primary;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: c, border: "none", color: THEME.ink, fontWeight: 700, boxShadow: THEME.shadowChunk }}
      >
        {children}
      </button>
    );
  }

  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}
