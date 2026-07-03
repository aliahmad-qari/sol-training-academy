import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, FolderOpen, Activity, UserPlus, Upload, RefreshCw,
  Loader2, Search, Shield, TrendingUp, FileText
} from "lucide-react";
import InviteMemberModal from "./team/InviteMemberModal";
import FileUploadModal from "./team/FileUploadModal";
import TeamMemberCard from "./team/TeamMemberCard";
import TeamFileRow from "./team/TeamFileRow";
import TeamActivityPanel from "./team/TeamActivityPanel";
import MemberPermissionsPanel from "./team/MemberPermissionsPanel";

const TABS = [
  { id: "members",  label: "Team Members", icon: Users },
  { id: "files",    label: "File Library",  icon: FolderOpen },
  { id: "activity", label: "Audit Log",     icon: Activity },
];

export default function AdminTeamManager() {
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [permissionsMember, setPermissionsMember] = useState(null); // member whose permissions are being viewed

  const load = async () => {
    setLoading(true);
    const [mems, fs, ls, me, envs] = await Promise.all([
      base44.entities.TeamMember.list("-created_date", 200),
      base44.entities.TeamFile.filter({ is_active: true }),
      base44.entities.TeamActivityLog.list("-created_date", 100),
      base44.auth.me(),
      base44.entities.CourseEnrollment.list("-created_date", 500),
    ]);
    setMembers(mems);
    setFiles(fs);
    setLogs(ls);
    setAdmin(me);
    setEnrollments(envs);
    setLoading(false);

    // If viewing a member's permissions, refresh their data too
    if (permissionsMember) {
      const updated = mems.find(m => m.id === permissionsMember.id);
      if (updated) setPermissionsMember(updated);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = [
    { label: "Total Members",   value: members.length,                                              icon: Users,      color: "text-blue-600 bg-blue-50" },
    { label: "Active",          value: members.filter(m => m.status === "active").length,            icon: Shield,     color: "text-emerald-600 bg-emerald-50" },
    { label: "Files Shared",    value: files.length,                                                 icon: FileText,   color: "text-amber-600 bg-amber-50" },
    { label: "Enrolled Courses",value: [...new Set(enrollments.map(e => e.user_id))].length,         icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
  ];

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search || m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.job_role || "").toLowerCase().includes(q);
    const matchRole    = roleFilter === "all" || m.role === roleFilter;
    const matchStatus  = statusFilter === "all" || m.status === statusFilter;
    const matchJobRole = jobRoleFilter === "all" || m.job_role === jobRoleFilter;
    return matchSearch && matchRole && matchStatus && matchJobRole;
  });

  const JOB_ROLES = ["Compliance Officer","Consultant","Support Coordinator","Trainer","Course Developer","Finance Officer","HR Officer","IT Administrator","Operations Manager","Marketing Coordinator","Student Support Officer","Other"];

  const filteredFiles = files.filter(f => {
    const matchSearch = !search || f.file_name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || f.category === catFilter;
    return matchSearch && matchCat;
  });

  // If viewing member permissions, render that panel instead
  if (permissionsMember) {
    return (
      <MemberPermissionsPanel
        member={permissionsMember}
        files={files}
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
          <p className="text-xs text-slate-500">Manage team members, file access permissions, and activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUpload(true)} variant="outline" className="gap-2 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload File
          </Button>
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
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
                      onRefresh={load}
                      onViewPermissions={(member) => setPermissionsMember(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* File Library Tab */}
          {tab === "files" && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" className="pl-9 h-9 text-sm" />
                </div>
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {["policy","procedure","training","compliance","template","report","other"].map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowUpload(true)} className="bg-harvest text-white hover:bg-harvest/90 gap-2 text-xs h-9">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </Button>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border/50 p-14 text-center">
                  <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-sm">No files uploaded yet</p>
                  <Button onClick={() => setShowUpload(true)} className="mt-4 bg-harvest text-white hover:bg-harvest/90 gap-2 text-sm">
                    <Upload className="w-4 h-4" /> Upload First File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(f => (
                    <TeamFileRow key={f.id} file={f} teamMembers={members} onRefresh={load} currentMemberRole="owner" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity / Audit Log Tab */}
          {tab === "activity" && (
            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-ink text-sm">Audit Log</h3>
                <span className="text-xs text-slate-400">{logs.length} entries</span>
              </div>
              <TeamActivityPanel logs={logs} />
            </div>
          )}
        </>
      )}

      <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} onInvited={load} admin={admin} />
      <FileUploadModal open={showUpload} onClose={() => setShowUpload(false)} onUploaded={load} admin={admin} teamMembers={members} />
    </div>
  );
}