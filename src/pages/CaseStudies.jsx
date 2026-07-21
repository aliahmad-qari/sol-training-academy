import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, FileText, GraduationCap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";

const ENGAGEMENTS = [
  {
    id: 1,
    icon: FileText,
    tag: "NDIS Registration",
    tagColor: "bg-blue-100 text-blue-700",
    title: "New Provider Registration Preparation",
    subtitle: "Typical support for a new Australian provider",
    overview: "A new provider needs to understand registration groups, gather business evidence, prepare policies, and submit through official NDIS channels.",
    support: [
      "Review intended services and likely registration pathway",
      "Prepare business details, key personnel information, and supporting evidence checklist",
      "Provide branded policy, procedure, form, and register documentation",
      "Explain verification or certification audit expectations where relevant",
      "Support readiness conversations without taking control of official government accounts",
    ],
    outcome: "The client receives a clearer registration pathway, organised documents, and practical next steps for submission and audit preparation.",
  },
  {
    id: 2,
    icon: GraduationCap,
    tag: "Training",
    tagColor: "bg-amber-100 text-amber-700",
    title: "Support Coordination Team Training",
    subtitle: "Structured learning support for workers and organisations",
    overview: "An organisation wants consistent support coordination knowledge, internal training records, and a more confident team.",
    support: [
      "Map training needs against the team's role and service context",
      "Provide structured modules, learning materials, and assessment options",
      "Support team or individual enrolment pathways",
      "Help maintain completion records for internal governance",
      "Provide guidance on continuing professional development routines",
    ],
    outcome: "The organisation receives a clearer training structure and better records for workforce development.",
  },
  {
    id: 3,
    icon: Calculator,
    tag: "Finance & Compliance",
    tagColor: "bg-green-100 text-green-700",
    title: "Bookkeeping and Compliance Clean-Up",
    subtitle: "Operational support for growing service providers",
    overview: "A provider needs cleaner bookkeeping, BAS readiness, reporting structure, and better visibility across business operations.",
    support: [
      "Review current bookkeeping, BAS, payroll, and reporting arrangements",
      "Set up or tidy accounting workflows in common Australian accounting systems",
      "Prepare a practical reporting cadence for management decisions",
      "Identify missing records or process gaps for the business to address",
      "Connect finance routines with broader compliance and operational requirements",
    ],
    outcome: "The business receives more organised financial records and clearer monthly management processes.",
  },
];

function EngagementCard({ item, expanded, onToggle }) {
  const Icon = item.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-harvest" />
          </div>
          <div className="flex-1">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.tagColor}`}>{item.tag}</span>
            <p className="text-xs text-slate_mist mt-3 mb-1">{item.subtitle}</p>
            <h3 className="font-display font-bold text-xl md:text-2xl text-ink">{item.title}</h3>
          </div>
        </div>

        <p className="text-sm text-slate_mist leading-relaxed mb-5">{item.overview}</p>

        <button onClick={onToggle} className="flex items-center gap-2 text-sm font-semibold text-harvest hover:text-harvest/80 transition-colors">
          {expanded ? "Hide Details" : "View Support Details"}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-5 space-y-5 text-sm">
                <div>
                  <h4 className="font-display font-semibold text-ink mb-2">Typical Support</h4>
                  <ul className="space-y-2">
                    {item.support.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-slate_mist">
                        <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-chalk rounded-xl p-4 border border-border/50">
                  <h4 className="font-display font-semibold text-ink mb-1">Expected Deliverable</h4>
                  <p className="text-slate_mist leading-relaxed">{item.outcome}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function CaseStudies() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Engagement Examples</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">
              How We Typically Support Clients
            </h1>
            <p className="text-lg text-slate_mist max-w-2xl mx-auto">
              These are general examples of SOL Business Consultant service pathways. They are not client case studies, testimonials, or guarantees of outcomes.
            </p>
          </motion.div>

          <div className="space-y-8">
            {ENGAGEMENTS.map((item) => (
              <EngagementCard key={item.id} item={item} expanded={expanded === item.id} onToggle={() => setExpanded(expanded === item.id ? null : item.id)} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 bg-ink rounded-2xl p-10 text-center">
            <h2 className="font-display font-bold text-2xl text-white mb-2">Want to Discuss Your Situation?</h2>
            <p className="text-white/60 mb-6">Book a free consultation and we will map the most suitable pathway for your business before recommending paid work.</p>
            <Link to="/get-started">
              <Button className="bg-harvest hover:bg-harvest/90 text-white font-display px-8 py-5 gap-2 group">
                Get My Free Assessment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
