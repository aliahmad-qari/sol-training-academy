import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, FolderOpen, Activity, UserPlus, RefreshCw,
  Loader2, Search, Shield, TrendingUp
} from "lucide-react";
import InviteMemberModal from "./team/InviteMemberModal";
import TeamMemberCard from "./team/TeamMemberCard";
import MemberPermissionsPanel from "./team/MemberPermissionsPanel";

const TABS = [
  { id: "members",  label: "Team Members", icon: Users },
  { id: "files",    label: "File Library",  icon: FolderOpen },
  { id: "activity", label: "Audit Log",     icon: Activity },
];

const JOB_ROLES = ["Compliance Officer","Consultant","Support Coordinator","Trainer","Course Developer","Finance Officer","HR Officer","IT Administrator","Operations Manager","Marketing Coordinator","Student Support Officer","Other"];

/**
 * Normalize a real User record (role: 'team_member') into the shape the team UI
 * components (TeamMemberCard / MemberPermissionsPanel) expect. Chiefly: derive a
 * display `status` from is_active, and guarantee `id` + a `page_permissions` array.
 */
const toMember = (u) => ({
  ...u,
  id: u.id || u._id,
  status: u.is_active === false ? "suspended" : "active",
  page_permissions: u.page_permissions || [],
});

export default function AdminTeamManager() {
  const { user: admin } = useAuth();
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [permissionsMember, setPermissionsMember] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, envsRes] = await Promise.all([
        apiClient.get("/users", { params: { role: "team_member", limit: 200 } }),
        apiClient.get("/enrollments", { params: { limit: 500 } }),
      ]);
      const mems = (Array.isArray(usersRes.data?.data) ? usersRes.data.data : []).map(toMember);
      setMembers(mems);
      setEnrollments(Array.isArray(envsRes.data?.data) ? envsRes.data.data : []);

      // Keep the open permissions panel in sync with fresh data.
      if (permissionsMember) {
        const updated = mems.find(m => m.id === permissionsMember.id);
        if (updated) setPermissionsMember(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = [
    { label: "Total Members",    value: members.length,                                         icon: Users,      color: "text-blue-600 bg-blue-50" },
    { label: "Active",           value: members.filter(m => m.status === "active").length,       icon: Shield,     color: "text-emerald-600 bg-emerald-50" },
    { label: "Suspended",        value: members.filter(m => m.status !== "active").length,       icon: Shield,     color: "text-amber-600 bg-amber-50" },
    { label: "Enrolled Students",value: [...new Set(enrollments.map(e => e.user_id))].length,     icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
  ];

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search || (m.full_name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q) || (m.job_role || "").toLowerCase().includes(q);
    const matchStatus  = statusFilter === "all" || m.status === statusFilter;
    const matchJobRole = jobRoleFilter === "all" || m.job_role === jobRoleFilter;
    return matchSearch && matchStatus && matchJobRole;
  });

  // If viewing member permissions, render that panel instead.
  if (permissionsMember) {
    return (
      <MemberPermissionsPanel
        member={permissionsMember}
        onBack={() => setPermissionsMember(null)}
        onRefresh={load}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-ink text-lg">Team Management</h2>
          <p className="text-xs text-slate-500">Invite team members and control which admin modules they can access</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInvite(true)} className="bg-harvest text-white hover:bg-harvest/90 gap-2 text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Invite Team Member
          </Button>
          <Button onClick={load} variant="ghost" size="icon" className="w-8 h-8">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink leading-none">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : (
        <>
          {/* Team Members Tab */}
          {tab === "members" && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="pl-9 h-9 text-sm" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
                  <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Functional Roles</SelectItem>
                    {JOB_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border/50 p-14 text-center">
                  <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-sm">No team members found</p>
                  <p className="text-slate-400 text-xs mt-1">Invite your first team member to get started</p>
                  <Button onClick={() => setShowInvite(true)} className="mt-4 bg-harvest text-white hover:bg-harvest/90 gap-2 text-sm">
                    <UserPlus className="w-4 h-4" /> Invite Team Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map(m => (
                    <TeamMemberCard
                      key={m.id}
                      member={m}
                      currentAdminId={admin?.id || admin?._id}
                      onRefresh={load}
                      onViewPermissions={(member) => setPermissionsMember(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* File Library + Audit Log tabs — not backed by an API yet. */}
          {(tab === "files" || tab === "activity") && (
            <div className="bg-white rounded-2xl border border-border/50 p-14 text-center">
              {tab === "files" ? <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" /> : <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />}
              <p className="text-slate-500 font-semibold text-sm">
                {tab === "files" ? "Shared file library" : "Team audit log"} is not available yet
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                This feature needs a dedicated backend endpoint. Team member management and
                module-access permissions are fully available on the Team Members tab.
              </p>
            </div>
          )}
        </>
      )}

      <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} onInvited={load} />
    </div>
  );
}
