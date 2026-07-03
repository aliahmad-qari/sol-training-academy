import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Search, Shield, FileText, FileVideo, FileImage,
  FileArchive, FileSpreadsheet, CheckCircle2, XCircle, Loader2,
  ToggleLeft, ToggleRight, FolderOpen, Layout
} from "lucide-react";
import PagePermissionsPanel from "./PagePermissionsPanel";

const CATEGORY_COLORS = {
  policy:     "bg-rose-100 text-rose-700",
  procedure:  "bg-orange-100 text-orange-700",
  training:   "bg-blue-100 text-blue-700",
  compliance: "bg-emerald-100 text-emerald-700",
  template:   "bg-purple-100 text-purple-700",
  report:     "bg-slate-100 text-slate-700",
  other:      "bg-gray-100 text-gray-700",
};

const CATEGORIES = ["policy", "procedure", "training", "compliance", "template", "report", "other"];

function FileTypeIcon({ type }) {
  const t = (type || "").toLowerCase();
  if (["mp4", "mov", "avi", "mkv"].includes(t)) return <FileVideo className="w-4 h-4 text-purple-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(t)) return <FileImage className="w-4 h-4 text-pink-500" />;
  if (["zip"].includes(t)) return <FileArchive className="w-4 h-4 text-amber-500" />;
  if (["xlsx", "xls"].includes(t)) return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
  return <FileText className="w-4 h-4 text-slate-500" />;
}

