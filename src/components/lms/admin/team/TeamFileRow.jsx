import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2, Lock, Globe, Users, UserCheck, Building2, FileText, FileVideo, FileImage, FileArchive, FileSpreadsheet } from "lucide-react";

const ACCESS_LABELS = {
  everyone:             { label: "Everyone",           icon: Globe,      color: "bg-green-100 text-green-700" },
  owner_only:           { label: "Owner Only",         icon: Lock,       color: "bg-red-100 text-red-700" },
  managers_only:        { label: "Managers Only",      icon: UserCheck,  color: "bg-blue-100 text-blue-700" },
  selected_members:     { label: "Selected Members",   icon: Users,      color: "bg-purple-100 text-purple-700" },
  selected_departments: { label: "Departments",        icon: Building2,  color: "bg-amber-100 text-amber-700" },
};

const CATEGORY_COLORS = {
  policy:     "bg-rose-100 text-rose-700",
  procedure:  "bg-orange-100 text-orange-700",
  training:   "bg-blue-100 text-blue-700",
  compliance: "bg-emerald-100 text-emerald-700",
  template:   "bg-purple-100 text-purple-700",
  report:     "bg-slate-100 text-slate-700",
  other:      "bg-gray-100 text-gray-700",
};

function FileTypeIcon({ type }) {
  const t = (type || "").toLowerCase();
  if (["mp4", "mov", "avi", "mkv"].includes(t)) return <FileVideo className="w-5 h-5 text-purple-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(t)) return <FileImage className="w-5 h-5 text-pink-500" />;
  if (["zip"].includes(t)) return <FileArchive className="w-5 h-5 text-amber-500" />;
  if (["xlsx", "xls"].includes(t)) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  return <FileText className="w-5 h-5 text-slate-500" />;
}

export default function TeamFileRow({ file, teamMembers, onRefresh, currentMemberRole }) {
  const [downloading, setDownloading] = useState(false);
  const access = ACCESS_LABELS[file.access_level] || ACCESS_LABELS.everyone;
  const AccessIcon = access.icon;

  const handleDownload = async () => {
    if (!file.file_url) { toast.error("No file available"); return; }
    setDownloading(true);
    // Track download
    await base44.entities.TeamFile.update(file.id, { download_count: (file.download_count || 0) + 1 });
    window.open(file.file_url, "_blank");
    toast.success("Download started");
    setDownloading(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete file "${file.file_name}"?`)) return;
    await base44.entities.TeamFile.update(file.id, { is_active: false });
    toast.success("File removed");
    onRefresh();
  };

  // Resolve allowed member names
  const allowedNames = file.access_level === "selected_members"
    ? teamMembers.filter(m => (file.allowed_member_ids || []).includes(m.id)).map(m => m.full_name)
    : [];

  return (
    <div className="bg-white rounded-xl border border-border/50 p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center flex-shrink-0">
        <FileTypeIcon type={file.file_type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ink text-sm truncate">{file.file_name}</p>
          {file.file_type && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{file.file_type}</span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[file.category] || ""}`}>{file.category}</span>
        </div>
        {file.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{file.description}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${access.color}`}>
            <AccessIcon className="w-3 h-3" />{access.label}
          </span>
          {allowedNames.length > 0 && (
            <span className="text-[11px] text-slate-400">({allowedNames.slice(0, 3).join(", ")}{allowedNames.length > 3 ? ` +${allowedNames.length - 3}` : ""})</span>
          )}
          {file.access_level === "selected_departments" && (file.allowed_departments || []).length > 0 && (
            <span className="text-[11px] text-slate-400">({(file.allowed_departments || []).join(", ")})</span>
          )}
          <span className="text-[11px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />{file.view_count || 0} views</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1"><Download className="w-3 h-3" />{file.download_count || 0} downloads</span>
          {file.file_size_mb > 0 && <span className="text-[11px] text-slate-400">{file.file_size_mb} MB</span>}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Uploaded by {file.uploaded_by_name || "Admin"} · {new Date(file.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading} className="h-8 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" /> Download
        </Button>
        {(currentMemberRole === "owner" || currentMemberRole === "manager") && (
          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}