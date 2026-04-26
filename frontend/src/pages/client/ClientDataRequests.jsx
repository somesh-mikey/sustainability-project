import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Clock, CheckCircle } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const TABS = ["All", "Pending", "Uploaded", "Clarification Needed", "Accepted"];
const STATUS_MAP = { "Pending": "pending", "Uploaded": "submitted", "Clarification Needed": "under_review", "Accepted": "closed" };

export default function ClientDataRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch(`${API_URL}/data-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) setRequests(data.data);
      } catch (err) {
        console.error("Error fetching data requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [token]);

  const filtered = activeTab === "All"
    ? requests
    : requests.filter(r => r.status === STATUS_MAP[activeTab]);

  const priorityBadge = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };

  const statusBadge = {
    pending: { bg: "bg-orange-100 text-orange-700", label: "Pending" },
    submitted: { bg: "bg-blue-100 text-blue-700", label: "Uploaded" },
    under_review: { bg: "bg-yellow-100 text-yellow-700", label: "Clarification Needed" },
    closed: { bg: "bg-green-100 text-green-700", label: "Accepted" },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
          <p className="text-gray-500 mt-1">View sustainability data requests from Wefetch.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-xs">
                ({requests.filter(r => r.status === STATUS_MAP[tab]).length})
              </span>
            )}
            {tab === "All" && <span className="ml-1.5 text-xs">({requests.length})</span>}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No requests found</h3>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "All" ? "You don't have any data requests yet." : `No ${activeTab.toLowerCase()} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const status = statusBadge[req.status] || statusBadge.pending;
            const priority = req.priority || "medium";
            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{req.category}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[priority]}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{req.reason || req.description || "Please upload the requested sustainability data."}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Due: {req.deadline ? new Date(req.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No deadline"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
