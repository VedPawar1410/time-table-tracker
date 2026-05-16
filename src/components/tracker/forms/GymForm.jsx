import { Input } from "../../ui/Input.jsx";
import { TextArea } from "../../ui/TextArea.jsx";
import { Select } from "../../ui/Select.jsx";
import { FONTS } from "../../../lib/constants.js";

function isSunday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

export function GymForm({ data, update, date }) {
  const isRestDay = !!data.rest_day;
  const sunday = isSunday(date);

  const toggleRestDay = () => {
    if (isRestDay) {
      update({ rest_day: false, done: false });
    } else {
      update({ rest_day: true, done: true });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Rest day toggle */}
      <button
        type="button"
        onClick={toggleRestDay}
        style={{
          padding: "9px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
          background: isRestDay ? "#022c22" : sunday ? "#1C1200" : "transparent",
          border: `1px solid ${isRestDay ? "#115E59" : sunday ? "#B4530966" : "#1E293B"}`,
          color: isRestDay ? "#4ADE80" : sunday ? "#FCD34D" : "#4A5568",
          fontFamily: FONTS.sans, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 16 }}>🌙</span>
        <div>
          <div style={{ fontWeight: 600 }}>{isRestDay ? "Rest Day ✓" : "Mark as Rest Day"}</div>
          {sunday && !isRestDay && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>Suggested — it's Sunday</div>}
        </div>
      </button>

      {/* Workout details — hidden when rest day */}
      {!isRestDay && (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <Select label="Type" value={data.type} onChange={v => update({ type: v })}
              options={[{ value: "weights", label: "Weights" }, { value: "cardio", label: "Cardio" }, { value: "mixed", label: "Mixed" }]} />
            <Input label="Duration (min)" type="number" value={data.duration_min} onChange={v => update({ duration_min: v })} placeholder="60" />
          </div>
          <TextArea label="Workout Notes" value={data.notes} onChange={v => update({ notes: v })} placeholder="Heavy squats, new PR on bench..." />
        </>
      )}
    </div>
  );
}
