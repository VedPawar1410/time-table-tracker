import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getCustomTasks, createCustomTask, archiveCustomTask } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FONTS } from "../../lib/constants.js";

const ICON_OPTIONS = ["📌", "🚀", "🎵", "📷", "🧠", "💼", "🏋️", "🧘", "✍️", "🎤", "🔬", "🌱", "🎲", "🏊", "🎭"];
const COLOR_PRESETS = [
  { bd: "#7C3AED", tx: "#DDD6FE", bg: "#0D0520" },
  { bd: "#BE185D", tx: "#F9A8D4", bg: "#1A0520" },
  { bd: "#0369A1", tx: "#7DD3FC", bg: "#031525" },
  { bd: "#166534", tx: "#4ADE80", bg: "#052E16" },
  { bd: "#D97706", tx: "#FEF08A", bg: "#1A1000" },
  { bd: "#DC2626", tx: "#FCA5A5", bg: "#2D0000" },
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
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="Manage Tasks" icon="⚙️" subtitle="Create and manage your custom tracking areas."
        action={<Button variant="primary" color="#94A3B8" onClick={() => setModalOpen(true)}>+ New Task</Button>}
      />

      {loading ? (
        <div style={{ textAlign: "center", color: "#4A5568", padding: 40 }}>Loading...</div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
          <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>No custom tasks yet. Create your first one.</div>
          <Button variant="primary" color="#94A3B8" onClick={() => setModalOpen(true)}>Create Custom Task</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map(task => (
            <div key={task.id} style={{ padding: "14px 16px", borderRadius: 14, background: task.color_bg, border: `1px solid ${task.color_bd}44`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>{task.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: task.color_tx, fontWeight: 600, fontSize: 14 }}>{task.label}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#2D3748", marginTop: 2 }}>{task.task_key}</div>
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
            <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Icon</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICON_OPTIONS.map(ico => (
                <button key={ico} onClick={() => setForm(f => ({ ...f, icon: ico }))} style={{ width: 40, height: 40, fontSize: 22, borderRadius: 8, border: `2px solid ${form.icon === ico ? "#94A3B8" : "#1E293B"}`, background: "transparent", cursor: "pointer" }}>
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Color Theme</div>
            <div style={{ display: "flex", gap: 8 }}>
              {COLOR_PRESETS.map((c, i) => (
                <button key={i} onClick={() => setForm(f => ({ ...f, color_idx: i }))} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.color_idx === i ? c.bd : "transparent"}`, background: c.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bd }} />
                </button>
              ))}
            </div>
          </div>

          <Button variant="solid" color="#94A3B8" onClick={saveTask} disabled={saving || !form.label.trim()}>
            {saving ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
