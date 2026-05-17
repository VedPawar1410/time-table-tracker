import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { THEME, TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TRACKED_TASKS } from "../../lib/constants.js";
import Card from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import Toggle from "../../components/ui/Toggle.jsx";
import Sticker from "../../components/ui/Sticker.jsx";

const SECTIONS = [
  { id: "profile",       label: "Profile",           emoji: "👤" },
  { id: "tasks",         label: "Tasks & Schedule",  emoji: "✅" },
  { id: "notifications", label: "Notifications",     emoji: "🔔" },
  { id: "data",          label: "Data & Privacy",    emoji: "🔒" },
  { id: "billing",       label: "Billing",           emoji: "💳" },
  { id: "about",         label: "About",             emoji: "ℹ️" },
];

const NOTIFS = [
  { id: "checkin",   label: "Daily check-in reminder",  sub: "10:00 PM" },
  { id: "jobprep",   label: "Job Prep nudge",           sub: "9:20 PM" },
  { id: "bedtime",   label: "Bedtime reminder",         sub: "11:45 PM" },
  { id: "weekly",    label: "Weekly summary",           sub: "Sunday 9 AM" },
  { id: "streak",    label: "Streak break warning",     sub: "When about to break" },
  { id: "goals",     label: "Goal nudges",              sub: "Throughout the day" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("profile");

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const email = user?.email || "";
  const initial = name[0]?.toUpperCase() || "V";

  const [notifState, setNotifState] = useState(() =>
    Object.fromEntries(NOTIFS.map(n => [n.id, true]))
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        kicker="SETTINGS"
        title="Settings"
        subtitle="Manage your account, tasks, and preferences"
      />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, position: "sticky", top: 24 }}>
          <Card padding={12} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: THEME.rMd,
                  background: section === s.id ? lighten(THEME.primary, 0.78) : "transparent",
                  border: `1.5px solid ${section === s.id ? lighten(THEME.primary, 0.55) : "transparent"}`,
                  color: section === s.id ? shadeDarken(THEME.primary, 0.4) : THEME.inkSoft,
                  fontFamily: F.display, fontSize: 13.5, fontWeight: section === s.id ? 800 : 600,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {section === "profile" && (
            <Card padding={28}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 24 }}>
                Your Profile
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: THEME.primary, color: "#fff",
                  fontFamily: F.display, fontWeight: 900, fontSize: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
                  position: "relative", flexShrink: 0,
                }}>
                  {initial}
                  <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                    <Sticker kind="sparkle" color="#FFD480" size={20} />
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink }}>{name || "Your Name"}</div>
                  <div style={{ fontSize: 13, color: THEME.inkMuted, marginTop: 2 }}>{email}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { label: "Full Name", value: name, placeholder: "Your name" },
                  { label: "City", value: "Hyderabad", placeholder: "Your city" },
                  { label: "Email", value: email, placeholder: "your@email.com" },
                  { label: "Age", value: "22", placeholder: "Your age" },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 11, fontFamily: F.display, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      {f.label}
                    </div>
                    <input
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", padding: "10px 14px",
                        background: THEME.surface, border: `1.5px solid ${THEME.line}`,
                        borderRadius: THEME.rMd, fontSize: 14, fontFamily: F.body,
                        color: THEME.ink, outline: "none",
                      }}
                      onFocus={e => e.target.style.borderColor = THEME.lineStrong}
                      onBlur={e => e.target.style.borderColor = THEME.line}
                    />
                  </div>
                ))}
              </div>
              <Button variant="primary" size="md">Save changes</Button>
            </Card>
          )}

          {section === "tasks" && (
            <Card padding={28}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 24 }}>
                Tasks & Schedule
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {TRACKED_TASKS.map(task => {
                  const p = TASK_PALETTE[task.id];
                  return (
                    <div key={task.id} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                      background: p?.bg || THEME.bg, border: `1.5px solid ${p?.edge || THEME.line}`,
                      borderRadius: THEME.rMd,
                    }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{p?.emoji || "✨"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: p?.deep || THEME.ink }}>
                          {p?.label || task.label}
                        </div>
                      </div>
                      <Toggle checked={true} onChange={() => {}} color={p?.fg} />
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => navigate("/tasks")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                  background: "transparent", border: `1.5px dashed ${THEME.line}`,
                  color: THEME.inkSoft, fontFamily: F.display, fontWeight: 700, fontSize: 13.5,
                  borderRadius: THEME.rMd, cursor: "pointer", width: "100%",
                }}
              >
                <span style={{ fontSize: 16 }}>＋</span> Add custom task
              </button>
            </Card>
          )}

          {section === "notifications" && (
            <Card padding={28}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 24 }}>
                Notifications
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {NOTIFS.map((n, i) => (
                  <div key={n.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 0",
                    borderBottom: i < NOTIFS.length - 1 ? `1px solid ${THEME.line}` : "none",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 14, color: THEME.ink }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: THEME.inkMuted, marginTop: 2 }}>{n.sub}</div>
                    </div>
                    <Toggle
                      checked={notifState[n.id]}
                      onChange={v => setNotifState(s => ({ ...s, [n.id]: v }))}
                      color={THEME.primary}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === "data" && (
            <Card padding={28}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 20, color: THEME.ink, marginBottom: 24 }}>
                Data & Privacy
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {["Export as CSV", "Export as JSON", "Export as PDF"].map(label => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: THEME.bg, border: `1.5px solid ${THEME.line}`,
                    borderRadius: THEME.rMd,
                  }}>
                    <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 14, color: THEME.ink }}>
                      📁 {label}
                    </span>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px", background: "#FFD6DF", border: "1.5px solid #F5BEC9", borderRadius: THEME.rMd }}>
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: "#D6395B", marginBottom: 8 }}>
                  ⚠️ Danger Zone
                </div>
                <p style={{ fontSize: 12.5, color: "#94203D", marginBottom: 14 }}>
                  This will permanently delete all your data. This action cannot be undone.
                </p>
                <Button variant="danger" size="sm">Delete all my data</Button>
              </div>
            </Card>
          )}

          {section === "billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card padding={24} style={{ background: lighten(THEME.primary, 0.88), border: `1.5px solid ${lighten(THEME.primary, 0.6)}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -16, right: -16, opacity: 0.3, pointerEvents: "none" }}>
                  <Sticker kind="blob" color={THEME.primary} size={120} />
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 22, color: THEME.ink }}>Pro Plan</div>
                    <Sticker kind="sparkle" color={THEME.primary} size={24} wiggle />
                  </div>
                  <div style={{ fontSize: 13, color: THEME.inkSoft, marginBottom: 16 }}>All features unlocked · Unlimited history · Priority support</div>
                  <Button variant="primary" size="md">Upgrade to Pro →</Button>
                </div>
              </Card>

              <Card padding={24}>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 18, color: THEME.ink, marginBottom: 16 }}>Plans</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { name: "Free", price: "₹0", features: ["7-day history", "Basic tracker", "Timetable"] },
                    { name: "Pro", price: "₹299/mo", features: ["Unlimited history", "All deep pages", "Analytics", "Export"] },
                    { name: "Pro+", price: "₹499/mo", features: ["Everything in Pro", "AI insights", "Priority support", "Custom tasks"] },
                  ].map(plan => (
                    <div key={plan.name} style={{
                      padding: 16, borderRadius: THEME.rMd, border: `1.5px solid ${THEME.line}`,
                      background: THEME.bg,
                    }}>
                      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 16, color: THEME.ink, marginBottom: 4 }}>{plan.name}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 14, color: THEME.primary, fontWeight: 700, marginBottom: 12 }}>{plan.price}</div>
                      {plan.features.map(f => (
                        <div key={f} style={{ fontSize: 12, color: THEME.inkSoft, marginBottom: 4, display: "flex", gap: 6 }}>
                          <span style={{ color: "#6BAD3A" }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {section === "about" && (
            <Card padding={28}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, boxShadow: `0 3px 0 0 ${shadeDarken(THEME.primary, 0.3)}`,
                }}>⏰</div>
                <div>
                  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 22, color: THEME.ink }}>Lifeboard</div>
                  <div style={{ fontSize: 12, color: THEME.inkMuted, fontFamily: F.mono, letterSpacing: 1, marginTop: 2 }}>personal os</div>
                </div>
              </div>
              <p style={{ color: THEME.inkSoft, fontSize: 14.5, lineHeight: 1.7, marginBottom: 20 }}>
                Lifeboard is built for people who want to live intentionally. It tracks the things that actually matter — your health, your craft, your growth — without the noise.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ padding: "5px 12px", borderRadius: 999, background: lighten(THEME.primary, 0.78), border: `1.5px solid ${lighten(THEME.primary, 0.55)}`, fontSize: 12, fontFamily: F.mono, fontWeight: 700, color: shadeDarken(THEME.primary, 0.4) }}>
                  v2.4.0
                </span>
                <span style={{ padding: "5px 12px", borderRadius: 999, background: TASK_PALETTE.diet.bg, border: `1.5px solid ${TASK_PALETTE.diet.edge}`, fontSize: 12, fontFamily: F.mono, fontWeight: 700, color: TASK_PALETTE.diet.fg }}>
                  Made with 🥗 in Hyderabad
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
