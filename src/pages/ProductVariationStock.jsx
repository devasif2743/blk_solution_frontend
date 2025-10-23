import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getProducts,
  getVariations,
  getStocks,
  addStock,
  deleteStock,
  getVendors,
} from "../api/authApi";

const ProductVariationStock = () => {
  // product + variation + stock
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState("");
  const [stocks, setStocks] = useState([]);

  // vendors
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");

  // form
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("in");
  const [notes, setNotes] = useState("");

  // UI
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    (async () => {
      const res = await getProducts({ page: 1, per_page: 100 });
      if (res.status) setProducts(res.products.data);
    })();

    (async () => {
      const res = await getVendors();
      if (res.status) setVendors(res.vendors);
    })();
  }, []);

  const fetchVariations = async (productId) => {
    setSelectedVariation("");
    setStocks([]);
    const res = await getVariations(productId);
    if (res.status) setVariations(res.variations);
  };

  const fetchStocks = async (variationId) => {
    setIsLoading(true);
    try {
      const res = await getStocks(variationId);
      if (res.status) {
        setStocks(res.variation.stocks || []);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error fetching stocks");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- HANDLE STOCK ----------------
  const resetForm = () => {
    setQuantity("");
    setType("in");
    setNotes("");
    setVendorId("");
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedVariation || !quantity) return;

    setIsSaving(true);
    try {
      const res = await addStock(selectedVariation, {
        vendor_id: vendorId || null,
        quantity,
        type,
        notes,
      });

      if (res.status) {
        toast.success("Stock added");
        fetchStocks(selectedVariation);
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to add stock");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Delete this stock entry?")) return;
    try {
      const res = await deleteStock(id);
      if (res.status) {
        toast.success("Deleted");
        fetchStocks(selectedVariation);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Error deleting stock");
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Product → Variation → Stock</h1>

      {/* PRODUCT SELECT */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => {
            setSelectedProduct(e.target.value);
            fetchVariations(e.target.value);
          }}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Choose product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* VARIATION SELECT */}
      {selectedProduct && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Variation</label>
          <select
            value={selectedVariation}
            onChange={(e) => {
              setSelectedVariation(e.target.value);
              fetchStocks(e.target.value);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Choose variation --</option>
            {variations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.variation_name} (₹{v.price})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* STOCKS TABLE */}
      {selectedVariation && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Stocks</h2>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Stock
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
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Vendor</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400 italic">
                        No stock entries
                      </td>
                    </tr>
                  ) : (
                    stocks.map((s, idx) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{s.vendor?.name || "-"}</td>
                        <td className="px-4 py-2">{s.quantity}</td>
                        <td className="px-4 py-2">{s.type}</td>
                        <td className="px-4 py-2">{s.notes || "-"}</td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStock(s.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
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

      {/* ADD STOCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Stock</h3>
            <form onSubmit={handleAddStock} className="space-y-3">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariationStock;
