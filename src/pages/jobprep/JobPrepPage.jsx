import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getJobPrepSessions, addJobPrepSession, deleteJobPrepSession, getLeetcodeProblems, addLeetcodeProblem, deleteLeetcodeProblem, upsertLog } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { TextArea } from "../../components/ui/TextArea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { StatBadge } from "../../components/ui/StatBadge.jsx";
import { FONTS } from "../../lib/constants.js";
import { CalendarPicker } from "../../components/ui/CalendarPicker.jsx";

function todayKey() { return new Date().toISOString().split("T")[0]; }

const DIFFICULTY_COLORS = { easy: "#4ADE80", medium: "#FCD34D", hard: "#FCA5A5" };
const STATUS_COLORS = { solved: "#4ADE80", attempted: "#FCD34D", revisit: "#7DD3FC" };

export default function JobPrepPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [tab, setTab] = useState("sessions");
  const [modalOpen, setModalOpen] = useState(false);
  const [lcModalOpen, setLcModalOpen] = useState(false);
  const [filters, setFilters] = useState({ difficulty: "", status: "", search: "" });
  const [loading, setLoading] = useState(true);

  // Session form state
  const [form, setForm] = useState({ log_date: todayKey(), focus_type: "leetcode", duration_min: "", problems_solved: "", notes: "" });
  // LC problem form
  const [lcForm, setLcForm] = useState({ log_date: todayKey(), problem_name: "", problem_num: "", difficulty: "medium", status: "solved", approach: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [s, p] = await Promise.all([getJobPrepSessions(user.id), getLeetcodeProblems(user.id, filters)]);
    setSessions(s);
    setProblems(p);
    setLoading(false);
  }, [user?.id, filters]);

  useEffect(() => { load(); }, [load]);

  const deleteSession = async (id) => {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    await deleteJobPrepSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const deleteProblem = async (id) => {
    if (!window.confirm("Delete this problem? This cannot be undone.")) return;
    await deleteLeetcodeProblem(id);
    setProblems(prev => prev.filter(p => p.id !== id));
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      await addJobPrepSession(user.id, { ...form, duration_min: form.duration_min ? parseInt(form.duration_min) : null, problems_solved: form.problems_solved ? parseInt(form.problems_solved) : null });
      await upsertLog(user.id, form.log_date, "jobprep", { done: true, duration_min: form.duration_min ? parseInt(form.duration_min) : null, notes: form.notes }).catch(() => {});
      setModalOpen(false);
      setForm({ log_date: todayKey(), focus_type: "leetcode", duration_min: "", problems_solved: "", notes: "" });
      load();
    } finally { setSaving(false); }
  };

  const saveProblem = async () => {
    setSaving(true);
    try {
      await addLeetcodeProblem(user.id, { ...lcForm, problem_num: lcForm.problem_num ? parseInt(lcForm.problem_num) : null });
      setLcModalOpen(false);
      setLcForm({ log_date: todayKey(), problem_name: "", problem_num: "", difficulty: "medium", status: "solved", approach: "" });
      load();
    } finally { setSaving(false); }
  };

  const totalSolved = problems.filter(p => p.status === "solved").length;
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.log_date); const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const filteredProblems = problems.filter(p => {
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.search && !p.problem_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="Job Prep" icon="🔥" subtitle="LeetCode · System Design · Mock Interviews"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" small onClick={() => setLcModalOpen(true)}>+ Problem</Button>
            <Button variant="primary" color="#FCA5A5" small onClick={() => setModalOpen(true)}>+ Session</Button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <StatBadge label="Problems Solved" value={totalSolved} color="#FCA5A5" />
        <StatBadge label="Sessions This Week" value={weekSessions} color="#FCA5A5" />
        <StatBadge label="Total Sessions" value={sessions.length} color="#FCA5A5" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#08091A", borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {["sessions", "leetcode"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px", borderRadius: 8, border: "none",
            background: tab === t ? "#2D0000" : "transparent",
            color: tab === t ? "#FCA5A5" : "#4A5568",
            fontFamily: FONTS.sans, fontSize: 13, cursor: "pointer",
            textTransform: "capitalize",
          }}>{t === "leetcode" ? "LeetCode Log" : "Sessions"}</button>
        ))}
      </div>

      {tab === "sessions" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", color: "#4A5568", padding: 40 }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔥</div>
              <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>No sessions logged yet. The grind starts here.</div>
              <Button variant="primary" color="#FCA5A5" onClick={() => setModalOpen(true)}>Log First Session</Button>
            </div>
          ) : sessions.map(s => (
            <div key={s.id} style={{ padding: "14px 16px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ padding: "2px 10px", borderRadius: 20, background: "#2D000033", border: "1px solid #B91C1C44", color: "#FCA5A5", fontSize: 11, fontFamily: FONTS.mono, textTransform: "capitalize" }}>
                      {s.focus_type}
                    </span>
                    {s.duration_min && <span style={{ fontSize: 11, color: "#4A5568" }}>⏱ {s.duration_min}m</span>}
                    {s.problems_solved && <span style={{ fontSize: 11, color: "#4A5568" }}>✓ {s.problems_solved} problems</span>}
                  </div>
                  {s.notes && <div style={{ color: "#4A5568", fontSize: 12.5, lineHeight: 1.6 }}>{s.notes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748" }}>{s.log_date}</div>
                  <button onClick={() => deleteSession(s.id)} style={{ background: "transparent", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }} title="Delete">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "leetcode" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Search problems..." style={{ flex: 1, minWidth: 160, background: "#08091A", border: "1px solid #1E293B", borderRadius: 8, padding: "8px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: FONTS.sans, outline: "none" }} />
            {["", "easy", "medium", "hard"].map(d => (
              <button key={d} onClick={() => setFilters(f => ({ ...f, difficulty: d }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${filters.difficulty === d ? (DIFFICULTY_COLORS[d] || "#4ADE80") : "#1E293B"}`, background: "transparent", color: filters.difficulty === d ? (DIFFICULTY_COLORS[d] || "#4ADE80") : "#4A5568", fontSize: 12, cursor: "pointer", fontFamily: FONTS.sans }}>
                {d || "All"}
              </button>
            ))}
          </div>

          {filteredProblems.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
              <div style={{ color: "#4A5568", fontSize: 14 }}>No problems found.</div>
            </div>
          ) : filteredProblems.map(p => (
            <div key={p.id} style={{ padding: "12px 16px", borderRadius: 12, background: "#0D1117", border: "1px solid #1E293B", marginBottom: 6, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 36, fontFamily: FONTS.mono, fontSize: 12, color: "#2D3748", flexShrink: 0 }}>#{p.problem_num || "—"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#E2E8F0", fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{p.problem_name}</div>
                {p.approach && <div style={{ color: "#4A5568", fontSize: 12, lineHeight: 1.5 }}>{p.approach}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "transparent", border: `1px solid ${DIFFICULTY_COLORS[p.difficulty]}44`, color: DIFFICULTY_COLORS[p.difficulty], fontFamily: FONTS.mono, textTransform: "capitalize" }}>{p.difficulty}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "transparent", border: `1px solid ${STATUS_COLORS[p.status]}44`, color: STATUS_COLORS[p.status], fontFamily: FONTS.mono, textTransform: "capitalize" }}>{p.status}</span>
                <button onClick={() => deleteProblem(p.id)} style={{ background: "transparent", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }} title="Delete">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Job Prep Session">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <CalendarPicker label="Date" value={form.log_date} onChange={v => setForm(f => ({ ...f, log_date: v }))} />
            <Select label="Focus" value={form.focus_type} onChange={v => setForm(f => ({ ...f, focus_type: v }))}
              options={[{ value: "leetcode", label: "LeetCode" }, { value: "sysdesign", label: "System Design" }, { value: "mock", label: "Mock Interview" }, { value: "other", label: "Other" }]} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Duration (min)" type="number" value={form.duration_min} onChange={v => setForm(f => ({ ...f, duration_min: v }))} placeholder="60" />
            <Input label="Problems Solved" type="number" value={form.problems_solved} onChange={v => setForm(f => ({ ...f, problems_solved: v }))} placeholder="2" />
          </div>
          <TextArea label="Notes / What you learned" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="DP tricks, system design tradeoffs..." />
          <Button variant="solid" color="#FCA5A5" onClick={saveSession} disabled={saving}>{saving ? "Saving..." : "Save Session 🔥"}</Button>
        </div>
      </Modal>

      {/* LC Problem Modal */}
      <Modal open={lcModalOpen} onClose={() => setLcModalOpen(false)} title="Log LeetCode Problem">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Problem Name" value={lcForm.problem_name} onChange={v => setLcForm(f => ({ ...f, problem_name: v }))} placeholder="Two Sum" style={{ flex: 2 }} />
            <Input label="#" type="number" value={lcForm.problem_num} onChange={v => setLcForm(f => ({ ...f, problem_num: v }))} placeholder="1" style={{ flex: 1, minWidth: 70 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Select label="Difficulty" value={lcForm.difficulty} onChange={v => setLcForm(f => ({ ...f, difficulty: v }))}
              options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} />
            <Select label="Status" value={lcForm.status} onChange={v => setLcForm(f => ({ ...f, status: v }))}
              options={[{ value: "solved", label: "Solved" }, { value: "attempted", label: "Attempted" }, { value: "revisit", label: "Needs Revisit" }]} />
          </div>
          <CalendarPicker label="Date" value={lcForm.log_date} onChange={v => setLcForm(f => ({ ...f, log_date: v }))} />
          <TextArea label="Approach / Solution notes" value={lcForm.approach} onChange={v => setLcForm(f => ({ ...f, approach: v }))} placeholder="Two pointers, hash map approach..." />
          <Button variant="solid" color="#FCA5A5" onClick={saveProblem} disabled={saving}>{saving ? "Saving..." : "Save Problem"}</Button>
        </div>
      </Modal>
    </div>
  );
}
