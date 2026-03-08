import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  MessageSquare,
  ClipboardList,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
  { label: "Analytics", path: "/client/analytics", icon: BarChart3 },
  { label: "Data Requests", path: "/client/data-requests", icon: ClipboardList },
  { label: "Messages", path: "/client/messages", icon: MessageSquare },
  { label: "Reports", path: "/client/reports", icon: FileText },
  { label: "Notifications", path: "/client/notifications", icon: Bell },
  { label: "Settings", path: "/client/settings", icon: Settings },
];

export default function ClientSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-6">
        <h2 className="text-xl font-bold text-green-600">Wefetch</h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
