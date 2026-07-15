import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, CheckCircle2, AlertCircle,
  Phone, Mail, Building2, User, MapPin, FileText, Tag, Users,
  ChevronRight, X, Calendar, DollarSign, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_CONFIG = {
  new:              { label: "New",             color: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-500" },
  in_progress:      { label: "In Progress",     color: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
  awaiting_payment: { label: "Awaiting Payment",color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  paid:             { label: "Paid",            color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  completed:        { label: "Completed",       color: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-600" },
  cancelled:        { label: "Cancelled",       color: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-500" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5"} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DetailField({ label, value, icon: Icon, fullWidth }) {
  if (!value && value !== 0) return null;
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3 h-3 text-slate-400" />}
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm text-slate-800 font-medium leading-snug">{value}</p>
    </div>
  );
}

function DetailPanel({ enquiry, onClose, onUpdated }) {
  const [status, setStatus] = useState(enquiry.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Enquiry.update(enquiry.id, { status });
    toast.success("Status updated");
    onUpdated();
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-400 mb-1">NDIS Intake Application</p>
          <h2 className="font-display font-bold text-xl text-ink leading-tight">{enquiry.full_name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{enquiry.company_name || enquiry.email}</p>
        </div>
        <button onClick={onClose} className="mt-1 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Status + submitted */}
        <div className="flex items-center justify-between">
          <StatusBadge status={enquiry.status} size="md" />
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {enquiry.created_date ? format(new Date(enquiry.created_date), "dd MMM yyyy, h:mm a") : "—"}
          </p>
        </div>

        {/* Contact info */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Details</h3>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
            <DetailField label="Full Name" value={enquiry.full_name} icon={User} />
            <DetailField label="Email" value={enquiry.email} icon={Mail} />
            <DetailField label="Phone" value={enquiry.phone} icon={Phone} />
            <DetailField label="Address" value={enquiry.address} icon={MapPin} />
          </div>
        </section>

        {/* Business info */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Business Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
            <DetailField label="Company" value={enquiry.company_name} icon={Building2} />
            <DetailField label="ABN" value={enquiry.abn} />
            <DetailField label="Company Email" value={enquiry.company_email} icon={Mail} />
            <DetailField label="Company Phone" value={enquiry.company_phone} icon={Phone} />
            {enquiry.logo_url && (
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Logo</p>
                <img src={enquiry.logo_url} alt="logo" className="h-10 object-contain rounded" />
              </div>
            )}
          </div>
        </section>

        {/* NDIS details */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">NDIS Service Details</h3>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
            <DetailField label="Provider Focus" value={enquiry.provider_focus} icon={Tag} />
            <DetailField label="Participant Volume" value={enquiry.participant_volume} icon={Users} />
            <DetailField label="Package" value={enquiry.selected_package} icon={Layers} />
            <DetailField
              label="Package Value"
              value={enquiry.package_price ? `$${enquiry.package_price.toLocaleString()} + GST` : null}
              icon={DollarSign}
            />
            <DetailField label="Audit Pathway" value={enquiry.audit_pathway} icon={FileText} />
            <DetailField label="Module Recommendation" value={enquiry.module_recommendation} icon={FileText} />
          </div>
        </section>

        {/* Selected services */}
        {enquiry.selected_services?.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Selected NDIS Services</h3>
            <div className="flex flex-wrap gap-2">
              {enquiry.selected_services.map(s => (
                <span key={s} className="text-xs bg-harvest/10 text-harvest border border-harvest/20 px-3 py-1.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Notes / message */}
        {enquiry.message && (
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Additional Notes</h3>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{enquiry.message}</p>
          </section>
        )}

        {/* Docs flag */}
        <div className="flex items-center gap-2 text-sm">
          {enquiry.documents_generated
            ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-700 font-medium">Documents generated</span></>
            : <><AlertCircle className="w-4 h-4 text-slate-400" /><span className="text-slate-500">No documents generated yet</span></>
          }
        </div>
      </div>

      {/* Status update footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="flex-1 h-10 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSave}
          disabled={saving || status === enquiry.status}
          className="bg-harvest hover:bg-harvest/90 text-white h-10 px-5 font-semibold"
        >
          {saving ? "Saving…" : "Update"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function AdminNDISIntake() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Enquiry.filter({ service_type: "ndis_registration" }, "-created_date", 200);
    setEnquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = enquiries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || [e.full_name, e.email, e.company_name, e.abn, e.phone].join(" ").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const counts = ALL_STATUSES.reduce((acc, s) => { acc[s] = enquiries.filter(e => e.status === s).length; return acc; }, {});
  const pendingReview = counts.new || 0;
  const inProgress = (counts.in_progress || 0) + (counts.awaiting_payment || 0);
  const completed = (counts.paid || 0) + (counts.completed || 0);

  return (
    <div className="relative">
      {/* Overlay when panel open on small screens */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">NDIS Intake Applications</h2>
          <p className="text-sm text-slate-500 mt-1">Review and manage NDIS registration enquiries submitted via the client portal.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 h-9" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Applications", value: enquiries.length, color: "bg-slate-100 text-slate-700" },
          { label: "Pending Review", value: pendingReview, color: "bg-blue-50 text-blue-700", highlight: pendingReview > 0 },
          { label: "In Progress", value: inProgress, color: "bg-amber-50 text-amber-700" },
          { label: "Paid / Completed", value: completed, color: "bg-emerald-50 text-emerald-700" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.highlight ? "border-blue-300 ring-1 ring-blue-200" : "border-border/50"} ${stat.color}`}>
            <p className="text-2xl font-display font-bold leading-none">{stat.value}</p>
            <p className="text-xs mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border/50 p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company, ABN…"
            className="pl-9 h-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Application list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border/30 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-40" />
                  <div className="h-3 bg-slate-100 rounded w-56" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/30 p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(e => {
            const isSelected = selected?.id === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setSelected(isSelected ? null : e)}
                className={`w-full text-left bg-white rounded-xl border transition-all p-4 hover:shadow-sm group ${
                  isSelected ? "border-harvest ring-1 ring-harvest/30 shadow-sm" : "border-border/40 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${
                    isSelected ? "bg-harvest text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {(e.full_name || "?")[0].toUpperCase()}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-ink text-sm">{e.full_name}</p>
                      {e.company_name && (
                        <span className="text-xs text-slate-400">· {e.company_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {e.email}
                      </span>
                      {e.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {e.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {e.selected_package && (
                      <span className="text-xs bg-harvest/10 text-harvest border border-harvest/20 px-2.5 py-1 rounded-full font-medium">
                        {e.selected_package}
                      </span>
                    )}
                    {e.package_price && (
                      <span className="text-xs font-display font-bold text-ink">
                        ${e.package_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Status + date */}
                  <div className="hidden md:flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={e.status} />
                    <span className="text-[11px] text-slate-400">
                      {e.created_date ? format(new Date(e.created_date), "dd MMM yy") : ""}
                    </span>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isSelected ? "rotate-90 text-harvest" : "group-hover:translate-x-0.5"}`} />
                </div>

                {/* Mobile status row */}
                <div className="flex items-center justify-between mt-2 sm:hidden">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-slate-400">{e.created_date ? format(new Date(e.created_date), "dd MMM yy") : ""}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Slide-in Detail Panel */}
      <AnimatePresence>
        {selected && (
          <DetailPanel
            key={selected.id}
            enquiry={selected}
            onClose={() => setSelected(null)}
            onUpdated={() => { load(); setSelected(s => ({ ...s, status: s.status })); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}