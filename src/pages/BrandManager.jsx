import React, { useEffect, useState } from "react";
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Plus, Edit3, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    logo: null,
    preview: "",
  });

  // 🚀 Fetch brands
  const fetchBrands = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getBrands({ page, per_page: 10, search });
      if (res.status) {
        const data = res.data?.data || res.data || [];
        setBrands(data);
        setPagination({
          current_page: res.data?.current_page || 1,
          last_page: res.data?.last_page || 1,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchBrands(), 400);
    return () => clearTimeout(delay);
  }, [search]);

  // 🧩 Reset Form
  const resetForm = () => {
    setForm({ name: "", logo: null, preview: "" });
    setEditId(null);
  };

  // 🖼 Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        logo: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // 💾 Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Brand name required");

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.logo) formData.append("logo", form.logo);

      let res;
      if (editId) {
        res = await updateBrand(editId, formData);
      } else {
        res = await addBrand(formData);
      }

      if (res.status) {
        toast.success(editId ? "Brand updated" : "Brand added");
        fetchBrands();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error saving brand");
    } finally {
      setIsSaving(false);
    }
  };

  // ✏️ Edit
  const handleEdit = (b) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      logo: null,
      preview: b.logo_url || "",
    });
    setIsModalOpen(true);
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      const res = await deleteBrand(id);
      if (res.status) {
        toast.success("Deleted successfully");
        fetchBrands();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Brand Management</h1>

      {/* 🔍 Search + Add */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 text-sm w-64"
        />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

      {/* 🧾 Table */}
      <div className="bg-white border rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
            Loading...
          </div>
        ) : brands.length === 0 ? (
          <div className="p-6 text-center text-gray-400 italic">
            No brands found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Logo</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.map((b, i) => (
                <tr key={b.id}>
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{b.name}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(b)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔹 Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page === 1}
            onClick={() => fetchBrands(pagination.current_page - 1)}
          >
            Prev
          </Button>
          <span className="text-sm mt-2">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => fetchBrands(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* 🔹 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit Brand" : "Add Brand"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Brand Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 w-full rounded"
                required
              />

              <div className="border p-2 rounded flex items-center gap-2">
                <Upload className="h-4 w-4 text-gray-500" />
                <input type="file" onChange={handleImageChange} />
              </div>

              {form.preview && (
                <img
                  src={form.preview}
                  alt="preview"
                  className="w-20 h-20 rounded mt-2 object-cover"
                />
              )}

              <div className="flex justify-end gap-2 mt-4">
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
                  {editId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
