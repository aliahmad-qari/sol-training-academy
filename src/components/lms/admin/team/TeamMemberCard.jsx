import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  UserCircle2, Mail, Building2, Briefcase, Trash2, Shield,
  ChevronDown, CheckCircle2, XCircle, Clock, Ban, AlertTriangle, UserX, LogIn
} from "lucide-react";

const ROLE_COLORS = {
  owner:       "bg-amber-100 text-amber-700 border-amber-200",
  admin:       "bg-red-100 text-red-700 border-red-200",
  manager:     "bg-blue-100 text-blue-700 border-blue-200",
  team_member: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_CONFIG = {
  active:    { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2,   label: "Active" },
  invited:   { color: "bg-yellow-100 text-yellow-700",  icon: Clock,          label: "Invited" },
  inactive:  { color: "bg-slate-100 text-slate-500",    icon: XCircle,        label: "Inactive" },
  suspended: { color: "bg-orange-100 text-orange-700",  icon: AlertTriangle,  label: "Suspended" },
  blocked:   { color: "bg-red-100 text-red-700",        icon: Ban,            label: "Blocked" },
  dismissed: { color: "bg-gray-100 text-gray-600",      icon: UserX,          label: "Dismissed" },
};

const STATUS_ACTIONS = [
  { value: "active",    label: "Set Active",      icon: CheckCircle2,  className: "text-emerald-600" },
  { value: "inactive",  label: "Deactivate",      icon: XCircle,       className: "text-slate-500" },
  { value: "suspended", label: "Suspend",          icon: AlertTriangle, className: "text-orange-600" },
  { value: "blocked",   label: "Block",            icon: Ban,           className: "text-red-600" },
  { value: "dismissed", label: "Dismiss",          icon: UserX,         className: "text-gray-600" },
];

export default function TeamMemberCard({ member, onRefresh, onViewPermissions }) {
  const [loading, setLoading] = useState(false);

  const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.invited;
  const StatusIcon = statusCfg.icon;

  const handleStatusChange = async (status) => {
    setLoading(true);
    await base44.entities.TeamMember.update(member.id, { status });
    await base44.entities.TeamActivityLog.create({
      member_id: member.id,
      member_name: member.full_name,
      action: "permission_changed",
      resource_name: member.full_name,
      resource_type: "team_member",
      details: `Status changed to "${status}"`,
    });
    toast.success(`${member.full_name} is now ${status}`);
    onRefresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently remove ${member.full_name} from the team?`)) return;
    await base44.entities.TeamMember.delete(member.id);
    toast.success("Team member removed");
    onRefresh();
  };

  const cannotLogin = ["blocked", "suspended", "dismissed"].includes(member.status);

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${cannotLogin ? "border-red-100" : "border-border/50"}`}>
      <div className="p-4 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-harvest/20 to-harvest/5 border-2 border-harvest/20 flex items-center justify-center flex-shrink-0 text-harvest font-bold text-base">
          {member.avatar_url
            ? <img src={member.avatar_url} className="w-11 h-11 rounded-full object-cover" alt="" />
            : member.full_name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink text-sm">{member.full_name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${ROLE_COLORS[member.role] || ROLE_COLORS.team_member}`}>
              {member.role?.replace("_", " ")}
            </span>
            {member.job_role && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                {member.job_role}
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />{statusCfg.label}
            </span>
            {cannotLogin && (
              <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Ban className="w-3 h-3" /> Login Restricted
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{member.email}</span>
            {member.job_title && <span className="flex items-center gap-1 text-xs text-slate-500"><Briefcase className="w-3 h-3" />{member.job_title}</span>}
            {member.department && <span className="flex items-center gap-1 text-xs text-slate-500"><Building2 className="w-3 h-3" />{member.department}</span>}
          </div>

          <div className="flex gap-x-4 mt-1">
            {member.last_login && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <LogIn className="w-3 h-3" />
                Last login: {new Date(member.last_login).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {member.invite_date && (
              <p className="text-[10px] text-slate-400">
                Joined: {new Date(member.invite_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            {(member.file_permissions || []).length > 0 && (
              <p className="text-[10px] text-blue-500 font-medium">
                {member.file_permissions.length} file{member.file_permissions.length !== 1 ? "s" : ""} granted
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm" variant="outline"
            onClick={() => onViewPermissions(member)}
            className="h-8 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Shield className="w-3.5 h-3.5" /> Access & Permissions
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={loading}>
                Status <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {STATUS_ACTIONS.map(a => {
                const Icon = a.icon;
                return (
                  <DropdownMenuItem
                    key={a.value}
                    onClick={() => handleStatusChange(a.value)}
                    className={`gap-2 text-xs cursor-pointer ${a.className}`}
                    disabled={member.status === a.value}>
                    <Icon className="w-3.5 h-3.5" />{a.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="gap-2 text-xs text-red-600 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Delete Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}