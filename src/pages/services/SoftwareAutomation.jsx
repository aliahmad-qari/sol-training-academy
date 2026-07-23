import React from "react";
import { motion } from "framer-motion";
import { Cpu, CheckCircle, FileText, BarChart3, Workflow, ArrowDown, ShieldCheck, Lock, Eye, Server } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GenericIntakeFlow from "@/components/intake/GenericIntakeFlow";

const HERO_IMAGE = "/images/services/automation-dashboard.webp";

const FEATURES = [
  { icon: FileText, title: "NDIS Document Automation", desc: "Auto-generate branded policies, procedures, and registers with client details in seconds." },
  { icon: Workflow, title: "Client Intake Systems", desc: "Structured intake flows that capture, store, and route client data automatically." },
  { icon: BarChart3, title: "Compliance Dashboards", desc: "Real-time compliance views — expiry alerts, audit readiness scores, document status." },
  { icon: Cpu, title: "Easy Compliance Integration", desc: "Full Easy Compliance platform setup, configuration, and staff training." },
];

const USE_CASES = [
  "NDIS policy document generation (branded Word packs)",
  "Client intake and onboarding automation",
  "HR compliance tracking (NDIS checks, first aid, certifications)",
  "Participant file management systems",
  "Incident and complaint register automation",
  "Audit preparation workflows",
  "Easy Compliance platform setup and training",
  "Custom software builds for NDIS providers",
];

export default function SoftwareAutomation() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-36 pb-20 bg-basalt text-white relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full border border-harvest/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <Cpu className="w-3.5 h-3.5" /> Software & NDIS Automation
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight mb-6">
              Automate Your<br />NDIS Compliance<br /><span className="text-harvest">Intelligently</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl leading-relaxed mb-8">
              From document generation to compliance dashboards — we build the automation 
              systems that let you focus on participants, not paperwork.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#intake-form"
                className="inline-flex items-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-bold px-8 py-4 rounded-xl transition-colors text-sm">
                Start Your Enquiry →
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
                  alt="Laptop displaying an analytics dashboard for business automation"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border/50 hover:border-harvest/30 transition-all">
                <f.icon className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-ink mb-1">{f.title}</h3>
                <p className="text-sm text-slate_mist">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div>
            <h2 className="font-display font-bold text-3xl text-ink mb-6 text-center">What We Can Automate For You</h2>
            <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {USE_CASES.map(u => (
                <div key={u} className="flex items-start gap-2 text-sm text-slate_mist p-3 bg-white rounded-xl border border-border/50">
                  <CheckCircle className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" /> {u}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data & Privacy Section */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Security & Compliance</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Your Data is Safe With Us</h2>
            <p className="text-white/50 max-w-xl mx-auto">Every automation we build is designed with Australian privacy law, NDIS data requirements, and enterprise-grade security at its core.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: ShieldCheck, title: "Australian Privacy Act Compliant", desc: "All systems we build adhere to the Privacy Act 1988 and the Australian Privacy Principles (APPs), ensuring lawful collection, storage, and use of personal data." },
              { icon: Lock, title: "End-to-End Encryption", desc: "Data in transit and at rest is encrypted using AES-256 and TLS 1.3 standards. No sensitive client or participant data is ever stored unencrypted." },
              { icon: Eye, title: "NDIS Practice Standards Aligned", desc: "Our automation solutions are scoped to meet NDIS Practice Standards around data governance, participant confidentiality, and incident reporting obligations." },
              { icon: Server, title: "Australian-Hosted Data", desc: "Client and participant data remains on Australian soil. We work with locally hosted infrastructure providers to ensure data sovereignty compliance." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-harvest/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-harvest" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 grid md:grid-cols-3 gap-6 text-center">
            {[
              { label: "Access Control", detail: "Role-based permissions ensure only authorised staff can access sensitive participant records and system functions." },
              { label: "Audit Logs", detail: "Every action in our systems is logged with timestamps and user attribution — ready for NDIS audit review at any time." },
              { label: "Data Minimisation", detail: "We only collect and store the data strictly necessary for the purpose, in line with APP 3 data minimisation principles." },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <CheckCircle className="w-6 h-6 text-harvest mx-auto" />
                <p className="font-display font-semibold text-white">{item.label}</p>
                <p className="text-sm text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Get Started</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Tell Us What You Want to Automate</h2>
            <p className="text-slate_mist mt-3 max-w-lg mx-auto">Submit your requirements and we'll prepare a tailored automation solution for your NDIS business.</p>
          </div>
          <GenericIntakeFlow serviceType="software_automation" />
        </div>
      </section>

      <Footer />
    </div>
  );
}