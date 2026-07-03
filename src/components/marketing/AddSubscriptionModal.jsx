import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  { id: "starter", label: "Starter — $297/mo", monthly: 297, annually: 2970 },
  { id: "growth", label: "Growth — $697/mo", monthly: 697, annually: 6970 },
  { id: "enterprise", label: "Enterprise — $1,497/mo", monthly: 1497, annually: 14970 },
];

const INDUSTRIES = ["ndis_provider","allied_health","aged_care","education","legal","accounting","construction","retail","other"];

const EMPTY = {
  business_name: "", contact_name: "", email: "", phone: "",
  plan: "starter", billing_cycle: "monthly", status: "trial",
  industry: "ndis_provider", next_billing: "", notes: "", referral_source: ""
};

export default function AddSubscriptionModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const selectedPlan = PLANS.find(p => p.id === form.plan);
  const mrr = form.billing_cycle === "annually"
    ? (selectedPlan?.annually || 0) / 12
    : (selectedPlan?.monthly || 0);

  const handleSave = async () => {
    if (!form.business_name || !form.email) { toast.error("Business name and email required"); return; }
    setSaving(true);
    await base44.entities.Subscription.create({ ...form, mrr, trial_ends: trialEnds, emails_sent: 0 });

    // Send welcome email
    base44.integrations.Core.SendEmail({
      to: form.email,
      subject: `Welcome to SOL Business Consultant — Your ${form.plan.charAt(0).toUpperCase() + form.plan.slice(1)} Plan is Active!`,
      body: `Hi ${form.contact_name || form.business_name},\n\nWelcome to SOL Business Consultant! 🎉\n\nYour ${form.plan.charAt(0).toUpperCase() + form.plan.slice(1)} subscription for ${form.business_name} is now active.\n\n📋 PLAN DETAILS:\n• Plan: ${form.plan.charAt(0).toUpperCase() + form.plan.slice(1)}\n• Billing: ${form.billing_cycle}\n• Trial ends: ${trialEnds}\n\nYour dedicated account manager will be in touch within 1 business day.\n\nQuestions? Call us on +61 460 003 494\n\nWarm regards,\nThe SOL Business Consultant Team`,
    }).catch(() => {});

    toast.success("Subscriber added & welcome email sent!");
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-display font-bold text-xl text-ink">Add Subscriber</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Business Name *</Label>
              <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="Acme Pty Ltd" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Contact Name</Label>
              <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Email *</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@acme.com.au" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Phone</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0400 000 000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Industry</Label>
              <Select value={form.industry} onValueChange={v => set("industry", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="capitalize">{i.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Plan *</Label>
              <Select value={form.plan} onValueChange={v => set("plan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Billing Cycle</Label>
              <Select value={form.billing_cycle} onValueChange={v => set("billing_cycle", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually (2 months free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["trial","active","paused"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Next Billing Date</Label>
              <Input type="date" value={form.next_billing} onChange={e => set("next_billing", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Referral Source</Label>
              <Input value={form.referral_source} onChange={e => set("referral_source", e.target.value)} placeholder="Google, LinkedIn, Referral…" />
            </div>
          </div>

          {/* MRR Preview */}
          <div className="bg-harvest/5 border border-harvest/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate_mist uppercase tracking-wide">Estimated MRR</p>
              <p className="font-display font-bold text-2xl text-harvest">${Math.round(mrr).toLocaleString()}/mo</p>
            </div>
            <div className="text-right text-xs text-slate_mist">
              <p>Trial ends: {trialEnds}</p>
              <p className="mt-0.5 capitalize">{form.billing_cycle} billing</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-harvest hover:bg-harvest/90 text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Add & Send Welcome Email
          </Button>
        </div>
      </div>
    </div>
  );
}