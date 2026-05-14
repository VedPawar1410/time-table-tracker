import { Input } from "../../ui/Input.jsx";
import { TextArea } from "../../ui/TextArea.jsx";
import { Select } from "../../ui/Select.jsx";

export function SleepForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Input label="Bedtime" type="time" value={data.time} onChange={v => update({ time: v })} />
        <Select label="Quality (1–5)" value={data.quality} onChange={v => update({ quality: v })}
          options={[
            { value: "1", label: "1 – Poor" },
            { value: "2", label: "2 – Fair" },
            { value: "3", label: "3 – Good" },
            { value: "4", label: "4 – Very Good" },
            { value: "5", label: "5 – Excellent" },
          ]} />
      </div>
      <TextArea label="Notes" value={data.notes} onChange={v => update({ notes: v })} placeholder="Woke up feeling..." />
    </div>
  );
}
