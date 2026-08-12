import { useEffect, useState } from "react";
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardSummary } from "../api/dashboard.api";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          className: "bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };

      case "CANCELLED":
        return {
          className: "bg-red-50 text-red-700",
          icon: XCircle,
        };

      case "DRAFT":
      default:
        return {
          className: "bg-amber-50 text-amber-700",
          icon: Clock3,
        };
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded-lg bg-slate-200" />

          <div className="h-4 w-72 rounded bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-xl bg-slate-200"
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-80 rounded-xl bg-slate-200" />
            <div className="h-80 rounded-xl bg-slate-200" />
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
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening with your business today.
            </p>
          </div>
        </div>
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
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Low Stock Alerts
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Products that need attention
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-2">
              <AlertTriangle
                size={18}
                className="text-amber-500"
              />
            </div>
          </div>

          {summary.lowStockItems.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 rounded-full bg-emerald-50 p-3">
                <CheckCircle2
                  size={22}
                  className="text-emerald-600"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Inventory looks good
              </p>

              <p className="mt-1 text-xs text-slate-400">
                No low-stock products right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {product.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {product.sku} · {product.warehouse}
                    </p>
                  </div>

                  <div className="ml-4 flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {product.currentStock}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        min {product.minStock}
                      </p>
                    </div>

                    <div className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                      Low
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT CHALLANS */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Challans
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Latest delivery documents
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2">
              <FileText
                size={18}
                className="text-slate-600"
              />
            </div>
          </div>

          {summary.recentChallans.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3">
                <FileText
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                No challans yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Created challans will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.recentChallans.map((challan) => {
                const status = getStatusStyles(challan.status);
                const StatusIcon = status.icon;

                return (
                  <button
                    key={challan.id}
                    type="button"
                    onClick={() =>
                      navigate(`/challans/${challan.id}`)
                    }
                    className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-950">
                          {challan.challanNumber}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}
                        >
                          <StatusIcon size={11} />
                          {challan.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {challan.customer.businessName ||
                          challan.customer.name}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">
                          {challan.totalQuantity} items
                        </p>

                        <p className="text-[11px] text-slate-400">
                          View details
                        </p>
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;