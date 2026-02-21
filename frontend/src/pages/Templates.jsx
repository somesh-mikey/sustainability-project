import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const tabs = ["All Templates", "Manufacturing", "IT / Services"];

export default function Templates() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Templates");
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch(`${API_URL}/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTemplates(data.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, [token]);

  const filtered = useMemo(() => {
    if (activeTab === "All Templates") {
      return templates;
    }

    return templates.filter((template) => template.sector === activeTab);
  }, [activeTab, templates]);

  if (loading) {
    return <LoadingState message="Loading templates..." />;
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Templates</h2>
        <p className="text-zinc-400">Download structured templates for sustainability data input.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-sm ${
              tab === activeTab ? "bg-green-600" : "bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <article key={template.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-zinc-400">Category: {template.category}</p>
            <p className="text-sm text-zinc-400">Sector: {template.sector}</p>
            <a
              href={`${API_URL}/templates/download/${template.file}`}
              className="inline-block bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Download
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
