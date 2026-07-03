import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, ArrowRight, Shield, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const COMPLAINT_TYPES = [
  { value: "service_quality", label: "Service Quality" },
  { value: "communication", label: "Communication Issues" },
  { value: "billing", label: "Billing or Payment" },
  { value: "ndis_practice_standards", label: "NDIS Practice Standards" },
  { value: "staff_conduct", label: "Staff Conduct" },
  { value: "other", label: "Other" },
];

export default function ComplaintsFeedback() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    complaint_type: "", description: "", desired_outcome: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const record = await base44.entities.Complaint.create({
      ...form,
      acknowledged: false,
      status: "received",
    });

    // Send acknowledgement email to complainant
    base44.integrations.Core.SendEmail({
      to: form.email,
      subject: "Complaint Received — SOL Business Consultant (Reference: " + record.id.slice(-6).toUpperCase() + ")",
      body: `Dear ${form.full_name},\n\nThank you for taking the time to submit your complaint. We take all feedback seriously and are committed to resolving this promptly.\n\n📋 YOUR COMPLAINT REFERENCE: ${record.id.slice(-6).toUpperCase()}\n\nComplaint Type: ${COMPLAINT_TYPES.find(t => t.value === form.complaint_type)?.label || form.complaint_type}\nDescription: ${form.description}\n\n⏱️ WHAT HAPPENS NEXT:\n  1. We will acknowledge your complaint within 2 business days\n  2. A team member will review your complaint within 5 business days\n  3. We will contact you with a resolution or update within 10 business days\n\nIf you are unsatisfied with our response, you may escalate to:\n  • NDIS Quality and Safeguards Commission: 1800 035 544\n  • Australian Competition & Consumer Commission (ACCC)\n\nFor urgent matters, please call us directly: +61 460 003 494\n\nWarm regards,\nSOL Business Consultant\ninfo@solbusinessconsultant.com.au\nABN: 20 662 022 522`,
    }).catch(() => {});

    // Notify Sol team
    base44.integrations.Core.SendEmail({
      to: "info@solbusinessconsultant.com.au",
      subject: `⚠️ New Complaint Received — ${form.complaint_type} | ${form.full_name}`,
      body: `A new complaint has been submitted.\n\nReference: ${record.id.slice(-6).toUpperCase()}\nName: ${form.full_name}\nEmail: ${form.email}\nPhone: ${form.phone || "—"}\nType: ${form.complaint_type}\n\nDescription:\n${form.description}\n\nDesired Outcome:\n${form.desired_outcome || "Not specified"}\n\nPlease respond within 2 business days.`,
    }).catch(() => {});

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4">
              <Shield className="w-4 h-4" /> NDIS Practice Standards
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">
              Complaints & Feedback
            </h1>
            <p className="text-lg text-slate_mist max-w-2xl mx-auto leading-relaxed">
              As an NDIS service provider, we are committed to a fair and transparent complaints process in accordance with the <strong>NDIS Practice Standards</strong> and the <strong>NDIS Code of Conduct</strong>.
            </p>
          </motion.div>

          {/* Process Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4 mb-10"
          >
            {[
              { icon: Mail, title: "Step 1", desc: "Submit your complaint below or via email", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Clock, title: "Step 2", desc: "We acknowledge within 2 business days", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: CheckCircle, title: "Step 3", desc: "Resolution provided within 10 business days", color: "text-green-600", bg: "bg-green-50" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`${bg} rounded-xl p-5 text-center`}>
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <p className="font-display font-bold text-sm text-ink">{title}</p>
                <p className="text-xs text-slate_mist mt-1">{desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Form or Success */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-green-200 p-10 text-center shadow-lg"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-display font-bold text-2xl text-ink mb-2">Complaint Received</h2>
              <p className="text-slate_mist mb-6">
                We've sent a confirmation to <strong>{form.email}</strong> with your reference number. Our team will respond within 2 business days.
              </p>
              <div className="bg-chalk rounded-xl p-4 text-sm text-slate_mist text-left space-y-2 max-w-sm mx-auto mb-6">
                <p><strong>Not satisfied with our response?</strong></p>
                <p>You may escalate to the NDIS Quality and Safeguards Commission:</p>
                <p className="font-semibold text-ink">📞 1800 035 544</p>
                <p className="text-xs">Monday–Friday 9am–5pm (local time)</p>
              </div>
              <Button onClick={() => window.location.href = "/"} variant="outline">Return to Home</Button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-border/60 shadow-lg p-8 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Full Name *</Label>
                  <Input required value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Email *</Label>
                  <Input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Phone</Label>
                  <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0400 000 000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Complaint Type</Label>
                  <Select value={form.complaint_type} onValueChange={v => set("complaint_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      {COMPLAINT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Description of Complaint *</Label>
                <Textarea required value={form.description} onChange={e => set("description", e.target.value)} placeholder="Please describe your complaint in detail, including dates, names of staff involved (if relevant), and what occurred..." rows={5} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Desired Outcome</Label>
                <Textarea value={form.desired_outcome} onChange={e => set("desired_outcome", e.target.value)} placeholder="What outcome would you like to see from this complaint?" rows={3} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> Your Rights</p>
                <p className="text-xs text-amber-700">You have the right to have your complaint dealt with fairly, promptly, and confidentially. If you are unsatisfied with our response, you may contact the NDIS Quality and Safeguards Commission on <strong>1800 035 544</strong>.</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-ink hover:bg-ink/90 text-white font-display py-6 gap-2 group">
                {loading ? "Submitting…" : <>Submit Complaint <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
              <p className="text-xs text-center text-slate_mist">All complaints are treated confidentially and in accordance with the Privacy Act 1988.</p>
            </motion.form>
          )}

          {/* Contact alternatives */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4 text-center">
            <div className="bg-chalk rounded-xl p-5">
              <Phone className="w-5 h-5 text-harvest mx-auto mb-2" />
              <p className="font-display font-semibold text-sm text-ink">Phone</p>
              <a href="tel:+61460003494" className="text-sm text-harvest">+61 460 003 494</a>
            </div>
            <div className="bg-chalk rounded-xl p-5">
              <Mail className="w-5 h-5 text-harvest mx-auto mb-2" />
              <p className="font-display font-semibold text-sm text-ink">Email</p>
              <a href="mailto:complaints@solbusinessconsultant.com.au" className="text-sm text-harvest">info@solbusinessconsultant.com.au</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}