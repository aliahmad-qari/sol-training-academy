import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Mail, UserPlus } from "lucide-react";

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

export default function InviteMemberModal({ open, onClose, onInvited, admin }) {
  const [form, setForm] = useState({ full_name: "", email: "", job_title: "", job_role: "", department: "", role: "team_member" });
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!form.full_name || !form.email) {
      toast.error("Full name and email are required.");
      return;
    }
    setLoading(true);
    try {
      // Create TeamMember record
      const member = await base44.entities.TeamMember.create({
        ...form,
        status: "invited",
        invited_by: admin?.full_name || admin?.email,
        invite_date: new Date().toISOString(),
      });

      // Invite user to the platform
      await base44.users.inviteUser(form.email, "user");

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        to: form.email,
        from_name: "SOL Training Academy",
        subject: "You've been invited to SOL Training Academy",
        body: `Dear ${form.full_name},\n\nYou have been invited to join SOL Training Academy as a ${form.role.replace("_", " ")}.\n\nPlease check your email for a platform invitation link to set up your password and access your account.\n\nYour Role: ${form.role.replace("_", " ")}\nDepartment: ${form.department || "—"}\nJob Title: ${form.job_title || "—"}\n\nOnce logged in, you can access training materials, files, and resources shared with you.\n\nIf you have any questions, please contact your administrator.\n\nWarm regards,\nSOL Training Academy Team`,
      });

      // Log activity
      await base44.entities.TeamActivityLog.create({
        member_id: admin?.id,
        member_name: admin?.full_name || admin?.email,
        action: "invite_sent",
        resource_name: form.email,
        resource_type: "team_member",
        details: `Invited ${form.full_name} as ${form.role}`,
      });

      toast.success(`Invitation sent to ${form.email}`);
      setForm({ full_name: "", email: "", job_title: "", job_role: "", department: "", role: "team_member" });
      onInvited();
      onClose();
    } catch (err) {
      toast.error("Failed to send invitation: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <UserPlus className="w-5 h-5 text-harvest" /> Invite Team Member
          </DialogTitle>
        </DialogHeader>
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
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Access Level</label>
            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner — Full control</SelectItem>
                <SelectItem value="admin">Admin — Manage all content</SelectItem>
                <SelectItem value="manager">Manager — Manage team & content</SelectItem>
                <SelectItem value="team_member">Team Member — View & limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleInvite} disabled={loading} className="flex-1 bg-harvest text-white hover:bg-harvest/90 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}