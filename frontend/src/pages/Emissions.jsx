import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function Emissions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emissions, setEmissions] = useState([]);
  const [scopeFilter, setScopeFilter] = useState("");

  useEffect(() => {
    async function fetchEmissions() {
      try {
        const qs = scopeFilter ? `?scope=${scopeFilter}` : "";
        const res = await fetch(`${API_URL}/emissions${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) setEmissions(data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchEmissions();
  }, [token, scopeFilter]);

  if (loading) return <LoadingState message="Loading emissions..." />;

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Emissions</h2>
          <p className="text-zinc-400 mt-1">All recorded emission entries for your organization</p>
        </div>

        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Scopes</option>
          <option value="scope_1">Scope 1</option>
          <option value="scope_2">Scope 2</option>
          <option value="scope_3">Scope 3</option>
        </select>
      </div>

      {emissions.length === 0 ? (
        <EmptyState message="No emission records found. Use Data Submission to add entries." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">CO₂e</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {emissions.map((e) => (
                <tr key={e.raw_emission_id} className="hover:bg-zinc-900/60">
                  <td className="px-4 py-3">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{e.project_name}</td>
                  <td className="px-4 py-3 capitalize">{String(e.scope).replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 capitalize">{e.activity_type}</td>
                  <td className="px-4 py-3">{Number(e.value).toLocaleString()}</td>
                  <td className="px-4 py-3">{e.unit}</td>
                  <td className="px-4 py-3 font-medium">
                    {e.calculated_value != null ? `${Number(e.calculated_value).toLocaleString()} tonnes` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
