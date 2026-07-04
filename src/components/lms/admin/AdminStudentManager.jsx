import React, { useState } from "react";
import { Users, Search, CheckCircle, Award, Clock, Plus, X, Save, Upload } from "lucide-react";
import AdminBulkEnroll from "@/components/lms/admin/AdminBulkEnroll";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

function AddEnrollmentModal({ courses, onClose, onSave }) {
  const [form, setForm] = useState({ user_name: "", user_email: "", course_id: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.user_email || !form.course_id) { toast.error("Email and course are required"); return; }
    setSaving(true);
    try {
      // Search users by email using the search param (not a filter)
      const usersRes = await apiClient.get(`/users?search=${encodeURIComponent(form.user_email)}`);
      const users = usersRes.data?.data ?? [];
      const foundUser = users.find(u =>
        u.email?.toLowerCase() === form.user_email.toLowerCase()
      );
      if (!foundUser) {
        toast.error("No account found for that email. The student must register first.");
        setSaving(false);
        return;
      }
      await apiClient.post('/enrollments', {
        user_id: foundUser._id || foundUser.id,
        course_id: form.course_id,
      });
      toast.success("Student enrolled successfully!");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-xl text-ink">Add Student Enrollment</h3>
          <button onClick={onClose} className="text-slate_mist hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Student Name</Label>
            <Input value={form.user_name} onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))} placeholder="Jane Smith" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Student Email *</Label>
            <Input type="email" value={form.user_email} onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))} placeholder="jane@example.com" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Course *</Label>
            <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select a course…" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white">
            <Save className="w-4 h-4 mr-1.5" />{saving ? "Saving…" : "Enroll Student"}
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
      {showAddModal && <AddEnrollmentModal courses={courses} onClose={() => setShowAddModal(false)} onSave={onRefresh} />}
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
                  {["Student", "Course", "Level", "Progress", "Status", "Enrolled", "Certificate"].map(h => (
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
                        {e.created_date ? new Date(e.created_date).toLocaleDateString("en-AU") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {e.certificate_issued
                        ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        : <span className="text-slate_mist/40 text-lg">—</span>}
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