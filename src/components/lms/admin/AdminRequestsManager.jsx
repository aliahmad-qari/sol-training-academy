import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Inbox, Loader2, ChevronDown, ChevronUp,
  MessageSquare, BookOpen, Video, FileText, Sparkles, Layers, RefreshCw, Send, Search
} from "lucide-react";

const TYPE_CONFIG = {
  new_course:       { label: "New Course",        icon: BookOpen,  color: "bg-blue-100 text-blue-700 border-blue-200" },
  new_video:        { label: "New Video",          icon: Video,     color: "bg-purple-100 text-purple-700 border-purple-200" },
  course_update:    { label: "Course Update",      icon: Layers,    color: "bg-amber-100 text-amber-700 border-amber-200" },
  resource_request: { label: "Resource Request",   icon: FileText,  color: "bg-teal-100 text-teal-700 border-teal-200" },
  feature_request:  { label: "Feature Request",    icon: Sparkles,  color: "bg-pink-100 text-pink-700 border-pink-200" },
  other:            { label: "Other",              icon: MessageSquare, color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const STATUS_OPTIONS = [
  { value: "pending",      label: "Pending",       color: "bg-slate-100 text-slate-600" },
  { value: "under_review", label: "Under Review",  color: "bg-blue-100 text-blue-700" },
  { value: "approved",     label: "Approved",      color: "bg-emerald-100 text-emerald-700" },
  { value: "in_progress",  label: "In Progress",   color: "bg-amber-100 text-amber-700" },
  { value: "completed",    label: "Completed",     color: "bg-green-100 text-green-700" },
  { value: "rejected",     label: "Rejected",      color: "bg-red-100 text-red-700" },
];

function RequestRow({ req, admin, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(req.admin_response || "");
  const [status, setStatus] = useState(req.status);
  const [saving, setSaving] = useState(false);

  const typeCfg = TYPE_CONFIG[req.type] || TYPE_CONFIG.other;
  const TypeIcon = typeCfg.icon;
  const statusCfg = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const save = async () => {
    setSaving(true);
    await base44.entities.StudentRequest.update(req.id, {
      status,
      admin_response: response,
      admin_id: admin?.id,
      admin_name: admin?.full_name || admin?.email,
      responded_date: new Date().toISOString(),
    });
    toast.success("Response saved!");
    setSaving(false);
    onUpdated();
  };

  return (
    <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeCfg.color}`}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink text-sm truncate">{req.subject}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-600">{req.student_name || req.student_email}</span>
            {" · "}{typeCfg.label}
            {" · "}{new Date(req.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize
            ${req.priority === "high" ? "border-red-300 bg-red-50 text-red-600" :
              req.priority === "medium" ? "border-amber-300 bg-amber-50 text-amber-600" :
              "border-slate-200 bg-slate-50 text-slate-500"}`}>
            {req.priority}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40">
            <div className="p-5 space-y-4">
              {/* Student info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Student Request</p>
                <p className="text-xs text-slate-500 mb-1">
                  From: <span className="font-semibold text-slate-700">{req.student_name}</span>
                  {req.student_email && <span className="ml-1 text-slate-400">({req.student_email})</span>}
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line mt-2">{req.description}</p>
              </div>

              {/* Admin response */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Your Response</label>
                <Textarea value={response} onChange={e => setResponse(e.target.value)}
                  placeholder="Write your response to the student…"
                  rows={3} className="resize-none text-sm" />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => setStatus(s.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        status === s.value ? `${s.color} border-current` : "border-border/50 text-slate-400 hover:border-slate-300"
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={save} disabled={saving} className="bg-harvest text-white hover:bg-harvest/90 gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Send className="w-4 h-4" /> Save Response</>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [reqs, me] = await Promise.all([
      base44.entities.StudentRequest.list("-created_date", 200),
      base44.auth.me(),
    ]);
    setRequests(reqs);
    setAdmin(me);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = {
    all:     requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    active:  requests.filter(r => ["under_review", "in_progress"].includes(r.status)).length,
    done:    requests.filter(r => ["completed", "approved", "rejected"].includes(r.status)).length,
  };

  const byStatus = filter === "all" ? requests
    : filter === "pending" ? requests.filter(r => r.status === "pending")
    : filter === "active"  ? requests.filter(r => ["under_review", "in_progress"].includes(r.status))
    : requests.filter(r => ["completed", "approved", "rejected"].includes(r.status));

  const filtered = byStatus.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.subject || "").toLowerCase().includes(q) ||
      (r.student_name || "").toLowerCase().includes(q) ||
      (r.student_email || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q);
  });

  const FILTERS = [
    { key: "all",     label: "All" },
    { key: "pending", label: "Pending" },
    { key: "active",  label: "Active" },
    { key: "done",    label: "Resolved" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-ink text-lg">Student Requests</h2>
          <p className="text-xs text-slate_mist">Review and respond to student course/content requests</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",   value: counts.all,     color: "text-slate-700 bg-slate-50 border-slate-200" },
          { label: "Pending", value: counts.pending,  color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Active",  value: counts.active,   color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Resolved",value: counts.done,     color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, student or email…" className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                filter === f.key ? "bg-harvest text-white border-harvest" : "border-border/50 text-slate-500 hover:border-harvest/40"
              }`}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center shadow-sm">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No requests in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <RequestRow key={r.id} req={r} admin={admin} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}