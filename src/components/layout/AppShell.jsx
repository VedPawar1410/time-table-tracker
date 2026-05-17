import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { THEME } from "../../lib/constants.js";

export function AppShell() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: THEME.bg }}>
      {!isMobile && <Sidebar />}

      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        paddingBottom: isMobile ? 70 : 0,
        minHeight: "100vh",
        overflowX: "hidden",
        background: THEME.bg,
      }}>
        <Outlet />
      </main>

      {isMobile && <BottomNav />}
    </div>
  );
}
