import React from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Users, Award, Clock, ArrowDown, PlayCircle, FileText, Brain, Heart, Shield, BarChart3 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GenericIntakeFlow from "@/components/intake/GenericIntakeFlow";
import SupportCoordinationFAQ from "@/components/services/SupportCoordinationFAQ";

const HERO_IMAGE = "/Images/training/professional-workshop-presentation.webp";

const MODULES = [
  {
    num: "01",
    icon: Brain,
    title: "Introduction to the NDIS",
    desc: "A foundational overview of the National Disability Insurance Scheme — its history, legislation, guiding principles, and how it operates across Australia.",
    topics: [
      "NDIS Act 2013 — purpose, objects, and principles",
      "How the NDIS differs from other disability support systems",
      "Participant eligibility criteria and access requirements",
      "The role of the NDIS Commission and Quality & Safeguards framework",
      "Key NDIS terminology and funding definitions",
      "Overview of NDIS participant planning and review cycles",
    ],
  },
  {
    num: "02",
    icon: Users,
    title: "The Role of a Support Coordinator",
    desc: "A detailed look at what Support Coordinators do, their legal and ethical responsibilities under the NDIS Practice Standards, and how to operate professionally.",
    topics: [
      "Difference between Support Coordinator, Specialist SC, and Plan Manager",
      "NDIS Practice Standards — SC-specific obligations",
      "NDIS Code of Conduct — 7 requirements explained",
      "Conflict of interest identification and management",
      "Duty of care and professional boundaries",
      "Record-keeping and reporting obligations",
    ],
  },
  {
    num: "03",
    icon: FileText,
    title: "Reading & Implementing NDIS Plans",
    desc: "How to interpret and action a participant's NDIS plan — understanding budgets, funding categories, and building a practical implementation roadmap.",
    topics: [
      "Three NDIS budget types: Core, Capital, Capacity Building",
      "Understanding support categories and line items",
      "Navigating the NDIS Pricing Arrangements & Price Limits",
      "Creating a plan implementation roadmap with the participant",
      "Service bookings and budget tracking in the myplace portal",
      "Monitoring plan utilisation and managing underspend/overspend",
    ],
  },
  {
    num: "04",
    icon: Heart,
    title: "Participant-Centred Practice",
    desc: "Embedding choice, control, and human rights at the centre of every support decision. Includes culturally responsive and trauma-informed approaches.",
    topics: [
      "Principles of person-centred and strengths-based practice",
      "Supporting genuine choice and control in decision-making",
      "Goal setting with participants — SMART goals for NDIS",
      "Cultural and linguistic diversity considerations",
      "Trauma-informed practice in disability support",
      "Advocacy — when and how to act on behalf of participants",
    ],
  },
  {
    num: "05",
    icon: Shield,
    title: "Risk, Safeguarding & Reportable Incidents",
    desc: "A comprehensive module on identifying and managing risk, understanding mandatory reporting obligations, and protecting participant safety.",
    topics: [
      "Risk assessment frameworks for NDIS providers",
      "The 5 categories of NDIS reportable incidents",
      "Internal incident reporting — process and timelines",
      "External reporting to the NDIS Commission",
      "Worker screening — NDIS Worker Screening Check explained",
      "Preventing and responding to abuse, neglect, and exploitation",
    ],
  },
  {
    num: "06",
    icon: BarChart3,
    title: "Service Agreements & Provider Connections",
    desc: "How to source quality providers, draft compliant service agreements, and build a strong local provider network for participants.",
    topics: [
      "What must be included in an NDIS service agreement",
      "Service agreement templates and customisation",
      "Finding and vetting registered vs unregistered providers",
      "Navigating the NDIS provider marketplace",
      "Monitoring provider performance and handling complaints",
      "Managing provider transitions and plan changes",
    ],
  },
  {
    num: "07",
    icon: BookOpen,
    title: "Documentation & Record Keeping",
    desc: "Best-practice standards for case noting, progress reporting, and maintaining audit-ready files as a Support Coordinator.",
    topics: [
      "NDIS case note standards — what to include and exclude",
      "Writing effective progress reports for NDIS planners",
      "File management systems for audit readiness",
      "Privacy Act obligations and consent requirements",
      "Confidentiality — what can and cannot be shared",
      "Retention periods for NDIS participant records",
    ],
  },
  {
    num: "08",
    icon: Clock,
    title: "Crisis & Complex Support",
    desc: "Navigating crisis situations, supporting participants with complex needs, and understanding the intersection of mental health and the NDIS.",
    topics: [
      "Identifying early warning signs of participant crisis",
      "Crisis response planning and documentation",
      "Mental health and psychosocial disability in the NDIS",
      "Behaviour Support Practitioners — role and referral",
      "Overview of restrictive practices and authorisation",
      "Escalation pathways and emergency contacts",
    ],
  },
  {
    num: "09",
    icon: Award,
    title: "Plan Reviews & Appeals",
    desc: "How to prepare participants for plan reviews, gather supporting evidence, and navigate review and appeals processes when needed.",
    topics: [
      "Types of NDIS plan reviews — scheduled and unscheduled",
      "Preparing a plan review submission with evidence",
      "Writing supporting letters for allied health and SC",
      "Internal NDIS review process — steps and timeframes",
      "AAT appeals — when and how to apply",
      "Participant rights in the review and appeals process",
    ],
  },
  {
    num: "10",
    icon: Users,
    title: "Working with Allied Health & Therapists",
    desc: "Coordinating therapeutic supports, understanding Assistive Technology, SDA/SIL, and collaborating effectively with health professionals.",
    topics: [
      "Role of Allied Health in NDIS participant outcomes",
      "Assistive Technology (AT) — low, mid, and high cost pathways",
      "AT assessment, quotes, and portal approval process",
      "Specialist Disability Accommodation (SDA) overview",
      "Supported Independent Living (SIL) assessment and funding",
      "Building effective referral relationships with therapists",
    ],
  },
  {
    num: "11",
    icon: Brain,
    title: "Business Skills for Support Coordinators",
    desc: "The practical skills needed to run a SC practice or operate within an organisation — including compliance, billing, and professional development.",
    topics: [
      "Setting up as an independent SC — ABN, registration, insurance",
      "NDIS Portal and myplace — essential navigation skills",
      "Claiming and invoicing correctly — avoiding common errors",
      "Managing a SC caseload — tools and time management",
      "CPD obligations and professional development planning",
      "Employment vs contractor models for SC workers",
    ],
  },
  {
    num: "12",
    icon: CheckCircle,
    title: "Competency Assessment & Certification",
    desc: "Final module with scenario-based assessments, a 1,500+ quiz question bank, and competency evaluations aligned to NDIS Practice Standards.",
    topics: [
      "Written scenario assessments across all 11 prior modules",
      "1,500+ multiple-choice quiz questions with answer explanations",
      "Competency-based evaluation mapped to NDIS Practice Standards",
      "Short-answer and case study responses",
      "Trainer-marked assessment (Team/Enterprise packages)",
      "Certificate of completion issued upon passing all assessments",
    ],
  },
];

