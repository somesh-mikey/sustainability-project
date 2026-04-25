import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { AlertCircle, CheckCircle, Clock, MessageSquare, Upload, Eye, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function ClientDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ pendingRequests: 0, uploadCompletion: 0, lastUpload: null, newMessages: 0 });
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [overviewRes, requestsRes, messagesRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/overview`, { headers }),
          fetch(`${API_URL}/data-requests?status=pending`, { headers }),
          fetch(`${API_URL}/messages`, { headers }),
        ]);

        const [overviewData, requestsData, messagesData] = await Promise.all([
          overviewRes.json(), requestsRes.json(), messagesRes.json()
        ]);

        if (overviewRes.ok && overviewData.success) {
          setStats(prev => ({
            ...prev,
            pendingRequests: overviewData.data.pending_data_requests || 0,
            uploadCompletion: overviewData.data.data_completeness || 0,
          }));
        }

        if (requestsRes.ok && requestsData.success) {
          setUrgentRequests(requestsData.data.slice(0, 3));
          setStats(prev => ({ ...prev, pendingRequests: requestsData.data.length }));
        }

        if (messagesRes.ok && messagesData.success) {
          setRecentMessages(messagesData.data.slice(-3).reverse());
          setStats(prev => ({ ...prev, newMessages: messagesData.data.length }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const priorityColor = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };

  const statusColor = {
    pending: "text-gray-600",
    submitted: "text-blue-600",
    under_review: "text-yellow-600",
    closed: "text-green-600",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your sustainability data.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard icon={<AlertCircle className="text-red-500" size={24} />} label="Pending Data Requests" value={stats.pendingRequests} valueColor="text-red-500" />
        <StatCard icon={<CheckCircle className="text-green-500" size={24} />} label="Upload Completion" value={`${stats.uploadCompletion}%`} valueColor="text-green-600" />
        <StatCard icon={<Clock className="text-blue-500" size={24} />} label="Last Upload" value={stats.lastUpload || "2 days ago"} valueColor="text-blue-600" />
        <StatCard icon={<MessageSquare className="text-purple-500" size={24} />} label="New Messages" value={stats.newMessages} valueColor="text-purple-600" />
      </div>

      {/* Two-column: Urgent Requests + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Data Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Urgent Data Requests</h2>
            <Link to="/client/data-requests" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {urgentRequests.length === 0 ? (
              <p className="text-gray-400 text-sm">No pending requests</p>
            ) : (
              urgentRequests.map((req) => (
                <div key={req.id} className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{req.category}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[req.priority] || "bg-gray-100 text-gray-600"}`}>
                        {req.priority ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1) : "Medium"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {req.deadline ? new Date(req.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No deadline"}
                      </span>
                      <span className={statusColor[req.status] || "text-gray-500"}>
                        {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1).replace("_", " ") : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <Link to="/client/messages" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <p className="text-gray-400 text-sm">No messages yet</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Wefetch Team</p>
                    <p className="font-medium text-gray-900">{msg.content?.slice(0, 60)}{msg.content?.length > 60 ? "..." : ""}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {!msg.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/client/data-requests" className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 transition-colors">
          <Upload size={28} className="mb-3" />
          <h3 className="font-semibold text-lg">Upload Data</h3>
          <p className="text-green-100 text-sm mt-1">Submit requested sustainability data</p>
        </Link>
        <Link to="/client/data-requests" className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-6 transition-colors">
          <Eye size={28} className="mb-3" />
          <h3 className="font-semibold text-lg">View Requests</h3>
          <p className="text-green-100 text-sm mt-1">See all data requests from Wefetch</p>
        </Link>
        <Link to="/client/reports" className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl p-6 transition-colors border border-gray-200">
          <FileText size={28} className="mb-3 text-gray-600" />
          <h3 className="font-semibold text-lg">Request a Report</h3>
          <p className="text-gray-500 text-sm mt-1">Get custom sustainability reports</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, valueColor = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-3">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
