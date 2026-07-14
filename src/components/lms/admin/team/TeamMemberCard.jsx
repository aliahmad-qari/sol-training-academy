import React, { useState } from "react";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Mail, Building2, Briefcase, Trash2, Shield,
  ChevronDown, CheckCircle2, XCircle, Ban, LogIn
} from "lucide-react";

const STATUS_CONFIG = {
  active:    { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Active" },
  suspended: { color: "bg-orange-100 text-orange-700",   icon: Ban,          label: "Suspended" },
};

/**
 * A single team member (real User with role: 'team_member').
 * Status maps directly to is_active: Active ↔ is_active:true, Suspended ↔ false.
 */
export default function TeamMemberCard({ member, onRefresh, onViewPermissions, currentAdminId }) {
  const [loading, setLoading] = useState(false);

  const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;
  const memberId = member.id || member._id;
  const isSelf = String(memberId) === String(currentAdminId);
  const suspended = member.status !== "active";
  const permCount = (member.page_permissions || []).length;

  const setActive = async (isActive) => {
    setLoading(true);
    try {
      await apiClient.patch(`/users/${memberId}`, { is_active: isActive });
      toast.success(`${member.full_name} is now ${isActive ? "active" : "suspended"}`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(
      `Permanently remove ${member.full_name} from the team?\n\n` +
      `This deletes their account and all related data. This cannot be undone.`
    )) return;
    setLoading(true);
    try {
      await apiClient.delete(`/users/${memberId}`);
      toast.success("Team member removed.");
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${suspended ? "border-red-100" : "border-border/50"}`}>
      <div className="p-4 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-harvest/20 to-harvest/5 border-2 border-harvest/20 flex items-center justify-center flex-shrink-0 text-harvest font-bold text-base">
          {member.avatar_url
            ? <img src={member.avatar_url} className="w-11 h-11 rounded-full object-cover" alt="" />
            : (member.full_name || "?").charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink text-sm">{member.full_name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200 capitalize">
              Team Member
            </span>
            {member.job_role && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                {member.job_role}
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />{statusCfg.label}
            </span>
            {suspended && (
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
            {member.last_login_at && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <LogIn className="w-3 h-3" />
                Last login: {new Date(member.last_login_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {member.createdAt && (
              <p className="text-[10px] text-slate-400">
                Joined: {new Date(member.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            <p className="text-[10px] text-blue-500 font-medium">
              {permCount} module page{permCount !== 1 ? "s" : ""} granted
            </p>
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
              <DropdownMenuItem
                onClick={() => setActive(true)}
                className="gap-2 text-xs cursor-pointer text-emerald-600"
                disabled={!suspended}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Set Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActive(false)}
                className="gap-2 text-xs cursor-pointer text-orange-600"
                disabled={suspended || isSelf}>
                <XCircle className="w-3.5 h-3.5" /> Suspend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 text-xs text-red-600 cursor-pointer"
                disabled={isSelf}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
