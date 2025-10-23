
// import React, { useEffect, useRef, useState } from "react";
// import { Plus, X, Edit2, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const API_BASE = "http://192.168.1.15:5000/api";
// const SERVER_ORIGIN = "http://192.168.1.15:5000";
// const ENDPOINTS = {
//   list: `${API_BASE}/category`,
//   create: `${API_BASE}/category`,
//   show: (id: string | number) => `${API_BASE}/category/${id}`, // kept but NOT used (no single GET)
//   update: (id: string | number) => `${API_BASE}/category/${id}`,
//   delete: (id: string | number) => `${API_BASE}/category/${id}`,
// };

// const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
// const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// type CategoryItem = {
//   id: string | number;
//   name: string;
//   image?: string; // full URL
//   createdAt?: string;
// };

// function unsplashForCategory(name?: string, size = "600x400") {
//   const keyword = (name || "grocery").split(" ").slice(0, 3).join(",");
//   return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
// }

// export default function Categories(): JSX.Element {
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [catForm, setCatForm] = useState<{ name: string; imagePreview?: string }>({ name: "", imagePreview: "" });
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState<{ id: string | number | null; name?: string }>({ id: null, name: "" });
//   const [deleting, setDeleting] = useState(false);

//   // helper: get token or null
//   const getToken = (): string | null => {
//     try {
//       return localStorage.getItem("token");
//     } catch (e) {
//       console.warn("Failed to read token from localStorage", e);
//       return null;
//     }
//   };

//   // normalization helper: map server shape to CategoryItem
//   const normalizeRow = (r: any, i = 0): CategoryItem => {
//     // resolve image_url (may be relative) to absolute URL
//     let imageFull: string | undefined = undefined;
//     const img = r.image_url ?? r.imageUrl ?? r.image ?? r.photo;
//     if (typeof img === "string" && img.length > 0) {
//       imageFull = img.startsWith("http") ? img : `${SERVER_ORIGIN}${img}`;
//     } else if (r.name) {
//       imageFull = unsplashForCategory(r.name);
//     } else {
//       imageFull = SAMPLE_IMG;
//     }

//     return {
//       id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
//       name: (r.name ?? r.category ?? r.title ?? `Category ${i + 1}`).toString(),
//       image: imageFull,
//       createdAt: r.created_at ?? r.createdAt ?? undefined,
//     };
//   };

//   // FETCH (GET all)
//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const token = getToken();
//       const headers: Record<string, string> = { Accept: "application/json" };
//       if (token) headers.Authorization = `Bearer ${token}`;

//       const res = await fetch(ENDPOINTS.list, { method: "GET", headers });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         console.error("fetchCategories non-ok body:", text);
//         toast.error(`Failed to fetch categories (${res.status}).`);
//         setCategories([]);
//         return;
//       }

