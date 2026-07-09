import React, { useState } from "react";
import { Users, Search, CheckCircle, Award, Clock, Plus, X, Save, Upload, UserX, UserCheck } from "lucide-react";
import AdminBulkEnroll from "@/components/lms/admin/AdminBulkEnroll";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700"
};

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  active: "bg-blue-100 text-blue-700",
  paused: "bg-gray-100 text-gray-600"
};

function AddStudentModal({ courses, onClose, onSave }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", course_ids: [] });
  const [saving, setSaving] = useState(false);

  const toggleCourse = (id) =>
    setForm(f => ({
      ...f,
      course_ids: f.course_ids.includes(id)
        ? f.course_ids.filter(c => c !== id)
        : [...f.course_ids, id],
    }));

  const save = async () => {
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (!form.password || form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (form.course_ids.length === 0) { toast.error("Select at least one course"); return; }
    setSaving(true);
    try {
      // 1. Create user account
      const userRes = await apiClient.post('/users', {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'student',
      });
      const userId = userRes.data?.data?._id || userRes.data?.data?.id;
      // 2. Bulk enroll in selected courses
      await apiClient.post('/enrollments/bulk', { user_id: userId, course_ids: form.course_ids });
      toast.success(`Student created and enrolled in ${form.course_ids.length} course(s).`);
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create student.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-xl text-ink">Add New Student</h3>
          <button onClick={onClose} className="text-slate_mist hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Full Name *</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" autoFocus />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Email *</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Password *</Label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-2 block">Enrol in Courses *</Label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {courses.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  form.course_ids.includes(c.id) ? "border-harvest bg-harvest/5" : "border-border/50 hover:bg-slate-50"
                }`}>
                  <input type="checkbox" className="accent-harvest" checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                  <span className="text-sm text-ink">{c.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white">
            <Save className="w-4 h-4 mr-1.5" />{saving ? "Creating…" : "Create & Enrol"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminStudentManager({ enrollments, courses, onRefresh }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleUserStatus = async (enrollment, action) => {
    // action: "suspend" | "activate"
    const userId = enrollment.user_id;
    if (!userId) { toast.error("No user ID on this enrollment."); return; }
    if (!confirm(`${action === "suspend" ? "Suspend" : "Re-activate"} ${enrollment.user_name || enrollment.user_email}?`)) return;
    setTogglingId(userId);
    try {
      await apiClient.patch(`/users/${userId}`, { is_active: action === "activate" });
      toast.success(action === "suspend" ? "Student suspended." : "Student re-activated.");
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setTogglingId(null);
    }
  };

  const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))];
  const completed = enrollments.filter(e => e.status === "completed").length;
  const certs = enrollments.filter(e => e.certificate_issued).length;

  const filtered = enrollments.filter(e => {
    const matchSearch = !search || 
      (e.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.course_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {showAddModal && <AddStudentModal courses={courses} onClose={() => setShowAddModal(false)} onSave={onRefresh} />}
      {showBulkEnroll && <AdminBulkEnroll courses={courses} onClose={() => setShowBulkEnroll(false)} onDone={onRefresh} />}
      {/* Header */}
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setShowBulkEnroll(true)} variant="outline" className="gap-1.5 text-sm h-9">
          <Upload className="w-4 h-4" /> Bulk Enroll CSV
        </Button>
        <Button onClick={() => setShowAddModal(true)} className="bg-harvest text-white gap-1.5 text-sm h-9">
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Students", value: uniqueStudents.length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Total Enrollments", value: enrollments.length, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
          { label: "Completions", value: completed, icon: Award, color: "text-green-600 bg-green-50" },
          { label: "Certificates Issued", value: certs, icon: Award, color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate_mist">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or course…" className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-border/50 p-1">
          {["all", "active", "completed", "paused"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-ink text-white" : "text-slate_mist hover:text-ink"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-16 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
          <p className="font-display font-semibold text-ink">No students found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Student", "Course", "Level", "Progress", "Status", "Enrolled", "Certificate", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                          {(e.user_name || e.user_email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-ink text-sm">{e.user_name || "—"}</p>
                          <p className="text-xs text-slate_mist">{e.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink font-medium truncate max-w-[180px]">{e.course_title || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[e.course_level] || "bg-gray-100 text-gray-600"}`}>
                        {e.course_level?.replace("level", "L")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-harvest rounded-full transition-all" style={{ width: `${e.progress_percent || 0}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-ink">{e.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[e.status] || "bg-gray-100 text-gray-600"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-AU") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {e.certificate_issued
                        ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        : <span className="text-slate_mist/40 text-lg">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(e.is_active === false || e.status === 'suspended') ? (
                          <Button size="sm" variant="outline"
                            onClick={() => toggleUserStatus(e, "activate")}
                            disabled={togglingId === e.user_id}
                            className="h-7 px-2 text-[10px] text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1">
                            <UserCheck className="w-3 h-3" /> Activate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline"
                            onClick={() => toggleUserStatus(e, "suspend")}
                            disabled={togglingId === e.user_id}
                            className="h-7 px-2 text-[10px] text-red-600 border-red-300 hover:bg-red-50 gap-1">
                            <UserX className="w-3 h-3" /> Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
            Showing {filtered.length} of {enrollments.length} enrollments
          </div>
        </div>
      )}
    </div>
  );
}