"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getBrands,
  getCategories,
  addBrand,
  addCategory,
} from "../api/authApi";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // We'll reuse isModalOpen to show the drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state (added `label`)
  const [form, setForm] = useState({
    name: "",
    label: "",
    description: "",
    image: "",
    brand_id: "",
    category_id: "",
  });

  // Inline add-brand/category UI state
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingEntity, setIsAddingEntity] = useState(false);

  // Fetch Products (uses your existing API signature)
  const fetchProducts = async (page = 1, searchTerm = "") => {
    setIsLoading(true);
    try {
      const res = await getProducts({ page, per_page: 6, search: searchTerm });
      if (res?.products?.data) {
        setProducts(res.products.data);
        setPagination(res.products);
        setCurrentPage(res.products.current_page);
      } else {
        toast.error(res.message || "Failed to load products");
      }
    } catch (err) {
      console.error("API error:", err);
      toast.error(err?.message || "Server error loading products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch brands & categories (unchanged)
  const fetchDropdowns = async () => {
    try {
      const [brandRes, catRes] = await Promise.all([
        getBrands({ per_page: 100 }),
        getCategories({ per_page: 100 }),
      ]);
      if (brandRes.status) setBrands(brandRes.data?.data || brandRes.data || []);
      if (catRes.status) setCategories(catRes.data?.data || catRes.data || []);
    } catch (err) {
      console.error("Dropdown load error:", err);
    }
  };

  useEffect(() => {
    fetchProducts(1, "");
    fetchDropdowns();
  }, []);

  // preview logic (keeps same behavior)
  useEffect(() => {
    if (form.image instanceof File) {
      const objectUrl = URL.createObjectURL(form.image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(form.image || null);
    }
  }, [form.image]);

  // reset form (unchanged)
  const resetForm = () => {
    setForm({
      name: "",
      label: "",
      description: "",
      image: "",
      brand_id: "",
      category_id: "",
    });
    setIsEdit(false);
    setSelectedProduct(null);
    setShowAddBrand(false);
    setShowAddCategory(false);
    setNewBrandName("");
    setNewCategoryName("");
  };

  // Open Add Drawer (keeps add flow)
  const openAddDrawer = () => {
    resetForm();
    setIsEdit(false);
    setIsModalOpen(true);
  };

  // Start Edit (keeps existing flow) - set label too
  const startEdit = (product) => {
    setIsEdit(true);
    setSelectedProduct(product);
    setForm({
      name: product.name,
      label: product.label || "",
      description: product.description || "",
      image: product.image_url || "",
      brand_id: product.brand_id || "",
      category_id: product.category_id || "",
    });
    setIsModalOpen(true);
  };

  // Add Brand inline
  const handleAddBrandInline = async () => {
    const name = newBrandName.trim();
    if (!name) return toast.error("Brand name required");
    setIsAddingEntity(true);
    try {
      const res = await addBrand({ name });
      if (res?.status) {
        toast.success("Brand added");
        // refresh dropdowns and select the new brand if id returned
        await fetchDropdowns();
        if (res.data?.id) setForm((f) => ({ ...f, brand_id: res.data.id }));
        setShowAddBrand(false);
        setNewBrandName("");
      } else {
        toast.error(res?.message || "Failed to add brand");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding brand");
    } finally {
      setIsAddingEntity(false);
    }
  };

  // Add Category inline
  const handleAddCategoryInline = async () => {
    const name = newCategoryName.trim();
    if (!name) return toast.error("Category name required");
    setIsAddingEntity(true);
    try {
      const res = await addCategory({ name });
      if (res?.status) {
        toast.success("Category added");
        await fetchDropdowns();
        if (res.data?.id) setForm((f) => ({ ...f, category_id: res.data.id }));
        setShowAddCategory(false);
        setNewCategoryName("");
      } else {
        toast.error(res?.message || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding category");
    } finally {
      setIsAddingEntity(false);
    }
  };

  // Save (Add/Edit) - same API calls, include label field
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.label) formData.append("label", form.label);
      if (form.description) formData.append("description", form.description);
      if (form.brand_id) formData.append("brand_id", form.brand_id);
      if (form.category_id) formData.append("category_id", form.category_id);
      if (form.image instanceof File) formData.append("image", form.image);

      let res;
      if (isEdit && selectedProduct) {
        res = await updateProduct(selectedProduct.id, formData);
      } else {
        res = await addProduct(formData);
      }

      if (res.status) {
        toast.success(isEdit ? "Product updated successfully" : "Product added successfully");
        fetchProducts(currentPage, search);
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Save product error:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete (same)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setIsSaving(true);
    try {
      const res = await deleteProduct(id);
      if (res.status) {
        toast.success(res.message);
        fetchProducts(currentPage, search);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border rounded-md p-2"
            />
            <Button onClick={() => fetchProducts(1, search)}>Search</Button>
            <Button onClick={openAddDrawer} className="inline-flex items-center gap-2 px-3 py-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl shadow border border-slate-200">
          {isLoading ? (
            <div className="flex justify-center items-center py-10 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading products...
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
               
                  <th className="px-4 py-3 text-left font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-slate-400 italic">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-12 w-12 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-slate-200 flex items-center justify-center text-slate-400">
                            📦
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                   
                      <td className="px-4 py-3">{p.brand?.name || "-"}</td>
                      <td className="px-4 py-3">{p.category?.name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 line-clamp-2 max-w-xs">
                        {p.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(p)}
                            disabled={isSaving}
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination && pagination.total > pagination.per_page && (
            <div className="flex justify-between items-center p-4 border-t bg-slate-50">
              <Button
                variant="outline"
                disabled={!pagination.prev_page_url}
                onClick={() => fetchProducts(currentPage - 1, search)}
              >
                Previous
              </Button>

              <div className="flex gap-2 flex-wrap justify-center">
                {pagination.links
                  .filter((link) => !isNaN(link.label)) // Only page numbers
                  .map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => fetchProducts(link.page, search)}
                      className={`px-3 py-1 rounded-md border ${
                        link.active
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
              </div>

              <Button
                variant="outline"
                disabled={!pagination.next_page_url}
                onClick={() => fetchProducts(currentPage + 1, search)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Animated Right Drawer (replaces previous centered modal) */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              />

              {/* Drawer */}
              <motion.aside
                key="drawer"
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl border-l p-6 overflow-y-auto"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-0">{isEdit ? "Edit Product" : "Add Product"}</h3>
                    <p className="text-xs text-slate-500 mt-1">{isEdit ? "Update product details" : "Fill product details to add"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                 
                   <label className="text-sm font-medium">Product Name</label>    
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full border rounded-md p-2"
                    placeholder="Product Name"
                    required
                  />

                 
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="block w-full border rounded-md p-2"
                    placeholder="Description (optional)"
                  />

              <div className="space-y-4">
  {/* Brand Section */}
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-sm font-medium">Brand</label>
      <button
        type="button"
        className="text-sm text-slate-500 underline"
        onClick={() => setShowAddBrand((s) => !s)}
      >
        {showAddBrand ? "Cancel" : "+ Add brand"}
      </button>
    </div>

    {showAddBrand ? (
      <div className="flex gap-2">
        <input
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          placeholder="Brand name"
          className="flex-1 border rounded-md p-2"
        />
        <Button
          type="button"
          onClick={handleAddBrandInline}
          disabled={isAddingEntity}
        >
          {isAddingEntity ? "Saving..." : "Save"}
        </Button>
      </div>
    ) : (
      <select
        value={form.brand_id}
        onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
        className="block w-full border rounded-md p-2"
        required
      >
        <option value="">-- Select Brand --</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    )}
  </div>

  {/* Category Section */}
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-sm font-medium">Category</label>
      <button
        type="button"
        className="text-sm text-slate-500 underline"
        onClick={() => setShowAddCategory((s) => !s)}
      >
        {showAddCategory ? "Cancel" : "+ Add category"}
      </button>
    </div>

    {showAddCategory ? (
      <div className="flex gap-2">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Category name"
          className="flex-1 border rounded-md p-2"
        />
        <Button
          type="button"
          onClick={handleAddCategoryInline}
          disabled={isAddingEntity}
        >
          {isAddingEntity ? "Saving..." : "Save"}
        </Button>
      </div>
    ) : (
      <select
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        className="block w-full border rounded-md p-2"
        required
      >
        <option value="">-- Select Category --</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    )}
  </div>
</div>


                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    {previewUrl && (
                      <div className="mb-2 w-full h-40 rounded-md overflow-hidden border">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setForm({ ...form, image: file });
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isEdit ? "Save Changes" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Products;
