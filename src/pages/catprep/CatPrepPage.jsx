import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getCatSessions, addCatSession, upsertLog } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { TextArea } from "../../components/ui/TextArea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { StatBadge } from "../../components/ui/StatBadge.jsx";
import { FONTS } from "../../lib/constants.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

export default function CatPrepPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ log_date: todayKey(), session_type: "topic", duration_min: "", topic: "", mock_name: "", score: "", percentile: "", correct: "", incorrect: "", unattempted: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSessions(await getCatSessions(user.id));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const saveSession = async () => {
    setSaving(true);
    try {
      const payload = { ...form, duration_min: form.duration_min ? parseInt(form.duration_min) : null, score: form.score ? parseInt(form.score) : null, percentile: form.percentile ? parseFloat(form.percentile) : null, correct: form.correct ? parseInt(form.correct) : null, incorrect: form.incorrect ? parseInt(form.incorrect) : null, unattempted: form.unattempted ? parseInt(form.unattempted) : null };
      await addCatSession(user.id, payload);
      await upsertLog(user.id, form.log_date, "catprep", { done: true, duration_min: payload.duration_min, notes: form.notes }).catch(() => {});
      setModalOpen(false);
      setForm({ log_date: todayKey(), session_type: "topic", duration_min: "", topic: "", mock_name: "", score: "", percentile: "", correct: "", incorrect: "", unattempted: "", notes: "" });
      load();
    } finally { setSaving(false); }
  };

  const mocks = sessions.filter(s => s.session_type === "mock" && s.score !== null);
  const bestScore = mocks.length ? Math.max(...mocks.map(s => s.score)) : null;
  const latestPercentile = mocks.length ? mocks[0].percentile : null;

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="CAT Prep" icon="🎯" subtitle="Mock tests · Topic study · Score tracking"
        action={<Button variant="primary" color="#FDE68A" onClick={() => setModalOpen(true)}>+ Log Session</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <StatBadge label="Total Sessions" value={sessions.length} color="#FDE68A" />
        <StatBadge label="Mocks Attempted" value={mocks.length} color="#FDE68A" />
        {bestScore !== null && <StatBadge label="Best Score" value={`${bestScore}%`} color="#FDE68A" />}
        {latestPercentile !== null && <StatBadge label="Latest Percentile" value={`${latestPercentile}%ile`} color="#FDE68A" />}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#4A5568", padding: 40 }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>No sessions logged yet.</div>
          <Button variant="primary" color="#FDE68A" onClick={() => setModalOpen(true)}>Log First Session</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "14px 16px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ padding: "2px 10px", borderRadius: 20, background: "#1C0E0044", border: "1px solid #B4530944", color: "#FDE68A", fontSize: 11, fontFamily: FONTS.mono, textTransform: "capitalize" }}>
                      {s.session_type}
                    </span>
                    {s.topic && <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.topic.toUpperCase()}</span>}
                    {s.mock_name && <span style={{ fontSize: 12, color: "#FDE68A" }}>{s.mock_name}</span>}
                    {s.duration_min && <span style={{ fontSize: 11, color: "#4A5568" }}>⏱ {s.duration_min}m</span>}
                  </div>
                  {s.score !== null && (
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, color: "#FDE68A", fontWeight: 700, fontFamily: FONTS.mono }}>{s.score}%</span>
                      {s.percentile && <span style={{ fontSize: 12, color: "#4A5568" }}>{s.percentile}%ile</span>}
                      {s.correct !== null && <span style={{ fontSize: 12, color: "#4ADE80" }}>✓{s.correct}</span>}
                      {s.incorrect !== null && <span style={{ fontSize: 12, color: "#FCA5A5" }}>✗{s.incorrect}</span>}
                      {s.unattempted !== null && <span style={{ fontSize: 12, color: "#4A5568" }}>–{s.unattempted}</span>}
                    </div>
                  )}
                  {s.notes && <div style={{ color: "#4A5568", fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{s.notes}</div>}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748", flexShrink: 0 }}>{s.log_date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log CAT Prep Session">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Date" type="date" value={form.log_date} onChange={v => setForm(f => ({ ...f, log_date: v }))} />
            <Select label="Type" value={form.session_type} onChange={v => setForm(f => ({ ...f, session_type: v }))}
              options={[{ value: "topic", label: "Topic Study" }, { value: "mock", label: "Mock Test" }, { value: "revision", label: "Revision" }]} />
          </div>

          {form.session_type !== "mock" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <Select label="Topic" value={form.topic} onChange={v => setForm(f => ({ ...f, topic: v }))}
                options={[{ value: "quant", label: "Quantitative" }, { value: "varc", label: "VARC" }, { value: "dilr", label: "DILR" }, { value: "vocab", label: "Vocab/Grammar" }, { value: "rc", label: "Reading Comprehension" }]} />
              <Input label="Duration (min)" type="number" value={form.duration_min} onChange={v => setForm(f => ({ ...f, duration_min: v }))} placeholder="60" />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10 }}>
                <Input label="Mock Name" value={form.mock_name} onChange={v => setForm(f => ({ ...f, mock_name: v }))} placeholder="AIMCAT 2401" />
                <Input label="Score (%)" type="number" value={form.score} onChange={v => setForm(f => ({ ...f, score: v }))} placeholder="85" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Input label="Percentile" type="number" value={form.percentile} onChange={v => setForm(f => ({ ...f, percentile: v }))} placeholder="95.2" />
                <Input label="Correct" type="number" value={form.correct} onChange={v => setForm(f => ({ ...f, correct: v }))} placeholder="48" />
                <Input label="Incorrect" type="number" value={form.incorrect} onChange={v => setForm(f => ({ ...f, incorrect: v }))} placeholder="12" />
              </div>
            </>
          )}
          <TextArea label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="What you studied, key insights..." />
          <Button variant="solid" color="#FDE68A" onClick={saveSession} disabled={saving}>{saving ? "Saving..." : "Save Session 🎯"}</Button>
        </div>
      </Modal>
    </div>
  );
}
