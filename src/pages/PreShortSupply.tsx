// src/pages/PreShortSupply.tsx
import React, { useMemo, useRef, useState } from "react";
import { Search, Download, Calendar, ChevronDown, Eye, X as IconX } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Row = {
  id: string;
  sku: string;
  productName: string;
  dc: string;
  requiredQty: number;
  availableQty: number;
  shortBy: number;
  requestedOn: string; // yyyy-mm-dd
};

const SAMPLE_ROWS: Row[] = [
  { id: "1", sku: "SKU-1001", productName: "Widget A", dc: "TS_MAHBADX", requiredQty: 50, availableQty: 10, shortBy: 40, requestedOn: "2025-09-10" },
  { id: "2", sku: "SKU-1002", productName: "Widget B", dc: "TS_MAHBADX", requiredQty: 30, availableQty: 5, shortBy: 25, requestedOn: "2025-09-11" },
  { id: "3", sku: "SKU-1003", productName: "Widget C", dc: "DC_03", requiredQty: 20, availableQty: 20, shortBy: 0, requestedOn: "2025-09-09" },
];

export default function PreShortSupply(): JSX.Element {
  const [startDate, setStartDate] = useState<string>("2025-09-09");
  const [endDate, setEndDate] = useState<string>("2025-09-12");
  const [dc, setDc] = useState<string>("TS_MAHBADX");
  const [q, setQ] = useState<string>("");
  const [rows] = useState<Row[]>(SAMPLE_ROWS);
  const [modalRow, setModalRow] = useState<Row | null>(null);

  // refs for date inputs
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const inDc = !dc || r.dc === dc;
      const inRange = (!startDate || r.requestedOn >= startDate) && (!endDate || r.requestedOn <= endDate);
      const matchesQuery = !term || r.sku.toLowerCase().includes(term) || r.productName.toLowerCase().includes(term) || r.dc.toLowerCase().includes(term);
      return inDc && inRange && matchesQuery;
    });
  }, [rows, q, dc, startDate, endDate]);

  const exportCsv = () => {
    const cols = ["SKU", "Product Name", "DC", "Required Qty", "Available Qty", "Short By", "Requested On"];
    const lines = [cols.join(",")];
    filtered.forEach((r) => {
      lines.push([`"${r.sku}"`, `"${r.productName}"`, r.dc, r.requiredQty, r.availableQty, r.shortBy, r.requestedOn].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preshort_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export started");
  };

  const applyFilters = () => toast.success(`Filters applied: ${dc} • ${startDate || "-"} → ${endDate || "-"}`);

  const openDatePicker = (ref: HTMLInputElement | null) => {
    if (!ref) return;
    // modern browsers: showPicker() opens native date picker (Chrome 96+)
    // fallback to focus() which also opens datepicker in some browsers
    // caller can use try/catch to avoid errors in older browsers
    try {
      // @ts-ignore - showPicker isn't in TS lib for all targets
      if (typeof ref.showPicker === "function") {
        // open native picker
        ref.showPicker();
        return;
      }
    } catch {
      // ignore and fallback to focus
    }
    ref.focus();
  };

  const display = (iso?: string) => (iso ? `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}` : "");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Pre-shortSupply</h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-primary hover:underline">Home</span>
            <span className="mx-2">-</span>
            <span>pre-shortsupply</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-auto max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="pl-9 pr-3 h-11 rounded border border-slate-200 bg-white text-sm w-full"
              placeholder="Search SKU / Product..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow"
            aria-label="Export CSV"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* Filter card */}
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* DC */}
          <div className="md:col-span-4">
            <label className="block text-sm text-slate-600 mb-2">Select DC</label>
            <div className="relative">
              <select value={dc} onChange={(e) => setDc(e.target.value)} className="w-full p-3 rounded border bg-white h-11">
                <option>TS_MAHBADX</option>
                <option>TS_SOMETHING</option>
                <option>DC_03</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          {/* Start Date */}
          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">Start Date</label>
            <div className="relative">
              <input
                ref={startRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded border bg-white pr-12 h-11"
              />
              <button
                type="button"
                onClick={() => openDatePicker(startRef.current)}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-slate-100"
                aria-label="Open start date"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => setStartDate("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-slate-100"
                aria-label="Clear start date"
              >
                <IconX className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="mt-1 text-xs text-slate-400">{startDate ? display(startDate) : "No start date"}</div>
          </div>

          {/* End Date */}
          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">End Date</label>
            <div className="relative">
              <input
                ref={endRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 rounded border bg-white pr-12 h-11"
              />
              <button
                type="button"
                onClick={() => openDatePicker(endRef.current)}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-slate-100"
                aria-label="Open end date"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => setEndDate("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-slate-100"
                aria-label="Clear end date"
              >
                <IconX className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="mt-1 text-xs text-slate-400">{endDate ? display(endDate) : "No end date"}</div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button type="button" onClick={applyFilters} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded h-11">
              Submit
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="bg-white rounded-lg shadow-sm p-4 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Pre-short items</h3>
              <div className="text-sm text-slate-500">Showing {filtered.length} records</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full table-auto">
              <thead>
                <tr>
                  {["#", "SKU", "Product", "DC", "Required", "Available", "Short By", "Requested On", "Action"].map((h) => (
                    <th key={h} className="bg-[#001a8f] text-white px-4 py-3 text-left text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">No records found</td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{r.sku}</td>
                      <td className="px-4 py-3">{r.productName}</td>
                      <td className="px-4 py-3">{r.dc}</td>
                      <td className="px-4 py-3">{r.requiredQty}</td>
                      <td className="px-4 py-3">{r.availableQty}</td>
                      <td className="px-4 py-3 text-red-600">{r.shortBy}</td>
                      <td className="px-4 py-3">{display(r.requestedOn)}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setModalRow(r)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-500">Showing {filtered.length} records</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => toast("Bulk action (placeholder)")} className="px-3 py-2 rounded border">Bulk Action</button>
              <button type="button" onClick={() => toast("Request raised (placeholder)")} className="px-3 py-2 rounded bg-indigo-600 text-white">Request</button>
            </div>
          </div>
        </div>
      </section>

      {/* View modal */}
      {modalRow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Pre-short Detail</h3>
              <button onClick={() => setModalRow(null)} className="p-2 rounded hover:bg-slate-100" aria-label="Close">
                <IconX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-slate-500">SKU</div>
                <div className="font-medium">{modalRow.sku}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Product</div>
                <div className="font-medium">{modalRow.productName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">DC</div>
                <div className="font-medium">{modalRow.dc}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Requested On</div>
                <div className="font-medium">{display(modalRow.requestedOn)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Required Qty</div>
                <div className="font-medium">{modalRow.requiredQty}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Available Qty</div>
                <div className="font-medium">{modalRow.availableQty}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-slate-500">Short By</div>
                <div className="mt-2 text-red-600 font-semibold">{modalRow.shortBy}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-slate-500">Remarks</div>
                <div className="mt-2 text-slate-700">This is a placeholder remark for the pre-short item. Replace with real notes from API if available.</div>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button onClick={() => setModalRow(null)} className="px-4 py-2 rounded border">Close</button>
              <button onClick={() => { toast.success("Action performed"); setModalRow(null); }} className="px-4 py-2 rounded bg-indigo-600 text-white">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
