import React, { useState } from "react";
import { Award, Download, Shield, Calendar, Hash, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import CertificateViewer from "@/components/lms/CertificateViewer";
import CourseFeedbackForm from "@/components/lms/student/CourseFeedbackForm";

const LEVEL_CONFIG = {
  level1: { label: "Level 1 — Foundation",    pill: "bg-harvest/10 text-harvest border-harvest/30",       accent: "#D97706", bar: "from-harvest to-amber-600" },
  level2: { label: "Level 2 — Professional",  pill: "bg-amber-50 text-amber-700 border-amber-200",        accent: "#D97706", bar: "from-amber-500 to-amber-600" },
  level3: { label: "Level 3 — Advanced",      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",  accent: "#059669", bar: "from-emerald-600 to-emerald-700" },
};

function CertCard({ enr, isOpen, onToggle, user }) {
  const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
  const certNum = `SOL-${enr.id?.slice(-8).toUpperCase() || "XXXXXXXX"}`;
  const completedDate = enr.completed_date
    ? new Date(enr.completed_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className={`bg-gradient-to-r ${cfg.bar} p-4 flex items-center gap-3`}>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-display font-bold text-sm truncate">{enr.course_title}</p>
          <span className="text-white/70 text-xs">{cfg.label}</span>
        </div>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Meta row */}
      <div className="px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Hash className="w-3.5 h-3.5" />
          <span>Cert No: <strong className="text-ink">{certNum}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Issued: <strong className="text-ink">{completedDate}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium ml-auto">
          <Shield className="w-3.5 h-3.5" />
          Verified
        </div>
      </div>

      {/* Collapsed action row */}
      {!isOpen && (
        <div className="px-4 py-3 flex gap-2">
          <Button
            size="sm"
            className="gap-1.5 text-white text-xs"
            style={{ backgroundColor: cfg.accent }}
            onClick={onToggle}
          >
            <Download className="w-3.5 h-3.5" /> View & Download PDF
          </Button>
        </div>
      )}

      {/* Expanded: full certificate + feedback */}
      {isOpen && (
        <div className="p-4 space-y-5">
          <CertificateViewer enrollment={enr} user={user} />
          <CourseFeedbackForm enrollment={enr} user={user} />
        </div>
      )}
    </div>
  );
}

export default function StudentCertificates({ enrollments, user }) {
  const certified = enrollments.filter(e => e.certificate_issued);
  const [openId, setOpenId] = useState(certified[0]?.id || null);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  if (certified.length === 0) {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">My Certificates</h2>
            <p className="text-white/50 text-sm">Download your NDIS training achievements</p>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Award className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-display font-bold text-xl text-ink mb-2">No Certificates Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Complete 100% of any NDIS Support Coordinator Training course to earn a professional PDF certificate of completion.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            {[
              { step: "1", icon: <BookOpen className="w-4 h-4" />, text: "Enrol in a training course" },
              { step: "2", icon: <Award className="w-4 h-4" />, text: "Complete all lessons & quizzes" },
              { step: "3", icon: <Download className="w-4 h-4" />, text: "Download your PDF certificate" },
            ].map(s => (
              <div key={s.step} className="bg-harvest/10 rounded-xl p-3 flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-harvest text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                <p className="text-xs text-harvest">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">My Certificates</h2>
            <p className="text-white/50 text-sm">
              {certified.length} certificate{certified.length !== 1 ? "s" : ""} earned — click any card to view & download PDF
            </p>
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-center flex-shrink-0">
          <p className="font-display font-bold text-3xl text-white">{certified.length}</p>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Earned</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700">
          <strong>Professional PDF certificates</strong> — Click "View & Download PDF" on any certificate below to generate and save a print-quality PDF to your device. Each certificate includes a unique verification number.
        </p>
      </div>

      {/* Certificate cards */}
      <div className="space-y-4">
        {certified.map(enr => (
          <CertCard
            key={enr.id}
            enr={enr}
            isOpen={openId === enr.id}
            onToggle={() => toggle(enr.id)}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}