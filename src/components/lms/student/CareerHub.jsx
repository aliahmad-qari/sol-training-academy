import React, { useState } from "react";
import {
  Target, ChevronRight, DollarSign, Award, ExternalLink, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CAREER_PATHS = [
  {
    title: "Support Coordinator",
    salary: "$75,000 – $90,000",
    demand: "Very High",
    demandColor: "text-emerald-600 bg-emerald-50",
    icon: "🤝",
    description: "Assist NDIS participants to navigate their plans, connect with services, and build independence.",
    requirements: ["Certificate IV or above in Disability/Community Services", "Level 1 NDIS Training", "NDIS Worker Screening Check"],
    levels: ["Entry", "Mid", "Senior"],
  },
  {
    title: "Specialist Support Coordinator",
    salary: "$90,000 – $115,000",
    demand: "High",
    demandColor: "text-blue-600 bg-blue-50",
    icon: "🎯",
    description: "Work with participants with complex needs, coordinate specialist services and crisis management.",
    requirements: ["Degree in Social Work / Allied Health", "Level 2 & 3 NDIS Training", "3+ years experience"],
    levels: ["Mid", "Senior", "Executive"],
  },
  {
    title: "NDIS Plan Manager",
    salary: "$65,000 – $80,000",
    demand: "High",
    demandColor: "text-blue-600 bg-blue-50",
    icon: "📊",
    description: "Manage NDIS funding, invoicing and financial reporting on behalf of participants.",
    requirements: ["Financial or business background", "NDIS Plan Management training", "Strong admin skills"],
    levels: ["Entry", "Mid"],
  },
  {
    title: "NDIS Provider Manager",
    salary: "$100,000 – $130,000",
    demand: "Growing",
    demandColor: "text-amber-600 bg-amber-50",
    icon: "🏢",
    description: "Oversee NDIS service delivery organisations, compliance, and team management.",
    requirements: ["Management experience", "Level 3 NDIS Training", "Registration as NDIS provider"],
    levels: ["Senior", "Executive"],
  },
];

const INDUSTRY_INSIGHTS = [
  { icon: "📈", title: "NDIS Participant Growth", stat: "650,000+", desc: "Active NDIS participants as of 2026, growing 8% annually" },
  { icon: "💼", title: "Support Coordinator Jobs", stat: "28,000+", desc: "Current job openings across Australia for SC roles" },
  { icon: "🎓", title: "Qualified Professionals", stat: "Only 42%", desc: "Of SC workers hold formal training qualifications — high demand" },
  { icon: "💰", title: "Average SC Salary (AU)", stat: "$82,000", desc: "Average salary for Support Coordinators nationally" },
];

const RESOURCES = [
  { title: "NDIS Commission — Career Pathways", href: "https://www.ndiscommission.gov.au/workers", icon: ExternalLink },
  { title: "jobactive.gov.au — Disability Sector Jobs", href: "https://www.jobactive.gov.au", icon: ExternalLink },
  { title: "SEEK — Support Coordinator Roles", href: "https://www.seek.com.au/support-coordinator-jobs", icon: ExternalLink },
  { title: "NDIS Workforce Innovation", href: "https://www.ndis.gov.au/providers/workers", icon: ExternalLink },
];

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("pathways");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Career Hub</h2>
            <p className="text-white/50 text-sm">NDIS Support Coordinator career pathways, industry insights & resources</p>
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "pathways", label: "Career Pathways" },
            { id: "insights", label: "Industry Insights" },
            { id: "resources", label: "Employment Resources" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-harvest text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Career Pathways */}
      {activeTab === "pathways" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Your SOL Training Academy certification directly prepares you for these in-demand Australian NDIS roles.</p>
          {CAREER_PATHS.map((path, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{path.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display font-bold text-ink text-base">{path.title}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${path.demandColor}`}>
                        {path.demand} Demand
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{path.description}</p>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-ink">{path.salary}</span>
                        <span className="text-slate-400 text-xs">/ year</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Requirements</p>
                      <div className="flex flex-wrap gap-1.5">
                        {path.requirements.map((r, ri) => (
                          <span key={ri} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Career Levels</p>
                      <div className="flex items-center gap-1.5">
                        {["Entry", "Mid", "Senior", "Executive"].map((lvl, li) => (
                          <React.Fragment key={lvl}>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              path.levels.includes(lvl)
                                ? "bg-harvest text-white"
                                : "bg-slate-100 text-slate-300"
                            }`}>{lvl}</span>
                            {li < 3 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Industry Insights */}
      {activeTab === "insights" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {INDUSTRY_INSIGHTS.map((ins, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
                <div className="text-3xl mb-3">{ins.icon}</div>
                <p className="font-display font-bold text-2xl text-ink mb-1">{ins.stat}</p>
                <p className="font-semibold text-sm text-ink mb-1">{ins.title}</p>
                <p className="text-xs text-slate-500">{ins.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
            <h3 className="font-display font-semibold text-ink mb-4">2026 NDIS Industry Update</h3>
            <div className="space-y-3">
              {[
                { date: "May 2026", text: "NDIS Practice Standards updated — new worker training requirements effective July 2026" },
                { date: "Apr 2026", text: "Australian Government announces $3.2B investment in NDIS workforce development" },
                { date: "Mar 2026", text: "New Specialised Support Coordinator role recognised in NDIS Price Guide 2025–26" },
                { date: "Feb 2026", text: "NDIS Commission releases updated Code of Conduct guidance for registered providers" },
              ].map((u, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 text-[10px] font-bold text-slate-400 pt-0.5 w-16">{u.date}</div>
                  <p className="text-sm text-slate-600">{u.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employment Resources */}
      {activeTab === "resources" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {RESOURCES.map((r, i) => (
              <a key={i} href={r.href} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm hover:shadow-md hover:border-harvest/40 transition-all group flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0">
                  <r.icon className="w-5 h-5 text-harvest" />
                </div>
                <p className="text-sm font-medium text-ink group-hover:text-harvest transition-colors flex-1">{r.title}</p>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-harvest transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-display font-bold text-white text-lg mb-2">Complete Your Certification</h3>
            <p className="text-white/50 text-sm mb-4 max-w-md mx-auto">
              Finishing your Level 1, 2, and 3 NDIS Support Coordinator Training significantly increases your employability and earning potential in the Australian NDIS sector.
            </p>
            <Button className="bg-harvest text-white hover:bg-harvest/90 gap-2">
              <Award className="w-4 h-4" /> View Courses
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}