import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { TopBar } from "./TopBar.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { THEME } from "../../lib/theme.js";

export function AppShell() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>
        <TopBar mobile />
        <main style={{ flex: 1, paddingBottom: 16 }}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: THEME.bg }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <main style={{ padding: "0 32px 64px", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
