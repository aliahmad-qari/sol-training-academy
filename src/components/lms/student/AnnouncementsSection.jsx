import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Megaphone, Bell, BookOpen, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const BADGE_ICONS = {
  Important:   { icon: AlertCircle,  color: "text-red-500",     bg: "bg-red-100 text-red-700 border-red-200" },
  "New Module":{ icon: BookOpen,     color: "text-harvest",     bg: "bg-harvest/10 text-harvest border-harvest/30" },
  Feature:     { icon: CheckCircle,  color: "text-emerald-500", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Notice:      { icon: Info,         color: "text-amber-500",   bg: "bg-amber-100 text-amber-700 border-amber-200" },
  Welcome:     { icon: Bell,         color: "text-amber-500",   bg: "bg-amber-100 text-amber-700 border-amber-200" },
};

const DEFAULT_BADGE = { icon: Megaphone, color: "text-slate-500", bg: "bg-slate-100 text-slate-600 border-slate-200" };

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [expanded, setExpanded]           = useState({});

  useEffect(() => {
    apiClient.get("/announcements")
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setAnnouncements(data);
        // Auto-expand the first pinned or first item
        const first = data.find(a => a.pinned) || data[0];
        if (first) setExpanded({ [first._id || first.id]: true });
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-4 sm:p-6 mb-6 flex items-center gap-3 sm:gap-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-6 h-6 text-harvest" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-white text-base sm:text-lg">Announcements</h2>
          <p className="text-white/50 text-xs sm:text-sm">Training updates, new modules, and important notices</p>
        </div>
        {!loading && announcements.length > 0 && (
          <div className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
            {announcements.length}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-8 sm:p-16 text-center">
          <Megaphone className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">No announcements at this time.</p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-3">
          {announcements.map(a => {
            const id = a._id || a.id;
            const cfg = BADGE_ICONS[a.badge] || DEFAULT_BADGE;
            const Icon = cfg.icon;
            return (
              <div key={id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                ${a.pinned ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
                <button className="w-full text-left p-4 sm:p-5" onClick={() => toggle(id)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 mt-0.5 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg}`}>{a.badge}</span>
                        {a.pinned && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">📌 Pinned</span>}
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </span>
                      </div>
                      <p className="font-display font-semibold text-ink text-sm leading-snug">{a.title}</p>
                    </div>
                    <div className="text-slate-300 flex-shrink-0 mt-0.5">
                      {expanded[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>
                {expanded[id] && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{a.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
