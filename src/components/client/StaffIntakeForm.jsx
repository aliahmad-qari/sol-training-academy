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
  ChevronRight, ChevronLeft, Loader2, Briefcase, Shield, FileText
} from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  "Support Worker", "Support Coordinator", "Plan Manager",
  "Behaviour Support Practitioner", "Occupational Therapist",
  "Speech Pathologist", "Physiotherapist", "Registered Nurse",
  "Team Leader", "Service Manager", "Admin / Office Staff", "Other",
];

const QUALIFICATIONS = [
  "Certificate III in Individual Support",
  "Certificate IV in Disability",
  "Diploma of Community Services",
  "Bachelor of Social Work",
  "Bachelor of Nursing",
  "Allied Health Degree",
  "First Aid Certificate",
  "No formal qualification (experience-based)",
];

const AVAILABILITY = ["Full-time", "Part-time", "Casual / On-call", "Weekdays only", "Weekends", "Overnight / Sleepover"];

const STEPS = [
  { id: 1, label: "Personal Details",  icon: User },
  { id: 2, label: "Role & Skills",     icon: Briefcase },
  { id: 3, label: "Compliance",        icon: Shield },
  { id: 4, label: "Review & Submit",   icon: CheckCircle2 },
];

export default function StaffIntakeForm({ onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    date_of_birth: "",
    role_applying_for: "",
    years_experience: "",
    qualifications: [],
    availability: [],
    has_drivers_license: "",
    has_own_vehicle: "",
    ndis_worker_screening: "",
    police_check: "",
    working_with_children: "",
    covid_vaccinated: "",
    cover_letter: "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggle = (field, val) => set(field, form[field].includes(val)
    ? form[field].filter(v => v !== val)
    : [...form[field], val]
  );

  const canProceed = () => {
    if (step === 1) return form.full_name.trim() && form.email.trim() && form.phone.trim();
    if (step === 2) return form.role_applying_for && form.availability.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Enquiry.create({
        service_type: "ndis_registration",
        intake_type: "staff",
        status: "new",
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        date_of_birth: form.date_of_birth,
        message: `STAFF INTAKE\nRole: ${form.role_applying_for}\nExperience: ${form.years_experience} years\nQualifications: ${form.qualifications.join(", ")}\nAvailability: ${form.availability.join(", ")}\nDrivers License: ${form.has_drivers_license}\nOwn Vehicle: ${form.has_own_vehicle}\nNDIS Screening: ${form.ndis_worker_screening}\nPolice Check: ${form.police_check}\nWWC: ${form.working_with_children}\nCOVID Vacc: ${form.covid_vaccinated}\nCover Letter: ${form.cover_letter}`,
        role_applying_for: form.role_applying_for,
        years_experience: form.years_experience,
        qualifications: form.qualifications,
        availability: form.availability,
      });

      base44.integrations.Core.SendEmail({
        to: "info@solbusinessconsultant.com.au",
        subject: `New Staff Intake — ${form.full_name} (${form.role_applying_for})`,
        body: `A new staff intake form has been submitted.\n\nName: ${form.full_name}\nEmail: ${form.email}\nPhone: ${form.phone}\nRole: ${form.role_applying_for}\nExperience: ${form.years_experience} years\nQualifications: ${form.qualifications.join(", ")}\nAvailability: ${form.availability.join(", ")}\nNDIS Screening: ${form.ndis_worker_screening}\nPolice Check: ${form.police_check}\nCover Letter:\n${form.cover_letter}`,
      }).catch(() => {});

      toast.success("Application submitted! Our team will review your details.");
      onSuccess?.();
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const YesNoField = ({ label, field }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-2">
        {["Yes", "No", "In Progress"].map(opt => (
          <button key={opt} type="button" onClick={() => set(field, opt)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm border font-medium transition-all text-center ${
              form[field] === opt
                ? "bg-harvest text-white border-harvest shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-harvest/40"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

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

        {/* Step 1 — Personal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Personal Details</h2>
              <p className="text-slate-500 text-sm mt-1">Your contact information for our records.</p>
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
                <Input type="date" className="mt-1" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Home Suburb / City</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Sydney NSW 2000" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Role & Skills */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Role & Skills</h2>
              <p className="text-slate-500 text-sm mt-1">Tell us about the role you're applying for and your background.</p>
            </div>
            <div>
              <Label className="mb-2 block">Role Applying For *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={() => set("role_applying_for", r)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                      form.role_applying_for === r
                        ? "bg-harvest text-white border-harvest shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-harvest/40"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Years of Experience in Disability / NDIS Sector</Label>
              <Input type="number" min="0" className="mt-1 max-w-xs" value={form.years_experience}
                onChange={e => set("years_experience", e.target.value)} placeholder="e.g. 3" />
            </div>
            <div>
              <Label className="mb-2 block">Qualifications <span className="text-slate-400 font-normal">(select all that apply)</span></Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUALIFICATIONS.map(q => (
                  <button key={q} type="button" onClick={() => toggle("qualifications", q)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border transition-all text-left ${
                      form.qualifications.includes(q)
                        ? "bg-harvest/10 text-harvest border-harvest/30 font-medium"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      form.qualifications.includes(q) ? "bg-harvest border-harvest" : "border-slate-300"
                    }`}>
                      {form.qualifications.includes(q) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Availability * <span className="text-slate-400 font-normal">(select all that apply)</span></Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY.map(a => (
                  <button key={a} type="button" onClick={() => toggle("availability", a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.availability.includes(a)
                        ? "bg-harvest text-white border-harvest"
                        : "bg-white text-slate-600 border-slate-200 hover:border-harvest/40"
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <YesNoField label="Driver's Licence?" field="has_drivers_license" />
              <YesNoField label="Own Vehicle?" field="has_own_vehicle" />
            </div>
          </div>
        )}

        {/* Step 3 — Compliance */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Compliance Checks</h2>
              <p className="text-slate-500 text-sm mt-1">NDIS worker compliance requirements.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ NDIS Compliance Required</p>
              <p className="text-xs text-amber-600">All workers must hold a valid NDIS Worker Screening Check before commencing work with NDIS participants.</p>
            </div>
            <div className="space-y-4">
              <YesNoField label="NDIS Worker Screening Check?" field="ndis_worker_screening" />
              <YesNoField label="National Police Check (within 3 years)?" field="police_check" />
              <YesNoField label="Working With Children Check?" field="working_with_children" />
              <YesNoField label="COVID-19 Vaccination?" field="covid_vaccinated" />
            </div>
            <div>
              <Label className="mb-1 block">Cover Letter / Why do you want to work with us?</Label>
              <Textarea rows={4} className="resize-none" value={form.cover_letter}
                onChange={e => set("cover_letter", e.target.value)}
                placeholder="Tell us why you're passionate about the disability sector and what you'd bring to the team…" />
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Review & Submit</h2>
              <p className="text-slate-500 text-sm mt-1">Please check your application before submitting.</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200 text-sm">
              {[
                ["Name",            form.full_name],
                ["Email",           form.email],
                ["Phone",           form.phone],
                ["Location",        form.address],
                ["Role",            form.role_applying_for],
                ["Experience",      form.years_experience ? form.years_experience + " years" : ""],
                ["Availability",    form.availability.join(", ")],
                ["NDIS Screening",  form.ndis_worker_screening],
                ["Police Check",    form.police_check],
                ["WWC Check",       form.working_with_children],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-slate-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-ink text-right">{v}</span>
                </div>
              ))}
            </div>
            {form.qualifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.qualifications.map(q => (
                  <span key={q} className="text-xs bg-harvest/10 text-harvest border border-harvest/20 px-2.5 py-1 rounded-full font-medium">{q}</span>
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
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="w-4 h-4" /> Submit Application</>}
          </Button>
        )}
      </div>
    </div>
  );
}