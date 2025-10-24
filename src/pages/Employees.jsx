import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/authApi";

/* ---------- Right-side Drawer with fade/slide animations (responsive) ---------- */
/* ---------- Right-side Drawer (Compact Modern Panel) ---------- */
function SlideOver({ open, onRequestClose, children, title }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => setShow(true));
  }, [open]);

  const close = React.useCallback(() => {
    setShow(false);
    setTimeout(() => onRequestClose?.(), 220);
  }, [onRequestClose]);

  // ESC to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with fade & blur */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Drawer container */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-full
          max-w-[85vw] sm:max-w-[400px] md:max-w-[420px] lg:max-w-[440px]
          transform transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
          ${show ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Panel */}
        <div className="relative h-full bg-white rounded-l-2xl shadow-2xl ring-1 ring-black/5 flex flex-col">
          {/* Header */}
          {title && (
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 sm:px-5 py-2.5 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {title}
              </h3>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto px-3 sm:px-5 ${
              title ? "py-3" : "py-5"
            }`}
          >
            {typeof children === "function" ? children(close) : children}
          </div>
        </div>
      </aside>
    </div>
  );
}



const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("");

  // department → roles mapping
  const ROLE_BY_DEPT = {
    admin: ["admin"],
    inventory: ["po"],
    sales: ["tsm", "crm"],
    logistics: ["dc_manager", "dc_staff", "driver"],
  };
  const DEPARTMENTS = ["admin", "inventory", "sales", "logistics"];
  const availableRoles = formDept ? ROLE_BY_DEPT[formDept] || [] : [];

  useEffect(() => {
    if (formDept && formRole && !availableRoles.includes(formRole)) setFormRole("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDept]);

  const fetchEmployees = async (page = 1, searchTerm = "") => {
    setIsLoading(true);
    try {
      const res = await getEmployees({ page, per_page: 10, search: searchTerm });
      if (res.status) {
        setEmployees(res.employees.data);
        setPagination(res.employees);
        setCurrentPage(res.employees.current_page);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1, "");
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormContact("");
    setFormRole("");
    setFormDept("");
    setIsEdit(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    if (formDept && !availableRoles.includes(formRole)) {
      toast.error("Please select a valid role for the chosen department.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: formName,
        email: formEmail,
        password: formPassword || undefined,
        contact: formContact,
        role: formRole,
        dept: formDept,
      };
      const res =
        isEdit && selectedEmployee
          ? await updateEmployee(selectedEmployee.id, payload)
          : await addEmployee(payload);

      if (res.status) {
        toast.success(res.message);
        fetchEmployees(currentPage, search);
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to save employee");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await deleteEmployee(id);
      if (res.status) {
        toast.success(res.message);
        fetchEmployees(currentPage, search);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  const startEdit = (emp) => {
    setIsEdit(true);
    setSelectedEmployee(emp);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormContact(emp.contact || "");
    setFormRole(emp.role);
    setFormDept(emp.dept);
    setIsModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1, search);
  };

  return (
    <div className="w-full max-w-none lg:max-w-7xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Employee Management</h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="flex-1 sm:w-72 border rounded px-3 py-2 text-sm"
          />
          <Button type="submit" className="whitespace-nowrap h-9 px-3">Search</Button>
        </form>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Data View: table on sm+, cards on mobile */}
      <div className="rounded-xl border border-slate-200 shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
            Loading...
          </div>
        ) : (
          <>
            {/* Desktop / Tablet: real table */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Dept</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-slate-400 italic">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{emp.name}</td>
                        <td className="px-4 py-3">{emp.email}</td>
                        <td className="px-4 py-3">{emp.contact || "-"}</td>
                        <td className="px-4 py-3">{emp.role}</td>
                        <td className="px-4 py-3">{emp.dept}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(emp)}
                              className="h-8 px-2"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(emp.id)}
                              className="h-8 px-2"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="sm:hidden divide-y divide-slate-200">
              {employees.length === 0 ? (
                <div className="p-5 text-center text-slate-400 italic">No employees found</div>
              ) : (
                employees.map((emp, idx) => (
                  <div key={emp.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-800">
                        {idx + 1}. {emp.name}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(emp)}
                          className="h-8 px-2"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(emp.id)}
                          className="h-8 px-2"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <dl className="grid grid-cols-3 gap-y-2 text-[13px]">
                      <dt className="col-span-1 text-slate-500">Email</dt>
                      <dd className="col-span-2 text-slate-800 break-all">{emp.email}</dd>

                      <dt className="col-span-1 text-slate-500">Contact</dt>
                      <dd className="col-span-2 text-slate-800">{emp.contact || "-"}</dd>

                      <dt className="col-span-1 text-slate-500">Role</dt>
                      <dd className="col-span-2 text-slate-800">{emp.role}</dd>

                      <dt className="col-span-1 text-slate-500">Dept</dt>
                      <dd className="col-span-2 text-slate-800">{emp.dept}</dd>
                    </dl>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 sm:mt-6 text-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => fetchEmployees(currentPage - 1, search)}
              className="h-8 px-3"
            >
              Prev
            </Button>
            <span className="px-2">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === pagination.last_page}
              onClick={() => fetchEmployees(currentPage + 1, search)}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Right Drawer (fade + slide) */}
      <SlideOver
        open={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        {(close) => (
        <>
  <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-right tracking-tight text-gray-800">
    {isEdit ? "Edit Employee" : "Add Employee"}
  </h3>

  <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
    {/* PERSONAL */}
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
        <p className="text-[12px] sm:text-xs font-medium text-gray-700 uppercase tracking-wide">
          Personal Details
        </p>
      </div>

      <div className="p-3 space-y-2.5 sm:space-y-3">
        {/* Full Name */}
        <div className="grid grid-cols-12 items-center gap-2">
          <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="col-span-12 sm:col-span-8">
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="Enter full name"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-12 items-center gap-2">
          <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="col-span-12 sm:col-span-8">
            <input
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              type="email"
              className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        {/* Password (only Add) */}
        {!isEdit && (
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="col-span-12 sm:col-span-8">
              <input
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                type="password"
                className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Min. 8 characters"
                required
              />
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="grid grid-cols-12 items-center gap-2">
          <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
            Contact
          </label>
          <div className="col-span-12 sm:col-span-8">
            <input
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      </div>
    </div>

    {/* ORG */}
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
        <p className="text-[12px] sm:text-xs font-medium text-gray-700 uppercase tracking-wide">
          Organization
        </p>
      </div>

      <div className="p-3 space-y-2.5 sm:space-y-3">
        {/* Department */}
        <div className="grid grid-cols-12 items-center gap-2">
          <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
            Department <span className="text-red-500">*</span>
          </label>
          <div className="col-span-12 sm:col-span-8">
            <select
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role */}
        <div className="grid grid-cols-12 items-center gap-2">
          <label className="col-span-12 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-700 sm:text-right">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="col-span-12 sm:col-span-8">
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 bg-white px-2 text-[12px] focus:ring-2 focus:ring-indigo-200 outline-none disabled:opacity-60"
              required
              disabled={!formDept}
            >
              <option value="">
                {formDept ? "Select Role" : "Select Department first"}
              </option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* ACTIONS */}
    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
      <Button
        type="button"
        variant="outline"
        onClick={close}
        className="h-8 text-xs px-3"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSaving}
        className="h-8 text-xs px-3 bg-indigo-600 hover:bg-indigo-700"
      >
        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
        {isEdit ? "Save" : "Add"}
      </Button>
    </div>
  </form>
</>

        )}
      </SlideOver>
    </div>
  );
};

export default Employees;