const TRAINING_PACKAGES = [
  {
    id: "training_individual",
    name: "Individual Learner",
    price: "$1,200",
    gst: "+GST",
    tag: "Self-Paced",
    features: [
      "Full 12-module online curriculum",
      "1,500+ quiz questions with answers",
      "Self-paced flexible access (6 months)",
      "Participant workbook (PDF)",
      "Certificate of completion",
      "Email Q&A support",
    ],
    cta: "Enrol Now",
  },
  {
    id: "training_team",
    name: "Team / Organisation",
    price: "$3,800",
    gst: "+GST",
    tag: "Up to 10 Staff",
    popular: true,
    features: [
      "Full 12-module curriculum (up to 10 staff)",
      "1,500+ quiz questions with answers",
      "Video scripts & PowerPoint slide decks",
      "Trainer guides & facilitator notes",
      "Participant workbooks (branded)",
      "2 x live Q&A sessions with Sol trainer",
      "NDIS Code of Conduct alignment pack",
      "Certificates for all completions",
    ],
    cta: "Book Team Training",
  },
  {
    id: "training_enterprise",
    name: "Enterprise / RTO",
    price: "Custom",
    gst: "Contact us",
    tag: "Unlimited Staff",
    features: [
      "Everything in Team package",
      "White-label branding of all materials",
      "Full RTO-ready curriculum pack",
      "Audit-ready competency assessments",
      "Train-the-trainer program",
      "Ongoing content updates included",
      "LMS integration support",
      "Dedicated account manager",
    ],
    cta: "Request Enterprise Quote",
  },
];

const OUTCOMES = [
  { stat: "12", label: "Training Modules" },
  { stat: "1,500+", label: "Quiz Questions" },
  { stat: "6", label: "Months Access" },
  { stat: "100%", label: "NDIS Standards Aligned" },
];

