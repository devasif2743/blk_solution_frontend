import React, { useMemo, useState } from "react";

/**
 * VendorList
 * - Static data
 * - Tabs: Active, In-Active, Default, Finance Approval, Procurement Approval
 * - Search bar, Export button
 * - Responsive, Tailwind CSS
 *
 * Usage: place into a route or page. Ensure Tailwind is available.
 */

type Vendor = {
  id: string;
  name: string;
  gst: string;
  email: string;
  city: string;
  creditPeriod: number;
  status: "active" | "inactive" | "default" | "finance" | "procurement";
};

const SAMPLE_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "A .V. NIDONIIII",
    gst: "29AAHFU2662F1ZK",
    email: "rajreddy801@gmail.com",
    city: "AthanII",
    creditPeriod: 5,
    status: "active",
  },
  {
    id: "2",
    name: "Bilagi Sugar Mill Limited",
    gst: "29AADC B2390L1ZE".replace(" ", ""),
    email: "abc@gmail.com",
    city: "Bengaluru",
    creditPeriod: 2,
    status: "inactive",
  },
  {
    id: "3",
    name: "vilcart1607",
    gst: "sdfsr34232342323",
    email: "vilcart1607@vilcart.com",
    city: "Bengaluru",
    creditPeriod: 3,
    status: "default",
  },
  {
    id: "4",
    name: "Alpha Traders",
    gst: "07AABCU9603R1Z2",
    email: "alpha@example.com",
    city: "Hyderabad",
    creditPeriod: 7,
    status: "finance",
  },
  {
    id: "5",
    name: "Omega Supplies",
    gst: "08AABCU9603R1Z3",
    email: "omega@example.com",
    city: "Mumbai",
    creditPeriod: 4,
    status: "procurement",
  },
];

const tabs = [
  { key: "active", label: "ACTIVE" },
  { key: "inactive", label: "IN-ACTIVE" },
  { key: "default", label: "DEFAULT" },
  { key: "finance", label: "FINANCE APPROVAL" },
  { key: "procurement", label: "PROCUREMENT APPROVAL" },
];

export default function VendorList(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("inactive"); // match screenshot selected tab
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // local toggle state for "default" switch (persist in state map)
  const [defaultMap, setDefaultMap] = useState<Record<string, boolean>>(
    SAMPLE_VENDORS.reduce((acc, v) => {
      acc[v.id] = v.status === "default";
      return acc;
    }, {} as Record<string, boolean>)
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_VENDORS.filter((v) => {
      if (activeTab && activeTab !== "all" && v.status !== activeTab) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.gst.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
      );
    });
  }, [search, activeTab]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleDefault(id: string) {
    setDefaultMap((m) => ({ ...m, [id]: !m[id] }));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb / Title */}
      <div className="mb-6">
        <div className="text-2xl font-semibold text-slate-800">Vendors</div>
        <div className="text-sm text-slate-400 mt-1">Home - Vendors List</div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                }}
                className={`text-sm font-semibold px-4 py-2 rounded-t-md ${
                  activeTab === t.key
                    ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, GST, email or city"
                  className="pl-10 pr-3 py-2 rounded-md border bg-white text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              {/* Export */}
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 text-sm"
                >
                  Export
                  <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-90">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M12 5v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="p-6">
          <div className="rounded-lg border overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="bg-slate-900 text-white text-left">
                  <th className="w-14 p-4 text-center">Sl No</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">E-Mail</th>
                  <th className="p-4">City</th>
                  <th className="p-4 text-center">Credit Period</th>
                  <th className="p-4 text-center">Action</th>
                  <th className="p-4 text-center">Default Action</th>
                </tr>
              </thead>

              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No vendors found
                    </td>
                  </tr>
                ) : (
                  pageData.map((v, idx) => (
                    <tr key={v.id} className="odd:bg-white even:bg-slate-50">
                      <td className="p-4 text-center align-middle">{(page - 1) * perPage + idx + 1}</td>

                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-slate-700">{v.name}</div>
                      </td>

                      <td className="p-4 align-middle">
                        <div className="text-sm text-slate-600">{v.gst}</div>
                      </td>

                      <td className="p-4 align-middle">
                        <div className="text-sm text-slate-600">{v.email}</div>
                      </td>

                      <td className="p-4 align-middle">
                        <div className="text-sm text-slate-600">{v.city}</div>
                      </td>

                      <td className="p-4 text-center align-middle">
                        <div className="text-sm text-slate-700">{v.creditPeriod}</div>
                      </td>

                      <td className="p-4 text-center align-middle">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-violet-600 hover:bg-violet-700 text-white shadow"
                          onClick={() => alert(`View vendor: ${v.name}`)}
                          aria-label="View vendor"
                        >
                          {/* eye icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
                          </svg>
                        </button>
                      </td>

                      <td className="p-4 text-center align-middle">
                        <div className="inline-flex items-center gap-3">
                          {/* toggle */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!defaultMap[v.id]}
                              onChange={() => toggleDefault(v.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-emerald-400 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-200"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                          </label>
                          <button
                            onClick={() => alert(`Set default for ${v.name}: ${!defaultMap[v.id]}`)}
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            Defaulter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">Rows per page:</div>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <div className="text-sm text-slate-500">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Prev
              </button>
              <div className="text-sm px-3 py-1">{page} / {totalPages}</div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
