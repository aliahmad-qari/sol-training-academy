import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STATUS_CONFIG = {
  paid: { label: "Paid", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  sent: { label: "Sent", icon: Calendar, color: "bg-blue-50 text-blue-700 border-blue-200" },
  viewed: { label: "Viewed", icon: Eye, color: "bg-blue-50 text-blue-700 border-blue-200" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "bg-red-50 text-red-700 border-red-200" },
  draft: { label: "Draft", icon: FileText, color: "bg-slate-50 text-slate-700 border-slate-200" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "bg-slate-50 text-slate-700 border-slate-200" },
};

export default function InvoiceHistory({ userId, invoices: propInvoices, loading: propLoading }) {
  const [invoices, setInvoices] = useState(propInvoices || []);
  const [loading, setLoading] = useState(propLoading ?? true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (propInvoices !== undefined) {
      setInvoices(propInvoices);
      setLoading(propLoading ?? false);
      return;
    }
    if (!userId) { setInvoices([]); setLoading(false); return; }
    base44.entities.Invoice.filter({ user_id: userId })
      .then(data => setInvoices(data || []))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, [userId, propInvoices, propLoading]);

  const query = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter(inv => {
    if (filter === "paid" && inv.status !== "paid") return false;
    if (filter === "pending" && !["sent", "viewed", "overdue", "draft"].includes(inv.status)) return false;
    if (!query) return true;
    const statusLabel = STATUS_CONFIG[inv.status]?.label || inv.status;
    return [
      inv.invoice_number,
      inv.business_name,
      inv.service_type,
      inv.package_name,
      inv.status,
      statusLabel,
      inv.total,
      inv.invoice_date,
      inv.due_date,
    ].some(value => String(value || "").toLowerCase().includes(query));
  });

  const totalRevenue = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === "paid").length;
  const pendingCount = invoices.filter(inv => ["sent", "viewed", "overdue", "draft"].includes(inv.status)).length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No invoices yet</p>
        <p className="text-sm text-slate-400 mt-1">Your invoices will appear here once services are provided</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <DollarSign className="w-6 h-6 text-harvest mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">A${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-600 mt-1">Total Paid</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">{paidCount}</p>
          <p className="text-xs text-slate-600 mt-1">Paid Invoices</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow">
          <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">{pendingCount}</p>
          <p className="text-xs text-slate-600 mt-1">Pending</p>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search invoices..."
          className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-harvest/25 focus:border-harvest"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Invoices" },
          { id: "paid", label: "Paid" },
          { id: "pending", label: "Pending" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab.id ? "bg-harvest text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No invoices match your filters</p>
          </Card>
        ) : (
          filteredInvoices
            .slice()
            .sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))
            .map(invoice => {
              const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;
              return (
                <Card key={invoice.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-ink">{invoice.business_name}</p>
                            <p className="text-sm text-slate-600">{invoice.package_name}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 whitespace-nowrap ${statusCfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Invoice #</p>
                            <p className="font-mono text-ink mt-1">{invoice.invoice_number}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Date</p>
                            <p className="text-ink mt-1">{new Date(invoice.invoice_date).toLocaleDateString("en-AU")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Amount</p>
                            <p className="font-bold text-ink mt-1">A${(invoice.total || 0).toFixed(2)}</p>
                          </div>
                          {invoice.due_date && invoice.status !== "paid" && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Due</p>
                              <p className={`font-semibold mt-1 ${invoice.status === "overdue" ? "text-red-600" : "text-amber-600"}`}>
                                {new Date(invoice.due_date).toLocaleDateString("en-AU")}
                              </p>
                            </div>
                          )}
                          {invoice.paid_date && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Paid</p>
                              <p className="text-emerald-600 font-semibold mt-1">
                                {new Date(invoice.paid_date).toLocaleDateString("en-AU")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {invoice.pdf_url && (
                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" title="Download receipt">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Receipt</span>
                          </Button>
                        </a>
                      )}
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
