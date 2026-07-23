import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, ArrowDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NDISIntakeFlow from "@/components/intake/NDISIntakeFlow";

const HERO_IMAGE = "/images/services/ndis-registration-documents.webp";

const PATHWAY_STEPS = [
  { step: "01", title: "Get in Touch and Check Fit", desc: "Submit your details. SOL reviews your provider goals and identifies the registration questions that need attention." },
  { step: "02", title: "Prepare Business Details", desc: "We organise your business structure, key personnel, operating locations, and intended registration groups." },
  { step: "03", title: "Understand the Audit Pathway", desc: "Your services determine whether verification or certification is likely. We explain the pathway and evidence expectations." },
  { step: "04", title: "Policies, Procedures and Registers", desc: "Your documentation pack is selected and branded across governance, incident, complaints, risk, quality, and participant-facing documents." },
  { step: "05", title: "Submit Through Official Channels", desc: "SOL guides you through PRODA and NDIS Commission processes while you remain in control of official accounts and authentication." },
  { step: "06", title: "Prepare to Operate", desc: "After submission, we help you prepare for service delivery, participant onboarding, staff records, and ongoing compliance routines." },
];

const WHY = [
  { title: "Official-channel guidance", desc: "We help you understand the NDIS Commission process without claiming government affiliation." },
  { title: "Practical documentation", desc: "Policies, procedures, forms, and registers are prepared for your operating model and registration groups." },
  { title: "Clear scope and pricing", desc: "We confirm what is included before paid work begins, including document packs, coaching, and add-ons." },
  { title: "Ongoing readiness focus", desc: "The goal is not just submission. We help you build systems your team can maintain after registration." },
];

export default function NDISRegistration() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-36 pb-20 bg-basalt text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] rounded-full border border-harvest/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <Shield className="w-3.5 h-3.5" /> NDIS Registration
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Start Your NDIS<br />Business with<br /><span className="text-harvest">Confidence</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-8">
              SOL Business Consultant guides new and growing providers through NDIS registration preparation, policy documentation, audit readiness, and operational setup.
            </p>
            <div className="flex gap-4 flex-wrap">
              {["Registration pathway review", "Policy and evidence support", "Australian provider focus"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-harvest" /> {b}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/35 max-w-2xl mt-5">
              SOL Business Consultant is not affiliated with the NDIS Quality and Safeguards Commission. Registration and audit outcomes depend on your business, scope, evidence, auditor assessment, and official decisions.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#intake-form" className="inline-flex items-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-bold px-8 py-4 rounded-xl transition-colors text-sm">
                Start Your Registration
              </a>
              <div className="flex items-center gap-2 text-harvest text-sm animate-bounce">
                <ArrowDown className="w-4 h-4" />
                <span className="font-medium text-white/50">Scroll to form</span>
              </div>
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
                  alt="Consultants reviewing NDIS registration documents on a desk"
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

      <section className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Why Choose Sol</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">A Practical Partner for Your NDIS Journey</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 border border-border/50 hover:border-harvest/30 transition-all">
                <CheckCircle className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-ink mb-1">{w.title}</h3>
                <p className="text-sm text-slate_mist">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Registration Pathway</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Your Path to NDIS Provider Registration</h2>
          </div>
          <div className="space-y-4">
            {PATHWAY_STEPS.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-5 items-start p-6 rounded-2xl border border-border/50 hover:border-harvest/30 hover:bg-chalk transition-all">
                <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-harvest text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm text-slate_mist mt-1">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ink">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-harvest/10 border border-harvest/20 rounded-2xl p-8 md:p-10">
            <div>
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-2 block">Also Available</span>
              <h3 className="font-display font-bold text-2xl text-white mb-2">NDIS Support Coordination Training</h3>
              <p className="text-white/60 max-w-lg text-sm leading-relaxed">
                Training resources and structured learning pathways for support coordination teams, with individual, team, and enterprise options available.
              </p>
            </div>
            <a href="/services/support-coordination-training" className="flex-shrink-0 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap">
              View Training Packages
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Get Started Now</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Start Your NDIS Registration</h2>
            <p className="text-slate_mist mt-3 max-w-xl mx-auto">
              Complete the form below so we can understand your pathway, business details, and documentation needs before recommending next steps.
            </p>
          </div>
          <NDISIntakeFlow />
        </div>
      </section>

      <Footer />
    </div>
  );
}
