import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STAGES = [
  { key: "enquiry",          label: "Enquiry",        short: "Lodged" },
  { key: "assessment",       label: "Assessment",     short: "Eligibility" },
  { key: "document_collect", label: "Documents",      short: "Collection" },
  { key: "application_prep", label: "Preparation",    short: "Application" },
  { key: "submitted",        label: "Submitted",      short: "Lodged" },
  { key: "audit",            label: "Audit",          short: "Review" },
  { key: "completed",        label: "Registered",     short: "Complete" },
];

const STATUS_TO_IDX = {
  new:              0,
  in_progress:      2,
  awaiting_payment: 1,
  paid:             3,
  completed:        6,
  cancelled:        -1,
};

export default function NDISProgressBar({ enquiries }) {
  const active = enquiries?.find(e => e.status !== "cancelled") || enquiries?.[0] || null;
  const currentIdx = active ? (STATUS_TO_IDX[active?.status] ?? 0) : -1;
  const isCancelled = active?.status === "cancelled";
  const total = STAGES.length - 1;
  const pct = currentIdx >= 0 ? Math.round((currentIdx / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-ink">NDIS Registration Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {active ? `Application for ${active.company_name || active.email || "your organisation"}` : "No active application"}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          isCancelled        ? "bg-slate-100 text-slate-500" :
          currentIdx >= 6   ? "bg-emerald-100 text-emerald-700" :
          currentIdx >= 0   ? "bg-amber-100 text-amber-700" :
                              "bg-slate-100 text-slate-500"
        }`}>
          {isCancelled ? "Cancelled" : currentIdx >= 6 ? "✓ Complete" : currentIdx >= 0 ? `${pct}% Complete` : "Not Started"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="w-full h-2 bg-slate-100 rounded-full">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-harvest to-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage steps */}
      <div className="relative flex items-start justify-between">
        {/* Connector line behind steps */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-0" />

        {STAGES.map((stage, idx) => {
          const state =
            currentIdx < 0       ? "upcoming" :
            idx < currentIdx     ? "done" :
            idx === currentIdx   ? "active" :
                                   "upcoming";

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 z-10 flex-1 min-w-0">
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                state === "done"    ? "bg-emerald-500 border-emerald-500" :
                state === "active"  ? "bg-harvest border-harvest shadow-md shadow-harvest/30 scale-110" :
                                     "bg-white border-slate-200"
              }`}>
                {state === "done"   ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                 state === "active" ? <Loader2 className="w-4 h-4 text-white animate-spin" /> :
                                     <Circle className="w-4 h-4 text-slate-300" />}
              </div>

              {/* Label */}
              <div className="text-center px-1">
                <p className={`text-[11px] font-semibold leading-tight transition-colors ${
                  state === "active"  ? "text-harvest" :
                  state === "done"    ? "text-emerald-600" :
                                       "text-slate-400"
                }`}>
                  {stage.label}
                </p>
                {state === "active" && (
                  <span className="inline-block mt-0.5 text-[9px] font-bold bg-harvest/10 text-harvest px-1.5 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current stage description */}
      {currentIdx >= 0 && !isCancelled && (
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Current Stage: {STAGES[currentIdx]?.label}</p>
          <p className="text-xs text-amber-700">
            {[
              "Your enquiry has been received and assigned to our compliance team.",
              "Our consultants are reviewing your eligibility and documentation needs.",
              "We are gathering your required compliance documents and policies.",
              "Your NDIS registration application is being prepared.",
              "Your application has been lodged with the NDIS Commission.",
              "The NDIS Commission is conducting an audit of your application.",
              "Congratulations! Your NDIS registration has been granted.",
            ][currentIdx]}
          </p>
        </div>
      )}
    </div>
  );
}