import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/db.js";
import { FONTS, FONT_IMPORT } from "../lib/constants.js";

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
    width: "100%", background: "#0D1117", border: "1px solid #1E293B", borderRadius: 10,
    padding: "12px 16px", color: "#E2E8F0", fontSize: 14, fontFamily: FONTS.sans,
    outline: "none",
  };

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div style={{
        minHeight: "100vh", background: "#08091A", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: FONTS.sans,
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
            <h1 style={{ fontFamily: FONTS.syne, fontSize: 28, fontWeight: 800, color: "#E2E8F0", marginBottom: 6 }}>
              Life Board
            </h1>
            <p style={{ color: "#3D5068", fontSize: 13, lineHeight: 1.6 }}>
              Your personal productivity OS
            </p>
          </div>

          {/* Card */}
          <div style={{ background: "rgba(13,17,23,0.8)", border: "1px solid #1E293B", borderRadius: 20, padding: 28, backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#08091A", borderRadius: 10, padding: 4 }}>
              {["login", "signup"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: mode === m ? "#1E293B" : "transparent",
                  color: mode === m ? "#E2E8F0" : "#4A5568",
                  fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                }}>
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com"
                  onFocus={e => e.target.style.borderColor = "#334155"} onBlur={e => e.target.style.borderColor = "#1E293B"} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = "#334155"} onBlur={e => e.target.style.borderColor = "#1E293B"} />
              </div>

              {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#2D000022", border: "1px solid #B91C1C44", color: "#FCA5A5", fontSize: 12 }}>{error}</div>}
              {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#05201622", border: "1px solid #16653444", color: "#4ADE80", fontSize: 12 }}>{success}</div>}

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 10,
                background: "#4ADE80", border: "none", color: "#08091A",
                fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}>
                {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
