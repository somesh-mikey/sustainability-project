import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "client") return <Navigate to="/client/dashboard" replace />;

  return <Navigate to="/company/dashboard" replace />;
}
