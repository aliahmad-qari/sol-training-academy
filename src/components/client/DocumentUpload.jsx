import React, { useState } from "react";
import { Upload, FileCheck, AlertCircle, Loader2, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUpload({ enquiryId, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop().toUpperCase();
    return ext;
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("File type not supported. Please upload PDF, Word, Excel, or image files.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 10MB.");
      return false;
    }
    return true;
  };

  const handleUpload = async (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of validFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        setUploadedFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2),
          url: file_url,
          uploadedAt: new Date().toLocaleString("en-AU"),
        }]);

        toast.success(`${file.name} uploaded successfully`);
      }

      if (onUploadSuccess) {
        onUploadSuccess(validFiles.length);
      }
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-5">
      {/* Upload Area */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 text-center border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? "border-harvest bg-harvest/5"
            : "border-slate-300 hover:border-harvest/50 hover:bg-slate-50"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-harvest animate-spin" />
              <p className="font-semibold text-ink">Uploading documents...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-harvest/10 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-harvest" />
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Drop files here or click to upload</p>
                <p className="text-sm text-slate-500">Supported: PDF, Word, Excel, Images (Max 10MB each)</p>
              </div>
              <label>
                <input
                  type="file"
                  multiple
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Button
                  asChild
                  className="gap-2 bg-harvest hover:bg-harvest/90 text-white cursor-pointer"
                  disabled={uploading}
                >
                  <span>
                    <Upload className="w-4 h-4" /> Select Files
                  </span>
                </Button>
              </label>
            </>
          )}
        </div>
      </Card>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">Secure Upload</p>
          <p className="text-xs text-blue-800 mt-0.5">All files are encrypted and stored securely. Only our compliance team has access.</p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="font-semibold text-ink mb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Uploaded Documents ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <div key={file.id} className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">{getFileType(file.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.size} MB • {file.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Eye className="w-4 h-4" /> View
                      </Button>
                    </a>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center justify-center"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}