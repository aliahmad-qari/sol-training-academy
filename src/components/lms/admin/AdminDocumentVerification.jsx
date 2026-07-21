import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { runAdminTool } from "@/api/aiClient";
import { motion } from "framer-motion";
import {
  FileText, CheckCircle, XCircle, Clock, Eye, AlertTriangle,
  RefreshCw, Sparkles, Send, ChevronDown, ChevronUp, Search, RotateCcw, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DOC_TYPE_LABELS = {
  id_proof:               "ID Proof",
  qualification:          "Qualification / Certificate",
  resume:                 "Resume / CV",
  police_check:           "Police Check",
  working_with_children:  "Working With Children Check",
  ndis_worker_screening:  "NDIS Worker Screening",
  insurance:              "Insurance Certificate",
  vaccination:            "Vaccination Record",
  other:                  "Other",
};

const getRecordId = (record) => record?._id || record?.id;

const STATUS_CONFIG = {
  pending:           { label: "Pending",           color: "text-amber-600 bg-amber-50 border-amber-200",   icon: Clock },
  under_review:      { label: "Under Review",       color: "text-blue-600 bg-blue-50 border-blue-200",     icon: Eye },
  verified:          { label: "Verified",           color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  rejected:          { label: "Rejected",           color: "text-red-600 bg-red-50 border-red-200",        icon: XCircle },
  resubmit_required: { label: "Resubmit Required", color: "text-orange-600 bg-orange-50 border-orange-200", icon: AlertTriangle },
};

function DocumentRow({ doc, onUpdate }) {
  const [expanded, setExpanded]       = useState(false);
  const [status, setStatus]           = useState(doc.status);
  const [message, setMessage]         = useState(doc.admin_message || "");
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [quickLoading, setQuickLoading] = useState(null); // "verified" | "rejected" | "resubmit_required"

  const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  // ── Quick-action: one-click verify / reject / resubmit ──────────────────
  const quickAction = async (newStatus) => {
    const documentId = getRecordId(doc);
    if (!documentId) {
      toast.error("Cannot update document: missing document ID.");
      return;
    }
    setQuickLoading(newStatus);
    try {
      const defaultMessages = {
        verified:          `Your ${DOC_TYPE_LABELS[doc.document_type] || "document"} has been reviewed and verified. It is now on record with SOL Training Academy. No further action is required from you at this time.`,
        rejected:          `Unfortunately your document could not be verified. Please ensure you submit a clear, valid copy of the required document and reupload it through the student portal.`,
        resubmit_required: `Your document requires some changes before it can be verified. Please review the document requirements and resubmit an updated version through your student portal.`,
      };
      const autoMsg = defaultMessages[newStatus] || "";
      await apiClient.patch(`/student-documents/${documentId}`, {
        status: newStatus,
        admin_message: autoMsg,
        reviewed_date: new Date().toISOString(),
        ai_generated_message: false,
      });
      toast.success(`Document marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}. Student will be notified.`);
      setExpanded(false);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update the document.");
    } finally {
      setQuickLoading(null);
    }
  };

  const generateAIMessage = async () => {
    setGenerating(true);
    try {
      // Backend owns the prompt (ADMIN_TOOLS.docmessage); returns the message text.
      const result = await runAdminTool("docmessage", {
        studentName: doc.user_name,
        docType: DOC_TYPE_LABELS[doc.document_type] || doc.document_type,
        docTitle: doc.document_title,
        fileName: doc.file_name,
        notes: doc.notes || "None",
        decision: status,
      });
      setMessage(typeof result === "string" ? result : result?.text || "");
      toast.success("AI message generated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Couldn't generate the message. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const documentId = getRecordId(doc);
    if (!documentId) {
      toast.error("Cannot update document: missing document ID.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch(`/student-documents/${documentId}`, {
        status,
        admin_message: message,
        reviewed_date: new Date().toISOString(),
        ai_generated_message: false,
      });
      toast.success("Document updated. Student will be notified.");
      setExpanded(false);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update the document.");
    } finally {
      setSaving(false);
    }
  };

  const isActioning = quickLoading !== null;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-slate_mist" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="font-display font-semibold text-ink text-sm">{doc.document_title}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
          </div>
          <p className="text-xs text-slate_mist">
            <strong>{doc.user_name}</strong> · {DOC_TYPE_LABELS[doc.document_type]} · {doc.file_name}
          </p>
          <p className="text-[10px] text-slate_mist/60 mt-0.5">
            Uploaded {new Date(doc.created_date).toLocaleDateString("en-AU")}
            {doc.reviewed_date && ` · Reviewed ${new Date(doc.reviewed_date).toLocaleDateString("en-AU")}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1 text-xs h-8 px-2.5">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
          </a>

          {/* Quick action buttons — only show for non-verified docs */}
          {doc.status !== "verified" && (
            <Button size="sm" onClick={() => quickAction("verified")} disabled={isActioning}
              className="gap-1 text-xs h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              {quickLoading === "verified"
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <CheckCircle className="w-3.5 h-3.5" />}
              Verify
            </Button>
          )}
          {doc.status !== "rejected" && (
            <Button size="sm" onClick={() => quickAction("rejected")} disabled={isActioning}
              className="gap-1 text-xs h-8 px-2.5 bg-red-500 hover:bg-red-600 text-white">
              {quickLoading === "rejected"
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <XCircle className="w-3.5 h-3.5" />}
              Reject
            </Button>
          )}
          {doc.status !== "resubmit_required" && (
            <Button size="sm" variant="outline" onClick={() => quickAction("resubmit_required")} disabled={isActioning}
              className="gap-1 text-xs h-8 px-2.5 text-orange-600 border-orange-200 hover:bg-orange-50">
              {quickLoading === "resubmit_required"
                ? <div className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                : <RotateCcw className="w-3.5 h-3.5" />}
              Resubmit
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}
            className="gap-1 text-xs h-8 px-2 text-slate_mist">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-border/30 p-5 space-y-4 bg-slate-50">
          {doc.notes && (
            <div className="bg-white rounded-xl border border-border/40 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate_mist mb-1">Student Notes</p>
              <p className="text-sm text-ink">{doc.notes}</p>
            </div>
          )}

          {doc.admin_message && (
            <div className="bg-white rounded-xl border border-border/40 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate_mist mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Last Message Sent to Student
              </p>
              <p className="text-sm text-ink">{doc.admin_message}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Change Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([val, c]) => (
                  <SelectItem key={val} value={val}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Custom Message to Student</label>
              <Button size="sm" variant="outline" onClick={generateAIMessage} disabled={generating}
                className="gap-1.5 text-xs h-7 border-harvest/40 text-harvest hover:bg-harvest/5">
                {generating
                  ? <><div className="w-3 h-3 border-2 border-harvest/30 border-t-harvest rounded-full animate-spin" /> Generating…</>
                  : <><Sparkles className="w-3 h-3" /> AI Draft Message</>}
              </Button>
            </div>
            <Textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Type a custom message or use AI to draft one..." rows={4} className="resize-none bg-white" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setExpanded(false)} className="flex-1">Close</Button>
            <Button onClick={handleSave} disabled={saving || !status} className="flex-1 bg-harvest text-white gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Send className="w-4 h-4" /> Save & Email Student</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDocumentVerification() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/student-documents?limit=200");
      setDocuments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load student documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = documents.filter(d => {
    const matchSearch = !search ||
      d.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.document_title?.toLowerCase().includes(search.toLowerCase()) ||
      d.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:              documents.length,
    pending:          documents.filter(d => d.status === "pending").length,
    under_review:     documents.filter(d => d.status === "under_review").length,
    verified:         documents.filter(d => d.status === "verified").length,
    rejected:         documents.filter(d => d.status === "rejected").length,
    resubmit_required:documents.filter(d => d.status === "resubmit_required").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { key: "all",               label: "Total",           color: "text-ink bg-slate-50" },
          { key: "pending",           label: "Pending",         color: "text-amber-600 bg-amber-50" },
          { key: "under_review",      label: "Under Review",    color: "text-blue-600 bg-blue-50" },
          { key: "verified",          label: "Verified",        color: "text-emerald-600 bg-emerald-50" },
          { key: "rejected",          label: "Rejected",        color: "text-red-600 bg-red-50" },
          { key: "resubmit_required", label: "Resubmit Needed", color: "text-orange-600 bg-orange-50" },
        ].map(s => (
          <button key={s.key} onClick={() => setFilterStatus(s.key)}
            className={`rounded-xl border p-4 text-center transition-all ${
              filterStatus === s.key ? "border-harvest shadow-sm" : "border-border/50 hover:border-harvest/40"
            } bg-white`}>
            <p className={`font-display font-bold text-2xl ${s.color.split(" ")[0]}`}>{counts[s.key]}</p>
            <p className="text-[10px] text-slate_mist mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate_mist" />
          <input
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-white text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Search by student name, email or document..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 text-xs h-9">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-14 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-display font-semibold text-ink mb-1">No documents found</p>
          <p className="text-sm text-slate_mist">No student documents match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc, i) => (
            <motion.div key={getRecordId(doc) || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <DocumentRow doc={doc} onUpdate={load} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}