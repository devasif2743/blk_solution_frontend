
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, X, RefreshCw, Trash2, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// <-- import your axios instance here (adjust path if needed)
import api from "../api/axios";
type Product = {
  id: string | number;
  name: string;
  price?: string;
  grams?: string;
  discount_amount?: string;
  discount_price?: string;
  image_url?: string;
  category?: string;
  image?: string;
  // keep raw for debugging
  raw?: any;
};

// no static base URL anymore

const placeholder = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // form only has name + image preview
  const [formName, setFormName] = useState("");
  const [formImagePreview, setFormImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  // try to resolve server origin from axios instance baseURL or window.location (browser)
  const resolveServerOrigin = (): string | null => {
    try {
      const baseURL = (api && (api.defaults as any) && (api.defaults as any).baseURL) || "";
      if (typeof baseURL === "string" && baseURL.length) {
        return baseURL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined" && window.location) return window.location.origin;
    return null;
  };

  // helper: append cache buster for same-origin API images to avoid stale browser cache
  function addCacheBuster(url: string): string {
    try {
      const u = new URL(url);
      const origin = resolveServerOrigin();
      // only cache-bust for images served from resolved API origin
      if (origin && u.origin === origin) {
        const t = Date.now();
        if (u.search) u.search += `&t=${t}`;
        else u.search = `?t=${t}`;
        return u.toString();
      }
      return url;
    } catch {
      // if parsing fails, just append fallback cache buster
      return url.includes("?") ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
    }
  }

  // helper: resolve image URLs returned by API
  function resolveImageUrl(raw?: string | null): string | undefined {
    if (!raw) return undefined;
    const trimmed = String(raw).trim();
    if (!trimmed) return undefined;
    // if already absolute
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    // if starts with // (protocol relative)
    if (trimmed.startsWith("//")) return `${window.location.protocol}${trimmed}`;
    // if starts with slash -> serve from resolved API origin
    const origin = resolveServerOrigin();
    if (origin) {
      const resolved = trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
      // add cache buster so updated images show immediately after update/upload
      return addCacheBuster(resolved);
    }
    // no origin available — return relative path (browser will resolve relative to current location)
    const fallback = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return addCacheBuster(fallback);
  }

  // normalize function - keep flexible in case API returns different keys
  function normalizeProduct(raw: any): Product {
    if (!raw) return { id: `local-${Date.now()}`, name: "Untitled" };
    const id = raw.id ?? raw._id ?? raw.product_id ?? raw.uuid ?? `local-${Date.now()}`;
    const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image ?? raw.photo ?? undefined;
    return {
      id,
      name: String(raw.name ?? raw.title ?? raw.productName ?? "Untitled"),
      price: raw.price ?? raw.amount ?? raw.cost,
      grams: raw.grams ?? raw.gram ?? raw.weight,
      discount_amount: raw.discount_amount ?? raw.discountAmount,
      discount_price: raw.discount_price ?? raw.discountPrice,
      image_url: resolveImageUrl(rawImage),
      category: raw.category ?? raw.category_id ?? undefined,
      raw,
    };
  }

  // build auth headers for axios
  const buildAuthHeaders = (token: string | null) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // fetch products using axios instance
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Missing auth token (please login).");
        setIsLoading(false);
        return;
      }

      const res = await api.get("/products", {
        headers: buildAuthHeaders(token),
      });

      const body = res?.data ?? null;

      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.products)) rows = body.products;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (Array.isArray(body.items)) rows = body.items;
      else if (body && typeof body === "object" && (body.id || body._id || body.name)) rows = [body];

      const normalized = rows.map((r) => normalizeProduct(r));
      setProducts(normalized);
    } catch (err: any) {
      console.error("Network error fetching products:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error while loading products";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drawer mount/unmount focus behavior
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsMounted(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImagePreview(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  // create product (only name + image) using axios
  const createProduct = async (name: string, file?: File | null) => {
    const fd = new FormData();
    fd.append("name", name);
    if (file) fd.append("image", file);
    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");

    try {
      const res = await api.post("/products", fd, {
        headers: buildAuthHeaders(token),
      });
      const body = res?.data ?? null;
      const createdRaw = body?.data ?? body?.product ?? body ?? null;
      return normalizeProduct(createdRaw);
    } catch (err: any) {
      console.error("createProduct error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Server error (create)`;
      throw new Error(msg);
    }
  };

  // update product (only name + image) using axios
  const updateProduct = async (id: string | number, name: string, file?: File | null) => {
    const fd = new FormData();
    fd.append("name", name);
    if (file) fd.append("image", file);
    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");
    try {
      // using PUT with FormData — axios will set multipart headers
      const res = await api.put(`/products/${id}`, fd, {
        headers: buildAuthHeaders(token),
      });
      const body = res?.data ?? null;
      const updatedRaw = body?.data ?? body?.product ?? body ?? null;
      return normalizeProduct(updatedRaw);
    } catch (err: any) {
      console.error("updateProduct error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Server error (update)`;
      throw new Error(msg);
    }
  };

  // delete product using axios
  const doDeleteProduct = async (id: string | number) => {
    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");
    try {
      const res = await api.delete(`/products/${id}`, {
        headers: buildAuthHeaders(token),
      });
      // optionally read res.data
      return true;
    } catch (err: any) {
      console.error("doDeleteProduct error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? `Server error (delete)`;
      throw new Error(msg);
    }
  };

  // validate just name
  const validate = () => {
    const e: { name?: string } = {};
    if (!formName || !formName.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setFormName("");
    setFormImagePreview("");
    setImageFile(null);
    setErrors({});
    setIsEdit(false);
    setEditingId(null);
  };

  // submit handler (create or update)
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) {
      toast.error("Please fix the form");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && editingId != null) {
        // optimistic update on UI while waiting for server response
        const optimistic = products.map((p) =>
          String(p.id) === String(editingId) ? { ...p, name: formName, image_url: formImagePreview || p.image_url } : p
        );
        setProducts(optimistic);

        const saved = await updateProduct(editingId, formName.trim(), imageFile);
        // merge saved (server may return proper fields)
        setProducts((prev) => prev.map((p) => (String(p.id) === String(editingId) ? saved : p)));
        toast.success("Product updated");

        // re-sync list with server (ensures ordering, fields and images are canonical)
        await fetchProducts();
      } else {
        // create optimistic item
        const tmpId = `tmp-${Date.now()}`;
        const optimisticItem: Product = { id: tmpId, name: formName.trim(), image_url: formImagePreview || "" };
        setProducts((prev) => [optimisticItem, ...prev]);
        setIsOpen(false);

        const saved = await createProduct(formName.trim(), imageFile);
        // replace optimistic with real item (if created)
        setProducts((prev) => {
          // put saved at top (avoid duplicate)
          const withoutTmp = prev.filter((p) => p.id !== tmpId);
          return [saved, ...withoutTmp];
        });
        toast.success("Product added");

        // re-sync to guarantee server state (images/cdn paths, ids)
        await fetchProducts();
      }

      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "Failed to save product");
      // if optimistic added a tmp item, remove it on failure
      setProducts((prev) => prev.filter((p) => !String(p.id).startsWith("tmp-")));
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
    }
  };

  // start edit: populate only name + preview
  const startEdit = (product: Product) => {
    setIsEdit(true);
    setEditingId(product.id);
    setFormName(product.name ?? "");
    setFormImagePreview(product.image_url ?? product.image ?? "");
    setImageFile(null);
    setIsOpen(true);
  };

  // request delete -> show modal
  const requestDelete = (id: string | number, name?: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    // optimistic remove
    const removedId = deleteTarget.id;
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(removedId)));
    try {
      await doDeleteProduct(removedId);
      toast.success("Product deleted");
      if (selectedProduct && String(selectedProduct.id) === String(removedId)) setSelectedProduct(null);

      // re-sync with server to be sure
      await fetchProducts();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err?.message || "Delete failed, reloading list");
      await fetchProducts();
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const openView = (product: Product) => setSelectedProduct(product);

  const handleRefresh = async () => {
    await fetchProducts();
    toast.success("Refreshed");
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleRefresh()}
              className="inline-flex items-center justify-center p-2 rounded-md border hover:bg-slate-50"
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <Button
              ref={addBtnRef}
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-6 text-center text-slate-500">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="col-span-full p-6 text-center text-slate-400">No products yet</div>
          ) : (
            products.map((product) => (
              <Card key={String(product.id)} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <div className="w-full h-44 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholder;
                        }}
                      />
                    ) : product.image ? (
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholder;
                        }}
                      />
                    ) : (
                      <div className="text-slate-400">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        title={`Edit ${product.name}`}
                        onClick={() => startEdit(product)}
                        className="inline-flex items-center justify-center p-2 rounded-md border hover:bg-slate-50"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        title={`Delete ${product.name}`}
                        onClick={() => requestDelete(product.id, product.name)}
                        className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="ml-auto">
                      <Button variant="outline" onClick={() => openView(product)}>
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add / Edit Drawer */}
        {isMounted && (
          <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
            <div
              className={`fixed inset-0 bg-black/50 transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
            />
            <aside
              ref={drawerRef}
              className="fixed top-0 right-0 h-full bg-white shadow-2xl overflow-auto rounded-l-2xl w-full sm:w-[520px] md:w-[480px] lg:w-[520px] p-6 transform transition-transform"
              style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Add Product"}</h3>
                  <p className="text-sm text-slate-500 mt-1">Only name & image are required</p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="p-2 rounded-md hover:bg-slate-100"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formImagePreview && (
                  <div className="w-full h-48 rounded-md overflow-hidden border">
                    <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setErrors({});
                    }}
                    className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900"
                  />
                  <p className="text-xs text-slate-400 mt-2">Max 5MB. If you leave image empty while editing, existing image stays.</p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 rounded-md border"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900">
                    {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        )}

        {/* View Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedProduct(null)} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6 z-10">
              {selectedProduct.image_url && (
                <div className="mb-4 w-full h-56 overflow-hidden rounded-md border">
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => (e.currentTarget as HTMLImageElement).src = placeholder} />
                </div>
              )}
              <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
              <div className="mt-2 text-sm text-slate-600">
                <div>Price: {selectedProduct.price ?? "-"}</div>
                <div>Discount: {selectedProduct.discount_price ?? "-"}</div>
                <div className="mt-3">
                  <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 z-10">
              <h3 className="text-lg font-medium">Confirm deletion</h3>
              <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this product"}</strong>? This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default Products;


