import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { migrateLocalStorageToSupabase } from "../../lib/migrate.js";
import { THEME, F } from "../../lib/theme.js";

export function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) migrateLocalStorageToSupabase(user.id).catch(() => {});
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: THEME.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 42 }}>⏰</div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: THEME.primary, letterSpacing: 3, fontWeight: 600 }}>LOADING...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
