import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import RecentActivityTable from "../components/RecentActivityTable";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        projects: 4,
        emissions: "1.2t",
        reports: 6,
      });

      setActivity([
        { date: "2026-01-18", action: "Project created", status: "Success" },
        { date: "2026-01-17", action: "Emission updated", status: "Pending" },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!stats) {
    return <EmptyState message="No dashboard data available" />;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Projects" value={stats.projects} />
        <StatCard title="Emissions" value={stats.emissions} />
        <StatCard title="Reports" value={stats.reports} />
      </div>

      {/* Recent Activity */}
      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Recent Activity
        </h3>
        <RecentActivityTable data={activity} />
      </section>
    </div>
  );
}
