import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/db.js";
import { THEME, TASK_PALETTE, F, shadeDarken } from "../lib/theme.js";
import Sticker from "../components/ui/Sticker.jsx";
import Card from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Both fields are required."); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/", { replace: true });
      } else {
        await signUp(email, password);
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: THEME.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Background stickers */}
      <div style={{ position: "absolute", top: "8%", left: "10%", transform: "rotate(-12deg)", pointerEvents: "none" }}>
        <Sticker kind="blob" color={TASK_PALETTE.gym.bg} size={120} />
      </div>
      <div style={{ position: "absolute", top: "18%", right: "12%", transform: "rotate(15deg)", pointerEvents: "none" }}>
        <Sticker kind="star" color={TASK_PALETTE.catprep.bg} size={90} wiggle />
      </div>
      <div style={{ position: "absolute", bottom: "12%", left: "16%", transform: "rotate(8deg)", pointerEvents: "none" }}>
        <Sticker kind="donut" color={TASK_PALETTE.book.bg} size={70} />
      </div>
      <div style={{ position: "absolute", bottom: "18%", right: "8%", transform: "rotate(-8deg)", pointerEvents: "none" }}>
        <Sticker kind="blob2" color={TASK_PALETTE.diet.bg} size={100} />
      </div>
      <div style={{ position: "absolute", top: "48%", left: "5%", transform: "rotate(20deg)", pointerEvents: "none" }}>
        <Sticker kind="sparkle" color={TASK_PALETTE.hobbies.fg} size={28} wiggle />
      </div>
      <div style={{ position: "absolute", top: "30%", right: "28%", transform: "rotate(-25deg)", pointerEvents: "none" }}>
        <Sticker kind="plus" color={TASK_PALETTE.jobprep.fg} size={20} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: THEME.primary,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 0 0 ${shadeDarken(THEME.primary, 0.3)}, 0 14px 30px -10px ${shadeDarken(THEME.primary, 0.4)}`,
            marginBottom: 16, position: "relative",
          }}>
            <span style={{ fontSize: 42 }}>⏰</span>
            <span style={{ position: "absolute", top: -10, right: -10 }}>
              <Sticker kind="sparkle" color="#FFD480" size={26} wiggle />
            </span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 36, fontWeight: 900, color: THEME.ink, lineHeight: 1, letterSpacing: -1, margin: 0 }}>
            Lifeboard
          </h1>
          <p style={{ color: THEME.inkMuted, fontSize: 14, marginTop: 8, fontWeight: 600 }}>
            Your personal productivity OS
          </p>
        </div>

        <Card padding={28} style={{ borderRadius: THEME.rXl }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex", padding: 4, marginBottom: 22,
            background: THEME.bg, borderRadius: 999, border: `1.5px solid ${THEME.line}`,
          }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                flex: 1, padding: "9px 14px", borderRadius: 999,
                background: mode === m ? THEME.surface : "transparent",
                color: mode === m ? THEME.ink : THEME.inkMuted,
                border: mode === m ? `1.5px solid ${THEME.line}` : "1.5px solid transparent",
                boxShadow: mode === m ? THEME.shadowSm : "none",
                fontFamily: F.display, fontSize: 13.5, fontWeight: 800, cursor: "pointer",
                transition: "all 0.15s",
              }}>{m === "login" ? "Sign in" : "Sign up"}</button>
            ))}
          </div>

          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Email" value={email} onChange={setEmail} type="email" icon="✉️" placeholder="you@example.com" />
            <Input label="Password" value={password} onChange={setPassword} type="password" icon="🔒" placeholder="••••••••" />

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: THEME.rMd,
                background: TASK_PALETTE.jobprep.bg, color: TASK_PALETTE.jobprep.deep,
                border: `1.5px solid ${TASK_PALETTE.jobprep.edge}`,
                fontSize: 12.5, fontWeight: 600,
              }}>⚠️ {error}</div>
            )}
            {success && (
              <div style={{
                padding: "10px 14px", borderRadius: THEME.rMd,
                background: TASK_PALETTE.diet.bg, color: TASK_PALETTE.diet.deep,
                border: `1.5px solid ${TASK_PALETTE.diet.edge}`,
                fontSize: 12.5, fontWeight: 600,
              }}>✓ {success}</div>
            )}

            <Button
              variant="primary" size="lg" fullWidth
              onClick={handle} disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? "..." : mode === "login" ? "Sign in →" : "Create account →"}
            </Button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: THEME.line }} />
            <span style={{ fontFamily: F.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: THEME.line }} />
          </div>

          <Button variant="outline" fullWidth icon="🔵">Continue with Google</Button>
        </Card>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              background: "transparent", border: "none", color: THEME.inkMuted,
              fontSize: 12.5, fontFamily: F.body, cursor: "pointer", fontWeight: 600,
            }}
          >
            New here? See how it works →
          </button>
        </div>
      </div>
    </div>
  );
}
