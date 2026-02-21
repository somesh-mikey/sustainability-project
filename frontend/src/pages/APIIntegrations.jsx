import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const nextStatusByCurrent = {
  connected: "disconnected",
  disconnected: "connected",
  syncing: "connected",
  error: "connected"
};

export default function APIIntegrations() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const response = await fetch(`${API_URL}/integrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setItems(data.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadIntegrations();
  }, [token]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = nextStatusByCurrent[currentStatus] || "connected";

    const response = await fetch(`${API_URL}/integrations/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setItems((prev) => prev.map((item) => (item.id === id ? data.data : item)));
    }
  };

  if (loading) {
    return <LoadingState message="Loading integrations..." />;
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">API Integrations</h2>
        <p className="text-zinc-400">Automated data synchronization from connected systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-400">
            No integrations found.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-lg">{item.name}</h3>
              <p className="text-zinc-400 text-sm">{item.description || "No description"}</p>
              <p className="text-sm">
                Status: <span className="capitalize text-green-400">{item.status}</span>
              </p>
              <button
                onClick={() => toggleStatus(item.id, item.status)}
                className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-sm"
              >
                Toggle Status
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
