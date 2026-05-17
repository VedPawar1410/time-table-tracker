import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/auth/AuthGuard.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import Login from "./pages/Login.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import TimetablePage from "./pages/timetable/TimetablePage.jsx";
import OnboardingPage from "./pages/onboarding/OnboardingPage.jsx";
import TrackerPage from "./pages/Tracker.jsx";
import GymPage from "./pages/gym/GymPage.jsx";
import GymSessionDetail from "./pages/gym/GymSessionDetail.jsx";
import JobPrepPage from "./pages/jobprep/JobPrepPage.jsx";
import ReadingPage from "./pages/reading/ReadingPage.jsx";
import BookDetail from "./pages/reading/BookDetail.jsx";
import CatPrepPage from "./pages/catprep/CatPrepPage.jsx";
import VideoEditingPage from "./pages/videditing/VideoEditingPage.jsx";
import SideHustlePage from "./pages/sidehustle/SideHustlePage.jsx";
import HobbiesPage from "./pages/hobbies/HobbiesPage.jsx";
import AnalyticsPage from "./pages/analytics/AnalyticsPage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";
import ManageTasksPage from "./pages/custom/ManageTasksPage.jsx";
import CustomTaskPage from "./pages/custom/CustomTaskPage.jsx";
import DietPage from "./pages/diet/DietPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route path="/"               element={<DashboardPage />} />
        <Route path="/timetable"      element={<TimetablePage />} />
        <Route path="/tracker"        element={<TrackerPage />} />
        <Route path="/gym"            element={<GymPage />} />
        <Route path="/gym/:sessionId" element={<GymSessionDetail />} />
        <Route path="/jobprep"        element={<JobPrepPage />} />
        <Route path="/reading"        element={<ReadingPage />} />
        <Route path="/reading/:bookId" element={<BookDetail />} />
        <Route path="/catprep"        element={<CatPrepPage />} />
        <Route path="/video"          element={<VideoEditingPage />} />
        <Route path="/sidehustle"     element={<SideHustlePage />} />
        <Route path="/hobbies"        element={<HobbiesPage />} />
        <Route path="/analytics"      element={<AnalyticsPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        <Route path="/tasks"          element={<ManageTasksPage />} />
        <Route path="/tasks/:key"     element={<CustomTaskPage />} />
        <Route path="/diet"           element={<DietPage />} />
      </Route>
    </Routes>
  );
}
