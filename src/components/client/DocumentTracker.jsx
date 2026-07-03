import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle2, AlertCircle, Download, Eye, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending_review: { label: "Pending Review", icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-200" },
  under_review: { label: "Under Review", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", icon: AlertCircle, color: "bg-red-50 text-red-700 border-red-200" },
  revision_needed: { label: "Revision Needed", icon: AlertCircle, color: "bg-orange-50 text-orange-700 border-orange-200" },
};

const CATEGORY_COLORS = {
  registration: "bg-blue-100 text-blue-800",
  policy: "bg-purple-100 text-purple-800",
  procedure: "bg-cyan-100 text-cyan-800",
  audit: "bg-green-100 text-green-800",
  compliance: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

export default function DocumentTracker({ enquiryId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!enquiryId) {
          setDocuments([]);
          setLoading(false);
          return;
        }
        const docs = await base44.entities.Document.filter({ enquiry_id: enquiryId });
        setDocuments(docs || []);
      } catch (error) {
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [enquiryId]);

  const filteredDocuments = documents.filter(doc => {
    if (filter === "all") return true;
    if (filter === "pending") return ["pending_review", "under_review", "revision_needed"].includes(doc.status);
    if (filter === "approved") return doc.status === "approved";
    if (filter === "rejected") return doc.status === "rejected";
    return true;
  });

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
  const Icon = getStatusConfig(filter === "all" ? "pending_review" : filter).icon;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No documents submitted yet</p>
        <p className="text-sm text-slate-400 mt-1">Upload your compliance documents using the submission area above</p>
      </Card>
    );
  }

  const pendingCount = documents.filter(d => ["pending_review", "under_review", "revision_needed"].includes(d.status)).length;
  const approvedCount = documents.filter(d => d.status === "approved").length;

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl font-bold text-ink">{documents.length}</p>
          <p className="text-xs text-slate-600 mt-1">Total Documents</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-600 mt-1">Pending Review</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
          <p className="text-xs text-slate-600 mt-1">Approved</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Documents" },
          { id: "pending", label: "Pending Review" },
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab.id
                ? "bg-harvest text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <Card className="p-8 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents in this category</p>
          </Card>
        ) : (
          filteredDocuments.map(doc => {
            const statusCfg = getStatusConfig(doc.status);
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={doc.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-ink truncate">{doc.file_name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {doc.document_category && (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[doc.document_category] || "bg-gray-100 text-gray-800"}`}>
                            {doc.document_category}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {doc.file_size && (
                          <span className="text-xs text-slate-500">{doc.file_size} MB</span>
                        )}
                      </div>
                      {doc.reviewer_notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 font-medium mb-1">Reviewer Notes:</p>
                          <p className="text-sm text-slate-700">{doc.reviewer_notes}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Uploaded {doc.created_date ? new Date(doc.created_date).toLocaleDateString("en-AU") : "—"}
                        {doc.reviewed_date && ` • Reviewed ${new Date(doc.reviewed_date).toLocaleDateString("en-AU")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}