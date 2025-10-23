import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// StockVariation
// - responsive, self-contained React component
// - shows stock levels over time (area chart) and per-category variation (bar chart)
// - includes date range, category filter and a compact table for details
// - Tailwind CSS classes for responsiveness

type StockRecord = {
  sku: string;
  category: string;
  date: string; // ISO date
  stock: number;
};

const SAMPLE: StockRecord[] = [
  { sku: "SKU-001", category: "Beverages", date: "2025-09-08", stock: 120 },
  { sku: "SKU-001", category: "Beverages", date: "2025-09-09", stock: 110 },
  { sku: "SKU-001", category: "Beverages", date: "2025-09-10", stock: 140 },
  { sku: "SKU-002", category: "Snacks", date: "2025-09-08", stock: 80 },
  { sku: "SKU-002", category: "Snacks", date: "2025-09-09", stock: 60 },
  { sku: "SKU-002", category: "Snacks", date: "2025-09-10", stock: 70 },
  { sku: "SKU-003", category: "Dairy", date: "2025-09-08", stock: 50 },
  { sku: "SKU-003", category: "Dairy", date: "2025-09-09", stock: 40 },
  { sku: "SKU-003", category: "Dairy", date: "2025-09-10", stock: 30 },
  { sku: "SKU-004", category: "Household", date: "2025-09-10", stock: 200 },
];

export default function StockVariation({ data }: { data?: StockRecord[] }) {
  const [from, setFrom] = useState<string>("2025-09-08");
  const [to, setTo] = useState<string>("2025-09-10");
  const [category, setCategory] = useState<string>("All");

  const input = data ?? SAMPLE;

  // list of categories
  const categories = useMemo(() => {
    const s = new Set(input.map((r) => r.category));
    return ["All", ...Array.from(s)];
  }, [input]);

  // Filter records by date range & category
  const filtered = useMemo(() => {
    const fromTs = new Date(from).getTime();
    const toTs = new Date(to).getTime();
    return input.filter((r) => {
      const t = new Date(r.date).getTime();
      if (isNaN(t)) return false;
      if (t < fromTs || t > toTs) return false;
      if (category !== "All" && r.category !== category) return false;
      return true;
    });
  }, [input, from, to, category]);

  // Prepare time-series aggregated by date (sum of stocks across SKUs)
  const timeSeries = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      map.set(r.date, (map.get(r.date) ?? 0) + r.stock);
    });
    const arr = Array.from(map.entries())
      .map(([date, stock]) => ({ date, stock }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return arr;
  }, [filtered]);

  // Category variation: total stock per category in filtered range
  const categoryAgg = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + r.stock));
    return Array.from(m.entries()).map(([category, stock]) => ({ category, stock }));
  }, [filtered]);

  // Table: latest stock per SKU (most recent date in range)
  const latestPerSku = useMemo(() => {
    const m = new Map<string, { date: string; stock: number; category: string }>();
    filtered.forEach((r) => {
      const cur = m.get(r.sku);
      if (!cur || new Date(r.date).getTime() > new Date(cur.date).getTime()) {
        m.set(r.sku, { date: r.date, stock: r.stock, category: r.category });
      }
    });
    return Array.from(m.entries()).map(([sku, v]) => ({ sku, ...v }));
  }, [filtered]);
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Stock Variation</h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-600">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border p-1 rounded text-sm" />
          <label className="text-xs text-slate-600">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border p-1 rounded text-sm" />

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded text-sm">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64">
          {timeSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">No data in range</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v}`} />
                <Area type="monotone" dataKey="stock" stroke="#059669" fillOpacity={1} fill="url(#colorStock)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="h-64">
          {categoryAgg.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">No categories</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAgg} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" />
                <Tooltip formatter={(v: number) => `${v}`} />
                <Bar dataKey="stock" name="Stock" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="p-2">SKU</th>
                <th className="p-2">Category</th>
                <th className="p-2">Latest Date</th>
                <th className="p-2 text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              {latestPerSku.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-500">No SKUs found</td>
                </tr>
              ) : (
                latestPerSku.map((r) => (
                  <tr key={r.sku} className="border-b">
                    <td className="p-2">{r.sku}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2">{r.date}</td>
                    <td className="p-2 text-right font-semibold">{r.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
