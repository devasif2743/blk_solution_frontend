// src/pages/SlocStock.tsx
import React, { useState } from "react";
import { Search, Download, PlusCircle, Eye } from "lucide-react";

type SlocRow = {
  id: number;
  addedOn: string;
  impactType: string;
  noItems: number;
  addedBy: string;
  status: "PENDING" | "SETTLED";
  refNumber: string;
  remarks: string;
};

const DATA: SlocRow[] = [
  {
    id: 1,
    addedOn: "11-09-2025 04:28 PM",
    impactType: "GOOD_STOCK",
    noItems: 1,
    addedBy: "Sanda Vijay Kumar",
    status: "SETTLED",
    refNumber: "PO-202425025492",
    remarks: "Good stock received.",
  },
  {
    id: 2,
    addedOn: "10-09-2025 01:50 PM",
    impactType: "GOOD_STOCK",
    noItems: 1,
    addedBy: "Sanda Vijay Kumar",
    status: "SETTLED",
    refNumber: "PO-202425025356",
    remarks: "Good stock received.",
  },
  {
    id: 3,
    addedOn: "09-09-2025 06:40 PM",
    impactType: "GOOD_STOCK",
    noItems: 1,
    addedBy: "Sanda Vijay Kumar",
    status: "PENDING",
    refNumber: "PO-202425025347",
    remarks: "Waiting for approval.",
  },
  {
    id: 4,
    addedOn: "09-09-2025 06:39 PM",
    impactType: "GOOD_STOCK",
    noItems: 1,
    addedBy: "Sanda Vijay Kumar",
    status: "PENDING",
    refNumber: "PO-202425025346",
    remarks: "Awaiting confirmation.",
  },
];

export default function SlocStock(): JSX.Element {
  const [tab, setTab] = useState<"PENDING" | "SETTLED">("PENDING");
  const [q, setQ] = useState("");

  const filtered = DATA.filter(
    (row) =>
      row.status === tab &&
      (row.refNumber.toLowerCase().includes(q.toLowerCase()) ||
        row.remarks.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Sloc Stock List
          </h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-primary hover:underline">Home</span>
            <span className="mx-2">-</span>
            <span>Sloc Stock List</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 h-10 rounded border border-slate-200 bg-white"
            />
          </div>

          {/* Add Sloc Stock */}
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add Sloc Stock
          </button>

          {/* Export */}
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          onClick={() => setTab("PENDING")}
          className={`px-6 py-2 font-medium ${
            tab === "PENDING"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          PENDING
        </button>
        <button
          onClick={() => setTab("SETTLED")}
          className={`px-6 py-2 font-medium ${
            tab === "SETTLED"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          SETTLED
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              {[
                "Sl No",
                "Added On",
                "Impact Type",
                "No Items",
                "Added By",
                "Status",
                "Ref Number",
                "Remarks",
                "View",
              ].map((col) => (
                <th
                  key={col}
                  className="bg-[#001a8f] text-white px-4 py-3 text-left text-sm"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.addedOn}</td>
                  <td className="px-4 py-3">{row.impactType}</td>
                  <td className="px-4 py-3">{row.noItems}</td>
                  <td className="px-4 py-3">{row.addedBy}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        row.status === "SETTLED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.refNumber}</td>
                  <td className="px-4 py-3">{row.remarks}</td>
                  <td className="px-4 py-3">
                    <button className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
