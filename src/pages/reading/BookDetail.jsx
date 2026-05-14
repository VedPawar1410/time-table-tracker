import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getBookById, getReadingSessions, addReadingSession, updateBook, upsertLog } from "../../lib/db.js";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { TextArea } from "../../components/ui/TextArea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { FONTS } from "../../lib/constants.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

export default function BookDetail() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ log_date: todayKey(), start_page: "", end_page: "", duration_min: "", highlights: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getBookById(bookId), getReadingSessions(user.id, bookId)])
      .then(([b, s]) => { setBook(b); setSessions(s); })
      .finally(() => setLoading(false));
  }, [bookId, user?.id]);

  const saveSession = async () => {
    setSaving(true);
    try {
      const pagesRead = form.end_page && form.start_page ? parseInt(form.end_page) - parseInt(form.start_page) : null;
      await addReadingSession(user.id, { book_id: bookId, ...form, pages_read: pagesRead, duration_min: form.duration_min ? parseInt(form.duration_min) : null, start_page: form.start_page ? parseInt(form.start_page) : null, end_page: form.end_page ? parseInt(form.end_page) : null });
      await upsertLog(user.id, form.log_date, "book", { done: true, notes: form.notes }).catch(() => {});
      setModalOpen(false);
      setForm({ log_date: todayKey(), start_page: "", end_page: "", duration_min: "", highlights: "", notes: "" });
      const updated = await getReadingSessions(user.id, bookId);
      setSessions(updated);
    } finally { setSaving(false); }
  };

  const totalPages = sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0);
  const progress = book?.total_pages ? Math.min(100, Math.round((totalPages / book.total_pages) * 100)) : null;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>Loading...</div>;
  if (!book) return <div style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>Book not found.</div>;

  return (
    <div style={{ padding: "24px 20px 40px", maxWidth: 800, margin: "0 auto", fontFamily: FONTS.sans }}>
      <button onClick={() => navigate("/reading")} style={{ background: "transparent", border: "none", color: "#4A5568", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
        ‹ Back to Reading
      </button>

      <div style={{ padding: "20px", borderRadius: 16, background: "#0A1628", border: "1px solid #1D4ED844", marginBottom: 24 }}>
        <h1 style={{ fontFamily: FONTS.syne, fontSize: 24, fontWeight: 800, color: "#93C5FD", marginBottom: 6 }}>{book.title}</h1>
        {book.author && <div style={{ color: "#4A5568", fontSize: 14, marginBottom: 12 }}>by {book.author}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {book.genre && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#0A162888", border: "1px solid #1D4ED844", color: "#93C5FD", fontFamily: FONTS.mono }}>{book.genre}</span>}
          {book.total_pages && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "transparent", border: "1px solid #1E293B", color: "#4A5568", fontFamily: FONTS.mono }}>{book.total_pages} pages</span>}
        </div>
        {progress !== null && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#4A5568" }}>{totalPages} pages read</span>
              <span style={{ fontSize: 12, color: "#93C5FD", fontFamily: FONTS.mono }}>{progress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "#1E293B" }}>
              <div style={{ height: 4, borderRadius: 2, background: "#93C5FD", width: `${progress}%`, transition: "width 0.5s" }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#93C5FD", letterSpacing: 3, textTransform: "uppercase" }}>Reading Sessions ({sessions.length})</div>
        <Button variant="primary" color="#93C5FD" small onClick={() => setModalOpen(true)}>+ Log Session</Button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ padding: "30px 20px", textAlign: "center", border: "1px dashed #1E293B", borderRadius: 12 }}>
          <div style={{ color: "#4A5568", fontSize: 13, marginBottom: 12 }}>No sessions yet. Start reading!</div>
          <Button variant="primary" color="#93C5FD" small onClick={() => setModalOpen(true)}>Log First Session</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "14px 16px", borderRadius: 12, background: "#0D1117", border: "1px solid #1E293B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {s.pages_read && <span style={{ fontSize: 13, color: "#93C5FD", fontWeight: 600 }}>{s.pages_read} pages</span>}
                  {s.start_page && s.end_page && <span style={{ fontSize: 12, color: "#4A5568" }}>pp. {s.start_page}–{s.end_page}</span>}
                  {s.duration_min && <span style={{ fontSize: 12, color: "#4A5568" }}>⏱ {s.duration_min}m</span>}
                </div>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#2D3748" }}>{s.log_date}</span>
              </div>
              {s.highlights && <div style={{ color: "#4A5568", fontSize: 12.5, fontStyle: "italic", lineHeight: 1.6, borderLeft: "2px solid #1D4ED844", paddingLeft: 10, marginTop: 6 }}>{s.highlights}</div>}
              {s.notes && <div style={{ color: "#4A5568", fontSize: 12.5, lineHeight: 1.6, marginTop: 6 }}>{s.notes}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Reading Session">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Date" type="date" value={form.log_date} onChange={v => setForm(f => ({ ...f, log_date: v }))} />
          <div style={{ display: "flex", gap: 10 }}>
            <Input label="Start Page" type="number" value={form.start_page} onChange={v => setForm(f => ({ ...f, start_page: v }))} placeholder="50" />
            <Input label="End Page" type="number" value={form.end_page} onChange={v => setForm(f => ({ ...f, end_page: v }))} placeholder="70" />
            <Input label="Duration (min)" type="number" value={form.duration_min} onChange={v => setForm(f => ({ ...f, duration_min: v }))} placeholder="30" />
          </div>
          <TextArea label="Highlights / Key Quotes" value={form.highlights} onChange={v => setForm(f => ({ ...f, highlights: v }))} placeholder="Interesting ideas, quotes, insights..." />
          <TextArea label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="General thoughts..." rows={2} />
          <Button variant="solid" color="#93C5FD" onClick={saveSession} disabled={saving}>{saving ? "Saving..." : "Save Session 📖"}</Button>
        </div>
      </Modal>
    </div>
  );
}
