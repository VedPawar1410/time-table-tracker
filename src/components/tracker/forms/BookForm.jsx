import { Input } from "../../ui/Input.jsx";
import { TextArea } from "../../ui/TextArea.jsx";

export function BookForm({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Input label="Book Title" value={data.book} onChange={v => update({ book: v })} placeholder="Name of the book" />
        <Input label="Pages Read" type="number" value={data.pages} onChange={v => update({ pages: v })} placeholder="20" style={{ maxWidth: 110, flex: "0 0 110px" }} />
      </div>
      <TextArea label="Key Takeaways" value={data.notes} onChange={v => update({ notes: v })} placeholder="Interesting quotes or ideas..." />
    </div>
  );
}
