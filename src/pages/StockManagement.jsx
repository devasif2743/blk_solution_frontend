import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getProducts,
  getVariations,
  getStocks,
  addStock,
  deleteStock,
  updateStock, // ✅ add this in your authApi
  getVendors,
} from "../api/authApi";

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [variations, setVariations] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [currentStock, setCurrentStock] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editStockId, setEditStockId] = useState(null);

  // form fields
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("in");
  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch products
  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts({ page: 1, per_page: 100 });
        if (res?.products?.data) setProducts(res.products.data);
      } catch {
        toast.error("Failed to load products");
      }
    })();
  }, []);

  // Fetch vendors
  useEffect(() => {
    (async () => {
      try {
        const res = await getVendors();
        if (res.status) setVendors(res.vendors);
      } catch {
        toast.error("Failed to load vendors");
      }
    })();
  }, []);

  // When product selected → load variations
  useEffect(() => {
    if (selectedProductId) {
      (async () => {
        try {
          const res = await getVariations(selectedProductId);
          if (res.status) setVariations(res.variations);
        } catch {
          toast.error("Failed to load variations");
        }
      })();
    }
  }, [selectedProductId]);

  // When variation selected → load stocks
  useEffect(() => {
    if (selectedVariationId) fetchStocks(selectedVariationId);
  }, [selectedVariationId]);

  const fetchStocks = async (variationId) => {
    setIsLoading(true);
    try {
      const res = await getStocks(variationId);
      if (res.status) {
        setStocks(res.variation.stocks || []);
        setCurrentStock(res.current_stock || 0);
      } else toast.error(res.message);
    } catch {
      toast.error("Error loading stocks");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setQuantity("");
    setType("in");
    setVendorId("");
    setNotes("");
    setIsEdit(false);
    setEditStockId(null);
  };

  // Add or Edit stock
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!quantity) return toast.error("Enter quantity");

    setIsSaving(true);
    try {
      let res;
      if (isEdit && editStockId) {
        res = await updateStock(editStockId, {
          vendor_id: vendorId || null,
          quantity,
          type,
          notes,
        });
      } else {
        res = await addStock(selectedVariationId, {
          vendor_id: vendorId || null,
          quantity,
          type,
          notes,
        });
      }

      if (res.status) {
        toast.success(isEdit ? "Stock updated" : "Stock added");
        fetchStocks(selectedVariationId);
        setIsModalOpen(false);
        resetForm();
      } else toast.error(res.message);
    } catch {
      toast.error("Failed to save stock");
    } finally {
      setIsSaving(false);
    }
  };

  // Edit stock
  const handleEdit = (stock) => {
    setIsEdit(true);
    setEditStockId(stock.id);
    setQuantity(stock.quantity);
    setType(stock.type);
    setVendorId(stock.vendor_id || "");
    setNotes(stock.notes || "");
    setIsModalOpen(true);
  };

  // Delete stock entry
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stock entry?")) return;
    try {
      const res = await deleteStock(id);
      if (res.status) {
        toast.success(res.message);
        fetchStocks(selectedVariationId);
      } else toast.error(res.message);
    } catch {
      toast.error("Failed to delete stock entry");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Stock Management</h1>

      {/* Select product */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Product</label>
        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setSelectedVariationId("");
            setStocks([]);
          }}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Select Product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select variation */}
      {selectedProductId && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Variation</label>
          <select
            value={selectedVariationId}
            onChange={(e) => setSelectedVariationId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Variation --</option>
            {variations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.variation_name} (₹{v.price})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stocks Table */}
      {selectedVariationId && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Stock Entries (Current: {currentStock})
            </h2>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Stock
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl shadow border border-slate-200">
            {isLoading ? (
              <div className="p-6 text-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
                Loading...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400 italic">
                        No stock records
                      </td>
                    </tr>
                  ) : (
                    stocks.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">
                          {s.type === "in" ? "Stock In" : "Stock Out"}
                        </td>
                        <td className="px-4 py-3">{s.quantity}</td>
                        <td className="px-4 py-3">
                          {s.vendor
                            ? `${s.vendor.name} ${
                                s.vendor.gst_number ? `(${s.vendor.gst_number})` : ""
                              }`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">{s.notes || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                              <Edit3 className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal for Add/Edit Stock */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Stock" : "Add Stock"}
            </h3>
            <form onSubmit={handleSaveStock} className="space-y-3">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                required
                className="w-full border p-2 rounded"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>

              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select Vendor (optional) --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.gst_number ? `(${v.gst_number})` : ""}
                  </option>
                ))}
              </select>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEdit ? "Save Changes" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
