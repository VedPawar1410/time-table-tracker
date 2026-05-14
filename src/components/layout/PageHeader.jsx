import { useNavigate } from "react-router-dom";
import { FONTS } from "../../lib/constants.js";

export function PageHeader({ title, icon, subtitle, action, accentColor = "#4ADE80" }) {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          {icon && <div style={{ fontSize: 32, marginBottom: 8, lineHeight: 1 }}>{icon}</div>}
          <h1 style={{ fontFamily: FONTS.syne, fontSize: 28, fontWeight: 800, color: "#E2E8F0", lineHeight: 1.1, letterSpacing: -0.5 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: "#3D5068", fontSize: 13, marginTop: 6, lineHeight: 1.6, fontFamily: FONTS.sans }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>
        )}
      </div>
    </div>
  );
}
