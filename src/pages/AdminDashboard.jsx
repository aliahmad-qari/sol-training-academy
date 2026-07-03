import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Users, FileText, DollarSign, Clock, CheckCircle, Eye, Download, RefreshCw, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Navbar from "@/components/landing/Navbar";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  awaiting_payment: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const SERVICE_LABELS = {
  ndis_registration: "NDIS Registration",
  website_development: "Website Dev",
  software_automation: "Software/Automation",
  accountancy: "Accountancy",
};

function StatCard({ icon: IconComponent, label, value, color }) {
  const Icon = IconComponent;
  return (
    <div className="bg-white rounded-2xl p-6 border border-border/50 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink">{value}</p>
        <p className="text-xs text-slate_mist">{label}</p>
      </div>
    </div>
  );
}

function EnquiryModal({ enquiry, onClose, onUpdate }) {
  const [status, setStatus] = useState(enquiry.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.Enquiry.update(enquiry.id, { status });
    onUpdate();
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-ink">Enquiry Details</h2>
          <button onClick={onClose} className="text-slate_mist hover:text-ink text-2xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          {[
            ["Service", SERVICE_LABELS[enquiry.service_type] || enquiry.service_type],
            ["Name", enquiry.full_name],
            ["Email", enquiry.email],
            ["Phone", enquiry.phone],
            ["Company", enquiry.company_name],
            ["ABN", enquiry.abn],
            ["Address", enquiry.address],
            ["Package", enquiry.selected_package],
            ["Package Price", enquiry.package_price ? `$${enquiry.package_price?.toLocaleString()} +GST` : "—"],
            ["Provider Focus", enquiry.provider_focus],
            ["Participant Volume", enquiry.participant_volume],
            ["Audit Pathway", enquiry.audit_pathway],
            ["Payment Ref", enquiry.payment_reference || "—"],
            ["Docs Generated", enquiry.documents_generated ? "Yes" : "No"],
            ["Submitted", enquiry.created_date ? format(new Date(enquiry.created_date), "dd/MM/yyyy HH:mm") : "—"],
          ].map(([label, value]) => value ? (
            <div key={label}>
              <p className="text-xs text-slate_mist uppercase tracking-wider">{label}</p>
              <p className="font-medium text-ink">{value}</p>
            </div>
          ) : null)}
        </div>
        {enquiry.selected_services?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate_mist uppercase tracking-wider mb-1">Services</p>
            <div className="flex flex-wrap gap-1">{enquiry.selected_services.map(s => <span key={s} className="text-xs bg-chalk px-2 py-1 rounded-full text-ink">{s}</span>)}</div>
          </div>
        )}
        {enquiry.message && (
          <div className="mb-4">
            <p className="text-xs text-slate_mist uppercase tracking-wider mb-1">Message</p>
            <p className="text-sm text-ink bg-chalk rounded-lg p-3">{enquiry.message}</p>
          </div>
        )}
        {enquiry.logo_url && (
          <div className="mb-4">
            <p className="text-xs text-slate_mist uppercase tracking-wider mb-1">Logo</p>
            <img src={enquiry.logo_url} alt="logo" className="h-12 object-contain" />
          </div>
        )}
        <div className="border-t border-border pt-4 flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["new","in_progress","awaiting_payment","paid","completed","cancelled"].map(s => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={save} disabled={saving} className="bg-harvest hover:bg-harvest/90 text-white">
            {saving ? "Saving…" : "Update Status"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Enquiry.list("-created_date", 100);
    setEnquiries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = enquiries.filter(e => {
    const matchSearch = !search || [e.full_name, e.email, e.company_name, e.abn].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchService = filterService === "all" || e.service_type === filterService;
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchService && matchStatus;
  });

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === "new").length,
    paid: enquiries.filter(e => ["paid", "completed"].includes(e.status)).length,
    revenue: enquiries.filter(e => ["paid", "completed"].includes(e.status)).reduce((s, e) => s + (e.package_price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-chalk">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-ink">Admin Dashboard</h1>
            <p className="text-slate_mist text-sm mt-1">All client enquiries and intake submissions</p>
          </div>
          <Button onClick={load} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Enquiries" value={stats.total} color="bg-blue-100 text-blue-600" />
          <StatCard icon={Clock} label="New / Unreviewed" value={stats.new} color="bg-orange-100 text-orange-600" />
          <StatCard icon={CheckCircle} label="Paid / Completed" value={stats.paid} color="bg-green-100 text-green-600" />
          <StatCard icon={DollarSign} label="Revenue (excl. GST)" value={`$${stats.revenue.toLocaleString()}`} color="bg-harvest/20 text-harvest" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border/50 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate_mist" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, company…" className="pl-9" />
          </div>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Services" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="ndis_registration">NDIS Registration</SelectItem>
              <SelectItem value="website_development">Website Dev</SelectItem>
              <SelectItem value="software_automation">Software/Automation</SelectItem>
              <SelectItem value="accountancy">Accountancy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["new","in_progress","awaiting_payment","paid","completed","cancelled"].map(s => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate_mist">{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate_mist">Loading enquiries…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate_mist">No enquiries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-chalk">
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Company</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Package</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Value</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-slate_mist uppercase tracking-wider">Docs</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id} className="border-b border-border/30 hover:bg-chalk/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                        {e.created_date ? format(new Date(e.created_date), "dd/MM/yy") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{e.full_name || "—"}</p>
                        <p className="text-xs text-slate_mist">{e.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{e.company_name || "—"}</p>
                        <p className="text-xs text-slate_mist">{e.abn}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs bg-chalk px-2 py-1 rounded-full text-ink">
                          {SERVICE_LABELS[e.service_type] || e.service_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate_mist">{e.selected_package || "—"}</td>
                      <td className="px-4 py-3 font-display font-semibold text-harvest text-sm">
                        {e.package_price ? `$${e.package_price?.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[e.status] || "bg-gray-100 text-gray-600"}`}>
                          {e.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {e.documents_generated ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-xs text-slate_mist">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(e)} className="gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && <EnquiryModal enquiry={selected} onClose={() => setSelected(null)} onUpdate={load} />}
    </div>
  );
}