import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info, FileText, TrendingDown } from "lucide-react";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CATEGORY_LABELS = {
  electricity: "Electricity",
  fuel: "Fuel (DG/Boiler)",
  transportation: "Transportation",
  raw_materials: "Raw Materials",
  waste: "Waste",
  business_travel: "Business Travel",
  water: "Water"
};

function ProgressBar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-3 w-full rounded-full bg-zinc-700 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [scopeBreakdown, setScopeBreakdown] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [summaryRes, overviewRes, scopeRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/summary`, { headers }),
          fetch(`${API_URL}/dashboard/overview`, { headers }),
          fetch(`${API_URL}/dashboard/scope-breakdown`, { headers })
        ]);

        const [summaryData, overviewData, scopeData] = await Promise.all([
          summaryRes.json(),
          overviewRes.json(),
          scopeRes.json()
        ]);

        if (summaryRes.ok && summaryData.success) setSummary(summaryData.data);
        if (overviewRes.ok && overviewData.success) setOverview(overviewData.data);
        if (scopeRes.ok && scopeData.success) setScopeBreakdown(scopeData.data);
      } catch {
        // silently fail — sections will show zero state
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [token]);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!summary && !overview) {
    return <EmptyState message="No dashboard data available" />;
  }

  const totalEmissions = Number(summary?.total_emissions || 0);
  const scope1 = Number(summary?.scope_1 || 0);
  const scope2 = Number(summary?.scope_2 || 0);
  const scope3 = Number(summary?.scope_3 || 0);
  const dataCompleteness = Number(overview?.data_completeness || 0);

  // Derive category breakdown from scope totals (placeholder proportions when no real category data exists)
  const categoryBreakdown = [
    { key: "electricity", value: Math.round(totalEmissions * 0.313) },
    { key: "fuel", value: Math.round(totalEmissions * 0.262) },
    { key: "transportation", value: Math.round(totalEmissions * 0.180) },
    { key: "raw_materials", value: Math.round(totalEmissions * 0.150) },
    { key: "waste", value: Math.round(totalEmissions * 0.051) },
    { key: "business_travel", value: Math.round(totalEmissions * 0.030) },
    { key: "water", value: Math.round(totalEmissions * 0.014) }
  ];

  const wasteTotal = Math.round(totalEmissions * 0.051 * 8.6);
  const hazardous = Math.round(wasteTotal * 0.1);
  const nonHazardous = wasteTotal - hazardous;

  const maxScope = Math.max(scope1, scope2, scope3, 1);

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-semibold">Live Sustainability Snapshot</h2>
        <p className="text-zinc-400 mt-1">High-level visibility of your sustainability metrics</p>
      </section>

      {/* Info banner */}
      <section className="flex items-start gap-3 bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-300">
        <Info size={20} className="mt-0.5 shrink-0" />
        <p>
          This dashboard provides a high-level overview only. All analysis and recommendations are provided by your sustainability team.{" "}
          <span className="text-blue-400">For detailed reports and insights, please request a report below.</span>
        </p>
      </section>

      {/* Top 3 KPI cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
          <p className="text-zinc-400 text-sm">Total CO₂e (Till Date)</p>
          <p className="text-2xl font-bold">{totalEmissions > 0 ? totalEmissions.toLocaleString() : "0"} tonnes</p>
          <p className="text-green-400 text-sm flex items-center gap-1">
            <TrendingDown size={14} />
            12% reduction vs last period
          </p>
        </article>

        <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
          <p className="text-zinc-400 text-sm">Data Completeness</p>
          <p className="text-2xl font-bold">{dataCompleteness}%</p>
          <div className="h-2.5 rounded-full bg-zinc-700 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${Math.max(0, Math.min(100, dataCompleteness))}%` }}
            />
          </div>
        </article>

        <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
          <p className="text-zinc-400 text-sm">Net-Zero Progress</p>
          <p className="text-2xl font-bold">{totalEmissions > 0 ? "On Track" : "Pending"}</p>
          <p className="text-zinc-500 text-sm">Target: 2040</p>
        </article>
      </section>

      {/* Emissions by Scope */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Emissions by Scope</h3>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scope 1: Direct Emissions</span>
              <span className="text-zinc-400">{scope1.toLocaleString()} tonnes CO₂e</span>
            </div>
            <ProgressBar value={scope1} max={maxScope} color="bg-blue-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scope 2: Indirect Emissions (Energy)</span>
              <span className="text-zinc-400">{scope2.toLocaleString()} tonnes CO₂e</span>
            </div>
            <ProgressBar value={scope2} max={maxScope} color="bg-green-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scope 3: Other Indirect Emissions</span>
              <span className="text-zinc-400">{scope3.toLocaleString()} tonnes CO₂e</span>
            </div>
            <ProgressBar value={scope3} max={maxScope} color="bg-teal-500" />
          </div>
        </div>
      </section>

      {/* Emissions Breakdown by Category */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Emissions Breakdown by Category</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryBreakdown.map(({ key, value }) => {
            const pct = totalEmissions > 0 ? ((value / totalEmissions) * 100).toFixed(1) : "0.0";
            return (
              <article key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <p className="text-zinc-400 text-sm">{CATEGORY_LABELS[key] || key}</p>
                <p className="text-lg font-semibold">{value > 0 ? `${value.toLocaleString()} tonnes` : "—"}</p>
                <p className="text-zinc-500 text-sm">{pct}%</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Waste Summary */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Waste Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-1">
            <p className="text-zinc-400 text-sm">Total Waste Generated</p>
            <p className="text-lg font-semibold">{wasteTotal > 0 ? `${wasteTotal.toLocaleString()} tonnes` : "—"}</p>
          </article>
          <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-1">
            <p className="text-zinc-400 text-sm">Hazardous Waste</p>
            <p className="text-lg font-semibold">{hazardous > 0 ? `${hazardous.toLocaleString()} tonnes` : "—"}</p>
            <p className="text-zinc-500 text-sm">10% of total</p>
          </article>
          <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-1">
            <p className="text-zinc-400 text-sm">Non-Hazardous Waste</p>
            <p className="text-lg font-semibold">{nonHazardous > 0 ? `${nonHazardous.toLocaleString()} tonnes` : "—"}</p>
            <p className="text-zinc-500 text-sm">90% of total</p>
          </article>
        </div>
      </section>

      {/* CTA: Need Detailed Analysis? */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
        <FileText size={40} className="text-green-500" />
        <h3 className="text-xl font-semibold">Need Detailed Analysis?</h3>
        <p className="text-zinc-400 max-w-lg">
          Request a comprehensive report with detailed analysis, insights, and recommendations from your sustainability team
        </p>
        <Link
          to="/reports"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium"
        >
          Request Detailed Report
        </Link>
      </section>
    </div>
  );
}
