import React, { useState } from "react";
import { Mail, Globe, Users, Phone, Upload, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TABS = [
  { id: "general",  label: "General",          icon: Globe },
  { id: "email",    label: "Email / SMTP",      icon: Mail },
  { id: "trainers", label: "Trainer Management",icon: Users },
  { id: "contact",  label: "Contact Info",      icon: Phone },
];

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30">
        <h3 className="font-display font-semibold text-ink">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function GeneralSettings() {
  const [form, setForm] = useState({
    site_name: "SOL Training Academy",
    tagline: "NDIS Support Coordinator Training — Level 1, 2 & 3",
    abn: "20 662 022 522",
    timezone: "Australia/Melbourne",
    passing_score: 75,
    retake_limit: 0,
  });
  const save = () => toast.success("General settings saved.");
  return (
    <div className="space-y-5">
      <SectionCard title="Platform Settings">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Platform Name</Label>
            <Input value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Tagline</Label>
            <Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">ABN</Label>
            <Input value={form.abn} onChange={e => setForm(f => ({ ...f, abn: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Timezone</Label>
            <Input value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} /></div>
        </div>
      </SectionCard>
      <SectionCard title="Quiz & Assessment Rules">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Default Passing Score (%)</Label>
            <Input type="number" min={0} max={100} value={form.passing_score} onChange={e => setForm(f => ({ ...f, passing_score: Number(e.target.value) }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Retake Limit (0 = unlimited)</Label>
            <Input type="number" min={0} value={form.retake_limit} onChange={e => setForm(f => ({ ...f, retake_limit: Number(e.target.value) }))} /></div>
        </div>
      </SectionCard>
      <SectionCard title="Logo Upload">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-harvest flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-2xl">S</span>
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Platform Logo</p>
            <p className="text-xs text-slate_mist mb-3">Recommended: 200×200px PNG with transparent background</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Upload className="w-3.5 h-3.5" /> Upload Logo</Button>
          </div>
        </div>
      </SectionCard>
      <Button onClick={save} className="bg-harvest text-white gap-1.5"><Save className="w-4 h-4" /> Save General Settings</Button>
    </div>
  );
}

function EmailSettings() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    from_name: "SOL Training Academy",
    from_email: "noreply@solbusinessconsultant.com.au",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    welcome_email: true,
    cert_email: true,
  });
  const save = () => toast.success("Email settings saved.");
  return (
    <div className="space-y-5">
      <SectionCard title="SMTP Configuration">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">From Name</Label>
            <Input value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">From Email</Label>
            <Input value={form.from_email} onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">SMTP Host</Label>
            <Input value={form.smtp_host} onChange={e => setForm(f => ({ ...f, smtp_host: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">SMTP Port</Label>
            <Input value={form.smtp_port} onChange={e => setForm(f => ({ ...f, smtp_port: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">SMTP Username</Label>
            <Input value={form.smtp_user} onChange={e => setForm(f => ({ ...f, smtp_user: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">SMTP Password</Label>
            <div className="relative">
              <Input type={show ? "text" : "password"} value={form.smtp_pass} onChange={e => setForm(f => ({ ...f, smtp_pass: e.target.value }))} className="pr-9" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate_mist">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Email Notifications">
        <div className="space-y-3">
          {[
            { key: "welcome_email", label: "Send welcome email when student enrolls" },
            { key: "cert_email",    label: "Send certificate email when course is completed" },
          ].map(opt => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[opt.key]} onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} className="w-4 h-4 accent-harvest" />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </SectionCard>
      <Button onClick={save} className="bg-harvest text-white gap-1.5"><Save className="w-4 h-4" /> Save Email Settings</Button>
    </div>
  );
}

function TrainerSettings() {
  const [trainers] = useState([
    { id: 1, name: "SOL Admin", email: "info@solbusinessconsultant.com.au", role: "Lead Trainer", courses: "All Levels" },
  ]);
  return (
    <div className="space-y-5">
      <SectionCard title="Trainer Accounts">
        <div className="space-y-3 mb-4">
          {trainers.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
              <div className="w-9 h-9 rounded-full bg-harvest/10 flex items-center justify-center font-bold text-harvest flex-shrink-0">
                {t.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-slate_mist">{t.email} · {t.role}</p>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{t.courses}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-harvest border-harvest/30">+ Invite Trainer</Button>
      </SectionCard>
    </div>
  );
}

function ContactSettings() {
  const [form, setForm] = useState({
    phone: "+61 460 003 494",
    email: "info@solbusinessconsultant.com.au",
    website: "www.solbusinessconsultant.com.au",
    address: "Glenroy VIC 3046, Australia",
    support_hours: "Mon–Fri, 9am–5pm AEST",
  });
  const save = () => toast.success("Contact info saved.");
  return (
    <div className="space-y-5">
      <SectionCard title="Contact Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Support Email</Label>
            <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Website</Label>
            <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
          <div><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Support Hours</Label>
            <Input value={form.support_hours} onChange={e => setForm(f => ({ ...f, support_hours: e.target.value }))} /></div>
          <div className="sm:col-span-2"><Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Address</Label>
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        </div>
      </SectionCard>
      <Button onClick={save} className="bg-harvest text-white gap-1.5"><Save className="w-4 h-4" /> Save Contact Info</Button>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display font-semibold text-lg text-ink">Settings</h2>
        <p className="text-sm text-slate_mist">Configure platform, email, trainers and contact information.</p>
      </div>

      {/* Settings sub-tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border/50 p-1 mb-6 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === t.id ? "bg-ink text-white" : "text-slate_mist hover:text-ink"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {activeTab === "general"  && <GeneralSettings />}
      {activeTab === "email"    && <EmailSettings />}
      {activeTab === "trainers" && <TrainerSettings />}
      {activeTab === "contact"  && <ContactSettings />}
    </div>
  );
}