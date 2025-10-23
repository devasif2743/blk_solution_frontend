import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getVendors, addVendor, updateVendor, deleteVendor } from "../api/authApi";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formGst, setFormGst] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Vendors
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await getVendors();
      if (res.status) {
        setVendors(res.vendors);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormContact("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormGst("");
    setIsEdit(false);
    setSelectedVendor(null);
  };

  // Add / Edit vendor
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      let res;
      if (isEdit && selectedVendor) {
        res = await updateVendor(selectedVendor.id, {
          name: formName,
          contact_person: formContact,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          gst_number: formGst,
        });
      } else {
        res = await addVendor({
          name: formName,
          contact_person: formContact,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          gst_number: formGst,
        });
      }

      if (res.status) {
        toast.success(isEdit ? "Vendor updated" : "Vendor added");
        fetchVendors();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save vendor");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete vendor
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      const res = await deleteVendor(id);
      if (res.status) {
        toast.success(res.message);
        fetchVendors();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to delete vendor");
    }
  };

  // Start edit
  const startEdit = (vendor) => {
    setIsEdit(true);
    setSelectedVendor(vendor);
    setFormName(vendor.name);
    setFormContact(vendor.contact_person || "");
    setFormPhone(vendor.phone || "");
    setFormEmail(vendor.email || "");
    setFormAddress(vendor.address || "");
    setFormGst(vendor.gst_number || "");
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Vendor Management</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Vendors</h2>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Vendor
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
                <th className="px-4 py-3 text-left">Contact Person</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">GST</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400 italic">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((v, idx) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3">{v.contact_person || "-"}</td>
                    <td className="px-4 py-3">{v.phone || "-"}</td>
                    <td className="px-4 py-3">{v.email || "-"}</td>
                    <td className="px-4 py-3">{v.gst_number || "-"}</td>
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
              {isEdit ? "Edit Vendor" : "Add Vendor"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Vendor Name"
                required
              />
              <input
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Contact Person"
              />
              <input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Address"
              />
              <input
                value={formGst}
                onChange={(e) => setFormGst(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="GST Number"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEdit ? "Save Changes" : "Add Vendor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
