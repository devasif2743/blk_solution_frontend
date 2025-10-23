import React, { useEffect, useState } from "react";
import {
  getBdes,
  addBde,
  updateBde,
  deleteBde,
  getTsm,
  getTerritories,
  getEmployees,
  getBde,
} from "../api/authApi";

export default function BdeManager() {
  const [bdes, setBdes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [tsmList, setTsmList] = useState([]);
  const [territoryList, setTerritoryList] = useState([]);
  const [filteredTerritories, setFilteredTerritories] = useState([]); // ✅ Filtered list based on TSM
  const [employeeList, setEmployeeList] = useState([]);

  const [form, setForm] = useState({
    id: null,
    tsm_id: "",
    territory_id: "",
    user_id: "",
  });

  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [search, setSearch] = useState("");

  // 🧩 Helper to safely extract array data from backend
  const safeArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.employees?.data)) return res.employees.data;
    return [];
  };

  // 🚀 Load dropdown data
  const loadDropdowns = async () => {
    try {
      setLoadingDropdowns(true);
      const [tsmRes, territoryRes, employeeRes] = await Promise.all([
        getTsm({ per_page: 100 }),
        getTerritories(),
        getBde({ per_page: 100 }),
      ]);

      setTsmList(safeArray(tsmRes));
      setTerritoryList(safeArray(territoryRes));
      setFilteredTerritories([]); // initially empty
      setEmployeeList(safeArray(employeeRes));
    } catch (err) {
      console.error("Dropdown load error:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  // 🚀 Load BDE list
  const loadBdes = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getBdes({ page, per_page: 10, search });
      if (res.status) {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setBdes(list);
        setPagination({
          current_page: res.data?.current_page || 1,
          last_page: res.data?.last_page || 1,
        });
      }
    } catch (err) {
      console.error("Error fetching BDEs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBdes();
  }, [search]);

  // 🔹 When TSM selected → Filter territories
  const handleTsmChange = (tsmId) => {
    console.log("📍 Selected TSM:", tsmId);
    setForm((prev) => ({ ...prev, tsm_id: tsmId, territory_id: "" }));

    if (!tsmId) {
      setFilteredTerritories([]);
      return;
    }

    // ✅ Filter only territories assigned to this TSM
    const filtered = territoryList.filter((t) => String(t.tsm_id) === String(tsmId));
    console.log("✅ Filtered Territories:", filtered);
    setFilteredTerritories(filtered);
  };

  // ➕ Add / ✏️ Update BDE
  const handleSave = async () => {
    if (!form.user_id || !form.territory_id || !form.tsm_id)
      return alert("Please select TSM, Territory, and BDE user.");

    try {
      let res;
      if (form.id) {
        res = await updateBde(form.id, form);
        if (res.status) alert("✅ BDE updated successfully");
      } else {
        res = await addBde(form);
        if (res.status) alert("✅ BDE added successfully");
      }
      resetForm();
      loadBdes();
    } catch (err) {
      console.error("Save BDE error:", err);
      alert("Something went wrong while saving!");
    }
  };

  const handleEdit = (item) => {
    console.log("✏️ Editing:", item);
    setForm({
      id: item.id,
      tsm_id: item.tsm_id,
      territory_id: item.territory_id,
      user_id: item.user_id,
    });

    // 🧩 When editing, show relevant territories
    const filtered = territoryList.filter((t) => String(t.tsm_id) === String(item.tsm_id));
    setFilteredTerritories(filtered);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this BDE?")) return;
    try {
      const res = await deleteBde(id);
      if (res.status) {
        alert("🗑️ Deleted successfully");
        loadBdes();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete!");
    }
  };

  const resetForm = () => {
    setForm({ id: null, tsm_id: "", territory_id: "", user_id: "" });
    setFilteredTerritories([]);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">BDE Management</h1>

      {/* ================= FORM ================= */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-3">{form.id ? "Edit BDE" : "Add New BDE"}</h2>

        {loadingDropdowns ? (
          <p>Loading dropdowns...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {/* TSM */}
            <div>
              <label className="text-sm font-medium text-gray-700">TSM *</label>
              <select
                value={form.tsm_id}
                onChange={(e) => handleTsmChange(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">-- Select TSM --</option>
                {Array.isArray(tsmList) &&
                  tsmList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Territory */}
            <div>
              <label className="text-sm font-medium text-gray-700">Territory *</label>
              <select
                value={form.territory_id}
                onChange={(e) => setForm({ ...form, territory_id: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">-- Select Territory --</option>
                {filteredTerritories.length > 0
                  ? filteredTerritories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.district})
                      </option>
                    ))
                  : territoryList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.district})
                      </option>
                    ))}
              </select>
            </div>

            {/* BDE User */}
            <div>
              <label className="text-sm font-medium text-gray-700">BDE User *</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">-- Select User --</option>
                {Array.isArray(employeeList) &&
                  employeeList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

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

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : bdes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No BDEs found.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">BDE User</th>
                <th className="p-2 border">Territory</th>
                <th className="p-2 border">TSM</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bdes.map((b, i) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{b.user?.name}</td>
                  <td className="p-2 border">
                    {b.territory?.name} <br />
                    <span className="text-xs text-gray-500">{b.territory?.district}</span>
                  </td>
                  <td className="p-2 border">{b.territory?.tsm?.name}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
