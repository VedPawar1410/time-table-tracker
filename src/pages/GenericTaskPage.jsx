import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { getTaskSessions, addTaskSession, deleteTaskSession, upsertLog } from "../lib/db.js";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Input } from "../components/ui/Input.jsx";
import { TextArea } from "../components/ui/TextArea.jsx";
import { StatBadge } from "../components/ui/StatBadge.jsx";
import { FONTS, THEME } from "../lib/constants.js";
import { CalendarPicker } from "../components/ui/CalendarPicker.jsx";

function todayKey() {
  const d = new Date();
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function GenericTaskPage({ taskId, title, icon, subtitle, accentColor }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tags, setTags] = useState("");
  const [form, setForm] = useState({ log_date: todayKey(), duration_min: "", session_goal: "", outcome: "", mood: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSessions(await getTaskSessions(user.id, taskId));
    setLoading(false);
  }, [user?.id, taskId]);

  useEffect(() => { load(); }, [load]);

  const deleteSession = async (id) => {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    await deleteTaskSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      const tagArr = tags.split(",").map(t => t.trim()).filter(Boolean);
      await addTaskSession(user.id, taskId, {
        ...form,
        duration_min: form.duration_min ? parseInt(form.duration_min) : null,
        mood: form.mood ? parseInt(form.mood) : null,
        tags: tagArr.length ? tagArr : null,
      });
      await upsertLog(user.id, form.log_date, taskId, { done: true, duration_min: form.duration_min ? parseInt(form.duration_min) : null, notes: form.notes }).catch(() => {});
      setModalOpen(false);
      setForm({ log_date: todayKey(), duration_min: "", session_goal: "", outcome: "", mood: "", notes: "" });
      setTags("");
      load();
    } finally { setSaving(false); }
  };

  const totalHours = Math.round(sessions.reduce((sum, s) => sum + (s.duration_min || 0), 0) / 60 * 10) / 10;
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.log_date); const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const MOOD_LABELS = ["", "😔", "😐", "🙂", "😊", "🤩"];
  const ac = accentColor || THEME.primary;

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans, background: THEME.bg, minHeight: "100vh" }}>
      <PageHeader
        title={title} icon={icon} subtitle={subtitle}
        action={<Button variant="primary" color={ac} onClick={() => setModalOpen(true)}>+ Log Session</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <StatBadge label="Total Sessions" value={sessions.length} color={ac} />
        <StatBadge label="This Week" value={weekSessions} color={ac} />
        <StatBadge label="Total Hours" value={`${totalHours}h`} color={ac} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: THEME.inkFaint, padding: 40, fontFamily: FONTS.mono, fontSize: 12 }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{
          padding: "40px 20px", textAlign: "center",
          border: `2px dashed ${THEME.line}`, borderRadius: THEME.rLg,
          background: THEME.surfaceAlt,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
          <div style={{ color: THEME.inkMuted, fontSize: 14, marginBottom: 16 }}>No sessions yet. Log your first one.</div>
          <Button variant="primary" color={ac} onClick={() => setModalOpen(true)}>Log First Session</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{
              padding: "14px 16px", borderRadius: THEME.rMd,
              background: THEME.surface, border: `1px solid ${THEME.line}`,
              boxShadow: THEME.shadowSm,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                    {s.duration_min && (
                      <span style={{ fontSize: 12, color: ac, fontWeight: 600 }}>⏱ {s.duration_min} min</span>
                    )}
                    {s.mood && <span style={{ fontSize: 16 }}>{MOOD_LABELS[s.mood]}</span>}
                    {(s.tags || []).map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: THEME.rPill,
                        background: ac + "18", border: `1px solid ${ac}33`,
                        color: ac, fontFamily: FONTS.mono,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {s.session_goal && (
                    <div style={{ color: THEME.inkSoft, fontSize: 13, marginBottom: 4 }}>🎯 {s.session_goal}</div>
                  )}
                  {s.outcome && (
                    <div style={{ color: THEME.inkSoft, fontSize: 12.5, lineHeight: 1.5 }}>✓ {s.outcome}</div>
                  )}
                  {s.notes && (
                    <div style={{ color: THEME.inkMuted, fontSize: 12.5, lineHeight: 1.5, marginTop: 4 }}>{s.notes}</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: THEME.inkFaint }}>{s.log_date}</div>
                  <button
                    onClick={() => deleteSession(s.id)}
                    style={{ background: "transparent", border: "none", color: THEME.inkFaint, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Log ${title} Session`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <CalendarPicker label="Date" value={form.log_date} onChange={v => setForm(f => ({ ...f, log_date: v }))} />
            <Input label="Duration (min)" type="number" value={form.duration_min} onChange={v => setForm(f => ({ ...f, duration_min: v }))} placeholder="60" />
          </div>
          <Input label="What did you plan to do?" value={form.session_goal} onChange={v => setForm(f => ({ ...f, session_goal: v }))} placeholder="Session goal..." />
          <TextArea label="What actually happened?" value={form.outcome} onChange={v => setForm(f => ({ ...f, outcome: v }))} placeholder="Outcome / what you shipped..." rows={2} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9.5, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Mood (1–5)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(f => ({ ...f, mood: String(n) }))}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: THEME.rSm,
                      border: `1.5px solid ${form.mood === String(n) ? ac : THEME.line}`,
                      background: form.mood === String(n) ? ac + "22" : THEME.surfaceAlt,
                      fontSize: 14, cursor: "pointer",
                    }}
                  >
                    {MOOD_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="coding, design" />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Thoughts, blockers, ideas..." rows={2} />
          <Button variant="solid" color={ac} onClick={save} disabled={saving}>
            {saving ? "Saving..." : `Save Session ${icon}`}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
