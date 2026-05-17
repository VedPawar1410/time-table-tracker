import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/db.js";
import { FONTS, FONT_IMPORT, THEME } from "../lib/constants.js";
import Sticker from "../components/ui/Sticker.jsx";

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

  const inputStyle = {
    width: "100%",
    background: THEME.surface,
    border: `1.5px solid ${THEME.line}`,
    borderRadius: THEME.rSm,
    padding: "12px 16px",
    color: THEME.ink,
    fontSize: 14,
    fontFamily: FONTS.sans,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div style={{
        minHeight: "100vh",
        background: THEME.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: FONTS.sans,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative stickers */}
        <Sticker type="blob" color={THEME.primary} size={120} style={{ position: "absolute", top: -30, right: -20, opacity: 0.18 }} />
        <Sticker type="blob2" color="#D69B1F" size={90} style={{ position: "absolute", bottom: 40, left: -20, opacity: 0.15 }} />
        <Sticker type="plus" color="#8C6BD9" size={36} style={{ position: "absolute", top: 80, left: 60, opacity: 0.2 }} wiggle />
        <Sticker type="dot" color="#3FAA94" size={22} style={{ position: "absolute", bottom: 120, right: 80, opacity: 0.25 }} />

        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }}>⏰</div>
            <h1 style={{ fontFamily: FONTS.nunito, fontSize: 30, fontWeight: 900, color: THEME.ink, marginBottom: 6, letterSpacing: -0.5 }}>
              Life Board
            </h1>
            <p style={{ color: THEME.inkSoft, fontSize: 13.5, lineHeight: 1.6 }}>
              Your personal productivity OS
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: THEME.surface,
            border: `1px solid ${THEME.line}`,
            borderRadius: THEME.rLg,
            padding: 28,
            boxShadow: THEME.shadowMd,
          }}>
            {/* Mode switcher */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 24,
              background: THEME.surfaceAlt,
              borderRadius: THEME.rSm, padding: 4,
              border: `1px solid ${THEME.line}`,
            }}>
              {["login", "signup"].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: mode === m ? THEME.surface : "transparent",
                    color: mode === m ? THEME.ink : THEME.inkMuted,
                    fontFamily: FONTS.nunito, fontSize: 13.5, fontWeight: mode === m ? 700 : 500,
                    boxShadow: mode === m ? THEME.shadowSm : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{
                  display: "block", fontSize: 9.5, color: THEME.inkMuted,
                  fontFamily: FONTS.mono, textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 6,
                }}>
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required style={inputStyle} placeholder="you@example.com"
                  onFocus={e => e.target.style.borderColor = THEME.lineStrong}
                  onBlur={e => e.target.style.borderColor = THEME.line}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: 9.5, color: THEME.inkMuted,
                  fontFamily: FONTS.mono, textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 6,
                }}>
                  Password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required style={inputStyle} placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = THEME.lineStrong}
                  onBlur={e => e.target.style.borderColor = THEME.line}
                />
              </div>

              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: THEME.rSm,
                  background: "#FFD6DF", border: "1px solid #F5BEC9",
                  color: "#D6395B", fontSize: 12,
                }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  padding: "10px 14px", borderRadius: THEME.rSm,
                  background: "#DCEFC8", border: "1px solid #CADBB5",
                  color: "#4FA070", fontSize: 12,
                }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "13px", borderRadius: THEME.rMd,
                  background: THEME.primary, border: "none", color: THEME.ink,
                  fontFamily: FONTS.nunito, fontSize: 15, fontWeight: 800,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1, marginTop: 4,
                  boxShadow: THEME.shadowChunk,
                  transition: "opacity 0.15s",
                }}
              >
                {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
