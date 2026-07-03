import React, { useState } from "react";
import { Download, FileText, Shield, ClipboardList, BookOpen, Users, Star, Lock, AlertCircle, Briefcase, HeartHandshake, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TEMPLATES = [
  {
    category: "Registration & Compliance",
    icon: Shield,
    color: "text-blue-600 bg-blue-50",
    items: [
      {
        title: "NDIS Provider Registration Checklist",
        desc: "Step-by-step checklist covering all requirements for initial NDIS provider registration.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/ndis-provider-registration",
      },
      {
        title: "NDIS Code of Conduct — Policy Template",
        desc: "Ready-to-use policy template aligned with the NDIS Code of Conduct obligations.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/ndis-code-conduct-guidance-providers",
      },
      {
        title: "Incident Management Policy Template",
        desc: "Compliant incident reporting policy for NDIS registered providers.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/ndis-reportable-incidents",
      },
      {
        title: "Quality & Safeguards Self-Assessment",
        desc: "Self-assessment tool against the NDIS Practice Standards for initial and renewal audits.",
        type: "XLSX",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/registered-providers/provider-registration/registration-audit",
      },
      {
        title: "NDIS Practice Standards Summary",
        desc: "Plain-English summary of all NDIS Practice Standards modules relevant to registered providers.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/registered-providers/ndis-practice-standards-and-quality-indicators",
      },
    ],
  },
  {
    category: "Policies & Procedures",
    icon: ClipboardList,
    color: "text-emerald-600 bg-emerald-50",
    items: [
      {
        title: "Complaints & Feedback Policy",
        desc: "Template for managing participant complaints and feedback in line with NDIS Practice Standards.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/complaints-management",
      },
      {
        title: "Safeguarding Vulnerable Persons Policy",
        desc: "Safeguarding policy template covering risk identification, reporting obligations, and safe practices.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/worker-screening",
      },
      {
        title: "Privacy & Confidentiality Policy",
        desc: "NDIS-aligned privacy policy covering participant data handling and information security.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/privacy",
      },
      {
        title: "Risk Management Policy & Register",
        desc: "Risk management framework and register template for NDIS service providers.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/registered-providers/ndis-practice-standards-and-quality-indicators",
      },
      {
        title: "Medication Management Policy",
        desc: "Policy template for safe medication administration and storage for support providers.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/medication-administration",
      },
    ],
  },
  {
    category: "Support Coordination",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
    items: [
      {
        title: "Support Coordination Service Agreement",
        desc: "Standard service agreement template for support coordination engagements with participants.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/service-agreements",
      },
      {
        title: "Participant Goal Setting Worksheet",
        desc: "Structured worksheet to help capture participant goals and align them with NDIS plan funding.",
        type: "PDF",
        free: true,
        url: "https://www.ndis.gov.au/participants/using-your-ndis-plan/goals",
      },
      {
        title: "Progress Note Template",
        desc: "Compliant progress note format for documenting support delivered to NDIS participants.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/record-keeping",
      },
      {
        title: "Support Plan Template",
        desc: "Comprehensive support plan template for documenting participant needs and service delivery approach.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/registered-providers/delivering-services",
      },
      {
        title: "Participant Capacity Building Plan",
        desc: "Template for mapping capacity building goals across NDIS funding categories.",
        type: "DOCX",
        free: true,
        url: "https://www.ndis.gov.au/understanding/supports-funded-ndis/capacity-building-supports",
      },
    ],
  },
  {
    category: "Training & Induction",
    icon: BookOpen,
    color: "text-harvest bg-harvest/10",
    items: [
      {
        title: "Worker Orientation Module Guide",
        desc: "Summary guide to the NDIS mandatory worker orientation module and how to complete it.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/workers/worker-orientation-module",
      },
      {
        title: "Staff Induction Checklist",
        desc: "Comprehensive onboarding checklist for new NDIS support workers covering mandatory training.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/worker-training",
      },
      {
        title: "Mandatory Reporting Training Guide",
        desc: "Training resource on mandatory reporting obligations for NDIS support workers.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/workers/reportable-incidents",
      },
    ],
  },
  {
    category: "Employment & HR",
    icon: Briefcase,
    color: "text-rose-600 bg-rose-50",
    items: [
      {
        title: "NDIS Worker Screening Declaration",
        desc: "Template declaration form for workers subject to the NDIS Worker Screening Check.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/worker-screening",
      },
      {
        title: "Position Description — Support Worker",
        desc: "Customisable position description template for disability support worker roles.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/workers",
      },
      {
        title: "Performance Appraisal Template",
        desc: "Staff performance review template aligned with NDIS Practice Standards worker competencies.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/workforce-capability-framework",
      },
    ],
  },
  {
    category: "Participant Rights & Advocacy",
    icon: Scale,
    color: "text-teal-600 bg-teal-50",
    items: [
      {
        title: "Participant Rights & Responsibilities Guide",
        desc: "Plain-language guide explaining participant rights under the NDIS and the Code of Conduct.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/participants/rights-and-responsibilities",
      },
      {
        title: "Informed Consent Form Template",
        desc: "Template for obtaining valid informed consent from NDIS participants for services.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/service-delivery",
      },
      {
        title: "Easy Read Complaint Guide",
        desc: "Easy-read format complaint procedure for participants with communication needs.",
        type: "PDF",
        free: true,
        url: "https://www.ndiscommission.gov.au/participants/complaints",
      },
    ],
  },
  {
    category: "Health & Safety",
    icon: HeartHandshake,
    color: "text-amber-600 bg-amber-50",
    items: [
      {
        title: "WHS Policy Template for NDIS Providers",
        desc: "Work health and safety policy template compliant with state WHS legislation and NDIS standards.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/registered-providers/delivering-services",
      },
      {
        title: "Emergency & Evacuation Plan Template",
        desc: "Emergency management plan template for NDIS service delivery locations.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/resources/restrictive-practices",
      },
      {
        title: "Behaviour Support Plan Template",
        desc: "Framework template for developing NDIS-compliant behaviour support plans.",
        type: "DOCX",
        free: true,
        url: "https://www.ndiscommission.gov.au/providers/behaviour-support",
      },
    ],
  },
];

export default function NDISTemplatesLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...TEMPLATES.map(t => t.category)];
  const totalCount = TEMPLATES.reduce((n, c) => n + c.items.length, 0);

  const filtered = activeCategory === "all"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleDownload = (item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
    toast.success(`Opening "${item.title}" — official NDIS resource.`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-ink to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-harvest/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl mb-1">NDIS Document Templates Library</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Download essential compliance documents, policy templates, and NDIS registration resources to get started. All templates are aligned with current NDIS Practice Standards.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Star className="w-3.5 h-3.5 text-harvest" />
              <span className="text-xs text-white/60">{totalCount} free templates across {TEMPLATES.length} categories · Official NDIS sources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Getting started notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-800 mb-0.5">How to use these templates</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            All documents link directly to official NDIS Commission resources. Download, customise each template for your organisation, and upload completed documents to your <a href="/client-portal/documents" className="font-semibold underline">Documents section</a> for our team to review.
          </p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeCategory === cat
                ? "bg-harvest text-white border-harvest shadow-sm"
                : "bg-white text-slate-600 border-border/60 hover:border-harvest/40 hover:text-harvest"
            }`}
          >
            {cat === "all" ? `All Templates (${totalCount})` : cat}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="space-y-5">
        {filtered.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.category} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-slate-50/60">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${group.color}`}>
                  <GroupIcon className="w-4 h-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-ink">{group.category}</h4>
                <span className="ml-auto text-[10px] font-bold text-slate_mist bg-slate-100 px-2 py-0.5 rounded-full">
                  {group.items.length} templates
                </span>
              </div>

              {/* Template rows */}
              <div className="divide-y divide-border/30">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-slate_mist" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold text-ink text-sm">{item.title}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate_mist">{item.type}</span>
                        {item.free && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">FREE</span>
                        )}
                      </div>
                      <p className="text-xs text-slate_mist leading-relaxed">{item.desc}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(item)}
                      className="gap-1.5 text-xs h-8 bg-harvest hover:bg-harvest/90 text-white flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="bg-harvest/5 border border-harvest/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate_mist leading-relaxed">
          Need a customised policy pack or full registration document bundle for your organisation?{" "}
          <a href="/#contact" className="text-harvest font-semibold hover:underline">Contact our compliance team</a> — we build bespoke document suites tailored to your NDIS registration category.
        </p>
      </div>
    </div>
  );
}