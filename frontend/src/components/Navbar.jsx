import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex gap-6">
      <Link to="/">Dashboard</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/emissions">Emissions</Link>

      <button
        onClick={logout}
        className="ml-auto bg-red-600 px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
