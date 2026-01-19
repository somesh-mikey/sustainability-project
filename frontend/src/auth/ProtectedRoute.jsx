import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

//sustability-frontend/src/auth/ProtectedRoute.jsx

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restriction
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
