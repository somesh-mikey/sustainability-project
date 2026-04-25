import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Bell, MessageSquare, FileText, CheckCircle, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function ClientNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setNotifications(data.data);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id) {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  }

  const totalNotif = notifications.length;
  const unreadNotif = notifications.filter(n => !n.is_read).length;
  const messageNotif = notifications.filter(n => n.type === "message").length;
  const requestNotif = notifications.filter(n => n.type === "data_request").length;

  const typeConfig = {
    message: { icon: <MessageSquare size={18} />, bg: "bg-blue-100", color: "text-blue-600" },
    data_request: { icon: <FileText size={18} />, bg: "bg-orange-100", color: "text-orange-600" },
    report: { icon: <FileText size={18} />, bg: "bg-green-100", color: "text-green-600" },
    system: { icon: <Bell size={18} />, bg: "bg-gray-100", color: "text-gray-600" },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your sustainability data activities.</p>
        </div>
        {unreadNotif > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <CheckCircle size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill label="Total" value={totalNotif} icon={<Bell size={16} />} color="text-gray-600" bg="bg-gray-100" />
        <StatPill label="Unread" value={unreadNotif} icon={<Bell size={16} />} color="text-red-600" bg="bg-red-100" />
        <StatPill label="Messages" value={messageNotif} icon={<MessageSquare size={16} />} color="text-blue-600" bg="bg-blue-100" />
        <StatPill label="Requests" value={requestNotif} icon={<FileText size={16} />} color="text-orange-600" bg="bg-orange-100" />
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bell size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No notifications</h3>
          <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.system;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${
                  notif.is_read ? "border-gray-100" : "border-green-200 bg-green-50/30"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.bg} ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${notif.is_read ? "text-gray-700" : "text-gray-900"}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notif.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-gray-400 hover:text-green-600 transition-colors shrink-0 p-1"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
