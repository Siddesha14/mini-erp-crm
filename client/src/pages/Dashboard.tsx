import { useEffect, useState } from "react";
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardSummary } from "../api/dashboard.api";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Unable to load dashboard."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={summary.customers}
          description="Total customers"
          icon={Users}
        />

        <StatCard
          title="Products"
          value={summary.products}
          description="Products in catalog"
          icon={Package}
        />

        <StatCard
          title="Low Stock"
          value={summary.lowStockProducts}
          description="Products requiring attention"
          icon={AlertTriangle}
        />

        <StatCard
          title="Challans"
          value={summary.challans}
          description="Total challans"
          icon={FileText}
        />
      </div>

      {/* LOWER SECTION */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* LOW STOCK */}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Low Stock Alerts
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Products that need attention
              </p>
            </div>

            <AlertTriangle
              size={19}
              className="text-amber-500"
            />
          </div>

          {summary.lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No low-stock products 🎉
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {product.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {product.sku} · {product.warehouse}
                    </p>
                  </div>

                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {product.currentStock}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      min {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT CHALLANS */}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Challans
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Latest delivery documents
              </p>
            </div>

            <FileText
              size={19}
              className="text-slate-500"
            />
          </div>

          {summary.recentChallans.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No challans created yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.recentChallans.map((challan) => (
                <div
                  key={challan.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {challan.challanNumber}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {challan.customer.businessName ||
                        challan.customer.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {challan.totalQuantity} items
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {challan.status}
                      </p>
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;