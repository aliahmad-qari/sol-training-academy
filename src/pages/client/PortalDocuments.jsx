import React, { useState, useEffect, useCallback } from "react";
import { FolderOpen, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import ComplianceDocumentUpload from "@/components/client/ComplianceDocumentUpload";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending: { label: "Pending Review", icon: Clock, badge: "bg-slate-100 text-slate-600 border-slate-200" },
  under_review: { label: "Under Review", icon: RefreshCw, badge: "bg-blue-50 text-blue-700 border-blue-200" },
  verified: { label: "Verified", icon: CheckCircle2, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle, badge: "bg-red-50 text-red-700 border-red-200" },
  resubmit_required: { label: "Resubmit Required", icon: AlertTriangle, badge: "bg-amber-50 text-amber-700 border-amber-200" },
};

const DOC_TYPE_LABELS = {
  id_proof: "ID Proof", qualification: "Qualification", resume: "Resume / CV",
  police_check: "Police Check", working_with_children: "Working With Children",
  ndis_worker_screening: "NDIS Worker Screening", insurance: "Insurance",
  vaccination: "Vaccination", other: "Other",
};

export default function PortalDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDocuments = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    base44.entities.StudentDocument.filter({ user_id: user.id }, "-created_date")
      .then(data => setDocuments(data || []))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const query = search.trim().toLowerCase();
  const filteredDocuments = query
    ? documents.filter(doc => {
        const statusLabel = STATUS_CONFIG[doc.status]?.label || doc.status;
        const typeLabel = DOC_TYPE_LABELS[doc.document_type] || doc.document_type;
        return [doc.document_title, doc.file_name, doc.file_type, typeLabel, statusLabel, doc.admin_message]
          .some(value => String(value || "").toLowerCase().includes(query));
      })
    : documents;

  const pendingCount = documents.filter(d => d.status === "pending" || d.status === "under_review").length;
  const verifiedCount = documents.filter(d => d.status === "verified").length;
  const actionCount = documents.filter(d => d.status === "rejected" || d.status === "resubmit_required").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Compliance Documents</h1>
        <p className="text-slate-500 text-sm">Upload your compliance documents securely. Our team will review and verify each submission.</p>
      </div>

      {documents.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{documents.length} submitted</span>
          {verifiedCount > 0 && <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{verifiedCount} verified</span>}
          {pendingCount > 0 && <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{pendingCount} in review</span>}
          {actionCount > 0 && <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">{actionCount} need action</span>}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-sm text-ink mb-3 uppercase tracking-wide">Submit New Document</h2>
          <ComplianceDocumentUpload onUploadSuccess={loadDocuments} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="font-semibold text-sm text-ink uppercase tracking-wide">Submitted Documents</h2>
            <button onClick={loadDocuments} className="text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {!loading && documents.length > 0 && (
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-harvest/25 focus:border-harvest"
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}</div>
          ) : documents.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No documents submitted yet.</p>
              <p className="text-xs text-slate-400 mt-1">Upload your first compliance document on the left.</p>
            </Card>
          ) : filteredDocuments.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No documents match your search.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(doc => {
                const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Card key={doc.id} className="p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-600">{doc.file_type || "FILE"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{doc.document_title || doc.file_name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {DOC_TYPE_LABELS[doc.document_type] || doc.document_type} - {doc.created_date ? format(new Date(doc.created_date), "dd MMM yyyy") : ""}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>
                            <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                          </span>
                        </div>

                        {doc.admin_message && (
                          <div className={`mt-2 text-xs rounded-lg px-3 py-2 border ${
                            doc.status === "verified" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                            doc.status === "rejected" || doc.status === "resubmit_required" ? "bg-red-50 border-red-100 text-red-800" :
                            "bg-slate-50 border-slate-100 text-slate-700"
                          }`}>
                            <span className="font-semibold">Reviewer note: </span>{doc.admin_message}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-harvest hover:underline flex items-center gap-1 font-medium">
                            <Eye className="w-3 h-3" /> View file
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
