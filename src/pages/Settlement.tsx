// src/pages/Settlement.tsx
import React, { useMemo, useState } from "react";
import {
  Download,
  Calendar,
  ChevronDown,
  Search,
  Eye,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Row = {
  id: string;
  vehicle: string;
  noOrders: number;
  invoiceAmt: number;
  fullReturn: number;
  partialReturn: number;
  oldReturn: number;
  netAmt: number;
  cashBalance: number;
  cashReceived: number;
  bankDeposited: number;
  discount: number;
  billionDeposited: number;
  amountReceived: number;
};

const SAMPLE_ROWS: Row[] = [
  {
    id: "1",
    vehicle: "TS26T9484",
    noOrders: 1,
    invoiceAmt: 7089,
    fullReturn: 0,
    partialReturn: 2363,
    oldReturn: 0,
    netAmt: 4726,
    cashBalance: 0,
    cashReceived: 4726,
    bankDeposited: 0,
    discount: 0,
    billionDeposited: 0,
    amountReceived: 4726,
  },
  // add more rows if needed
];

export default function Settlement(): JSX.Element {
  // filters
  const [dc, setDc] = useState<string>("TS_MAHBADX");
  const [startDate, setStartDate] = useState<string>("2025-09-12");
  const [endDate, setEndDate] = useState<string>("2025-09-12");
  const [q, setQ] = useState<string>("");

  // data + ui
  const [rows] = useState<Row[]>(SAMPLE_ROWS);
  const [modalRow, setModalRow] = useState<Row | null>(null);

  // filtered rows by query
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        r.vehicle.toLowerCase().includes(t) ||
        String(r.invoiceAmt).includes(t) ||
        String(r.noOrders).includes(t)
    );
  }, [rows, q]);

  // totals
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.invoiceAmt += r.invoiceAmt;
        acc.fullReturn += r.fullReturn;
        acc.partialReturn += r.partialReturn;
        acc.netAmt += r.netAmt;
        acc.cashReceived += r.cashReceived;
        acc.amountReceived += r.amountReceived;
        return acc;
      },
      {
        invoiceAmt: 0,
        fullReturn: 0,
        partialReturn: 0,
        netAmt: 0,
        cashReceived: 0,
        amountReceived: 0,
      }
    );
  }, [filtered]);

  const submitFilters = () => {
    // placeholder behaviour — in real app call API
    toast.success("Filters applied");
  };

  const exportCsv = () => {
    const cols = [
      "Vehicle",
      "No Orders",
      "Invoice Amt",
      "Full Return",
      "Partial Return",
      "Old Return",
      "Net Amt",
      "Cash Balance",
      "Cash Received",
      "Bank Deposited",
      "Discount",
      "Billion Deposited",
      "Amount Received",
    ];
    const lines = [cols.join(",")];
    rows.forEach((r) => {
      const line = [
        `"${r.vehicle}"`,
        r.noOrders,
        r.invoiceAmt,
        r.fullReturn,
        r.partialReturn,
        r.oldReturn,
        r.netAmt,
        r.cashBalance,
        r.cashReceived,
        r.bankDeposited,
        r.discount,
        r.billionDeposited,
        r.amountReceived,
      ];
      lines.push(line.join(","));
    });
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Settlement
          </h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-primary hover:underline">Home</span>
            <span className="mx-2">-</span>
            <span>Settlement</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 pr-3 h-10 rounded border border-slate-200 bg-white text-sm"
            />
          </div>

          <div className="ml-auto md:ml-0">
            <button
              onClick={exportCsv}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>

      {/* filter card */}
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm text-slate-600 mb-2">Select DC</label>
            <div className="relative">
              <select
                value={dc}
                onChange={(e) => setDc(e.target.value)}
                className="w-full p-3 rounded border bg-white"
              >
                <option>TS_MAHBADX</option>
                <option>TS_SOMETHING</option>
                <option>DC_03</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">Start Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-3 rounded border bg-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">End Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-3 rounded border bg-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              onClick={submitFilters}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </section>

      {/* summary box above table */}
      <section className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 border rounded">
            <div className="text-sm text-slate-600">Total Orders</div>
            <div className="text-lg font-semibold mt-2">{rows.length}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-slate-600">Invoice</div>
            <div className="text-lg font-semibold mt-2">{totals.invoiceAmt.toLocaleString()}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-slate-600">Complete</div>
            <div className="text-lg font-semibold mt-2">{totals.netAmt.toLocaleString()}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-slate-600">Return</div>
            <div className="text-lg font-semibold mt-2">{totals.partialReturn.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* data table */}
      <section>
        <div className="bg-white rounded-lg shadow-sm overflow-auto">
          <table className="min-w-[1200px] w-full table-auto border-collapse">
            <thead>
              <tr>
                {[
                  "Sl No",
                  "Vehicle Number",
                  "No Orders",
                  "Invoice Amt",
                  "Full Return",
                  "Partial Return",
                  "Old return",
                  "Net Amt",
                  "Cash Balance",
                  "Cash Received",
                  "Bank Deposited",
                  "Discount",
                  "Billion Deposited",
                  "Amount Received",
                  "Action",
                ].map((col) => (
                  <th key={col} className="bg-[#001a8f] text-white px-4 py-3 text-left text-sm">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-6 py-6 text-center text-slate-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{r.vehicle}</td>
                    <td className="px-4 py-3">{r.noOrders}</td>
                    <td className="px-4 py-3">{r.invoiceAmt.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.fullReturn.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.partialReturn.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.oldReturn.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.netAmt.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.cashBalance.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.cashReceived.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.bankDeposited.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.discount.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.billionDeposited.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.amountReceived.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModalRow(r)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* totals row */}
              {filtered.length > 0 && (
                <tr className="bg-slate-100 font-medium">
                  <td className="px-4 py-3">* Total</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">{filtered.reduce((s, r) => s + r.noOrders, 0)}</td>
                  <td className="px-4 py-3">{totals.invoiceAmt.toLocaleString()}</td>
                  <td className="px-4 py-3">{totals.fullReturn.toLocaleString()}</td>
                  <td className="px-4 py-3">{totals.partialReturn.toLocaleString()}</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">{totals.netAmt.toLocaleString()}</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">{totals.cashReceived.toLocaleString()}</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">{totals.amountReceived.toLocaleString()}</td>
                  <td className="px-4 py-3">*</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* view modal */}
      {modalRow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Settlement Details</h3>
              <button onClick={() => setModalRow(null)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-slate-500">Vehicle</div>
                <div className="font-medium">{modalRow.vehicle}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Invoice Amount</div>
                <div className="font-medium">₹ {modalRow.invoiceAmt.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">No Orders</div>
                <div className="font-medium">{modalRow.noOrders}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Net Amount</div>
                <div className="font-medium">₹ {modalRow.netAmt.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Partial Return</div>
                <div className="font-medium">₹ {modalRow.partialReturn.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Cash Received</div>
                <div className="font-medium">₹ {modalRow.cashReceived.toLocaleString()}</div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-sm text-slate-500">Remarks</div>
                <div className="mt-2 text-slate-700">
                  {/* placeholder remarks (static sample) */}
                  Settlement record for vehicle {modalRow.vehicle}. More details can go here.
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button onClick={() => setModalRow(null)} className="px-4 py-2 rounded border">
                Close
              </button>
              <button
                onClick={() => {
                  toast.success("Action performed (placeholder)");
                  setModalRow(null);
                }}
                className="px-4 py-2 rounded bg-indigo-600 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
