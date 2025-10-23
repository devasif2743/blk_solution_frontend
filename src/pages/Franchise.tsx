
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, BarChart3, X, RefreshCw, Edit3, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// <-- use your axios instance (adjust path if needed)
import api from "../api/axios";
type FranchiseForm = {
  franchise_name: string;
  location: string;
  owner_name: string;
  contact_number: string;
  email: string;
  status: "active" | "inactive";
  address: string;
  gst_tax_id?: string;
  bank_account?: string;
  latitude?: string;
  longitude?: string;
};

const initialForm: FranchiseForm = {
  franchise_name: "",
  location: "",
  owner_name: "",
  contact_number: "",
  email: "",
  status: "active",
  address: "",
  gst_tax_id: "",
  bank_account: "",
  latitude: "",
  longitude: "",
};

// NOTE: removed static API_URL — all requests use your axios instance `api`

const Franchise: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
  const [loading, setLoading] = useState(false); // submission loading
  const [geoLoading, setGeoLoading] = useState(false); // reverse geocode

  // list state (now fetched via GET)
  const [franchises, setFranchises] = useState<
    Array<{
      id: number | string;
      franchise_name: string;
      location: string;
      owner_name: string;
      status: string;
      // raw holds full server object so we can prefill when editing
      raw?: any;
    }>
  >([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  // edit state: if editing, editId contains id, otherwise null -> create mode
  const [editId, setEditId] = useState<string | number | null>(null);

  // delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // helper to open/close drawer
  const openDrawerForCreate = () => {
    setForm(initialForm);
    setErrors({});
    setEditId(null);
    setIsDrawerOpen(true);
  };

  // Defensive helper: tries multiple possible keys on the source object
  const pick = (src: any, keys: string[]) => {
    if (!src) return undefined;
    for (const k of keys) {
      if (typeof src[k] !== "undefined" && src[k] !== null) return src[k];
    }
    return undefined;
  };

  const openDrawerForEdit = (item: any) => {
    // prefer raw server object if available, otherwise the normalized item
    const src = item.raw ?? item;

    // common alternative keys observed in different backends
    const contact = pick(src, ["contact_number", "contactNumber", "phone", "mobile", "contact", "phone_number"]);
    const email = pick(src, ["email", "owner_email", "ownerEmail", "contact_email", "contactEmail"]);
    const address = pick(src, ["address", "location", "full_address", "addr", "fullAddress"]);
    const gst = pick(src, ["gst_tax_id", "gst", "gstTaxId"]);
    const bank = pick(src, ["bank_account", "bankAccount", "bank_account_number"]);
    const lat = pick(src, ["latitude", "lat"]);
    const lon = pick(src, ["longitude", "lng", "lon"]);

    setForm({
      franchise_name: (pick(src, ["franchise_name", "name", "title"]) as string) ?? "",
      location: (pick(src, ["location", "city", "address"]) as string) ?? "",
      owner_name: (pick(src, ["owner_name", "owner", "contact_name"]) as string) ?? "",
      contact_number: (contact as string) ?? "",
      email: (email as string) ?? "",
      status: ((pick(src, ["status"]) as "active" | "inactive") ?? "active"),
      address: (address as string) ?? "",
      gst_tax_id: (gst as string) ?? "",
      bank_account: (bank as string) ?? "",
      latitude: (lat as string) ?? "",
      longitude: (lon as string) ?? "",
    });
    setErrors({});
    setEditId(item.id);
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditId(null);
  };

  const handleChange =
    (k: keyof FranchiseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement).value;
      setForm((s) => ({ ...s, [k]: value }));
      setErrors((err) => ({ ...err, [k]: undefined }));
    };

  const validate = (): boolean => {
    const err: Partial<Record<keyof FranchiseForm, string>> = {};
    if (!form.franchise_name || !form.franchise_name.trim()) err.franchise_name = "Franchise name is required";
    if (!form.location || !form.location.trim()) err.location = "Location is required";
    if (!form.owner_name || !form.owner_name.trim()) err.owner_name = "Owner name is required";
    if (!form.contact_number || !form.contact_number.trim()) err.contact_number = "Contact number is required";
    if (form.contact_number && !/^\+?\d{7,15}$/.test(form.contact_number)) err.contact_number = "Invalid contact number";
    if (!form.email || !form.email.trim()) err.email = "Email is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!form.address || !form.address.trim()) err.address = "Address is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------- axios helpers ----------
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };
  const buildAuthHeaders = (token: string | null) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // ------------------ GET franchises from API ------------------
  const fetchFranchises = async (opts?: { showErrorToast?: boolean }) => {
    setListLoading(true);
    setListError(null);

    try {
      const token = getToken();
      const res = await api.get("/franchises", {
        headers: buildAuthHeaders(token),
      });

      const body = res?.data ?? null;

      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.franchises)) rows = body.franchises;
      else if (Array.isArray(body.franchise)) rows = body.franchise;
      else if (body && body.data && Array.isArray(body.data.rows)) rows = body.data.rows;
      else rows = [];

      // normalize rows into the simple shape used by UI, but keep raw server object
      const normalized = rows.map((r: any, idx: number) => ({
        id: r.id ?? r._id ?? r.franchise_id ?? `srv-${idx}`,
        franchise_name: r.franchise_name ?? r.name ?? r.title ?? "Unnamed",
        location: r.location ?? r.address ?? r.city ?? "-",
        owner_name: r.owner_name ?? r.owner ?? r.contact_name ?? "-",
        status: (r.status ?? "active").toLowerCase(),
        raw: r, // <-- store raw so edit can do robust prefill
      }));

      setFranchises(normalized);
    } catch (err: any) {
      console.error("Fetch franchises error:", err);
      setListError("Network error");
      if (opts?.showErrorToast !== false) toast.error("Network error while loading franchises");
      setFranchises([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ POST (create) OR PUT (update) franchise ------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors and try again.");
      return;
    }

    const payload = {
      franchise_name: form.franchise_name.trim(),
      location: form.location.trim(),
      owner_name: form.owner_name.trim(),
      contact_number: form.contact_number.trim(),
      email: form.email.trim(),
      status: form.status,
      address: form.address.trim(),
      gst_tax_id: form.gst_tax_id?.trim() || null,
      bank_account: form.bank_account?.trim() || null,
      latitude: form.latitude?.trim() || null,
      longitude: form.longitude?.trim() || null,
    };

    setLoading(true);

    try {
      const token = getToken();

      if (editId) {
        // PUT (update)
        // optimistic update (fast UI reflect)
        setFranchises((prev) =>
          prev.map((p) =>
            p.id === editId
              ? {
                  ...p,
                  franchise_name: payload.franchise_name,
                  location: payload.location,
                  owner_name: payload.owner_name,
                  status: payload.status,
                }
              : p
          )
        );

        const res = await api.put(`/franchises/${editId}`, payload, {
          headers: buildAuthHeaders(token),
        });

        // try to use returned row if present; then re-sync to be canonical
        toast.success("Franchise updated successfully");
        setIsDrawerOpen(false);
        await fetchFranchises();
      } else {
        // POST (create) - optimistic behaviour
        const optimisticId = `tmp-${Date.now()}`;
        const optimisticItem = {
          id: optimisticId,
          franchise_name: payload.franchise_name,
          location: payload.location,
          owner_name: payload.owner_name,
          status: payload.status,
        };
        setFranchises((prev) => [optimisticItem, ...prev]);
        setIsDrawerOpen(false);

        const res = await api.post(`/franchises`, payload, {
          headers: buildAuthHeaders(token),
        });

        const body = res?.data ?? null;
        const created = body && (body.row ?? body.data ?? body.franchise ?? body);

        if (created) {
          setFranchises((prev) => {
            const withoutOptimistic = prev.filter((f) => f.id !== optimisticId);
            const newItem = {
              id: created.id ?? created.franchise_id ?? created.franchiseId ?? created._id ?? Date.now(),
              franchise_name: created.franchise_name ?? created.name ?? payload.franchise_name,
              location: created.location ?? payload.location,
              owner_name: created.owner_name ?? created.owner ?? payload.owner_name,
              status: created.status ?? payload.status,
              raw: created,
            };
            return [newItem, ...withoutOptimistic];
          });
          toast.success("Franchise created successfully");
        } else {
          // fallback: re-fetch list to reconcile
          toast.success("Franchise added");
          await fetchFranchises();
        }
      }
    } catch (err: any) {
      console.error("Save franchise error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save franchise";
      toast.error(msg);
      // reconcile in case optimistic state got out of sync
      await fetchFranchises();
    } finally {
      setLoading(false);
      setForm(initialForm);
      setIsDrawerOpen(false);
      setEditId(null);
    }
  };

  // ------------------ DELETE franchise ------------------
  const confirmDelete = (id: string | number, name?: string) => {
    setDeleteTarget({ id, name });
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { id } = deleteTarget;

    try {
      // optimistic remove
      const prev = franchises;
      setFranchises((prevList) => prevList.filter((f) => String(f.id) !== String(id)));

      const token = getToken();
      await api.delete(`/franchises/${id}`, {
        headers: buildAuthHeaders(token),
      });

      toast.success("Franchise deleted");
      setDeleteTarget(null);
      // re-sync to be canonical
      await fetchFranchises();
    } catch (err: any) {
      console.error("Delete error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete franchise";
      toast.error(msg);
      // rollback / reconcile
      await fetchFranchises();
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ------------------ reverse geocode helper ------------------
  const handleLookupFromLatLon = async () => {
    const lat = form.latitude?.trim();
    const lon = form.longitude?.trim();

    if (!lat || !lon) {
      toast.error("Please enter both latitude and longitude.");
      return;
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      toast.error("Please enter valid numeric latitude and longitude values.");
      return;
    }

    setGeoLoading(true);
    toast.loading("Looking up address from coordinates...", { id: "geo" });

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      latNum
    )}&lon=${encodeURIComponent(lonNum)}&addressdetails=1`;

    try {
      const r = await fetch(nominatimUrl, { headers: { Accept: "application/json" } });

      if (!r.ok) {
        throw new Error(`Reverse geocode failed (${r.status})`);
      }

      const data = await r.json();
      const display = data.display_name ?? "";

      if (display) {
        setForm((s) => ({ ...s, address: display }));
        toast.dismiss("geo");
        toast.success("Address populated from coordinates");
      } else {
        toast.dismiss("geo");
        toast.error("Could not determine address from given coordinates.");
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      toast.dismiss("geo");
      toast.error("Reverse geocoding failed. Please check your network or coordinates.");
    } finally {
      setGeoLoading(false);
    }
  };
  return (
   <div className="p-4 md:p space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-end sm:justify-center gap-2">
            <Button onClick={() => void fetchFranchises({ showErrorToast: true })} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {listLoading ? "Refreshing..." : "Refresh"}
            </Button>

            <Button
              onClick={openDrawerForCreate}
              className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0"
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
            >
              <PlusCircle className="w-4 h-4" />
              Add Franchise
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Franchise Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading franchises…</div>
          ) : listError ? (
            <div className="p-6 text-center text-sm text-red-600">
              {listError} — <button className="underline" onClick={() => void fetchFranchises()}>Retry</button>
            </div>
          ) : (
            <>
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Owner</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {franchises.map((f) => (
                      <tr key={f.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{f.franchise_name}</td>
                        <td className="py-2 px-3">{f.location}</td>
                        <td className="py-2 px-3">{f.owner_name}</td>
                        <td className="py-2 px-3">
                          <span className={f.status === "active" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {f.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              title="Edit"
                              onClick={() => openDrawerForEdit(f)}
                              className="p-1 rounded hover:bg-gray-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              title="Delete"
                              onClick={() => confirmDelete(f.id, f.franchise_name)}
                              className="p-1 rounded hover:bg-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {franchises.map((f) => (
                  <div key={f.id} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{f.franchise_name}</h3>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                          >
                            {f.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{f.location}</p>
                        <p className="text-xs text-slate-500 mt-1">Owner: {f.owner_name}</p>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <button onClick={() => openDrawerForEdit(f)} className="p-1 rounded hover:bg-gray-100">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete(f.id, f.franchise_name)} className="p-1 rounded hover:bg-gray-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Drawer overlay */}
      <div className={`fixed inset-0 z-40 transition-opacity ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isDrawerOpen}>
        <div onClick={closeDrawer} className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Drawer panel (form) */}
      <aside role="dialog" aria-modal="true" aria-labelledby="drawer-title" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 id="drawer-title" className="text-lg font-medium">{editId ? "Edit Franchise" : "Add Franchise"}</h2>
                <p className="text-sm text-gray-500">{editId ? "Update details and save changes." : "Fill details to add a new franchise."}</p>
              </div>
            </div>
            <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
            <div className="grid grid-cols-1 gap-4">
              {/* fields */}
              <div>
                <label htmlFor="franchise_name" className="block text-sm font-medium text-gray-700">Franchise Name</label>
                <input id="franchise_name" value={form.franchise_name} onChange={handleChange("franchise_name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.franchise_name && <p className="text-sm text-red-600 mt-1">{errors.franchise_name}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input id="location" value={form.location} onChange={handleChange("location")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input id="owner_name" value={form.owner_name} onChange={handleChange("owner_name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.owner_name && <p className="text-sm text-red-600 mt-1">{errors.owner_name}</p>}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input id="contact_number" value={form.contact_number} onChange={handleChange("contact_number")} placeholder="+919876543210" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.contact_number && <p className="text-sm text-red-600 mt-1">{errors.contact_number}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" type="email" value={form.email} onChange={handleChange("email")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" value={form.status} onChange={handleChange("status")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-1 grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input id="latitude" placeholder="Latitude (e.g. 17.3850)" value={form.latitude} onChange={handleChange("latitude")} className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <input id="longitude" placeholder="Longitude (e.g. 78.4867)" value={form.longitude} onChange={handleChange("longitude")} className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <textarea id="address" value={form.address} onChange={handleChange("address")} rows={3} className="block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="w-36 flex-shrink-0">
                      <button type="button" onClick={handleLookupFromLatLon} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${geoLoading ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} disabled={geoLoading}>
                        {geoLoading ? "Looking…" : "Lookup"}
                      </button>
                    </div>
                  </div>
                </div>
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                <p className="text-xs text-gray-400 mt-1">Enter latitude and longitude, then click <strong>Lookup</strong> to auto-fill the address.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gst_tax_id" className="block text-sm font-medium text-gray-700">GST / Tax ID</label>
                  <input id="gst_tax_id" value={form.gst_tax_id} onChange={handleChange("gst_tax_id")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">Bank Account</label>
                  <input id="bank_account" value={form.bank_account} onChange={handleChange("bank_account")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} type="button">Cancel</Button>
              <Button type="submit" onClick={handleSubmit} disabled={loading}>{loading ? (editId ? "Updating..." : "Saving...") : (editId ? "Update Franchise" : "Save Franchise")}</Button>
            </div>
          </form>
        </div>
      </aside>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-4">
            <h3 className="text-lg font-medium">Confirm deletion</h3>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this franchise"}</strong>? This action cannot be undone.</p>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={doDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Franchise;





