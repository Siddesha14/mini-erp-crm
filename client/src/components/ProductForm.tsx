import { useEffect, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";

import {
  createProduct,
  updateProduct,
  type CreateProductPayload,
  type Product,
} from "../api/products.api";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

type ProductFormState = {
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minStock: string;
  warehouse: string;
};

const getInitialForm = (
  product?: Product | null
): ProductFormState => ({
  name: product?.name ?? "",
  sku: product?.sku ?? "",
  category: product?.category ?? "",
  unitPrice:
    product?.unitPrice !== undefined
      ? String(product.unitPrice)
      : "",
  currentStock:
    product?.currentStock !== undefined
      ? String(product.currentStock)
      : "0",
  minStock:
    product?.minStock !== undefined
      ? String(product.minStock)
      : "0",
  warehouse: product?.warehouse ?? "",
});

const ProductForm = ({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) => {
  const isEditing =
    product !== null && product !== undefined;

  const [form, setForm] = useState<ProductFormState>(
    getInitialForm(product)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(product));
    setError("");
    setLoading(false);
  }, [product]);

  const updateField = (
    field: keyof ProductFormState,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!form.warehouse.trim()) {
      setError("Warehouse is required.");
      return;
    }

    const unitPrice = Number(form.unitPrice);
    const minStock = Number(form.minStock);
    const currentStock = Number(form.currentStock);

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setError("Unit price must be a valid non-negative number.");
      return;
    }

    if (
      !Number.isInteger(minStock) ||
      minStock < 0
    ) {
      setError(
        "Minimum stock must be a valid non-negative integer."
      );
      return;
    }

    if (
      !isEditing &&
      (!Number.isInteger(currentStock) ||
        currentStock < 0)
    ) {
      setError(
        "Current stock must be a valid non-negative integer."
      );
      return;
    }

    try {
      setLoading(true);

      if (isEditing && product) {
        await updateProduct(product.id, {
          name: form.name.trim(),
          sku: form.sku.trim(),
          category: form.category.trim(),
          unitPrice,
          minStock,
          warehouse: form.warehouse.trim(),
        });
      } else {
        const payload: CreateProductPayload = {
          name: form.name.trim(),
          sku: form.sku.trim(),
          category: form.category.trim(),
          unitPrice,
          currentStock,
          minStock,
          warehouse: form.warehouse.trim(),
        };

        await createProduct(payload);
      }

      onSuccess();
    } catch (err) {
      console.error(
        isEditing
          ? "Update product error:"
          : "Create product error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "";

      if (message.includes("409")) {
        setError(
          "A product with this SKU already exists."
        );
      } else {
        setError(
          isEditing
            ? "Unable to update product. Please check the details and try again."
            : "Unable to create product. Please check the details and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {isEditing
                ? "Update product information."
                : "Create a new product."}
            </p>
          </div>

          <button
            type="button"
            title="Close"
            aria-label="Close product form"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Product Information */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Product Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Product Name *
                    </label>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Wireless Keyboard"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      SKU *
                    </label>

                    <input
                      value={form.sku}
                      onChange={(event) =>
                        updateField(
                          "sku",
                          event.target.value
                        )
                      }
                      placeholder="KB-001"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Category *
                    </label>

                    <input
                      value={form.category}
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target.value
                        )
                      }
                      placeholder="Electronics"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Warehouse *
                    </label>

                    <input
                      value={form.warehouse}
                      onChange={(event) =>
                        updateField(
                          "warehouse",
                          event.target.value
                        )
                      }
                      placeholder="Main Warehouse"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* Pricing & Stock */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Pricing & Stock
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Unit Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(event) =>
                        updateField(
                          "unitPrice",
                          event.target.value
                        )
                      }
                      placeholder="999.00"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Current Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.currentStock}
                      onChange={(event) =>
                        updateField(
                          "currentStock",
                          event.target.value
                        )
                      }
                      disabled={isEditing}
                      className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${
                        isEditing
                          ? "cursor-not-allowed bg-slate-100 text-slate-500"
                          : ""
                      }`}
                    />

                    {isEditing && (
                      <p className="mt-1 text-xs text-slate-400">
                        Stock is managed through inventory movements.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Minimum Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.minStock}
                      onChange={(event) =>
                        updateField(
                          "minStock",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;