// ObSales.jsx
import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

/**
 * ObSales
 * - Tailwind CSS responsive layout matching provided screenshot
 * - Search bar top-right, date filters, large submit button
 * - Uses static data (BRANDS) for now; client-side search + date filtering
 */

const BRANDS = [
  {
    id: "B-001",
    name: "Brand A",
    date: "2025-09-12",
    notes: "Top performing brand",
  },
  {
    id: "B-002",
    name: "Brand B",
    date: "2025-09-10",
    notes: "Needs restock",
  },
];

export default function ObSales() {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("2025-09-12");
  const [endDate, setEndDate] = useState("2025-09-12");
  const [applied, setApplied] = useState(false);

  // filter by query and date range (simple inclusive compare)
  const filtered = useMemo(() => {
    if (!applied) return BRANDS; // show data before submit for demo
    const q = query.trim().toLowerCase();
    return BRANDS.filter((b) => {
      const dateMatch = (!startDate || b.date >= startDate) && (!endDate || b.date <= endDate);
      const textMatch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.notes || "").toLowerCase().includes(q);
      return dateMatch && textMatch;
    });
  }, [query, startDate, endDate, applied]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header + breadcrumb + search */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800">OBSales</h1>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-blue-500 cursor-pointer">Home</span>
            <span className="mx-2 text-gray-300">-</span>
            <span> Obsales</span>
          </div>
        </div>

        {/* search box */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white rounded-md px-2 py-1 shadow ring-1 ring-gray-200">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-1 outline-none text-sm w-56 md:w-72"
            />
            <button
              onClick={() => setApplied(true)}
              className="ml-2 inline-flex items-center justify-center w-9 h-9 bg-indigo-600 rounded text-white"
              aria-label="search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* small mobile search icon */}
          <div className="sm:hidden">
            <button
              onClick={() => setApplied(true)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow ring-1 ring-gray-200"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm bg-white"
            />
          </div>

          <div className="md:col-span-1 md:col-start-4 flex justify-end">
            <button
              onClick={() => setApplied(true)}
              className="w-full md:w-auto px-6 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Large content card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 min-h-[200px]">
        {/* If no results show message centered like screenshot */}
        {filtered.length === 0 ? (
          <div className="text-gray-600 text-lg md:text-xl">No brands to process</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="px-6 py-3">Brand ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{b.id}</td>
                      <td className="px-6 py-4">{b.name}</td>
                      <td className="px-6 py-4">{b.date}</td>
                      <td className="px-6 py-4">{b.notes}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => alert(`View ${b.name}`)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded bg-indigo-100 text-indigo-700"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {filtered.map((b) => (
                <div key={b.id} className="border rounded p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.id} • {b.date}</div>
                      <div className="text-xs text-gray-500 mt-2">{b.notes}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => alert(`View ${b.name}`)}
                        className="w-10 h-10 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
