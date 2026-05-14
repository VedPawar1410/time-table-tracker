import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { migrateLocalStorageToSupabase } from "../../lib/migrate.js";
import { FONTS } from "../../lib/constants.js";

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
      <div style={{ minHeight: "100vh", background: "#08091A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: "#4ADE80", letterSpacing: 3 }}>LOADING...</div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
