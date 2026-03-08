import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { label: "Home", path: "/company/dashboard" },
  { label: "Data Submission", path: "/company/data-submission", roles: ["admin", "manager"] },
  { label: "API Integrations", path: "/company/api-integrations" },
  { label: "Data Requests", path: "/company/data-requests" },
  { label: "Analytics", path: "/company/analytics" },
  { label: "Reports", path: "/company/reports" },
  { label: "Talk With Your Team", path: "/company/talk-with-team" },
  { label: "Templates", path: "/company/templates" },
  { label: "Profile & Settings", path: "/company/profile" }
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
