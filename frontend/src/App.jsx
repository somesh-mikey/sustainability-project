import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Emissions from "./pages/Emissions";
import Projects from "./pages/Projects";
import DataSubmission from "./pages/DataSubmission";
import APIIntegrations from "./pages/APIIntegrations";
import DataRequests from "./pages/DataRequests";
import Reports from "./pages/Reports";
import TalkWithTeam from "./pages/TalkWithTeam";
import Templates from "./pages/Templates";
import ProfileSettings from "./pages/ProfileSettings";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboards" element={<Dashboard />} />
        <Route path="/data-submission" element={<DataSubmission />} />
        <Route path="/api-integrations" element={<APIIntegrations />} />
        <Route path="/data-requests" element={<DataRequests />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/talk-with-team" element={<TalkWithTeam />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/profile" element={<ProfileSettings />} />

        {/* Legacy routes retained */}
        <Route path="/emissions" element={<Emissions />} />
        <Route path="/projects" element={<Projects />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