export default function SupportCoordinationTraining() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-harvest/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <BookOpen className="w-3.5 h-3.5" /> NDIS Training
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Support Coordination<br />Training That<br /><span className="text-harvest">Builds Careers</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-8">
              Australia's most comprehensive NDIS Support Coordinator training — 12 modules, 
              1,500+ quiz questions, and full curriculum aligned to NDIS Practice Standards. 
              For individuals, teams, and RTOs.
            </p>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 mb-8">
              {OUTCOMES.map((o) => (
                <div key={o.label} className="text-center">
                  <p className="font-display font-bold text-3xl text-harvest">{o.stat}</p>
                  <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">{o.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <a href="#intake-form"
                className="inline-flex items-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-bold px-8 py-4 rounded-xl transition-colors text-sm">
                Enrol Now →
              </a>
              <a href="#modules" className="inline-flex items-center gap-2 text-harvest text-sm font-semibold hover:underline">
                <ArrowDown className="w-4 h-4 animate-bounce" /> View All 12 Modules
              </a>
            </div>
          </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                <img
                  src={HERO_IMAGE}
                  alt="Trainer presenting to adult learners in a classroom"
                  width="1200"
                  height="800"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="h-72 w-full object-cover sm:h-96 lg:h-[520px]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-ink/50 via-transparent to-harvest/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module Overview */}
      <section id="modules" className="py-24 bg-chalk">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Full Curriculum</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">12 Modules — Complete SC Training</h2>
            <p className="text-slate_mist mt-3 max-w-xl mx-auto">Every module includes written content, quiz questions, PowerPoint slide decks, scenario assessments, and facilitator guides.</p>
          </motion.div>
          <div className="space-y-5">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-border/50 hover:border-harvest/30 hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Module header */}
                <div className="flex items-center gap-5 p-6 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0 group-hover:bg-harvest/20 transition-colors">
                    <mod.icon className="w-6 h-6 text-harvest" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-harvest uppercase tracking-widest">Module {mod.num}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink">{mod.title}</h3>
                  </div>
                  <span className="font-display text-4xl font-bold text-border/20 flex-shrink-0 hidden md:block">{mod.num}</span>
                </div>
                {/* Module body */}
                <div className="px-6 pb-6">
                  <p className="text-sm text-slate_mist leading-relaxed mb-4">{mod.desc}</p>
                  <div className="bg-chalk rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-harvest mb-3">What you'll learn</p>
                    <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6">
                      {mod.topics.map(t => (
                        <div key={t} className="flex items-start gap-2 text-sm text-slate_mist">
                          <CheckCircle className="w-3.5 h-3.5 text-harvest mt-0.5 flex-shrink-0" /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA link to enquiry form */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
            <p className="text-slate_mist mb-4">Ready to enrol or need more details?</p>
            <a href="#intake-form" className="inline-flex items-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-8 py-4 rounded-xl transition-colors">
              Enquire About Training →
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="training-pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Training Packages</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Flexible Pricing for Every Need</h2>
            <p className="text-slate_mist mt-3 max-w-lg mx-auto">Individual learners, teams, and enterprise RTOs — choose the package that fits.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-7">
            {TRAINING_PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-8 border-2 relative transition-all duration-300 ${
                  pkg.popular ? "bg-basalt border-harvest/40 shadow-xl" : "bg-white border-border/60 hover:border-harvest/30 shadow-md"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-8">
                    <span className="bg-harvest text-white text-xs font-bold px-4 py-1.5 rounded-full">⭐ Most Popular</span>
                  </div>
                )}
                <span className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${pkg.popular ? "text-harvest" : "text-harvest"}`}>{pkg.tag}</span>
                <h3 className={`font-display font-bold text-xl mb-2 ${pkg.popular ? "text-white" : "text-ink"}`}>{pkg.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-display font-bold text-4xl text-harvest">{pkg.price}</span>
                  <span className={`text-sm mb-1 ${pkg.popular ? "text-white/50" : "text-slate_mist"}`}>{pkg.gst}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {pkg.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${pkg.popular ? "text-white/70" : "text-slate_mist"}`}>
                      <CheckCircle className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="#intake-form">
                  <button className={`w-full py-3.5 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    pkg.popular ? "bg-harvest hover:bg-harvest/90 text-white" : "bg-ink hover:bg-ink/90 text-white"
                  }`}>
                    {pkg.cta} →
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-slate_mist mt-8">All prices exclude GST. Enterprise pricing available on request. Group discounts apply for 10+ staff.</p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-basalt text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">What's Included</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">Every Package Includes Full Curriculum Materials</h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Our training materials are built for quality delivery — whether you're an individual learner, 
                a registered provider upskilling your team, or an RTO delivering accredited training.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "12-module written curriculum",
                  "1,500+ quiz Q&A bank",
                  "PowerPoint slide decks",
                  "Video scripts (all 12 modules)",
                  "Trainer & facilitator guides",
                  "Participant workbooks",
                  "Scenario-based assessments",
                  "Competency checklists",
                  "NDIS Practice Standards mapping",
                  "Code of Conduct alignment",
                  "Certificate templates",
                  "Ongoing updates included",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-3.5 h-3.5 text-harvest flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <PlayCircle className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-white mb-2">Flexible Delivery</h3>
                <p className="text-white/50 text-sm">Self-paced online or blended with live Sol trainer sessions. Works for individuals and large teams.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Award className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-white mb-2">NDIS Practice Standards Aligned</h3>
                <p className="text-white/50 text-sm">All content mapped to NDIS Practice Standards and Code of Conduct. Audit-ready from day one.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Users className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-white mb-2">RTO-Ready Content</h3>
                <p className="text-white/50 text-sm">Enterprise package includes full white-label rights and LMS integration support for RTOs.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SupportCoordinationFAQ />

      {/* Enquiry / Intake Form */}
      <section className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Enrol or Enquire</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Start Your Training Journey</h2>
            <p className="text-slate_mist mt-3 max-w-lg mx-auto">
              Submit your details below — select your training package, upload your organisation logo 
              for branded materials, and our team will be in touch within 1 business day.
            </p>
          </div>
          <GenericIntakeFlow serviceType="support_coordination_training" />
        </div>
      </section>

      <Footer />
    </div>
  );
}