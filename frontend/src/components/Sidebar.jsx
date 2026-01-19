import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">
      <h2 className="text-xl font-bold mb-8">Sustainability</h2>

      <nav className="space-y-3">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>

        {(user.role === "admin" || user.role === "manager") && (
          <NavLink to="/emissions">Emissions</NavLink>
        )}

        {user.role === "admin" && (
          <NavLink to="/admin">Admin</NavLink>
        )}
      </nav>
    </aside>
  );
}
