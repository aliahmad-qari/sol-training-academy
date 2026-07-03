import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, CheckCircle, Star, Quote, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";

const CASE_STUDIES = [
  {
    id: 1,
    tag: "NDIS Registration",
    tagColor: "bg-blue-100 text-blue-700",
    title: "From Zero to NDIS Registered in 58 Days",
    subtitle: "Allied health start-up, Melbourne VIC",
    stat1: { value: "58", label: "Days to registration" },
    stat2: { value: "100%", label: "Audit pass rate" },
    stat3: { value: "$0", label: "Government fines incurred" },
    challenge: "A physiotherapy practice in Melbourne wanted to expand into NDIS-funded services but had no prior experience with the Quality and Safeguards Framework. The team had tried to navigate the NDIS Commission's portal independently for 4 months without success, facing repeated form rejections.",
    solution: [
      "Conducted a full registration pathway assessment and identified the correct registration groups for mobility support and therapeutic supports",
      "Prepared all required evidence documentation including policy packs, staff credential verifications, and practice governance frameworks",
      "Managed all NDIS Commission portal submissions and correspondence on behalf of the client",
      "Coordinated the third-party audit with an approved quality auditor and provided mock audit preparation",
      "Delivered a 3-hour team training session on NDIS Code of Conduct and practice standards",
    ],
    outcome: "The practice received full NDIS registration covering 8 registration groups within 58 days of engaging SOL. They now serve over 40 NDIS participants and generate $280,000+ in annual NDIS revenue.",
    quote: "We had spent months trying to do this ourselves. SOL handled everything — from the paperwork to the audit — and we were registered faster than we ever thought possible.",
    quoteAuthor: "Practice Owner, Melbourne (identity protected)",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80",
  },
  {
    id: 2,
    tag: "Support Coordination Training",
    tagColor: "bg-amber-100 text-amber-700",
    title: "Upskilling a 12-Person Support Coordination Team",
    subtitle: "Disability services organisation, Western Sydney",
    stat1: { value: "12", label: "Staff trained" },
    stat2: { value: "94%", label: "Assessment pass rate" },
    stat3: { value: "3 wks", label: "Delivery timeline" },
    challenge: "A growing disability services provider in Western Sydney had 12 Support Coordinators working across complex NDIS plans but lacked formal training documentation required for their upcoming NDIS audit. Several staff had no certification to show auditors.",
    solution: [
      "Delivered the full Level 1–3 Support Coordination curriculum to 12 staff across 3 weeks via blended online and face-to-face sessions",
      "Customised training materials with the organisation's own case studies and branding",
      "Provided individual knowledge assessments per module with detailed feedback",
      "Issued Certificates of Completion to all staff who met the assessment threshold",
      "Provided a training register and audit-ready documentation package for the NDIS auditor",
    ],
    outcome: "All 12 staff received certificates. The organisation passed their NDIS audit with zero findings related to staff competency. The CEO noted that staff confidence and plan quality improved noticeably within 6 weeks.",
    quote: "The training was practical, relevant, and exactly what our team needed. The audit documentation alone was worth the investment.",
    quoteAuthor: "CEO, Disability Services Organisation, NSW (identity protected)",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80",
  },
  {
    id: 3,
    tag: "Accountancy & Compliance",
    tagColor: "bg-green-100 text-green-700",
    title: "Cleaning Up 18 Months of Backlogged NDIS Accounts",
    subtitle: "SIL provider, Brisbane QLD",
    stat1: { value: "18mo", label: "Backlog cleared" },
    stat2: { value: "$47k", label: "Recovered in missed claims" },
    stat3: { value: "6 wks", label: "Reconciliation time" },
    challenge: "A Supported Independent Living (SIL) provider in Brisbane had 18 months of unreconciled NDIS claims, incorrect PRODA uploads, and an impending ATO audit. Their bookkeeper had left unexpectedly and they had no one to manage their accounts.",
    solution: [
      "Performed a full NDIS financial audit covering 18 months of transactions across multiple participants",
      "Reconciled all NDIS portal claims against bank statements and identified $47,000 in unclaimed support hours",
      "Lodged corrected BAS statements and communicated with the ATO on the client's behalf",
      "Set up Xero with NDIS-specific chart of accounts and automated bank feeds",
      "Established a monthly reporting cadence with participant-level profitability reporting",
    ],
    outcome: "Within 6 weeks, all accounts were reconciled, $47,000 in missed claims was recovered, and the ATO audit was resolved with no penalties. The provider now has full financial visibility and clean records ahead of their next NDIS audit.",
    quote: "I didn't realise how much money we were leaving on the table. SOL found $47,000 we didn't know we were owed and sorted out our ATO mess. Absolute lifesavers.",
    quoteAuthor: "Operations Manager, SIL Provider, QLD (identity protected)",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80",
  },
];

function CaseStudyCard({ cs, expanded, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img src={cs.image} alt={cs.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${cs.tagColor}`}>{cs.tag}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <p className="text-xs text-slate_mist mb-1">{cs.subtitle}</p>
        <h3 className="font-display font-bold text-xl md:text-2xl text-ink mb-5">{cs.title}</h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[cs.stat1, cs.stat2, cs.stat3].map(stat => (
            <div key={stat.label} className="bg-chalk rounded-xl p-3 text-center">
              <p className="font-display font-bold text-lg text-harvest">{stat.value}</p>
              <p className="text-[10px] text-slate_mist">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="bg-ink/5 rounded-xl p-4 mb-5 relative">
          <Quote className="w-5 h-5 text-harvest/40 absolute top-3 left-3" />
          <p className="text-sm text-slate_mist italic pl-5 leading-relaxed">"{cs.quote}"</p>
          <p className="text-xs text-slate_mist/60 mt-2 pl-5">— {cs.quoteAuthor}</p>
        </div>

        {/* Toggle expanded */}
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-semibold text-harvest hover:text-harvest/80 transition-colors"
        >
          {expanded ? "Hide Details" : "Read Full Case Study"}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-5 space-y-5 text-sm">
                <div>
                  <h4 className="font-display font-semibold text-ink mb-2">The Challenge</h4>
                  <p className="text-slate_mist leading-relaxed">{cs.challenge}</p>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-ink mb-2">Our Approach</h4>
                  <ul className="space-y-2">
                    {cs.solution.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate_mist">
                        <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-ink mb-2">The Outcome</h4>
                  <p className="text-slate_mist leading-relaxed">{cs.outcome}</p>
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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Proven Results</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">
              Real Stories, Real Outcomes
            </h1>
            <p className="text-lg text-slate_mist max-w-2xl mx-auto">
              See how we've helped Australian NDIS providers, disability organisations, and businesses achieve their goals — faster and with less stress.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { value: "200+", label: "Providers Registered" },
                { value: "98%", label: "Audit Pass Rate" },
                { value: "60 Days", label: "Avg. Registration Time" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display font-bold text-3xl text-harvest">{value}</p>
                  <p className="text-sm text-slate_mist">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cards */}
          <div className="space-y-8">
            {CASE_STUDIES.map(cs => (
              <CaseStudyCard
                key={cs.id}
                cs={cs}
                expanded={expanded === cs.id}
                onToggle={() => setExpanded(expanded === cs.id ? null : cs.id)}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 bg-ink rounded-2xl p-10 text-center"
          >
            <Star className="w-8 h-8 text-harvest mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-white mb-2">Want Results Like These?</h2>
            <p className="text-white/60 mb-6">Book a free consultation and let's map out your path to NDIS registration or compliance.</p>
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