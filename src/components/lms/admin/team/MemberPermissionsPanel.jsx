import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PagePermissionsPanel from "./PagePermissionsPanel";

/**
 * Access & Permissions view for a single team member (real User record).
 *
 * Module-level access is governed entirely by `page_permissions`. The former
 * "File Access" tab was backed by the decommissioned base44 TeamFile entity and
 * has been removed; page-level access is the working RBAC primitive.
 */
export default function MemberPermissionsPanel({ member, onBack, onRefresh }) {
  const pageCount = (member.page_permissions || []).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-500 hover:text-ink -ml-1 mt-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-harvest/20 to-harvest/5 border-2 border-harvest/20 flex items-center justify-center text-harvest font-bold text-base">
              {(member.full_name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-lg">{member.full_name}</h3>
              <p className="text-xs text-slate-500">
                {member.email} · <span className="capitalize">Team Member</span> · <span className="capitalize">{member.status}</span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                {pageCount} page{pageCount !== 1 ? "s" : ""} accessible
              </span>
            </div>
          </div>
        </div>
      </div>

      <PagePermissionsPanel member={member} onRefresh={onRefresh} />
    </div>
  );
}
