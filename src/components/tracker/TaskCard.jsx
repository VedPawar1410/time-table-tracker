import { useState } from "react";
import { StatBadge } from "../ui/StatBadge.jsx";
import { GymForm } from "./forms/GymForm.jsx";
import { JobPrepForm } from "./forms/JobPrepForm.jsx";
import { BookForm } from "./forms/BookForm.jsx";
import { SleepForm } from "./forms/SleepForm.jsx";
import { GenericForm } from "./forms/GenericForm.jsx";
import { FONTS } from "../../lib/constants.js";

const FORMS = { gym: GymForm, jobprep: JobPrepForm, book: BookForm, sleep: SleepForm };

export function TaskCard({ task, selectedDate, isDone, getTaskData, toggle, updateTaskDetails, streak, rate }) {
  const [expanded, setExpanded] = useState(false);
  const done = isDone(selectedDate, task.id);
  const taskData = getTaskData(selectedDate, task.id);
  const SpecificForm = FORMS[task.id] || GenericForm;

  const update = (details) => updateTaskDetails(selectedDate, task.id, details);

  return (
    <div style={{
      borderRadius: 14, background: done ? task.bg : "#0D1117",
      border: `1px solid ${done ? task.bd : "#1E293B"}`,
      overflow: "hidden", transition: "border-color 0.25s, background 0.25s",
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{task.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: done ? task.tx : "#94A3B8", fontWeight: 500, fontSize: 13, transition: "color 0.25s", fontFamily: FONTS.sans, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {task.label}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
            {streak > 0 && <span style={{ fontSize: 10, color: task.tx, opacity: 0.85, fontFamily: FONTS.mono }}>🔥{streak}d</span>}
            <span style={{ fontSize: 10, color: "#2D3748", fontFamily: FONTS.mono }}>{rate}%</span>
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); toggle(selectedDate, task.id); }}
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            border: `1.5px solid ${done ? task.bd : "#374151"}`,
            background: done ? task.bd + "44" : "transparent",
            color: done ? task.tx : "#374151", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", fontWeight: 700,
          }}
        >
          {done ? "✓" : "○"}
        </button>

        <span style={{ color: "#1E293B", fontSize: 10, flexShrink: 0, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▼
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "2px 14px 14px", borderTop: `1px solid ${task.bd}22` }}>
          <div style={{ marginBottom: 12 }}>
            <SpecificForm data={taskData} update={update} date={selectedDate} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <StatBadge label="Current Streak" value={streak > 0 ? `${streak}d` : "—"} color={task.tx} />
            <StatBadge label="30-Day Rate" value={`${rate}%`} color={task.tx} />
          </div>
        </div>
      )}
    </div>
  );
}
