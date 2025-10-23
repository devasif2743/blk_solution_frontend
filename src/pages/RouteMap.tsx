// Customer.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const areas = {
  Warangal: {
    locations: [
      { name: "Kazipet", sales: [{ name: "Arun", targets: 5, completed: 3 }] },
      { name: "Hanamkonda", sales: [{ name: "Ravi", targets: 8, completed: 6 }] },
    ],
  },
  Hyderabad: {
    locations: [
      { name: "Uppal", sales: [{ name: "Suresh", targets: 10, completed: 7 }] },
      { name: "LB Nagar", sales: [{ name: "Kiran", targets: 6, completed: 4 }] },
    ],
  },
  Nizamabad: {
    locations: [
      { name: "Bodhan", sales: [{ name: "Ajay", targets: 4, completed: 2 }] },
      { name: "Armoor", sales: [{ name: "Naresh", targets: 7, completed: 5 }] },
    ],
  },
};

type Assignment = {
  id: string;
  area: string;
  location: string;
  salesperson: string;
  target: number;
  completed: number;
  assignedAt: string;
  updatedAt?: string;
};

export default function Customer() {
  const [tab, setTab] = useState<"sales" | "delivery">("sales");

  // assignment form
  const [assignArea, setAssignArea] = useState<string>("");
  const [assignLocation, setAssignLocation] = useState<string>("");
  const [salespersonInput, setSalespersonInput] = useState<string>("");

  const [target, setTarget] = useState<string>("");
  const [completed, setCompleted] = useState<string>("");

  // data
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const areaOptions = Object.keys(areas);
  const assignLocationOptions = assignArea ? areas[assignArea].locations : [];

  const allSalespeople = useMemo(() => {
    const set = new Set<string>();
    Object.values(areas).forEach((a: any) =>
      (a.locations || []).forEach((loc: any) => (loc.sales || []).forEach((s: any) => set.add(s.name)))
    );
    return Array.from(set).sort();
  }, []);

  const formatDateTime = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    if (!editingId) return;
    const a = assignments.find((x) => x.id === editingId);
    if (!a) return;
    setAssignArea(a.area);
    setAssignLocation(a.location);
    setSalespersonInput(a.salesperson);
    setTarget(String(a.target));
    setCompleted(String(a.completed));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [editingId, assignments]);

  function resetAssignForm(keepAreaLocation = false) {
    if (!keepAreaLocation) setAssignArea("");
    if (!keepAreaLocation) setAssignLocation("");
    setSalespersonInput("");
    setTarget("");
    setCompleted("");
    setEditingId(null);
  }

  function handleAssign() {
    const salesperson = salespersonInput.trim();
    if (!assignArea) return alert("Please select an Area for the assignment.");
    if (!assignLocation) return alert("Please select a Location for the assignment.");
    if (!salesperson) return alert("Please select or enter a Salesperson name.");
    if (!target || isNaN(Number(target)) || Number(target) <= 0) return alert("Enter a valid numeric target (> 0).");
    if (completed && (isNaN(Number(completed)) || Number(completed) < 0)) return alert("Completed must be a non-negative integer.");

    const payload = {
      salesperson,
      target: Number(target),
      completed: completed ? Number(completed) : 0,
    };

    if (editingId) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                area: assignArea,
                location: assignLocation,
                salesperson: payload.salesperson,
                target: payload.target,
                completed: payload.completed,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );
      setEditingId(null);
    } else {
      const newAssignment: Assignment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        area: assignArea,
        location: assignLocation,
        salesperson: payload.salesperson,
        target: payload.target,
        completed: payload.completed,
        assignedAt: new Date().toISOString(),
      };
      setAssignments((prev) => [newAssignment, ...prev]);
    }

    setSalespersonInput("");
    setTarget("");
    setCompleted("");
  }

  function handleEditAssignment(id: string) {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    setEditingId(a.id);
  }

  function handleDeleteAssignment(id: string) {
    if (!confirm("Remove this assignment?")) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) resetAssignForm(false);
  }

  function exportAssignmentsCsv() {
    if (!assignments.length) return alert("No assignments to export.");
    const rows = [
      ["S.No", "Area", "Location", "Salesperson", "Target", "Completed", "Remaining", "Assigned At", "Updated At"],
    ];
    assignments.forEach((a, i) =>
      rows.push([
        String(i + 1),
        a.area,
        a.location,
        a.salesperson,
        String(a.target),
        String(a.completed),
        String(Math.max(0, a.target - a.completed)),
        formatDateTime(a.assignedAt),
        a.updatedAt ? formatDateTime(a.updatedAt) : "-",
      ])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openAssignmentsReport() {
    if (!assignments.length) return alert("No assignments to show.");
    const rowsHtml = assignments
      .map(
        (a, i) =>
          `<tr>
             <td style="padding:6px;border:1px solid #ddd;text-align:center">${i + 1}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.area}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.location}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.salesperson}</td>
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${a.target}</td>
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${a.completed}</td>
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${Math.max(0, a.target - a.completed)}</td>
             <td style="padding:6px;border:1px solid #ddd">${formatDateTime(a.assignedAt)}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.updatedAt ? formatDateTime(a.updatedAt) : "-"}</td>
           </tr>`
      )
      .join("");
    const html = `
      <html>
        <head>
          <title>Assignments</title>
          <style>body{font-family:system-ui, -apple-system, Roboto, 'Segoe UI', sans-serif; padding:16px} table{border-collapse:collapse;width:100%} td, th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h2>Assignments</h2>
          <table>
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #ddd">S.No</th>
                <th style="padding:6px;border:1px solid #ddd">Area</th>
                <th style="padding:6px;border:1px solid #ddd">Location</th>
                <th style="padding:6px;border:1px solid #ddd">Salesperson</th>
                <th style="padding:6px;border:1px solid #ddd">Target</th>
                <th style="padding:6px;border:1px solid #ddd">Completed</th>
                <th style="padding:6px;border:1px solid #ddd">Remaining</th>
                <th style="padding:6px;border:1px solid #ddd">Assigned At</th>
                <th style="padding:6px;border:1px solid #ddd">Updated At</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open();
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      alert("Popup blocked — allow popups or export CSV instead.");
    }
  }

  const filteredAssignments = assignments;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Tracking Dashboard</h1>
            <h1 className="text-xl md:text-xl font text-slate-900">In Progress</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={exportAssignmentsCsv}
            className="w-full sm:w-auto px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm"
            type="button"
          >
            Export Assignments
          </button>
          <button
            onClick={openAssignmentsReport}
            className="w-full sm:w-auto px-3 py-2 border rounded text-sm bg-white"
            type="button"
          >
            Open Assignments Report
          </button>
        </div>
      </div>

      {/* Assignment form - compact row: area/location | salesperson + tgt + cmp + actions (aligned) */}
      <div className="bg-white rounded-xl p-3 shadow-sm border mb-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium mb-1">Assign Area / Location → Salesperson</label>

          {/* Layout: stack on xs, single aligned row on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            {/* Area */}
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Area</label>
              <select
                value={assignArea}
                onChange={(e) => {
                  setAssignArea(e.target.value);
                  setAssignLocation("");
                }}
                className="h-10 w-full sm:w-44 px-3 border rounded bg-slate-50 text-sm"
              >
                <option value="">-- choose area --</option>
                {areaOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Location</label>
              <select
                value={assignLocation}
                onChange={(e) => setAssignLocation(e.target.value)}
                className="h-10 w-full sm:w-44 px-3 border rounded bg-slate-50 text-sm"
                disabled={!assignArea}
              >
                <option value="">-- choose location --</option>
                {assignLocationOptions.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Salesperson + Target + Completed + Actions in one compact flex that aligns vertically with selects */}
            <div className="flex-1 min-w-0">
              <label className="text-xs text-slate-500 mb-1 block">Salesperson + Target + Completed</label>

              <div className="flex items-center gap-2">
                {/* Salesperson */}
                <div className="min-w-0 w-44">
                  <input
                    list="sales-list"
                    value={salespersonInput}
                    onChange={(e) => setSalespersonInput(e.target.value)}
                    placeholder="Type or select"
                    className="h-10 w-full px-3 border rounded bg-white text-sm"
                    autoComplete="off"
                  />
                  <datalist id="sales-list">
                    {allSalespeople.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                {/* Target */}
                <input
                  type="number"
                  placeholder="Tgt"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="h-10 px-3 border rounded w-20 text-sm"
                  min={0}
                />

                {/* Completed */}
                <input
                  type="number"
                  placeholder="Completed"
                  value={completed}
                  onChange={(e) => setCompleted(e.target.value)}
                  className="h-10 px-3 border rounded w-20 text-sm"
                  min={0}
                />

                {/* Actions: small buttons aligned with inputs */}
                <button
                  onClick={handleAssign}
                  className="h-10 px-3 bg-blue-600 text-white rounded text-sm flex items-center justify-center"
                  aria-label={editingId ? "Update Assignment" : "Assign"}
                >
                  {editingId ? "Update" : "Assign"}
                </button>

                <button
                  onClick={() => resetAssignForm(true)}
                  className="h-10 px-2 border rounded text-sm bg-slate-100 hover:bg-slate-200"
                  title="Clear inputs (keep area/location)"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments table */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Assignments</h2>
          <div className="text-sm text-slate-500">{filteredAssignments.length} assigned</div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No assignments yet. Create one using the panel above.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 w-12">S.No</th>
                    <th className="p-3">Area</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Salesperson</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Completed</th>
                    <th className="p-3">Remaining</th>
                    <th className="p-3">Assigned At</th>
                    <th className="p-3 w-36">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 align-top">{i + 1}</td>
                      <td className="p-3 align-top">{a.area}</td>
                      <td className="p-3 align-top">{a.location}</td>
                      <td className="p-3 align-top">{a.salesperson}</td>
                      <td className="p-3 align-top">{a.target}</td>
                      <td className="p-3 align-top">{a.completed}</td>
                      <td className="p-3 align-top">{Math.max(0, a.target - a.completed)}</td>
                      <td className="p-3 align-top">{formatDateTime(a.assignedAt)}</td>
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAssignment(a.id)}
                            className="px-3 py-1 rounded bg-yellow-500 text-white text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filteredAssignments.map((a, i) => (
                <div key={a.id} className="border rounded-lg p-3 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="text-sm text-slate-400">#{i + 1} • {a.area} / {a.location}</div>
                      <div className="text-base font-medium mt-1">{a.salesperson}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Target: <span className="font-semibold">{a.target}</span> • Completed: <span className="font-semibold">{a.completed}</span>
                        <div className="mt-1">Remaining: <span className="font-semibold">{Math.max(0, a.target - a.completed)}</span></div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Assigned: {formatDateTime(a.assignedAt)}</div>
                      {a.updatedAt && <div className="text-xs text-slate-400">Updated: {formatDateTime(a.updatedAt)}</div>}
                    </div>

                    <div className="ml-3 flex-shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => handleEditAssignment(a.id)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white text-sm whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="px-3 py-1 rounded bg-red-500 text-white text-sm whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
