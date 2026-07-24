import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Star, Shield, BookOpen, Cpu, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "registration", label: "NDIS Registration", icon: Shield },
  { id: "training", label: "SC Training", icon: BookOpen },
  { id: "software", label: "Software & Automation", icon: Cpu },
  { id: "accountancy", label: "Finance Support", icon: Calculator },
];

const NDIS_PACKAGES = [
  {
    name: "Starter Package",
    price: "$3,950",
    tag: "Cost Effective",
    popular: false,
    features: [
      "ABN setup assistance & provider readiness",
      "NDIS online application preparation",
      "Self-assessment & audit scope guidance",
      "Audit quote preparation guidance",
      "NDIS audit arrangement checklist",
      "2 hrs coaching — NDIS basics & audit prep",
      "Full policy & procedure template pack",
      "Logo & business details applied to templates",
      "Automated branded Word file download",
    ],
    cta: "Get Starter Package",
    href: "/services/ndis-registration",
  },
  {
    name: "Ultimate Package",
    price: "$6,500",
    tag: "Most Popular",
    popular: true,
    features: [
      "Everything in Starter Package",
      "Full NDIS application preparation support",
      "Complete self-assessment & audit scope prep",
      "Competitive auditor quote guidance",
      "NDIS audit arrangement & readiness support",
      "4 hrs coaching — NDIS basics & audit prep",
      "Audit representation support allocation",
      "Full policy, procedure, forms & registers pack",
      "Automated client dashboard & branded Word pack",
    ],
    cta: "Get Ultimate Package",
    href: "/services/ndis-registration",
  },
];

const TRAINING_PACKAGES = [
  {
    name: "Individual Learner",
    price: "$1,200",
    tag: "Self-Paced",
    popular: false,
    features: [
      "Full 12-module online curriculum",
      "1,500+ quiz questions with answers",
      "6-month flexible access",
      "Participant workbook (PDF)",
      "Certificate of completion",
      "Email Q&A support",
    ],
    cta: "Enrol Now",
    href: "/services/support-coordination-training",
  },
  {
    name: "Team / Organisation",
    price: "$3,800",
    tag: "Up to 10 Staff",
    popular: true,
    features: [
      "Full curriculum for up to 10 staff",
      "Video scripts & PowerPoint slide decks",
      "Trainer guides & facilitator notes",
      "Branded participant workbooks",
      "2 × live Q&A sessions with Sol trainer",
      "NDIS Code of Conduct alignment pack",
      "Certificates for all completions",
    ],
    cta: "Book Team Training",
    href: "/services/support-coordination-training",
  },
  {
    name: "Enterprise / RTO",
    price: "Custom",
    tag: "Unlimited Staff",
    popular: false,
    features: [
      "Everything in Team package",
      "White-label branding of all materials",
      "Full RTO-ready curriculum pack",
      "Train-the-trainer program",
      "LMS integration support",
      "Ongoing content updates included",
      "Dedicated account manager",
    ],
    cta: "Request Quote",
    href: "/services/support-coordination-training",
  },
];

const SOFTWARE_PACKAGES = [
  {
    name: "Automation Starter",
    price: "$2,500",
    tag: "Single Process",
    popular: false,
    features: [
      "One automated process built & tested",
      "e.g. document generation or intake flow",
      "Staff handover session",
      "System documentation",
      "1–2 week delivery",
    ],
    cta: "Get Started",
    href: "/services/software-automation",
  },
  {
    name: "Automation Pro",
    price: "$5,500",
    tag: "Most Popular",
    popular: true,
    features: [
      "2–4 automated processes",
      "Easy Compliance setup & configuration",
      "Staff training & onboarding session",
      "Full system documentation",
      "30-day post-launch support",
      "Source code / admin access provided",
    ],
    cta: "Start Automation Pro",
    href: "/services/software-automation",
  },
  {
    name: "Custom Build",
    price: "Custom",
    tag: "Fully Scoped",
    popular: false,
    features: [
      "Fully scoped custom software",
      "Scoped processes & integrations",
      "Dedicated project manager",
      "Full handover training",
      "Ongoing maintenance available",
      "Priced after discovery session",
    ],
    cta: "Request Scoping",
    href: "/services/software-automation",
  },
];

const ACCOUNTANCY_PACKAGES = [
  {
    name: "Monthly Finance Support",
    price: "$350",
    tag: "Per Month",
    popular: false,
    features: [
      "Bookkeeping setup and reconciliation support",
      "BAS/GST preparation support",
      "Profit and loss reporting support",
      "Xero / MYOB / QuickBooks",
      "Billed monthly - no lock-in",
    ],
    cta: "Get Started",
    href: "/services/accountancy",
  },
  {
    name: "Finance Operations Support",
    price: "$990",
    tag: "Per Month",
    popular: true,
    features: [
      "Everything in Monthly Finance Support",
      "Payroll/STP process support",
      "Superannuation process guidance",
      "Tax planning and annual return referrals",
      "NDIS financial reporting",
      "Registered accountant referral pathway",
    ],
    cta: "Start Finance Operations Support",
    href: "/services/accountancy",
  },
  {
    name: "NDIS Financial Pack",
    price: "$1,800",
    tag: "Per Month",
    popular: false,
    features: [
      "Everything in Finance Operations Support",
      "NDIS price guide compliance review",
      "SDA/SIL financial reporting guidance",
      "Audit document support",
      "Participant financial reporting",
      "Custom reporting dashboards",
    ],
    cta: "Enquire Now",
    href: "/services/accountancy",
  },
];

