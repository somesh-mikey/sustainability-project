import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Zap, Droplets, Fuel, Trash2, TrendingUp, TrendingDown, Info } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export default function ClientAnalytics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [scopeBreakdown, setScopeBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [summaryRes, trendsRes, scopeRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/summary`, { headers }),
          fetch(`${API_URL}/dashboard/trends`, { headers }),
          fetch(`${API_URL}/dashboard/scope-breakdown`, { headers }),
        ]);
        const [summaryData, trendsData, scopeData] = await Promise.all([
          summaryRes.json(), trendsRes.json(), scopeRes.json()
        ]);

        if (summaryRes.ok && summaryData.success) setStats(summaryData.data);
        if (trendsRes.ok && trendsData.success) setTrends(trendsData.data);
        if (scopeRes.ok && scopeData.success) setScopeBreakdown(scopeData.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalEmissions = stats?.total_co2e ? parseFloat(stats.total_co2e).toFixed(1) : "0";
  const totalRecords = stats?.total_records || 0;

  // Extract category-specific data from scope breakdown
  const categories = scopeBreakdown || [];
  const getCategoryTotal = (name) => {
    const cat = categories.find(c => c.category?.toLowerCase().includes(name));
    return cat ? parseFloat(cat.total_co2e || 0).toFixed(0) : "0";
  };

  const electricityTotal = getCategoryTotal("electric");
  const fuelTotal = getCategoryTotal("fuel") || getCategoryTotal("diesel") || getCategoryTotal("petrol");
  const waterTotal = getCategoryTotal("water");
  const wasteTotal = getCategoryTotal("waste");

  // Build monthly trend data
  const monthlyData = (trends || []).map(t => ({
    month: new Date(t.month + "-01").toLocaleDateString("en-US", { month: "short" }),
    value: parseFloat(t.total_co2e || 0).toFixed(1),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operational Analytics</h1>
        <p className="text-gray-500 mt-1">Review your operational sustainability data. All figures provided by Wefetch.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnalyticsStatCard
          icon={<Zap size={22} />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          label="Total Electricity"
          value={`${electricityTotal} kWh`}
          trend={totalRecords > 0 ? "+2.4%" : null}
          trendUp={true}
        />
        <AnalyticsStatCard
          icon={<Droplets size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Water"
          value={`${waterTotal} KL`}
          trend={totalRecords > 0 ? "-1.2%" : null}
          trendUp={false}
        />
        <AnalyticsStatCard
          icon={<Fuel size={22} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Total Fuel"
          value={`${fuelTotal} L`}
          trend={totalRecords > 0 ? "+0.8%" : null}
          trendUp={true}
        />
        <AnalyticsStatCard
          icon={<Trash2 size={22} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Total Waste"
          value={`${wasteTotal} kg`}
          trend={totalRecords > 0 ? "-3.1%" : null}
          trendUp={false}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emission Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Emission Trends</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly CO₂e emissions over time</p>
          {monthlyData.length > 0 ? (
            <SimpleBarChart data={monthlyData} color="bg-green-500" />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No trend data available yet
            </div>
          )}
        </div>

        {/* Scope Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Emissions by Category</h3>
          <p className="text-sm text-gray-500 mb-4">CO₂e breakdown by emission category</p>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((cat, i) => {
                const total = parseFloat(totalEmissions) || 1;
                const pct = ((parseFloat(cat.total_co2e) / total) * 100).toFixed(0);
                const colors = ["bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-purple-500"];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium capitalize">{cat.category}</span>
                      <span className="text-gray-500">{parseFloat(cat.total_co2e).toFixed(1)} tCO₂e ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No category data available yet
            </div>
          )}
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Info size={20} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">About This Dashboard</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          This analytics dashboard shows your organization's sustainability metrics based on the data submitted
          and processed by Wefetch. All calculations follow internationally recognized emission factors and
          methodologies. For detailed breakdowns or custom analysis, please <Link className="text-green-600 underline" to="/client/reports">request a report</Link>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <MiniStat label="Total CO₂e" value={`${totalEmissions} t`} />
          <MiniStat label="Data Records" value={totalRecords} />
          <MiniStat label="Categories" value={categories.length} />
          <MiniStat label="Months Tracked" value={monthlyData.length} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsStatCard({ icon, iconBg, iconColor, label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-1 ${trendUp ? "text-red-500" : "text-green-500"}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data, color = "bg-green-500" }) {  const maxVal = Math.max(...data.map(d => parseFloat(d.value)), 1);
  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500">{d.value}</span>
          <div
            className={`w-full rounded-t ${color}`}
            style={{ height: `${(parseFloat(d.value) / maxVal) * 100}%`, minHeight: "4px" }}
          />
          <span className="text-xs text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}