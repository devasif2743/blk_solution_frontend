// ExpenseSummary.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Search,
  Download,
  Calendar,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://192.168.29.102:5000/api";

type Expense = {
  id: string;
  amount: number;
  category: string;
  vehicle: string;
  vehicleType?: string;
  type: "Cash" | "Credit" | string;
  paymentType: string;
  spentOn: string;
  transactionType?: string;
  remarks?: string;
  requestedBy?: string;
  requestedOn?: string;
  dc?: string;
  verified?: boolean;
};

const initialStatic: Expense[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `tmp-${i + 1}`,
  amount: (i + 1) * 1200,
  category: ["Fuel", "Toll", "Misc", "Salary", "Maintenance", "Other", "Parts", "Office"][i % 8],
  vehicle: i % 2 === 0 ? "MH-01-AB-1234" : "TS-09-ZZ-9876",
  vehicleType: "Truck",
  type: i % 2 === 0 ? "Cash" : "Credit",
  paymentType: i % 3 === 0 ? "UPI" : "Cash",
  spentOn: "2025-09-12",
  transactionType: "Expense",
  remarks: "Sample remark",
  requestedBy: "Admin",
  requestedOn: "2025-09-11",
  dc: "TS_MAHBADX",
  verified: i % 4 === 0 ? true : false,
}));

const formatCurrency = (n: number) =>
  n === null || n === undefined ? "-" : `₹ ${n.toLocaleString()}`;

