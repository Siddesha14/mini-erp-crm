import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createChallan,
  type ChallanItemPayload,
} from "../api/challans.api";

import {
  getCustomers,
  type Customer,
} from "../api/customers.api";

import {
  getProducts,
  type Product,
} from "../api/products.api";

type FormItem = {
  productId: string;
  quantity: string;
};

const ChallanForm = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [customerId, setCustomerId] =
    useState("");

  const [items, setItems] = useState<FormItem[]>([
    {
      productId: "",
      quantity: "1",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [customersResponse, productsResponse] =
          await Promise.all([
            getCustomers({
              page: 1,
              limit: 100,
            }),
            getProducts({
              page: 1,
              limit: 100,
            }),
          ]);

        setCustomers(customersResponse.data);
        setProducts(productsResponse.data);
      } catch (err) {
        console.error(
          "Load challan form data error:",
          err
        );

        setError(
          "Unable to load customers and products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateItem = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: "1",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const getSelectedProduct = (
    productId: string
  ) => {
    return products.find(
      (product) =>
        product.id === Number(productId)
    );
  };

  const totalQuantity = items.reduce(
    (sum, item) =>
      sum +
      (Number.isFinite(Number(item.quantity))
        ? Number(item.quantity)
        : 0),
    0
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one product.");
      return;
    }

    const productIds = new Set<number>();

    const payloadItems: ChallanItemPayload[] = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId) {
        setError(
          "Please select a product for every row."
        );
        return;
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        setError(
          "Every product quantity must be a positive whole number."
        );
        return;
      }

      if (productIds.has(productId)) {
        setError(
          "A product can only be added once to a challan."
        );
        return;
      }

      productIds.add(productId);

      payloadItems.push({
        productId,
        quantity,
      });
    }

    try {
      setSaving(true);

      const response = await createChallan({
        customerId: Number(customerId),
        items: payloadItems,
      });

      navigate(`/challans/${response.data.id}`);
    } catch (err: any) {
      console.error(
        "Create challan error:",
        err
      );

      const serverMessage =
        err?.response?.data?.message;

      setError(
        serverMessage ||
          "Unable to create challan."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/challans")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Challans
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Challan
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Select a customer and add the products being
          issued.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Customer */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Customer
          </h2>

          <select
            value={customerId}
            onChange={(event) =>
              setCustomerId(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="">
              Select a customer
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
                {customer.businessName
                  ? ` — ${customer.businessName}`
                  : ""}
              </option>
            ))}
          </select>
        </section>

        {/* Products */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Products
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Add products and their quantities.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const selectedProduct =
                getSelectedProduct(
                  item.productId
                );

              return (
                <div
                  key={index}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_180px_44px] md:items-end"
                >
                  {/* Product */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Product
                    </label>

                    <select
                      value={item.productId}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "productId",
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} —{" "}
                          {product.sku} — Stock:{" "}
                          {product.currentStock}
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Available stock:{" "}
                        {selectedProduct.currentStock}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    title="Remove product"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                    className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <span className="text-sm font-medium text-slate-600">
              Total Quantity
            </span>

            <span className="text-lg font-bold text-slate-900">
              {totalQuantity}
            </span>
          </div>
        </section>

        {/* Notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-800">
            This challan will be created as a draft.
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Stock will only be deducted when the
            challan is confirmed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/challans")
            }
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {saving
              ? "Creating..."
              : "Create Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;