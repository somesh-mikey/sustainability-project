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

const API_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export default function Home() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch(`${API_URL}/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` }
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
    <div className="space-y-6 text-white">
      {/* Company header */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">{user?.organization_name || "Your Organization"}</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/40 text-green-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Active
        </div>
      </section>

      {/* 3 Status cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Data Completeness */}
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-zinc-400 text-sm">Data Completeness</p>
            <CheckCircle2 className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{overview.data_completeness}%</p>
          <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${Math.max(0, Math.min(100, overview.data_completeness || 0))}%` }}
            />
          </div>
          <Link to="/dashboards" className="inline-flex items-center gap-1 text-green-400 text-sm hover:underline">
            View details
            <ArrowRight size={14} />
          </Link>
        </article>

        {/* Carbon Assessment Status */}
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-zinc-400 text-sm">Carbon Assessment Status</p>
            <Clock3 className="text-amber-500" size={24} />
          </div>
          <p className="text-3xl font-bold capitalize">
            {String(overview.carbon_assessment_status || "not_started").replace(/_/g, " ")}
          </p>
          <p className="text-zinc-500 text-sm">Based on current data</p>
          <Link to="/dashboards" className="inline-flex items-center gap-1 text-green-400 text-sm hover:underline">
            View dashboard
            <ArrowRight size={14} />
          </Link>
        </article>

        {/* Net-Zero Status */}
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-zinc-400 text-sm">Net-Zero Status</p>
            <CircleAlert className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold capitalize">
            {String(overview.net_zero_status || "needs_data").replace(/_/g, " ")}
          </p>
          <p className="text-zinc-500 text-sm">{missingDataPoints} data points missing</p>
          <Link to="/data-requests" className="inline-flex items-center gap-1 text-orange-400 text-sm hover:underline">
            View requests
            <ArrowRight size={14} />
          </Link>
        </article>
      </section>

      {/* Pending Actions */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Pending Actions</h3>

        <div className="rounded-xl border border-orange-800/50 bg-orange-950/30 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <FileQuestion className="text-orange-400" size={22} />
            <div>
              <p className="font-medium">{pendingRequests} Data Requests Pending</p>
              <p className="text-zinc-400 text-sm">Requires immediate attention</p>
            </div>
          </div>
          <Link
            to="/company/data-requests"
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            View
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-xl border border-green-800/50 bg-green-950/30 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <CheckCircle2 className="text-green-500" size={22} />
            <div>
              <p className="font-medium">{readyReports} Report Ready</p>
              <p className="text-zinc-400 text-sm">Available for download</p>
            </div>
          </div>
          <Link
            to="/company/reports"
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Download
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3 Quick action cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          to="/company/data-submission"
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white p-6 flex flex-col gap-2 shadow-sm"
        >
          <Upload size={28} />
          <p className="text-lg font-semibold">Submit Data</p>
          <p className="text-white/80 text-sm">Enter new sustainability data</p>
        </Link>

        <Link
          to="/company/data-requests"
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white p-6 flex flex-col gap-2 shadow-sm"
        >
          <FileQuestion size={28} />
          <p className="text-lg font-semibold">View Requests</p>
          <p className="text-white/80 text-sm">Respond to pending requests</p>
        </Link>

        <Link
          to="/company/talk-with-team"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-6 flex flex-col gap-2 shadow-sm"
        >
          <MessageSquare size={28} />
          <p className="text-lg font-semibold">Chat with Team</p>
          <p className="text-white/80 text-sm">Ask questions or get help</p>
        </Link>
      </section>
    </div>
  );
}
