import React from "react";
import { motion } from "framer-motion";
import { Calculator, CheckCircle, TrendingUp, Receipt, Users, ArrowDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GenericIntakeFlow from "@/components/intake/GenericIntakeFlow";

const HERO_IMAGE = "/Images/services/accounting-consultation.webp";

const FEATURES = [
  { icon: Receipt, title: "Bookkeeping Referrals", desc: "We connect you with trusted Xero/MYOB/QuickBooks bookkeepers suited to your business size and needs." },
  { icon: Calculator, title: "BAS & Tax Guidance", desc: "Consultancy support to help you understand your BAS and tax obligations — we refer you to registered agents." },
  { icon: TrendingUp, title: "Business Financial Consulting", desc: "Guidance on business sustainability, budgeting, and financial structure planning for growth." },
  { icon: Users, title: "Accounting Partner Network", desc: "We connect you with our trusted CPA and registered accountant partners for compliant, professional service." },
];

const SERVICES = [
  "Bookkeeping setup & software guidance (Xero, MYOB, QuickBooks)",
  "BAS understanding & referral to registered BAS agents",
  "Business structure & ABN/Company registration consulting",
  "Budgeting & cash flow planning guidance",
  "Connecting you with CPA partners for tax returns",
  "Financial recordkeeping advice for business owners",
  "Accounting software setup & training referrals",
  "Connecting you with payroll specialists",
];

export default function Accountancy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-36 pb-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-harvest/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <Calculator className="w-3.5 h-3.5" /> Accounting Consultancy
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight mb-6">
              Accounting Consultancy<br />for <span className="text-harvest">Australian Businesses</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl leading-relaxed mb-8">
              We're not accountants — we're consultants. We help you understand your financial obligations, 
              set up the right systems, and connect you with the right registered professionals.
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
                  alt="Business papers, laptop, and calculator prepared for accounting consultation"
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
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-3xl text-ink mb-4">What We Help With</h2>
              <div className="space-y-2">
                {SERVICES.map(s => (
                  <div key={s} className="flex items-center gap-2 text-slate_mist text-sm">
                    <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-border/50">
                <h3 className="font-display font-bold text-ink mb-2">Why Sol Business Consultant?</h3>
                <p className="text-sm text-slate_mist leading-relaxed">
                  We are business consultants — not registered accountants or CPAs. We help you navigate 
                  your financial landscape, set up the right tools, and connect you with the right 
                  licensed professionals. All advice is general in nature and does not constitute 
                  financial, tax, or legal advice.
                </p>
              </div>
              <div className="bg-harvest/5 border border-harvest/20 rounded-2xl p-6">
                <p className="font-display font-bold text-harvest text-2xl">Consultancy Only</p>
                <p className="text-sm text-slate_mist mt-1">We provide guidance and referrals. We are not registered accountants, CPAs, or financial advisers. Always consult a licensed professional for formal advice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Get Started</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Start Your Accounting Consultancy Enquiry</h2>
            <p className="text-slate_mist mt-3 max-w-lg mx-auto">Tell us about your situation and we'll guide you or connect you with the right licensed professional.</p>
          </div>
          <GenericIntakeFlow serviceType="accountancy" />
        </div>
      </section>

      <Footer />
    </div>
  );
}