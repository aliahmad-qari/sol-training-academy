import React from "react";
import { Briefcase, CheckCircle, Clock, AlertCircle, FileCheck, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROGRESS_STEPS = [
  { step: 1, label: "Initial Assessment", icon: FileCheck },
  { step: 2, label: "Documentation Prepared", icon: Zap },
  { step: 3, label: "Compliance Review", icon: CheckCircle },
  { step: 4, label: "Ready for Submission", icon: Users },
];

export default function ProjectsDashboard({ enquiries }) {
  const ndisEnquiries = enquiries.filter(e => e.service_type === "ndis_registration");

  if (ndisEnquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-display font-semibold text-ink text-lg mb-2">No Active NDIS Projects</h3>
        <p className="text-slate-500 text-sm">Start your NDIS registration journey by creating a new enquiry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ndisEnquiries.map(project => {
        // Determine progress based on status
        let progressPercent = 0;
        let currentStep = 0;
        
        if (project.status === "new") {
          progressPercent = 10;
          currentStep = 1;
        } else if (project.status === "in_progress") {
          progressPercent = 50;
          currentStep = 2;
        } else if (project.status === "awaiting_payment") {
          progressPercent = 75;
          currentStep = 3;
        } else if (project.status === "paid" || project.status === "completed") {
          progressPercent = 100;
          currentStep = 4;
        }

        return (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h4 className="font-display font-bold text-lg text-ink mb-1">
                  {project.company_name || "NDIS Registration"}
                </h4>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  NDIS Provider Registration Package
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  project.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : project.status === "in_progress"
                    ? "bg-blue-100 text-blue-700"
                    : project.status === "awaiting_payment"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {project.status === "completed"
                    ? "Complete"
                    : project.status === "in_progress"
                    ? "In Progress"
                    : project.status === "awaiting_payment"
                    ? "Awaiting Payment"
                    : "Pending"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Registration Progress</span>
                <span className="text-xs font-bold text-harvest">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-harvest to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-5">
              <div className="grid grid-cols-4 gap-2">
                {PROGRESS_STEPS.map((item) => {
                  const isCompleted = item.step <= currentStep;
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                        isCompleted
                          ? "bg-harvest text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-[10px] font-semibold text-center leading-tight ${
                        isCompleted ? "text-ink" : "text-slate-400"
                      }`}>
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-3 gap-4 pt-5 border-t border-slate-100">
              {project.selected_package && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Package</p>
                  <p className="font-semibold text-sm text-ink capitalize">{project.selected_package}</p>
                </div>
              )}
              {project.package_price && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Investment</p>
                  <p className="font-display font-bold text-lg text-harvest">${project.package_price.toLocaleString()}</p>
                </div>
              )}
              {project.created_date && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Started</p>
                  <p className="font-semibold text-sm text-ink">
                    {new Date(project.created_date).toLocaleDateString("en-AU", { 
                      year: "numeric", 
                      month: "short", 
                      day: "numeric" 
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Status Message */}
            {project.status === "completed" && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  <strong>Registration Complete!</strong> Your NDIS registration documents are ready. Contact our team for final submission details.
                </p>
              </div>
            )}

            {project.status === "in_progress" && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Your registration is being prepared. We'll notify you when documents are ready for review.
                </p>
              </div>
            )}

            {project.status === "awaiting_payment" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Documents are ready for review. Please process payment to proceed with final submission.
                </p>
              </div>
            )}

            {project.status === "new" && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">
                  We're reviewing your initial enquiry. You'll hear from us within 1 business day.
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}