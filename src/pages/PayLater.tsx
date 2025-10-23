// PayLater.jsx
import React, { useMemo, useState } from "react";
import { Search, Send, Eye, UploadCloud } from "lucide-react";

/**
 * PayLater component
 * - Tailwind-based responsive layout that follows the provided design
 * - Tabs (Pending / Settled), centered search pill, top-right action
 * - Table/list (static data) + "View Payments" button
 * - Detail drawer opens when viewing a payment; drawer includes image upload & preview and Send button
 *
 * Usage: import and render <PayLater /> in your routes/pages.
 */

const SAMPLE_PAYMENTS = [
  {
    id: "PL-1001",
    customerName: "Ramesh Kumar",
    village: "Bageshwar",
    orderNo: "ORD-1001",
    invoiceNo: "INV-5001",
    totalAmount: 1250.0,
    status: "pending",
  },
  {
    id: "PL-1002",
    customerName: "Sita Devi",
    village: "Rampur",
    orderNo: "ORD-1002",
    invoiceNo: "INV-5002",
    totalAmount: 980.0,
    status: "settled",
  },
];

const formatCurrency = (n) =>
  typeof n === "number" ? `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : n;

export default function PayLater() {
  const [tab, setTab] = useState("pending"); // "pending" | "settled"
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null); // File
  const [uploadedPreview, setUploadedPreview] = useState(null); // dataURL

  // filter + tab
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_PAYMENTS.filter((p) => {
      if (p.status !== tab) return false;
      if (!q) return true;
      return (
        p.customerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.orderNo.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [tab, query]);

  // open drawer and reset upload state
  const openDrawerFor = (payment) => {
    setActivePayment(payment);
    setDrawerOpen(true);
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  // handle file input
  const onFileChange = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) {
      setUploadedFile(null);
      setUploadedPreview(null);
      return;
    }
    setUploadedFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setUploadedPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  // fake send (you can hook to API)
  const onSend = () => {
    if (!uploadedFile) {
      alert("Please upload an image before sending.");
      return;
    }
    // simulate send
    alert(`Sending ${uploadedFile.name} for payment ${activePayment.id}`);
    // clear and close
    setUploadedFile(null);
    setUploadedPreview(null);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* top row: search centered, Send To BL top-right */}
      <div className="relative mb-6">
        {/* centered search pill */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow ring-1 ring-gray-200 w-80 md:w-96">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              className="flex-1 outline-none text-sm placeholder:text-gray-400 bg-transparent"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* top-right action */}
        <div className="flex justify-end">
          <button
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm shadow"
            onClick={() => alert("Send To BL clicked (wire up action)")}
          >
            Send To BL
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-sm border border-b-0 overflow-hidden">
        <div className="flex text-sm md:text-base">
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 py-4 uppercase font-semibold tracking-wide ${
              tab === "pending" ? "bg-[#07108e] text-white" : "text-gray-600 bg-white"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setTab("settled")}
            className={`flex-1 py-4 uppercase font-semibold tracking-wide ${
              tab === "settled" ? "bg-[#07108e] text-white" : "text-gray-600 bg-white"
            }`}
          >
            Settled
          </button>
        </div>

        {/* content area */}
        <div className="p-6 bg-white border-t border-gray-100 min-h-[50vh] md:min-h-[60vh]">
          {/* If you have rows -> show table, else show empty like screenshot */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 h-64 md:h-96">
              <div className="text-lg md:text-xl">No records found</div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Sl No</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Customer Name</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Village</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Order No</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Invoice No</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Total Amount</th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-6 py-4 text-sm text-gray-800">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{r.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.village}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.orderNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.invoiceNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(r.totalAmount)}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => openDrawerFor(r)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Payments
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="md:hidden space-y-3">
                {filtered.map((r, idx) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {idx + 1}. {r.customerName}
                        </div>
                        <div className="text-xs text-gray-500">{r.village} • {r.orderNo} • {r.invoiceNo}</div>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(r.totalAmount)}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openDrawerFor(r)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 text-white"
                      >
                        <Eye className="h-4 w-4" />
                        View Payments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right drawer for View Payments (overlay) */}
      {drawerOpen && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/30 z-40"
          />

          <aside className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="text-sm font-semibold">Payment Details</div>
                <div className="text-xs text-gray-500">{activePayment?.id} • {activePayment?.customerName}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-sm px-3 py-1 rounded hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              {/* Summary */}
              <div className="mb-4">
                <div className="text-xs text-gray-500">Order</div>
                <div className="text-sm font-medium">{activePayment?.orderNo} — {activePayment?.invoiceNo}</div>
              </div>

              {/* Upload area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot / Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded p-4 flex flex-col items-center gap-3">
                  {uploadedPreview ? (
                    <img src={uploadedPreview} alt="preview" className="max-h-56 object-contain rounded" />
                  ) : (
                    <div className="text-center text-sm text-gray-400">No image uploaded</div>
                  )}

                  <div className="flex items-center gap-2 w-full">
                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-white border hover:bg-gray-50 text-sm cursor-pointer">
                      <UploadCloud className="h-4 w-4" />
                      <span>{uploadedFile ? uploadedFile.name : "Choose file"}</span>
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>

                    <button
                      onClick={() => { setUploadedFile(null); setUploadedPreview(null); }}
                      className="px-3 py-2 rounded bg-gray-100 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes / meta */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2">Notes (optional)</label>
                <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} placeholder="Add a note..." />
              </div>

              {/* Send CTA */}
              <div className="sticky bottom-0 bg-white py-4">
                <div className="flex gap-3">
                  <button
                    onClick={onSend}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
