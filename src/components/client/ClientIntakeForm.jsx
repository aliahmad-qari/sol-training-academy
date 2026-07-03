import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, User, Phone, Mail, MapPin,
  ChevronRight, ChevronLeft, Loader2, Heart, Calendar, FileText
} from "lucide-react";
import { toast } from "sonner";

const SUPPORT_TYPES = [
  "Daily Activities & Personal Care",
  "Community Participation",
  "Supported Independent Living (SIL)",
  "Support Coordination",
  "Plan Management",
  "Therapeutic Supports",
  "Early Childhood Intervention",
  "Assistive Technology",
  "Home Modifications",
  "Specialised Disability Accommodation (SDA)",
];

const STEPS = [
  { id: 1, label: "Personal Details",  icon: User },
  { id: 2, label: "Support Needs",     icon: Heart },
  { id: 3, label: "NDIS Details",      icon: FileText },
  { id: 4, label: "Review & Submit",   icon: CheckCircle2 },
];

export default function ClientIntakeForm({ onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    date_of_birth: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    ndis_number: "",
    plan_start_date: "",
    plan_end_date: "",
    plan_managed_by: "",
    selected_supports: [],
    primary_disability: "",
    current_supports: "",
    goals: "",
    notes: "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSupport = (svc) => {
    set("selected_supports", form.selected_supports.includes(svc)
      ? form.selected_supports.filter(s => s !== svc)
      : [...form.selected_supports, svc]
    );
  };

  const canProceed = () => {
    if (step === 1) return form.full_name.trim() && form.email.trim() && form.phone.trim();
    if (step === 2) return form.selected_supports.length > 0 && form.primary_disability.trim();
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Enquiry.create({
        service_type: "ndis_registration",
        intake_type: "client",
        status: "new",
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        date_of_birth: form.date_of_birth,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        ndis_number: form.ndis_number,
        plan_start_date: form.plan_start_date,
        plan_end_date: form.plan_end_date,
        plan_managed_by: form.plan_managed_by,
        selected_services: form.selected_supports,
        primary_disability: form.primary_disability,
        current_supports: form.current_supports,
        goals: form.goals,
        message: form.notes,
      });

      base44.integrations.Core.SendEmail({
        to: "info@solbusinessconsultant.com.au",
        subject: `New NDIS Client Intake — ${form.full_name}`,
        body: `A new NDIS client intake has been submitted.\n\nName: ${form.full_name}\nEmail: ${form.email}\nPhone: ${form.phone}\nNDIS Number: ${form.ndis_number || "Not provided"}\nPrimary Disability: ${form.primary_disability}\nSupports Requested: ${form.selected_supports.join(", ")}\nGoals: ${form.goals || "—"}\nNotes: ${form.notes || "—"}`,
      }).catch(() => {});

      toast.success("Intake submitted! Our team will be in touch soon.");
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
                  done ? "bg-emerald-500 text-white" :
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
                <div className={`flex-1 h-0.5 mb-5 mx-1 transition-colors ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="p-6 shadow-sm">

        {/* Step 1 — Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Personal Details</h2>
              <p className="text-slate-500 text-sm mt-1">Your contact information and emergency contact.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Smith" />
                </div>
              </div>
              <div>
                <Label>Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input type="email" className="pl-9" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>
              <div>
                <Label>Phone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="04xx xxx xxx" />
                </div>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input type="date" className="pl-9" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label>Home Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, Sydney NSW 2000" />
                </div>
              </div>
              <div>
                <Label>Emergency Contact Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.emergency_contact_name} onChange={e => set("emergency_contact_name", e.target.value)} placeholder="John Smith" />
                </div>
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.emergency_contact_phone} onChange={e => set("emergency_contact_phone", e.target.value)} placeholder="04xx xxx xxx" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Support Needs */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Support Needs</h2>
              <p className="text-slate-500 text-sm mt-1">Tell us about the supports you're looking for.</p>
            </div>
            <div>
              <Label className="mb-2 block">Primary Disability / Condition *</Label>
              <Input value={form.primary_disability} onChange={e => set("primary_disability", e.target.value)} placeholder="e.g. Autism Spectrum Disorder, Cerebral Palsy, Acquired Brain Injury…" />
            </div>
            <div>
              <Label className="mb-2 block">Supports You Need * <span className="text-slate-400 font-normal">(select all that apply)</span></Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUPPORT_TYPES.map(svc => (
                  <button key={svc} type="button" onClick={() => toggleSupport(svc)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border transition-all text-left ${
                      form.selected_supports.includes(svc)
                        ? "bg-harvest/10 text-harvest border-harvest/30 font-medium"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      form.selected_supports.includes(svc) ? "bg-harvest border-harvest" : "border-slate-300"
                    }`}>
                      {form.selected_supports.includes(svc) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    {svc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Current Supports (if any)</Label>
              <Textarea value={form.current_supports} onChange={e => set("current_supports", e.target.value)} rows={2}
                placeholder="Describe any existing supports or providers you currently work with…" />
            </div>
            <div>
              <Label className="mb-1 block">Your Goals</Label>
              <Textarea value={form.goals} onChange={e => set("goals", e.target.value)} rows={3}
                placeholder="What do you hope to achieve through NDIS supports? (e.g. more independence, community involvement, employment…)" />
            </div>
          </div>
        )}

        {/* Step 3 — NDIS Plan Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">NDIS Plan Details</h2>
              <p className="text-slate-500 text-sm mt-1">Share your NDIS plan information if you already have one.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Don't have an NDIS plan yet?</p>
              <p className="text-xs text-blue-600">That's okay — leave these fields blank. We can help you with the access request process.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>NDIS Number (if applicable)</Label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.ndis_number} onChange={e => set("ndis_number", e.target.value)} placeholder="43XXXXXXX" />
                </div>
              </div>
              <div>
                <Label>Plan Start Date</Label>
                <Input type="date" className="mt-1" value={form.plan_start_date} onChange={e => set("plan_start_date", e.target.value)} />
              </div>
              <div>
                <Label>Plan End Date</Label>
                <Input type="date" className="mt-1" value={form.plan_end_date} onChange={e => set("plan_end_date", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>How is your plan managed?</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["NDIA Managed", "Plan Managed", "Self Managed"].map(opt => (
                    <button key={opt} type="button" onClick={() => set("plan_managed_by", opt)}
                      className={`py-2 px-3 rounded-lg text-sm border font-medium transition-all text-center ${
                        form.plan_managed_by === opt
                          ? "bg-harvest text-white border-harvest shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-harvest/40"
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label>Additional Notes</Label>
                <Textarea className="mt-1 resize-none" rows={3} value={form.notes} onChange={e => set("notes", e.target.value)}
                  placeholder="Any other information you'd like us to know before we get in touch…" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Review & Submit</h2>
              <p className="text-slate-500 text-sm mt-1">Please check your details before submitting.</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200 text-sm">
              {[
                ["Name",          form.full_name],
                ["Email",         form.email],
                ["Phone",         form.phone],
                ["Address",       form.address],
                ["NDIS Number",   form.ndis_number || "Not provided"],
                ["Disability",    form.primary_disability],
                ["Plan Managed",  form.plan_managed_by || "Not specified"],
                ["Supports",      form.selected_supports.length + " selected"],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-slate-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-ink text-right">{v}</span>
                </div>
              ))}
            </div>
            {form.selected_supports.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.selected_supports.map(s => (
                  <span key={s} className="text-xs bg-harvest/10 text-harvest border border-harvest/20 px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}
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
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="bg-harvest hover:bg-harvest/90 text-white gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="w-4 h-4" /> Submit Intake</>}
          </Button>
        )}
      </div>
    </div>
  );
}