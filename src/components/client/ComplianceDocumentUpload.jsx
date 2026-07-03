import React, { useState, useRef } from "react";
import { Upload, FileCheck, AlertCircle, Loader2, X, Eye, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];
const MAX_SIZE = 10 * 1024 * 1024;

const DOCUMENT_TYPES = [
  { value: "id_proof",               label: "ID Proof" },
  { value: "qualification",          label: "Qualification / Certificate" },
  { value: "resume",                 label: "Resume / CV" },
  { value: "police_check",           label: "Police Check" },
  { value: "working_with_children",  label: "Working With Children Check" },
  { value: "ndis_worker_screening",  label: "NDIS Worker Screening" },
  { value: "insurance",              label: "Insurance Document" },
  { value: "vaccination",            label: "Vaccination Record" },
  { value: "other",                  label: "Other" },
];

export default function ComplianceDocumentUpload({ onUploadSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [notes, setNotes] = useState("");

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Use PDF, Word, Excel, or image files.");
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File exceeds 10MB limit.");
      return false;
    }
    return true;
  };

  const pickFile = (files) => {
    const file = Array.from(files)[0];
    if (file && validateFile(file)) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    pickFile(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return toast.error("Please select a file.");
    if (!docType) return toast.error("Please select a document type.");

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

    await base44.entities.StudentDocument.create({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      document_type: docType,
      document_title: docTitle || selectedFile.name,
      file_url,
      file_name: selectedFile.name,
      file_type: selectedFile.name.split(".").pop().toUpperCase(),
      notes,
      status: "pending",
    });

    toast.success("Document submitted for review!");
    setSelectedFile(null);
    setDocType("");
    setDocTitle("");
    setNotes("");
    setUploading(false);
    if (onUploadSuccess) onUploadSuccess();
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging ? "border-harvest bg-harvest/5" :
          selectedFile ? "border-emerald-400 bg-emerald-50/50 cursor-default" :
          "border-slate-300 hover:border-harvest/60 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => pickFile(e.target.files)}
        />
        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-harvest/10 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-harvest" />
            </div>
            <div>
              <p className="font-semibold text-ink mb-1">Drop your file here or click to browse</p>
              <p className="text-xs text-slate-400">PDF, Word, Excel, or image · Max 10 MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Form fields (shown once file selected) */}
      {selectedFile && (
        <div className="space-y-3">
          {/* Document type */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
              Document Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-harvest/30 focus:border-harvest pr-9"
              >
                <option value="">Select document type…</option>
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Document title */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
              Document Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder={selectedFile.name}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-harvest/30 focus:border-harvest"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Any additional context for the reviewer…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-harvest/30 focus:border-harvest resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={uploading || !docType}
            className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          All documents are encrypted and stored securely. Only our compliance team can access your files.
        </p>
      </div>
    </div>
  );
}