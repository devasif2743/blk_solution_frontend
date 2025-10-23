// src/pages/ProductVariations.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getProducts, getVariations,
  addVariation,
  updateVariation,
  deleteVariation, } from "../api/authApi";
// ✅ your variation API

const ProductVariations = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [variations, setVariations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const [variationName, setVariationName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [sku, setSku] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Fetch products for dropdown
  const fetchProductsList = async () => {
    try {
      const res = await getProducts({ page: 1, per_page: 100 });
      if (res?.products?.data) setProducts(res.products.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  // ✅ Fetch variations for selected product
  const fetchVariations = async (productId) => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await getVariations(productId);
      if (res.status) {
        setVariations(res.variations);
      } else {
        setVariations([]);
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error loading variations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariations(selectedProductId);
    }
  }, [selectedProductId]);

  // ✅ Reset form
  const resetForm = () => {
    setVariationName("");
    setPrice("");
    setDiscountPrice("");
    setSku("");
    setIsEdit(false);
    setSelectedVariation(null);
  };

  // ✅ Add/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!variationName.trim() || !selectedProductId) return;

    setIsSaving(true);
    try {
      let res;
      if (isEdit && selectedVariation) {
        res = await updateVariation(selectedVariation.id, {
          variation_name: variationName,
          price,
          discount_price: discountPrice,
          sku,
        });
      } else {
        res = await addVariation(selectedProductId, {
          variation_name: variationName,
          price,
          discount_price: discountPrice,
          sku,
        });
      }

      if (res.status) {
        toast.success(isEdit ? "Variation updated" : "Variation added");
        fetchVariations(selectedProductId);
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save variation");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this variation?")) return;
    try {
      const res = await deleteVariation(id);
      if (res.status) {
        toast.success(res.message);
        fetchVariations(selectedProductId);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to delete variation");
    }
  };

  // ✅ Start Edit
  const startEdit = (v) => {
    setIsEdit(true);
    setSelectedVariation(v);
    setVariationName(v.variation_name);
    setPrice(v.price);
    setDiscountPrice(v.discount_price || "");
    setSku(v.sku || "");
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Product Variations</h1>

      {/* Product Select */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Product</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Choose a product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variations</h2>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Variation
            </Button>
          </div>

          {/* Table */}
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
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Discount</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {variations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400 italic">
                        No variations yet
                      </td>
                    </tr>
                  ) : (
                    variations.map((v, idx) => (
                      <tr key={v.id}>
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{v.variation_name}</td>
                        <td className="px-4 py-3">₹{v.price}</td>
                        <td className="px-4 py-3">{v.discount_price || "-"}</td>
                        <td className="px-4 py-3">{v.sku || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(v)}>
                              <Edit3 className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)}>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="absolute top-3 right-3 text-slate-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Variation" : "Add Variation"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Variation Name"
                required
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Price"
                required
              />
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Discount Price (optional)"
              />
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="SKU (optional)"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEdit ? "Save Changes" : "Add Variation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariations;
