import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { label: "Home", path: "/dashboard" },
  { label: "Data Submission", path: "/data-submission", roles: ["admin", "manager"] },
  { label: "API Integrations", path: "/api-integrations" },
  { label: "Data Requests", path: "/data-requests" },
  { label: "Dashboards", path: "/dashboards" },
  { label: "Reports", path: "/reports" },
  { label: "Talk With Your Team", path: "/talk-with-team" },
  { label: "Templates", path: "/templates" },
  { label: "Profile & Settings", path: "/profile" }
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
      <h2 className="text-2xl text-green-500 font-semibold leading-tight mb-8">
        Sustainability
        <br />
        Platform
      </h2>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          if (item.roles && (!user || !item.roles.includes(user.role))) {
            return null;
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-base transition-colors ${
                  isActive
                    ? "bg-green-900/30 text-green-400 border-l-4 border-green-500"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="text-sm text-zinc-500 mt-4">
        <p>Manufacturing Sector</p>
        <p>Live Mode</p>
      </div>
    </aside>
  );
}