const PACKAGE_MAP = {
  registration: { packages: NDIS_PACKAGES, cols: "md:grid-cols-2", note: "Prices are in AUD and exclude GST (for GST-registered businesses); GST is added at checkout. Audit support is included — registration and audit outcomes are not guaranteed. Terms apply." },
  training: { packages: TRAINING_PACKAGES, cols: "md:grid-cols-3", note: "Prices are in AUD and exclude GST; GST is added at checkout. Enterprise custom pricing on request. Group discounts for 10+ staff." },
  software: { packages: SOFTWARE_PACKAGES, cols: "md:grid-cols-3", note: "Prices are in AUD and exclude GST; GST is added at checkout. Custom pricing confirmed after a free scoping session." },
  accountancy: { packages: ACCOUNTANCY_PACKAGES, cols: "md:grid-cols-3", note: "Prices are in AUD and exclude GST; GST is added at checkout. Monthly retainer, cancel anytime. BAS, tax, and registered-agent services are handled by appropriately registered practitioners where required." },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function PricingCard({ pkg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative rounded-3xl p-5 sm:p-8 border-2 flex flex-col transition-all duration-300 ${
        pkg.popular
          ? "bg-basalt border-harvest/40 shadow-2xl shadow-harvest/10"
          : "bg-white border-border/60 hover:border-harvest/30 shadow-md"
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-4 left-7">
          <span className="bg-harvest text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-white" /> Most Popular
          </span>
        </div>
      )}

      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block ${pkg.popular ? "text-harvest" : "text-harvest"}`}>
        {pkg.tag}
      </span>
      <h4 className={`font-display font-bold text-xl mb-2 ${pkg.popular ? "text-white" : "text-ink"}`}>{pkg.name}</h4>

      <div className="flex items-end gap-1.5 mb-6">
        <span className="font-display font-bold text-3xl sm:text-4xl text-harvest">{pkg.price}</span>
        {pkg.price !== "Custom" && (
          <span className={`text-sm mb-1 ${pkg.popular ? "text-white/70" : "text-slate_mist"}`}>+GST</span>
        )}
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {pkg.features.map((f) => (
          <li key={f} className={`flex items-start gap-2.5 text-sm ${pkg.popular ? "text-white/75" : "text-slate_mist"}`}>
            <CheckCircle className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Link to={pkg.href}>
        <button className={`w-full py-3.5 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all group ${
          pkg.popular
            ? "bg-harvest hover:bg-harvest/90 text-white"
            : "bg-ink hover:bg-ink/90 text-white"
        }`}>
          {pkg.cta}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </Link>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("registration");
  const { packages, cols, note } = PACKAGE_MAP[activeTab];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-chalk relative overflow-hidden">
      <div className="absolute -top-32 -right-32 hidden h-[420px] w-[420px] rounded-full border border-harvest/5 pointer-events-none sm:block lg:h-[500px] lg:w-[500px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Transparent Pricing</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
            Simple, Upfront Pricing
          </h2>
          <p className="text-slate_mist text-base md:text-lg mt-4 max-w-xl mx-auto">
            No hidden fees. Compare packages across all Sol services and choose the level of support that fits your business.
          </p>
          <div className="w-20 h-[2px] bg-harvest mt-6 mx-auto" />
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-0 items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-ink text-white border-ink shadow-md"
                    : "bg-white text-slate_mist border-border/60 hover:border-harvest/40 hover:text-ink"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <div key={activeTab} className={`grid ${cols} gap-7`}>
            {packages.map((pkg, i) => (
              <PricingCard key={pkg.name} pkg={pkg} delay={i * 0.08} />
            ))}
          </div>
        </AnimatePresence>

        <p className="text-center text-xs text-slate_mist mt-8">{note}</p>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 md:mt-16 bg-ink rounded-3xl p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-8">
          <div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">Not sure which package is right for you?</h3>
            <p className="text-white/70 mt-2">Book a free 30-minute consultation — we'll assess your needs and recommend the best fit.</p>
          </div>
          <Link to="/#contact"
            className="inline-flex w-full items-center justify-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-6 sm:px-8 py-4 rounded-xl transition-colors sm:w-auto sm:flex-shrink-0 sm:whitespace-nowrap">
            Book Free Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}