// src/pages/RealTimeInventory.tsx
import React, { useMemo, useState } from "react";
import { Search, RefreshCw, Download, ChevronDown, Eye } from "lucide-react";

type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  dc: string;
  qty: number;
  uom: string;
  lastUpdated: string;
  status: "ok" | "low" | "out";
};

const SAMPLE_DATA: InventoryRow[] = [
  { id: "1", sku: "SKU-001", name: "Palm Oil 1L", dc: "TS_MAHBADX", qty: 120, uom: "pcs", lastUpdated: "2025-09-12 10:32", status: "ok" },
  { id: "2", sku: "SKU-002", name: "Rice 5kg", dc: "TS_MAHBADX", qty: 8, uom: "bags", lastUpdated: "2025-09-12 09:15", status: "low" },
  { id: "3", sku: "SKU-003", name: "Sugar 2kg", dc: "DC_03", qty: 0, uom: "pcs", lastUpdated: "2025-09-11 18:00", status: "out" },
  { id: "4", sku: "SKU-004", name: "Wheat Flour 10kg", dc: "TS_SOMETHING", qty: 52, uom: "bags", lastUpdated: "2025-09-12 08:21", status: "ok" },
  { id: "5", sku: "SKU-005", name: "Salt 1kg", dc: "TS_MAHBADX", qty: 200, uom: "pcs", lastUpdated: "2025-09-10 12:44", status: "ok" },
  { id: "6", sku: "SKU-006", name: "Tea 250g", dc: "DC_03", qty: 3, uom: "pcs", lastUpdated: "2025-09-12 07:50", status: "low" },
];

export default function RealTimeInventory(): JSX.Element {
  const [dc, setDc] = useState<string>("ALL");
  const [q, setQ] = useState<string>("");
  const [rows] = useState<InventoryRow[]>(SAMPLE_DATA);
  const [page, setPage] = useState<number>(1);
  const perPage = 5;

  // scrollbar style tuned to light sidebar color
  const customScrollbar = `
    .custom-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #eef2ff; border-radius: 9999px; }
    .custom-scroll { scrollbar-width: thin; scrollbar-color: #eef2ff transparent; }
  `;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (dc !== "ALL" && r.dc !== dc) return false;
      if (!ql) return true;
      return (
        r.sku.toLowerCase().includes(ql) ||
        r.name.toLowerCase().includes(ql) ||
        r.dc.toLowerCase().includes(ql)
      );
    });
  }, [rows, q, dc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const handleRefresh = () => {
    // placeholder - replace with API call
    alert("Refreshed (demo) — replace with real API call");
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("No rows to export");
      return;
    }
    const header = ["SKU", "Name", "DC", "Qty", "UOM", "Last Updated", "Status"];
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        [
          r.sku,
          `"${r.name.replace(/"/g, '""')}"`,
          r.dc,
          String(r.qty),
          r.uom,
          `"${r.lastUpdated}"`,
          r.status,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realtime_inventory_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <style>{customScrollbar}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Real-Time-Inventory</h1>
          <div className="text-sm text-slate-500 mt-1">
            <span className="text-indigo-600">Home</span>
            <span className="mx-2">-</span>
            <span>Real Time Inventory List</span>
          </div>
        </div>

        {/* Middle search (centered on wide screens) */}
        <div className="flex-1 max-w-xl w-full md:w-1/3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="w-full pl-10 pr-12 h-10 rounded border border-slate-200 bg-white"
            />
          
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select value={dc} onChange={(e) => { setDc(e.target.value); setPage(1); }} className="p-2 border rounded bg-white">
            <option value="ALL">All DCs</option>
            <option value="TS_MAHBADX">TS_MAHBADX</option>
            <option value="TS_SOMETHING">TS_SOMETHING</option>
            <option value="DC_03">DC_03</option>
          </select>

          <button onClick={handleExport} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow">
            <Download className="w-4 h-4 inline-block mr-2" /> Export
          </button>

          <button onClick={handleRefresh} className="px-4 py-2 border rounded text-indigo-700 hover:bg-indigo-50">
            <RefreshCw className="w-4 h-4 inline-block mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Content card */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* If no data at all - show highlighted empty state like screenshot */}
        {filtered.length === 0 ? (
          <div className="p-6">
            <div className="bg-indigo-200 border border-indigo-300 text-indigo-900 px-4 py-3 rounded">
              <strong>No Data to View!</strong>
            </div>

            <div className="mt-6 text-center text-slate-500">
              <p>There are no inventory records for the current filters.</p>
              <p className="mt-3">Try changing the DC, date range or search term.</p>
            </div>
          </div>
        ) : (
          <>
            {/* table wrapper */}
            <div className="overflow-auto custom-scroll">
              <table className="min-w-full w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">SKU</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">Name</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">DC</th>
                    <th className="text-right bg-[#001a8f] text-white px-4 py-3">Qty</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">UOM</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">Last Updated</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">Status</th>
                    <th className="text-left bg-[#001a8f] text-white px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.map((r, idx) => (
                    <tr key={r.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <td className="px-4 py-3 text-sm text-slate-800">{r.sku}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{r.dc}</td>
                      <td className="px-4 py-3 text-sm text-slate-800 text-right">{r.qty}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{r.uom}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.lastUpdated}</td>
                      <td className="px-4 py-3">
                        {r.status === "ok" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-100 text-green-800">OK</span>
                        ) : r.status === "low" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Low</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-red-100 text-red-800">Out</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button title="View" className="p-2 rounded hover:bg-slate-100">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* footer + pagination */}
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">Showing {filtered.length} records</div>

              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
