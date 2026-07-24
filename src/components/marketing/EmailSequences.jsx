import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Zap, Pencil, Trash2, Loader2, X, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = [
  { value: "trial_start", label: "Trial Started", icon: "🚀" },
  { value: "trial_ending", label: "Trial Ending Soon", icon: "⏳" },
  { value: "plan_upgrade", label: "Plan Upgraded", icon: "⬆️" },
  { value: "payment_failed", label: "Payment Failed", icon: "❌" },
  { value: "churned", label: "Subscription Cancelled", icon: "😢" },
  { value: "onboarding", label: "Onboarding Welcome", icon: "👋" },
  { value: "upsell", label: "Upsell Campaign", icon: "💰" },
  { value: "win_back", label: "Win-Back Campaign", icon: "🎯" },
  { value: "monthly_digest", label: "Monthly Digest", icon: "📊" },
];

const DEFAULT_SEQUENCES = [
  { name: "Welcome Onboarding", trigger: "trial_start", plan_target: "all", delay_days: 0, subject: "Welcome to SOL Business Consultant 🎉", body: "Hi {{contact_name}},\n\nWelcome aboard! Your {{plan}} trial is now active.\n\nHere's what you get:\n✅ Full access to all {{plan}} features\n✅ Dedicated support team\n✅ NDIS compliance tools\n\nLet's book your onboarding call: https://calendly.com/sol\n\nWarm regards,\nThe SOL Team", status: "active" },
  { name: "Trial Ending Reminder", trigger: "trial_ending", plan_target: "all", delay_days: 2, subject: "Your trial ends in 2 days — upgrade now", body: "Hi {{contact_name}},\n\nYour SOL trial for {{business_name}} ends soon!\n\nUpgrade to keep access:\n• Starter – $297/mo\n• Growth – $697/mo\n• Enterprise – $1,497/mo\n\nUpgrade now: https://solbusinessconsultant.com.au/#pricing\n\nQuestions? Reply to this email.\n\nThe SOL Team", status: "active" },
  { name: "Upsell to Growth", trigger: "upsell", plan_target: "starter", delay_days: 30, subject: "{{business_name}} — ready to scale faster?", body: "Hi {{contact_name}},\n\nYou've been on our Starter plan for 30 days — amazing progress!\n\nUpgrade to Growth and unlock:\n🔥 Priority support\n📊 Advanced analytics\n⚡ Automation workflows\n🧑‍💼 Dedicated account manager\n\nGrowth is just $697/mo — that's $400 more per month for 10x the value.\n\nUpgrade today: https://solbusinessconsultant.com.au\n\nThe SOL Team", status: "active" },
  { name: "Win-Back Campaign", trigger: "win_back", plan_target: "all", delay_days: 7, subject: "We miss you, {{contact_name}} — here's 20% off", body: "Hi {{contact_name}},\n\nWe noticed you cancelled your SOL subscription. We'd love to have you back!\n\nFor the next 48 hours, we're offering 20% off your first 3 months when you reactivate.\n\nReactivate now: https://solbusinessconsultant.com.au\n\nIf there's anything we can improve, just reply to this email.\n\nThe SOL Team", status: "active" },
  { name: "Payment Failed Alert", trigger: "payment_failed", plan_target: "all", delay_days: 0, subject: "Action required: Payment failed for {{business_name}}", body: "Hi {{contact_name}},\n\nWe couldn't process your payment for the {{plan}} plan.\n\nTo avoid service interruption, please update your payment details:\nhttps://solbusinessconsultant.com.au/billing\n\nIf you need help, call us on +61 460 003 494.\n\nThe SOL Team", status: "active" },
];

const EMPTY_FORM = { name: "", trigger: "trial_start", plan_target: "all", delay_days: 0, subject: "", body: "", status: "active" };

