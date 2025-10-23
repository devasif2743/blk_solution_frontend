// src/pages/DailyInventory.tsx
import React, { useMemo, useState } from "react";
import { Search, Download, Calendar, ChevronDown, RefreshCw } from "lucide-react";

type Row = {
  id: string;
  sku: string;
  name: string;
  dc: string;
  opening: number;
  received: number;
  issued: number;
  closing: number;
  uom: string;
  date: string;
};

const SAMPLE: Row[] = [
  { id: "1", sku: "SKU-001", name: "Palm Oil 1L", dc: "TS_MAHBADX", opening: 120, received: 20, issued: 40, closing: 100, uom: "pcs", date: "2025-09-12" },
  { id: "2", sku: "SKU-002", name: "Rice 5kg", dc: "TS_MAHBADX", opening: 10, received: 0, issued: 3, closing: 7, uom: "bags", date: "2025-09-12" },
  { id: "3", sku: "SKU-003", name: "Sugar 2kg", dc: "DC_03", opening: 50, received: 10, issued: 5, closing: 55, uom: "pcs", date: "2025-09-12" },
  { id: "4", sku: "SKU-004", name: "Wheat Flour 10kg", dc: "TS_SOMETHING", opening: 80, received: 5, issued: 10, closing: 75, uom: "bags", date: "2025-09-12" },
  { id: "5", sku: "SKU-005", name: "Salt 1kg", dc: "TS_MAHBADX", opening: 200, received: 0, issued: 3, closing: 197, uom: "pcs", date: "2025-09-12" },
  { id: "6", sku: "SKU-006", name: "Tea 250g", dc: "DC_03", opening: 25, received: 0, issued: 2, closing: 23, uom: "pcs", date: "2025-09-12" },
];

export default function DailyInventory(): JSX.Element {
  const [dc, setDc] = useState<string>("TS_MAHBADX");
  const [date, setDate] = useState<string>("2025-09-12");
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const perPage = 6;
  const rows = SAMPLE;

  // tiny scrollbar style to match light sidebar color
  const css = `
    .custom-scroll::-webkit-scrollbar { height:8px; width:8px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #eef2ff; border-radius: 9999px; }
    .custom-scroll { scrollbar-width: thin; scrollbar-color: #eef2ff transparent; }
  `;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (dc && r.dc !== dc) return false;
      if (!ql) return true;
      return (
        r.sku.toLowerCase().includes(ql) ||
        r.name.toLowerCase().includes(ql) ||
        r.uom.toLowerCase().includes(ql)
      );
    });
  }, [rows, q, dc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  // Handlers (static/demo)
  const handleSubmit = () => {
    setPage(1);
    // In real app you'd call API with selected dc + date
    alert(`Filter applied\nDC: ${dc}\nDate: ${date}`);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("No records to export");
      return;
    }
    const header = ["SKU", "Name", "DC", "Opening", "Received", "Issued", "Closing", "UOM", "Date"];
    const lines = [header.join(",")];
    filtered.forEach((r) => {
      lines.push([
        r.sku,
        `"${r.name.replace(/"/g, '""')}"`,
        r.dc,
        String(r.opening),
        String(r.received),
        String(r.issued),
        String(r.closing),
        r.uom,
        r.date,
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_inventory_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    // placeholder for refresh action
    alert("Refreshed (demo)");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <style>{css}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Daily-Inventory</h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-primary hover:underline">Home</span>
            <span className="mx-2">-</span>
            <span>Daily Inventory List</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="pl-9 pr-3 h-10 rounded border border-slate-200 bg-white"
            />
          </div>

          <button onClick={handleExport} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow-sm">
            <Download className="w-4 h-4 inline-block mr-2" /> Export
          </button>

          <button onClick={handleRefresh} className="px-4 py-2 border rounded text-indigo-700 hover:bg-indigo-50">
            <RefreshCw className="w-4 h-4 inline-block mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter card */}
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm text-slate-600 mb-2">Select DC</label>
            <div className="relative">
              <select
                value={dc}
                onChange={(e) => { setDc(e.target.value); setPage(1); }}
                className="w-full p-3 rounded border bg-white"
              >
                <option value="TS_MAHBADX">TS_MAHBADX</option>
                <option value="TS_SOMETHING">TS_SOMETHING</option>
                <option value="DC_03">DC_03</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm text-slate-600 mb-2">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded border bg-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center md:justify-end">
            <button onClick={handleSubmit} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
              Submit
            </button>
          </div>
        </div>
      </section>

      {/* Content card */}
      <section>
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          {/* Empty state banner like your screenshots */}
          {filtered.length === 0 ? (
            <div className="p-6">
              <div className="bg-indigo-200 border border-indigo-300 text-indigo-900 px-4 py-3 rounded">
                <strong>No Data to View!</strong>
              </div>

              <div className="mt-6 text-slate-600">
                <p>There are no inventory records for the selected DC & date.</p>
                <p className="mt-3">Try changing the DC or date, or click <span className="font-medium">Refresh</span>.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-auto custom-scroll">
                <table className="min-w-full w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-left">SKU</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-left">Name</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-left">DC</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-right">Opening</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-right">Received</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-right">Issued</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-right">Closing</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-left">UOM</th>
                      <th className="bg-[#001a8f] text-white px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageRows.map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-4 py-3 text-sm text-slate-800">{r.sku}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{r.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{r.dc}</td>
                        <td className="px-4 py-3 text-sm text-slate-800 text-right">{r.opening}</td>
                        <td className="px-4 py-3 text-sm text-slate-800 text-right">{r.received}</td>
                        <td className="px-4 py-3 text-sm text-slate-800 text-right">{r.issued}</td>
                        <td className="px-4 py-3 text-sm text-slate-800 text-right">{r.closing}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{r.uom}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination + footer */}
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
      </section>
    </div>
  );
}
