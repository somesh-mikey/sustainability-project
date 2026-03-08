import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import ClientLayout from "./layout/ClientLayout";
import Home from "./pages/Home";
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

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAnalytics from "./pages/client/ClientAnalytics";
import ClientDataRequests from "./pages/client/ClientDataRequests";
import ClientMessages from "./pages/client/ClientMessages";
import ClientReports from "./pages/client/ClientReports";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientSettings from "./pages/client/ClientSettings";

import RoleRedirect from "./auth/RoleRedirect";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Client Portal */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="analytics" element={<ClientAnalytics />} />
        <Route path="data-requests" element={<ClientDataRequests />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="reports" element={<ClientReports />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Company / Admin Portal */}
      <Route
        path="/company"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="data-submission" element={<DataSubmission />} />
        <Route path="api-integrations" element={<APIIntegrations />} />
        <Route path="data-requests" element={<DataRequests />} />
        <Route path="reports" element={<Reports />} />
        <Route path="talk-with-team" element={<TalkWithTeam />} />
        <Route path="templates" element={<Templates />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="emissions" element={<Emissions />} />
        <Route path="projects" element={<Projects />} />
      </Route>

      {/* Legacy routes redirect to company portal */}
      <Route path="/dashboard" element={<Navigate to="/company/dashboard" replace />} />
      <Route path="/dashboards" element={<Navigate to="/company/analytics" replace />} />

      {/* Smart root redirect based on role */}
      <Route path="/" element={<RoleRedirect />} />
    </Routes>
  );
}
