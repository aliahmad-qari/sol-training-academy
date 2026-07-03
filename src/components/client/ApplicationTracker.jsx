import React from "react";
import { CheckCircle, Clock, Circle, AlertCircle, ChevronRight } from "lucide-react";

const NDIS_STAGES = [
  { key: "enquiry",          label: "Enquiry Received",         desc: "Your enquiry has been lodged and assigned to our team." },
  { key: "assessment",       label: "Initial Assessment",       desc: "Our consultants are reviewing your eligibility and documentation needs." },
  { key: "document_collect", label: "Document Collection",      desc: "Gathering required compliance documents and policies." },
  { key: "application_prep", label: "Application Preparation",  desc: "Preparing your NDIS registration application materials." },
  { key: "submitted",        label: "Application Submitted",    desc: "Your application has been lodged with the NDIS Commission." },
  { key: "audit",            label: "Audit / Review",           desc: "NDIS Commission is auditing your application." },
  { key: "completed",        label: "Registration Granted",     desc: "Congratulations! Your NDIS registration is complete." },
];

// Map enquiry statuses to pipeline stage
const STATUS_TO_STAGE = {
  new:              0,
  in_progress:      2,
  awaiting_payment: 1,
  paid:             3,
  completed:        6,
  cancelled:        -1,
};

function StageIcon({ state }) {
  if (state === "done")    return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  if (state === "active")  return <div className="w-5 h-5 rounded-full border-2 border-harvest bg-harvest/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-harvest animate-pulse" /></div>;
  return <Circle className="w-5 h-5 text-slate-300" />;
}

export default function ApplicationTracker({ enquiries }) {
  // Focus on the most recent non-cancelled enquiry (or null if none)
  const active = enquiries?.find(e => e.status !== "cancelled") || enquiries?.[0] || null;
  const currentStageIdx = active ? (STATUS_TO_STAGE[active?.status] ?? 0) : -1;
  const isCancelled = active?.status === "cancelled";
  const hasEnquiry = !!active;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ink to-slate-700 px-6 py-5 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-white text-lg">Application Tracker</h3>
          <p className="text-white/60 text-sm mt-0.5">
            {active?.company_name || "Your NDIS Application"} — Real-time Status
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          isCancelled ? "bg-slate-500/30 text-slate-200" :
          currentStageIdx >= 6 ? "bg-emerald-500/30 text-emerald-200" :
          "bg-harvest/30 text-amber-200"
        }`}>
          {isCancelled ? "Cancelled" : currentStageIdx >= 6 ? "✓ Complete" : "In Progress"}
        </span>
      </div>

      {isCancelled ? (
        <div className="px-6 py-10 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">This application has been cancelled. Please contact us to restart.</p>
        </div>
      ) : (
        <div className="px-6 py-6">
          {/* No enquiry yet — prompt */}
          {!hasEnquiry && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Your NDIS registration journey starts here. Submit an enquiry to activate real-time progress tracking.</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate_mist mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold text-ink">
                {hasEnquiry ? `${Math.round((Math.max(0, currentStageIdx) / (NDIS_STAGES.length - 1)) * 100)}%` : "0% — Not started"}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-harvest to-amber-500 rounded-full transition-all duration-700"
                style={{ width: hasEnquiry ? `${Math.round((Math.max(0, currentStageIdx) / (NDIS_STAGES.length - 1)) * 100)}%` : "0%" }}
              />
            </div>
          </div>

          {/* Stage pipeline */}
          <div className="space-y-0">
            {NDIS_STAGES.map((stage, idx) => {
              const state = !hasEnquiry ? "upcoming" : idx < currentStageIdx ? "done" : idx === currentStageIdx ? "active" : "upcoming";
              return (
                <div key={stage.key} className="flex gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`flex-shrink-0 mt-0.5 transition-all ${state === "active" ? "scale-110" : ""}`}>
                      <StageIcon state={state} />
                    </div>
                    {idx < NDIS_STAGES.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 min-h-[20px] rounded-full transition-colors ${
                        idx < currentStageIdx ? "bg-emerald-300" : "bg-slate-200"
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-4 flex-1 min-w-0 ${idx === NDIS_STAGES.length - 1 ? "pb-0" : ""}`}>
                    <p className={`text-sm font-semibold leading-tight ${
                      state === "active" ? "text-harvest" :
                      state === "done"   ? "text-ink" :
                      "text-slate-400"
                    }`}>
                      {stage.label}
                      {state === "active" && (
                        <span className="ml-2 inline-flex items-center text-[10px] font-bold bg-harvest/10 text-harvest px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    {state !== "upcoming" && (
                      <p className="text-xs text-slate_mist mt-0.5 leading-relaxed">{stage.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-2 text-xs text-slate_mist">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Last updated: {active?.updated_date ? new Date(active.updated_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            <a href="/#contact" className="text-harvest font-semibold hover:underline">Contact us</a>
          </div>
        </div>
      )}
    </div>
  );
}