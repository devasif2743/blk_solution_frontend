import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  addTerritory,
  getTerritories,
  deleteTerritory,
  getTsm,
  getPincodeDetails,
  updateTerritory,
} from "../api/authApi";

/* ---------- Right-side Drawer (Compact Modern Panel) ---------- */
function SlideOver({ open, onRequestClose, children, title }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => setShow(true));
  }, [open]);

  const close = React.useCallback(() => {
    setShow(false);
    setTimeout(() => onRequestClose?.(), 220);
  }, [onRequestClose]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-full
          max-w-[85vw] sm:max-w-[400px] md:max-w-[420px] lg:max-w-[440px]
          transform transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
          ${show ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="relative h-full bg-white rounded-l-2xl shadow-2xl ring-1 ring-black/5 flex flex-col">
          {title && (
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 sm:px-5 py-2.5 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">{title}</h3>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
          <div className={`flex-1 overflow-y-auto px-3 sm:px-5 ${title ? "py-3" : "py-5"}`}>
            {typeof children === "function" ? children(close) : children}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function AddTerritory() {
  // List state
  const [territories, setTerritories] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Drawer / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // TSMs
  const [tsmList, setTsmList] = useState([]);
  const [loadingTsm, setLoadingTsm] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: "",
    pincode: "",
    state: "",
    district: "",
    lat: "",
    lon: "",
    tsm_id: "",
  });

  // Load TSMs
  const loadTsms = async () => {
    try {
      setLoadingTsm(true);
      const res = await getTsm({ per_page: 1000 });
      setTsmList(res?.employees?.data || []);
    } catch (err) {
      console.error("Error fetching TSMs:", err);
    } finally {
      setLoadingTsm(false);
    }
  };

  // Load territories
  const loadTerritories = async () => {
    setIsLoading(true);
    try {
      const res = await getTerritories({ page, per_page: perPage, search });
      if (res?.status) {
        setTerritories(res.data?.data || []);
        setPagination({
          current_page: res.data?.current_page || 1,
          last_page: res.data?.last_page || 1,
        });
      } else {
        toast.error(res?.message || "Failed to load territories");
      }
    } catch (err) {
      console.error("Failed to load territories:", err);
      toast.error("Failed to load territories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTsms();
  }, []);

  useEffect(() => {
    loadTerritories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // Handlers
  const resetForm = () => {
    setForm({
      name: "",
      pincode: "",
      state: "",
      district: "",
      lat: "",
      lon: "",
      tsm_id: "",
    });
    setIsEdit(false);
    setSelectedId(null);
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      try {
        const details = await getPincodeDetails(value);
        if (details) {
          setForm((prev) => ({
            ...prev,
            state: details.state || "",
            district: details.district || "",
          }));
        }
      } catch {
        // ignore
      }
    } else {
      setForm((prev) => ({ ...prev, state: "", district: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.pincode.trim() ) {
      toast.error("Please fill required fields");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...form };
      const res = isEdit && selectedId
        ? await updateTerritory(selectedId, payload)
        : await addTerritory(payload);

      if (res?.status) {
        toast.success(isEdit ? "Territory updated" : "Territory added");
        setIsModalOpen(false);
        resetForm();
        loadTerritories();
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving territory");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this territory?")) return;
    try {
      const res = await deleteTerritory(id);
      if (res?.status) {
        toast.success("Territory deleted");
        loadTerritories();
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete territory");
    }
  };

  const startEdit = (t) => {
    setIsEdit(true);
    setSelectedId(t.id);
    setForm({
      name: t.name || "",
      pincode: "", // keep empty to avoid auto override
      state: t.state || "",
      district: t.district || "",
      lat: t.lat || "",
      lon: t.lon || "",
      tsm_id: t.tsm_id || "",
    });
    setIsModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadTerritories();
  };

  return (
    <div className="w-full max-w-none lg:max-w-7xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Territory Management</h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search territories..."
            className="flex-1 sm:w-72 border rounded px-3 py-2 text-sm"
          />
          <Button type="submit" className="whitespace-nowrap h-9 px-3">Search</Button>
        </form>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Territory
          </Button>
        </div>
      </div>

      {/* Data View: table on sm+, cards on mobile */}
      <div className="rounded-xl border border-slate-200 shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
            Loading...
          </div>
        ) : (
          <>
            {/* Desktop / Tablet: table */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">State</th>
                    <th className="px-4 py-3 text-left">District</th>
                    <th className="px-4 py-3 text-left">TSM</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {territories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400 italic">
                        No territories found
                      </td>
                    </tr>
                  ) : (
                    territories.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3">{t.name}</td>
                        <td className="px-4 py-3">{t.state}</td>
                        <td className="px-4 py-3">{t.district}</td>
                        <td className="px-4 py-3">
                          {t.tsm ? (
                            <div>
                              <div className="font-medium">{t.tsm.name}</div>
                              <div className="text-xs text-gray-500">{t.tsm.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(t)}
                              className="h-8 px-2"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(t.id)}
                              className="h-8 px-2"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="sm:hidden divide-y divide-slate-200">
              {territories.length === 0 ? (
                <div className="p-5 text-center text-slate-400 italic">No territories found</div>
              ) : (
                territories.map((t) => (
                  <div key={t.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(t)}
                          className="h-8 px-2"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(t.id)}
                          className="h-8 px-2"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <dl className="grid grid-cols-3 gap-y-2 text-[13px]">
                      <dt className="col-span-1 text-slate-500">State</dt>
                      <dd className="col-span-2 text-slate-800">{t.state}</dd>

                      <dt className="col-span-1 text-slate-500">District</dt>
                      <dd className="col-span-2 text-slate-800">{t.district}</dd>

                      <dt className="col-span-1 text-slate-500">TSM</dt>
                      <dd className="col-span-2 text-slate-800">
                        {t.tsm ? `${t.tsm.name} (${t.tsm.email})` : "Unassigned"}
                      </dd>
                    </dl>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 sm:mt-6 text-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-3"
          >
            Prev
          </Button>
          <span className="px-2">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.last_page}
            onClick={() => setPage((p) => (p < pagination.last_page ? p + 1 : p))}
            className="h-8 px-3"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Drawer: Add/Edit Territory */}
      <SlideOver
        open={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEdit ? "Edit Territory" : "Add Territory"}
      >
        {(close) => (
          <>
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              {/* BASIC */}
              <div className="rounded-md border border-gray-200 bg-white">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
                  <p className="text-[12px] sm:text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Basic Details
                  </p>
                </div>
                <div className="p-3 space-y-2.5 sm:space-y-3">
                  {/* Name */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
                      Territory Name <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="Enter territory name"
                        required
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <input
                        value={form.pincode}
                        onChange={handlePincodeChange}
                        className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="6-digit pincode"
                        inputMode="numeric"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
                      State
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <input
                        value={form.state}
                        readOnly
                        className="w-full h-8 rounded border border-gray-200 bg-gray-100 px-2 text-[12px] outline-none"
                        placeholder="Auto-filled"
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
                      District
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <input
                        value={form.district}
                        readOnly
                        className="w-full h-8 rounded border border-gray-200 bg-gray-100 px-2 text-[12px] outline-none"
                        placeholder="Auto-filled"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GEO + TSM */}
          
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                <Button type="button" variant="outline" onClick={close} className="h-8 text-xs px-3">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="h-8 text-xs px-3 bg-indigo-600 hover:bg-indigo-700">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
                  {isEdit ? "Save" : "Add"}
                </Button>
              </div>
            </form>
          </>
        )}
      </SlideOver>
    </div>
  );
}
