import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Clock, ArrowDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NDISIntakeFlow from "@/components/intake/NDISIntakeFlow";

const PATHWAY_STEPS = [
  { step: "01", title: "Get in Touch & Check Eligibility", desc: "Submit your details. Sol reviews your provider goals and answers your first registration questions." },
  { step: "02", title: "Prepare Your NDIS Application", desc: "We organise your business details, key personnel, operating locations, and registration groups." },
  { step: "03", title: "Understand Your Audit Pathway", desc: "Your services determine whether you face a verification or certification audit. We prepare you." },
  { step: "04", title: "Policies, Procedures, Forms & Registers", desc: "Your documentation pack is selected and branded — governance, incident, complaints, risk, quality." },
  { step: "05", title: "Submit Through Official Channels", desc: "Sol guides you through PRODA and NDIS Commission. You stay in control of authentication." },
  { step: "06", title: "Prepare to Operate After Approval", desc: "Focus on service delivery, participant onboarding, and compliance with stronger foundations." },
];

const WHY = [
  { title: "98% First-Time Pass Rate", desc: "Our clients pass their audits first time, every time." },
  { title: "300+ Providers Registered", desc: "Proven experience across all NDIS registration groups." },
  { title: "End-to-End Support", desc: "From ABN setup to audit certification and beyond." },
  { title: "Branded Documents Ready Fast", desc: "Automated document generation in minutes, not weeks." },
];

export default function NDISRegistration() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 bg-basalt text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] rounded-full border border-harvest/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <Shield className="w-3.5 h-3.5" /> NDIS Registration
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Start Your NDIS<br />Business with<br /><span className="text-harvest">Confidence</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-8">
              Sol Business Consultant guides new and growing NDIS providers through registration, 
              policy preparation, audit readiness, and branded documentation — end to end.
            </p>
            <div className="flex gap-4 flex-wrap">
              {["300+ Providers Registered", "98% First-Time Pass Rate", "6–8 Week Timeline"].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-harvest" /> {b}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#intake-form"
                className="inline-flex items-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-bold px-8 py-4 rounded-xl transition-colors text-sm">
                Start Your Registration →
              </a>
              <div className="flex items-center gap-2 text-harvest text-sm animate-bounce">
                <ArrowDown className="w-4 h-4" />
                <span className="font-medium text-white/50">Scroll to form</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Sol */}
      <section className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Why Choose Sol</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">A Practical Partner for Your NDIS Journey</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border/50 hover:border-harvest/30 transition-all">
                <CheckCircle className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-ink mb-1">{w.title}</h3>
                <p className="text-sm text-slate_mist">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Pathway */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Registration Pathway</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Your Path to NDIS Provider Registration</h2>
          </div>
          <div className="space-y-4">
            {PATHWAY_STEPS.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-5 items-start p-6 rounded-2xl border border-border/50 hover:border-harvest/30 hover:bg-chalk transition-all">
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

      {/* Support Coordination Training Banner */}
      <section className="py-16 bg-ink">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-harvest/10 border border-harvest/20 rounded-2xl p-8 md:p-10">
            <div>
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-2 block">Also Available</span>
              <h3 className="font-display font-bold text-2xl text-white mb-2">NDIS Support Coordination Training</h3>
              <p className="text-white/60 max-w-lg text-sm leading-relaxed">
                12-module curriculum with 1,500+ quiz questions, video scripts, slide decks, and audit-ready assessments. 
                Individual, team, and enterprise RTO packages available.
              </p>
            </div>
            <a href="/services/support-coordination-training" className="flex-shrink-0 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap">
              View Training Packages →
            </a>
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Get Started Now</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Start Your NDIS Registration</h2>
            <p className="text-slate_mist mt-3 max-w-xl mx-auto">
              Complete the form below — our system assesses your pathway, captures your business details, 
              and generates your branded document pack after payment.
            </p>
          </div>
          <NDISIntakeFlow />
        </div>
      </section>

      <Footer />
    </div>
  );
}