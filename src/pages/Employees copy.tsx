
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Mail, Phone, X, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// <-- use your axios instance here (adjust path if needed)
import api from "../api/axios"

type Team = "all" | "sales" | "delivery" | "other";

type Employee = {
  id: number | string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Away" | "Offline";
  image?: string;
  meetingsToday?: number;
  lastSeen?: string;
  notes?: string;
  team?: Team;
  // optional extras
  employeeId?: string;
  joiningDate?: string;
  address?: string;
};

type FormState = {
  id?: number | string;
  employeeId?: string;
  joiningDate?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: Employee["status"];
  image_url: string;
  meetings_today: string;
  last_seen: string;
  notes: string;
  team: Team;
  address?: string;
};

const initialEmployees: Employee[] = [
  {
    id: "seed-1",
    name: "John Smith",
    role: "Sales Manager",
    email: "john@company.com",
    phone: "+91 98765 43210",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 8,
    lastSeen: "10 minutes ago",
    notes: "Top performer this month.",
    team: "sales",
  },
];

// NOTE: no static API_BASE here — requests use your axios instance `api`

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  // default to "all" so UI shows API rows regardless of team
  const [activeTab, setActiveTab] = useState<Team>("all");

  // profile & drawer state
  const [selected, setSelected] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileMounted, setIsProfileMounted] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);

  const [form, setForm] = useState<FormState>({
    id: undefined,
    employeeId: "",
    joiningDate: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    status: "Active",
    image_url: "",
    meetings_today: "0",
    last_seen: "",
    notes: "",
    team: "sales",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const PROFILE_WIDTH_PX = 384;
  const PROFILE_TRANSITION_MS = 280;
  const profileTransform = isProfileOpen ? "translateX(0)" : `translateX(100%)`;
  const mainMarginRight = isProfileOpen ? `${PROFILE_WIDTH_PX}px` : "0px";

  useEffect(() => {
    if (isDrawerOpen) {
      setIsDrawerMounted(true);
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsDrawerMounted(false), 300);
      const r = setTimeout(() => addBtnRef.current?.focus(), 300);
      document.body.style.overflow = "";
      return () => {
        clearTimeout(t);
        clearTimeout(r);
      };
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isProfileOpen) {
      setIsProfileMounted(true);
      setTimeout(() => profileRef.current?.focus(), 120);
    } else {
      const t = setTimeout(() => setIsProfileMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isProfileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isProfileOpen) setIsProfileOpen(false);
        if (isDrawerOpen) setIsDrawerOpen(false);
      }

      const trap = (ref: HTMLDivElement | null) => {
        if (!ref) return;
        const nodes = ref.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      if (isDrawerOpen) trap(drawerRef.current);
      if (isProfileOpen) trap(profileRef.current);
    };

    if (isDrawerOpen || isProfileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, isProfileOpen]);

  const openProfile = (emp: Employee) => {
    setSelected(emp);
    setIsProfileOpen(true);
  };
  const closeProfile = () => {
    setIsProfileOpen(false);
    setTimeout(() => setSelected(null), 250);
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- AXIOS helpers ----------
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  const buildAuthHeaders = (token: string | null) => {
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // ---------- FETCH (handles rows / data / array) ----------
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      // If your API requires auth, include token; otherwise axios instance can be preconfigured.
      const res = await api.get("/employees", {
        headers: buildAuthHeaders(token),
      });

      const body = res?.data ?? null;
      // helpful debug: copy-paste this output if you need more mapping
      console.log("EMPLOYEES BODY (raw):", body);

      let list: any[] = [];

      if (Array.isArray(body)) {
        list = body;
      } else if (Array.isArray(body.rows)) {
        list = body.rows;
      } else if (Array.isArray(body.data)) {
        list = body.data;
      } else {
        // fallback: find first array property
        const arrKey = Object.keys(body || {}).find((k) =>
          Array.isArray((body as any)[k])
        );
        if (arrKey) list = (body as any)[arrKey];
      }

      // normalize snake_case -> camelCase for UI
      const normalized: Employee[] = list.map((emp: any) => ({
        id: emp.id ?? emp._id ?? Date.now(),
        name: emp.name ?? emp.full_name ?? "",
        role: emp.role ?? emp.position ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? emp.phone_number ?? emp.contact ?? "",
        status: (emp.status as Employee["status"]) ?? "Active",
        // map image_url -> image
        image: emp.image ?? emp.image_url ?? emp.avatar ?? undefined,
        // map meetings_today -> meetingsToday
        meetingsToday:
          emp.meetings_today ?? emp.meetingsToday ?? emp.meetings ?? 0,
        // map last_seen -> lastSeen
        lastSeen: emp.last_seen ?? emp.lastSeen ?? undefined,
        notes: emp.notes ?? undefined,
        // keep team value, but normalize to our Team union if possible
        team:
          (emp.team === "sales" || emp.team === "delivery" || emp.team === "other")
            ? (emp.team as Team)
            : "other",
        employeeId: emp.employee_id ?? emp.employeeId ?? undefined,
        joiningDate: emp.joining_date ?? emp.joiningDate ?? undefined,
        address: emp.address ?? undefined,
      }));

      console.table(normalized); // quick visual check
      setEmployees(normalized);
    } catch (err: any) {
      console.error("Network error fetching employees:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error while fetching employees";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- SUBMIT (POST / PUT) ----------
  const submitEmployee = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    if (!validate()) return;

    const meetingsNum = form.meetings_today ? Number(form.meetings_today) : 0;

    const looksLikeDate = (s?: string) => {
      if (!s) return false;
      const trimmed = s.trim();
      return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmed);
    };

    let lastSeenToSend: string | null = null;
    if (looksLikeDate(form.last_seen)) {
      lastSeenToSend = form.last_seen!.trim();
    } else if (form.last_seen && form.last_seen.trim().length > 0) {
      lastSeenToSend = null;
    } else {
      lastSeenToSend = null;
    }

    const payload: any = {
      employee_id: form.employeeId || undefined,
      joining_date: form.joiningDate || undefined,
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      image_url: form.image_url?.trim() || undefined,
      meetings_today: Number.isNaN(meetingsNum) ? 0 : meetingsNum,
      last_seen: lastSeenToSend,
      notes: form.notes?.trim() || undefined,
      team: form.team,
      address: form.address?.trim() || undefined,
    };

    console.log("SUBMIT PAYLOAD:", payload);

    setIsSubmitting(true);
    try {
      const token = getToken();

      if (form.id) {
        // update
        // optimistic UI update (fast reflect)
        setEmployees((prev) =>
          prev.map((e) =>
            String(e.id) === String(form.id)
              ? {
                  ...e,
                  name: payload.name ?? e.name,
                  role: payload.role ?? e.role,
                  email: payload.email ?? e.email,
                  phone: payload.phone ?? e.phone,
                  status: payload.status ?? e.status,
                  image: payload.image_url ?? e.image,
                  notes: payload.notes ?? e.notes,
                  team: payload.team ?? e.team,
                }
              : e
          )
        );

        const res = await api.put(`/employees/${form.id}`, payload, {
          headers: buildAuthHeaders(token),
        });

        const body = res?.data ?? null;
        const updated = body?.row ?? body ?? null;
        toast.success("Employee updated successfully.");
        // ensure canonical server values
        await fetchEmployees();
        // close drawer
        setIsDrawerOpen(false);
      } else {
        // create
        // create optimistic item on UI
        const tmpId = `tmp-${Date.now()}`;
        const optimisticItem: Employee = {
          id: tmpId,
          name: payload.name,
          role: payload.role,
          email: payload.email,
          phone: payload.phone,
          status: payload.status ?? "Active",
          image: payload.image_url,
          meetingsToday: payload.meetings_today ?? 0,
          notes: payload.notes,
          team: payload.team,
          employeeId: payload.employee_id,
          joiningDate: payload.joining_date,
          address: payload.address,
        };
        setEmployees((prev) => [optimisticItem, ...prev]);
        setIsDrawerOpen(false);

        const res = await api.post(`/employees`, payload, {
          headers: buildAuthHeaders(token),
        });

        const body = res?.data ?? null;
        const created = body?.row ?? body ?? null;
        toast.success("Employee added successfully.");
        // refresh list from server (fast reflect + canonical data)
        await fetchEmployees();
      }

      // reset form
      setForm({
        id: undefined,
        employeeId: "",
        joiningDate: "",
        name: "",
        role: "",
        email: "",
        phone: "",
        status: "Active",
        image_url: "",
        meetings_today: "0",
        last_seen: "",
        notes: "",
        team: "sales",
        address: "",
      });
    } catch (err: any) {
      console.error("Network error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error while saving employee";
      toast.error(msg);
      // rollback temporary items if any
      setEmployees((prev) => prev.filter((p) => !String(p.id).startsWith("tmp-")));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- DELETE ----------
  const deleteEmployee = async (empId: number | string) => {
    const ok = window.confirm("Are you sure you want to delete this employee?");
    if (!ok) return;

    try {
      // optimistic remove
      const prev = employees;
      setEmployees((prevList) => prevList.filter((e) => String(e.id) !== String(empId)));

      const token = getToken();
      const res = await api.delete(`/employees/${empId}`, {
        headers: buildAuthHeaders(token),
      });

      // if API responds with content, you can inspect res.data
      toast.success("Employee deleted");
      // refresh list to be canonical
      await fetchEmployees();

      // if profile open for same employee, close it
      if (selected && String(selected.id) === String(empId)) {
        setIsProfileOpen(false);
        setTimeout(() => setSelected(null), 250);
      }
    } catch (err: any) {
      console.error("Network error while deleting employee:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error while deleting employee";
      toast.error(msg);
      // rollback on failure
      await fetchEmployees();
    }
  };

  // show all when activeTab === 'all'
  const filteredEmployees =
    activeTab === "all"
      ? employees
      : employees.filter((e) => (e.team ?? "other") === activeTab);

  return (
    <div className="relative">
      <Toaster position="top-right" />

      <div className="flex gap-4">
        <main
          className="flex-1 space-y-6 transition-[margin] duration-300 ease-in-out min-w-0"
          style={{
            marginRight: mainMarginRight,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-md bg-muted p-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    activeTab === "all" ? "bg-white shadow-sm" : "bg-transparent"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("sales")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    activeTab === "sales" ? "bg-white shadow-sm" : "bg-transparent"
                  }`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setActiveTab("delivery")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    activeTab === "delivery" ? "bg-white shadow-sm" : "bg-transparent"
                  }`}
                >
                  Delivery
                </button>
                <button
                  onClick={() => setActiveTab("other")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    activeTab === "other" ? "bg-white shadow-sm" : "bg-transparent"
                  }`}
                >
                  Other
                </button>
              </div>

              <Button
                ref={addBtnRef}
                className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-3 rounded-md shadow-sm"
                onClick={() => {
                  setForm({
                    id: undefined,
                    employeeId: "",
                    joiningDate: "",
                    name: "",
                    role: "",
                    email: "",
                    phone: "",
                    status: "Active",
                    image_url: "",
                    meetings_today: "0",
                    last_seen: "",
                    notes: "",
                    team: "sales",
                    address: "",
                  });
                  setIsDrawerOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
          <Card>
            <CardContent>
              <div className="mx-auto px-2">
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 2fr))",
                  }}
                >
                  {isLoading ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">
                      Loading employees...
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">
                      No employees in this tab.
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="p-3 rounded-md  transition-shadow bg-card"
                      >
                        <div
                          className="flex items-start gap-4 p-4 rounded-xl shadow-sm bg-white transition-all duration-200"
                          style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}
                        >
                          <Avatar className="w-12 h-12 ring-2 ring-gray-200">
                            {employee.image ? (
                              <AvatarImage src={employee.image} alt={employee.name} />
                            ) : (
                              <AvatarFallback className="bg-chart-primary text-white text-sm">
                                {employee.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h3 className="font-semibold text-base text-gray-800">{employee.name}</h3>
                                <p className="text-xs text-gray-500">{employee.role}</p>
                              </div>
                              <Badge
                                className="px-2 py-0.5 text-xs rounded-md"
                                variant={employee.status === "Active" ? "default" : "secondary"}
                              >
                                {employee.status}
                              </Badge>
                            </div>

                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="truncate">{employee.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{employee.phone}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">Team: <span className="capitalize">{employee.team ?? "other"}</span></div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-3
00"
                                onClick={() => openProfile(employee)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-300"
                                onClick={() => {
                                  setForm({
                                    id: employee.id,
                                    employeeId: employee.employeeId,
                                    joiningDate: employee.joiningDate,
                                    name: employee.name,
                                    role: employee.role,
                                    email: employee.email,
                                    phone: employee.phone,
                                    status: employee.status,
                                    image_url: employee.image ?? "",
                                    meetings_today: String(employee.meetingsToday ?? 0),
                                    last_seen: employee.lastSeen ?? "",
                                    notes: employee.notes ?? "",
                                    team: (employee.team ?? "other") as Team,
                                    address: employee.address ?? "",
                                  });
                                  setIsDrawerOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-300 text-red-500 hover:text-red-600 hover:border-red-400"
                                onClick={() => deleteEmployee(employee.id)}
                                title="Delete employee"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isDrawerMounted && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Add employee drawer">
              <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsDrawerOpen(false)}
                aria-hidden="true"
              />

              <aside
                ref={drawerRef}
                className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
                style={{ transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h3 className="text-lg font-semibold">{form.id ? "Edit Employee" : "Add Employee"}</h3>
                    <p className="text-sm text-muted-foreground">Enter employee details</p>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} aria-label="Close drawer" className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={submitEmployee} className="space-y-4">
                    {/* form fields (same as before) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Employee ID</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.employeeId ?? ""}
                          onChange={(e) => handleChange('employeeId', e.target.value)}
                          placeholder="Optional (e.g. EMP-001)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Joining Date</label>
                        <input
                          type="date"
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.joiningDate ?? ""}
                          onChange={(e) => handleChange('joiningDate', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Name / Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                          ref={firstInputRef}
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? 'border-red-400' : 'border-muted'}`}
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Full name"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.role ? 'border-red-400' : 'border-muted'}`}
                          value={form.role}
                          onChange={(e) => handleChange('role', e.target.value)}
                          placeholder="e.g. Sales Manager"
                        />
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                      </div>
                    </div>

                    {/* Email / Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.email ? 'border-red-400' : 'border-muted'}`}
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="email@company.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.phone ? 'border-red-400' : 'border-muted'}`}
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+91 99999 99999"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                        value={form.address ?? ""}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Office / City / State"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="block w-full border rounded-md p-2 focus:outline-none focus:ring">
                          <option value="Active">Active</option>
                          <option value="Away">Away</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Team</label>
                        <select value={form.team} onChange={(e) => handleChange('team', e.target.value)} className="block w-full border rounded-md p-2 focus:outline-none focus:ring">
                          <option value="sales">Sales</option>
                          <option value="delivery">Delivery</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.image_url}
                          onChange={(e) => handleChange('image_url', e.target.value)}
                          placeholder="Optional avatar URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Meetings Today</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.meetings_today}
                          onChange={(e) => handleChange('meetings_today', e.target.value)}
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Last Seen</label>
                      <input
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                        value={form.last_seen}
                        onChange={(e) => handleChange('last_seen', e.target.value)}
                        placeholder="e.g. 2 hours ago"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button variant="ghost" onClick={() => { setIsDrawerOpen(false); }}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? (form.id ? 'Saving...' : 'Adding...') : (form.id ? 'Save' : 'Add Employee')}
                      </Button>
                    </div>
                  </form>
                </div>
              </aside>
            </div>
          )}
        </main>

        {isProfileMounted && selected && (
          <aside
            ref={profileRef}
            role="dialog"
            aria-modal="false"
            aria-label="Employee profile"
            className="fixed top-0 right-0 h-screen bg-background shadow-2xl overflow-auto"
            style={{
              width: PROFILE_WIDTH_PX,
              maxWidth: "100%",
              transform: profileTransform,
              transition: `transform ${PROFILE_TRANSITION_MS}ms ease`,
              pointerEvents: isProfileOpen ? "auto" : "none",
              zIndex: 50,
            }}
            tabIndex={-1}
          >
            <div
              className="h-full flex flex-col"
              style={{
                opacity: isProfileOpen ? 1 : 0,
                transition: `opacity ${PROFILE_TRANSITION_MS / 1.5}ms ease ${isProfileOpen ? "0ms" : "0ms"}`,
              }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selected.image ? <AvatarImage src={selected.image} alt={selected.name} /> : (
                      <AvatarFallback className="bg-chart-primary text-white text-sm">
                        {selected.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={selected.status === "Active" ? "default" : "secondary"}>{selected.status}</Badge>
                  <button onClick={closeProfile} className="p-2 rounded-md hover:bg-muted" aria-label="Close profile">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a className="text-sm text-foreground hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a className="text-sm text-foreground" href={`tel:${selected.phone}`}>{selected.phone}</a>
                  </div>
                  <div className="text-sm text-muted-foreground">Last seen: {selected.lastSeen ?? "—"}</div>
                  {selected.employeeId && <div className="text-sm text-muted-foreground">Employee ID: {selected.employeeId}</div>}
                  {selected.joiningDate && <div className="text-sm text-muted-foreground">Joined: {selected.joiningDate}</div>}
                  {selected.address && <div className="text-sm text-muted-foreground">Address: {selected.address}</div>}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Today</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="rounded-md p-2 border w-28 text-center">
                      <div className="text-xs text-muted-foreground">Meetings</div>
                      <div className="text-lg font-semibold">{selected.meetingsToday ?? 0}</div>
                    </div>
                    <div className="rounded-md p-2 border w-28 text-center">
                      <div className="text-xs text-muted-foreground">Tasks</div>
                      <div className="text-lg font-semibold">—</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selected.notes ?? "No notes available."}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => alert(`Calling ${selected.phone}`)}>Call</Button>
                  <Button onClick={() => (window.location.href = `mailto:${selected.email}`)}>Send Email</Button>
                  <Button variant="outline" onClick={() => alert('Open full profile (implement)')}>Open Full Profile</Button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Employees;



