import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ConsultingLeadForm({ serviceType = "software_automation" }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    abn: "",
    address: "",
    company_email: "",
    company_phone: "",
    software_needs: serviceType === "software_automation" ? "" : undefined,
    website_goals: serviceType === "website_development" ? "" : undefined,
    accounting_needs: serviceType === "accountancy" ? "" : undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.full_name || !form.email || !form.company_name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        service_type: serviceType,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || "",
        company_name: form.company_name,
        abn: form.abn || "",
        address: form.address || "",
        company_email: form.company_email || "",
        company_phone: form.company_phone || "",
        status: "new",
      };

      if (serviceType === "software_automation" && form.software_needs) {
        payload.software_needs = form.software_needs;
      } else if (serviceType === "website_development" && form.website_goals) {
        payload.website_goals = form.website_goals;
      } else if (serviceType === "accountancy" && form.accounting_needs) {
        payload.accounting_needs = form.accounting_needs;
      }

      await base44.entities.Enquiry.create(payload);
      setSubmitted(true);
      toast.success("Lead submitted successfully! We'll be in touch soon.");
    } catch (error) {
      toast.error("Failed to submit lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-ink mb-2">Lead Submitted!</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Thank you for reaching out. Our team will review your enquiry and contact you within 1 business day.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setForm({
              full_name: "",
              email: "",
              phone: "",
              company_name: "",
              abn: "",
              address: "",
              company_email: "",
              company_phone: "",
              software_needs: serviceType === "software_automation" ? "" : undefined,
              website_goals: serviceType === "website_development" ? "" : undefined,
              accounting_needs: serviceType === "accountancy" ? "" : undefined,
            });
          }}
          variant="outline"
          className="border-slate-200"
        >
          Submit Another Lead
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-harvest" />
        <h3 className="font-display font-semibold text-ink">Get Your Consultation</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-display font-semibold text-sm text-ink">Your Information</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Email Address *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Phone Number</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+61 4XX XXX XXX"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <h4 className="font-display font-semibold text-sm text-ink">Company Information</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Company Name *</Label>
              <Input
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">ABN (Australian Business Number)</Label>
              <Input
                value={form.abn}
                onChange={e => setForm(f => ({ ...f, abn: e.target.value }))}
                placeholder="XX XXX XXX XXX"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Address</Label>
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street, Suburb, State, Postcode"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Company Email</Label>
              <Input
                type="email"
                value={form.company_email}
                onChange={e => setForm(f => ({ ...f, company_email: e.target.value }))}
                placeholder="info@acmecorp.com"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Company Phone</Label>
              <Input
                value={form.company_phone}
                onChange={e => setForm(f => ({ ...f, company_phone: e.target.value }))}
                placeholder="+61 2 XXXX XXXX"
              />
            </div>
          </div>
        </div>

        {/* Specific Needs */}
        {serviceType === "software_automation" && (
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-ink">What automation challenges are you facing?</h4>
            <Textarea
              value={form.software_needs}
              onChange={e => setForm(f => ({ ...f, software_needs: e.target.value }))}
              placeholder="Describe your current workflow issues, pain points, or automation opportunities..."
              rows={4}
            />
          </div>
        )}

        {serviceType === "website_development" && (
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-ink">Tell us about your website goals</h4>
            <Textarea
              value={form.website_goals}
              onChange={e => setForm(f => ({ ...f, website_goals: e.target.value }))}
              placeholder="What would you like your website to accomplish? (e.g., lead generation, e-commerce, portfolio, etc.)"
              rows={4}
            />
          </div>
        )}

        {serviceType === "accountancy" && (
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-ink">What are your accounting needs?</h4>
            <Textarea
              value={form.accounting_needs}
              onChange={e => setForm(f => ({ ...f, accounting_needs: e.target.value }))}
              placeholder="Describe your accounting challenges, compliance needs, or guidance you're seeking..."
              rows={4}
            />
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2 h-10"
        >
          {loading ? "Submitting…" : "Submit Enquiry"}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          We'll review your enquiry and contact you within 1 business day.
        </p>
      </form>
    </div>
  );
}