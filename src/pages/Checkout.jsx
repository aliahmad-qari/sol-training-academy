import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import PaymentGateway from "@/components/payment/PaymentGateway";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(true);

  const courseId = searchParams.get("courseId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (courseId) {
          const allCourses = await base44.entities.Course.list();
          const courseData = allCourses.find(c => c.id === courseId);
          if (courseData) {
            setCourse(courseData);
          } else {
            toast.error("Course not found");
            navigate("/training-courses");
          }
        } else {
          toast.error("No course selected");
          navigate("/training-courses");
        }
      } catch (error) {
        toast.error("Failed to load checkout");
        navigate("/training-courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  const handlePaymentSuccess = (result = {}) => {
    if (result.free) {
      toast.success("Enrollment confirmed.");
      navigate("/student-dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-ink font-semibold">Unable to load checkout</p>
          <Button onClick={() => navigate("/training-courses")} className="mt-4 w-full">
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <button
            onClick={() => navigate("/training-courses")}
            className="flex items-center gap-2 text-harvest hover:text-harvest/80 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-display font-bold text-3xl text-ink mb-2">Complete Your Purchase</h1>
                <p className="text-slate-600">Enroll in {course.title} and get instant access</p>
              </div>

              {/* Payment Method Selector */}
              <Card className="p-6 border-2">
                <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />
              </Card>

              {/* Payment Method Form */}
              <Card className="p-6 border-2">
                {paymentMethod === "stripe" && (
                  <div>
                    <h3 className="font-display font-bold text-ink mb-4">Secure Stripe Checkout</h3>
                    <PaymentGateway
                      coursePrice={course.price}
                      courseTitle={course.title}
                      courseId={courseId}
                      userId={user.id}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                )}
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-32 space-y-4">
                <h3 className="font-display font-bold text-ink">Order Summary</h3>

                <div className="space-y-2">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"}
                    alt={course.title}
                    className="w-full h-40 rounded-lg object-cover"
                  />
                  <p className="font-semibold text-ink">{course.title}</p>
                  <p className="text-xs text-slate-600">{course.level}</p>
                </div>

                <div className="space-y-2 py-4 border-t border-b border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Course Price</span>
                    <span className="text-ink font-semibold">A${course.price?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">GST (10%)</span>
                    <span className="text-ink font-semibold">A${((course.price * 0.1) || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-ink">Total</span>
                  <span className="font-display font-bold text-2xl text-harvest">
                    A${((course.price * 1.1) || 0).toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <p>✓ Instant course access</p>
                  <p>✓ Download resources</p>
                  <p>✓ Complete modules</p>
                  <p>✓ Earn certificates</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}