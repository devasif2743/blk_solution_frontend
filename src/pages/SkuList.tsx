import React, { useMemo, useState } from "react";
import { Search, DownloadCloud, Edit2, X } from "lucide-react";

/**
 * SkuList.tsx
 *
 * - Search input and Export button are on the same line (responsive: stack on small screens).
 * - Search triggers on Enter or Search button click.
 * - Export uses the current filtered rows.
 * - Modal edit preserves previous behavior.
 *
 * Requires: Tailwind CSS + lucide-react
 */

type SkuRow = {
  id: string;
  slNo: number;
  hsn: string;
  name: string;
  stockQty: number;
  localName?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  amountType?: string;
};

const SAMPLE_ROWS: SkuRow[] = [
  {
    id: "sku-1",
    slNo: 1,
    hsn: "15089091",
    name: "Niranthara Premium Lamp Oil 200ml",
    stockQty: 25.76,
    localName: "నిరంతర ప్రీమియం లంప్ ఆయిల్ 200 మి.లీ",
    category: "Oil And Ghee",
    subCategory: "Deepam",
    brand: "VSPL",
    amountType: "net",
  },
  {
    id: "sku-2",
    slNo: 2,
    hsn: "15089091",
    name: "Niranthara Premium Lamp Oil 900ml",
    stockQty: 0,
    localName: "నిరంతర ప్రీమియం లంప్ ఆయిల్ 900 మి.లీ",
    category: "Oil And Ghee",
    subCategory: "Deepam",
    brand: "VSPL",
    amountType: "net",
  },
  {
    id: "sku-3",
    slNo: 3,
    hsn: "15089091",
    name: "Niranthara Premium Lamp Oil 450ml",
    stockQty: 38.4666,
    localName: "నిరంతర ప్రీమియం లంప్ ఆయిల్ 450 మి.లీ",
    category: "Oil And Ghee",
    subCategory: "Deepam",
    brand: "VSPL",
    amountType: "net",
  },
];

