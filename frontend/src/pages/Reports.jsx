import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Reports() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  const [filters, setFilters] = useState({
    project_id: "",
    scope: "",
    from: "",
    to: ""
  });

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setReports(data.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [token]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = async (type) => {
    const response = await fetch(`${API_URL}/reports/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(filters)
    });

    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report.${type}`;
    link.click();

    const refreshed = await fetch(`${API_URL}/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const refreshedData = await refreshed.json();
    if (refreshed.ok && refreshedData.success) {
      setReports(refreshedData.data);
    }
  };

  if (loading) {
    return <LoadingState message="Loading reports..." />;
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Reports</h2>
        <p className="text-zinc-400">Request and download sustainability reports.</p>
      </div>

      {(user?.role === "admin" || user?.role === "manager") && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-medium">Generate Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Project ID"
              value={filters.project_id}
              onChange={(event) => updateFilter("project_id", event.target.value)}
            />
            <input
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Scope"
              value={filters.scope}
              onChange={(event) => updateFilter("scope", event.target.value)}
            />
            <input
              type="date"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
            />
            <input
              type="date"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => generateReport("csv")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Generate CSV
            </button>
            <button
              onClick={() => generateReport("pdf")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Generate PDF
            </button>
          </div>
        </section>
      )}

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-300">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Requested Date</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-zinc-800">
                <td className="p-3">{report.file_name || report.file_path}</td>
                <td className="p-3 uppercase">{report.type}</td>
                <td className="p-3">{new Date(report.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <a
                    href={`${API_URL}/reports/${report.id}/download`}
                    className="text-green-400 hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
