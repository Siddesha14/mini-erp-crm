import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  Warehouse,
  IndianRupee,
  AlertTriangle,
  History,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getProductById,
  type Product,
} from "../api/products.api";

type StockMovement = {
  id: number;
  type: string;
  quantity: number;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
    role: string;
  };
};

type ProductWithMovements = Product & {
  stockMovements?: StockMovement[];
};

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] =
    useState<ProductWithMovements | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getProductById(
          Number(id)
        );

        setProduct(response.data as ProductWithMovements);
      } catch (err) {
        console.error("Product details error:", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-100" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl bg-slate-100"
              />
            )
          )}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Products
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Product not found."}
        </div>
      </div>
    );
  }

  const lowStock =
    product.currentStock <= product.minStock;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/products")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Products
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Package
                size={24}
                className="text-slate-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {product.name}
              </h1>

              <p className="mt-1 font-mono text-sm text-slate-500">
                SKU: {product.sku}
              </p>
            </div>
          </div>
        </div>

        {lowStock && (
          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            <AlertTriangle size={17} />
            Low Stock
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Price */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Unit Price
            </span>

            <div className="rounded-lg bg-slate-100 p-2">
              <IndianRupee
                size={17}
                className="text-slate-600"
              />
            </div>
          </div>

          <p className="text-xl font-bold text-slate-900">
            ₹
            {product.unitPrice.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </p>
        </div>

        {/* Current Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Current Stock
            </span>

            <div
              className={`rounded-lg p-2 ${
                lowStock
                  ? "bg-red-50"
                  : "bg-slate-100"
              }`}
            >
              <Package
                size={17}
                className={
                  lowStock
                    ? "text-red-600"
                    : "text-slate-600"
                }
              />
            </div>
          </div>

          <p
            className={`text-xl font-bold ${
              lowStock
                ? "text-red-600"
                : "text-slate-900"
            }`}
          >
            {product.currentStock}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Minimum: {product.minStock}
          </p>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Category
            </span>

            <div className="rounded-lg bg-slate-100 p-2">
              <Package
                size={17}
                className="text-slate-600"
              />
            </div>
          </div>

          <p className="text-lg font-bold text-slate-900">
            {product.category}
          </p>
        </div>

        {/* Warehouse */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Warehouse
            </span>

            <div className="rounded-lg bg-slate-100 p-2">
              <Warehouse
                size={17}
                className="text-slate-600"
              />
            </div>
          </div>

          <p className="text-lg font-bold text-slate-900">
            {product.warehouse}
          </p>
        </div>
      </div>

      {/* Stock Movements */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="rounded-lg bg-slate-100 p-2">
            <History
              size={18}
              className="text-slate-600"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Stock Movements
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Latest inventory activity for this product.
            </p>
          </div>
        </div>

        {!product.stockMovements ||
        product.stockMovements.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <History
              size={30}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm font-medium text-slate-600">
              No stock movements yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Inventory movements will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
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
                {product.stockMovements.map(
                  (movement) => (
                    <tr
                      key={movement.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {movement.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">
                          {movement.quantity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {movement.createdBy?.name ??
                              "Unknown"}
                          </p>

                          {movement.createdBy?.role && (
                            <p className="text-xs text-slate-400">
                              {movement.createdBy.role}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          movement.createdAt
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;