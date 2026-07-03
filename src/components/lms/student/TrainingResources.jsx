import React, { useState } from "react";
import { FileText, Download, ExternalLink, Search, BookOpen, File, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";

const RESOURCES = [
  {
    category: "NDIS Guides & Policy",
    icon: BookOpen,
    color: "text-harvest bg-harvest/10",
    items: [
      { title: "NDIS Practice Standards Overview 2024", type: "PDF", size: "1.2 MB", href: "https://www.ndis.gov.au/providers/registration/meeting-ndis-practice-standards", external: true },
      { title: "NDIS Code of Conduct — Worker Guide", type: "PDF", size: "840 KB", href: "https://www.ndiscommission.gov.au/document/2351", external: true },
      { title: "Support Coordination Guidelines", type: "PDF", size: "2.1 MB", href: "https://www.ndis.gov.au/participants/using-your-plan/support-coordination", external: true },
      { title: "NDIS Price Guide 2025–26", type: "PDF", size: "3.4 MB", href: "https://www.ndis.gov.au/providers/pricing-arrangements", external: true },
    ]
  },
  {
    category: "Templates & Tools",
    icon: File,
    color: "text-emerald-600 bg-emerald-50",
    items: [
      { title: "Support Coordination Case Note Template", type: "DOCX", size: "45 KB", href: "#" },
      { title: "NDIS Goal-Setting Worksheet", type: "XLSX", size: "120 KB", href: "#" },
      { title: "Service Agreement Template", type: "DOCX", size: "88 KB", href: "#" },
      { title: "Incident Report Form", type: "PDF", size: "210 KB", href: "#" },
      { title: "Risk Assessment Framework", type: "DOCX", size: "65 KB", href: "#" },
    ]
  },
  {
    category: "Training Documents",
    icon: Folder,
    color: "text-amber-600 bg-amber-50",
    items: [
      { title: "Level 1 — Course Reading Pack", type: "PDF", size: "4.8 MB", href: "#" },
      { title: "Level 2 — Advanced Practice Workbook", type: "PDF", size: "6.2 MB", href: "#" },
      { title: "Level 3 — Specialist SC Handbook", type: "PDF", size: "5.5 MB", href: "#" },
      { title: "NDIS Glossary of Key Terms", type: "PDF", size: "520 KB", href: "#" },
    ]
  },
  {
    category: "External NDIS Resources",
    icon: ExternalLink,
    color: "text-amber-600 bg-amber-50",
    items: [
      { title: "NDIS Commission — Worker Resource Hub", type: "Link", href: "https://www.ndiscommission.gov.au/workers", external: true },
      { title: "NDIS Participant Pathways Guide", type: "Link", href: "https://www.ndis.gov.au/participants", external: true },
      { title: "Quality & Safeguards Framework", type: "Link", href: "https://www.ndiscommission.gov.au/about/ndis-quality-safeguards-framework", external: true },
      { title: "My Aged Care — Integration Guide", type: "Link", href: "https://www.myagedcare.gov.au/", external: true },
    ]
  },
];

const TYPE_COLORS = {
  PDF: "bg-rose-100 text-rose-700",
  DOCX: "bg-harvest/10 text-harvest",
  XLSX: "bg-emerald-100 text-emerald-700",
  Link: "bg-amber-100 text-amber-700",
};

export default function TrainingResources() {
  const [search, setSearch] = useState("");

  const filtered = RESOURCES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.title.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-harvest" />
        </div>
        <div className="flex-1">
          <h2 className="font-display font-bold text-white text-lg">Training Resources</h2>
          <p className="text-white/50 text-sm">NDIS guides, templates, and training documents for support coordinators</p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-9 text-sm focus:bg-white/15" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {filtered.map(cat => (
          <div key={cat.category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                <cat.icon className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-ink text-sm">{cat.category}</h3>
              <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat.items.length} items</span>
            </div>
            <div className="p-2">
              {cat.items.map(item => (
                <a key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-harvest/5 transition-all group">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-harvest transition-colors">{item.title}</p>
                    {item.size && <p className="text-[10px] text-slate-400">{item.size}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600"}`}>
                      {item.type}
                    </span>
                    {item.external
                      ? <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-harvest transition-colors" />
                      : <Download className="w-3.5 h-3.5 text-slate-300 group-hover:text-harvest transition-colors" />}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No resources match your search.</p>
        </div>
      )}
    </div>
  );
}