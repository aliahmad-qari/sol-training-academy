import React from "react";
import NDISTemplatesLibrary from "@/components/client/NDISTemplatesLibrary";
import { Card } from "@/components/ui/card";
import { FileDown, FolderOpen, CheckSquare, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    icon: FileDown,
    color: "bg-blue-100 text-blue-600",
    title: "1. Download a template",
    desc: "Choose a document from the library below and download it from the official NDIS source.",
  },
  {
    icon: FolderOpen,
    color: "bg-amber-100 text-amber-600",
    title: "2. Customise for your org",
    desc: "Fill in your organisation's details, policies, and procedures into the template.",
  },
  {
    icon: Upload,
    color: "bg-emerald-100 text-emerald-600",
    title: "3. Upload for review",
    desc: (
      <>
        Upload your completed document in the{" "}
        <Link to="/client-portal/documents" className="font-semibold text-harvest underline hover:text-harvest/80">
          Documents section
        </Link>{" "}
        for our compliance team to review.
      </>
    ),
  },
  {
    icon: CheckSquare,
    color: "bg-purple-100 text-purple-600",
    title: "4. Get verified",
    desc: "Our consultants review and provide feedback so your documents meet NDIS audit requirements.",
  },
];

export default function PortalTemplates() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Compliance Templates</h1>
        <p className="text-slate-500 text-sm">Download free NDIS policy and compliance document templates to get started on your own.</p>
      </div>

      {/* Getting started steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="p-4 border-border/50 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${step.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-sm text-ink mb-1">{step.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Template library */}
      <NDISTemplatesLibrary />
    </div>
  );
}