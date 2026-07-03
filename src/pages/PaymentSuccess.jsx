import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get("transactionId");
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseData = await base44.entities.Course.filter({ id: courseId });
        if (courseData.length > 0) {
          setCourse(courseData[0]);
        }

        // Fetch payment record
        const paymentData = await base44.entities.CoursePayment.filter({
          transaction_id: transactionId,
        });
        if (paymentData.length > 0) {
          setPayment(paymentData[0]);
        }
      } catch (error) {
        toast.error("Failed to load confirmation details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transactionId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto mb-4 animate-bounce" />
            <h1 className="font-display font-bold text-3xl text-ink mb-2">Payment Successful!</h1>
            <p className="text-slate-600">Your enrollment has been confirmed. Course access is now active.</p>
          </div>

          <Card className="p-8 space-y-6 mb-6">
            {/* Confirmation Details */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-ink">Confirmation Details</h2>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Transaction ID</p>
                  <p className="font-mono text-sm text-ink mt-1">{transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Status</p>
                  <p className="font-semibold text-emerald-600 mt-1">Completed</p>
                </div>
              </div>
            </div>

            {/* Course Details */}
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

            {/* What's Next */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h2 className="font-display font-bold text-ink">What's Next?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-harvest/20 text-harvest font-bold text-sm flex items-center justify-center">1</span>
                  <div>
                    <p className="font-semibold text-ink">Access your dashboard</p>
                    <p className="text-sm text-slate-600">Go to your student dashboard to start learning</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-harvest/20 text-harvest font-bold text-sm flex items-center justify-center">2</span>
                  <div>
                    <p className="font-semibold text-ink">View course modules</p>
                    <p className="text-sm text-slate-600">Explore lessons, videos, and assessments</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-harvest/20 text-harvest font-bold text-sm flex items-center justify-center">3</span>
                  <div>
                    <p className="font-semibold text-ink">Earn your certificate</p>
                    <p className="text-sm text-slate-600">Complete the course and pass assessments</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Email Confirmation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Confirmation email sent:</strong> Check your email for your receipt and course access details.
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/student-dashboard")}
              className="bg-harvest hover:bg-harvest/90 text-white font-bold py-3 gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
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