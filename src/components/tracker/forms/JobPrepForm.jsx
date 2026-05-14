import { Input } from "../../ui/Input.jsx";
import { TextArea } from "../../ui/TextArea.jsx";
import { Select } from "../../ui/Select.jsx";

export function JobPrepForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Select label="Focus" value={data.focus} onChange={v => update({ focus: v })}
          options={[
            { value: "leetcode", label: "LeetCode" },
            { value: "sysdesign", label: "System Design" },
            { value: "mock", label: "Mock Interview" },
            { value: "other", label: "Other" },
          ]} />
        <Input label="Problems Solved" type="number" value={data.count} onChange={v => update({ count: v })} placeholder="2" />
      </div>
      <TextArea label="What did you learn?" value={data.notes} onChange={v => update({ notes: v })} placeholder="DP tricks, system design tradeoffs..." />
    </div>
  );
}
