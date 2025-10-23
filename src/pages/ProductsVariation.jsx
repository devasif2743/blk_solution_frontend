"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit3, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ---- API functions (must be exported from ../api/authApi) ----
import {
  getProducts,
  getVariations,
  addVariation,
  updateVariation,
  deleteVariation,
} from "../api/authApi";

// Component
export default function ProductVariations() {
  // products list (server-side paginated)
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productItemsPerPage, setProductItemsPerPage] = useState(5);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // drawer & selected product (for variations)
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // { ...product, variations: [...] }
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // variation list state (client view inside drawer)
  const [variationSearch, setVariationSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // form state for add/edit variation inside drawer
  const [drawerMode, setDrawerMode] = useState("view"); // 'view' | 'add' | 'edit'
  const [editingVariation, setEditingVariation] = useState(null);
  const [form, setForm] = useState({ variation_name: "", price: "", discount_price: "", sku: "" });
  const [isVariationSaving, setIsVariationSaving] = useState(false);
  const [isVariationsLoading, setIsVariationsLoading] = useState(false);

  // ------------- Products (server) -------------
  const fetchProducts = async (page = 1, per_page = productItemsPerPage, searchTerm = "") => {
    setIsProductsLoading(true);
    try {
      const res = await getProducts({ page, per_page, search: searchTerm });
      if (res?.products?.data) {
        setProducts(res.products.data);
        setProductPagination(res.products);
        setProductCurrentPage(res.products.current_page);
      } else {
        toast.error(res?.message || "Failed to load products");
      }
    } catch (err) {
      console.error("fetchProducts error:", err);
      toast.error("Server error loading products");
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, productItemsPerPage, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts(1, productItemsPerPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productItemsPerPage]);

  // ------------- Variations (server) -------------
  const fetchVariations = async (productId) => {
    if (!productId) return;
    setIsVariationsLoading(true);
    try {
      const res = await getVariations(productId); // expected: { status: true, variations: [...] }
      if (res?.status) {
        const productMeta = products.find((p) => String(p.id) === String(productId)) || { id: productId, name: "Product" };
        setSelectedProduct({ ...productMeta, variations: res.variations || [] });
        setSelectedProductId(productId);
      } else {
        setSelectedProduct((p) => ({ ...(p || {}), variations: [] }));
        toast.error(res?.message || "Failed to load variations");
      }
    } catch (err) {
      console.error("fetchVariations error:", err);
      toast.error("Error loading variations");
      setSelectedProduct((p) => ({ ...(p || {}), variations: [] }));
    } finally {
      setIsVariationsLoading(false);
    }
  };

  // open drawer and load variations for a product
  const openDrawer = async (productId) => {
    setSelectedProductId(productId);
    setVariationSearch("");
    setCurrentPage(1);
    setDrawerMode("view");
    setEditingVariation(null);
    setForm({ variation_name: "", price: "", discount_price: "", sku: "" });
    setIsDrawerOpen(true);
    await fetchVariations(productId);
  };

  // Open add variation mode
  const handleAddVariation = async (productId) => {
    setSelectedProductId(productId);
    if (!isDrawerOpen || selectedProductId !== productId) {
      await fetchVariations(productId);
      setIsDrawerOpen(true);
    }
    setDrawerMode("add");
    setEditingVariation(null);
    setForm({ variation_name: "", price: "", discount_price: "", sku: "" });
  };

  // Open edit variation mode
  const handleEditVariation = async (productId, variationId) => {
    if (!isDrawerOpen || selectedProductId !== productId) {
      await fetchVariations(productId);
      setIsDrawerOpen(true);
    }

    // attempt to find variation in selectedProduct
    const variation = (selectedProduct?.variations || []).find((v) => String(v.id) === String(variationId));
    if (!variation) {
      // try fresh fetch fallback
      try {
        const res = await getVariations(productId);
        const found = (res.variations || []).find((vv) => String(vv.id) === String(variationId));
        if (found) {
          setSelectedProduct((p) => ({ ...(p || {}), variations: res.variations || [] }));
          setForm({ variation_name: found.variation_name, price: String(found.price ?? 0), discount_price: String(found.discount_price ?? ""), sku: found.sku || "" });
          setEditingVariation(found.id);
          setDrawerMode("edit");
          return;
        }
      } catch (err) {
        console.error(err);
      }
      toast.error("Variation not found");
      return;
    }

    setForm({ variation_name: variation.variation_name, price: String(variation.price ?? 0), discount_price: String(variation.discount_price ?? ""), sku: variation.sku || "" });
    setEditingVariation(variation.id);
    setDrawerMode("edit");
  };

  // Delete variation (server)
  const handleDeleteVariation = async (productId, variationId) => {
    if (!window.confirm("Delete this variation?")) return;
    try {
      const res = await deleteVariation(variationId);
      if (res?.status) {
        toast.success(res.message || "Variation deleted");
        await fetchVariations(productId);
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (err) {
      console.error("deleteVariation error:", err);
      toast.error("Failed to delete variation");
    }
  };

  // Submit (add/edit) variation to server
  const submitVariationForm = async (e) => {
    e?.preventDefault();
    const name = (form.variation_name || "").trim();
    const price = Number(form.price || 0);
    const discount_price = form.discount_price === "" ? 0 : Number(form.discount_price);
    const sku = form.sku?.trim?.() || "";

    if (!name) {
      toast.error("Please enter a variation name");
      return;
    }
    if (!Number.isFinite(price)) {
      toast.error("Enter a valid price");
      return;
    }
    if (!selectedProductId) {
      toast.error("No product selected");
      return;
    }

    setIsVariationSaving(true);
    try {
      let res;
      if (drawerMode === "add") {
        res = await addVariation(selectedProductId, { variation_name: name, price, discount_price, sku });
      } else if (drawerMode === "edit" && editingVariation) {
        res = await updateVariation(editingVariation, { variation_name: name, price, discount_price, sku });
      }

      if (res?.status) {
        toast.success(drawerMode === "add" ? "Variation added!" : "Variation updated!");
        await fetchVariations(selectedProductId);
        setDrawerMode("view");
        setEditingVariation(null);
        setForm({ variation_name: "", price: "", discount_price: "", sku: "" });
      } else {
        toast.error(res?.message || "Failed to save variation");
      }
    } catch (err) {
      console.error("submitVariationForm error:", err);
      toast.error("Failed to save variation");
    } finally {
      setIsVariationSaving(false);
    }
  };

  // ---------- helpers for client side filtering + pagination of variations ----------
  const getPaginatedVariations = () => {
    if (!selectedProduct?.variations) return [];
    const term = (variationSearch || "").toLowerCase();
    const variationsFiltered = selectedProduct.variations.filter((v) => v.variation_name.toLowerCase().includes(term));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return variationsFiltered.slice(start, end);
  };

  const totalVariations = selectedProduct
    ? selectedProduct.variations.filter((v) => v.variation_name.toLowerCase().includes((variationSearch || "").toLowerCase())).length
    : 0;
  const totalPages = Math.max(1, Math.ceil(totalVariations / itemsPerPage));

  // product list helpers
  const productShowingStart = () => {
    if (!productPagination) return 0;
    return (productPagination.current_page - 1) * productPagination.per_page + 1;
  };
  const productShowingEnd = () => {
    if (!productPagination) return products.length;
    return Math.min(productPagination.current_page * productPagination.per_page, productPagination.total);
  };

  const goToProductPage = (page) => {
    fetchProducts(page, productItemsPerPage, search);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6">Product Variations</h1>

      {/* Search Bar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Show</label>
          <select value={productItemsPerPage} onChange={(e) => setProductItemsPerPage(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>

          <Button onClick={() => fetchProducts(1, productItemsPerPage, search)}>Search</Button>

          <span className="text-sm text-slate-500">
            of {productPagination?.total ?? products.length} products
          </span>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-center">Variations</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isProductsLoading ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-400 italic">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p, idx) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {(productPagination?.current_page - 1 ?? productCurrentPage - 1) * (productPagination?.per_page ?? productItemsPerPage) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">{p.variations_count ?? (p.variations ? p.variations.length : 0)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAddVariation(p.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                      <Button size="sm" onClick={() => openDrawer(p.id)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Pagination Controls (bottom) */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div>
          Showing {productPagination ? productShowingStart() : (products.length ? 1 : 0)} - {productPagination ? productShowingEnd() : products.length} of {productPagination?.total ?? products.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!productPagination || productPagination.current_page === 1} onClick={() => goToProductPage((productPagination?.current_page || 1) - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span>Page {productPagination?.current_page ?? productCurrentPage} of {productPagination ? Math.max(1, Math.ceil((productPagination.total || 0) / (productPagination.per_page || productItemsPerPage))) : 1}</span>
          <Button variant="outline" size="sm" disabled={!productPagination || (productPagination.current_page >= Math.ceil((productPagination.total || 0) / (productPagination.per_page || productItemsPerPage)))} onClick={() => goToProductPage((productPagination?.current_page || 1) + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* SIDE DRAWER (AnimatePresence + motion.aside) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdropVars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => {
                setIsDrawerOpen(false);
                setDrawerMode("view");
                setSelectedProductId(null);
                setSelectedProduct(null);
              }}
            />

            {/* Drawer */}
            <motion.aside
              key="drawerVars"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl border-l p-6 overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-0">{selectedProduct?.name ?? "Product"} Variations</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedProduct ? `${selectedProduct.variations?.length ?? 0} variations` : "Select a product to view"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {drawerMode === "view" && (
                    <Button size="sm" variant="ghost" onClick={() => { setDrawerMode("add"); setForm({ variation_name: "", price: "", discount_price: "", sku: "" }); }}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => { setIsDrawerOpen(false); setDrawerMode("view"); setSelectedProductId(null); setSelectedProduct(null); }}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {drawerMode !== "view" ? (
                    <motion.form key={drawerMode} onSubmit={submitVariationForm} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.16 }} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Variation name</label>
                        <Input value={form.variation_name} onChange={(e) => setForm((f) => ({ ...f, variation_name: e.target.value }))} placeholder="e.g. 250ml" />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Price (₹)</label>
                          <Input inputMode="numeric" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Discount price (₹)</label>
                          <Input inputMode="numeric" value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} placeholder="optional" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">SKU (optional)</label>
                        <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="SKU" />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => { setDrawerMode("view"); setForm({ variation_name: "", price: "", discount_price: "", sku: "" }); setEditingVariation(null); }}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isVariationSaving}>
                          {drawerMode === "add" ? "Create" : "Save changes"}
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                      <div className="mt-3">
                        <Input placeholder="Search variation..." value={variationSearch} onChange={(e) => { setVariationSearch(e.target.value); setCurrentPage(1); }} />

                        <div className="mt-4 space-y-3">
                          {isVariationsLoading ? (
                            <p className="text-slate-500 text-sm text-center py-10">Loading...</p>
                          ) : getPaginatedVariations().length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-10">No variations found</p>
                          ) : (
                            getPaginatedVariations().map((v) => (
                              <div key={v.id} className="flex justify-between items-center border rounded-lg p-3 hover:bg-slate-50">
                                <div>
                                  <p className="font-medium">{v.variation_name}</p>
                                  <p className="text-xs text-slate-500">₹{v.price} {v.discount_price ? `• ₹${v.discount_price} after discount` : ""}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEditVariation(selectedProduct.id, v.id)}><Edit3 className="h-4 w-4" /></Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteVariation(selectedProduct.id, v.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center mt-6 text-sm">
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
                              Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
