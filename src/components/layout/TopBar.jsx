import { useNavigate } from "react-router-dom";
import { THEME, F, shadeDarken } from "../../lib/theme.js";
import Sticker from "../ui/Sticker.jsx";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatTodayLong() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function TopBar({ mobile }) {
  const navigate = useNavigate();
  const todayLong = formatTodayLong();

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: mobile ? "16px 18px 8px" : "18px 32px",
      gap: 16, flexShrink: 0,
    }}>
      {mobile ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: THEME.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 2px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
          }}>
            <span style={{ fontSize: 18 }}>⏰</span>
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 900, color: THEME.ink, lineHeight: 1 }}>Lifeboard</div>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: THEME.inkMuted, marginTop: 2, letterSpacing: 1 }}>personal os</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            padding: "7px 14px", borderRadius: 999,
            background: THEME.surface, border: `1.5px solid ${THEME.line}`,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: THEME.shadowSm,
          }}>
            <Sticker kind="dot" color="#6BAD3A" size={8} />
            <span style={{ fontFamily: F.mono, fontSize: 12, color: THEME.inkSoft, fontWeight: 600 }}>{todayLong}</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => navigate("/tracker")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 999,
            background: THEME.primary, color: "#fff",
            border: "none", fontFamily: F.display, fontWeight: 800, fontSize: 13,
            cursor: "pointer", boxShadow: `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = `0 1px 0 0 ${shadeDarken(THEME.primary, 0.3)}`; }}
          onMouseUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}`; }}
        >
          <span>＋</span> Quick log
        </button>
        <button
          onClick={() => navigate("/settings")}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: THEME.surface, border: `1.5px solid ${THEME.line}`,
            color: THEME.inkSoft, fontSize: 16, cursor: "pointer",
            boxShadow: THEME.shadowSm,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >🔔</button>
      </div>
    </div>
  );
}
