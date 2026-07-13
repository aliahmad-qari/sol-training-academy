import React, { useState, useEffect } from "react";
import { Shield, Search, Trash2, Mail, Clock, CheckCircle, XCircle, RefreshCw, Plus, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ── Add Admin Modal ────────────────────────────────────────────────────────────
function AddAdminModal({ onClose, onSave }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.full_name.trim()) { toast.error("Full name is required."); return; }
    if (!form.email.trim()) { toast.error("Email is required."); return; }
    if (!form.password || form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setSaving(true);
    try {
      await apiClient.post("/users", {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "admin",
      });
      toast.success("Admin created. They can log in now with these credentials.");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin.");
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-display font-bold text-xl text-ink">Add New Admin</h3>
          </div>
          <button onClick={onClose} className="text-slate_mist hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Full Name *</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" autoFocus />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Email *</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Password *</Label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
            <p className="text-[10px] text-slate_mist mt-1">Share these credentials securely — the new admin logs in with this email and password.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white">
            <Save className="w-4 h-4 mr-1.5" />{saving ? "Creating…" : "Create Admin"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Format a date + time safely for display.
function fmtDateTime(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return {
    date: d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleString("en-AU"),
  };
}

export default function AdminAdminsManager() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const myId = currentUser?.id || currentUser?._id;

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/users", { params: { role: "admin", limit: 200 } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setAdmins(list);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteAdmin = async (admin) => {
    const id = admin.id || admin._id;
    const name = admin.full_name || admin.email || "this admin";
    if (!confirm(
      `Permanently DELETE admin ${name}?\n\n` +
      `This removes their account and ALL related data. This cannot be undone.`
    )) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success("Admin permanently deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = admins.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.full_name || "").toLowerCase().includes(q) || (a.email || "").toLowerCase().includes(q);
  });

  const activeCount = admins.filter(a => a.is_active !== false).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" /> Admin Accounts
          </h2>
          <p className="text-sm text-slate_mist">View and remove administrator accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2 text-xs h-9">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-harvest text-white gap-1.5 text-sm h-9">
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        </div>
      </div>

      {showAddModal && <AddAdminModal onClose={() => setShowAddModal(false)} onSave={load} />}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Admins", value: admins.length, icon: Shield, color: "text-red-600 bg-red-50" },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Suspended", value: admins.length - activeCount, icon: XCircle, color: "text-amber-600 bg-amber-50" },
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

      {/* Search */}
      <div className="relative flex-1 mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search admins by name or email…" className="pl-9 h-9 text-sm" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading admins…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-16 text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
          <p className="font-display font-semibold text-ink">No admins found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Admin", "Status", "Last Login", "Created", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const id = a.id || a._id;
                  const isSelf = String(id) === String(myId);
                  const lastLogin = fmtDateTime(a.last_login_at);
                  const created = fmtDateTime(a.createdAt);
                  const isActive = a.is_active !== false;
                  return (
                    <motion.tr key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold flex-shrink-0">
                            {(a.full_name || a.email || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink text-sm flex items-center gap-1.5">
                              {a.full_name || "—"}
                              {isSelf && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">You</span>}
                            </p>
                            <p className="text-xs text-slate_mist flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {a.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {lastLogin ? (
                          <span className="text-slate_mist" title={lastLogin.full}>
                            {lastLogin.date}
                            <span className="text-slate_mist/60 ml-1">{lastLogin.time}</span>
                          </span>
                        ) : (
                          <span className="text-slate_mist/40">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {created ? created.date : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline"
                          onClick={() => deleteAdmin(a)}
                          disabled={isSelf || deletingId === id}
                          title={isSelf ? "You cannot delete your own account" : "Permanently delete this admin"}
                          className="h-7 px-2 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/5 gap-1 disabled:opacity-40">
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
            Showing {filtered.length} of {admins.length} admins
          </div>
        </div>
      )}
    </div>
  );
}
