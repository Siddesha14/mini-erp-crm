import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";

import {
  addFollowUp,
  getCustomerById,
  type Customer,
  type CustomerFollowUp,
} from "../api/customers.api";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState("");

  const loadCustomer = async () => {
    if (!id) {
      setError("Invalid customer ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getCustomerById(Number(id));

      setCustomer(data);

      /*
       * The backend returns the customer's follow-up history
       * together with the customer details.
       */
      const customerWithFollowUps = data as Customer & {
        followUps?: CustomerFollowUp[];
      };

      setFollowUps(customerWithFollowUps.followUps ?? []);
    } catch (err) {
      console.error("Customer details error:", err);
      setError("Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const handleAddFollowUp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    if (!followUpNote.trim()) {
      setFollowUpError("Follow-up note is required.");
      return;
    }

    if (!followUpDate) {
      setFollowUpError("Follow-up date is required.");
      return;
    }

    try {
      setSavingFollowUp(true);
      setFollowUpError("");

      await addFollowUp(Number(id), {
        note: followUpNote.trim(),
        followUpDate,
      });

      setFollowUpNote("");
      setFollowUpDate("");
      setShowFollowUp(false);

      await loadCustomer();
    } catch (err) {
      console.error("Add follow-up error:", err);

      setFollowUpError(
        "Unable to add follow-up. Please try again."
      );
    } finally {
      setSavingFollowUp(false);
    }
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) {
      return "Not set";
    }

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statusStyle = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    LEAD: "bg-amber-50 text-amber-700",
    INACTIVE: "bg-slate-100 text-slate-600",
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-slate-500"
        />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Customers
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Customer not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Customers
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <User size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>

              {customer.businessName && (
                <p className="mt-1 text-sm text-slate-500">
                  {customer.businessName}
                </p>
              )}
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusStyle[customer.status]
            }`}
          >
            {customer.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Main Information */}

        <div className="space-y-6 lg:col-span-2">

          {/* Contact Information */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Customer Information
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">

              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Mobile
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {customer.mobile}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {customer.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Customer Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {customer.customerType}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    GST Number
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {customer.gstNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:col-span-2">
                <MapPin
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {customer.address}
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Notes */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Notes
              </h2>
            </div>

            <div className="p-5">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {customer.notes || "No notes added."}
              </p>
            </div>
          </section>

          {/* Follow-up History */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Follow-up History
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Previous customer interactions
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFollowUpError("");
                  setShowFollowUp(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={15} />
                Add Follow-up
              </button>
            </div>

            <div className="p-5">
              {followUps.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar
                    size={28}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No follow-ups yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a follow-up to keep track of customer
                    interactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm leading-6 text-slate-700">
                          {followUp.note}
                        </p>

                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(
                            followUp.followUpDate
                          )}
                        </span>
                      </div>

                      {followUp.createdBy && (
                        <p className="mt-3 text-xs text-slate-400">
                          Added by{" "}
                          <span className="font-medium text-slate-600">
                            {followUp.createdBy.name}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}

        <div className="space-y-6">

          {/* Summary */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Summary
              </h2>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <p className="text-xs text-slate-400">
                  Current Status
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {customer.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Customer Type
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {customer.customerType}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Next Follow-up
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(customer.followUpDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Follow-ups
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {followUps.length}
                </p>
              </div>

            </div>
          </section>

        </div>
      </div>

      {/* Add Follow-up Modal */}

      {showFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Add Follow-up
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Record the next customer interaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFollowUp(false)}
                disabled={savingFollowUp}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFollowUp}>
              <div className="space-y-5 p-6">

                {followUpError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {followUpError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Follow-up Note *
                  </label>

                  <textarea
                    value={followUpNote}
                    onChange={(event) =>
                      setFollowUpNote(event.target.value)
                    }
                    placeholder="Discussed pricing and upcoming order..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Follow-up Date *
                  </label>

                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(event) =>
                      setFollowUpDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() => setShowFollowUp(false)}
                  disabled={savingFollowUp}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingFollowUp}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingFollowUp && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {savingFollowUp
                    ? "Saving..."
                    : "Add Follow-up"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;