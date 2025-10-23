// src/pages/CashWithdrawl.tsx
import React, { useMemo, useState } from "react";
import {
  PlusCircle,
  Search,
  Download,
  Calendar,
  ChevronDown,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Row = {
  id: string;
  amount: number;
  category: string;
  vehicle: string;
  type: "Cash" | "Credit" | string;
  paymentType: string;
  spentOn: string;
  remarks?: string;
  requestedBy?: string;
};

const STATIC_ROWS: Row[] = [
  { id: "w1", amount: 5000, category: "Cash Withdrawal", vehicle: "MH-01-AB-1234", type: "Cash", paymentType: "Cash", spentOn: "2025-09-12", remarks: "Driver cash", requestedBy: "Admin" },
  { id: "w2", amount: 12000, category: "Advance", vehicle: "TS-09-ZZ-9876", type: "Credit", paymentType: "UPI", spentOn: "2025-09-11", remarks: "Advance pay", requestedBy: "Manager" },
  { id: "w3", amount: 2500, category: "Fuel", vehicle: "MH-01-AB-9999", type: "Cash", paymentType: "Cash", spentOn: "2025-09-10", remarks: "Fuel refuel", requestedBy: "Ops" },
  { id: "w4", amount: 750, category: "Toll", vehicle: "TS-09-AA-4444", type: "Cash", paymentType: "Cash", spentOn: "2025-09-09", remarks: "Toll", requestedBy: "Driver" },
  { id: "w5", amount: 6400, category: "Cash Withdrawal", vehicle: "MH-01-AB-3333", type: "Cash", paymentType: "Cash", spentOn: "2025-09-08", remarks: "Store cash", requestedBy: "Finance" },
  { id: "w6", amount: 3000, category: "Other", vehicle: "TS-09-ZZ-1234", type: "Credit", paymentType: "Card", spentOn: "2025-09-07", remarks: "Misc", requestedBy: "Admin" },
];

function formatCurrency(n: number) {
  return `₹ ${n.toLocaleString()}`;
}

export default function CashWithdrawl(): JSX.Element {
  // filters
  const [dc, setDc] = useState<string>("TS_MAHBADX");
  const [startDate, setStartDate] = useState<string>("2025-09-07");
  const [endDate, setEndDate] = useState<string>("2025-09-12");
  const [query, setQuery] = useState<string>("");

  // data + UI
  const [rows, setRows] = useState<Row[]>(STATIC_ROWS);
  const [page, setPage] = useState<number>(1);
  const perPage = 6;

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  // filter submit (currently local filter only - static)
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    toast.success("Filters applied (static data)");
  };

  // export CSV
  const exportCsv = () => {
    const headers = ["#", "Amount", "Category", "Vehicle", "Type", "Payment Type", "Spent On", "Remarks", "Requested By"];
    const lines = [headers.join(",")];
    filtered.forEach((r, idx) => {
      const row = [
        idx + 1,
        r.amount,
        `"${(r.category ?? "").replace(/"/g, '""')}"`,
        `"${(r.vehicle ?? "").replace(/"/g, '""')}"`,
        r.type,
        r.paymentType,
        r.spentOn,
        `"${(r.remarks ?? "").replace(/"/g, '""')}"`,
        r.requestedBy ?? "",
      ];
      lines.push(row.join(","));
    });
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cash_withdrawal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  // search + date filter (client-side)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const inQuery =
        !q ||
        String(r.category).toLowerCase().includes(q) ||
        String(r.vehicle).toLowerCase().includes(q) ||
        String(r.requestedBy ?? "").toLowerCase().includes(q) ||
        String(r.remarks ?? "").toLowerCase().includes(q);
      const inDate =
        (!startDate || r.spentOn >= startDate) && (!endDate || r.spentOn <= endDate);
      const inDc = true; // static data doesn't have dc field; keep placeholder for future
      return inQuery && inDate && inDc;
    });
  }, [rows, query, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  // add / edit modal actions (local)
  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (r: Row) => {
    setEditing(r);
    setIsModalOpen(true);
  };
  const deleteRow = (id: string) => {
    if (!confirm("Delete this record?")) return;
    setRows((p) => p.filter((r) => r.id !== id));
    toast.success("Deleted");
  };

  const saveRow = async (form: Partial<Row>) => {
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 500)); // mimic network
      if (editing) {
        // update
        setRows((p) => p.map((r) => (r.id === editing.id ? { ...r, ...(form as Row) } : r)));
        toast.success("Updated");
      } else {
        // create
        const newRow: Row = {
          id: `local-${Date.now()}`,
          amount: Number(form.amount ?? 0),
          category: form.category ?? "Cash Withdrawal",
          vehicle: form.vehicle ?? "",
          type: (form.type as any) ?? "Cash",
          paymentType: form.paymentType ?? "Cash",
          spentOn: form.spentOn ?? new Date().toISOString().slice(0, 10),
          remarks: form.remarks ?? "",
          requestedBy: form.requestedBy ?? "Admin",
        };
        setRows((p) => [newRow, ...p]);
        toast.success("Created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Summary numbers simple
  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* small internal CSS for styled scrollbar */}
      <style>{`
        /* Webkit scrollbar */
        .custom-scroll::-webkit-scrollbar { height: 10px; width: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #dbeafe; border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
        /* Firefox */
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #dbeafe transparent; }
      `}</style>

      {/* header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Cash Withdrawal Summary</h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-indigo-600 hover:underline cursor-pointer">Home</span>
            <span className="mx-2">-</span>
            <span>Cash Withdrawal Summary</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow">
            <PlusCircle className="w-4 h-4" /> New
          </button>

          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 h-10 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </header>

      {/* filter card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm text-slate-600 mb-2">Select DC</label>
            <div className="relative">
              <select value={dc} onChange={(e) => setDc(e.target.value)} className="w-full p-3 rounded border bg-white">
                <option>TS_MAHBADX</option>
                <option>TS_SOMETHING</option>
                <option>DC_03</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">Start Date</label>
            <div className="relative">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 rounded border bg-white" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">End Date</label>
            <div className="relative">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 rounded border bg-white" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button type="submit" className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* body: summary + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">No orders to process</h3>
              <div className="text-sm text-slate-500">{filtered.length} records</div>
            </div>

            {/* table container with custom scrollbar */}
            <div className="overflow-auto custom-scroll" style={{ maxHeight: "56vh" }}>
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">#</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Amount</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Category</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Vehicle</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Type</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Payment Type</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Spent On</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Remarks</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Requested By</th>
                    <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">No records found</td>
                    </tr>
                  ) : (
                    pageRows.map((r, idx) => (
                      <tr key={r.id} className="odd:bg-white even:bg-slate-50">
                        <td className="px-4 py-3">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(r.amount)}</td>
                        <td className="px-4 py-3">{r.category}</td>
                        <td className="px-4 py-3">{r.vehicle}</td>
                        <td className="px-4 py-3">{r.type}</td>
                        <td className="px-4 py-3">{r.paymentType}</td>
                        <td className="px-4 py-3">{r.spentOn}</td>
                        <td className="px-4 py-3">{r.remarks}</td>
                        <td className="px-4 py-3">{r.requestedBy}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(r)} title="Edit" className="p-2 rounded hover:bg-slate-100">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteRow(r.id)} title="Delete" className="p-2 rounded hover:bg-slate-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* footer: summary + pagination */}
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">Total Amount: <span className="font-semibold">{formatCurrency(totalAmount)}</span></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
                <div className="px-3 py-1 border rounded">{page}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* right column: quick stats or placeholder */}
        <aside className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="text-md font-semibold mb-3">Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Records</div>
              <div className="font-semibold">{filtered.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Total Amount</div>
              <div className="font-semibold">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="pt-2">
              <button onClick={exportCsv} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ModalAddEdit
          initial={editing}
          onClose={() => setIsModalOpen(false)}
          onSave={saveRow}
          saving={saving}
        />
      )}
    </div>
  );
}

