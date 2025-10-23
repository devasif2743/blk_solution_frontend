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
} from "../api/authApi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Form states
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    brand_id: "",
    category_id: "",
  });

  // ✅ Fetch Products
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

  // ✅ Fetch Brand & Category lists
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

  useEffect(() => {
    if (form.image instanceof File) {
      const objectUrl = URL.createObjectURL(form.image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(form.image || null);
    }
  }, [form.image]);

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      brand_id: "",
      category_id: "",
    });
    setIsEdit(false);
    setSelectedProduct(null);
  };

  // ✅ Open Add Modal
  const openAddModal = () => {
    resetForm();
    setIsEdit(false);
    setIsModalOpen(true);
  };

  // ✅ Edit Product
  const startEdit = (product) => {
    setIsEdit(true);
    setSelectedProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      image: product.image_url || "",
      brand_id: product.brand_id || "",
      category_id: product.category_id || "",
    });
    setIsModalOpen(true);
  };

  // ✅ Save (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
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

  // ✅ Delete
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
            <Button onClick={openAddModal} className="inline-flex items-center gap-2 px-3 py-2">
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
                    <td colSpan="7" className="text-center py-6 text-slate-400 italic">
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
        .filter((link) => !isNaN(link.label)) // Only page numbers, skip "Previous"/"Next"
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="absolute top-3 right-3 text-slate-500 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">
                {isEdit ? "Edit Product" : "Add Product"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full border rounded-md p-2"
                  placeholder="Product Name"
                  required
                />

                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="block w-full border rounded-md p-2"
                  placeholder="Description (optional)"
                />

                {/* Brand Dropdown */}
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

                {/* Category Dropdown */}
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Image</label>
                  {previewUrl && (
                    <div className="mb-2 w-full h-40 rounded-md overflow-hidden border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setForm({ ...form, image: file });
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 
                              file:rounded-md file:border-0 file:text-sm file:font-semibold 
                              file:bg-slate-800 file:text-white hover:file:bg-slate-900"
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
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
