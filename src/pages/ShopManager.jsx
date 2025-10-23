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

import toast, { Toaster } from "react-hot-toast";

export default function ShopManager() {
  const [shops, setShops] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [tsms, setTsms] = useState([]);
  const [filteredBdes, setFilteredBdes] = useState([]);
  const [filteredBdesLoading, setFilteredBdesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("admin"); // set to "crm" for CRM users

  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    altphone: "",
    address: "",
    village: "",
    shoplicence: "",
    shoppan: "",
    customername: "",
    customeradhar: "",
    customerpan: "",
    lan: "",
    lat: "",
    shoppic: null,
    district: "",
    state: "",
    pincode: "",
    territory_id: "",
    tsm_id: "",
    bde_id: "",
    previewPic: null,
    status: "pending",
  });

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  // ✅ Helper
  const safeArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  // 🚀 Load dropdown data
  const loadDropdowns = async () => {
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

       toast.error(err);
    }
  };

  // 🚀 Load shops
  const loadShops = async (page = 1) => {
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
       toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    console.log("BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    loadDropdowns();
    loadShops();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => loadShops(), 400);
    return () => clearTimeout(delay);
  }, [search]);

  // 🔹 Pincode auto-fill
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

  // 🔹 Territory & TSM linkage
  const handleTerritoryChange = async (territoryId) => {
    const selected = territories.find((t) => t.id == territoryId);
    setForm((prev) => ({
      ...prev,
      territory_id: territoryId,
      tsm_id: selected?.tsm_id || "",
    }));
    if (selected?.tsm_id) await handleTsmChange(selected.tsm_id);
    else setFilteredBdes([]);
  };

  const handleTsmChange = async (tsmId) => {
    setForm((prev) => ({ ...prev, tsm_id: tsmId, bde_id: "" }));
    if (!tsmId) return setFilteredBdes([]);
    try {
      setFilteredBdesLoading(true);
      const res = await getBdesByTsm(tsmId);
      setFilteredBdes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to load BDEs:", err);
       toast.error(err);
      setFilteredBdes([]);
    } finally {
      setFilteredBdesLoading(false);
    }
  };

  // 💾 Save
  // const handleSave = async () => {
  //   // if (!form.name || !form.territory_id || !form.tsm_id)
  //   //   return alert("⚠️ Name, Territory, and TSM are required!");

  //   try {
  //     let payload = { ...form };

  //     // handle image file upload
  //     if (form.shoppic instanceof File) {
  //       const formData = new FormData();
  //       Object.keys(payload).forEach((key) =>
  //         formData.append(key, payload[key])
  //       );
  //       payload = formData;
  //     }

  //     const res = form.id
  //       ? await updateShop(form.id, payload)
  //       : await addShop(payload);

  //     if (res.status) {

  //        toast.success(form.id ? "Shop updated successfully!" : "Shop added successfully!");
  //       resetForm();
  //       loadShops();
  //     } else
        
  //       toast.error(res.message || "Something went wrong");
  //   } catch (e) {
  //     console.error("❌ Save Error:", e);
  //     alert("Failed to save shop!");
      
  //   }
  // };

  const handleSave = async () => {
  try {
    let payload = { ...form };

    // ✅ If new image is selected → send it
    if (form.shoppic instanceof File) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        // ❌ Skip previewPic
        if (key !== "previewPic") {
          formData.append(key, payload[key]);
        }
      });
      payload = formData;
    } else {
      // ✅ If no new file selected → remove shoppic key
      delete payload.shoppic;
    }

    const res = form.id
      ? await updateShop(form.id, payload)
      : await addShop(payload);

    if (res.status) {
      toast.success(form.id ? "Shop updated successfully!" : "Shop added successfully!");
      resetForm();
      loadShops();
    } else {
      toast.error(res.message || "Something went wrong");
    }
  } catch (e) {
    console.error("❌ Save Error:", e);
    toast.error("Failed to save shop!");
  }
};


  // ✏️ Edit
const handleEdit = async (s) => {
  setForm({
    id: s.id,
    name: s.name || "",
    phone: s.phone || "",
    altphone: s.altphone || "",
    address: s.address || "",
    village: s.village || "",
    shoplicence: s.shoplicence || "",
    shoppan: s.shoppan || "",
    customername: s.customername || "",
    customeradhar: s.customeradhar || "",
    customerpan: s.customerpan || "",
    lan: s.lan || "",
    lat: s.lat || "",
    district: s.district || "",
    state: s.state || "",
    pincode: s.pincode || "",
    territory_id: s.territory_id || "",
    tsm_id: s.tsm_id || "",
    bde_id: s.bde_id || "",
    status: s.status || "pending",
    shoppic: null,
    previewPic: s.shoppic ? `${import.meta.env.VITE_API_BASE_URL}/${s.shoppic}` : null, // 👈 handle existing image path
  });

  if (s.tsm_id) await handleTsmChange(s.tsm_id);
  if (s.territory_id && !s.tsm_id) await handleTerritoryChange(s.territory_id);
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
      } else alert(res.message || "❌ Failed to delete");
    } catch (e) {
      console.error("❌ Delete Error:", e);
    }
  };

  // ✅ Approval
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this shop?")) return;
    try {
      const res = await updateShop(id, { status: "approved" });
      if (res.status) {
        alert("✅ Shop approved successfully!");
        loadShops();
      }
    } catch (err) {
      console.error("❌ Approval error:", err);
    }
  };

  // 🔄 Reset
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      phone: "",
      altphone: "",
      address: "",
      village: "",
      shoplicence: "",
      shoppan: "",
      customername: "",
      customeradhar: "",
      customerpan: "",
      lan: "",
      lat: "",
      shoppic: null,
      district: "",
      state: "",
      pincode: "",
      territory_id: "",
      tsm_id: "",
      bde_id: "",
      status: "pending",
    });
    setFilteredBdes([]);
  };

  return (


    <div className="p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">🏪 Shop Management</h1>

      {/* ==== FORM ==== */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-3">{form.id ? "Edit Shop" : "Add New Shop"}</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Shop Name */}
          <div>
            <label className="text-sm">Shop Name 

              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              // disabled={userRole !== "crm"}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded p-2 text-sm ${
                userRole !== "crm" ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Shop Name"
            />
          </div>

          {/* Phone & Alternate */}
          <div>
            <label className="text-sm">Phone <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Phone"
            />
          </div>
          <div>
            <label className="text-sm">Alternate Phone <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.altphone}
              onChange={(e) => setForm({ ...form, altphone: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Alternate Phone"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Address"
            />
          </div>
          <div>
            <label className="text-sm">Village <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Village"
            />
          </div>

          {/* Pincode / District / State */}
          <div>
            <label className="text-sm">Pincode <span className="text-red-500">*</span></label>
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
            <label className="text-sm">District <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="District"
            />
          </div>
          <div>
            <label className="text-sm">State <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="State"
            />
          </div>

          {/* Shop Licence / PAN */}
          <div>
            <label className="text-sm">Shop GST / Trade Licence
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.shoplicence}
              onChange={(e) => setForm({ ...form, shoplicence: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="GST / Trade Licence"
            />
          </div>
          <div>
            <label className="text-sm">Shop PAN <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.shoppan}
              onChange={(e) => setForm({ ...form, shoppan: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Shop PAN"
            />
          </div>

          {/* Customer Details */}
          <div>
            <label className="text-sm">Customer Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.customername}
              onChange={(e) => setForm({ ...form, customername: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Customer Name"
            />
          </div>
          <div>
            <label className="text-sm">Customer Aadhaar <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.customeradhar}
              onChange={(e) => setForm({ ...form, customeradhar: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Aadhaar"
            />
          </div>
          <div>
            <label className="text-sm">Customer PAN <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.customerpan}
              onChange={(e) => setForm({ ...form, customerpan: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Customer PAN"
            />
          </div>

          {/* GPS */}
          <div>
            <label className="text-sm">Latitude <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Latitude"
            />
          </div>
          <div>
            <label className="text-sm">Longitude <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.lan}
              onChange={(e) => setForm({ ...form, lan: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Longitude"
            />
          </div>

          {/* Shop Photo */}
             
     {/* Shop Photo */}
      <div>
        <label className="text-sm font-medium">
          Shop Photo <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setForm({ ...form, shoppic: file });
              const preview = URL.createObjectURL(file);
              setForm((prev) => ({ ...prev, previewPic: preview }));
            }
          }}
          className="w-full border rounded p-2 text-sm"
        />

        {/* Show preview for uploaded OR existing image */}
        {form.previewPic && (
          <div className="mt-2">
            <img
              src={form.previewPic}
              alt="Shop Preview"
              className="h-24 w-24 object-cover rounded border shadow-sm"
            />
          </div>
        )}
      </div>


          {/* Territory / TSM / BDE */}
          <div>
            <label className="text-sm">Territory <span className="text-red-500">*</span></label>
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
          <div>
            <label className="text-sm">TSM <span className="text-red-500">*</span></label>
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
          <div>
            <label className="text-sm">BDE <span className="text-red-500">*</span></label>
            <select
              value={form.bde_id}
              onChange={(e) => setForm({ ...form, bde_id: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Select BDE --</option>
              {filteredBdesLoading ? (
                <option disabled>Loading BDEs...</option>
              ) : filteredBdes.length > 0 ? (
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

        {/* Buttons */}
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
          placeholder="Search Shop or Village..."
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
                <th className="p-2 border">Village</th>
                <th className="p-2 border">District</th>
                <th className="p-2 border">Territory</th>
                <th className="p-2 border">TSM</th>
                <th className="p-2 border">BDE</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.village}</td>
                  <td className="p-2 border">{s.district}</td>
                  <td className="p-2 border">{s.territory?.name}</td>
                  <td className="p-2 border">{s.tsm?.name}</td>
                  <td className="p-2 border">{s.bde?.user?.name || s.bde?.name}</td>
                  <td className="p-2 border text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        s.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.status || "pending"}
                    </span>
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                    {userRole === "admin" && s.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Approve
                      </button>
                    )}
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
