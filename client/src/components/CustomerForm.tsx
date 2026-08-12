import { useEffect, useState, type FormEvent } from "react";
import { X, Loader2 } from "lucide-react";

import {
  createCustomer,
  updateCustomer,
  type CreateCustomerPayload,
  type Customer,
  type CustomerType,
  type CustomerStatus,
} from "../api/customers.api";

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

const getInitialForm = (
  customer?: Customer | null
): CreateCustomerPayload => ({
  name: customer?.name ?? "",
  mobile: customer?.mobile ?? "",
  email: customer?.email ?? "",
  businessName: customer?.businessName ?? "",
  gstNumber: customer?.gstNumber ?? "",
  customerType: customer?.customerType ?? "RETAIL",
  address: customer?.address ?? "",
  status: customer?.status ?? "LEAD",
  followUpDate: customer?.followUpDate
    ? new Date(customer.followUpDate)
        .toISOString()
        .slice(0, 16)
    : "",
  notes: customer?.notes ?? "",
});

const CustomerForm = ({
  customer,
  onClose,
  onSuccess,
}: CustomerFormProps) => {
  const isEditing = customer !== null && customer !== undefined;

  const [form, setForm] = useState<CreateCustomerPayload>(
    getInitialForm(customer)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * When switching between Add and Edit,
   * reset the form with the correct customer.
   */
  useEffect(() => {
    setForm(getInitialForm(customer));
    setError("");
    setLoading(false);
  }, [customer]);

  const updateField = (
    field: keyof CreateCustomerPayload,
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

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (form.mobile.trim().length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required.");
      return;
    }

    try {
      setLoading(true);

      const payload: CreateCustomerPayload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email?.trim() || "",
        businessName: form.businessName?.trim() || "",
        gstNumber: form.gstNumber?.trim() || "",
        customerType: form.customerType,
        address: form.address.trim(),
        status: form.status,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes?.trim() || "",
      };

      if (isEditing && customer) {
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
      }

      onSuccess();
    } catch (err) {
      console.error(
        isEditing
          ? "Update customer error:"
          : "Create customer error:",
        err
      );

      setError(
        isEditing
          ? "Unable to update customer. Please check the details and try again."
          : "Unable to create customer. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Customer" : "Add Customer"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {isEditing
                ? "Update customer information."
                : "Create a new customer record."}
            </p>
          </div>

          <button
            type="button"
            title="Close"
            aria-label="Close customer form"
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
              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Basic Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Customer Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Customer Name *
                    </label>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="ABC Traders"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Mobile *
                    </label>

                    <input
                      value={form.mobile}
                      onChange={(event) =>
                        updateField(
                          "mobile",
                          event.target.value
                        )
                      }
                      placeholder="9876543210"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="abc@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Business Name
                    </label>

                    <input
                      value={form.businessName}
                      onChange={(event) =>
                        updateField(
                          "businessName",
                          event.target.value
                        )
                      }
                      placeholder="ABC Traders Pvt Ltd"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* Business Information */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Business Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Customer Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Customer Type *
                    </label>

                    <select
                      value={form.customerType}
                      onChange={(event) =>
                        updateField(
                          "customerType",
                          event.target.value as CustomerType
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="RETAIL">
                        Retail
                      </option>

                      <option value="WHOLESALE">
                        Wholesale
                      </option>

                      <option value="DISTRIBUTOR">
                        Distributor
                      </option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value as CustomerStatus
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="LEAD">
                        Lead
                      </option>

                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>

                  {/* GST */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      GST Number
                    </label>

                    <input
                      value={form.gstNumber}
                      onChange={(event) =>
                        updateField(
                          "gstNumber",
                          event.target.value.toUpperCase()
                        )
                      }
                      placeholder="29ABCDE1234F1Z5"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* Address */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Address
                </h3>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Bangalore, Karnataka"
                  rows={3}
                  required
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </section>

              {/* Follow-up */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Follow-up
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Follow-up Date */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Follow-up Date
                    </label>

                    <input
                      type="datetime-local"
                      value={form.followUpDate}
                      onChange={(event) =>
                        updateField(
                          "followUpDate",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Notes
                    </label>

                    <input
                      value={form.notes}
                      onChange={(event) =>
                        updateField(
                          "notes",
                          event.target.value
                        )
                      }
                      placeholder="Interested in bulk orders"
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
                ? "Update Customer"
                : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;