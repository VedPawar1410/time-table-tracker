import { useState, useEffect, useCallback, useRef } from "react";
import { FONTS } from "../../../lib/constants.js";
import { getProgressPhotos, uploadProgressPhoto, deleteProgressPhoto } from "../../../lib/db.js";
import { supabase } from "../../../lib/supabase.js";

function todayKey() { return new Date().toISOString().split("T")[0]; }

function getPublicUrl(path) {
  const { data } = supabase.storage.from("gym-photos").getPublicUrl(path);
  return data.publicUrl;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function groupPhotosByMonth(photos) {
  const groups = {};
  for (const p of photos) {
    const [year, month] = p.photo_date.split("-");
    const key = `${year}-${month}`;
    if (!groups[key]) groups[key] = { label: `${MONTH_NAMES[parseInt(month) - 1]} ${year}`, photos: [] };
    groups[key].photos.push(p);
  }
  return Object.values(groups);
}

export function PhotosTab({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState(null); // photo object
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const fileRef = useRef();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setPhotos(await getProgressPhotos(userId)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadProgressPhoto(userId, todayKey(), file);
      await load();
    } catch (e) {
      setError(e.message || "Upload failed. Make sure the gym-photos bucket exists in Supabase Storage.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await deleteProgressPhoto(photo.id, photo.storage_path);
      setPhotos(ps => ps.filter(p => p.id !== photo.id));
      setViewer(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCompareSelect = (photo) => {
    if (!compareA) { setCompareA(photo); return; }
    if (compareA.id === photo.id) { setCompareA(null); return; }
    setCompareB(photo);
  };

  const groups = groupPhotosByMonth(photos);

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ padding: "9px 18px", background: "#3B82F6", border: "none", borderRadius: 10, color: "#fff", fontFamily: FONTS.syne, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? "Uploading..." : "📷 Upload Today's Photo"}
        </button>
        <button
          onClick={() => { setCompareMode(!compareMode); setCompareA(null); setCompareB(null); }}
          style={{ padding: "9px 18px", background: compareMode ? "rgba(59,130,246,0.2)" : "rgba(30,41,59,0.6)", border: `1px solid ${compareMode ? "#3B82F6" : "#1E293B"}`, borderRadius: 10, color: compareMode ? "#3B82F6" : "#64748B", fontFamily: FONTS.sans, fontSize: 13, cursor: "pointer" }}
        >
          Compare
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: "none" }} />
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "#2D0000", border: "1px solid #B91C1C", borderRadius: 8, color: "#FCA5A5", fontSize: 12, fontFamily: FONTS.sans }}>{error}</div>
      )}

      {compareMode && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, fontSize: 12, color: "#64748B", fontFamily: FONTS.sans }}>
          {!compareA ? "Tap a photo to select the first image for comparison"
            : !compareB ? `Selected: ${compareA.photo_date} — now tap another photo`
            : null}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.mono, fontSize: 12 }}>Loading photos...</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(59,130,246,0.15)", borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
          <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 16, color: "#F1F5F9", marginBottom: 6 }}>No progress photos yet</div>
          <div style={{ color: "#475569", fontSize: 13, fontFamily: FONTS.sans }}>Upload one photo per day to track your physique progress</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groups.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>{group.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {group.photos.map(photo => {
                  const url = getPublicUrl(photo.storage_path);
                  const isCompareA = compareA?.id === photo.id;
                  const isCompareB = compareB?.id === photo.id;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => compareMode ? handleCompareSelect(photo) : setViewer(photo)}
                      style={{
                        aspectRatio: "3/4", borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative",
                        border: `2px solid ${isCompareA ? "#3B82F6" : isCompareB ? "#A78BFA" : "transparent"}`,
                        boxShadow: isCompareA || isCompareB ? "0 0 0 2px rgba(59,130,246,0.3)" : "none",
                      }}
                    >
                      <img src={url} alt={photo.photo_date} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 6px", background: "linear-gradient(transparent,rgba(0,0,0,0.7))", fontSize: 9, color: "#E2E8F0", fontFamily: FONTS.mono, textAlign: "center" }}>
                        {photo.photo_date.slice(5)} {/* MM-DD */}
                      </div>
                      {(isCompareA || isCompareB) && (
                        <div style={{ position: "absolute", top: 4, right: 4, background: isCompareA ? "#3B82F6" : "#A78BFA", borderRadius: 4, padding: "2px 5px", fontSize: 9, color: "#fff", fontFamily: FONTS.mono }}>
                          {isCompareA ? "A" : "B"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare view */}
      {compareMode && compareA && compareB && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", flexShrink: 0 }}>
            <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>Before / After</span>
            <button onClick={() => { setCompareMode(false); setCompareA(null); setCompareB(null); }} style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #1E293B", borderRadius: 8, color: "#94A3B8", fontFamily: FONTS.sans, fontSize: 13, padding: "6px 14px", cursor: "pointer" }}>Close</button>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 4px 20px", overflow: "hidden" }}>
            {[compareA, compareB].map((p, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ textAlign: "center", padding: "6px", fontSize: 12, color: i === 0 ? "#3B82F6" : "#A78BFA", fontFamily: FONTS.mono }}>{p.photo_date}</div>
                <img src={getPublicUrl(p.storage_path)} alt={p.photo_date} style={{ flex: 1, width: "100%", objectFit: "contain" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen viewer */}
      {viewer && !compareMode && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column" }} onClick={() => setViewer(null)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>{viewer.photo_date}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleDelete(viewer)} style={{ background: "rgba(45,0,0,0.8)", border: "1px solid #B91C1C", borderRadius: 8, color: "#FCA5A5", fontFamily: FONTS.sans, fontSize: 12, padding: "6px 12px", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setViewer(null)} style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #1E293B", borderRadius: 8, color: "#94A3B8", fontFamily: FONTS.sans, fontSize: 13, padding: "6px 14px", cursor: "pointer" }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px 20px" }}>
            <img src={getPublicUrl(viewer.storage_path)} alt={viewer.photo_date} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }} />
          </div>
          {viewer.notes && (
            <div style={{ padding: "0 20px 20px", textAlign: "center", fontSize: 13, color: "#64748B", fontFamily: FONTS.sans }}>{viewer.notes}</div>
          )}
        </div>
      )}
    </div>
  );
}
