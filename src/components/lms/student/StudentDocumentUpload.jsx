import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/api/apiClient";
import { uploadFile } from "@/api/uploadClient";
import { motion } from "framer-motion";
import {
  Upload, CheckCircle, Clock, XCircle, AlertTriangle,
  RefreshCw, Eye, Trash2, Plus, X, FolderOpen, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DOC_TYPES = [
  { value: "id_proof",               label: "ID Proof (Passport / Driver's Licence)" },
  { value: "qualification",          label: "Qualification / Certificate" },
  { value: "resume",                 label: "Resume / CV" },
  { value: "police_check",           label: "Police Check" },
  { value: "working_with_children",  label: "Working With Children Check" },
  { value: "ndis_worker_screening",  label: "NDIS Worker Screening" },
  { value: "insurance",              label: "Insurance Certificate" },
  { value: "vaccination",            label: "Vaccination Record" },
  { value: "other",                  label: "Other Document" },
];

const STATUS_CONFIG = {
  pending:           { label: "Pending Review",    icon: Clock,          color: "text-amber-600 bg-amber-50 border-amber-200",       bar: "bg-amber-400",   barWidth: "w-1/4",  hint: "Your document has been submitted and is waiting for an admin to review it." },
  under_review:      { label: "Under Review",      icon: Eye,            color: "text-blue-600 bg-blue-50 border-blue-200",          bar: "bg-blue-400",    barWidth: "w-2/4",  hint: "An admin is currently reviewing your document." },
  verified:          { label: "Verified ",         icon: CheckCircle,    color: "text-emerald-600 bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", barWidth: "w-full", hint: "Your document has been verified and is on record. No action needed." },
  rejected:          { label: "Rejected",           icon: XCircle,        color: "text-red-600 bg-red-50 border-red-200",             bar: "bg-red-400",     barWidth: "w-full", hint: "Your document was not accepted. Please see the admin message below and resubmit." },
  resubmit_required: { label: "Resubmit Required", icon: AlertTriangle,  color: "text-orange-600 bg-orange-50 border-orange-200",    bar: "bg-orange-400",  barWidth: "w-full", hint: "Admin has requested changes. Please resubmit an updated version." },
};

function UploadModal({ onClose, onUploaded, userId, user }) {
  const [docType, setDocType]       = useState("");
  const [docTitle, setDocTitle]     = useState("");
  const [notes, setNotes]           = useState("");
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef();

  const handleSubmit = async () => {
    if (!docType || !file) {
      toast.error("Please select a document type and file.");
      return;
    }

    setUploading(true);
    try {
      const upload = await uploadFile({ file, kind: "document" });
      const ext = file.name.split(".").pop().toLowerCase();

      await apiClient.post("/student-documents", {
        document_type: docType,
        document_title: docTitle || DOC_TYPES.find(d => d.value === docType)?.label || docType,
        file_url: upload.file_url,
        file_name: upload.file_name || file.name,
        file_type: upload.format || ext,
        file_public_id: upload.publicId,
        notes,
      });

      toast.success("Document uploaded successfully!");
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-2xl flex flex-col max-h-[95dvh] rounded-t-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h3 className="font-display font-bold text-lg text-ink">Upload Document</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate_mist" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Document Type *</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue placeholder="Select document type..." /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Document Title (Optional)</Label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. John Smith Police Check 2024"
              value={docTitle} onChange={e => setDocTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Upload File *</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-harvest/50 hover:bg-harvest/5 transition-all min-h-[100px]"
            >
              <Upload className="w-7 h-7 text-slate-400 mb-2" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink break-all">{file.name}</p>
                  <p className="text-xs text-slate_mist mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB - Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-slate_mist">Click to browse files</p>
                  <p className="text-xs text-slate_mist/60 mt-1">PDF, DOCX, JPG, PNG accepted</p>
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Notes (Optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any notes for the admin reviewer..." rows={2} className="resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading || !docType || !file}
            className="flex-1 bg-harvest text-white gap-2">
            {uploading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
              : <><Upload className="w-4 h-4" /> Submit Document</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudentDocumentUpload({ user }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.get("/student-documents/mine");
      const docs = Array.isArray(res.data?.data) ? res.data.data : [];
      setDocuments(docs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (doc) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await apiClient.delete(`/student-documents/${doc.id}`);
      toast.success("Document deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete document.");
    }
  };

  const query = search.trim().toLowerCase();
  const filteredDocuments = query
    ? documents.filter(doc => {
        const statusLabel = STATUS_CONFIG[doc.status]?.label || doc.status;
        const typeLabel = DOC_TYPES.find(d => d.value === doc.document_type)?.label || doc.document_type;
        return [doc.document_title, doc.file_name, typeLabel, statusLabel, doc.admin_message, doc.notes]
          .some(value => String(value || "").toLowerCase().includes(query));
      })
    : documents;

  const stats = [
    { label: "Total Uploaded", value: documents.length,                                          color: "text-ink" },
    { label: "Verified",        value: documents.filter(d => d.status === "verified").length,     color: "text-emerald-600" },
    { label: "Pending",         value: documents.filter(d => d.status === "pending").length,      color: "text-amber-600" },
    { label: "Action Needed",   value: documents.filter(d => ["rejected","resubmit_required"].includes(d.status)).length, color: "text-red-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-ink">My Documents</h2>
          <p className="text-sm text-slate_mist mt-0.5">Upload and track your compliance documents for admin verification.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-harvest text-white gap-2 w-full sm:w-auto flex-shrink-0">
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border/50 p-3 sm:p-4 shadow-sm text-center">
            <p className={`font-display font-bold text-xl sm:text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate_mist mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {documents.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate_mist" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-11 rounded-xl border border-border/60 bg-white pl-10 pr-3 text-sm text-ink shadow-sm outline-none transition focus:border-harvest focus:ring-2 focus:ring-harvest/20"
          />
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-14 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-display font-semibold text-ink mb-1">No documents uploaded yet</p>
          <p className="text-sm text-slate_mist mb-5">Upload your compliance documents for admin verification.</p>
          <Button onClick={() => setShowModal(true)} className="bg-harvest text-white gap-2">
            <Upload className="w-4 h-4" /> Upload Your First Document
          </Button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-14 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-display font-semibold text-ink mb-1">No documents match your search</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc, i) => {
            const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const isActionable = ["rejected", "resubmit_required"].includes(doc.status);
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  doc.status === "verified" ? "border-emerald-200" :
                  isActionable ? "border-red-200" :
                  "border-border/50"
                }`}>
                {/* Status bar strip */}
                <div className="h-1 w-full bg-slate-100">
                  <div className={`h-1 rounded-r-full transition-all duration-700 ${cfg.bar} ${cfg.barWidth}`} />
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      doc.status === "verified" ? "bg-emerald-100" :
                      isActionable ? "bg-red-50" :
                      "bg-slate-100"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        doc.status === "verified" ? "text-emerald-600" :
                        isActionable ? "text-red-500" :
                        "text-slate_mist"
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-display font-semibold text-ink text-sm">{doc.document_title}</h4>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate_mist">
                        {DOC_TYPES.find(d => d.value === doc.document_type)?.label} - {doc.file_name}
                      </p>
                      <p className="text-[10px] text-slate_mist/60 mt-0.5">
                        Uploaded {new Date(doc.created_date).toLocaleDateString("en-AU")}
                        {doc.reviewed_date && ` - Reviewed ${new Date(doc.reviewed_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>

                      {/* Status hint */}
                      <p className={`text-xs mt-1.5 font-medium ${
                        doc.status === "verified" ? "text-emerald-600" :
                        isActionable ? "text-red-600" :
                        "text-slate_mist"
                      }`}>{cfg.hint}</p>

                      {/* Admin message */}
                      {doc.admin_message && (
                        <div className={`mt-3 rounded-xl px-4 py-3 border text-sm ${
                          doc.status === "verified" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : isActionable ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70 flex items-center gap-1">
                            {doc.ai_generated_message ? "AI AI-Assisted" : "Admin"} Message from Admin
                            {doc.admin_name && ` - ${doc.admin_name}`}
                          </p>
                          <p className="leading-relaxed">{doc.admin_message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </a>
                      {["pending", "rejected", "resubmit_required"].includes(doc.status) && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(doc)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Refresh */}
      {documents.length > 0 && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={load} className="gap-2 text-xs text-slate_mist">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </Button>
        </div>
      )}

      {showModal && (
        <UploadModal
          userId={user?.id} user={user}
          onClose={() => setShowModal(false)}
          onUploaded={load}
        />
      )}
    </div>
  );
}