function FilePermissionsTab({ member, files, onRefresh }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [saving, setSaving] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const permissions = member.file_permissions || [];

  const hasAccess = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return false;
    if (file.access_level === "everyone") return true;
    if (file.access_level === "owner_only" && (member.role === "owner" || member.role === "admin")) return true;
    if (file.access_level === "managers_only" && ["owner", "admin", "manager"].includes(member.role)) return true;
    if (file.access_level === "selected_departments" && (file.allowed_departments || []).includes(member.department)) return true;
    return permissions.includes(fileId);
  };

  const togglePermission = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    if (file.access_level === "everyone") { toast.info("This file is accessible to everyone."); return; }
    if (file.access_level === "owner_only" && ["owner", "admin"].includes(member.role)) { toast.info("Access granted by role."); return; }
    if (file.access_level === "managers_only" && ["owner", "admin", "manager"].includes(member.role)) { toast.info("Access granted by role."); return; }

    setSaving(fileId);
    const currentlyHas = permissions.includes(fileId);
    const newPerms = currentlyHas ? permissions.filter(id => id !== fileId) : [...permissions, fileId];
    await base44.entities.TeamMember.update(member.id, { file_permissions: newPerms });
    await base44.entities.TeamActivityLog.create({
      member_id: member.id, member_name: member.full_name, action: "permission_changed",
      resource_id: fileId, resource_name: file.file_name, resource_type: "file",
      details: `${currentlyHas ? "Removed" : "Granted"} access to "${file.file_name}" for ${member.full_name}`,
    });
    toast.success(currentlyHas ? "Access removed" : "Access granted");
    onRefresh();
    setSaving(null);
  };

  const handleBulkGrant = async () => {
    setBulkLoading(true);
    const manageable = filteredFiles.filter(f => !["everyone", "owner_only", "managers_only"].includes(f.access_level));
    await base44.entities.TeamMember.update(member.id, { file_permissions: [...new Set([...permissions, ...manageable.map(f => f.id)])] });
    toast.success(`Granted access to ${manageable.length} files`);
    onRefresh(); setBulkLoading(false);
  };

  const handleBulkRevoke = async () => {
    setBulkLoading(true);
    const revokeIds = filteredFiles.filter(f => !["everyone", "owner_only", "managers_only"].includes(f.access_level)).map(f => f.id);
    await base44.entities.TeamMember.update(member.id, { file_permissions: permissions.filter(id => !revokeIds.includes(id)) });
    toast.success("Access revoked"); onRefresh(); setBulkLoading(false);
  };

  const handleGrantByCategory = async (cat) => {
    setBulkLoading(true);
    const catIds = files.filter(f => f.category === cat && !["everyone", "owner_only", "managers_only"].includes(f.access_level)).map(f => f.id);
    await base44.entities.TeamMember.update(member.id, { file_permissions: [...new Set([...permissions, ...catIds])] });
    toast.success(`Granted all ${cat} files`); onRefresh(); setBulkLoading(false);
  };

  const filteredFiles = useMemo(() => files.filter(f => {
    const matchSearch = !search || f.file_name.toLowerCase().includes(search.toLowerCase()) || (f.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || f.category === catFilter;
    return matchSearch && matchCat;
  }), [files, search, catFilter]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-slate-50 border border-border/50 rounded-xl p-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs text-slate-600">{files.filter(f => hasAccess(f.id)).length} accessible files</span></div>
        <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-rose-400" /><span className="text-xs text-slate-600">{files.filter(f => !hasAccess(f.id)).length} hidden files</span></div>
      </div>

      {/* Bulk actions */}
      <div className="bg-white border border-border/50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bulk Actions</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleBulkGrant} disabled={bulkLoading} className="gap-1.5 text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleRight className="w-3.5 h-3.5" />} Grant All
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkRevoke} disabled={bulkLoading} className="gap-1.5 text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50">
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleLeft className="w-3.5 h-3.5" />} Revoke All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center">By category:</span>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleGrantByCategory(cat)} disabled={bulkLoading}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize transition-all hover:opacity-80 disabled:opacity-40 ${CATEGORY_COLORS[cat] || ""} border-current/20`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* File matrix */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-14 text-center">
          <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No files found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-border/30 bg-slate-50 px-4 py-3">
            <span>File</span><span className="px-4">Category</span><span className="px-4">Date</span><span className="px-4">Type</span><span className="px-4 text-right">Access</span>
          </div>
          <div className="divide-y divide-border/20">
            {filteredFiles.map(file => {
              const granted = hasAccess(file.id);
              const isRoleBased = file.access_level === "everyone" ||
                (file.access_level === "owner_only" && ["owner", "admin"].includes(member.role)) ||
                (file.access_level === "managers_only" && ["owner", "admin", "manager"].includes(member.role)) ||
                (file.access_level === "selected_departments" && (file.allowed_departments || []).includes(member.department));
              const isSaving = saving === file.id;

              return (
                <div key={file.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3.5 hover:bg-slate-50 transition-colors ${granted ? "" : "opacity-70"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-border/50 flex items-center justify-center flex-shrink-0">
                      <FileTypeIcon type={file.file_type} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{file.file_name}</p>
                      {file.description && <p className="text-[11px] text-slate-400 truncate">{file.description}</p>}
                      {isRoleBased && <span className="text-[10px] text-blue-500 font-medium">Role-based</span>}
                    </div>
                  </div>
                  <div className="px-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${CATEGORY_COLORS[file.category] || ""}`}>{file.category}</span></div>
                  <div className="px-4 text-[11px] text-slate-400 whitespace-nowrap">{new Date(file.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</div>
                  <div className="px-4">{file.file_type && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{file.file_type}</span>}</div>
                  <div className="px-4 flex items-center gap-2 justify-end">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-harvest" /> : (
                      <>
                        <span className={`text-[10px] font-semibold whitespace-nowrap ${granted ? "text-emerald-600" : "text-slate-400"}`}>{granted ? "✓ Granted" : "✗ Denied"}</span>
                        <Switch checked={granted} onCheckedChange={() => togglePermission(file.id)} disabled={isRoleBased || !!isSaving} className={isRoleBased ? "opacity-50 cursor-not-allowed" : ""} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberPermissionsPanel({ member, files, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState("pages");

  const pageCount = (member.page_permissions || []).length;
  const fileCount = (member.file_permissions || []).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-500 hover:text-ink -ml-1 mt-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-harvest/20 to-harvest/5 border-2 border-harvest/20 flex items-center justify-center text-harvest font-bold text-base">
              {member.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-lg">{member.full_name}</h3>
              <p className="text-xs text-slate-500">{member.email} · <span className="capitalize">{member.role?.replace("_", " ")}</span> · <span className="capitalize">{member.status}</span></p>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                {pageCount} pages · {fileCount} files
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "pages" ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}>
          <Layout className="w-4 h-4" /> Page Access
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "pages" ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"}`}>{pageCount}</span>
        </button>
        <button onClick={() => setActiveTab("files")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "files" ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}>
          <FolderOpen className="w-4 h-4" /> File Access
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "files" ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"}`}>{fileCount}</span>
        </button>
      </div>

      {activeTab === "pages" && <PagePermissionsPanel member={member} onRefresh={onRefresh} />}
      {activeTab === "files" && <FilePermissionsTab member={member} files={files} onRefresh={onRefresh} />}
    </div>
  );
}