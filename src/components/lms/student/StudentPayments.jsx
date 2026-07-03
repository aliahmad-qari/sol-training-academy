import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Download, CheckCircle, Clock, XCircle, Receipt } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Paid" },
  pending:   { color: "bg-amber-100 text-amber-700",    icon: Clock,        label: "Pending" },
  failed:    { color: "bg-red-100 text-red-700",        icon: XCircle,      label: "Failed" },
  refunded:  { color: "bg-slate-100 text-slate-600",    icon: Receipt,      label: "Refunded" },
};

export default function StudentPayments({ user }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.CoursePayment.filter({ user_id: user.id }, "-created_date").then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, [user?.id]);

  const totalSpent = payments
    .filter(p => p.payment_status === "completed")
    .reduce((s, p) => s + (p.amount_paid || p.course_price || 0), 0);

  if (loading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">Loading payment history…</div>;
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total Payments",   value: payments.length,                                            color: "text-harvest bg-harvest/10 border-harvest/20",   icon: CreditCard },
          { label: "Completed",        value: payments.filter(p => p.payment_status === "completed").length, color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle },
          { label: "Total Spent",      value: `$${totalSpent.toFixed(2)} AUD`,                            color: "text-blue-600 bg-blue-50 border-blue-100",        icon: Receipt },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${s.color.split(" ").slice(2).join(" ")}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color.split(" ").slice(0, 2).join(" ")}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-[#0d2348]">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-semibold text-[#0d2348]">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No payment records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Course", "Amount", "Method", "Status", "Date", "Receipt"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const sc = STATUS_CONFIG[p.payment_status] || STATUS_CONFIG.pending;
                  const Icon = sc.icon;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#0d2348] text-sm">{p.course_title || "—"}</p>
                        {p.transaction_id && <p className="text-[10px] text-slate-400">Ref: {p.transaction_id.slice(0, 12)}…</p>}
                      </td>
                      <td className="px-5 py-3 font-bold text-[#0d2348]">
                        ${(p.amount_paid || p.course_price || 0).toFixed(2)}
                        <span className="text-xs font-normal text-slate-400 ml-1">AUD</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs capitalize text-slate-500">{p.payment_method?.replace(/_/g, " ") || "—"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>
                          <Icon className="w-3 h-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {p.created_date ? new Date(p.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {p.payment_status === "completed" ? (
                          <button
                            onClick={() => {
                              const content = `PAYMENT RECEIPT\n\nCourse: ${p.course_title}\nAmount: $${(p.amount_paid || p.course_price || 0).toFixed(2)} AUD\nMethod: ${p.payment_method || "—"}\nDate: ${p.created_date ? new Date(p.created_date).toLocaleDateString("en-AU") : "—"}\nRef: ${p.transaction_id || p.id}`;
                              const blob = new Blob([content], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url; a.download = `receipt-${p.id?.slice(0,8)}.txt`; a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-1 text-xs text-harvest hover:text-harvest/80 font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Receipt
                          </button>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}