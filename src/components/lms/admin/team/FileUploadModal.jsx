import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, X, CheckSquare, Square } from "lucide-react";

const CATEGORIES = ["policy", "procedure", "training", "compliance", "template", "report", "other"];
const ACCESS_LEVELS = [
  { value: "everyone",             label: "Everyone" },
  { value: "owner_only",           label: "Owner Only" },
  { value: "managers_only",        label: "Managers Only" },
  { value: "selected_members",     label: "Selected Team Members" },
  { value: "selected_departments", label: "Selected Departments" },
];
const DEPARTMENTS = ["Administration", "Training", "Compliance", "IT", "Finance", "Operations", "HR", "Management"];

export default function FileUploadModal({ open, onClose, onUploaded, admin, teamMembers }) {
  const [form, setForm] = useState({
    file_name: "", description: "", category: "other",
    access_level: "everyone", allowed_member_ids: [], allowed_departments: [],
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      allowed_member_ids: f.allowed_member_ids.includes(id)
        ? f.allowed_member_ids.filter(x => x !== id)
        : [...f.allowed_member_ids, id],
    }));
  };

  const toggleDept = (dept) => {
    setForm(f => ({
      ...f,
      allowed_departments: f.allowed_departments.includes(dept)
        ? f.allowed_departments.filter(x => x !== dept)
        : [...f.allowed_departments, dept],
    }));
  };

  const handleUpload = async () => {
    if (!file && !form.file_name) { toast.error("Please select a file."); return; }
    if (!form.file_name) { toast.error("File name is required."); return; }
    setLoading(true);
    try {
      let fileUrl = "";
      let fileType = "";
      let fileSizeMb = 0;

      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = file_url;
        fileType = file.name.split(".").pop().toUpperCase();
        fileSizeMb = parseFloat((file.size / 1024 / 1024).toFixed(2));
      }

      await base44.entities.TeamFile.create({
        ...form,
        file_url: fileUrl,
        file_type: fileType,
        file_size_mb: fileSizeMb,
        uploaded_by_id: admin?.id,
        uploaded_by_name: admin?.full_name || admin?.email,
        download_count: 0,
        view_count: 0,
        is_active: true,
      });

      await base44.entities.TeamActivityLog.create({
        member_id: admin?.id,
        member_name: admin?.full_name || admin?.email,
        action: "file_upload",
        resource_name: form.file_name,
        resource_type: "file",
        details: `Uploaded ${form.file_name} (${form.access_level})`,
      });

      toast.success("File uploaded successfully!");
      setForm({ file_name: "", description: "", category: "other", access_level: "everyone", allowed_member_ids: [], allowed_departments: [] });
      setFile(null);
      onUploaded();
      onClose();
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Upload className="w-5 h-5 text-harvest" /> Upload File
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* File picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Select File</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-harvest/50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">{file ? file.name : "Click to browse — PDF, DOCX, XLSX, PPTX, ZIP, Images, Videos"}</span>
              <input type="file" className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!form.file_name) setForm(x => ({ ...x, file_name: f.name })); } }}
              />
            </label>
            {file && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-600 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button onClick={() => setFile(null)}><X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">File Name *</label>
              <Input value={form.file_name} onChange={e => setForm(f => ({ ...f, file_name: e.target.value }))} placeholder="Company Policy 2025" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Category</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of this file…" className="resize-none text-sm" />
          </div>

          {/* Access Level */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Who Can Access This File?</label>
            <Select value={form.access_level} onValueChange={v => setForm(f => ({ ...f, access_level: v, allowed_member_ids: [], allowed_departments: [] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACCESS_LEVELS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Multi-select team members */}
          {form.access_level === "selected_members" && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Select Team Members</label>
              <div className="border border-border rounded-xl divide-y divide-border/50 max-h-48 overflow-y-auto">
                {teamMembers.length === 0 && <p className="text-xs text-slate-400 p-3">No team members found.</p>}
                {teamMembers.map(m => (
                  <button key={m.id} onClick={() => toggleMember(m.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                    {form.allowed_member_ids.includes(m.id)
                      ? <CheckSquare className="w-4 h-4 text-harvest flex-shrink-0" />
                      : <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-ink">{m.full_name}</p>
                      <p className="text-xs text-slate-400">{m.job_title || m.department || m.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Multi-select departments */}
          {form.access_level === "selected_departments" && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Select Departments</label>
              <div className="grid grid-cols-2 gap-2">
                {DEPARTMENTS.map(d => (
                  <button key={d} onClick={() => toggleDept(d)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      form.allowed_departments.includes(d) ? "border-harvest bg-harvest/5 text-harvest" : "border-border text-slate-500 hover:border-harvest/40"
                    }`}>
                    {form.allowed_departments.includes(d)
                      ? <CheckSquare className="w-3.5 h-3.5" />
                      : <Square className="w-3.5 h-3.5" />}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleUpload} disabled={loading} className="flex-1 bg-harvest text-white hover:bg-harvest/90 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}