// TeleCallerStatus.jsx
import React, { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";

/**
 * TeleCallerStatus
 * - Tailwind CSS responsive layout (matches provided screenshot)
 * - Filters: Route, Village, Call Status
 * - Top-centered search pill (and compact circular search on small screens)
 * - Static sample data, client-side filtering + search
 * - Table for desktop, cards for mobile
 */

const ROUTES = [
  { id: "r1", label: "Route A" },
  { id: "r2", label: "Route B" },
  { id: "r3", label: "Route C" },
];

const VILLAGES = [
  { id: "v1", label: "Bageshwar" },
  { id: "v2", label: "Rampur" },
  { id: "v3", label: "Lakshmipur" },
];

const CALL_STATUSES = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "contacted", label: "Contacted" },
  { id: "no-answer", label: "No Answer" },
];

const SAMPLE = [
  {
    id: "TL-001",
    name: "Ramesh Kumar",
    route: "r1",
    village: "v1",
    phone: "9876543210",
    callStatus: "pending",
    lastCall: "2025-09-10",
  },
  {
    id: "TL-002",
    name: "Sita Devi",
    route: "r2",
    village: "v2",
    phone: "9123456780",
    callStatus: "contacted",
    lastCall: "2025-09-12",
  },
  {
    id: "TL-003",
    name: "Amit Sharma",
    route: "r1",
    village: "v3",
    phone: "9012345678",
    callStatus: "no-answer",
    lastCall: "2025-09-11",
  },
];

export default function TeleCallerStatus() {
  const [route, setRoute] = useState("");
  const [village, setVillage] = useState("");
  const [callStatus, setCallStatus] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE.filter((row) => {
      if (route && row.route !== route) return false;
      if (village && row.village !== village) return false;
      if (callStatus && callStatus !== "all" && row.callStatus !== callStatus) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
      );
    });
  }, [route, village, callStatus, query]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header: title + breadcrumb + search pill */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-medium text-gray-800">Telecaller</h2>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-blue-500 cursor-pointer">Home</span>
            <span className="mx-2 text-gray-300">-</span>
            <span> Telecaller-Status</span>
          </div>
        </div>

        {/* Search pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow ring-1 ring-gray-200">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, id or phone..."
              className="outline-none text-sm placeholder:text-gray-400 bg-transparent w-72 md:w-96"
            />
          </div>

          <div className="sm:hidden">
            <button
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow ring-1 ring-gray-200"
              aria-label="Search"
              onClick={() => {}}
            >
              <Search className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Route</label>
            <div className="relative">
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white outline-none"
              >
                <option value="">Select route</option>
                {ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Village */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Village</label>
            <div className="relative">
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white outline-none"
              >
                <option value="">Select village</option>
                {VILLAGES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Call Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Call Status</label>
            <div className="relative">
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white outline-none"
              >
                {CALL_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Mobile action row */}
        <div className="mt-4 md:hidden flex justify-end gap-2">
          <button
            onClick={() => {
              setRoute("");
              setVillage("");
              setCallStatus("all");
              setQuery("");
            }}
            className="px-3 py-2 rounded bg-white border text-sm"
          >
            Reset
          </button>
          <button
            onClick={() => {}}
            className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
          >
            Apply
          </button>
        </div>

        {/* Desktop action row */}
        <div className="hidden md:flex justify-end gap-2 mt-6">
          <button
            onClick={() => {
              setRoute("");
              setVillage("");
              setCallStatus("all");
              setQuery("");
            }}
            className="px-4 py-2 rounded bg-white border text-sm"
          >
            Reset
          </button>
          <button
            onClick={() => {}}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Results area */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records found</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Sl No</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Route</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Village</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Last Call</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Call Status</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{r.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ROUTES.find(x => x.id === r.route)?.label ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{VILLAGES.find(x => x.id === r.village)?.label ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{r.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{r.lastCall}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          r.callStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                          r.callStatus === "contacted" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {r.callStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => alert(`Open details for ${r.name}`)}
                          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-4">
              {filtered.map((r, idx) => (
                <div key={r.id} className="bg-white border rounded p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{idx + 1}. {r.name}</div>
                      <div className="text-xs text-gray-500">
                        {ROUTES.find(x => x.id === r.route)?.label} • {VILLAGES.find(x => x.id === r.village)?.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Phone: {r.phone}</div>
                      <div className="text-xs text-gray-500 mt-1">Last Call: {r.lastCall}</div>
                    </div>
                    <div className="text-sm font-medium">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        r.callStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                        r.callStatus === "contacted" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {r.callStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => alert(`Open details for ${r.name}`)}
                      className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => alert(`Call ${r.phone}`)}
                      className="px-3 py-2 rounded border text-sm"
                    >
                      Call
                    </button>
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
