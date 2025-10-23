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

  // Fetch employees
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
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1, "");
  }, []);

  // Reset form
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

  // Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setIsSaving(true);
    try {
      let res;
      const payload = {
        name: formName,
        email: formEmail,
        password: formPassword || undefined,
        contact: formContact,
        role: formRole,
        dept: formDept,
      };

      if (isEdit && selectedEmployee) {
        res = await updateEmployee(selectedEmployee.id, payload);
      } else {
        res = await addEmployee(payload);
      }

      if (res.status) {
        toast.success(res.message);
        fetchEmployees(currentPage, search);
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save employee");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
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

  // Start edit
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

  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1, search);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="border p-2 rounded"
          />
          <Button type="submit">Search</Button>
        </form>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow border border-slate-200">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
            Loading...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">#</th>
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(emp)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => fetchEmployees(currentPage - 1, search)}
          >
            Prev
          </Button>
          <span>
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.last_page}
            onClick={() => fetchEmployees(currentPage + 1, search)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-3 right-3 text-slate-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Employee" : "Add Employee"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Name"
                required
              />
              <input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Email"
                required
              />
              {!isEdit && (
                <input
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  type="password"
                  className="w-full border p-2 rounded"
                  placeholder="Password"
                  required
                />
              )}
              <input
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Contact Number"
              />
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="tsm">TSM</option>
                <option value="sm">SM</option>
                <option value="bde">BDE</option>
                <option value="po">PO</option>
              </select>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Department</option>
                <option value="admin">Admin</option>
                <option value="po">PO</option>
                <option value="sales">Sales</option>
                <option value="delivery">Delivery</option>
              </select>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEdit ? "Save Changes" : "Add Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
