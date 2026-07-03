import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClientIntakeForm from "@/components/client/ClientIntakeForm";

export default function PortalClientIntake() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink">Intake Submitted!</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Thank you for completing the client intake. Our support coordination team will review your information and contact you within 1–2 business days.
        </p>
        <Card className="p-5 bg-amber-50 border-amber-200 text-left space-y-1.5">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">What happens next?</p>
          <p className="text-sm text-amber-800">1. Our team reviews your support needs</p>
          <p className="text-sm text-amber-800">2. We'll contact you to schedule an initial consultation</p>
          <p className="text-sm text-amber-800">3. We help connect you with the right supports and services</p>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/client-portal")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/client-portal/booking")} className="bg-harvest text-white hover:bg-harvest/90">
            Book a Consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/client-portal/onboarding" className="text-xs text-slate-400 hover:text-harvest transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">NDIS Client Intake</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete this form to register as an NDIS client and connect with our support services.
          </p>
        </div>
      </div>
      <ClientIntakeForm onSuccess={() => setSubmitted(true)} />
    </div>
  );
}