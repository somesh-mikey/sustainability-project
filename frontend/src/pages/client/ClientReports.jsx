import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

const REPORT_TYPES = [
  { value: "carbon_footprint", label: "Carbon Footprint Report" },
  { value: "energy_audit", label: "Energy Audit Report" },
  { value: "water_usage", label: "Water Usage Report" },
  { value: "waste_management", label: "Waste Management Report" },
  { value: "sustainability_summary", label: "Sustainability Summary" },
  { value: "compliance", label: "Compliance Report" },
  { value: "custom", label: "Custom Report" },
];

export default function ClientReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ report_type: "", description: "" });

  useEffect(() => {
    fetchReports();
  }, [token]);

  async function fetchReports() {
    try {
      const res = await fetch(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setReports(data.data);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.report_type) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccessMsg("Report request submitted successfully!");
        setForm({ report_type: "", description: "" });
        await fetchReports();
      }
    } catch (err) {
      console.error("Report submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const statusBadge = {
    pending: { bg: "bg-yellow-100 text-yellow-700", icon: <Clock size={14} /> },
    generating: { bg: "bg-blue-100 text-blue-700", icon: <FileText size={14} /> },
    completed: { bg: "bg-green-100 text-green-700", icon: <CheckCircle size={14} /> },
    failed: { bg: "bg-red-100 text-red-700", icon: <AlertCircle size={14} /> },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Request sustainability reports and view previous requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Request a Report</h2>
            <p className="text-sm text-gray-500 mb-6">Select a report type and provide any additional details.</p>

            {successMsg && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
                <select
                  value={form.report_type}
                  onChange={(e) => setForm(prev => ({ ...prev, report_type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="">Select report type</option>
                  {REPORT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe any specific requirements, date ranges, or focus areas for the report..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Important</p>
                    <p className="text-xs text-blue-600 mt-0.5">Report generation typically takes 2-3 business days. You'll receive a notification when your report is ready.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !form.report_type}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Requests Sidebar */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Requests</h2>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No reports requested yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(report => {
                  const status = statusBadge[report.status] || statusBadge.pending;
                  return (
                    <div key={report.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {(report.report_type || report.format || "Report").replace(/_/g, " ")}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.bg}`}>
                          {status.icon}
                          {(report.status || "pending").charAt(0).toUpperCase() + (report.status || "pending").slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {report.file_url && (
                        <a href={report.file_url} download className="text-xs text-green-600 hover:underline mt-1 inline-block">
                          Download Report →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
