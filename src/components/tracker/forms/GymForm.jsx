import { Input } from "../../ui/Input.jsx";
import { TextArea } from "../../ui/TextArea.jsx";
import { Select } from "../../ui/Select.jsx";

export function GymForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Select label="Type" value={data.type} onChange={v => update({ type: v })}
          options={[{ value: "weights", label: "Weights" }, { value: "cardio", label: "Cardio" }, { value: "mixed", label: "Mixed" }]} />
        <Input label="Duration (min)" type="number" value={data.duration_min} onChange={v => update({ duration_min: v })} placeholder="60" />
      </div>
      <TextArea label="Workout Notes" value={data.notes} onChange={v => update({ notes: v })} placeholder="Heavy squats, new PR on bench..." />
    </div>
  );
}
