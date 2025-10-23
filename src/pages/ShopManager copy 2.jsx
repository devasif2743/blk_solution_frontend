import React, { useEffect, useState } from "react";
import {
  getShops,
  addShop,
  updateShop,
  deleteShop,
  getTerritories,
  getTsm,
  getBdesByTsm,
  getPincodeDetails,
} from "../api/authApi";

export default function ShopManager() {
  const [shops, setShops] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [tsms, setTsms] = useState([]);
  const [filteredBdes, setFilteredBdes] = useState([]);
  const [filteredBdesLoading, setFilteredBdesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    territory_id: "",
    tsm_id: "",
    bde_id: "",
  });

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  // ✅ Helper: safely extract array
  const safeArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  // 🚀 Load dropdown data
  const loadDropdowns = async () => {
    console.log("🔄 Loading dropdown data...");
    try {
      const [tsmRes, terrRes] = await Promise.all([
        getTsm({ per_page: 100 }),
        getTerritories(),
      ]);
      setTsms(Array.isArray(tsmRes.employees?.data) ? tsmRes.employees.data : []);
      setTerritories(safeArray(terrRes));
      setFilteredBdes([]);
    } catch (err) {
      console.error("❌ Dropdown Load Error:", err);
    }
  };

  // 🚀 Load shops
  const loadShops = async (page = 1) => {
    console.log("🔄 Loading shops, page:", page, "search:", search);
    setLoading(true);
    try {
      const res = await getShops({ page, per_page: 10, search });
      if (res.status) {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setShops(list);
        setPagination({
          current_page: res.data?.current_page || 1,
          last_page: res.data?.last_page || 1,
        });
      }
    } catch (e) {
      console.error("❌ Error loading shops:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
    loadShops();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => loadShops(), 400);
    return () => clearTimeout(delay);
  }, [search]);

  // 🔹 Handle Pincode Change
  const handlePincodeChange = async (value) => {
    setForm((prev) => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      const res = await getPincodeDetails(value);
      if (res?.state || res?.district) {
        setForm((prev) => ({
          ...prev,
          state: res.state,
          district: res.district,
        }));
      }
    }
  };

  // 🔹 Territory change → auto set TSM and fetch BDEs
  const handleTerritoryChange = async (territoryId) => {
    const selected = territories.find((t) => t.id == territoryId);
    setForm((prev) => ({
      ...prev,
      territory_id: territoryId,
      tsm_id: selected?.tsm_id || "",
    }));

    if (selected?.tsm_id) {
      await handleTsmChange(selected.tsm_id);
    } else {
      setFilteredBdes([]);
    }
  };

  // 🔹 TSM change → Fetch related BDEs
  const handleTsmChange = async (tsmId) => {
    console.log("👤 TSM Selected:", tsmId);
    setForm((prev) => ({ ...prev, tsm_id: tsmId, bde_id: "" }));

    if (!tsmId) {
      setFilteredBdes([]);
      return;
    }

    try {
      setFilteredBdesLoading(true);
      const res = await getBdesByTsm(tsmId);
      console.log("✅ Raw BDEs Response:", res.data);
      setFilteredBdes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to load BDEs:", err);
      setFilteredBdes([]);
    } finally {
      setFilteredBdesLoading(false);
    }
  };

  // 💾 Save Shop
  const handleSave = async () => {
    if (!form.name || !form.territory_id || !form.tsm_id)
      return alert("⚠️ Name, Territory, and TSM are required!");

    try {
      let res;
      if (form.id) {
        res = await updateShop(form.id, form);
      } else {
        res = await addShop(form);
      }

      if (res.status) {
        alert(form.id ? "✅ Shop updated successfully!" : "✅ Shop added successfully!");
        resetForm();
        loadShops();
      } else {
        alert(res.message || "❌ Something went wrong");
      }
    } catch (e) {
      console.error("❌ Save Error:", e);
      alert("Failed to save shop!");
    }
  };

  // ✏️ Edit
  const handleEdit = async (s) => {
    console.log("✏️ Editing Shop:", s);
    setForm({
      id: s.id,
      name: s.name || "",
      phone: s.phone || "",
      address: s.address || "",
      district: s.district || "",
      state: s.state || "",
      pincode: s.pincode || "",
      territory_id: s.territory_id || "",
      tsm_id: s.tsm_id || "",
      bde_id: s.bde_id || "",
    });

    // 🧠 Auto-load BDEs when editing
    if (s.tsm_id) {
      console.log("🔁 Auto-loading BDEs for TSM:", s.tsm_id);
      await handleTsmChange(s.tsm_id);
    }

    // In case territory auto-sets TSM
    if (s.territory_id && !s.tsm_id) {
      await handleTerritoryChange(s.territory_id);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    try {
      const res = await deleteShop(id);
      if (res.status) {
        alert("✅ Deleted successfully");
        loadShops();
      } else {
        alert(res.message || "❌ Failed to delete");
      }
    } catch (e) {
      console.error("❌ Delete Error:", e);
    }
  };

  // 🔄 Reset Form
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      phone: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      territory_id: "",
      tsm_id: "",
      bde_id: "",
    });
    setFilteredBdes([]);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">🏪 Shop Management</h1>

      {/* ==== FORM ==== */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-3">{form.id ? "Edit Shop" : "Add New Shop"}</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Basic Fields */}
          <div>
            <label className="text-sm">Shop Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Shop Name"
            />
          </div>

          <div>
            <label className="text-sm">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Phone"
            />
          </div>

          <div>
            <label className="text-sm">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Address"
            />
          </div>

          <div>
            <label className="text-sm">Pincode</label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Pincode"
              maxLength="6"
            />
          </div>

          <div>
            <label className="text-sm">District</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="District"
            />
          </div>

          <div>
            <label className="text-sm">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="State"
            />
          </div>

          {/* Territory */}
          <div>
            <label className="text-sm">Territory *</label>
            <select
              value={form.territory_id}
              onChange={(e) => handleTerritoryChange(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Select Territory --</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.district})
                </option>
              ))}
            </select>
          </div>

          {/* TSM */}
          <div>
            <label className="text-sm">TSM *</label>
            <select
              value={form.tsm_id}
              onChange={(e) => handleTsmChange(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Select TSM --</option>
              {tsms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* BDE */}
          <div>
            <label className="text-sm">BDE</label>
            <select
              value={form.bde_id}
              onChange={(e) => setForm({ ...form, bde_id: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Select BDE --</option>
              {filteredBdesLoading ? (
                <option disabled>Loading BDEs...</option>
              ) : Array.isArray(filteredBdes) && filteredBdes.length > 0 ? (
                filteredBdes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.email})
                  </option>
                ))
              ) : (
                <option disabled>No BDEs found</option>
              )}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {form.id ? "Update" : "Add"}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ==== Search ==== */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search Shop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-64 text-sm"
        />
      </div>

      {/* ==== Table ==== */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : shops.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No shops found.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Shop</th>
                <th className="p-2 border">District</th>
                <th className="p-2 border">Territory</th>
                <th className="p-2 border">TSM</th>
                <th className="p-2 border">BDE</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.district}</td>
                  <td className="p-2 border">{s.territory?.name}</td>
                  <td className="p-2 border">{s.tsm?.name}</td>
                  <td className="p-2 border">{s.bde?.user?.name || s.bde?.name}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ==== Pagination ==== */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={pagination.current_page === 1}
            onClick={() => loadShops(pagination.current_page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm mt-1">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => loadShops(pagination.current_page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
