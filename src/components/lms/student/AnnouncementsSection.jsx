import React, { useState } from "react";
import { Megaphone, Bell, BookOpen, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    id: 1, date: "3 Jun 2026", badge: "Important", badgeColor: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle, iconColor: "text-red-500",
    title: "NDIS Practice Standards Update — June 2026",
    body: "The NDIS Quality and Safeguards Commission has released updated Practice Standards effective 1 July 2026. All Level 2 and Level 3 course content has been reviewed and updated. Please review the new module on Advanced Compliance in your Level 2 or Level 3 course.",
    pinned: true,
  },
  {
    id: 2, date: "1 Jun 2026", badge: "New Module", badgeColor: "bg-harvest/10 text-harvest border-harvest/30",
    icon: BookOpen, iconColor: "text-harvest",
    title: "New Module Added: Crisis Management & De-escalation",
    body: "A new advanced module on Crisis Management and De-escalation has been added to Level 2 and Level 3 courses. This module includes 3 video lessons, practical case studies, and a quiz assessment. Students currently enrolled will find it in Module 2.",
  },
  {
    id: 3, date: "28 May 2026", badge: "Feature", badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle, iconColor: "text-emerald-500",
    title: "Certificate Downloads Now Live",
    body: "Students who have completed any NDIS Support Coordinator Training course can now download their Certificate of Completion as a PDF directly from the Certificates section. Certificates include a verification number.",
  },
  {
    id: 4, date: "20 May 2026", badge: "Welcome", badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Bell, iconColor: "text-amber-500",
    title: "Welcome to SOL Training Academy!",
    body: "We're excited to have you on board. SOL Training Academy is an Australian-based professional development platform offering NDIS Support Coordinator training at Level 1, 2 and 3. Our courses are self-paced, 100% online, and aligned with current NDIS Practice Standards. If you need support, please visit the Support Centre.",
  },
  {
    id: 5, date: "15 May 2026", badge: "Notice", badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Info, iconColor: "text-amber-500",
    title: "Training Resources Section Now Available",
    body: "You can now access NDIS guides, templates, and training documents in the Training Resources section of your dashboard. Includes the NDIS Price Guide 2025–26, Code of Conduct, and case note templates.",
  },
];

export default function AnnouncementsSection() {
  const [expanded, setExpanded] = useState({ 1: true });

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-harvest" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-lg">Announcements</h2>
          <p className="text-white/50 text-sm">Training updates, new modules, and important notices</p>
        </div>
        <div className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {ANNOUNCEMENTS.length}
        </div>
      </div>

      <div className="max-w-3xl space-y-3">
        {ANNOUNCEMENTS.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
            ${a.pinned ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
            <button className="w-full text-left p-5" onClick={() => toggle(a.id)}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 mt-0.5 ${a.iconColor}`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${a.badgeColor}`}>{a.badge}</span>
                    {a.pinned && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">📌 Pinned</span>}
                    <span className="text-[10px] text-slate-400 ml-auto">{a.date}</span>
                  </div>
                  <p className="font-display font-semibold text-ink text-sm leading-snug">{a.title}</p>
                </div>
                <div className="text-slate-300 flex-shrink-0 mt-0.5">
                  {expanded[a.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>
            {expanded[a.id] && (
              <div className="px-5 pb-5 pt-0 border-t border-slate-100 mt-0">
                <p className="text-sm text-slate-600 leading-relaxed">{a.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}