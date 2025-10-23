import React, { useMemo, useState } from "react";

/**
 * QrPayments (updated)
 * - Tailwind CSS
 * - Static sample data (replace with API later)
 * - Search bar added (filters Payment ID and Status)
 * - Buttons size reduced (compact)
 * - Export uses filtered rows
 */

const SAMPLE_PAYMENTS = [
  { id: "PAY-1001", date: "2025-09-12", amount: 12500, status: "Completed" },
  { id: "PAY-1002", date: "2025-09-11", amount: 7200, status: "Pending" },
  { id: "PAY-1003", date: "2025-09-11", amount: 3400, status: "Failed" },
  { id: "PAY-1004", date: "2025-09-10", amount: 56940, status: "Completed" },
  { id: "PAY-1005", date: "2025-09-09", amount: 1980, status: "Completed" },
];

const formatCurrency = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : n ?? "-";

/** CSV export helper */
function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const header = Object.keys(rows[0] || {}).join(",");
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((val) => {
          if (val == null) return "";
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function QrPayments() {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows] = useState(SAMPLE_PAYMENTS);

  // NEW: search state (filters by id or status)
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with API call to fetch data for the selected date range if needed
    console.log("Fetch payments for", { startDate, endDate });
  };

  // Filter rows based on search text (case-insensitive)
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.id).toLowerCase().includes(q) ||
        String(r.status).toLowerCase().includes(q) ||
        String(r.date).toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleExport = () => {
    downloadCSV(`qr-payments-${startDate}_to_${endDate}.csv`, filteredRows);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-screen-2xl mx-auto">
        {/* Card-like form area */}
        <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
            {/* Start Date */}
            <div className="md:col-span-3">
              <label htmlFor="start" className="block text-sm font-medium text-gray-600 mb-2">
                Start Date
              </label>
              <input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* End Date */}
            <div className="md:col-span-3">
              <label htmlFor="end" className="block text-sm font-medium text-gray-600 mb-2">
                End Date
              </label>
              <input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Search bar */}
            <div className="md:col-span-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Payment ID, Status or Date..."
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Search payments"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Buttons (compact) */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                aria-label="Submit"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                aria-label="Export"
              >
                Export
              </button>
            </div>
          </form>
        </div>

        {/* Table area */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {/* Table header area */}
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Payments List</h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing static sample data. Results are filtered by the search box and exported accordingly.
            </p>
          </div>

          {/* Table */}
          <div className="p-4 overflow-x-auto">
            <table className="min-w-[720px] w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRows.map((r, i) => (
                  <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{r.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.date}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">₹{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : r.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <button
                        type="button"
                        onClick={() => alert(`Viewing ${r.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-gray-200 rounded text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No payments found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer (optional): totals or pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredRows.length}</span> records
            </div>
            <div className="text-sm text-gray-500">{/* placeholder for pagination */}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