//       const body = await res.json().catch(() => null);
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else if (body && Array.isArray(body.categories)) rows = body.categories;
//       else {
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       if (rows.length) {
//         setCategories(rows.map((r, i) => normalizeRow(r, i)));
//       } else {
//         setCategories([]);
//         toast.success("No categories returned from server.");
//       }
//     } catch (err) {
//       console.error("fetchCategories error:", err);
//       toast.error("Network error while loading categories.");
//       setCategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // FILE handling (store raw File and preview)
//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;

//     if (!file) {
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     if (!file.type || !file.type.startsWith("image/")) {
//       toast.error("Selected file is not an image. Please choose a valid image file.");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 5MB). Please select a smaller file.");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     setSelectedFile(file);
//     const reader = new FileReader();
//     reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
//     reader.readAsDataURL(file);
//   };

//   // CREATE (POST -> /api/category). If an image is present use FormData
//   const createCategory = async (payload: { name: string; file?: File | null }) => {
//     const token = getToken();
//     const headers: Record<string, string> = { Accept: "application/json" };
//     if (token) headers.Authorization = `Bearer ${token}`;

//     let res: Response;
//     if (payload.file) {
//       const fd = new FormData();
//       fd.append("name", payload.name);
//       fd.append("image", payload.file);
//       res = await fetch(ENDPOINTS.create, {
//         method: "POST",
//         headers,
//         body: fd,
//       });
//     } else {
//       headers["Content-Type"] = "application/json";
//       res = await fetch(ENDPOINTS.create, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ name: payload.name }),
//       });
//     }

//     if (!res.ok) {
//       const err = await res.json().catch(() => null);
//       throw new Error(err?.message || `Create failed (${res.status})`);
//     }
//     const body = await res.json().catch(() => null);
//     const serverItem = body?.data ?? body?.category ?? body ?? null;
//     return serverItem ? normalizeRow(serverItem) : null;
//   };

//   // UPDATE (PUT -> /api/category/:id) — uses POST + _method=PUT if file present
//   const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
//     const token = getToken();
//     const baseHeaders: Record<string, string> = { Accept: "application/json" };
//     if (token) baseHeaders.Authorization = `Bearer ${token}`;

//     if (payload.file) {
//       const fd = new FormData();
//       fd.append("name", payload.name);
//       fd.append("image", payload.file);
//       fd.append("_method", "PUT");

//       const res = await fetch(ENDPOINTS.update(id), {
//         method: "POST",
//         headers: { Authorization: baseHeaders.Authorization ?? "" },
//         body: fd,
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => null);
//         throw new Error(err?.message || `Update failed (${res.status})`);
//       }

//       const body = await res.json().catch(() => null);
//       const serverItem = body?.data ?? body?.category ?? body ?? null;
//       return serverItem ? normalizeRow(serverItem) : null;
//     }

//     const headers = { ...baseHeaders, "Content-Type": "application/json" };
//     const res = await fetch(ENDPOINTS.update(id), {
//       method: "PUT",
//       headers,
//       body: JSON.stringify({ name: payload.name }),
//     });

//     if (!res.ok) {
//       const err = await res.json().catch(() => null);
//       throw new Error(err?.message || `Update failed (${res.status})`);
//     }
//     const body = await res.json().catch(() => null);
//     const serverItem = body?.data ?? body?.category ?? body ?? null;
//     return serverItem ? normalizeRow(serverItem) : null;
//   };

//   // DELETE -> /api/category/:id
//   const deleteCategoryReq = async (id: string | number) => {
//     const token = getToken();
//     const headers: Record<string, string> = { Accept: "application/json" };
//     if (token) headers.Authorization = `Bearer ${token}`;

//     const res = await fetch(ENDPOINTS.delete(id), {
//       method: "DELETE",
//       headers,
//     });
//     if (!res.ok) {
//       const err = await res.json().catch(() => null);
//       throw new Error(err?.message || `Delete failed (${res.status})`);
//     }
//     return true;
//   };

//   // open drawer for create
//   const openCreate = () => {
//     setEditingId(null);
//     setCatForm({ name: "", imagePreview: "" });
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     setDrawerOpen(true);
//   };

//   // open drawer for edit (populate from local item)
//   const openEdit = (item: CategoryItem) => {
//     setEditingId(item.id);
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     setCatForm({ name: item.name, imagePreview: item.image ?? "" });
//     setDrawerOpen(true);
//   };

//   // handle submit (create or update)
//   const handleSubmit = async (ev?: React.FormEvent) => {
//     ev?.preventDefault();

//     if (!catForm.name.trim()) {
//       toast.error("Please enter a category name.");
//       return;
//     }

//     if (!editingId) {
//       if (!selectedFile) {
//         toast.error("Please select an image for the new category (max 5MB).");
//         return;
//       }
//     }

//     setSubmitting(true);
//     const payload = { name: catForm.name.trim(), file: selectedFile };

//     try {
//       if (editingId) {
//         await updateCategory(editingId, payload);
//         toast.success("Category updated");
//       } else {
//         await createCategory(payload);
//         toast.success("Category created");
//       }

//       await fetchCategories();
//       setDrawerOpen(false);
//       setCatForm({ name: "", imagePreview: "" });
//       setSelectedFile(null);
//       if (fileRef.current) fileRef.current.value = "";
//     } catch (err: any) {
//       console.error("submit error:", err);
//       toast.error(err?.message || "Failed to save category");
//     } finally {
//       setSubmitting(false);
//       setEditingId(null);
//     }
//   };

//   // NEW: open delete confirmation modal (instead of window.confirm)
//   const confirmDelete = (id: string | number, name?: string) => {
//     setDeleteTarget({ id, name });
//     setDeleteModalOpen(true);
//   };

//   // NEW: perform delete (called when user confirms in modal)
//   const performDelete = async () => {
//     if (!deleteTarget.id) return;
//     setDeleting(true);

//     const id = deleteTarget.id;
//     const prev = categories;
//     // optimistic remove
//     setCategories((p) => p.filter((c) => String(c.id) !== String(id)));

//     try {
//       await deleteCategoryReq(id);
//       toast.success("Category deleted");
//       await fetchCategories();
//     } catch (err: any) {
//       console.error("delete error:", err);
//       setCategories(prev); // rollback
//       toast.error(err?.message || "Failed to delete category");
//     } finally {
//       setDeleting(false);
//       setDeleteModalOpen(false);
//       setDeleteTarget({ id: null, name: "" });
//     }
//   };

//   const handleDelete = (id: string | number) => {
//     // kept for backward compatibility but we now open modal
//     const item = categories.find((c) => String(c.id) === String(id));
//     confirmDelete(id, item?.name);
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
//       <div className="flex items-start justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
//         </div>
//         <div className="ml-auto flex items-center gap-3">
//           <button onClick={openCreate} className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm" title="Add Category">
//             Add Category
//           </button>
//         </div>
//       </div>

//       {/* Grid */}
//       <div className="mb-6">
//         {loading ? (
//           <div className="flex flex-wrap gap-6">
//             {[1, 2, 3, 4, 5].map((n) => (
//               <div key={n} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 animate-pulse">
//                 <div className="w-full h-40 rounded-full bg-slate-200 mb-3" />
//                 <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
//                 <div className="h-3 w-1/3 bg-slate-200 rounded" />
//               </div>
//             ))}
//           </div>
//         ) : categories.length === 0 ? (
//           <div className="text-sm text-slate-500">No categories yet.</div>
//         ) : (
//           <div className="flex flex-wrap gap-8">
//             {categories.map((c) => (
//               <div key={String(c.id)} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center">
//                 <div className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center" style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
//                   {c.image ? (
//                     <img
//                       src={c.image}
//                       alt={c.name}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.name, "600x400");
//                       }}
//                     />
//                   ) : (
//                     <img src={unsplashForCategory(c.name, "600x400")} alt={c.name} className="w-full h-full object-cover" />
//                   )}
//                 </div>

//                 <div className="mt-4 px-2 w-full">
//                   <div className="text-green-800 font-semibold text-lg leading-tight">{c.name}</div>
//                   {/* Removed products line as requested */}

//                   {/* ACTIONS: horizontal row below name */}
//                   <div className="mt-3 flex items-center justify-center gap-3">
//                     <button
//                       onClick={() => openEdit(c)}
//                       aria-label={`Edit ${c.name}`}
//                       title="Edit"
//                       className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
//                     >
//                       <Edit2 className="w-4 h-4" />
//                       <span className="text-sm">Edit</span>
//                     </button>

//                     <button
//                       onClick={() => handleDelete(c.id)}
//                       aria-label={`Delete ${c.name}`}
//                       title="Delete"
//                       className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       <span className="text-sm">Delete</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
//         <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
//       </div>

//       <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
//               </div>
//             </div>
//             <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
//                 <input
//                   id="category"
//                   value={catForm.name}
//                   onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   placeholder="e.g. Beverages"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
//                 </label>

//                 <div className="mt-1 flex items-center gap-3">
//                   <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
//                     {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.name || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
//                   </div>

//                   <div className="flex-1">
//                     <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
//                     <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {editingId ? "Leave empty to keep existing image." : ""}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
//               <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setCatForm({ name: "", imagePreview: "" }); setDrawerOpen(false); setSelectedFile(null); setEditingId(null); if (fileRef.current) fileRef.current.value = ""; }}>
//                 Cancel
//               </button>
//               <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
//                 {submitting ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </aside>

//       {/* DELETE CONFIRMATION MODAL */}
//       {deleteModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }} />
//           <div className="relative z-10 w-11/12 max-w-sm bg-white rounded-md shadow-lg p-4">
//             <div className="flex items-start justify-between">
//               <h3 className="text-lg font-medium">Confirm delete</h3>
//               <button className="p-1 rounded hover:bg-gray-100" onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }}>
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <p className="mt-3 text-sm text-gray-700">Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>

//             <div className="mt-4 flex justify-end gap-3">
//               <button
//                 className="px-3 py-1 rounded-md border"
//                 onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }}
//                 disabled={deleting}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
//                 onClick={performDelete}
//                 disabled={deleting}
//               >
//                 {deleting ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// components/Categories.tsx
// components/Categories.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// import your axios instance (adjust path if needed)
import api from "../api/axios"

const ENDPOINTS = {
  list: "/category",
  create: "/category",
  show: (id: string | number) => `/category/${id}`, // kept but NOT used (no single GET)
  update: (id: string | number) => `/category/${id}`,
  delete: (id: string | number) => `/category/${id}`,
};

const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

type CategoryItem = {
  id: string | number;
  name: string;
  image?: string; // full URL
  createdAt?: string;
};

function unsplashForCategory(name?: string, size = "600x400") {
  const keyword = (name || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
}

// try to resolve server origin from axios instance baseURL or window.location (browser)
const resolveServerOrigin = (): string | null => {
  try {
    const baseURL = (api && (api.defaults as any) && (api.defaults as any).baseURL) || "";
    if (typeof baseURL === "string" && baseURL.length) {
      // remove trailing "/api" if present, and trailing slashes
      return baseURL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    }
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.location) return window.location.origin;
  return null;
};

export default function Categories(): JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ name: string; imagePreview?: string }>({ name: "", imagePreview: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number | null; name?: string }>({ id: null, name: "" });
  const [deleting, setDeleting] = useState(false);

  // helper: get token or null
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch (e) {
      console.warn("Failed to read token from localStorage", e);
      return null;
    }
  };

  // normalization helper: map server shape to CategoryItem
  const normalizeRow = (r: any, i = 0): CategoryItem => {
    // resolve image_url (may be relative) to absolute URL
    let imageFull: string | undefined = undefined;
    const img = r.image_url ?? r.imageUrl ?? r.image ?? r.photo;
    if (typeof img === "string" && img.length > 0) {
      if (img.startsWith("http")) {
        imageFull = img;
      } else {
        const origin = resolveServerOrigin();
        if (origin) {
          imageFull = `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
        } else {
          // no origin available (non-browser runtime + no axios baseURL) — keep relative path
          imageFull = img;
        }
      }
    } else if (r.name) {
      imageFull = unsplashForCategory(r.name);
    } else {
      imageFull = SAMPLE_IMG;
    }

    return {
      id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
      name: (r.name ?? r.category ?? r.title ?? `Category ${i + 1}`).toString(),
      image: imageFull,
      createdAt: r.created_at ?? r.createdAt ?? undefined,
    };
  };

  // ---------- AXIOS HELPERS ----------
  const buildAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // FETCH (GET all) using axios instance
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const headers = buildAuthHeaders();
      // use axios instance with relative endpoint; instance baseURL must be provided by the caller
      const res = await api.get(ENDPOINTS.list, { headers });
      const body = res?.data ?? null;

      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (body && Array.isArray(body.categories)) rows = body.categories;
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      if (rows.length) {
        setCategories(rows.map((r: any, i: number) => normalizeRow(r, i)));
      } else {
        setCategories([]);
        toast.success("No categories returned from server.");
      }
    } catch (err: any) {
      console.error("fetchCategories axios error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error while loading categories.";
      toast.error(msg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILE handling (store raw File and preview)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image. Please choose a valid image file.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB). Please select a smaller file.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // CREATE (POST -> /category). If an image is present use FormData
  const createCategory = async (payload: { name: string; file?: File | null }) => {
    const headers = buildAuthHeaders();

    try {
      let res;
      if (payload.file) {
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("image", payload.file);
        // axios will set the correct multipart headers automatically if Content-Type is not forced
        res = await api.post(ENDPOINTS.create, fd, { headers });
      } else {
        res = await api.post(ENDPOINTS.create, { name: payload.name }, { headers });
      }

      const body = res?.data ?? null;
      const serverItem = body?.data ?? body?.category ?? body ?? null;
      return serverItem ? normalizeRow(serverItem) : null;
    } catch (err: any) {
      console.error("createCategory axios error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Create failed`;
      throw new Error(msg);
    }
  };

  // UPDATE (PUT -> /category/:id) — uses POST + _method=PUT if file present
  const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
    const headers = buildAuthHeaders();

    try {
      if (payload.file) {
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("image", payload.file);
        fd.append("_method", "PUT");
        // use POST with _method=PUT (keeps your backend compatibility)
        const res = await api.post(ENDPOINTS.update(id), fd, { headers });
        const body = res?.data ?? null;
        const serverItem = body?.data ?? body?.category ?? body ?? null;
        return serverItem ? normalizeRow(serverItem) : null;
      } else {
        const res = await api.put(ENDPOINTS.update(id), { name: payload.name }, { headers });
        const body = res?.data ?? null;
        const serverItem = body?.data ?? body?.category ?? body ?? null;
        return serverItem ? normalizeRow(serverItem) : null;
      }
    } catch (err: any) {
      console.error("updateCategory axios error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Update failed`;
      throw new Error(msg);
    }
  };

  // DELETE -> /category/:id
  const deleteCategoryReq = async (id: string | number) => {
    const headers = buildAuthHeaders();
    try {
      await api.delete(ENDPOINTS.delete(id), { headers });
      return true;
    } catch (err: any) {
      console.error("deleteCategoryReq axios error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Delete failed`;
      throw new Error(msg);
    }
  };

  // open drawer for create
  const openCreate = () => {
    setEditingId(null);
    setCatForm({ name: "", imagePreview: "" });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setDrawerOpen(true);
  };

  // open drawer for edit (populate from local item)
  const openEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setCatForm({ name: item.name, imagePreview: item.image ?? "" });
    setDrawerOpen(true);
  };

  // handle submit (create or update)
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();

    if (!catForm.name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!editingId) {
      if (!selectedFile) {
        toast.error("Please select an image for the new category (max 5MB).");
        return;
      }
    }

    setSubmitting(true);
    const payload = { name: catForm.name.trim(), file: selectedFile };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }

      await fetchCategories();
      setDrawerOpen(false);
      setCatForm({ name: "", imagePreview: "" });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error("submit error:", err);
      toast.error(err?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
      setEditingId(null);
    }
  };

  // NEW: open delete confirmation modal (instead of window.confirm)
  const confirmDelete = (id: string | number, name?: string) => {
    setDeleteTarget({ id, name });
    setDeleteModalOpen(true);
  };

  // NEW: perform delete (called when user confirms in modal)
  const performDelete = async () => {
    if (!deleteTarget.id) return;
    setDeleting(true);

    const id = deleteTarget.id;
    const prev = categories;
    // optimistic remove
    setCategories((p) => p.filter((c) => String(c.id) !== String(id)));

    try {
      await deleteCategoryReq(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err: any) {
      console.error("delete error:", err);
      setCategories(prev); // rollback
      toast.error(err?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setDeleteTarget({ id: null, name: "" });
    }
  };

  const handleDelete = (id: string | number) => {
    // kept for backward compatibility but we now open modal
    const item = categories.find((c) => String(c.id) === String(id));
    confirmDelete(id, item?.name);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={openCreate} className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm" title="Add Category">
            Add Category
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mb-6">
        {loading ? (
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 animate-pulse">
                <div className="w-full h-40 rounded-full bg-slate-200 mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-slate-500">No categories yet.</div>
        ) : (
          <div className="flex flex-wrap gap-8">
            {categories.map((c) => (
              <div key={String(c.id)} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center" style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.name, "600x400");
                      }}
                    />
                  ) : (
                    <img src={unsplashForCategory(c.name, "600x400")} alt={c.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="mt-4 px-2 w-full">
                  <div className="text-green-800 font-semibold text-lg leading-tight">{c.name}</div>

                  {/* ACTIONS: horizontal row below name */}
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                      title="Edit"
                      className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      aria-label={`Delete ${c.name}`}
                      title="Delete"
                      className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
                <input
                  id="category"
                  value={catForm.name}
                  onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Beverages"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
                </label>

                <div className="mt-1 flex items-center gap-3">
                  <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
                    {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.name || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
                  </div>

                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
                    <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {editingId ? "Leave empty to keep existing image." : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setCatForm({ name: "", imagePreview: "" }); setDrawerOpen(false); setSelectedFile(null); setEditingId(null); if (fileRef.current) fileRef.current.value = ""; }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }} />
          <div className="relative z-10 w-11/12 max-w-sm bg-white rounded-md shadow-lg p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium">Confirm delete</h3>
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-700">Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-3 py-1 rounded-md border"
                onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget({ id: null, name: "" }); } }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={performDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


