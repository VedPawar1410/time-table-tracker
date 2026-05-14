import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { FONTS } from "../../lib/constants.js";

export function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
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
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : maxWidth,
          maxHeight: isMobile ? "92vh" : "90vh",
          background: "#0D1117",
          border: "1px solid #1E293B",
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1E293B", flexShrink: 0 }}>
          {isMobile && (
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#1E293B", position: "absolute", left: "50%", transform: "translateX(-50%)", top: 8 }} />
          )}
          <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 16, color: "#E2E8F0" }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
