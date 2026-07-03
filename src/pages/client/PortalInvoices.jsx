import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import InvoiceHistory from "@/components/client/InvoiceHistory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

export default function PortalInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.entities.Invoice.filter({ user_id: user.id })
      .then(data => setInvoices(data || []))
      .catch(() => toast.error("Failed to load billing data"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0);
  const totalOutstanding = invoices.filter(i => ["sent", "viewed"].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  const handleExportCSV = () => {
    if (!invoices.length) return;
    const rows = [
      ["Invoice #", "Date", "Business", "Service", "Package", "Amount (AUD)", "GST", "Total", "Status", "Paid Date"],
      ...invoices.map(inv => [
        inv.invoice_number || "",
        inv.invoice_date || "",
        inv.business_name || "",
        inv.service_type || "",
        inv.package_name || "",
        (inv.amount || 0).toFixed(2),
        (inv.gst || 0).toFixed(2),
        (inv.total || 0).toFixed(2),
        inv.status || "",
        inv.paid_date || "",
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payment history exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink mb-1">Invoices & Billing</h1>
          <p className="text-slate-500 text-sm">View your current billing status and download your full payment history.</p>
        </div>
        {invoices.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 h-9">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Billing summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Paid</p>
            </div>
            <p className="text-2xl font-bold text-ink font-display">A${totalPaid.toFixed(2)}</p>
          </Card>

          <Card className="p-5 border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</p>
            </div>
            <p className="text-2xl font-bold text-ink font-display">A${totalOutstanding.toFixed(2)}</p>
          </Card>

          <Card className={`p-5 border-border/50 shadow-sm col-span-2 sm:col-span-1 ${overdueCount > 0 ? "border-red-200 bg-red-50/40" : ""}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${overdueCount > 0 ? "bg-red-100" : "bg-slate-100"}`}>
                <AlertCircle className={`w-4 h-4 ${overdueCount > 0 ? "text-red-600" : "text-slate-400"}`} />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overdue</p>
            </div>
            <p className={`text-2xl font-bold font-display ${overdueCount > 0 ? "text-red-600" : "text-ink"}`}>
              {overdueCount} invoice{overdueCount !== 1 ? "s" : ""}
            </p>
          </Card>
        </div>
      )}

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">
            You have <strong>{overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}</strong>. Please contact our team at{" "}
            <a href="mailto:accounts@solbusiness.com.au" className="font-semibold underline">accounts@solbusiness.com.au</a> to arrange payment.
          </p>
        </div>
      )}

      {/* Invoice list */}
      <InvoiceHistory userId={user?.id} invoices={invoices} loading={loading} />
    </div>
  );
}