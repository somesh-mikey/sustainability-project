import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function Projects() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchProjects() {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setProjects(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), location: location.trim() || null }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setName("");
        setLocation("");
        setShowForm(false);
        fetchProjects();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading projects..." />;

  const statusColor = {
    active: "bg-green-500/20 text-green-400",
    completed: "bg-blue-500/20 text-blue-400",
    archived: "bg-zinc-600/20 text-zinc-400",
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-zinc-400 mt-1">Manage sustainability projects for your organization</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Project Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Green Manufacturing Initiative"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Mumbai, India"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <EmptyState message="No projects yet. Create your first project to start tracking emissions." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <article key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[p.status] || statusColor.active}`}>
                  {p.status}
                </span>
              </div>
              {p.location && <p className="text-zinc-400 text-sm">{p.location}</p>}
              <p className="text-zinc-500 text-xs">Created {new Date(p.created_at).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
