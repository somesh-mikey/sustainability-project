import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const tabs = ["all", "pending", "submitted", "under_review", "closed"];

export default function DataRequests() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);

      const url = statusFilter === "all"
        ? `${API_URL}/data-requests`
        : `${API_URL}/data-requests?status=${statusFilter}`;

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setRequests(data.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [statusFilter, token]);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests]
  );

  if (loading) {
    return <LoadingState message="Loading data requests..." />;
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Data Requests</h2>
        <p className="text-zinc-400">Respond to requests from your sustainability team.</p>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-sm text-yellow-300">
        Pending requests: {pendingCount}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1 rounded text-sm ${
              tab === statusFilter ? "bg-green-600" : "bg-zinc-800"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-300">
            <tr>
              <th className="text-left p-3">Request ID</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Priority</th>
              <th className="text-left p-3">Deadline</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-zinc-800">
                <td className="p-3">{request.request_id}</td>
                <td className="p-3">{request.category}</td>
                <td className="p-3 capitalize">{request.priority || "-"}</td>
                <td className="p-3">{request.deadline ? new Date(request.deadline).toLocaleDateString() : "-"}</td>
                <td className="p-3 capitalize">{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
