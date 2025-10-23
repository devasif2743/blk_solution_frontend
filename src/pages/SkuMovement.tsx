import React, { useMemo, useState } from "react";

/**
 * SkuMovement component
 *
 * Features:
 * - Responsive layout matching provided screenshot
 * - Select item + start/end date inputs
 * - Inline validation (required item, valid dates, start <= end)
 * - Submit populates a table with sample movement rows (you can replace with API call)
 * - Export button generates CSV from current table rows
 *
 * Requirements:
 * - Tailwind CSS (used for all styling)
 *
 * Replace sample data generation with a fetch to your backend if needed.
 */

type MovementRow = {
  date: string;
  openingStock: number;
  punchedQty: number;
  salesReturn: number;
  orderCanceled: number;
  purchase: number;
  purchaseReturn: number;
  goodsOut: number;
  goodsIn: number;
  splitOut: number;
  splitIn: number;
  slocShrinkage: number;
  physicalStock: number;
  closingBal: number;
};

const SAMPLE_SKUS = [
  { id: "SKU-001", label: "Rice - 5kg (SKU-001)" },
  { id: "SKU-002", label: "Wheat - 10kg (SKU-002)" },
  { id: "SKU-003", label: "Sugar - 1kg (SKU-003)" },
];

function generateSampleRows(start: string, end: string): MovementRow[] {
  // produce a row per date between start and end (inclusive), with sample numbers
  const s = new Date(start);
  const e = new Date(end);
  const rows: MovementRow[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  for (let t = s.getTime(); t <= e.getTime(); t += dayMs) {
    const d = new Date(t);
    const dateStr = d.toLocaleDateString("en-GB"); // dd-mm-yyyy as in screenshot
    // sample random-ish numbers (deterministic-ish)
    const opening = Math.floor(100 + Math.abs(Math.sin(t / 1e8) * 300));
    const punched = Math.floor(Math.abs(Math.cos(t / 1e8) * 50));
    const salesReturn = Math.floor(Math.abs(Math.sin(t / 1.3e8) * 10));
    const orderCanceled = Math.floor(Math.abs(Math.cos(t / 1.7e8) * 5));
    const purchase = Math.floor(Math.abs(Math.sin(t / 2.1e8) * 60));
    const purchaseReturn = Math.floor(Math.abs(Math.cos(t / 2.5e8) * 4));
    const goodsOut = Math.max(0, Math.floor(punched * 0.8));
    const goodsIn = Math.floor(purchase * 0.9);
    const splitOut = Math.floor(Math.abs(Math.sin(t / 3e8) * 8));
    const splitIn = Math.floor(Math.abs(Math.cos(t / 3.5e8) * 6));
    const sloc = Math.floor(Math.abs(Math.sin(t / 4e8) * 2));
    const physical = opening + goodsIn - goodsOut - sloc + salesReturn + splitIn - splitOut;
    const closing = physical; // simplified
    rows.push({
      date: dateStr,
      openingStock: opening,
      punchedQty: punched,
      salesReturn,
      orderCanceled,
      purchase,
      purchaseReturn,
      goodsOut,
      goodsIn,
      splitOut,
      splitIn,
      slocShrinkage: sloc,
      physicalStock: physical,
      closingBal: closing,
    });
  }
  return rows;
}

export default function SkuMovement() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(todayISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedSku) e.selectedSku = "Please select an item.";
    if (!startDate) e.startDate = "Start date is required.";
    if (!endDate) e.endDate = "End date is required.";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      e.dateRange = "Start date must be the same or earlier than end date.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    // simulate fetch -> replace with your API call
    setTimeout(() => {
      const generated = generateSampleRows(startDate, endDate);
      setRows(generated);
      setIsSubmitting(false);
      setErrors({});
    }, 350);
  };

  // Export current rows to CSV (download)
  const exportCsv = () => {
    if (rows.length === 0) {
      // simple inline notification: set an error message (or use your Toaster)
      setErrors({ export: "No data to export. Submit to populate table." });
      setTimeout(() => setErrors((p) => ({ ...p, export: undefined })), 3000);
      return;
    }
    const headers = [
      "#",
      "Date",
      "Opening Stock",
      "Punched Qty",
      "Sales Return",
      "Order Canceled",
      "Purchase",
      "Purchase Return",
      "Goods Out",
      "Goods In",
      "Split Out",
      "Split In",
      "SLOC Shrinkage",
      "Physical Stock",
      "Closing Bal",
    ];
    const lines = rows.map((r, idx) =>
      [
        idx + 1,
        r.date,
        r.openingStock,
        r.punchedQty,
        r.salesReturn,
        r.orderCanceled,
        r.purchase,
        r.purchaseReturn,
        r.goodsOut,
        r.goodsIn,
        r.splitOut,
        r.splitIn,
        r.slocShrinkage,
        r.physicalStock,
        r.closingBal,
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `sku_movement_${selectedSku || "all"}_${startDate}_to_${endDate}.csv`;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Accessible label text for the top info banner (like screenshot)
  const infoBannerText = "Real-Time Inventory implemented on";

  // For responsive mobile layout: stack fields vertically on small screens
  return (
    <div className="p-4 lg:p-6">
      {/* Top header row with page title and Export button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">SKU-movement</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
            aria-label="Export CSV"
          >
            Export
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-md bg-indigo-200 border border-indigo-300 p-4 mb-4">
        <div className="font-medium text-indigo-900">{infoBannerText}</div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Select Item */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Item</label>
            <div>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-invalid={!!errors.selectedSku}
                aria-describedby={errors.selectedSku ? "selectedSku-error" : undefined}
              >
                <option value="">Select item</option>
                {SAMPLE_SKUS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.selectedSku && (
                <p id="selectedSku-error" className="mt-1 text-sm text-red-600">
                  {errors.selectedSku}
                </p>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-invalid={!!errors.startDate || !!errors.dateRange}
            />
            {(errors.startDate || errors.dateRange) && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate || errors.dateRange}</p>
            )}
          </div>

          {/* End Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-invalid={!!errors.endDate || !!errors.dateRange}
            />
            {(errors.endDate || errors.dateRange) && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate || errors.dateRange}</p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex md:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium shadow ${
                isSubmitting ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {/* header style matches screenshot: dark blue background + white text */}
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">#</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Date</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Opening Stock</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Punched Qty</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Sales Return</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Order Canceled</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Purchase</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Purchase Return</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Goods Out</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Goods In</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Split Out</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Split In</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">SLOC Shrinkage</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Physical Stock</th>
                <th className="sticky top-0 bg-[#07156a] text-white text-left px-3 py-3 whitespace-nowrap">Closing Bal</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-slate-400">
                    No movements to show. Select an item and date range then click Submit.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 text-sm">{i + 1}</td>
                    <td className="px-3 py-2 text-sm">{r.date}</td>
                    <td className="px-3 py-2 text-sm">{r.openingStock}</td>
                    <td className="px-3 py-2 text-sm">{r.punchedQty}</td>
                    <td className="px-3 py-2 text-sm">{r.salesReturn}</td>
                    <td className="px-3 py-2 text-sm">{r.orderCanceled}</td>
                    <td className="px-3 py-2 text-sm">{r.purchase}</td>
                    <td className="px-3 py-2 text-sm">{r.purchaseReturn}</td>
                    <td className="px-3 py-2 text-sm">{r.goodsOut}</td>
                    <td className="px-3 py-2 text-sm">{r.goodsIn}</td>
                    <td className="px-3 py-2 text-sm">{r.splitOut}</td>
                    <td className="px-3 py-2 text-sm">{r.splitIn}</td>
                    <td className="px-3 py-2 text-sm">{r.slocShrinkage}</td>
                    <td className="px-3 py-2 text-sm">{r.physicalStock}</td>
                    <td className="px-3 py-2 text-sm">{r.closingBal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* inline export error message */}
      {errors.export && (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">{errors.export}</div>
      )}
    </div>
  );
}
