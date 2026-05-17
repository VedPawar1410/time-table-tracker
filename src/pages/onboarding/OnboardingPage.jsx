import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEME, TASK_PALETTE, F, shadeDarken } from "../../lib/theme.js";
import { Button } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Sticker from "../../components/ui/Sticker.jsx";

const STEPS = [
  {
    kicker: "STEP 1 OF 4",
    title: "Plan your day the way you actually live it",
    body: "Lifeboard isn't a generic to-do app. It's built around your real routine — your office hours, your gym slot, your evening rotation, and your weekends.",
    bg: TASK_PALETTE.gym.bg,
    visual: <Sticker kind="blob" color={TASK_PALETTE.gym.bg} size={180} />,
  },
  {
    kicker: "STEP 2 OF 4",
    title: "Track 11 areas of your life, with depth",
    body: "Each task has its own home — gym tracks sets and PRs, diet logs macros, job prep tracks LeetCode problems, reading tracks pages. One app, no juggling.",
    bg: TASK_PALETTE.book.bg,
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {["gym","jobprep","book","catprep","videditing","sidehustle","hobbies","diet"].map(t => (
          <div key={t} style={{
            width: 54, height: 54, borderRadius: 16,
            background: TASK_PALETTE[t].bg, border: `2px solid ${TASK_PALETTE[t].edge}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>{TASK_PALETTE[t].emoji}</div>
        ))}
      </div>
    ),
  },
  {
    kicker: "STEP 3 OF 4",
    title: "Build streaks. See your year at a glance.",
    body: "Every check turns into a tile on your year heatmap. Watch your habits stack. Best streak always in view.",
    bg: TASK_PALETTE.catprep.bg,
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3 }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const palette = [TASK_PALETTE.gym.edge, TASK_PALETTE.catprep.edge, TASK_PALETTE.book.edge, TASK_PALETTE.diet.edge, TASK_PALETTE.hobbies.edge];
          const c = i % 4 === 0 ? THEME.line : palette[i % palette.length];
          return <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c }} />;
        })}
      </div>
    ),
  },
  {
    kicker: "STEP 4 OF 4",
    title: "You're all set",
    body: "Your master timetable is loaded. Today's tasks are waiting. Just check off what you've done — Lifeboard handles the rest.",
    bg: TASK_PALETTE.diet.bg,
    visual: (
      <div style={{ position: "relative" }}>
        <div style={{
          width: 110, height: 110, borderRadius: 32,
          background: THEME.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56, boxShadow: `0 8px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
        }}>🎉</div>
        <div style={{ position: "absolute", top: -14, right: -18 }}>
          <Sticker kind="sparkle" color="#FFD480" size={30} wiggle />
        </div>
        <div style={{ position: "absolute", bottom: -8, left: -22 }}>
          <Sticker kind="star" color={TASK_PALETTE.hobbies.fg} size={22} />
        </div>
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  const finish = () => {
    localStorage.setItem("onboardingSeen", "true");
    navigate("/");
  };

  return (
    <div style={{
      minHeight: "100vh", background: THEME.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <Card padding={0} style={{ width: "100%", maxWidth: 860, overflow: "hidden", borderRadius: THEME.rXl }}>
        <div style={{ display: "flex", flexDirection: "row", minHeight: 460 }}>
          {/* Left visual */}
          <div style={{
            width: "42%", background: s.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 40, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 18, left: 18 }}>
              <Sticker kind="dot" color="#FFFFFFAA" size={12} />
            </div>
            <div style={{ position: "absolute", bottom: 28, right: 28 }}>
              <Sticker kind="plus" color="#FFFFFFAA" size={16} />
            </div>
            <div className="pop-in" key={step}>
              {s.visual}
            </div>
          </div>

          {/* Right content */}
          <div style={{ flex: 1, padding: 44, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: THEME.primary, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                {s.kicker}
              </div>
              <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: THEME.ink, lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 16 }}>
                {s.title}
              </h2>
              <p style={{ color: THEME.inkSoft, fontSize: 15, lineHeight: 1.65 }}>{s.body}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === step ? THEME.primary : THEME.line,
                    transition: "all 0.3s",
                  }} />
                ))}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>← Back</Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button variant="primary" onClick={() => setStep(step + 1)}>Next →</Button>
                ) : (
                  <Button variant="primary" onClick={finish}>Open my dashboard →</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
