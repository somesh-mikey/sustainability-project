import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";
const tabs = ["all", "pending", "submitted", "under_review", "closed"];
const statusFlow = {
  pending: ["submitted", "under_review", "closed"],
  submitted: ["under_review", "closed"],
  under_review: ["submitted", "closed"],
  closed: []
};

export default function DataRequests() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [recipientOrgId, setRecipientOrgId] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    category: "",
    reason: "",
    priority: "medium",
    deadline: ""
  });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ type: "", message: "" }), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

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

  useEffect(() => {
    loadRequests();
  }, [statusFilter, token]);

  useEffect(() => {
    async function loadOrganizations() {
      if (user?.role !== "admin" && user?.role !== "manager") {
        return;
      }

      const response = await fetch(`${API_URL}/data-requests/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setOrganizations(data.data);
        if (data.data.length > 0) {
          setRecipientOrgId(String(data.data[0].id));
        }
      }
    }

    loadOrganizations();
  }, [token, user?.role]);

  async function handleSendRequest(event) {
    event.preventDefault();
    if (!form.category.trim()) return;
    if (!recipientOrgId) {
      setToast({ type: "error", message: "Please select a recipient company." });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/data-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: form.category.trim(),
          reason: form.reason.trim() || null,
          priority: form.priority,
          deadline: form.deadline || null,
          recipient_organization_id: Number(recipientOrgId)
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setForm({ category: "", reason: "", priority: "medium", deadline: "" });
        setToast({ type: "success", message: "Data request sent successfully." });
        await loadRequests();
      } else {
        setToast({ type: "error", message: data?.message || "Failed to send request." });
      }
    } catch {
      setToast({ type: "error", message: "Failed to send request." });
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(id, nextStatus) {
    try {
      const response = await fetch(`${API_URL}/data-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setRequests((prev) => prev.map((request) => (
          request.id === id ? data.data : request
        )));
        setToast({ type: "success", message: `Request marked ${nextStatus.replace("_", " ")}.` });
      } else {
        setToast({ type: "error", message: data?.message || "Failed to update status." });
      }
    } catch {
      setToast({ type: "error", message: "Failed to update status." });
    }
  }

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests]
  );

  if (loading) {
    return <LoadingState message="Loading data requests..." />;
  }

  return (
    <div className="space-y-6 text-white relative">
      <div>
        <h2 className="text-2xl font-semibold">Data Requests</h2>
        <p className="text-zinc-400">Send data requests from admin side and handle them here.</p>
      </div>

      {toast.message && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`min-w-[280px] max-w-[360px] rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "bg-green-900/95 border-green-700 text-green-200"
                : "bg-red-900/95 border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast({ type: "", message: "" })}
                className="shrink-0 text-current/80 hover:text-current leading-none"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSendRequest} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium">Send New Request</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={recipientOrgId}
            onChange={(event) => setRecipientOrgId(event.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={String(organization.id)}>
                {organization.name}
              </option>
            ))}
          </select>
          <input
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            placeholder="Category"
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            required
          />
          <select
            value={form.priority}
            onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={form.deadline}
            onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded px-3 py-2 font-medium"
          >
            {sending ? "Sending..." : "Send Request"}
          </button>
        </div>
        <textarea
          value={form.reason}
          onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          placeholder="Reason / instructions"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 min-h-[88px]"
        />
      </form>

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
              <th className="text-left p-3">Recipient</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Priority</th>
              <th className="text-left p-3">Deadline</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-zinc-800">
                <td className="p-3">{request.request_id}</td>
                <td className="p-3">{request.recipient_organization_name || "-"}</td>
                <td className="p-3">{request.category}</td>
                <td className="p-3 capitalize">{request.priority || "-"}</td>
                <td className="p-3">{request.deadline ? new Date(request.deadline).toLocaleDateString() : "-"}</td>
                <td className="p-3 capitalize">{request.status}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {(statusFlow[request.status] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => updateStatus(request.id, nextStatus)}
                        className="text-xs px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
                      >
                        Mark {nextStatus.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
