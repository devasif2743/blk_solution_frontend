import React, { useEffect, useState } from "react";
import { addTerritory, getTerritories, deleteTerritory,getTsm,getPincodeDetails }  from "../api/authApi";


export default function TerritoryPage() {
  const [territories, setTerritories] = useState([]);
  const [tsmList, setTsmList] = useState([]);
  const [loadingTsm, setLoadingTsm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    state: "",
    district: "",
    lat: "",
    lon: "",
    tsm_id: "",
    pincode:"",
  });

  useEffect(() => {
    loadTerritories();
    loadTsms();
  }, []);

    const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setForm({ ...form, pincode: value });

    // 🔍 Auto fetch on 6 digits
    if (value.length === 6) {
      const details = await getPincodeDetails(value);
      if (details) {
        setForm((prev) => ({
          ...prev,
          state: details.state,
          district: details.district,
        }));
      } else {
        alert("❌ Invalid or unrecognized pincode");
        setForm((prev) => ({ ...prev, state: "", district: "" }));
      }
    }
  };



  const loadTerritories = async () => {
  try {
    const res = await getTerritories();
    console.log("Territories:", res);
    // ✅ Correct structure
    if (res.status) setTerritories(res.data || []);
  } catch (err) {
    console.error("Failed to load territories:", err);
  }
};


  const loadTsms = async () => {
    try {
      setLoadingTsm(true);
      const data = await getTsm({ per_page: 100 });
      console.log("sssss",data);
      // ✅ Adjust this mapping according to your backend structure
    //   setTsmList(data.data || []); 
       setTsmList(data.employees?.data || []);
    } catch (err) {
      console.error("Error fetching TSMs:", err);
    } finally {
      setLoadingTsm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addTerritory(form);
      if (res.data.status) {
        alert("✅ Territory added successfully");
        setForm({ name: "", state: "", district: "", lat: "", lon: "", tsm_id: "" });
        loadTerritories();
      } else alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding territory");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure to delete?")) return;
    await deleteTerritory(id);
    loadTerritories();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Territory Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 bg-white p-4 rounded-lg border mb-6">
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
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="District"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={form.lon}
          onChange={(e) => setForm({ ...form, lon: e.target.value })}
          className="border p-2 rounded"
        />

        {/* 🔽 TSM Dropdown */}
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
                {tsm.name || tsm.full_name || `TSM #${tsm.id}`}
              </option>
            ))
          )}
        </select>

        <button className="col-span-2 bg-blue-600 text-white rounded py-2">
          Add Territory
        </button>
      </form>

      {/* Table */}
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
          {territories.map((t) => (
            <tr key={t.id}>
              <td className="border p-2">{t.name}</td>
              <td className="border p-2">{t.state}</td>
              <td className="border p-2">{t.district}</td>
              <td className="border p-2">
                {t.tsm?.name || `TSM #${t.tsm_id}`}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
