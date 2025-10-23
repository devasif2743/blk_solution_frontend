// CrmReport.jsx
import React, { useState } from "react";
import { Eye, ChevronDown } from "lucide-react";

const TABS = ["Telecaller Report", "Sale Report", "App"];

const DATA = {
  "Telecaller Report": [
    {
      id: "1",
      name: "Ramesh Kumar",
      orderReceived: 5,
      uniqueOrders: 3,
      callNotReceived: 2,
      notInterested: 1,
      callLater: 1,
      stockAvailable: 2,
      callNotConnected: 0,
      switchOff: 1,
      total: 15,
    },
  ],
  "Sale Report": [
    {
      id: "2",
      name: "Sita Devi",
      totalSales: 10,
      totalAmount: 5000,
      discount: 500,
      finalAmount: 4500,
    },
  ],
  App: [
    {
      id: "3",
      user: "Amit Sharma",
      logins: 12,
      activeTime: "3h 20m",
      lastActive: "2025-09-12",
    },
  ],
};

export default function CrmReport() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header + breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-800">Telecaller</h2>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-blue-500 cursor-pointer">Home</span>
            <span className="mx-2 text-gray-300">-</span>
            <span> Crm-Report</span>
          </div>
        </div>

        {/* Export button */}
        <div className="relative">
          <button className="px-4 py-2 rounded bg-indigo-600 text-white flex items-center gap-1">
            Export <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Start Date
            </label>
            <input
              type="date"
              defaultValue="2025-09-12"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              End Date
            </label>
            <input
              type="date"
              defaultValue="2025-09-12"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Telecaller
            </label>
            <select className="w-full border rounded px-3 py-2 text-sm">
              <option>TS_MAHBAD</option>
              <option>TS_RAMPUR</option>
              <option>TS_LUCKNOW</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === tab
                  ? "bg-indigo-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tables per tab */}
        <div className="overflow-x-auto">
          {activeTab === "Telecaller Report" && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3">Order Received</th>
                  <th className="px-4 py-3">Unique Orders</th>
                  <th className="px-4 py-3">Call not received</th>
                  <th className="px-4 py-3">Not interested</th>
                  <th className="px-4 py-3">Call later</th>
                  <th className="px-4 py-3">Stock Available</th>
                  <th className="px-4 py-3">Call not connected</th>
                  <th className="px-4 py-3">Switch Off</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {DATA["Telecaller Report"].map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 text-center">{row.orderReceived}</td>
                    <td className="px-4 py-3 text-center">{row.uniqueOrders}</td>
                    <td className="px-4 py-3 text-center">{row.callNotReceived}</td>
                    <td className="px-4 py-3 text-center">{row.notInterested}</td>
                    <td className="px-4 py-3 text-center">{row.callLater}</td>
                    <td className="px-4 py-3 text-center">{row.stockAvailable}</td>
                    <td className="px-4 py-3 text-center">{row.callNotConnected}</td>
                    <td className="px-4 py-3 text-center">{row.switchOff}</td>
                    <td className="px-4 py-3 text-center">{row.total}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setShowModal(true)}
                        className="p-2 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "Sale Report" && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3">Total Sales</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Final Amount</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {DATA["Sale Report"].map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 text-center">{row.totalSales}</td>
                    <td className="px-4 py-3 text-center">{row.totalAmount}</td>
                    <td className="px-4 py-3 text-center">{row.discount}</td>
                    <td className="px-4 py-3 text-center">{row.finalAmount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setShowModal(true)}
                        className="p-2 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "App" && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3">Logins</th>
                  <th className="px-4 py-3">Active Time</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {DATA["App"].map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{row.user}</td>
                    <td className="px-4 py-3 text-center">{row.logins}</td>
                    <td className="px-4 py-3 text-center">{row.activeTime}</td>
                    <td className="px-4 py-3 text-center">{row.lastActive}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setShowModal(true)}
                        className="p-2 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Report Details</h3>
            <p className="text-gray-600 text-sm mb-6">
              Here you can show detailed CRM report data for the selected record.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded border"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
