import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId) throw new Error("Missing Stripe checkout session. Payment has not been verified.");
        const res = await apiClient.post("/payments/verify", { session_id: sessionId });
        const data = res.data?.data || {};
        if (data.payment_status !== "completed" || !data.enrollment_created) {
          throw new Error("Stripe has not confirmed this payment and course access yet.");
        }
        setPayment(data.payment || null);
        setVerified(true);

        if (data.payment?.course_id) {
          const courseRecord = await base44.entities.Course.get(data.payment.course_id).catch(() => null);
          if (courseRecord) setCourse(courseRecord);
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to verify payment.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
          Verifying payment...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            {verified ? (
              <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="font-display font-bold text-3xl text-ink mb-2">
              {verified ? "Payment Verified" : "Payment Not Verified"}
            </h1>
            <p className="text-slate-600">
              {verified
                ? "Your course access has been confirmed by the server."
                : error || "We could not confirm this payment."}
            </p>
          </div>

          <Card className="p-8 space-y-6 mb-6">
            <div className="space-y-4">
              <h2 className="font-display font-bold text-ink">Confirmation Details</h2>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Stripe Session</p>
                  <p className="font-mono text-xs text-ink mt-1 break-all">{sessionId || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Status</p>
                  <p className={`font-semibold mt-1 ${verified ? "text-emerald-600" : "text-red-600"}`}>
                    {verified ? "Completed" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>

            {course && (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h2 className="font-display font-bold text-ink">Enrolled Course</h2>
                <div className="flex gap-4">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop"}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-ink">{course.title}</p>
                    <p className="text-sm text-slate-600 mt-1">Level: {course.level}</p>
                    <p className="text-sm text-slate-600">Topics: {course.total_topics || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {verified && (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h2 className="font-display font-bold text-ink">What's Next?</h2>
                <ul className="space-y-3">
                  {["Access your dashboard", "View course modules", "Earn your certificate"].map((label, index) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-harvest/20 text-harvest font-bold text-sm flex items-center justify-center">{index + 1}</span>
                      <p className="font-semibold text-ink">{label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate(verified ? "/student-dashboard" : "/training-courses")}
              className="bg-harvest hover:bg-harvest/90 text-white font-bold py-3 gap-2"
            >
              {verified ? "Go to Dashboard" : "Back to Courses"}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={!verified}
              className="font-bold py-3 gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}