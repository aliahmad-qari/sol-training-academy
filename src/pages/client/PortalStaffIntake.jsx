import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StaffIntakeForm from "@/components/client/StaffIntakeForm";

export default function PortalStaffIntake() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink">Application Received!</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Thank you for submitting your staff application. Our HR team will review your details and be in touch within 3–5 business days.
        </p>
        <Card className="p-5 bg-blue-50 border-blue-200 text-left space-y-1.5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Next Steps</p>
          <p className="text-sm text-blue-800">1. HR reviews your application and compliance checks</p>
          <p className="text-sm text-blue-800">2. We'll reach out to schedule an interview if suitable</p>
          <p className="text-sm text-blue-800">3. Complete remaining compliance requirements to commence</p>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/client-portal")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/client-portal/documents")} className="bg-harvest text-white hover:bg-harvest/90">
            Upload Compliance Docs
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
          <h1 className="font-display font-bold text-2xl text-ink">Staff / Worker Intake</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete this form to apply to join our team as an NDIS support worker or allied health professional.
          </p>
        </div>
      </div>
      <StaffIntakeForm onSuccess={() => setSubmitted(true)} />
    </div>
  );
}