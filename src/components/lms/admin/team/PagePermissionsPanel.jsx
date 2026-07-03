import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Home, BookOpen, Layers, Video, HelpCircle, ClipboardList, Users2,
  Users, Clock, Award, Sparkles, Shield, FileText, Megaphone,
  BarChart3, DollarSign, CreditCard, Tag, Gift, Download,
  Inbox, LifeBuoy, Settings, Loader2, CheckCircle2, XCircle,
  ToggleLeft, ToggleRight
} from "lucide-react";

// Must match the NAV_SECTIONS ids in LMSAdmin
export const PAGE_PERMISSION_GROUPS = [
  {
    label: "Overview",
    color: "bg-blue-50 border-blue-100",
    headerColor: "text-blue-700",
    pages: [
      { id: "dashboard", label: "Dashboard", icon: Home, description: "Main admin overview & KPIs" },
    ]
  },
  {
    label: "Content Management",
    color: "bg-purple-50 border-purple-100",
    headerColor: "text-purple-700",
    pages: [
      { id: "courses",     label: "Course Management", icon: BookOpen,     description: "Create, edit & publish courses" },
      { id: "modules",     label: "Module Management", icon: Layers,       description: "Manage course modules" },
      { id: "videos",      label: "Video Library",     icon: Video,        description: "Upload & manage videos" },
      { id: "quizzes",     label: "Quiz Management",   icon: HelpCircle,   description: "Create & manage quizzes" },
      { id: "assessments", label: "Assessments",       icon: ClipboardList,description: "Assignments & grading" },
      { id: "gradebook",   label: "Gradebook",         icon: Users2,       description: "View student grades" },
    ]
  },
  {
    label: "Students",
    color: "bg-emerald-50 border-emerald-100",
    headerColor: "text-emerald-700",
    pages: [
      { id: "students",     label: "Student Management", icon: Users, description: "View & manage students" },
      { id: "expiry",       label: "Access & Expiry",    icon: Clock, description: "Manage enrollment expiry" },
      { id: "certificates", label: "Certificates",       icon: Award, description: "Issue & view certificates" },
    ]
  },
  {
    label: "AI Tools",
    color: "bg-violet-50 border-violet-100",
    headerColor: "text-violet-700",
    pages: [
      { id: "aitools", label: "AI Admin Tools", icon: Sparkles, description: "AI-powered admin utilities" },
    ]
  },
  {
    label: "Team",
    color: "bg-amber-50 border-amber-100",
    headerColor: "text-amber-700",
    pages: [
      { id: "team", label: "Team & Files", icon: Shield, description: "Manage team members & files" },
    ]
  },
  {
    label: "Platform",
    color: "bg-slate-50 border-slate-200",
    headerColor: "text-slate-700",
    pages: [
      { id: "resources",     label: "Training Resources", icon: FileText,   description: "Manage training materials" },
      { id: "announcements", label: "Announcements",      icon: Megaphone,  description: "Post announcements" },
      { id: "analytics",     label: "Reports & Analytics",icon: BarChart3,  description: "View detailed reports" },
      { id: "revenue",       label: "Revenue Dashboard",  icon: DollarSign, description: "Revenue & financial data" },
      { id: "payments",      label: "Payments",           icon: CreditCard, description: "Payment records" },
      { id: "coupons",       label: "Coupons & Discounts",icon: Tag,        description: "Manage coupon codes" },
      { id: "waitlist",      label: "Waitlist",           icon: Clock,      description: "Course waitlist" },
      { id: "referrals",     label: "Referral Report",    icon: Gift,       description: "Referral tracking" },
      { id: "export",        label: "Export CSV",         icon: Download,   description: "Data exports" },
      { id: "requests",      label: "Student Requests",   icon: Inbox,      description: "Student-submitted requests" },
      { id: "support",       label: "Support Tickets",    icon: LifeBuoy,   description: "Help desk tickets" },
      { id: "settings",      label: "Settings",           icon: Settings,   description: "Platform settings" },
    ]
  }
];

export const ALL_PAGE_IDS = PAGE_PERMISSION_GROUPS.flatMap(g => g.pages.map(p => p.id));

