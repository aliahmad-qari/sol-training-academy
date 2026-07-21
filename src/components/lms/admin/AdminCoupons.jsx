import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tag, Plus, Trash2, X, Save, CheckCircle, XCircle, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function CouponModal({ courses, onClose, onSaved }) {
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: 10, course_id: "", max_uses: 100, expires_at: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.code || !form.discount_value) { toast.error("Code and discount value required."); return; }
    setSaving(true);
    try {
      await base44.entities.Coupon.create({ ...form, used_count: 0 });
      toast.success("Coupon created!");
      onSaved(); onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-xl text-ink">Create Coupon</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Coupon Code *</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Discount Type</Label>
              <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Value *</Label>
              <Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Course (Leave blank for all)</Label>
            <Select value={form.course_id || "all"} onValueChange={v => setForm(f => ({ ...f, course_id: v === "all" ? "" : v }))}>
              <SelectTrigger><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Max Uses</Label>
              <Input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Expires On</Label>
              <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white">
            <Save className="w-4 h-4 mr-1.5" />{saving ? "Saving…" : "Create Coupon"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminCoupons({ courses }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.Coupon.list("-created_date", 100)
      .then(c => setCoupons(c))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const totalRevenueSaved = coupons.reduce((s, c) => s + (c.used_count || 0) * (c.discount_type === "fixed" ? c.discount_value : 0), 0);
  const totalUses = coupons.reduce((s, c) => s + (c.used_count || 0), 0);
  const activeCoupons = coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) >= new Date()));
  const chartData = [...coupons].sort((a, b) => (b.used_count || 0) - (a.used_count || 0)).slice(0, 8).map(c => ({
    code: c.code,
    uses: c.used_count || 0,
    limit: c.max_uses,
    pct: c.max_uses > 0 ? Math.round(((c.used_count || 0) / c.max_uses) * 100) : 0,
  }));

  const deleteCoupon = async (id) => {
    try {
      await base44.entities.Coupon.delete(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success("Coupon deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete coupon.");
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await base44.entities.Coupon.update(coupon.id, { is_active: !coupon.is_active });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update coupon.");
    }
  };
  };

  const filtered = coupons.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    const courseTitle = courses.find(cr => cr.id === c.course_id)?.title || "";
    return (c.code || "").toLowerCase().includes(q) || courseTitle.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {showModal && <CouponModal courses={courses} onClose={() => setShowModal(false)} onSaved={load} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-semibold text-lg text-ink">Coupon & Discount Codes</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAnalytics(!showAnalytics)} variant="outline" className="gap-1.5 text-sm h-9">
            <BarChart3 className="w-4 h-4" /> {showAnalytics ? "Hide" : "Show"} Analytics
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-harvest text-white gap-1.5 text-sm h-9"><Plus className="w-4 h-4" /> Create Coupon</Button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Coupons", value: coupons.length, color: "text-blue-600 bg-blue-50" },
              { label: "Active Coupons", value: activeCoupons.length, color: "text-emerald-600 bg-emerald-50" },
              { label: "Total Redemptions", value: totalUses, color: "text-amber-600 bg-amber-50" },
              { label: "Fixed $ Savings", value: `$${totalRevenueSaved}`, color: "text-purple-600 bg-purple-50" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-ink">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/50 p-5">
              <h3 className="font-display font-semibold text-sm text-ink mb-4">Coupon Usage (Top 8)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val, name) => [val, name === "uses" ? "Redemptions" : "Max Uses"]} />
                  <Bar dataKey="uses" radius={[4, 4, 0, 0]} name="uses">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 80 ? "#10b981" : entry.pct >= 50 ? "#f59e0b" : "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-slate-400 text-center mt-2">Green = 80%+ used · Amber = 50-79% · Purple = under 50%</p>
            </div>
          )}
        </div>
      )}
      {loading ? <div className="text-center py-10 text-slate_mist text-sm">Loading…</div> : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate_mist text-sm">No coupons yet. Create your first discount code!</p>
        </div>
      ) : (
        <>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or course…" className="pl-9 h-9 text-sm" />
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border/50 p-10 text-center">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate_mist text-sm">No coupons match “{search}”.</p>
          </div>
        ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-border/30">
              {["Code", "Discount", "Course", "Used/Max", "Expires", "Status", ""].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                const course = courses.find(cr => cr.id === c.course_id);
                return (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-slate-50">
                    <td className="px-4 py-3"><span className="font-mono font-bold text-ink bg-slate-100 px-2 py-0.5 rounded">{c.code}</span></td>
                    <td className="px-4 py-3 font-semibold text-harvest">{c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                    <td className="px-4 py-3 text-xs text-slate_mist">{course?.title || "All Courses"}</td>
                    <td className="px-4 py-3 text-xs text-ink">{c.used_count || 0} / {c.max_uses}</td>
                    <td className="px-4 py-3 text-xs text-slate_mist">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-AU") : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)}>
                        {c.is_active && !expired ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
                          : <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCoupon(c.id)} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        </>
      )}
    </div>
  );
}