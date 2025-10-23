// DiscountInvoices.jsx
import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const SAMPLE_DATA = [
  {
    id: 1,
    customerName: "Ramesh Kumar",
    village: "Bageshwar",
    orderNo: "ORD-1001",
    invoiceNo: "INV-5001",
    totalAmount: 1250.0,
  },
  {
    id: 2,
    customerName: "Sita Devi",
    village: "Rampur",
    orderNo: "ORD-1002",
    invoiceNo: "INV-5002",
    totalAmount: 980.0,
  },
  {
    id: 3,
    customerName: "Amit Sharma",
    village: "Lakshmipur",
    orderNo: "ORD-1003",
    invoiceNo: "INV-5003",
    totalAmount: 2140.0,
  },
];

const formatCurrency = (n) =>
  typeof n === "number" ? `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : n;

export default function DiscountInvoices() {
  const [query, setQuery] = useState("");

  // filter rows by multiple fields (case-insensitive)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_DATA;
    return SAMPLE_DATA.filter((r) => {
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.village.toLowerCase().includes(q) ||
        r.orderNo.toLowerCase().includes(q) ||
        r.invoiceNo.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="min-h-[70vh] p-6">
      {/* Top centered search pill like screenshot */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md ring-1 ring-gray-200">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="outline-none text-sm placeholder:text-gray-400 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card container */}
      <div className="pt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {/* header styling close to screenshot */}
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Sl No</th>
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Customer Name</th>
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Village</th>
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Order No</th>
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Invoice No</th>
                  <th className="bg-[#07108e] px-6 py-5 text-left text-sm font-semibold text-white">Total Amount</th>
                  <th className="bg-[#07108e] px-6 py-5 text-center text-sm font-semibold text-white">Action</th>
                  <th className="bg-[#07108e] px-6 py-5 text-center text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr key={row.id} className="even:bg-white odd:bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.village}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.orderNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.invoiceNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button className="inline-flex items-center gap-2 rounded px-3 py-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button className="inline-flex items-center gap-2 rounded px-3 py-1 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Responsive stacking for very small screens: show rows as cards */}
          {/* This section will show only on xs widths (optional) */}
          <div className="md:hidden">
            {filtered.length === 0 ? null : filtered.map((r, i) => (
              <div key={`card-${r.id}`} className="p-4 border-t border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{i + 1}. {r.customerName}</div>
                    <div className="text-xs text-gray-500">{r.village} • {r.orderNo} • {r.invoiceNo}</div>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(r.totalAmount)}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded px-3 py-2 text-sm bg-blue-600 text-white">View</button>
                  <button className="flex-1 rounded px-3 py-2 text-sm border">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
