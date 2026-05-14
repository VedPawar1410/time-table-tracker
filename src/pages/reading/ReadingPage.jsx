import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getBooks, createBook, upsertLog } from "../../lib/db.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { StatBadge } from "../../components/ui/StatBadge.jsx";
import { FONTS } from "../../lib/constants.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

const STATUS_COLORS = { reading: "#93C5FD", completed: "#4ADE80", paused: "#FCD34D", wishlist: "#A78BFA" };

export default function ReadingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", total_pages: "", genre: "", status: "reading", started_at: todayKey() });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setBooks(await getBooks(user.id));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const saveBook = async () => {
    setSaving(true);
    try {
      await createBook(user.id, { ...form, total_pages: form.total_pages ? parseInt(form.total_pages) : null });
      setModalOpen(false);
      setForm({ title: "", author: "", total_pages: "", genre: "", status: "reading", started_at: todayKey() });
      load();
    } finally { setSaving(false); }
  };

  const reading = books.filter(b => b.status === "reading");
  const completed = books.filter(b => b.status === "completed");

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <PageHeader title="Reading" icon="📘" subtitle="Your library and reading sessions."
        action={<Button variant="primary" color="#93C5FD" onClick={() => setModalOpen(true)}>+ Add Book</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <StatBadge label="Currently Reading" value={reading.length} color="#93C5FD" />
        <StatBadge label="Books Completed" value={completed.length} color="#4ADE80" />
        <StatBadge label="Total Books" value={books.length} color="#93C5FD" />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#4A5568", padding: 40 }}>Loading...</div>
      ) : (
        <>
          {/* Currently Reading */}
          {reading.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#93C5FD", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>📖 Currently Reading</div>
              {reading.map(book => (
                <div key={book.id} onClick={() => navigate(`/reading/${book.id}`)}
                  style={{ padding: "16px 18px", borderRadius: 16, background: "#0A1628", border: "1px solid #1D4ED844", marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "#93C5FD", marginBottom: 4 }}>{book.title}</div>
                  {book.author && <div style={{ color: "#4A5568", fontSize: 13, marginBottom: 8 }}>by {book.author}</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    {book.genre && <span style={{ fontSize: 11, color: "#4A5568", fontFamily: FONTS.mono }}>{book.genre}</span>}
                    {book.started_at && <span style={{ fontSize: 11, color: "#2D3748", fontFamily: FONTS.mono }}>Started {book.started_at}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All books grid */}
          {books.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
              <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 16 }}>Your library is empty. Add your first book.</div>
              <Button variant="primary" color="#93C5FD" onClick={() => setModalOpen(true)}>Add a Book</Button>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#4A5568", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>All Books</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {books.map(book => (
                  <div key={book.id} onClick={() => navigate(`/reading/${book.id}`)}
                    style={{ padding: "16px", borderRadius: 14, background: "#0D1117", border: "1px solid #1E293B", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 28, textAlign: "center" }}>📗</div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "#E2E8F0", lineHeight: 1.3, textAlign: "center" }}>{book.title}</div>
                    {book.author && <div style={{ color: "#4A5568", fontSize: 11, textAlign: "center" }}>{book.author}</div>}
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, border: `1px solid ${STATUS_COLORS[book.status]}44`, color: STATUS_COLORS[book.status], fontFamily: FONTS.mono, textTransform: "capitalize" }}>
                        {book.status}
                      </span>
                    </div>
                    {book.rating && <div style={{ textAlign: "center", fontSize: 14 }}>{"⭐".repeat(book.rating)}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Book">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Book title" />
          <Input label="Author" value={form.author} onChange={v => setForm(f => ({ ...f, author: v }))} placeholder="Author name" />
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Total Pages" type="number" value={form.total_pages} onChange={v => setForm(f => ({ ...f, total_pages: v }))} placeholder="300" />
            <Input label="Genre" value={form.genre} onChange={v => setForm(f => ({ ...f, genre: v }))} placeholder="Non-fiction" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))}
              options={[{ value: "reading", label: "Reading" }, { value: "wishlist", label: "Wishlist" }, { value: "completed", label: "Completed" }, { value: "paused", label: "Paused" }]} />
            <Input label="Started" type="date" value={form.started_at} onChange={v => setForm(f => ({ ...f, started_at: v }))} />
          </div>
          <Button variant="solid" color="#93C5FD" onClick={saveBook} disabled={saving}>{saving ? "Saving..." : "Add to Library 📚"}</Button>
        </div>
      </Modal>
    </div>
  );
}
