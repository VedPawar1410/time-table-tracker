import { FONTS } from "../../lib/constants.js";

export function Button({ children, onClick, variant = "primary", color, disabled, style, small }) {
  const base = {
    border: "none", borderRadius: 10, cursor: "pointer", fontFamily: FONTS.sans,
    fontWeight: 500, transition: "all 0.15s", display: "inline-flex",
    alignItems: "center", justifyContent: "center", gap: 6,
    padding: small ? "7px 14px" : "10px 18px",
    fontSize: small ? 12 : 13.5,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...style,
  };

  if (variant === "primary") {
    const c = color || "#4ADE80";
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: c + "22", border: `1px solid ${c}55`, color: c }}>
        {children}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", border: "1px solid #1E293B", color: "#94A3B8" }}>
        {children}
      </button>
    );
  }

  if (variant === "danger") {
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: "#FCA5A522", border: "1px solid #FCA5A555", color: "#FCA5A5" }}>
        {children}
      </button>
    );
  }

  if (variant === "solid") {
    const c = color || "#4ADE80";
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: c, border: "none", color: "#08091A", fontWeight: 600 }}>
        {children}
      </button>
    );
  }

  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}
