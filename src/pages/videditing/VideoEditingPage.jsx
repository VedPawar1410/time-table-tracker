import { THEME, TASK_PALETTE, F, lighten } from "../../lib/theme.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Sticker from "../../components/ui/Sticker.jsx";

const p = TASK_PALETTE.videditing;

export default function VideoEditingPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <PageHeader
        kicker="DEEP DIVE · VIDEO EDITING"
        title="Video Editing"
        subtitle="Projects, edits & creative work"
      />
      <Card padding={40} style={{ textAlign: "center", position: "relative", overflow: "hidden", background: lighten(p.fg, 0.9), border: `1.5px solid ${lighten(p.fg, 0.72)}` }}>
        <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.25, pointerEvents: "none" }}>
          <Sticker kind="blob" color={p.fg} size={140} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: p.deep, marginBottom: 10 }}>
            Tracked in Google Sheets
          </div>
          <div style={{ color: THEME.inkSoft, fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: "0 auto", marginBottom: 20 }}>
            Video editing sessions, project notes, and progress are tracked in an external Google Sheet. Use the Daily Tracker to mark your daily completion.
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: lighten(p.fg, 0.82), border: `1.5px solid ${lighten(p.fg, 0.65)}` }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: p.fg }}>📊 Daily Tracker →</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
