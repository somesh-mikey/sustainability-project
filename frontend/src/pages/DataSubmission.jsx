import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const scopes = ["scope_1", "scope_2", "scope_3"];

export default function DataSubmission() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    project_id: "",
    date: "",
    scope: "",
    activity_type: "",
    value: "",
    unit: ""
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitManual = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/emissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          project_id: Number(form.project_id),
          value: Number(form.value)
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data?.error?.message || "Failed to submit emission");
        return;
      }

      setMessage("Emission submitted successfully");
      setForm({
        project_id: "",
        date: "",
        scope: "",
        activity_type: "",
        value: "",
        unit: ""
      });
    } catch {
      setMessage("Failed to submit emission");
    }
  };

  const submitCSV = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Select a CSV file first");
      return;
    }

    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(`${API_URL}/upload/emissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data?.error?.message || "CSV upload failed");
        return;
      }

      setMessage(`CSV upload complete: inserted ${data.data.inserted}, failed ${data.data.failed}`);
      setFile(null);
    } catch {
      setMessage("CSV upload failed");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Data Submission</h2>
        <p className="text-zinc-400">Submit sustainability data manually or via CSV.</p>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Manual Entry</h3>

        <form onSubmit={submitManual} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            placeholder="Project ID"
            value={form.project_id}
            onChange={(event) => updateField("project_id", event.target.value)}
          />
          <input
            type="date"
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
          <select
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            value={form.scope}
            onChange={(event) => updateField("scope", event.target.value)}
          >
            <option value="">Select scope</option>
            {scopes.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            placeholder="Activity Type"
            value={form.activity_type}
            onChange={(event) => updateField("activity_type", event.target.value)}
          />
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            placeholder="Value"
            type="number"
            value={form.value}
            onChange={(event) => updateField("value", event.target.value)}
          />
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            placeholder="Unit"
            value={form.unit}
            onChange={(event) => updateField("unit", event.target.value)}
          />

          <button
            type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
          >
            Submit Data
          </button>
        </form>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">CSV Upload</h3>

        <form onSubmit={submitCSV} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="text-zinc-300"
          />
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium">
            Upload CSV
          </button>
        </form>
      </section>

      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
