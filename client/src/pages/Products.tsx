import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getProducts,
  type Product,
} from "../api/products.api";

import ProductForm from "../components/ProductForm";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const limit = 10;

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({
        page,
        limit,
        search: search.trim() || undefined,
        category: category.trim() || undefined,
      });

      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Products error:", err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, category]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);

    if (page === 1) {
      loadProducts();
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductSuccess = async () => {
    setShowProductForm(false);
    setEditingProduct(null);

    await loadProducts();
  };

  const isLowStock = (product: Product) => {
    return product.currentStock <= product.minStock;
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
              Products
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage products, pricing, stock levels and warehouses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Product
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
              placeholder="Search by product name or SKU..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </form>

          <input
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            placeholder="Category"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
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
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Warehouse
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
                      {Array.from({ length: 7 }).map(
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
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <Package
                      size={30}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or category.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Product */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {product.name}
                      </p>
                    </td>

                    {/* SKU */}
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                        {product.sku}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-slate-700">
                        ₹
                        {product.unitPrice.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-sm font-semibold ${
                            isLowStock(product)
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {product.currentStock}
                        </span>

                        <span className="text-xs text-slate-400">
                          min {product.minStock}
                        </span>
                      </div>
                    </td>

                    {/* Warehouse */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {product.warehouse}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="View product"
                          onClick={() =>
                            navigate(
                              `/products/${product.id}`
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Edit product"
                          onClick={() =>
                            handleEditProduct(product)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(page * limit, total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {total}
              </span>{" "}
              products
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
                disabled={page >= totalPages}
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

      {/* Product Form */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseProductForm}
          onSuccess={handleProductSuccess}
        />
      )}
    </div>
  );
};

export default Products;