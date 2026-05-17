import { useState } from "react";
import { StatBadge } from "../ui/StatBadge.jsx";
import CheckBubble from "../ui/CheckBubble.jsx";
import { GymForm } from "./forms/GymForm.jsx";
import { JobPrepForm } from "./forms/JobPrepForm.jsx";
import { BookForm } from "./forms/BookForm.jsx";
import { SleepForm } from "./forms/SleepForm.jsx";
import { GenericForm } from "./forms/GenericForm.jsx";
import { FONTS, THEME } from "../../lib/constants.js";

const FORMS = { gym: GymForm, jobprep: JobPrepForm, book: BookForm, sleep: SleepForm };

export function TaskCard({ task, selectedDate, isDone, getTaskData, toggle, updateTaskDetails, streak, rate }) {
  const [expanded, setExpanded] = useState(false);
  const done = isDone(selectedDate, task.id);
  const taskData = getTaskData(selectedDate, task.id);
  const SpecificForm = FORMS[task.id] || GenericForm;

  const update = (details) => updateTaskDetails(selectedDate, task.id, details);

  return (
    <div style={{
      borderRadius: THEME.rMd,
      background: THEME.surface,
      border: `1px solid ${done ? task.bd : THEME.line}`,
      boxShadow: done ? THEME.shadowSm : "none",
      overflow: "hidden",
      transition: "border-color 0.25s, box-shadow 0.25s",
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Emoji icon square */}
        <div style={{
          width: 40, height: 40, borderRadius: THEME.rSm,
          background: done ? task.bg : THEME.surfaceAlt,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          border: `1px solid ${done ? task.bd : THEME.line}`,
          transition: "background 0.25s, border-color 0.25s",
        }}>
          {task.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: done ? task.tx : THEME.ink,
            fontWeight: 700, fontSize: 13.5,
            fontFamily: FONTS.nunito,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            transition: "color 0.25s",
          }}>
            {task.label}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
            {streak > 0 && (
              <span style={{ fontSize: 10.5, color: task.tx, fontFamily: FONTS.mono }}>
                🔥 {streak}d
              </span>
            )}
            <span style={{ fontSize: 10.5, color: THEME.inkFaint, fontFamily: FONTS.mono }}>
              {rate}%
            </span>
          </div>
        </div>

        <CheckBubble
          checked={done}
          onChange={() => toggle(selectedDate, task.id)}
          color={task.tx}
          size={30}
        />

        <span style={{
          color: THEME.inkFaint, fontSize: 10, flexShrink: 0,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>
          ▼
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "2px 14px 14px", borderTop: `1px solid ${THEME.line}` }}>
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