export default function EmailSequences() {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.EmailSequence.list("-created_date", 50);
    setSequences(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.body) { toast.error("Fill in all required fields"); return; }
    setSaving(true);
    if (editing) {
      await base44.entities.EmailSequence.update(editing, form);
      toast.success("Sequence updated");
    } else {
      await base44.entities.EmailSequence.create(form);
      toast.success("Sequence created");
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    load();
  };

  const handleEdit = (seq) => {
    setForm({ name: seq.name, trigger: seq.trigger, plan_target: seq.plan_target || "all", delay_days: seq.delay_days || 0, subject: seq.subject, body: seq.body, status: seq.status });
    setEditing(seq.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.EmailSequence.delete(id);
    toast.success("Sequence deleted");
    load();
  };

  const handleToggleStatus = async (seq) => {
    const status = seq.status === "active" ? "paused" : "active";
    await base44.entities.EmailSequence.update(seq.id, { status });
    load();
  };

  const seedDefaults = async () => {
    setSeeding(true);
    for (const seq of DEFAULT_SEQUENCES) {
      await base44.entities.EmailSequence.create(seq);
    }
    toast.success(`${DEFAULT_SEQUENCES.length} default sequences created!`);
    setSeeding(false);
    load();
  };

  const triggerInfo = (trigger) => TRIGGERS.find(t => t.value === trigger) || { label: trigger, icon: "📧" };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-ink">Email Sequences</h2>
          <p className="text-sm text-slate_mist">Automated emails triggered by subscriber actions</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {sequences.length === 0 && (
            <Button variant="outline" onClick={seedDefaults} disabled={seeding} className="w-full gap-2 text-sm sm:w-auto">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Load Default Sequences
            </Button>
          )}
          <Button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }} className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2 sm:w-auto">
            <Plus className="w-4 h-4" /> New Sequence
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display font-semibold text-ink">{editing ? "Edit Sequence" : "New Sequence"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-5 h-5 text-slate_mist" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Sequence Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Trial Welcome Email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Trigger *</Label>
              <Select value={form.trigger} onValueChange={v => set("trigger", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Target Plan</Label>
              <Select value={form.plan_target} onValueChange={v => set("plan_target", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="starter">Starter Only</SelectItem>
                  <SelectItem value="growth">Growth Only</SelectItem>
                  <SelectItem value="enterprise">Enterprise Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Delay (days after trigger)</Label>
              <Input type="number" min={0} value={form.delay_days} onChange={e => set("delay_days", parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Email Subject *</Label>
              <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g. Welcome to SOL! 🎉" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-slate_mist">Email Body * (use {"{{contact_name}}"}, {"{{business_name}}"}, {"{{plan}}"})</Label>
              <Textarea value={form.body} onChange={e => set("body", e.target.value)} rows={8} placeholder="Write your email here..." className="font-mono text-xs" />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2 sm:w-auto">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {editing ? "Save Changes" : "Create Sequence"}
            </Button>
          </div>
        </div>
      )}

      {/* Sequences List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-harvest" /></div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border text-slate_mist">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No email sequences yet</p>
          <p className="text-sm mt-1">Load default sequences or create your own</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sequences.map(seq => {
            const t = triggerInfo(seq.trigger);
            return (
              <div key={seq.id} className="bg-white rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center text-xl flex-shrink-0">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-semibold text-ink">{seq.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${seq.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{seq.status}</span>
                    {seq.plan_target && seq.plan_target !== "all" && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold capitalize">{seq.plan_target} only</span>
                    )}
                  </div>
                  <p className="text-xs text-slate_mist mt-1 flex items-center gap-2">
                    <span>{t.icon} Trigger: {t.label}</span>
                    {seq.delay_days > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> +{seq.delay_days}d delay</span>}
                  </p>
                  <p className="text-sm text-ink mt-1.5 font-medium">{seq.subject}</p>
                  <p className="text-xs text-slate_mist mt-1 line-clamp-2">{seq.body?.replace(/\n/g, " ")}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate_mist">
                    <span>Sent: {seq.sent_count || 0}</span>
                    <span>Open rate: {seq.open_rate || 0}%</span>
                    <span>Click rate: {seq.click_rate || 0}%</span>
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-start gap-1 sm:w-auto sm:flex-shrink-0 sm:justify-end">
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(seq)} className="h-7 px-2 text-xs">
                    {seq.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(seq)} className="h-7 px-2">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(seq.id)} className="h-7 px-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}