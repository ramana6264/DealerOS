import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import LocationsPage from "./pages/LocationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
