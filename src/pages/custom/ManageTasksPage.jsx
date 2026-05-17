import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getCustomTasks, createCustomTask, archiveCustomTask } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FONTS, THEME } from "../../lib/constants.js";

const ICON_OPTIONS = ["📌", "🚀", "🎵", "📷", "🧠", "💼", "🏋️", "🧘", "✍️", "🎤", "🔬", "🌱", "🎲", "🏊", "🎭"];

const COLOR_PRESETS = [
  { bd: "#D4C8F5", tx: "#8C6BD9", bg: "#E6DCFF" },
  { bd: "#F0BED5", tx: "#D4538F", bg: "#FBD2E2" },
  { bd: "#B8DAF0", tx: "#3FA0CF", bg: "#CFEAF8" },
  { bd: "#BCDFC8", tx: "#4FA070", bg: "#D2EEDB" },
  { bd: "#F0CFA8", tx: "#E58A2D", bg: "#FFE3C2" },
  { bd: "#F5BEC9", tx: "#D6395B", bg: "#FFD6DF" },
];

export default function ManageTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ task_key: "", label: "", icon: "📌", color_idx: 0 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setTasks(await getCustomTasks(user.id));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const saveTask = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      const color = COLOR_PRESETS[form.color_idx];
      const key = form.task_key || form.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      await createCustomTask(user.id, { task_key: key, label: form.label, icon: form.icon, ...color });
      setModalOpen(false);
      setForm({ task_key: "", label: "", icon: "📌", color_idx: 0 });
      load();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans, background: THEME.bg, minHeight: "100vh" }}>
      <PageHeader
        title="Manage Tasks" icon="⚙️"
        subtitle="Create and manage your custom tracking areas."
        action={<Button variant="primary" onClick={() => setModalOpen(true)}>+ New Task</Button>}
      />

      {loading ? (
        <div style={{ textAlign: "center", color: THEME.inkFaint, padding: 40, fontFamily: FONTS.mono, fontSize: 12 }}>Loading...</div>
      ) : tasks.length === 0 ? (
        <div style={{
          padding: "40px 20px", textAlign: "center",
          border: `2px dashed ${THEME.line}`, borderRadius: THEME.rLg,
          background: THEME.surfaceAlt,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
          <div style={{ color: THEME.inkMuted, fontSize: 14, marginBottom: 16 }}>No custom tasks yet. Create your first one.</div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>Create Custom Task</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              padding: "14px 16px", borderRadius: THEME.rMd,
              background: task.color_bg || THEME.surface,
              border: `1px solid ${task.color_bd || THEME.line}`,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: THEME.shadowSm,
            }}>
              <span style={{ fontSize: 22 }}>{task.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: task.color_tx || THEME.ink, fontWeight: 700, fontSize: 14, fontFamily: FONTS.nunito }}>{task.label}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkFaint, marginTop: 2 }}>{task.task_key}</div>
              </div>
              <Button variant="ghost" small onClick={() => navigate(`/tasks/${task.task_key}`)}>Open →</Button>
              <Button variant="danger" small onClick={async () => { if (confirm("Archive this task?")) { await archiveCustomTask(task.id); load(); } }}>Archive</Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Custom Task">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Task Name" value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} placeholder="Photography, Chess, Language Learning..." />

          <div>
            <div style={{ fontSize: 9.5, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Icon</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICON_OPTIONS.map(ico => (
                <button
                  key={ico}
                  onClick={() => setForm(f => ({ ...f, icon: ico }))}
                  style={{
                    width: 40, height: 40, fontSize: 22,
                    borderRadius: THEME.rSm,
                    border: `2px solid ${form.icon === ico ? THEME.primary : THEME.line}`,
                    background: form.icon === ico ? THEME.primarySoft : THEME.surfaceAlt,
                    cursor: "pointer",
                  }}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9.5, color: THEME.inkMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Color Theme</div>
            <div style={{ display: "flex", gap: 8 }}>
              {COLOR_PRESETS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setForm(f => ({ ...f, color_idx: i }))}
                  style={{
                    width: 36, height: 36, borderRadius: THEME.rSm,
                    border: `2.5px solid ${form.color_idx === i ? c.tx : "transparent"}`,
                    background: c.bg, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: form.color_idx === i ? THEME.shadowSm : "none",
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: c.tx }} />
                </button>
              ))}
            </div>
          </div>

          <Button variant="solid" onClick={saveTask} disabled={saving || !form.label.trim()}>
            {saving ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
