import React, { useState } from "react";
import { ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";

export default function PaymentGateway({ coursePrice, courseTitle, courseId, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);

  const startStripeCheckout = async () => {
    if (!courseId) {
      toast.error("Course is missing from checkout.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/payments/checkout", { course_id: courseId });
      const data = response.data?.data || {};

      if (data.free) {
        toast.success("Enrollment confirmed.");
        onPaymentSuccess?.({ free: true, enrollmentId: data.enrollment?._id || data.enrollment?.id });
        return;
      }

      if (!data.url) throw new Error("Stripe checkout URL was not returned.");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to start Stripe checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start gap-3 text-sm text-slate-700 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <span>Card details are entered only on Stripe's secure checkout. SOL Training Academy does not collect or store card numbers or CVV.</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-ink">{courseTitle}</p>
        <p className="text-2xl font-display font-bold text-harvest">A${Number(coursePrice || 0).toFixed(2)}</p>
      </div>

      <Button
        onClick={startStripeCheckout}
        disabled={loading}
        className="w-full bg-harvest hover:bg-harvest/90 text-white font-bold py-3 rounded-lg gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Opening Stripe Checkout...
          </>
        ) : (
          <>
            Continue to Secure Checkout
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Payment and entitlement are confirmed by Stripe webhook/server verification.</span>
      </div>
    </Card>
  );
}