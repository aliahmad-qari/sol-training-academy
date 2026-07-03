import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, FileCheck, Users, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const NDIS_IMAGE = "https://media.base44.com/images/public/6a1e37de99aadfdb49a9ef0d/5e1766cce_generated_9bb12ead.png";

const roadmap = [
  { week: "Week 1", title: "Discovery Call", desc: "Free consultation to assess eligibility, registration groups, and your timeline.", icon: Clock },
  { week: "Weeks 2–3", title: "Documentation & Application", desc: "Customised policies, quality system, NDIS portal submission, and auditor matching.", icon: FileCheck },
  { week: "Weeks 3–4", title: "Mock Audit & Training", desc: "Simulate the real audit, fix gaps early, and coach your team to perfection.", icon: Users },
  { week: "Ongoing", title: "Certification & Beyond", desc: "Pass audit, get certified, and stay compliant with 30-day post-registration check.", icon: Award },
];

const packages = [
  {
    name: "Starter",
    price: "$3,950",
    popular: true,
    features: [
      "ABN & structure guidance",
      "NDIS application & portal submission",
      "Complete policy & procedure pack",
      "Self-assessment & audit scoping",
      "Auditor quotes (3+ providers)",
      "2 hours consulting (NDIS basics)",
    ],
  },
  {
    name: "Ultimate",
    price: "$6,500",
    popular: false,
    features: [
      "Everything in Starter",
      "4 hrs intensive consulting (mock audit)",
      "Audit representation (6 hrs consulting support)",
      "Hard copy & digital policy manual",
      "Free Internal Auditor course ($890 value)",
      "30-day post-registration compliance check",
    ],
  },
];

export default function NDISSection() {
  return (
    <section id="ndis" className="py-32 bg-basalt text-white relative overflow-hidden">
      {/* Sol Monolith background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
            <Shield className="w-3.5 h-3.5" />
            NDIS Registration Specialists
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-tight">
            Your Path to NDIS<br />Registration, Simplified
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mt-4 leading-relaxed">
            We help sole traders, small providers, and allied health professionals navigate 
            the NDIS Commission audit with confidence.
          </p>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        {/* Image + Roadmap */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden"
          >
            <img
              src={NDIS_IMAGE}
              alt="Diverse professionals in collaborative environment"
              className="w-full h-full min-h-[400px] object-cover"
            />
          </motion.div>

          {/* Roadmap Timeline */}
          <div className="space-y-0">
            {roadmap.map((step, i) => (
              <motion.div
                key={step.week}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 relative"
              >
                {/* Vertical line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-harvest/20 flex items-center justify-center flex-shrink-0 border border-harvest/30">
                    <step.icon className="w-5 h-5 text-harvest" />
                  </div>
                  {i < roadmap.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 my-2" />
                  )}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-semibold text-harvest tracking-wider uppercase">{step.week}</span>
                  <h3 className="font-display font-bold text-xl text-white mt-1" style={{color: '#ffffff'}}>{step.title}</h3>
                  <p className="text-sm mt-2 leading-relaxed" style={{color: 'rgba(255,255,255,0.6)'}}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <h3 className="font-display font-bold text-3xl text-white mb-2">Simple, Transparent Pricing</h3>
          <p className="text-white/50">Choose the level of support that matches your needs.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-8 border ${
                pkg.popular
                  ? "bg-white/10 border-harvest/40 backdrop-blur-sm"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <h4 className="font-display font-bold text-2xl text-white">{pkg.name}</h4>
                {pkg.popular && (
                  <span className="text-[10px] tracking-wider uppercase font-bold bg-harvest text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="font-display font-bold text-4xl text-harvest mb-1">
                {pkg.price}
                <span className="text-base font-normal text-white/40 ml-2">+GST</span>
              </div>
              <ul className="space-y-3 my-6">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact">
                <Button
                  className={`w-full font-display py-5 gap-2 group ${
                    pkg.popular
                      ? "bg-harvest hover:bg-harvest/90 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  Get {pkg.name}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-6">*100% audit support guarantee. Terms apply.</p>
      </div>
    </section>
  );
}