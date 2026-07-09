import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Send, Clock, CheckCircle, XCircle, Loader2,
  ChevronDown, ChevronUp, MessageSquare, Inbox, BookOpen,
  Video, FileText, Star, Layers, Sparkles, Paperclip, X, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const TYPE_CONFIG = {
  new_course:       { label: "New Course",        icon: BookOpen,  color: "bg-blue-100 text-blue-700 border-blue-200" },
  new_video:        { label: "New Video",          icon: Video,     color: "bg-purple-100 text-purple-700 border-purple-200" },
  course_update:    { label: "Course Update",      icon: Layers,    color: "bg-amber-100 text-amber-700 border-amber-200" },
  resource_request: { label: "Resource Request",   icon: FileText,  color: "bg-teal-100 text-teal-700 border-teal-200" },
  feature_request:  { label: "Feature Request",    icon: Sparkles,  color: "bg-pink-100 text-pink-700 border-pink-200" },
  other:            { label: "Other",              icon: MessageSquare, color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const STATUS_CONFIG = {
  pending:      { label: "Pending",      color: "bg-slate-100 text-slate-600",   icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700",     icon: Clock },
  approved:     { label: "Approved",     color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  in_progress:  { label: "In Progress",  color: "bg-amber-100 text-amber-700",   icon: Clock },
  completed:    { label: "Completed",    color: "bg-green-100 text-green-700",   icon: CheckCircle },
  rejected:     { label: "Rejected",     color: "bg-red-100 text-red-700",       icon: XCircle },
};

function NewRequestForm({ user, onCreated, onCancel }) {
  const [form, setForm] = useState({ type: "new_course", subject: "", description: "", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null); // { file, name, url }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachment({ file, name: file.name, url: file_url });
      toast.success("File attached successfully.");
    } catch (err) {
      console.error("File upload failed:", err);
      toast.error("Couldn't upload the file. Please try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill in subject and description.");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.StudentRequest.create({
        ...form,
        ...(attachment ? { attachment_url: attachment.url, attachment_name: attachment.name } : {}),
      });
      toast.success("Request submitted! Admin will review it shortly.");
      onCreated();
    } catch (err) {
      console.error("Failed to submit request:", err);
      toast.error(err?.response?.data?.message || "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 mb-6">
      <h3 className="font-display font-bold text-ink text-base mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-harvest" /> New Request
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Request Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  form.type === key
                    ? "border-harvest bg-harvest/10 text-harvest"
                    : "border-border/50 text-slate-500 hover:border-harvest/40 hover:text-harvest"
                }`}>
                <cfg.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject *</label>
          <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. Request for NDIS Level 3 Advanced Course" className="h-10" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Description *</label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe what you need, why it would be helpful, any specific topics or requirements…"
            rows={4} className="resize-none text-sm" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  form.priority === p
                    ? p === "high" ? "bg-red-100 text-red-700 border-red-300"
                    : p === "medium" ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                    : "border-border/50 text-slate-400 hover:border-slate-300"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* File Attachment */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Attachment (optional)</label>
          {attachment ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-harvest/40 bg-harvest/5">
              <FileText className="w-4 h-4 text-harvest flex-shrink-0" />
              <span className="text-xs text-ink font-medium flex-1 truncate">{attachment.name}</span>
              <button onClick={removeAttachment} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-border/60 text-xs font-medium text-slate-500 hover:border-harvest/50 hover:text-harvest transition-all disabled:opacity-50">
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                : <><Paperclip className="w-4 h-4" /> Attach a file (PDF, DOC, image — max 10MB)</>}
            </button>
          )}
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
            onChange={handleFileChange} />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={submit} disabled={submitting || uploading} className="flex-1 bg-harvest text-white hover:bg-harvest/90 gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Request</>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function RequestCard({ req }) {
  const [open, setOpen] = useState(false);
  const typeCfg = TYPE_CONFIG[req.type] || TYPE_CONFIG.other;
  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

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
            {typeCfg.label} · {new Date(req.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
            <StatusIcon className="w-3 h-3" /> {statusCfg.label}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40">
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Your Request</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{req.description}</p>
              </div>
              {req.attachment_url && (
                <a href={req.attachment_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px]">{req.attachment_name || "View Attachment"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </a>
              )}
              {req.admin_response && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Admin Response
                    {req.admin_name && <span className="ml-1 font-normal text-emerald-600">from {req.admin_name}</span>}
                  </p>
                  <p className="text-sm text-emerald-800 whitespace-pre-line">{req.admin_response}</p>
                </div>
              )}
              {!req.admin_response && req.status === "pending" && (
                <p className="text-xs text-slate-400 italic">Awaiting admin review…</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.StudentRequest.filter({ student_id: user.id }, "-created_date");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setRequests([]);
      toast.error("Couldn't load your requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const handleCreated = () => {
    setShowForm(false);
    load();
  };

  const pending   = requests.filter(r => ["pending", "under_review", "in_progress"].includes(r.status));
  const resolved  = requests.filter(r => ["completed", "approved", "rejected"].includes(r.status));

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-ink text-lg">My Requests</h2>
          <p className="text-xs text-slate_mist mt-0.5">Submit requests for new courses, videos, updates, or anything you need</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-harvest text-white hover:bg-harvest/90 gap-2">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        )}
      </div>

      {/* New request form */}
      {showForm && <NewRequestForm user={user} onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center shadow-sm">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500 mb-1">No requests yet</p>
          <p className="text-xs text-slate-400 mb-4">Have an idea or need something new? Submit your first request!</p>
          <Button onClick={() => setShowForm(true)} className="bg-harvest text-white gap-2">
            <Plus className="w-4 h-4" /> Make a Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active ({pending.length})</p>
              <div className="space-y-2">
                {pending.map(r => <RequestCard key={r.id} req={r} />)}
              </div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolved ({resolved.length})</p>
              <div className="space-y-2">
                {resolved.map(r => <RequestCard key={r.id} req={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}