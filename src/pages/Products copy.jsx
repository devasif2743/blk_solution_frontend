import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { addProduct, getProducts, updateProduct, deleteProduct } from "../api/authApi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isLoading, setIsLoading] = useState(false);   // 🔄 Fetch loading
  const [isSaving, setIsSaving] = useState(false);     // 🔄 Save/Add/Edit loading

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");

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

  useEffect(() => {
    fetchProducts(1, "");
  }, []);

  useEffect(() => {
  if (formImage instanceof File) {
    const objectUrl = URL.createObjectURL(formImage);
    setPreviewUrl(objectUrl);

    // cleanup old object URLs
    return () => URL.revokeObjectURL(objectUrl);
  } else {
    // if backend returns relative path, prepend your API base URL here
    if (formImage && formImage.startsWith("/storage")) {
      setPreviewUrl(`${import.meta.env.VITE_API_URL}${formImage}`);
    } else {
      setPreviewUrl(formImage || null);
    }
  }
}, [formImage]);


  // ✅ Reset form
  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormImage("");
    setIsEdit(false);
    setSelectedProduct(null);
  };

  // ✅ Open modal for Add
  const openAddModal = () => {
    resetForm();
    setIsEdit(false);
    setIsModalOpen(true);
  };

  // ✅ Open modal for Edit
  const startEdit = (product) => {
    setIsEdit(true);
    setSelectedProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormImage(product.image_url || "");
    setIsModalOpen(true);
  };

  // ✅ Save (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", formName);
      if (formDescription) formData.append("description", formDescription);
      if (formImage instanceof File) {
        formData.append("image", formImage);
      }

      let res;
      if (isEdit && selectedProduct) {
        res = await updateProduct(selectedProduct.id, formData);
      } else {
        res = await addProduct(formData);
      }
      

      if (res.status) {
        toast.success(
          res.message || (isEdit ? "Product updated successfully" : "Product added successfully")
        );
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

  // ✅ Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, search);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Products
          </h1>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="border rounded-md p-2"
              />
              <Button type="submit">Search</Button>
            </form>
            <Button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-3 py-2"
            >
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
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400 italic">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover border"
                            onError={(e) => (e.currentTarget.src = placeholder)}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-slate-200 flex items-center justify-center text-slate-400">
                            📦
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                      <td className="px-4 py-3 text-slate-600 line-clamp-2 max-w-xs">
                        {product.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(product)}
                            disabled={isSaving}
                            className="flex items-center gap-1"
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={isSaving}
                            className="flex items-center gap-1"
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
        </div>

        {/* Pagination */}
        {pagination && !isLoading && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => fetchProducts(currentPage - 1, search)}
            >
              Prev
            </Button>
            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === pagination.last_page}
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
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="block w-full border rounded-md p-2"
                placeholder="Product Name"
                required
              />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="block w-full border rounded-md p-2"
                placeholder="Description (optional)"
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Image (optional)
                </label>
                {formImage && (
                  <div className="mb-2 w-full h-40 rounded-md overflow-hidden border">
                    <img
                      src={formImage instanceof File ? URL.createObjectURL(formImage) : formImage}
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
                    if (file) setFormImage(file);
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
    </>
  );
};

export default Products;
