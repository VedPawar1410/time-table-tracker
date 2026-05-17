import { FONTS, THEME, C } from "../../lib/constants.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";

export default function SideHustlePage() {
  const c = C.sidehustle;
  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans, background: THEME.bg, minHeight: "100vh" }}>
      <PageHeader title="Side Hustle" icon="💡" subtitle="Session tracking" />
      <div style={{ padding: "40px 24px", borderRadius: THEME.rLg, background: c.bg, border: `1px solid ${c.bd}`, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
        <div style={{ fontFamily: FONTS.nunito, fontSize: 18, fontWeight: 800, color: c.tx, marginBottom: 10 }}>Tracked in Google Sheets</div>
        <div style={{ color: THEME.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Use the Tracker tab to mark daily completion.</div>
      </div>
    </div>
  );
}
