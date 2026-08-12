import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getChallans,
  type Challan,
  type ChallanStatus,
} from "../api/challans.api";

const Challans = () => {
  const navigate = useNavigate();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<ChallanStatus | "">("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  const loadChallans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getChallans({
        page,
        limit,
        status: status || undefined,
      });

      setChallans(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Challans error:", err);
      setError("Unable to load challans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallans();
  }, [page, status]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPage(1);

    if (page === 1) {
      loadChallans();
    }
  };

  const filteredChallans = challans.filter(
    (challan) => {
      const value = search.trim().toLowerCase();

      if (!value) return true;

      return (
        challan.challanNumber
          .toLowerCase()
          .includes(value) ||
        challan.customer?.name
          ?.toLowerCase()
          .includes(value) ||
        challan.customer?.businessName
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

  const getStatusClasses = (
    challanStatus: ChallanStatus
  ) => {
    switch (challanStatus) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      case "DRAFT":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText
              size={22}
              className="text-slate-700"
            />

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Challans
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Create, manage and track customer challans.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/challans/new")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Create Challan
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <form
            onSubmit={handleSearch}
            className="relative flex-1"
          >
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search challan number or customer..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value as
                  | ChallanStatus
                  | ""
              );

              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">
              Confirmed
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Challan
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Items
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Qty
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <tr key={index}>
                      {Array.from({
                        length: 7,
                      }).map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-5 py-4"
                        >
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  )
                )
              ) : filteredChallans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <FileText
                      size={30}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No challans found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first challan to
                      get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredChallans.map(
                  (challan) => (
                    <tr
                      key={challan.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Challan */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {challan.challanNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {challan.customer
                              ?.name ??
                              "Unknown Customer"}
                          </p>

                          {challan.customer
                            ?.businessName && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                challan
                                  .customer
                                  .businessName
                              }
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm text-slate-600">
                          {challan.items?.length ??
                            0}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">
                          {challan.totalQuantity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            challan.status
                          )}`}
                        >
                          {challan.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500">
                          {new Date(
                            challan.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            title="View challan"
                            onClick={() =>
                              navigate(
                                `/challans/${challan.id}`
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading &&
          filteredChallans.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    page * limit,
                    total
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {total}
                </span>{" "}
                challans
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) => current - 1
                    )
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="min-w-16 text-center text-sm text-slate-600">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) => current + 1
                    )
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Challans;