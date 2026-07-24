import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Bell, BarChart3, Users, FolderOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COMPLIANCE_IMAGE = "/Images/services/compliance-document-review.webp";

const steps = [
  {
    id: "compliance-setup-configuration",
    icon: FolderOpen,
    title: "Setup & Configuration",
    desc: "We configure Easy Compliance to match your operations, map folder structures, and import documents.",
  },
  {
    id: "compliance-onboarding-training",
    icon: Users,
    title: "Onboarding & Training",
    desc: "Hands-on training for managers and support workers with ongoing rollout support.",
  },
  {
    id: "compliance-ai-document-validation",
    icon: FileSearch,
    title: "AI Document Validation",
    desc: "AI-assisted validation reviews documents, flags potential gaps, and assigns confidence scores.",
  },
  {
    id: "compliance-expiry-alerts-actions",
    icon: Bell,
    title: "Expiry Alerts & Actions",
    desc: "Never miss a renewal — automated alerts for police checks, first aid, and certifications.",
  },
  {
    id: "compliance-internal-audits",
    icon: BarChart3,
    title: "Internal Audits Anytime",
    desc: "Run structured internal audits and surface potential issues before formal audit activity.",
  },
  {
    id: "compliance-ongoing-compliance",
    icon: ShieldCheck,
    title: "Ongoing Compliance",
    desc: "Stay audit-ready every day — not just during audit season.",
  },
];

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-20 md:py-32 bg-chalk relative overflow-hidden">
      {/* Background monolith */}
      <div className="absolute -top-32 -left-32 hidden h-[420px] w-[420px] rounded-full border border-harvest/5 pointer-events-none sm:block lg:h-[500px] lg:w-[500px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/30 bg-harvest/5 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Powered by Easy Compliance
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink max-w-3xl leading-tight">
            NDIS Compliance Made Effortless
          </h2>
          <p className="text-base md:text-lg text-slate_mist max-w-2xl mt-4 leading-relaxed">
            Easy Compliance is a service, not just software. Our team works with you every step - from scattered documents toward a clear audit-readiness plan.
          </p>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        {/* Image + Features Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12 md:mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <img
              src={COMPLIANCE_IMAGE}
              alt="Professionals reviewing compliance documents in a modern office"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-[320px] sm:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:bottom-6 sm:left-6 sm:right-6 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-ink">Document Review Workflow Active</span>
              </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display font-bold text-2xl text-ink mb-4">
                Audits Are Stressful. They Don't Have to Be.
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Scattered Documentation", desc: "HR files, participant records, registers — all over the place." },
                  { title: "Last-Minute Scramble", desc: "Weeks of panic preparing, hunting down documents." },
                  { title: "Fear of Non-Compliance", desc: "One missing document could cost your registration." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 sm:gap-4 p-4 rounded-xl bg-white border border-border/50">
                    <div className="w-2 h-full rounded-full bg-destructive/20 flex-shrink-0" />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-ink">{item.title}</h4>
                      <p className="text-sm text-slate_mist">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compliance Lifecycle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <h3 className="font-display font-bold text-2xl text-ink mb-2">The Compliance Lifecycle</h3>
          <p className="text-slate_mist">From first call to a clear audit-readiness plan.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              id={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative p-6 rounded-2xl bg-white border border-border/50 hover:border-harvest/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center group-hover:bg-harvest/20 transition-colors">
                  <step.icon className="w-5 h-5 text-harvest" />
                </div>
                <span className="font-display text-xs font-semibold text-slate_mist tracking-wider">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h4 className="font-display font-semibold text-ink mb-2">{step.title}</h4>
              <p className="text-sm text-slate_mist leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-10 md:mt-16"
        >
          <Link to="/#contact">
            <Button className="bg-harvest hover:bg-harvest/90 text-white font-display text-base px-6 sm:px-10 py-5 sm:py-6 gap-2 group shadow-lg shadow-harvest/20">
              Get Audit-Ready Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}