export default function ExpenseSummary(): JSX.Element {
  const [dc, setDc] = useState<string>("TS_MAHBADX");
  const [startDate, setStartDate] = useState<string>("2025-09-12");
  const [endDate, setEndDate] = useState<string>("2025-09-12");
  const [query, setQuery] = useState<string>("");

  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(6);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async (opts?: { showToastOnError?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        dc,
        start: startDate,
        end: endDate,
        q: query,
        page: String(page),
        limit: String(perPage * 10),
      });

      const res = await fetch(`${API_BASE}/expenses?${params.toString()}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText || "Failed");
        console.warn("Expenses API failed:", res.status, txt);
        if (opts?.showToastOnError !== false) toast.error("Failed to load expenses, using local data.");
        setRows(initialStatic);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => null);
      let list: any[] = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data.rows)) list = data.rows;
      else if (Array.isArray(data.data)) list = data.data;
      else if (Array.isArray(data.expenses)) list = data.expenses;
      else list = [];

      const normalized: Expense[] = list.map((r: any, idx: number) => ({
        id: String(r.id ?? r._id ?? r.uuid ?? `srv-${idx}`),
        amount: Number(r.amount ?? r.amt ?? 0),
        category: r.category ?? r.expense_category ?? "Misc",
        vehicle: r.vehicle_no ?? r.vehicle ?? "",
        vehicleType: r.vehicle_type ?? "Truck",
        type: r.type ?? (r.paymentType === "Credit" ? "Credit" : "Cash"),
        paymentType: r.paymentType ?? r.payment_type ?? "Cash",
        spentOn: r.spentOn ?? r.spent_on ?? r.date ?? startDate,
        transactionType: r.transactionType ?? "Expense",
        remarks: r.remarks ?? "",
        requestedBy: r.requestedBy ?? r.requested_by ?? "User",
        requestedOn: r.requestedOn ?? r.requested_on ?? startDate,
        dc: r.dc ?? dc,
        verified: Boolean(r.verified),
      }));

      setRows(normalized);
    } catch (err: any) {
      console.error("Fetch expenses error:", err);
      setError("Network error");
      toast.error("Network error while loading expenses, using fallback data.");
      setRows(initialStatic);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dc, startDate, endDate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = rows;
    if (q) {
      arr = arr.filter(
        (r) =>
          String(r.category).toLowerCase().includes(q) ||
          String(r.vehicle).toLowerCase().includes(q) ||
          String(r.amount).toLowerCase().includes(q) ||
          String(r.remarks).toLowerCase().includes(q)
      );
    }
    return arr;
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageRows = useMemo(() => {
    const startIdx = (page - 1) * perPage;
    return filtered.slice(startIdx, startIdx + perPage);
  }, [filtered, page, perPage]);

  const summary = useMemo(() => {
    const cash = filtered.filter((r) => r.type?.toLowerCase() === "cash");
    const credit = filtered.filter((r) => r.type?.toLowerCase() === "credit");
    const sum = (arr: Expense[]) => arr.reduce((s, r) => s + (r.amount || 0), 0);
    return {
      cashOpening: 0,
      cashRequested: 0,
      cashExpenses: sum(cash),
      cashBalance: 0 - sum(cash),
      creditOpening: -122425,
      creditRequested: 0,
      creditExpenses: sum(credit),
      creditBalance: -122425 - sum(credit),
    };
  }, [filtered]);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (r: Expense) => {
    setEditing(r);
    setIsModalOpen(true);
  };

  const buildPayload = (payload: Partial<Expense>) => ({
    amount: payload.amount,
    category: payload.category,
    vehicle: payload.vehicle,
    vehicle_type: payload.vehicleType,
    type: payload.type,
    paymentType: payload.paymentType,
    spentOn: payload.spentOn,
    transactionType: payload.transactionType,
    remarks: payload.remarks,
    requestedBy: payload.requestedBy,
    requestedOn: payload.requestedOn,
    dc: payload.dc ?? dc,
  });

  const saveExpense = async (form: Partial<Expense>) => {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/expenses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form)),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(txt || `Update failed (${res.status})`);
        }
        setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...(form as Expense) } : r)));
        toast.success("Expense updated");
      } else {
        const res = await fetch(`${API_BASE}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form)),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(txt || `Create failed (${res.status})`);
        }
        const created = await res.json().catch(() => null);
        const createdRow: Expense = {
          id: created?.id ?? `local-${Date.now()}`,
          amount: Number(form.amount ?? 0),
          category: form.category ?? "Misc",
          vehicle: form.vehicle ?? "",
          vehicleType: form.vehicleType ?? "Truck",
          type: (form.type as string) ?? "Cash",
          paymentType: form.paymentType ?? "Cash",
          spentOn: form.spentOn ?? new Date().toISOString().slice(0, 10),
          transactionType: form.transactionType ?? "Expense",
          remarks: form.remarks ?? "",
          requestedBy: form.requestedBy ?? "User",
          requestedOn: form.requestedOn ?? new Date().toISOString().slice(0, 10),
          dc: form.dc ?? dc,
        };
        setRows((prev) => [createdRow, ...prev]);
        toast.success("Expense created");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save expense error:", err);
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        throw new Error(txt || `Delete failed (${res.status})`);
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Deleted");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Delete failed");
    }
  };

  const bulkVerify = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast("Select rows first");
      return;
    }
    if (!confirm(`Verify ${ids.length} selected items?`)) return;
    try {
      const res = await fetch(`${API_BASE}/expenses/bulk-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        throw new Error(txt || `Verify failed (${res.status})`);
      }
      setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, verified: true } : r)));
      setSelected({});
      toast.success("Verified");
    } catch (err: any) {
      console.error("Bulk verify error:", err);
      toast.error(err?.message || "Verify failed");
    }
  };

  const exportCsv = () => {
    const cols = [
      "#",
      "Amount",
      "Category",
      "Vehicle",
      "Vehicle Type",
      "Type",
      "Payment Type",
      "Spent On",
      "Transaction Type",
      "Remarks",
      "Requested By",
      "Requested On",
    ];
    const lines = [cols.join(",")];
    filtered.forEach((r, idx) => {
      const row = [
        idx + 1,
        r.amount,
        `"${(r.category ?? "").replace(/"/g, '""')}"`,
        `"${(r.vehicle ?? "").replace(/"/g, '""')}"`,
        r.vehicleType ?? "",
        r.type ?? "",
        r.paymentType ?? "",
        r.spentOn ?? "",
        r.transactionType ?? "",
        `"${(r.remarks ?? "").replace(/"/g, '""')}"`,
        r.requestedBy ?? "",
        r.requestedOn ?? "",
      ];
      lines.push(row.join(","));
    });
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Modal (same as before) - kept minimal for brevity
  const ExpenseModal: React.FC<{ open: boolean; onClose: () => void; initial?: Expense | null; onSave: (f: Partial<Expense>) => void; saving?: boolean }> = ({
    open,
    onClose,
    initial,
    onSave,
    saving,
  }) => {
    const [form, setForm] = useState<Partial<Expense>>(
      initial ?? {
        amount: 0,
        category: "",
        vehicle: "",
        vehicleType: "Truck",
        type: "Cash",
        paymentType: "Cash",
        spentOn: new Date().toISOString().slice(0, 10),
        transactionType: "Expense",
        remarks: "",
        requestedBy: "Admin",
        requestedOn: new Date().toISOString().slice(0, 10),
      }
    );

    useEffect(() => {
      setForm(
        initial ?? {
          amount: 0,
          category: "",
          vehicle: "",
          vehicleType: "Truck",
          type: "Cash",
          paymentType: "Cash",
          spentOn: new Date().toISOString().slice(0, 10),
          transactionType: "Expense",
          remarks: "",
          requestedBy: "Admin",
          requestedOn: new Date().toISOString().slice(0, 10),
        }
      );
    }, [initial, open]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{initial ? "Edit Expense" : "Add Expense"}</h3>
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
          </div>

          <div className="p-4 border-t flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button
              onClick={() => onSave(form)}
              disabled={saving}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  };

  // central handler for filter form submit (works for button and Enter)
  const handleFilterSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    await fetchExpenses({ showToastOnError: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Top bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Expense Summary</h1>
            <nav className="text-sm text-slate-500 mt-1">
              <span className="text-primary hover:underline">Home</span>
              <span className="mx-2">-</span>
              <span>Expense Summary List</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={openAdd} type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow">
            <PlusCircle className="w-4 h-4" />
            Add Cash Ledger
          </button>

          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-3 h-10 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button onClick={exportCsv} type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded shadow">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Filter card - now a form */}
      <form onSubmit={handleFilterSubmit} className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
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
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded border bg-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-slate-600 mb-2">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 rounded border bg-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* Summary */}
      <section className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Summary</h2>
            <div className="text-sm text-slate-500">Updated {new Date().toLocaleString()}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-[#001a8f] text-white px-6 py-4 text-left">Type</th>
                  <th className="bg-[#001a8f] text-white px-6 py-4 text-left">Opening Balance</th>
                  <th className="bg-[#001a8f] text-white px-6 py-4 text-left">Requested</th>
                  <th className="bg-[#001a8f] text-white px-6 py-4 text-left">Expenses</th>
                  <th className="bg-[#001a8f] text-white px-6 py-4 text-left">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="odd:bg-white even:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">Cash</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.cashOpening)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.cashRequested)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.cashExpenses)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.cashBalance)}</td>
                </tr>
                <tr className="odd:bg-white even:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">Credit</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.creditOpening)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.creditRequested)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.creditExpenses)}</td>
                  <td className="px-6 py-4 text-slate-700">{formatCurrency(summary.creditBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Table area */}
      <section>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">No orders to process</h3>

            <div className="flex items-center gap-2">
              <button onClick={bulkVerify} className="px-3 py-2 rounded border flex items-center gap-2">
                <Check className="w-4 h-4" /> Verify Selected
              </button>
            </div>
          </div>

          <div className="overflow-auto" style={{ maxHeight: "52vh" }}>
            <table className="min-w-[900px] w-full">
              <thead>
                <tr>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const pageIds = pageRows.map((r) => r.id);
                        setSelected((prev) => {
                          const next = { ...prev };
                          pageIds.forEach((id) => (next[id] = checked));
                          return next;
                        });
                      }}
                      checked={pageRows.every((r) => selected[r.id]) && pageRows.length > 0}
                    />
                  </th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">#</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Amount</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Category</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Vehicle</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Vehicle Type</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Type</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Payment Type</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Spent On</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Remarks</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Requested By</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Requested On</th>
                  <th className="bg-[#001a8f] text-white px-4 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={14} className="p-6 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="p-6 text-center text-slate-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr key={row.id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={!!selected[row.id]} onChange={() => toggleSelect(row.id)} />
                      </td>
                      <td className="px-4 py-3">{(page - 1) * perPage + idx + 1}</td>
                      <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.vehicle}</td>
                      <td className="px-4 py-3">{row.vehicleType}</td>
                      <td className="px-4 py-3">{row.type}</td>
                      <td className="px-4 py-3">{row.paymentType}</td>
                      <td className="px-4 py-3">{row.spentOn}</td>
                      <td className="px-4 py-3">{row.remarks}</td>
                      <td className="px-4 py-3">{row.requestedBy}</td>
                      <td className="px-4 py-3">{row.requestedOn}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(row)} title="Edit" className="p-2 rounded hover:bg-slate-100">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteRow(row.id)} title="Delete" className="p-2 rounded hover:bg-slate-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {row.verified ? (
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-500">Showing {filtered.length} records (page {page} of {totalPages})</div>

            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
              <div className="px-3 py-1 border rounded">{page}</div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      </section>

      <ExpenseModal open={isModalOpen} onClose={() => setIsModalOpen(false)} initial={editing} onSave={saveExpense} saving={saving} />
    </div>
  );
}
