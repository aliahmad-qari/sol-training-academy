import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Building2, User, Phone, Mail, MapPin,
  Hash, ChevronRight, ChevronLeft, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const NDIS_SERVICES = [
  "Daily Activities",
  "Community Participation",
  "Supported Independent Living",
  "Support Coordination",
  "Plan Management",
  "Therapeutic Supports",
  "Early Childhood",
  "Specialised Disability Accommodation",
  "Assistive Technology",
  "Home Modifications",
];

const PROVIDER_FOCUS_OPTIONS = [
  { value: "disability_support", label: "Disability Support" },
  { value: "allied_health", label: "Allied Health" },
  { value: "community_services", label: "Community Services" },
  { value: "accommodation", label: "Accommodation & SIL" },
  { value: "plan_management", label: "Plan Management" },
  { value: "other", label: "Other" },
];

const STEPS = [
  { id: 1, label: "Your Details",     icon: User },
  { id: 2, label: "Business Info",    icon: Building2 },
  { id: 3, label: "NDIS Services",    icon: CheckCircle2 },
  { id: 4, label: "Additional Info",  icon: AlertCircle },
];

export default function NDISOnboardingForm({ onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    company_name: "",
    abn: "",
    address: "",
    company_email: "",
    company_phone: "",
    provider_focus: "",
    selected_services: [],
    participant_volume: "",
    message: "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleService = (svc) => {
    set("selected_services", form.selected_services.includes(svc)
      ? form.selected_services.filter(s => s !== svc)
      : [...form.selected_services, svc]
    );
  };

  const canProceed = () => {
    if (step === 1) return form.full_name.trim() && form.email.trim() && form.phone.trim();
    if (step === 2) return form.company_name.trim() && form.abn.trim();
    if (step === 3) return form.selected_services.length > 0 && form.provider_focus;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Enquiry.create({
        service_type: "ndis_registration",
        status: "new",
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        company_name: form.company_name,
        abn: form.abn,
        address: form.address,
        company_email: form.company_email || form.email,
        company_phone: form.company_phone || form.phone,
        provider_focus: form.provider_focus,
        selected_services: form.selected_services,
        participant_volume: form.participant_volume ? Number(form.participant_volume) : undefined,
        message: form.message,
      });
      toast.success("Enquiry submitted! Our team will be in touch shortly.");
      onSuccess?.();
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold text-sm ${
                  done   ? "bg-emerald-500 text-white" :
                  active ? "bg-harvest text-white shadow-lg shadow-harvest/30" :
                           "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <p className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${
                  active ? "text-harvest" : done ? "text-emerald-600" : "text-slate-400"
                }`}>{s.label}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 transition-colors ${
                  step > s.id ? "bg-emerald-400" : "bg-slate-200"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="p-6 shadow-sm">

        {/* Step 1 — Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Your Contact Details</h2>
              <p className="text-slate-500 text-sm mt-1">We'll use these to keep you updated throughout the process.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="full_name" className="pl-9" value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Smith" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="email" type="email" className="pl-9" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Mobile / Phone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="phone" className="pl-9" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="04xx xxx xxx" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Business Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Business Information</h2>
              <p className="text-slate-500 text-sm mt-1">Tell us about the organisation seeking NDIS registration.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="company_name">Organisation Name *</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="company_name" className="pl-9" value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="ABC Disability Services" />
                </div>
              </div>
              <div>
                <Label htmlFor="abn">ABN *</Label>
                <div className="relative mt-1">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="abn" className="pl-9" value={form.abn} onChange={e => set("abn", e.target.value)} placeholder="XX XXX XXX XXX" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="address" className="pl-9" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, Sydney NSW 2000" />
                </div>
              </div>
              <div>
                <Label htmlFor="company_email">Business Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="company_email" type="email" className="pl-9" value={form.company_email} onChange={e => set("company_email", e.target.value)} placeholder="info@example.com.au" />
                </div>
              </div>
              <div>
                <Label htmlFor="company_phone">Business Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input id="company_phone" className="pl-9" value={form.company_phone} onChange={e => set("company_phone", e.target.value)} placeholder="02 XXXX XXXX" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — NDIS Services */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">NDIS Services</h2>
              <p className="text-slate-500 text-sm mt-1">Select all services your organisation intends to provide.</p>
            </div>
            <div>
              <Label className="mb-2 block">Provider Focus *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROVIDER_FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("provider_focus", opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${
                      form.provider_focus === opt.value
                        ? "bg-harvest text-white border-harvest shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-harvest/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Services to Register *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NDIS_SERVICES.map(svc => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border transition-all text-left ${
                      form.selected_services.includes(svc)
                        ? "bg-harvest/10 text-harvest border-harvest/30 font-medium"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      form.selected_services.includes(svc) ? "bg-harvest border-harvest" : "border-slate-300"
                    }`}>
                      {form.selected_services.includes(svc) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    {svc}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-w-xs">
              <Label htmlFor="participant_volume">Estimated Number of Participants</Label>
              <Input id="participant_volume" type="number" min="0" className="mt-1" value={form.participant_volume}
                onChange={e => set("participant_volume", e.target.value)} placeholder="e.g. 20" />
            </div>
          </div>
        )}

        {/* Step 4 — Additional Info */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Additional Information</h2>
              <p className="text-slate-500 text-sm mt-1">Any other details that will help us prepare your registration.</p>
            </div>
            <div>
              <Label htmlFor="message">Notes / Questions</Label>
              <Textarea
                id="message"
                className="mt-1 h-32 resize-none"
                value={form.message}
                onChange={e => set("message", e.target.value)}
                placeholder="E.g. current registrations held, specific compliance concerns, timeframe requirements…"
              />
            </div>
            {/* Summary preview */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Submission Summary</p>
              {[
                ["Name",          form.full_name],
                ["Email",         form.email],
                ["Organisation",  form.company_name],
                ["ABN",           form.abn],
                ["Provider Focus",form.provider_focus?.replace(/_/g, " ")],
                ["Services",      form.selected_services.length + " selected"],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between text-sm gap-4">
                  <span className="text-slate-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-ink text-right capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        ) : <div />}

        {step < STEPS.length ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="bg-harvest hover:bg-harvest/90 text-white gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="w-4 h-4" /> Submit Enquiry</>}
          </Button>
        )}
      </div>
    </div>
  );
}