import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { THEME, F } from "../../lib/theme.js";

export function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!open) return;
    const handleKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(43,30,24,0.4)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="pop-in"
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : maxWidth,
          maxHeight: isMobile ? "92vh" : "90vh",
          background: THEME.surface,
          border: `1.5px solid ${THEME.line}`,
          borderRadius: isMobile ? `${THEME.rXl}px ${THEME.rXl}px 0 0` : THEME.rXl,
          boxShadow: THEME.shadowLg,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {isMobile && (
          <div style={{
            width: 36, height: 4, borderRadius: 2, background: THEME.line,
            position: "absolute", left: "50%", transform: "translateX(-50%)", top: 10,
          }} />
        )}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "24px 20px 16px" : "18px 24px",
          borderBottom: `1px solid ${THEME.line}`,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, color: THEME.ink }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: THEME.bgAlt, border: `1.5px solid ${THEME.line}`,
              color: THEME.inkSoft, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}
          >✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
