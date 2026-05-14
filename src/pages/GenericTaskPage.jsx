import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { getTaskSessions, addTaskSession, upsertLog } from "../lib/db.js";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Input } from "../components/ui/Input.jsx";
import { TextArea } from "../components/ui/TextArea.jsx";
import { StatBadge } from "../components/ui/StatBadge.jsx";
import { FONTS } from "../lib/constants.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

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

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title={title} icon={icon} subtitle={subtitle}
        action={<Button variant="primary" color={accentColor} onClick={() => setModalOpen(true)}>+ Log Session</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <StatBadge label="Total Sessions" value={sessions.length} color={accentColor} />
        <StatBadge label="This Week" value={weekSessions} color={accentColor} />
        <StatBadge label="Total Hours" value={`${totalHours}h`} color={accentColor} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#4A5568", padding: 40 }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
          <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>No sessions yet. Log your first one.</div>
          <Button variant="primary" color={accentColor} onClick={() => setModalOpen(true)}>Log First Session</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "14px 16px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                    {s.duration_min && <span style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>⏱ {s.duration_min} min</span>}
                    {s.mood && <span style={{ fontSize: 16 }}>{MOOD_LABELS[s.mood]}</span>}
                    {(s.tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "transparent", border: `1px solid ${accentColor}33`, color: accentColor, fontFamily: FONTS.mono }}>{tag}</span>
                    ))}
                  </div>
                  {s.session_goal && <div style={{ color: "#94A3B8", fontSize: 13, marginBottom: 4 }}>🎯 {s.session_goal}</div>}
                  {s.outcome && <div style={{ color: "#4A5568", fontSize: 12.5, lineHeight: 1.5 }}>✓ {s.outcome}</div>}
                  {s.notes && <div style={{ color: "#4A5568", fontSize: 12.5, lineHeight: 1.5, marginTop: 4 }}>{s.notes}</div>}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748", flexShrink: 0 }}>{s.log_date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Log ${title} Session`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Date" type="date" value={form.log_date} onChange={v => setForm(f => ({ ...f, log_date: v }))} />
            <Input label="Duration (min)" type="number" value={form.duration_min} onChange={v => setForm(f => ({ ...f, duration_min: v }))} placeholder="60" />
          </div>
          <Input label="What did you plan to do?" value={form.session_goal} onChange={v => setForm(f => ({ ...f, session_goal: v }))} placeholder="Session goal..." />
          <TextArea label="What actually happened?" value={form.outcome} onChange={v => setForm(f => ({ ...f, outcome: v }))} placeholder="Outcome / what you shipped..." rows={2} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Mood (1–5)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, mood: String(n) }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${form.mood === String(n) ? accentColor : "#1E293B"}`, background: form.mood === String(n) ? accentColor + "22" : "transparent", fontSize: 14, cursor: "pointer" }}>
                    {MOOD_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="coding, design" />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Thoughts, blockers, ideas..." rows={2} />
          <Button variant="solid" color={accentColor} onClick={save} disabled={saving}>{saving ? "Saving..." : `Save Session ${icon}`}</Button>
        </div>
      </Modal>
    </div>
  );
}
