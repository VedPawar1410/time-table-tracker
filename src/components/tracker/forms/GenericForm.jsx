import { TextArea } from "../../ui/TextArea.jsx";

export function GenericForm({ data, update }) {
  return (
    <TextArea
      label="Daily Notes & Tracking"
      value={data.notes}
      onChange={v => update({ notes: v })}
      placeholder="What did you do? How did it go?"
    />
  );
}
