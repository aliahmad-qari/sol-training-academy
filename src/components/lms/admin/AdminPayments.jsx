import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, DollarSign, RefreshCw, Download, Search, Send, Loader2, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_STYLES = {
  completed:  "bg-green-100 text-green-700",
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  failed:     "bg-gray-100 text-gray-600",
  refunded:   "bg-rose-100 text-rose-700",
};

const METHOD_LABELS = {
  stripe: "Stripe", paypal: "PayPal", eway: "eWAY",
  bank_transfer: "Bank Transfer", apple_pay: "Apple Pay", google_pay: "Google Pay",
};

export default function AdminPayments({ enrollments, courses }) {
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [sendingId, setSendingId]     = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CoursePayment.list("-created_date", 300);
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResendInvoice = async (payment) => {
    setSendingId(payment.id);
    try {
      const res = await base44.functions.invoke("sendPaymentInvoiceEmail", {
        paymentId: payment.id,
        studentEmailOverride: payment.user_email,
        studentNameOverride: payment.user_name,
      });
      if (res.data?.success) {
        toast.success(`Invoice ${res.data.invoice_number} sent to ${res.data.email_sent_to}`);
        load();
      } else {
        toast.error(res.data?.error || "Failed to send invoice");
      }
    } catch (err) {
      toast.error("Error sending invoice: " + err.message);
    }
    setSendingId(null);
  };

  const exportCSV = () => {
    const rows = [["Invoice", "Student", "Email", "Course", "Amount (AUD)", "GST", "Status", "Method", "Transaction ID", "Date", "Receipt Sent"]];
    payments.forEach(p => {
      const amt = parseFloat(p.amount_paid || p.course_price || 0).toFixed(2);
      const gst = (parseFloat(amt) / 11).toFixed(2);
      rows.push([
        `INV-${(p.transaction_id || p.id).slice(0, 14).toUpperCase()}`,
        p.user_name || "", p.user_email || "",
        p.course_title || "", amt, gst,
        p.payment_status || "", METHOD_LABELS[p.payment_method] || p.payment_method || "",
        p.transaction_id || "", new Date(p.created_date).toLocaleDateString("en-AU"),
        p.receipt_sent ? "Yes" : "No",
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payments.csv"; a.click();
  };

  // Stats
  const completedPayments = payments.filter(p => p.payment_status === "completed");
  const totalRevenue = completedPayments.reduce((s, p) => s + parseFloat(p.amount_paid || p.course_price || 0), 0);
  const pendingAmt   = payments.filter(p => p.payment_status === "pending").reduce((s, p) => s + parseFloat(p.course_price || 0), 0);
  const receiptsSent = payments.filter(p => p.receipt_sent).length;

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchS  = !search || (p.user_name || "").toLowerCase().includes(q) || (p.user_email || "").toLowerCase().includes(q) || (p.course_title || "").toLowerCase().includes(q) || (p.transaction_id || "").toLowerCase().includes(q);
    const matchSt = statusFilter === "all" || p.payment_status === statusFilter;
    return matchS && matchSt;
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display font-semibold text-lg text-ink">Payment Management</h2>
        <p className="text-sm text-slate_mist">Live payment records with automatic PDF invoice generation and delivery.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Revenue (AUD)",  value: `$${totalRevenue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
          { label: "Pending Payments",     value: `$${pendingAmt.toFixed(2)}`,   icon: Clock,      color: "text-amber-600 bg-amber-50" },
          { label: "Total Transactions",   value: payments.length,               icon: CreditCard, color: "text-blue-600 bg-blue-50" },
          { label: "Invoices Sent",        value: receiptsSent,                  icon: CheckCircle,color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-ink leading-none">{s.value}</p>
              <p className="text-[10px] text-slate_mist mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-invoice notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 mb-5">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Automatic PDF Invoices — Active</p>
          <p className="text-xs text-emerald-700 mt-0.5">A professional tax invoice PDF is automatically generated and emailed to students the moment their payment is confirmed. Use "Resend" to re-send any invoice manually.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, course or transaction ID…" className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-border/50 p-1 flex-shrink-0">
          {["all", "completed", "pending", "processing", "failed"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-ink text-white" : "text-slate_mist hover:text-ink"}`}>
              {s}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 flex-shrink-0" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 flex-shrink-0" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Invoice", "Student", "Course", "Amount", "Method", "Status", "Invoice Sent", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-harvest mx-auto" /></td></tr>
              ) : filtered.map(p => {
                const invoiceNum = `INV-${(p.transaction_id || p.id).slice(0, 14).toUpperCase()}`;
                const amt = parseFloat(p.amount_paid || p.course_price || 0).toFixed(2);
                return (
                  <tr key={p.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink whitespace-nowrap">{invoiceNum}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink text-sm">{p.user_name || "—"}</p>
                      <p className="text-xs text-slate_mist">{p.user_email || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink max-w-[160px]"><p className="truncate">{p.course_title || "—"}</p></td>
                    <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">
                      AUD ${amt}
                      <p className="text-[10px] font-normal text-slate_mist">GST: ${(parseFloat(amt) / 11).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">{METHOD_LABELS[p.payment_method] || p.payment_method || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[p.payment_status] || "bg-slate-100 text-slate-600"}`}>
                        {p.payment_status || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.receipt_sent
                        ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold"><CheckCircle className="w-3 h-3" /> Sent</span>
                        : <span className="text-[10px] text-slate-400">Not sent</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                      {new Date(p.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline"
                        disabled={sendingId === p.id || p.payment_status !== "completed"}
                        onClick={() => handleResendInvoice(p)}
                        className="h-7 text-xs gap-1 whitespace-nowrap">
                        {sendingId === p.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Send className="w-3 h-3" />}
                        {p.receipt_sent ? "Resend" : "Send Invoice"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate_mist text-sm">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
          Showing {filtered.length} of {payments.length} payments
        </div>
      </div>
    </div>
  );
}