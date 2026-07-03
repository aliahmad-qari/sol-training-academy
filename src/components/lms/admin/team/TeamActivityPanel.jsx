import React from "react";
import { Activity, FileDown, Eye, LogIn, Upload, UserPlus, BookOpen, Lock } from "lucide-react";

const ACTION_CONFIG = {
  file_view:          { icon: Eye,       color: "bg-blue-100 text-blue-600",    label: "Viewed File" },
  file_download:      { icon: FileDown,  color: "bg-green-100 text-green-600",  label: "Downloaded File" },
  login:              { icon: LogIn,     color: "bg-purple-100 text-purple-600",label: "Logged In" },
  course_progress:    { icon: BookOpen,  color: "bg-amber-100 text-amber-600",  label: "Course Progress" },
  invite_sent:        { icon: UserPlus,  color: "bg-teal-100 text-teal-600",    label: "Invite Sent" },
  file_upload:        { icon: Upload,    color: "bg-indigo-100 text-indigo-600",label: "File Uploaded" },
  member_added:       { icon: UserPlus,  color: "bg-emerald-100 text-emerald-600",label: "Member Added" },
  permission_changed: { icon: Lock,      color: "bg-rose-100 text-rose-600",    label: "Permission Changed" },
};

export default function TeamActivityPanel({ logs }) {
  if (!logs.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Activity className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm">No activity yet</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {logs.slice(0, 50).map(log => {
        const cfg = ACTION_CONFIG[log.action] || { icon: Activity, color: "bg-slate-100 text-slate-500", label: log.action };
        const Icon = cfg.icon;
        return (
          <div key={log.id} className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink font-medium">
                <span className="font-semibold">{log.member_name || "System"}</span>
                {" — "}{cfg.label}
                {log.resource_name && <span className="text-slate-500">: "{log.resource_name}"</span>}
              </p>
              {log.details && <p className="text-[11px] text-slate-400">{log.details}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(log.created_date).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}