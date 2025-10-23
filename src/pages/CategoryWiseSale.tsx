import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DownloadCloud } from "lucide-react";

type SaleRecord = {
  dc: string;
  category: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

/**
 * Static sample dataset — replace with API data as needed.
 * Ensure dates are in YYYY-MM-DD format for reliable comparisons.
 */
const SAMPLE_DATA: SaleRecord[] = [
  { dc: "DC-01", category: "Beverages", date: "2025-09-10", amount: 1200 },
  { dc: "DC-01", category: "Snacks", date: "2025-09-10", amount: 900 },
  { dc: "DC-01", category: "Dairy", date: "2025-09-10", amount: 600 },
  { dc: "DC-02", category: "Beverages", date: "2025-09-10", amount: 500 },
  { dc: "DC-01", category: "Beverages", date: "2025-09-11", amount: 1000 },
  { dc: "DC-01", category: "Snacks", date: "2025-09-11", amount: 700 },
  { dc: "DC-02", category: "Dairy", date: "2025-09-11", amount: 200 },
  { dc: "DC-01", category: "Beverages", date: "2025-09-12", amount: 1500 },
  { dc: "DC-01", category: "Snacks", date: "2025-09-12", amount: 1100 },
  { dc: "DC-01", category: "Dairy", date: "2025-09-12", amount: 400 },
  { dc: "DC-01", category: "Household", date: "2025-09-12", amount: 800 },
];

const DC_OPTIONS = ["DC-01", "DC-02", "DC-03"];

export default function CategoryWiseSale(): JSX.Element {
  // form state
  const [dc, setDc] = useState<string>("");
  const [from, setFrom] = useState<string>("2025-09-10");
  const [to, setTo] = useState<string>("2025-09-12");
  const [errors, setErrors] = useState<{ dc?: string; date?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  // results state (after submit)
  const [results, setResults] = useState<SaleRecord[]>([]);

  // validation
  function validateForm() {
    const e: { dc?: string; date?: string } = {};
    if (!dc) e.dc = "Please select DC";
    const fromTs = Date.parse(from);
    const toTs = Date.parse(to);
    if (isNaN(fromTs) || isNaN(toTs) || fromTs > toTs) {
      e.date = "Invalid date range";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // handle submit: filter SAMPLE_DATA by DC + date range and show aggregated results
  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(false);
    if (!validateForm()) return;

    const fromTs = new Date(from).setHours(0, 0, 0, 0);
    const toTs = new Date(to).setHours(23, 59, 59, 999);

    const filtered = SAMPLE_DATA.filter((r) => {
      if (dc && r.dc !== dc) return false;
      const t = new Date(r.date).getTime();
      return t >= fromTs && t <= toTs;
    });

    // sort by category name for consistent view
    filtered.sort((a, b) => a.category.localeCompare(b.category) || a.date.localeCompare(b.date));
    setResults(filtered);
    setSubmitted(true);
  }

  // aggregated data for chart & summary: sum amounts by category
  const aggregated = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of results) {
      map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
    }
    const arr = Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
    arr.sort((a, b) => b.amount - a.amount);
    return arr;
  }, [results]);

  const total = aggregated.reduce((s, it) => s + it.amount, 0);

  // export CSV of the filtered results (not aggregated)
  function exportCsv() {
    if (results.length === 0) return;
    const headers = ["DC", "Date", "Category", "Amount"];
    const lines = results.map((r) => [r.dc, r.date, `"${r.category.replace(/"/g, '""')}"`, r.amount].join(","));
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `category_wise_sales_${dc || "all"}_${from}_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Category Wise Sales</h1>
          <div className="text-sm text-slate-500 mt-1">
            <a href="/" className="text-sky-500 hover:underline">
              Home
            </a>{" "}
            <span className="mx-2">-</span> Category Wise Sales
          </div>
        </div>

        {/* Export top-right */}
        <div className="ml-auto">
          <button
            onClick={exportCsv}
            disabled={results.length === 0}
            className={`px-4 py-2 rounded-md shadow ${
              results.length === 0
                ? "bg-indigo-100 text-indigo-400 cursor-not-allowed border"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            aria-disabled={results.length === 0}
            title={results.length === 0 ? "No data to export" : "Export CSV"}
          >
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-4 h-4" />
              <span>Export</span>
            </div>
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Select DC */}
          <div className="md:col-span-3">
            <label className="block text-sm text-slate-700 mb-2">
              Select DC <span className="text-red-500">*</span>
            </label>
            <select
              value={dc}
              onChange={(e) => {
                setDc(e.target.value);
                setErrors((p) => ({ ...p, dc: undefined }));
              }}
              className={`w-full p-3 border rounded bg-white focus:outline-none ${
                errors.dc ? "border-red-400" : "border-slate-200"
              }`}
            >
              <option value="">Select DC</option>
              {DC_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.dc && <p className="text-red-600 text-sm mt-1">{errors.dc}</p>}
          </div>

          {/* Start Date */}
          <div className="md:col-span-3">
            <label className="block text-sm text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setErrors((p) => ({ ...p, date: undefined }));
              }}
              className="w-full p-3 border rounded bg-white focus:outline-none border-slate-200"
            />
          </div>

          {/* End Date */}
          <div className="md:col-span-3">
            <label className="block text-sm text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setErrors((p) => ({ ...p, date: undefined }));
              }}
              className="w-full p-3 border rounded bg-white focus:outline-none border-slate-200"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Submit button aligned right */}
          <div className="md:col-span-3 flex justify-start md:justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Results area */}
      <div className="bg-white rounded-lg shadow p-6 min-h-[360px]">
        {!submitted ? (
          <div className="text-slate-500 text-lg">Click Submit to fetch ..</div>
        ) : results.length === 0 ? (
          <div className="text-slate-500 text-lg">No data found for selected DC / date range.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregatedChartData(aggregated)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₹ ${value}`} />
                  <Legend />
                  <Bar dataKey="amount" name="Sales (₹)" fill="#6d28d9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">Total</div>
                <div className="text-xl font-semibold">₹ {total}</div>
              </div>

              <div className="space-y-3">
                {aggregated.map((row) => (
                  <div key={row.category} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{row.category}</div>
                      <div className="text-xs text-slate-500">
                        {total > 0 ? Math.round((row.amount / total) * 100) : 0}% of total
                      </div>
                    </div>
                    <div className="font-semibold">₹ {row.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 mt-3">* This view uses static sample data — wire to your API to fetch live data.</div>
    </div>
  );

  // helper to convert aggregated array into chart-friendly data (keeps same)
  function aggregatedChartData(agg: { category: string; amount: number }[]) {
    // recharts accepts array of { category, amount }
    return agg.map((x) => ({ category: x.category, amount: x.amount }));
  }
}