/* Modal Component (inline) */
const ModalAddEdit: React.FC<{
  initial: Row | null;
  onClose: () => void;
  onSave: (f: Partial<Row>) => void;
  saving?: boolean;
}> = ({ initial, onClose, onSave, saving }) => {
  const [form, setForm] = useState<Partial<Row>>(
    initial ?? { amount: 0, category: "Cash Withdrawal", vehicle: "", type: "Cash", paymentType: "Cash", spentOn: new Date().toISOString().slice(0, 10), remarks: "", requestedBy: "Admin" }
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{initial ? "Edit Withdrawal" : "Add Withdrawal"}</h3>
          <div className="flex items-center gap-2">
            {saving && <div className="text-sm text-slate-500">Saving…</div>}
            <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="text-sm text-slate-600">Amount</div>
            <input type="number" value={form.amount ?? ""} onChange={(e) => setForm((s) => ({ ...s, amount: Number(e.target.value) }))} className="w-full p-2 border rounded" />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Category</div>
            <input value={form.category ?? ""} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} className="w-full p-2 border rounded" />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Vehicle</div>
            <input value={form.vehicle ?? ""} onChange={(e) => setForm((s) => ({ ...s, vehicle: e.target.value }))} className="w-full p-2 border rounded" />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Type</div>
            <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className="w-full p-2 border rounded">
              <option>Cash</option>
              <option>Credit</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Payment Type</div>
            <select value={form.paymentType} onChange={(e) => setForm((s) => ({ ...s, paymentType: e.target.value }))} className="w-full p-2 border rounded">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Spent On</div>
            <input type="date" value={form.spentOn} onChange={(e) => setForm((s) => ({ ...s, spentOn: e.target.value }))} className="w-full p-2 border rounded" />
          </label>

          <label className="md:col-span-2 space-y-1">
            <div className="text-sm text-slate-600">Remarks</div>
            <textarea value={form.remarks} onChange={(e) => setForm((s) => ({ ...s, remarks: e.target.value }))} className="w-full p-2 border rounded" rows={3} />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-600">Requested By</div>
            <input value={form.requestedBy ?? ""} onChange={(e) => setForm((s) => ({ ...s, requestedBy: e.target.value }))} className="w-full p-2 border rounded" />
          </label>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
