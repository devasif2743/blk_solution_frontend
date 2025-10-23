import React, { useState } from "react";

/**
 * OrderReport (responsive, wider-fit)
 * - Static sample data (replace with API later)
 * - Date inputs, Submit button
 * - Responsive: table on md+, card list on small screens
 * - Wider container so table fits better on large screens
 */

const sampleRows = [
  { id: 1, status: "Packing", orderCount: 72, orderTotal: 265250 },
  { id: 2, status: "Invoice", orderCount: 0, orderTotal: 0 },
  { id: 3, status: "Dispatch", orderCount: 0, orderTotal: 0 },
  { id: 4, status: "Delivery", orderCount: 4, orderTotal: 56940 },
  { id: 5, status: "Complete", orderCount: 0, orderTotal: 0 },
];

const formatNumber = (n) => {
  if (n == null) return "-";
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function OrderReport() {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows] = useState(sampleRows);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with API call later
    console.log("Submit date range", { startDate, endDate });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Use a very wide container so table has more horizontal room on large screens */}
      <div className="max-w-screen-2xl mx-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-6 items-end mb-6">
          <div className="md:col-span-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Order Report</h2>
          <p className="text-sm text-gray-500">Summary by order status for the selected period.</p>
        </div>

        {/* Table wrapper */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Desktop / tablet table */}
          <div className="hidden md:block">
            {/* Make the inner container horizontally scrollable when viewport < table min width */}
            <div className="overflow-x-auto">
              {/* Ensure minimum width so the table doesn't compress too much */}
              <table className="min-w-[900px] lg:min-w-[1200px] w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky top-0 z-10 px-8 py-4 w-14 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sl
                    </th>

                    <th className="sticky top-0 z-10 px-8 py-4 w-96 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="sticky top-0 z-10 px-8 py-4 w-40 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Count
                    </th>

                    <th className="sticky top-0 z-10 px-8 py-4 w-56 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Total
                    </th>

                    <th className="sticky top-0 z-10 px-8 py-4 w-40 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((r, idx) => (
                    <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>

                      <td className="px-8 py-5 whitespace-normal text-sm">
                        <div className="text-sm font-semibold text-gray-800">{r.status}</div>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap text-sm text-right text-gray-700">{r.orderCount}</td>

                      <td className="px-8 py-5 whitespace-nowrap text-sm text-right text-gray-700">₹{formatNumber(r.orderTotal)}</td>

                      <td className="px-8 py-5 whitespace-nowrap text-sm text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(r)}
                          className="rounded-md border border-indigo-300 px-4 py-1 text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          aria-label={`View ${r.status} details`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            <ul className="divide-y divide-gray-200">
              {rows.map((r, idx) => (
                <li key={r.id} className="px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 grid place-items-center text-indigo-600 font-semibold">
                          {idx + 1}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{r.status}</div>
                        <div className="text-xs text-gray-500 mt-1">{r.orderCount} orders • ₹{formatNumber(r.orderTotal)}</div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedRow(r)}
                        className="rounded-md border border-indigo-300 px-3 py-1 text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        aria-label={`View ${r.status} details`}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal-like detail panel */}
        {selectedRow && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4 py-8">
            <div className="absolute inset-0 bg-black opacity-30" onClick={() => setSelectedRow(null)} />
            <div className="relative z-10 w-full max-w-xl rounded-lg bg-white shadow-lg">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedRow.status} — Details</h3>
                  <button
                    onClick={() => setSelectedRow(null)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close details"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-3">
                  <div>
                    <dt className="text-xs text-gray-500">Order Count</dt>
                    <dd className="mt-1 text-sm text-gray-800">{selectedRow.orderCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Order Total</dt>
                    <dd className="mt-1 text-sm text-gray-800">₹{formatNumber(selectedRow.orderTotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Time Period</dt>
                    <dd className="mt-1 text-sm text-gray-800">
                      {startDate} → {endDate}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button onClick={() => setSelectedRow(null)} className="rounded-md px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
