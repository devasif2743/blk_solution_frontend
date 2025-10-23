import React, { useEffect, useState } from "react";


import { addTerritory, getTerritories, deleteTerritory,getTsm,getPincodeDetails,updateTerritory }  from "../api/authApi";


export default function TerritoryPage() {
  const [territories, setTerritories] = useState([]);
  const [tsmList, setTsmList] = useState([]);
  const [loadingTsm, setLoadingTsm] = useState(false);

  // 🧾 Pagination + Search
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  // 🧩 Form
  const [form, setForm] = useState({
    name: "",
    pincode: "",
    state: "",
    district: "",
    lat: "",
    lon: "",
    tsm_id: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTsms();
    loadTerritories();
  }, [page, search]);

  // 📦 Load TSMs
  const loadTsms = async () => {
    try {
      setLoadingTsm(true);
      const res = await getTsm({ per_page: 100 });
      setTsmList(res.employees?.data || []);
    } catch (err) {
      console.error("Error fetching TSMs:", err);
    } finally {
      setLoadingTsm(false);
    }
  };

  // 📦 Load Territories
  const loadTerritories = async () => {
    try {
      const res = await getTerritories({ page, per_page: perPage, search });
      if (res.status) {
        setTerritories(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
        });
      }
    } catch (err) {
      console.error("Failed to load territories:", err);
    }
  };

  // 📍 Auto-fill state/district from pincode
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setForm({ ...form, pincode: value });
    if (value.length === 6) {
      const details = await getPincodeDetails(value);
      if (details) {
        setForm((prev) => ({
          ...prev,
          state: details.state,
          district: details.district,
        }));
      }
    }
  };

  // ➕ Add / ✏️ Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await updateTerritory(editingId, form);
        if (res.status) {
          alert("✅ Territory updated!");
          setEditingId(null);
          resetForm();
          loadTerritories();
        } else alert(res.message);
      } else {
        const res = await addTerritory(form);
        if (res.status) {
          alert("✅ Territory added!");
          resetForm();
          loadTerritories();
        } else alert(res.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error saving territory");
    }
  };

  // 🗑️ Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this territory?")) return;
    try {
      const res = await deleteTerritory(id);
      if (res.status) {
        alert("🗑️ Territory deleted");
        loadTerritories();
      } else alert(res.message);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✏️ Edit
  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      pincode: "",
      state: t.state,
      district: t.district,
      lat: t.lat || "",
      lon: t.lon || "",
      tsm_id: t.tsm_id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">
          {editingId ? "Edit Territory" : "Add Territory"}
        </h1>
        <input
          type="text"
          placeholder="🔍 Search Territory..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border rounded p-2 w-full sm:w-64"
        />
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-3 bg-white p-4 rounded-lg border mb-6"
      >
        <input
          type="text"
          placeholder="Territory Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handlePincodeChange}
          className="border p-2 rounded"
          maxLength={6}
          required
        />

        <input
          type="text"
          placeholder="State"
          value={form.state}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="text"
          placeholder="District"
          value={form.district}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <select
          value={form.tsm_id}
          onChange={(e) => setForm({ ...form, tsm_id: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">-- Select TSM --</option>
          {loadingTsm ? (
            <option>Loading...</option>
          ) : (
            tsmList.map((tsm) => (
              <option key={tsm.id} value={tsm.id}>
                {tsm.name}
              </option>
            ))
          )}
        </select>

        <button
          type="submit"
          className={`col-span-2 py-2 rounded text-white ${
            editingId ? "bg-blue-600" : "bg-blue-600"
          }`}
        >
          {editingId ? "Update Territory" : "Add Territory"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">State</th>
            <th className="p-2 border">District</th>
            <th className="p-2 border">TSM</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {territories.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No territories found
              </td>
            </tr>
          ) : (
            territories.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.name}</td>
                <td className="border p-2">{t.state}</td>
                <td className="border p-2">{t.district}</td>
                <td className="border p-2">
                  {t.tsm ? (
                    <>
                      {t.tsm.name} <br />
                      <span className="text-xs text-gray-500">
                        {t.tsm.email}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {pagination.current_page} of {pagination.last_page}
        </span>
        <button
          onClick={() =>
            setPage((p) => (p < pagination.last_page ? p + 1 : p))
          }
          disabled={page >= pagination.last_page}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
