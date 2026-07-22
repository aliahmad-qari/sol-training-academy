import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate); exp.setHours(0, 0, 0, 0);
  return Math.round((exp - today) / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(enrollment) {
  if (!enrollment.expiry_date) return "unlimited";
  const d = daysLeft(enrollment.expiry_date);
  if (d < 0) return "expired";
  if (d <= 7) return "critical";
  if (d <= 30) return "expiring";
  return "active";
}

const STATUS_CONFIG = {
  active:    { label: "Active",         color: "text-emerald-700 bg-emerald-100", dot: "bg-emerald-500" },
  expiring:  { label: "Expiring Soon",  color: "text-amber-700 bg-amber-100",    dot: "bg-amber-500" },
  critical:  { label: "Expiring < 7d",  color: "text-red-700 bg-red-100",        dot: "bg-red-500 animate-pulse" },
  expired:   { label: "Expired",        color: "text-slate-600 bg-slate-200",     dot: "bg-slate-400" },
  unlimited: { label: "Unlimited",      color: "text-blue-700 bg-blue-100",      dot: "bg-blue-400" },
};

function ExtendModal({ enrollment, onClose, onExtended }) {
  const [days, setDays] = useState("30");
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  const extend = async () => {
    const addDays = days === "custom" ? parseInt(custom) : parseInt(days);
    // Allow negative values to reduce access; only reject 0 / non-numeric.
    if (!Number.isFinite(addDays) || addDays === 0) { toast.error("Enter a non-zero number of days"); return; }
    setSaving(true);
    try {
      const currentExpiry = enrollment.expiry_date ? new Date(enrollment.expiry_date) : new Date();
      // If already expired, adjust from today so an extend actually moves forward.
      const base = enrollment.status === "expired" ? new Date() : currentExpiry;
      base.setDate(base.getDate() + addDays);
      const newExpiry = base.toISOString().split("T")[0];
      const isPast = new Date(newExpiry).getTime() < Date.now();
      await base44.entities.CourseEnrollment.update(enrollment.id, {
        expiry_date: newExpiry,
        status: isPast ? "expired" : "active",
        reminder_sent_days: [], // reset reminders
      });
      toast.success(`Access ${isPast ? "reduced" : "updated"} to ${new Date(newExpiry).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`);
      onExtended();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update access.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg text-ink mb-1">Extend Access</h3>
        <p className="text-xs text-slate_mist mb-4">
          Student: <strong>{enrollment.user_name}</strong> — {enrollment.course_title}
          {enrollment.expiry_date && (
            <span className="block mt-0.5">Current expiry: {new Date(enrollment.expiry_date).toLocaleDateString("en-AU")}</span>
          )}
        </p>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="mb-3"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">+ 30 Days</SelectItem>
            <SelectItem value="60">+ 60 Days</SelectItem>
            <SelectItem value="90">+ 90 Days</SelectItem>
            <SelectItem value="180">+ 180 Days</SelectItem>
            <SelectItem value="365">+ 365 Days</SelectItem>
            <SelectItem value="-7">− 7 Days (reduce)</SelectItem>
            <SelectItem value="-30">− 30 Days (reduce)</SelectItem>
            <SelectItem value="-60">− 60 Days (reduce)</SelectItem>
            <SelectItem value="custom">Custom…</SelectItem>
          </SelectContent>
        </Select>
        {days === "custom" && (
          <Input type="number" value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="Days (negative to reduce)…" className="mb-3 h-9 text-sm" />
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={extend} disabled={saving} className="flex-1 bg-harvest text-white">
            {saving ? "Saving…" : "Extend Access"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminEnrollmentExpiry() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [extendModal, setExtendModal] = useState(null);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.CourseEnrollment.list("-created_date", 500);
      setEnrollments(all);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runReminders = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("courseExpiryReminders", {});
      const data = res.data || {};
      toast.success(`Done: ${data.reminders_sent || 0} reminders sent, ${data.expired_count || 0} courses expired.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to run expiry reminders.");
    } finally {
      setRunning(false);
    }
  };

  const bulkExtend = async (addDays) => {
    if (selected.size === 0) { toast.error("Select enrollments first"); return; }
    let count = 0;
    for (const id of selected) {
      const enr = enrollments.find(e => e.id === id);
      if (!enr) continue;
      const base = (enr.status === "expired" || !enr.expiry_date) ? new Date() : new Date(enr.expiry_date);
      base.setDate(base.getDate() + addDays);
      await base44.entities.CourseEnrollment.update(id, {
        expiry_date: base.toISOString().split("T")[0],
        status: "active",
        reminder_sent_days: [],
      });
      count++;
    }
    toast.success(`Extended access for ${count} students by ${addDays} days.`);
    setSelected(new Set());
    load();
  };

  // Stats
  const withExpiry = enrollments.filter(e => e.expiry_date);
  const expiredCount  = withExpiry.filter(e => daysLeft(e.expiry_date) < 0).length;
  const within7       = withExpiry.filter(e => { const d = daysLeft(e.expiry_date); return d >= 0 && d <= 7; }).length;
  const within15      = withExpiry.filter(e => { const d = daysLeft(e.expiry_date); return d >= 0 && d <= 15; }).length;
  const within30      = withExpiry.filter(e => { const d = daysLeft(e.expiry_date); return d >= 0 && d <= 30; }).length;
  const activeCount   = enrollments.filter(e => e.status === "active").length;

  const filtered = enrollments.filter(e => {
    const status = getExpiryStatus(e);
    const matchFilter =
      filter === "all" ? true :
      filter === "expiring" ? (status === "expiring" || status === "critical") :
      filter === "expired" ? status === "expired" :
      filter === "active" ? (status === "active" || status === "unlimited") :
      filter === "critical" ? status === "critical" : true;
    const matchSearch = !search ||
      e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      e.course_title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Course Access & Expiry</h2>
          <p className="text-sm text-slate_mist">Monitor student access durations and send reminders.</p>
        </div>
        <Button onClick={runReminders} disabled={running} variant="outline" className="gap-2 text-xs h-9">
          <RefreshCw className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
          {running ? "Running…" : "Run Reminders Now"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active Students", value: activeCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Expiring ≤ 30d", value: within30, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Expiring ≤ 15d", value: within15, icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
          { label: "Expiring ≤ 7d", value: within7, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          { label: "Expired", value: expiredCount, icon: XCircle, color: "text-slate-600 bg-slate-100" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-2xl font-display font-bold text-ink">{s.value}</span>
            </div>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-harvest/10 border border-harvest/30 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-ink">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            {[30, 60, 90].map(d => (
              <Button key={d} size="sm" onClick={() => bulkExtend(d)} className="bg-harvest text-white text-xs h-7 gap-1">
                <Plus className="w-3 h-3" /> +{d}d
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())} className="text-xs h-7">Clear</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "expiring", label: "Expiring Soon" },
            { id: "critical", label: "< 7 Days" },
            { id: "expired", label: "Expired" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.id ? "bg-white shadow text-ink" : "text-slate_mist hover:text-ink"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student or course…" className="w-52 h-8 text-xs" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate_mist text-sm">No enrollments match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? new Set(filtered.map(f => f.id)) : new Set())}
                      className="accent-harvest" />
                  </th>
                  {["Student", "Course", "Enrolled", "Expiry Date", "Days Left", "Progress", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((enr, i) => {
                  const status = getExpiryStatus(enr);
                  const cfg = STATUS_CONFIG[status];
                  const d = enr.expiry_date ? daysLeft(enr.expiry_date) : null;
                  return (
                    <tr key={enr.id} className="border-b border-border/20 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(enr.id)}
                          onChange={e => {
                            const s = new Set(selected);
                            e.target.checked ? s.add(enr.id) : s.delete(enr.id);
                            setSelected(s);
                          }}
                          className="accent-harvest" />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-ink">{enr.user_name || "—"}</p>
                          <p className="text-[10px] text-slate_mist">{enr.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink font-medium truncate max-w-[160px]">{enr.course_title}</td>
                      <td className="px-4 py-3 text-xs text-slate_mist">
                        {enr.created_date ? new Date(enr.created_date).toLocaleDateString("en-AU") : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-ink">
                        {enr.expiry_date
                          ? new Date(enr.expiry_date).toLocaleDateString("en-AU")
                          : <span className="text-blue-500 text-[10px]">Unlimited</span>}
                      </td>
                      <td className="px-4 py-3">
                        {d === null ? (
                          <span className="text-[10px] text-blue-500">∞</span>
                        ) : d < 0 ? (
                          <span className="text-xs font-bold text-red-500">Expired {Math.abs(d)}d ago</span>
                        ) : (
                          <span className={`text-xs font-bold ${d <= 7 ? "text-red-600" : d <= 30 ? "text-amber-600" : "text-emerald-600"}`}>
                            {d} day{d !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${enr.progress_percent || 0}%` }} />
                          </div>
                          <span className="text-[10px] text-slate_mist">{enr.progress_percent || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setExtendModal(enr)}
                          className="text-xs h-7 gap-1">
                          <Plus className="w-3 h-3" /> Extend
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {extendModal && (
        <ExtendModal
          enrollment={extendModal}
          onClose={() => setExtendModal(null)}
          onExtended={load}
        />
      )}
    </div>
  );
}