export default function SkuList(): JSX.Element {
  const [rows] = useState<SkuRow[]>(SAMPLE_ROWS);
  const [query, setQuery] = useState("");
  const [filteredRows, setFilteredRows] = useState<SkuRow[]>(rows);
  const [isExporting, setIsExporting] = useState(false);

  // modal state for edit
  const [editing, setEditing] = useState<SkuRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState<string>("");
  const [editErrors, setEditErrors] = useState<{ name?: string; stock?: string }>({});

  // filtering logic
  const onSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredRows(rows);
      return;
    }
    setFilteredRows(
      rows.filter(
        (r) =>
          String(r.slNo).includes(q) ||
          r.hsn.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.localName || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q)
      )
    );
  };

  // Export visible rows as CSV
  const exportCsv = () => {
    const exportRows = filteredRows.length ? filteredRows : rows;
    if (exportRows.length === 0) return;
    setIsExporting(true);
    const headers = [
      "Sl No",
      "HSN code",
      "Name",
      "Stock Qty",
      "Local name",
      "Category",
      "Sub Category",
      "Brand",
      "Amount Type",
    ];
    const lines = exportRows.map((r) =>
      [
        r.slNo,
        r.hsn,
        `"${String(r.name).replace(/"/g, '""')}"`,
        r.stockQty,
        `"${String(r.localName ?? "").replace(/"/g, '""')}"`,
        r.category ?? "",
        r.subCategory ?? "",
        r.brand ?? "",
        r.amountType ?? "",
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sku_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 400);
  };

  // Open edit modal
  const openEdit = (r: SkuRow) => {
    setEditing(r);
    setEditName(r.name);
    setEditStock(String(r.stockQty));
    setEditErrors({});
    document.body.style.overflow = "hidden";
  };

  const closeEdit = () => {
    setEditing(null);
    setEditErrors({});
    document.body.style.overflow = "";
  };

  const saveEdit = () => {
    const errs: { name?: string; stock?: string } = {};
    if (!editName.trim()) errs.name = "Item name is required";
    if (editStock.trim() === "") errs.stock = "Stock is required";
    else if (isNaN(Number(editStock)) || Number(editStock) < 0) errs.stock = "Enter a valid non-negative number";

    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    // Replace with actual save to backend. For now just close modal.
    closeEdit();
  };

  // displayed rows: if user has searched, use filteredRows; else show all
  const displayed = filteredRows.length ? filteredRows : rows;

  // stock pill
  const StockPill: React.FC<{ value: number }> = ({ value }) => {
    const formatted = Number.isFinite(value) ? value.toFixed(4).replace(/\.?0+$/, (m) => m) : "0";
    return (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-medium shadow">
        {formatted}
      </span>
    );
  };

  // Enter triggers search
  const onKeySearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">SKU List</h1>
          <div className="text-sm text-slate-500 mt-1">
            <a href="/" className="text-indigo-500 hover:underline">
              Home
            </a>{" "}
            <span className="mx-2"> - </span> SKU List
          </div>
        </div>

        {/* SEARCH + EXPORT - same line, responsive */}
        <div className="w-full md:w-auto">
          <form onSubmit={onSearch} className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            {/* search input group */}
            <div className="flex items-center w-full sm:w-[520px]">
              <label htmlFor="sku-search" className="sr-only">
                Search SKUs
              </label>
              <div className="relative flex-1">
                <input
                  id="sku-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeySearch}
                  placeholder="Search..."
                  aria-label="Search SKUs"
                  className="w-full h-10 rounded-l-md border border-gray-300 px-3 pl-10 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              {/* search button */}
              <button
                type="submit"
                className="h-10 w-10 ml-2 rounded-r-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white"
                aria-label="Search"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Export */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={exportCsv}
                disabled={isExporting || displayed.length === 0}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition ${
                  isExporting || displayed.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Export CSV"
                title={displayed.length === 0 ? "No data to export" : "Export CSV"}
              >
                <DownloadCloud className="w-4 h-4" />
                <span className="hidden sm:inline-block">Export</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left sticky top-0">Sl No</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">HSN code</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Name</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Stock Qty</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Local name</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Category</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Sub Category</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Brand</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Amount Type</th>
              <th className="px-3 py-4 bg-[#07156a] text-white text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-400">
                  No SKUs available.
                </td>
              </tr>
            ) : (
              displayed.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-4 align-top text-sm text-slate-700 whitespace-nowrap">{r.slNo}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700 whitespace-nowrap">{r.hsn}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700 max-w-xs">
                    <div className="line-clamp-2">{r.name}</div>
                  </td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700 whitespace-nowrap">
                    <StockPill value={r.stockQty} />
                  </td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">{r.localName}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">{r.category}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">{r.subCategory}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">{r.brand}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">{r.amountType}</td>
                  <td className="px-3 py-4 align-top text-sm text-slate-700">
                    <button
                      onClick={() => openEdit(r)}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                      title="Edit SKU"
                      aria-label={`Edit ${r.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="fixed inset-0 bg-black/40" onClick={closeEdit} />

          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit SKU</h3>
              <button onClick={closeEdit} className="p-2 rounded hover:bg-slate-100" aria-label="Close edit modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full h-10 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      editErrors.name ? "border-red-300" : "border-slate-200"
                    }`}
                    aria-invalid={!!editErrors.name}
                  />
                  {editErrors.name && <p className="text-sm text-red-600 mt-1">{editErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className={`w-full h-10 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      editErrors.stock ? "border-red-300" : "border-slate-200"
                    }`}
                    aria-invalid={!!editErrors.stock}
                  />
                  {editErrors.stock && <p className="text-sm text-red-600 mt-1">{editErrors.stock}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closeEdit} className="px-4 py-2 rounded border text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!!editErrors.name || !!editErrors.stock}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stock pill component (kept below so it can access local scope)
const StockPill: React.FC<{ value: number }> = ({ value }) => {
  const formatted = Number.isFinite(value) ? value.toFixed(4).replace(/\.?0+$/, (m) => m) : "0";
  return (
    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-medium shadow">
      {formatted}
    </span>
  );
};
