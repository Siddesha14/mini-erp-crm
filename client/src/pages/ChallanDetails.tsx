import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

import {
  cancelChallan,
  confirmChallan,
  getChallanById,
  type Challan,
} from "../api/challans.api";

const ChallanDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const loadChallan = async () => {
    if (!id) {
      setError("Invalid challan ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getChallanById(Number(id));

      setChallan(response.data);
    } catch (err: any) {
      console.error("Load challan error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load challan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan || actionLoading) return;

    const confirmed = window.confirm(
      "Confirm this challan? Stock will be deducted from inventory."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await confirmChallan(challan.id);

      setChallan(response.data);
    } catch (err: any) {
      console.error("Confirm challan error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to confirm challan."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!challan || actionLoading) return;

    const confirmed = window.confirm(
      "Cancel this challan?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await cancelChallan(challan.id);

      setChallan(response.data);
    } catch (err: any) {
      console.error("Cancel challan error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to cancel challan."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!challan || pdfLoading) return;

    try {
      setPdfLoading(true);

      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      const formatCurrency = (value: number) =>
        `Rs. ${value.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const customerName =
        challan.customer?.businessName ||
        challan.customer?.name ||
        "Unknown Customer";

      const createdDate = new Date(
        challan.createdAt
      ).toLocaleString("en-IN");

      /* ---------------- HEADER ---------------- */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("MINI ERP", 20, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Operations & Inventory Management", 20, 32);

      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("DELIVERY CHALLAN", pageWidth - 20, 25, {
        align: "right",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Challan No: ${challan.challanNumber}`,
        pageWidth - 20,
        33,
        { align: "right" }
      );

      doc.text(
        `Date: ${createdDate}`,
        pageWidth - 20,
        40,
        { align: "right" }
      );

      /* ---------------- DIVIDER ---------------- */

      doc.setDrawColor(220, 220, 220);
      doc.line(20, 48, pageWidth - 20, 48);

      /* ---------------- CUSTOMER ---------------- */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CUSTOMER DETAILS", 20, 62);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Name: ${customerName}`, 20, 70);

      if (
        challan.customer?.businessName &&
        challan.customer.businessName !==
          challan.customer.name
      ) {
        doc.text(
          `Contact: ${challan.customer.name}`,
          20,
          77
        );
      }

      if (challan.customer?.mobile) {
        doc.text(
          `Mobile: ${challan.customer.mobile}`,
          20,
          84
        );
      }

      

      /* ---------------- STATUS ---------------- */

      const statusY = 62;

      doc.setFont("helvetica", "bold");
      doc.text("STATUS", pageWidth - 80, statusY);

      doc.setFont("helvetica", "normal");

      doc.text(
        challan.status,
        pageWidth - 80,
        statusY + 8
      );

      /* ---------------- TABLE ---------------- */

      const tableStartY = 108;

      doc.setFillColor(245, 247, 250);
      doc.rect(
        20,
        tableStartY,
        pageWidth - 40,
        10,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      doc.text("PRODUCT", 24, tableStartY + 7);
      doc.text("SKU", 85, tableStartY + 7);
      doc.text("QTY", 125, tableStartY + 7, {
        align: "right",
      });
      doc.text("UNIT PRICE", 160, tableStartY + 7, {
        align: "right",
      });
      doc.text("AMOUNT", pageWidth - 24, tableStartY + 7, {
        align: "right",
      });

      let currentY = tableStartY + 18;

      doc.setFont("helvetica", "normal");

      let grandTotal = 0;

      challan.items.forEach((item) => {
        const amount =
          item.unitPriceSnapshot * item.quantity;

        grandTotal += amount;

        const productName =
          item.productNameSnapshot.length > 28
            ? `${item.productNameSnapshot.substring(0, 28)}...`
            : item.productNameSnapshot;

        doc.text(productName, 24, currentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(item.skuSnapshot, 85, currentY);

        doc.setFontSize(9);
        doc.text(
          String(item.quantity),
          125,
          currentY,
          { align: "right" }
        );

        doc.text(
          formatCurrency(item.unitPriceSnapshot),
          160,
          currentY,
          { align: "right" }
        );

        doc.text(
          formatCurrency(amount),
          pageWidth - 24,
          currentY,
          { align: "right" }
        );

        doc.setDrawColor(235, 235, 235);
        doc.line(
          20,
          currentY + 4,
          pageWidth - 20,
          currentY + 4
        );

        currentY += 12;

        if (currentY > 250) {
          doc.addPage();
          currentY = 25;
        }
      });

      /* ---------------- TOTALS ---------------- */

      currentY += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.text(
        "Total Quantity:",
        125,
        currentY
      );

      doc.text(
        String(challan.totalQuantity),
        pageWidth - 24,
        currentY,
        { align: "right" }
      );

      currentY += 10;

      doc.text("Total Amount:", 125, currentY);

      doc.text(
        formatCurrency(grandTotal),
        pageWidth - 24,
        currentY,
        { align: "right" }
      );

      /* ---------------- FOOTER ---------------- */

      const footerY = 270;

      doc.setDrawColor(220, 220, 220);
      doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);

      doc.text(
        "Generated by Mini ERP",
        20,
        footerY
      );

      doc.text(
        `Challan Status: ${challan.status}`,
        pageWidth - 20,
        footerY,
        { align: "right" }
      );

      doc.setTextColor(0, 0, 0);

      /* ---------------- SIGNATURE ---------------- */

      doc.setFontSize(9);

      doc.line(
        pageWidth - 80,
        footerY - 25,
        pageWidth - 20,
        footerY - 25
      );

      doc.text(
        "Authorized Signature",
        pageWidth - 50,
        footerY - 18,
        { align: "center" }
      );

      doc.save(
        `${challan.challanNumber}.pdf`
      );
    } catch (err) {
      console.error("PDF generation error:", err);

      setError("Unable to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const statusClasses = () => {
    if (!challan) return "";

    if (challan.status === "CONFIRMED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (challan.status === "CANCELLED") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate("/challans")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Challans
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Challan not found."}
        </div>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3">
            <FileText size={24} className="text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {challan.challanNumber}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Created{" "}
              {new Date(
                challan.createdAt
              ).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses()}`}
          >
            {challan.status}
          </span>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Download size={16} />
            )}

            {pdfLoading
              ? "Generating..."
              : "Download PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Customer */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Customer
        </h2>

        <p className="text-lg font-semibold text-slate-800">
          {challan.customer?.name ??
            "Unknown Customer"}
        </p>

        {challan.customer?.businessName && (
          <p className="mt-1 text-sm text-slate-500">
            {challan.customer.businessName}
          </p>
        )}

        {challan.customer?.mobile && (
          <p className="mt-1 text-sm text-slate-500">
            {challan.customer.mobile}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Products
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit Price
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {challan.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {item.productNameSnapshot}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500">
                      {item.skuSnapshot}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    ₹
                    {item.unitPriceSnapshot.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                    ₹
                    {(
                      item.unitPriceSnapshot *
                      item.quantity
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-sm font-medium text-slate-600">
            Total Quantity
          </span>

          <span className="text-lg font-bold text-slate-900">
            {challan.totalQuantity}
          </span>
        </div>
      </div>

      {/* Actions */}
      {challan.status === "DRAFT" && (
        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <XCircle size={17} />
            )}

            Cancel Challan
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={17} />
            )}

            Confirm Challan
          </button>
        </div>
      )}

      {challan.status === "CONFIRMED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={22}
              className="text-emerald-600"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Challan confirmed
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                Inventory has been updated and stock
                movements have been recorded.
              </p>
            </div>
          </div>
        </div>
      )}

      {challan.status === "CANCELLED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <XCircle
              size={22}
              className="text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Challan cancelled
              </p>

              <p className="mt-1 text-xs text-red-700">
                This draft will not affect inventory.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanDetails;