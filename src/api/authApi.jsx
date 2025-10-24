import axios from "axios";

const api=axios.create({

    baseURL:'http://127.0.0.1:8003/api',
    // baseURL:'https://apiblk.nearbydoctors.in/public/api',
  
     headers: {
        //  "Content-Type": "application/json",
   
        },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // check key name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
  
    if (error.response?.status == 401) {
  
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_details");

      window.location.href = "/";

    }

    return Promise.reject(error);
  }
);

export const login= async (payload)=>{
     const response= await api.post('login',payload);
     return response;
}

export const addProduct = async (formData) => {
  const res = await api.post("/admin/products/add-product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const sendOtp = async (formData) => {
  const res = await api.post("/forgot-password/send-otp", formData, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res=await api.post("/forgot-password/verify-otp", { email, otp });
  return res.data;
 
};

export const resetpassword = async (email, otp,password) => {
  const res=await api.post("/forgot-password/reset", { email, otp,password });
  return res.data;
 
};

export const getProducts = async (params = {}) => {
  try {
    const res = await api.get("/admin/products/get-products", { params });
    return res.data;
  } catch (error) {
    console.error("Error in getProducts:", error.response?.data || error.message);
    throw error.response?.data || { status: false, message: "Something went wrong" };
  }
};

// ✅ Show single product
export const getProductById = async (id) => {
  const res = await api.get(`/admin/products/show-product/${id}`);
  return res.data;
};

// ✅ Update product
export const updateProduct = async (id, formData) => {
  const res = await api.post(`/admin/products/update-products/${id}?_method=POST`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Delete product
export const deleteProduct = async (id) => {
  const res = await api.delete(`/admin/products/delete-products/${id}`);
  return res.data;
};

// Get variations for product
export const getVariations = async (productId) => {
  const { data } = await api.get(`admin/product-variation/get-products-variations/${productId}`);
  return data;
};

// Add variation
export const addVariation = async (productId, payload) => {
  const { data } = await api.post(`admin/product-variation/add-variation/${productId}`, payload);
  return data;
};

// Update variation
export const updateVariation = async (id, payload) => {
  const { data } = await api.post(`admin/product-variation/update-variation/${id}`, payload);
  return data;
};

// Delete variation
export const deleteVariation = async (id) => {
  const { data } = await api.delete(`admin/product-variation/delete-variation/${id}`);
  return data;
};

// Get all vendors
export const getVendors = async () => {
  const { data } = await api.get("admin/vendors/get-vendors");
  return data;
};

// Add vendor
export const addVendor = async (payload) => {
  const { data } = await api.post("admin/vendors/add-vendor", payload);
  return data;
};

// Show vendor by ID
export const showVendor = async (id) => {
  const { data } = await api.get(`admin/vendors/show-vendor/${id}`);
  return data;
};

// Update vendor
export const updateVendor = async (id, payload) => {
  const { data } = await api.post(`admin/vendors/update-vendor/${id}`, payload);
  return data;
};

// Delete vendor
export const deleteVendor = async (id) => {
  const { data } = await api.delete(`admin/vendors/delete-vendor/${id}`);
  return data;
};

export const getStocks = async (variationId) => {
  const { data } = await api.get(`admin/stocks/get-stock/${variationId}`);
  return data;
};

// ✅ Add stock entry
export const addStock = async (variationId, payload) => {
  const { data } = await api.post(`admin/stocks/add-stock/${variationId}`, payload);
  return data;
};

// ✅ Update stock entry
export const updateStock = async (id, payload) => {
  const { data } = await api.post(`admin/stocks/update-stock/${id}`, payload);
  return data;
};

// ✅ Delete stock entry
export const deleteStock = async (id) => {
  const { data } = await api.delete(`admin/stocks/delete-stock/${id}`);
  return data;
};

export const getFullProductsTree = async () => {
  const { data } = await api.get("admin/products/full-list");
  return data;
};

export const getEmployees = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get(`/admin/employees/get-employees`, {
    params: { page, per_page, search },
  });
  return data;
};

// Add new employee
export const addEmployee = async (payload) => {
  const { data } = await api.post(`/admin/employees/add-employee`, payload);
  return data;
};

// Update employee
export const updateEmployee = async (id, payload) => {
  const { data } = await api.post(`/admin/employees/update-employee/${id}`, payload);
  return data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/admin/employees/delete-employee/${id}`);
  return data;
};

export const getTsm = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get(`/admin/employees/get-tsm`, {
    params: { page, per_page, search },
  });
  return data;
};

export const getBde = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get(`/admin/employees/get-bde`, {
    params: { page, per_page, search },
  });
  return data;
};

// ================= TERRITORIES =================

// 🔹 Fetch state & district by pincode
export const getPincodeDetails = async (pincode) => {
  if (!pincode || pincode.length !== 6) return null;
  try {
    const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    if (Array.isArray(data) && data[0]?.Status === "Success") {
      const postOffice = data[0].PostOffice?.[0];
      return {
        state: postOffice?.State || "",
        district: postOffice?.District || "",
      };
    }
    return null;
  } catch (err) {
    console.error("Pincode lookup failed:", err);
    return null;
  }
};

export const getTerritories = async () => {
  const { data } = await api.get("/admin/territories");
  return data;
};

export const addTerritory = async (payload) => {
  const { data } = await api.post("/admin/territories", payload);
  return data;
};

export const updateTerritory = async (id, payload) => {
  const { data } = await api.post(`/admin/territories/update-territory/${id}`, payload);
  return data;
};

export const deleteTerritory = async (id) => {
  const { data } = await api.delete(`/admin/territories/delete-territory/${id}`);
  return data;
};

// ================= BDE (Business Development Executive) =================
// ==================== BDE (Business Development Executives) ====================

// ✅ Get BDE list with search + pagination
export const getBdes = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get("/admin/bdes/get-bdes", {
    params: { page, per_page, search },
  });
  return data;
};

// ✅ Add new BDE
export const addBde = async (payload) => {
  const { data } = await api.post("/admin/bdes/add-bde", payload);
  return data;
};

// ✅ Update BDE
export const updateBde = async (id, payload) => {
  const { data } = await api.post(`/admin/bdes/update-bde/${id}`, payload);
  return data;
};

// ✅ Delete BDE
export const deleteBde = async (id) => {
  const { data } = await api.delete(`/admin/bdes/delete-bde/${id}`);
  return data;
};

// ================= SHOPS =================
// ================= SHOPS =================

export const getShops = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get("/admin/shops/get-shops", {
    params: { page, per_page, search },
  });
  return data;
};

export const getShopsByTerritory = async (territoryId) => {
  const { data } = await api.get(`/admin/shops/by-territory/${territoryId}`);
  return data;
};

export const getShopsByBde = async (bdeId) => {
  const { data } = await api.get(`/admin/shops/by-bde/${bdeId}`);
  return data;
};

export const addShop = async (payload) => {
  const { data } = await api.post("/admin/shops/add-shop", payload);
  return data;
};

export const updateShop = async (id, payload) => {
  const { data } = await api.post(`/admin/shops/update-shop/${id}`, payload);
  return data;
};

export const deleteShop = async (id) => {
  const { data } = await api.delete(`/admin/shops/delete-shop/${id}`);
  return data;
};

// ================= SHOP VISITS =================
export const getShopVisits = async (params = {}) => {
  const { page = 1, per_page = 20, search = "" } = params;
  const { data } = await api.get("/admin/shop-visits/get-shop-visits", {
    params: { page, per_page, search },
  });
  return data;
};

export const getVisitsByBde = async (bdeId) => {
  const { data } = await api.get(`/admin/shop-visits/by-bde/${bdeId}`);
  return data;
};

export const getVisitsByShop = async (shopId) => {
  const { data } = await api.get(`/admin/shop-visits/by-shop/${shopId}`);
  return data;
};

export const addShopVisit = async (payload) => {
  const { data } = await api.post("/admin/shop-visits/add-visit", payload);
  return data;
};

export const updateShopVisit = async (id, payload) => {
  const { data } = await api.post(`/admin/shop-visits/update-visit/${id}`, payload);
  return data;
};

export const deleteShopVisit = async (id) => {
  const { data } = await api.delete(`/admin/shop-visits/delete-visit/${id}`);
  return data;
};

export const getBdesByTsm = async (tsmid)=>{
  try{
    const {data}=await api.get(`/admin/bdes/get-bdes-by-tsm/${tsmid}`);
    return data;

  }catch(error){
    console.error("Error fetching BDEs by TSM:", error);
    return { status: false, message: "Server error fetching BDE list" };
  }
}

// ================== BRAND API ==================
export const getBrands = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get("/admin/brand", { params });
  return data;
};

export const addBrand = async (formData) => {
  const { data } = await api.post("/admin/brand/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBrand = async (id, formData) => {
  const { data } = await api.post(`/admin/brand/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBrand = async (id) => {
  const { data } = await api.delete(`/admin/brand/delete/${id}`);
  return data;
};

// ================== CATEGORY API ==================
export const getCategories = async (params = {}) => {
  const { page = 1, per_page = 10, search = "" } = params;
  const { data } = await api.get("/admin/category", { params });
  return data;
};

export const addCategory = async (formData) => {
  const { data } = await api.post("/admin/category/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateCategory = async (id, formData) => {
  const { data } = await api.post(`/admin/category/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/admin/category/delete/${id}`);
  return data;
};

export default api;