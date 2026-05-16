import { FONTS } from "../../lib/constants.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";

export default function CatPrepPage() {
  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="CAT Prep" icon="🎯" subtitle="Exam preparation tracking" />
      <div style={{ padding: "40px 24px", borderRadius: 16, background: "#1C0E00", border: "1px solid #B4530944", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontFamily: FONTS.syne, fontSize: 18, fontWeight: 700, color: "#FDE68A", marginBottom: 10 }}>Tracked in Google Sheets</div>
        <div style={{ color: "#4A5568", fontSize: 13, lineHeight: 1.6 }}>Use the Tracker tab to mark daily completion.</div>
      </div>
    </div>
  );
}
