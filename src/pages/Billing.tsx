// src/pages/Billing.tsx
import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  UserPlus,
  Trash2,
  Download,
  ShoppingCart,
  ChevronDown,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Item = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock?: number;
};

type CartRow = {
  item: Item;
  qty: number;
};

const ITEMS: Item[] = [
  { id: "i1", sku: "SKU-001", name: "Palm Oil 1L", price: 180, stock: 50 },
  { id: "i2", sku: "SKU-002", name: "Rice 5kg", price: 420, stock: 20 },
  { id: "i3", sku: "SKU-003", name: "Sugar 2kg", price: 70, stock: 40 },
  { id: "i4", sku: "SKU-004", name: "Wheat Flour 10kg", price: 520, stock: 10 },
  { id: "i5", sku: "SKU-005", name: "Salt 1kg", price: 25, stock: 100 },
  { id: "i6", sku: "SKU-006", name: "Tea 250g", price: 150, stock: 60 },
];

const CUSTOMERS = [
  { id: "c1", name: "Anil Kumar", phone: "9000000001" },
  { id: "c2", name: "Suman Rao", phone: "9000000002" },
  { id: "c3", name: "Raja Patel", phone: "9000000003" },
];

export default function Billing(): JSX.Element {
  // page state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  // items
  const [query, setQuery] = useState("");
  const [items] = useState<Item[]>(ITEMS);

  // cart
  const [cart, setCart] = useState<CartRow[]>([]);

  // add customer modal
  const [isAddCustomerOpen, setAddCustomerOpen] = useState(false);

  // filtered items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));
  }, [items, query]);

  // helpers
  const addToCart = (item: Item) => {
    setCart((prev) => {
      const found = prev.find((r) => r.item.id === item.id);
      if (found) {
        return prev.map((r) => (r.item.id === item.id ? { ...r, qty: Math.min((r.qty || 0) + 1, item.stock ?? 9999) } : r));
      }
      return [{ item, qty: 1 }, ...prev];
    });
    toast.success(`${item.name} added to cart`);
  };

  const changeQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((r) => (r.item.id === id ? { ...r, qty } : r)));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((r) => r.item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((s, r) => s + r.item.price * r.qty, 0), [cart]);
  const discount = useMemo(() => 0, []); // placeholder
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]); // demo 5% tax
  const total = subtotal - discount + tax;

  // add new customer (local)
  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please provide name and phone");
      return;
    }
    const newCustomer = { id: `c${Date.now()}`, name: customerName.trim(), phone: customerPhone.trim() };
    setSelectedCustomer(newCustomer);
    setCustomerName("");
    setCustomerPhone("");
    setAddCustomerOpen(false);
    toast.success("Customer added (local)");
  };

  const handleSelectCustomer = (c: { id: string; name: string; phone: string }) => {
    setSelectedCustomer(c);
    setCustomerSearch("");
  };

  const handleSubmitInvoice = () => {
    if (!selectedCustomer) {
      toast.error("Select customer");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    toast.success("Invoice submitted (demo)");
    // reset cart for demo
    setCart([]);
  };

  const handleExport = () => {
    // simple CSV export of cart
    if (cart.length === 0) {
      toast("Cart empty — nothing to export");
      return;
    }
    const header = ["SKU", "Name", "Qty", "Price", "LineTotal"];
    const rows = cart.map((r) => [r.item.sku, r.item.name, String(r.qty), String(r.item.price), String(r.item.price * r.qty)]);
    const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* small scrollbar styles to match sidebar light bg */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #eef2ff; border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #eef2ff transparent; }
      `}</style>

      {/* header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Billing</h1>
          <nav className="text-sm text-slate-500 mt-1">
            <span className="text-indigo-600 hover:underline">Home</span>
            <span className="mx-2">-</span>
            <span>Billing</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setAddCustomerOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 rounded hover:bg-indigo-50">
            <UserPlus className="w-4 h-4" /> Add Customer
          </button>

          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: search + items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer search card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-2">Search Customer By Name or Number</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name or phone"
                    className="pl-10 pr-3 h-11 w-full rounded-full border border-slate-200 bg-white shadow-sm"
                  />
                </div>

                {customerSearch.trim() && (
                  <div className="mt-3 border rounded bg-white shadow-sm max-h-44 overflow-auto">
                    {CUSTOMERS.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map((c) => (
                      <button key={c.id} onClick={() => handleSelectCustomer(c)} className="w-full text-left px-4 py-2 hover:bg-slate-50">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.phone}</div>
                      </button>
                    ))}
                    {CUSTOMERS.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length === 0 && (
                      <div className="p-4 text-sm text-slate-500">No customers found</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">Actions</label>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedCustomer(null); setCustomerName(""); setCustomerPhone(""); }} className="flex-1 px-4 py-2 rounded border hover:bg-slate-50">
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Customer Number</label>
                <input value={selectedCustomer?.phone ?? customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setSelectedCustomer(null); }} placeholder="Enter customer phone no" className="w-full p-3 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Customer Name</label>
                <input value={selectedCustomer?.name ?? customerName} onChange={(e) => { setCustomerName(e.target.value); setSelectedCustomer(null); }} placeholder="Enter customer name" className="w-full p-3 border rounded" />
              </div>
              <div className="flex items-end">
                <div className="text-right w-full">
                  <div className="text-sm text-slate-500">Invoice #</div>
                  <div className="font-semibold mt-1">INV-{new Date().toISOString().slice(0,10).replace(/-/g,'')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items search + list */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items" className="pl-10 h-11 w-full rounded-full border border-slate-200" />
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border rounded hover:bg-slate-50">Filter</button>
                <button onClick={() => { setQuery(""); toast.success("Filters cleared"); }} className="px-3 py-2 border rounded hover:bg-slate-50">Reset</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scroll" style={{ maxHeight: "48vh", overflow: "auto" }}>
              {filteredItems.map((it) => (
                <div key={it.id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-slate-500">{it.sku} • Stock: {it.stock ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{`₹ ${it.price}`}</div>
                    <button onClick={() => addToCart(it)} className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full p-6 text-center text-slate-500">No items match your search</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart / summary */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Cart</h3>
              <button onClick={() => { setCart([]); toast.success("Cart cleared"); }} className="text-sm text-red-600 hover:underline inline-flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scroll" style={{ maxHeight: "56vh" }}>
              {cart.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Cart is empty — add items</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((r) => (
                    <div key={r.item.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{r.item.name}</div>
                        <div className="text-xs text-slate-500">{r.item.sku}</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-semibold">{`₹ ${r.item.price * r.qty}`}</div>
                        <div className="flex items-center gap-2 justify-end">
                          <input
                            type="number"
                            min={1}
                            value={r.qty}
                            onChange={(e) => changeQty(r.item.id, Math.max(1, Number(e.target.value || 1)))}
                            className="w-16 p-1 text-center border rounded"
                          />
                          <button onClick={() => removeFromCart(r.item.id)} className="p-2 rounded hover:bg-slate-100">
                            <X className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <div className="text-slate-600">Subtotal</div>
                <div className="font-semibold">{`₹ ${subtotal.toLocaleString()}`}</div>
              </div>

              <div className="flex justify-between">
                <div className="text-slate-600">Discount</div>
                <div className="font-semibold">{`₹ ${discount.toLocaleString()}`}</div>
              </div>

              <div className="flex justify-between">
                <div className="text-slate-600">Tax (5%)</div>
                <div className="font-semibold">{`₹ ${tax.toLocaleString()}`}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-lg font-bold text-indigo-700">TOTAL</div>
                <div className="text-2xl font-extrabold text-indigo-600">{`₹ ${total.toLocaleString()}`}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button onClick={handleSubmitInvoice} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
                <button onClick={handleExport} className="flex-1 px-4 py-2 border rounded inline-flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Customer</h3>
              <button onClick={() => setAddCustomerOpen(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Name</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-3 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Phone</label>
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-3 border rounded" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setAddCustomerOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
