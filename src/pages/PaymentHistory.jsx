import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, FileText, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { toast } from "sonner";

export default function PaymentHistory() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          toast.error("Please log in to view your payment history");
          return;
        }
        setUser(currentUser);

        // Fetch all course payments for the current user
        const paymentData = await base44.entities.CoursePayment.filter(
          { user_id: currentUser.id },
          "-created_date"
        );
        setPayments(paymentData || []);
      } catch (error) {
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusConfig = {
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
    processing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
    completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Failed" },
    refunded: { icon: XCircle, color: "text-slate-600", bg: "bg-slate-50", label: "Refunded" },
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === "all") return true;
    return payment.payment_status === filter;
  });

  const handleDownloadReceipt = async (payment) => {
    if (payment.receipt_sent && payment.transaction_id) {
      // Generate receipt (in a real app, this would fetch from backend)
      toast.success("Receipt download started");
    } else {
      toast.error("Receipt not available for this transaction");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-ink font-semibold">Authentication Required</p>
            <p className="text-slate-600 text-sm mt-2">Please log in to view your payment history.</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-4xl text-ink mb-2">Payment History</h1>
            <p className="text-slate-600">View and download receipts for all your course purchases</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-slate-600 text-sm">Total Transactions</p>
              <p className="font-display font-bold text-2xl text-ink mt-1">{payments.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">Completed</p>
              <p className="font-display font-bold text-2xl text-green-600 mt-1">
                {payments.filter((p) => p.payment_status === "completed").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">Processing</p>
              <p className="font-display font-bold text-2xl text-blue-600 mt-1">
                {payments.filter((p) => p.payment_status === "processing").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">Total Spent</p>
              <p className="font-display font-bold text-2xl text-harvest mt-1">
                A${payments
                  .filter((p) => p.payment_status === "completed")
                  .reduce((sum, p) => sum + (p.amount_paid || 0), 0)
                  .toFixed(2)}
              </p>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "completed", "processing", "pending", "failed", "refunded"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize whitespace-nowrap"
              >
                {status === "all" ? "All Transactions" : status}
              </Button>
            ))}
          </div>

          {/* Payments List */}
          {filteredPayments.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold">No payments found</p>
              <p className="text-slate-500 text-sm mt-1">
                {filter === "all" ? "You haven't made any course purchases yet." : `No ${filter} payments found.`}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const statusInfo = statusConfig[payment.payment_status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={payment.id}
                    className={`p-6 border-2 ${statusInfo.bg} transition-all hover:shadow-md`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Course Info */}
                      <div className="md:col-span-2">
                        <p className="font-semibold text-ink">{payment.course_title}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Transaction ID: <span className="font-mono text-xs">{payment.transaction_id || "N/A"}</span>
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(payment.created_date).toLocaleDateString("en-AU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-center">
                        <p className="text-slate-600 text-sm">Amount</p>
                        <p className="font-display font-bold text-lg text-ink">
                          A${(payment.amount_paid || payment.course_price).toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          <span className={`font-semibold text-sm ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        {payment.payment_method && (
                          <p className="text-xs text-slate-600 mt-2 capitalize">
                            via {payment.payment_method.replace("_", " ")}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant={payment.receipt_sent ? "default" : "outline"}
                          onClick={() => handleDownloadReceipt(payment)}
                          disabled={!payment.receipt_sent}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Receipt</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}