export default function PagePermissionsPanel({ member, onRefresh }) {
  const [saving, setSaving] = useState(false);

  const granted = member.page_permissions || [];
  const grantedCount = granted.length;
  const totalCount = ALL_PAGE_IDS.length;

  const hasPage = (id) => granted.includes(id);

  const togglePage = async (id) => {
    setSaving(id);
    const newPerms = hasPage(id) ? granted.filter(x => x !== id) : [...granted, id];
    await base44.entities.TeamMember.update(member.id, { page_permissions: newPerms });
    await base44.entities.TeamActivityLog.create({
      member_id: member.id,
      member_name: member.full_name,
      action: "permission_changed",
      resource_name: id,
      resource_type: "page",
      details: `${hasPage(id) ? "Revoked" : "Granted"} page access to "${id}" for ${member.full_name}`,
    });
    toast.success(hasPage(id) ? "Page access revoked" : "Page access granted");
    onRefresh();
    setSaving(false);
  };

  const grantAll = async () => {
    setSaving("bulk");
    await base44.entities.TeamMember.update(member.id, { page_permissions: [...ALL_PAGE_IDS] });
    toast.success("All pages granted");
    onRefresh();
    setSaving(false);
  };

  const revokeAll = async () => {
    setSaving("bulk");
    await base44.entities.TeamMember.update(member.id, { page_permissions: [] });
    toast.success("All page access revoked");
    onRefresh();
    setSaving(false);
  };

  const toggleGroup = async (group) => {
    setSaving("bulk");
    const groupIds = group.pages.map(p => p.id);
    const allGranted = groupIds.every(id => granted.includes(id));
    const newPerms = allGranted
      ? granted.filter(id => !groupIds.includes(id))
      : [...new Set([...granted, ...groupIds])];
    await base44.entities.TeamMember.update(member.id, { page_permissions: newPerms });
    toast.success(allGranted ? `"${group.label}" section revoked` : `"${group.label}" section granted`);
    onRefresh();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-slate-50 border border-border/50 rounded-xl p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-ink">{grantedCount} / {totalCount} pages accessible</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-slate-500">{totalCount - grantedCount} pages hidden</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={grantAll} disabled={!!saving}
            className="gap-1.5 text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            {saving === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleRight className="w-3.5 h-3.5" />}
            Grant All
          </Button>
          <Button size="sm" variant="outline" onClick={revokeAll} disabled={!!saving}
            className="gap-1.5 text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50">
            {saving === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            Revoke All
          </Button>
        </div>
      </div>

      {/* Permission groups */}
      {PAGE_PERMISSION_GROUPS.map(group => {
        const groupIds = group.pages.map(p => p.id);
        const allGranted = groupIds.every(id => granted.includes(id));
        const someGranted = groupIds.some(id => granted.includes(id));

        return (
          <div key={group.label} className={`border rounded-xl overflow-hidden ${group.color}`}>
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${group.headerColor}`}>{group.label}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({groupIds.filter(id => granted.includes(id)).length}/{groupIds.length})
                </span>
              </div>
              <button
                onClick={() => toggleGroup(group)}
                disabled={!!saving}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all disabled:opacity-40 ${
                  allGranted
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                    : someGranted
                    ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                }`}>
                {allGranted ? "Revoke All" : "Grant All"}
              </button>
            </div>

            {/* Pages */}
            <div className="divide-y divide-black/5 bg-white/60">
              {group.pages.map(page => {
                const isGranted = hasPage(page.id);
                const isSaving = saving === page.id;
                const Icon = page.icon;

                return (
                  <div key={page.id} className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/80 ${isGranted ? "" : "opacity-70"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isGranted ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{page.label}</p>
                      <p className="text-[11px] text-slate-400">{page.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGranted ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-400"}`}>
                        {isGranted ? "✓ Allowed" : "✗ Denied"}
                      </span>
                      {isSaving
                        ? <Loader2 className="w-4 h-4 animate-spin text-harvest" />
                        : <Switch checked={isGranted} onCheckedChange={() => togglePage(page.id)} disabled={!!saving} />
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}