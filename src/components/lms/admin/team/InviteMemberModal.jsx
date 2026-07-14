import React, { useState } from "react";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Mail, UserPlus, Copy, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { PERMISSION_BUCKETS, bucketsToPages } from "@/lib/permissions";

const DEPARTMENTS = ["Administration", "Training", "Compliance", "IT", "Finance", "Operations", "HR", "Management"];

const JOB_ROLES = [
  "Compliance Officer",
  "Consultant",
  "Support Coordinator",
  "Trainer",
  "Course Developer",
  "Finance Officer",
  "HR Officer",
  "IT Administrator",
  "Operations Manager",
  "Marketing Coordinator",
  "Student Support Officer",
  "Other",
];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  job_title: "",
  job_role: "",
  department: "",
};

/**
 * Invite a team member. Team members ARE real User records with
 * role: 'team_member' + module-level page_permissions. The backend generates a
 * strong temporary password and returns it ONCE; we reveal it here so the admin
 * can share it securely (no email integration is wired up yet).
 */
export default function InviteMemberModal({ open, onClose, onInvited }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [buckets, setBuckets] = useState({});
  const [loading, setLoading] = useState(false);
  // After a successful create we swap the form for a credential-reveal panel.
  const [created, setCreated] = useState(null); // { email, generated_password }
  const [copied, setCopied] = useState(false);

  const toggleBucket = (key) => setBuckets((b) => ({ ...b, [key]: !b[key] }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setBuckets({});
    setCreated(null);
    setCopied(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleInvite = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }
    setLoading(true);
    try {
      // Create the team member as a real User. Password omitted → backend
      // generates + returns a one-time temp password. page_permissions is the
      // expanded page-id array from the selected module buckets.
      const res = await apiClient.post("/users", {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        role: "team_member",
        job_title: form.job_title || undefined,
        job_role: form.job_role || undefined,
        department: form.department || undefined,
        page_permissions: bucketsToPages(buckets),
      });

      const data = res.data?.data || {};
      toast.success(`Team member ${form.full_name} created.`);
      onInvited?.();
      // Show the credential reveal panel instead of closing immediately.
      setCreated({ email: data.email, generated_password: data.generated_password });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team member.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = async () => {
    const text = `SOL Training Academy — team access\nEmail: ${created.email}\nTemporary password: ${created.generated_password}\nSign in at: ${window.location.origin}/login`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Credentials copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy — please copy the password manually.");
    }
  };

  const anyBucket = Object.values(buckets).some(Boolean);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <UserPlus className="w-5 h-5 text-harvest" /> Invite Team Member
          </DialogTitle>
        </DialogHeader>

        {/* ── Credential reveal (post-create) ─────────────────────────── */}
        {created ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Account created. Share these credentials securely.</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-ink break-all">{created.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Temporary Password
                </p>
                <p className="text-sm font-mono font-semibold text-ink break-all select-all">
                  {created.generated_password || "—"}
                </p>
              </div>
              <p className="text-[11px] text-amber-600 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                This password is shown only once. The member should change it after their first login.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={copyCredentials} className="flex-1 gap-2">
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy Credentials"}
              </Button>
              <Button onClick={close} className="flex-1 bg-harvest text-white hover:bg-harvest/90">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ── Invite form ───────────────────────────────────────────── */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Full Name *</label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Sarah Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Email *</label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sarah@company.com" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Functional Role / Specialisation</label>
              <Select value={form.job_role} onValueChange={v => setForm(f => ({ ...f, job_role: v }))}>
                <SelectTrigger><SelectValue placeholder="e.g. Compliance Officer" /></SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Job Title</label>
                <Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} placeholder="e.g. Senior Consultant" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Department</label>
                <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Module-level access checkboxes → expand to page_permissions */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Module Access</label>
              <div className="grid grid-cols-1 gap-1.5">
                {PERMISSION_BUCKETS.map(bucket => (
                  <label key={bucket.key}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      buckets[bucket.key] ? "border-harvest bg-harvest/5" : "border-border/50 hover:bg-slate-50"
                    }`}>
                    <input
                      type="checkbox"
                      className="accent-harvest mt-0.5"
                      checked={!!buckets[bucket.key]}
                      onChange={() => toggleBucket(bucket.key)}
                    />
                    <span className="min-w-0">
                      <span className="text-sm font-medium text-ink block">{bucket.label}</span>
                      <span className="text-[11px] text-slate-400 block">{bucket.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {!anyBucket && (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  No modules selected — the member will only see the Dashboard. You can grant more access later.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={close} className="flex-1">Cancel</Button>
              <Button onClick={handleInvite} disabled={loading} className="flex-1 bg-harvest text-white hover:bg-harvest/90 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Create & Generate Password
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
