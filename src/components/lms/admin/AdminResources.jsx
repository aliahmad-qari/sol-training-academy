import React, { useState } from "react";
import { FileText, Upload, Trash2, Download, Search, Plus, File, BookOpen, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const INITIAL_RESOURCES = [
  { id: 1, name: "NDIS Practice Standards Overview 2024", type: "PDF", category: "guides",    size: "1.2 MB", uploaded: "2026-05-10", href: "https://www.ndis.gov.au" },
  { id: 2, name: "NDIS Code of Conduct — Worker Guide",  type: "PDF", category: "policies",  size: "840 KB", uploaded: "2026-05-10", href: "#" },
  { id: 3, name: "Support Coordination Case Note Template", type: "DOCX", category: "templates", size: "45 KB",  uploaded: "2026-05-12", href: "#" },
  { id: 4, name: "Level 1 — Course Reading Pack",        type: "PDF", category: "training",  size: "4.8 MB", uploaded: "2026-05-15", href: "#" },
  { id: 5, name: "Level 2 — Advanced Practice Workbook", type: "PDF", category: "training",  size: "6.2 MB", uploaded: "2026-05-15", href: "#" },
  { id: 6, name: "Level 3 — Specialist SC Handbook",     type: "PDF", category: "training",  size: "5.5 MB", uploaded: "2026-05-15", href: "#" },
  { id: 7, name: "NDIS Price Guide 2025–26",             type: "PDF", category: "guides",    size: "3.4 MB", uploaded: "2026-05-18", href: "#" },
  { id: 8, name: "Service Agreement Template",           type: "DOCX",category: "templates", size: "88 KB",  uploaded: "2026-05-20", href: "#" },
  { id: 9, name: "Incident Report Form",                 type: "PDF", category: "templates", size: "210 KB", uploaded: "2026-05-22", href: "#" },
  { id: 10, name: "Risk Assessment Framework",           type: "DOCX",category: "policies",  size: "65 KB",  uploaded: "2026-05-24", href: "#" },
];

const TYPE_COLORS = {
  PDF:  "bg-rose-100 text-rose-700",
  DOCX: "bg-blue-100 text-blue-700",
  XLSX: "bg-emerald-100 text-emerald-700",
};

const CAT_LABELS = { guides: "Guides", policies: "Policies", templates: "Templates", training: "Training Docs" };
const CAT_ICONS  = { guides: BookOpen, policies: Shield, templates: File, training: FileText };

export default function AdminResources() {
  const [resources, setResources]   = useState(INITIAL_RESOURCES);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [uploading, setUploading]   = useState(false);

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id) => {
    if (!confirm("Delete this resource?")) return;
    setResources(prev => prev.filter(r => r.id !== id));
    toast.success("Resource deleted.");
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success("Resource uploaded successfully (demo).");
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Training Resources</h2>
          <p className="text-sm text-slate_mist">Manage PDFs, templates, policies and training documents.</p>
        </div>
        <Button onClick={handleUpload} disabled={uploading} className="bg-harvest text-white gap-1.5 text-sm h-9">
          <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload Resource"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {Object.entries(CAT_LABELS).map(([key, label]) => {
          const Icon = CAT_ICONS[key];
          return (
            <div key={key} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all"
              onClick={() => setCatFilter(key === catFilter ? "all" : key)}>
              <div className="w-8 h-8 rounded-lg bg-harvest/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-harvest" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-ink">{resources.filter(r => r.category === key).length}</p>
                <p className="text-[10px] text-slate_mist">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CAT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Name", "Type", "Category", "Size", "Uploaded", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink text-sm max-w-[240px]">
                    <p className="truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate_mist flex-shrink-0" />{r.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[r.type] || "bg-gray-100 text-gray-600"}`}>{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate_mist capitalize">{CAT_LABELS[r.category] || r.category}</td>
                  <td className="px-4 py-3 text-xs text-slate_mist">{r.size}</td>
                  <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">{r.uploaded}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={r.href} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)} className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate_mist text-sm">No resources found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
          {filtered.length} of {resources.length} resources
        </div>
      </div>
    </div>
  );
}