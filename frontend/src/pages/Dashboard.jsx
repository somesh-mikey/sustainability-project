import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileQuestion,
  MessageSquare,
  Upload,
  ArrowRight
} from "lucide-react";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch(`${API_URL}/dashboard/overview`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setOverview(data.data);
        } else {
          setOverview(null);
        }
      } catch {
        setOverview(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [token]);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!overview) {
    return <EmptyState message="No dashboard data available" />;
  }

  const pendingRequests = Number(overview.pending_data_requests || 0);
  const readyReports = Number(overview.ready_reports || 0);
  const missingDataPoints = Math.max(0, 100 - Number(overview.data_completeness || 0));

  return (
    <div className="-m-6 p-8 min-h-full bg-slate-100 text-slate-800 space-y-8">
      <section className="space-y-3">
        <h2 className="text-3xl font-semibold">ABC Manufacturing Ltd.</h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-2xl">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Live Reporting Mode
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-slate-600 text-2xl">Data Completeness</p>
            <CheckCircle2 className="text-green-500" size={36} />
          </div>
          <p className="text-4xl font-semibold">{overview.data_completeness}%</p>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${Math.max(0, Math.min(100, overview.data_completeness || 0))}%` }}
            />
          </div>
          <Link to="/dashboards" className="inline-flex items-center gap-1 text-green-600 text-2xl hover:underline">
            View details
            <ArrowRight size={20} />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-slate-600 text-2xl">Carbon Assessment Status</p>
            <Clock3 className="text-amber-500" size={36} />
          </div>
          <p className="text-4xl font-semibold capitalize">{String(overview.carbon_assessment_status || "in_progress").replace("_", " ")}</p>
          <p className="text-slate-500 text-2xl">Last updated: Dec 10, 2024</p>
          <Link to="/dashboards" className="inline-flex items-center gap-1 text-green-600 text-2xl hover:underline">
            View dashboard
            <ArrowRight size={20} />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-slate-600 text-2xl">Net-Zero Status</p>
            <CircleAlert className="text-orange-500" size={36} />
          </div>
          <p className="text-4xl font-semibold capitalize">{String(overview.net_zero_status || "needs_data").replace("_", " ")}</p>
          <p className="text-slate-500 text-2xl">{missingDataPoints} data points missing</p>
          <Link to="/data-requests" className="inline-flex items-center gap-1 text-orange-500 text-2xl hover:underline">
            View requests
            <ArrowRight size={20} />
          </Link>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-3xl font-semibold">Pending Actions</h3>

        <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <FileQuestion className="text-orange-600" size={34} />
            <div>
              <p className="text-3xl font-medium">{pendingRequests} Data Requests Pending</p>
              <p className="text-slate-600 text-2xl">Requires immediate attention</p>
            </div>
          </div>
          <Link to="/data-requests" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-2xl font-medium">
            View
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <CheckCircle2 className="text-green-600" size={34} />
            <div>
              <p className="text-3xl font-medium">{readyReports} Report Ready</p>
              <p className="text-slate-600 text-2xl">Available for download</p>
            </div>
          </div>
          <Link to="/reports" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-2xl font-medium">
            Download
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Link to="/data-submission" className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-7 min-h-44 flex flex-col justify-center gap-2 shadow-sm">
          <Upload size={38} />
          <p className="text-3xl font-semibold">Submit Data</p>
          <p className="text-white/90 text-2xl">Enter new sustainability data</p>
        </Link>

        <Link to="/data-requests" className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white p-7 min-h-44 flex flex-col justify-center gap-2 shadow-sm">
          <FileQuestion size={38} />
          <p className="text-3xl font-semibold">View Requests</p>
          <p className="text-white/90 text-2xl">Respond to pending requests</p>
        </Link>

        <Link to="/talk-with-team" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-7 min-h-44 flex flex-col justify-center gap-2 shadow-sm">
          <MessageSquare size={38} />
          <p className="text-3xl font-semibold">Chat with Team</p>
          <p className="text-white/90 text-2xl">Ask questions or get help</p>
        </Link>
      </section>
    </div>
  );
}
