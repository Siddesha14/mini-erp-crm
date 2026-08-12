import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  History,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  createStockMovement,
  getStockMovements,
  type StockMovement,
  type StockMovementType,
} from "../api/inventory.api";

import {
  getProducts,
  type Product,
} from "../api/products.api";

const Inventory = () => {
  const [movements, setMovements] = useState<
    StockMovement[]
  >([]);

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] =
    useState<StockMovementType | "">("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showMovementForm, setShowMovementForm] =
    useState(false);

  const [movementLoading, setMovementLoading] =
    useState(false);

  const [movementError, setMovementError] =
    useState("");

  const [movementForm, setMovementForm] = useState({
    productId: "",
    quantity: "",
    type: "IN" as StockMovementType,
    reason: "",
  });

  const limit = 10;

  const loadProducts = async () => {
    try {
      const response = await getProducts({
        page: 1,
        limit: 100,
      });

      setProducts(response.data);
    } catch (err) {
      console.error("Load products error:", err);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStockMovements({
        page,
        limit,
        type: type || undefined,
      });

      setMovements(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Load movements error:", err);
      setError("Unable to load stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [page, type]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPage(1);
  };

  const filteredMovements = movements.filter(
    (movement) => {
      const value = search.trim().toLowerCase();

      if (!value) return true;

      return (
        movement.product.name
          .toLowerCase()
          .includes(value) ||
        movement.product.sku
          .toLowerCase()
          .includes(value) ||
        movement.reason
          .toLowerCase()
          .includes(value) ||
        movement.createdBy.name
          .toLowerCase()
          .includes(value)
      );
    }
  );

  const totalIn = movements
    .filter((movement) => movement.type === "IN")
    .reduce(
      (sum, movement) => sum + movement.quantity,
      0
    );

  const totalOut = movements
    .filter((movement) => movement.type === "OUT")
    .reduce(
      (sum, movement) => sum + movement.quantity,
      0
    );

  const openMovementForm = () => {
    setMovementForm({
      productId: "",
      quantity: "",
      type: "IN",
      reason: "",
    });

    setMovementError("");
    setShowMovementForm(true);
  };

  const closeMovementForm = () => {
    if (movementLoading) return;

    setShowMovementForm(false);
    setMovementError("");
  };

  const handleCreateMovement = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (movementLoading) return;

    setMovementError("");

    const productId = Number(
      movementForm.productId
    );

    const quantity = Number(
      movementForm.quantity
    );

    if (!productId) {
      setMovementError("Please select a product.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setMovementError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    if (!movementForm.reason.trim()) {
      setMovementError("Reason is required.");
      return;
    }

    try {
      setMovementLoading(true);

      await createStockMovement({
        productId,
        quantity,
        type: movementForm.type,
        reason: movementForm.reason.trim(),
      });

      setShowMovementForm(false);
      setMovementError("");

      await loadMovements();
    } catch (err) {
      console.error(
        "Create stock movement error:",
        err
      );

      setMovementError(
        "Unable to create stock movement. Check stock availability and try again."
      );
    } finally {
      setMovementLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package
              size={22}
              className="text-slate-700"
            />

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Inventory
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage stock movements and inventory activity.
          </p>
        </div>

        <button
          type="button"
          onClick={openMovementForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Stock Movement
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Movements
            </span>

            <History
              size={18}
              className="text-slate-500"
            />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Stock In
            </span>

            <ArrowDownToLine
              size={18}
              className="text-emerald-600"
            />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {totalIn}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Stock Out
            </span>

            <ArrowUpFromLine
              size={18}
              className="text-red-600"
            />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {totalOut}
          </p>
        </div>
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
              placeholder="Search product, SKU, reason or user..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </form>

          <select
            value={type}
            onChange={(event) => {
              setType(
                event.target.value as
                  | StockMovementType
                  | ""
              );

              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="">All movements</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Movement Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created By
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map(
                        (_, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-5 py-4"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        )
                      )}
                    </tr>
                  )
                )
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <History
                      size={30}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No stock movements found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first stock movement to
                      see it here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map(
                  (movement) => (
                    <tr
                      key={movement.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {movement.product.name}
                          </p>

                          <p className="mt-0.5 font-mono text-xs text-slate-400">
                            {movement.product.sku}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            movement.type === "IN"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {movement.type === "IN" ? (
                            <ArrowDownToLine
                              size={13}
                            />
                          ) : (
                            <ArrowUpFromLine
                              size={13}
                            />
                          )}

                          {movement.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">
                          {movement.quantity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {movement.reason}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {movement.createdBy.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {movement.createdBy.role}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          movement.createdAt
                        ).toLocaleString("en-IN")}
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
          filteredMovements.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Page{" "}
                <span className="font-medium text-slate-700">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {totalPages}
                </span>
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

      {/* Stock Movement Modal */}
      {showMovementForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeMovementForm();
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Stock Movement
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add or remove stock from a product.
                </p>
              </div>

              <button
                type="button"
                onClick={closeMovementForm}
                disabled={movementLoading}
                title="Close"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={handleCreateMovement}
            >
              <div className="space-y-5 p-6">
                {movementError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {movementError}
                  </div>
                )}

                {/* Product */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Product *
                  </label>

                  <select
                    value={movementForm.productId}
                    onChange={(event) =>
                      setMovementForm(
                        (current) => ({
                          ...current,
                          productId:
                            event.target.value,
                        })
                      )
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">
                      Select a product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} — {product.sku}{" "}
                        — Stock:{" "}
                        {product.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Movement Type *
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setMovementForm(
                          (current) => ({
                            ...current,
                            type: "IN",
                          })
                        )
                      }
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        movementForm.type ===
                        "IN"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <ArrowDownToLine
                        size={18}
                        className="mx-auto mb-1"
                      />
                      Stock In
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMovementForm(
                          (current) => ({
                            ...current,
                            type: "OUT",
                          })
                        )
                      }
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        movementForm.type ===
                        "OUT"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <ArrowUpFromLine
                        size={18}
                        className="mx-auto mb-1"
                      />
                      Stock Out
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={movementForm.quantity}
                    onChange={(event) =>
                      setMovementForm(
                        (current) => ({
                          ...current,
                          quantity:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="10"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Reason *
                  </label>

                  <textarea
                    value={movementForm.reason}
                    onChange={(event) =>
                      setMovementForm(
                        (current) => ({
                          ...current,
                          reason:
                            event.target.value,
                        })
                      )
                    }
                    placeholder={
                      movementForm.type === "IN"
                        ? "New supplier shipment"
                        : "Customer order dispatched"
                    }
                    rows={3}
                    required
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeMovementForm}
                  disabled={movementLoading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={movementLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {movementLoading
                    ? "Saving..."
                    : "Save Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;