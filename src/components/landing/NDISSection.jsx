import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, FileCheck, Users, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NDIS_IMAGE = "/Images/services/ndis-registration-documents.webp";

const roadmap = [
  { id: "ndis-discovery", week: "Week 1", title: "Discovery Call", desc: "Free consultation to assess eligibility, registration groups, and your timeline.", icon: Clock },
  { id: "ndis-documentation", week: "Weeks 2-3", title: "Documentation & Application", desc: "Customised policies, quality system, NDIS portal submission, and auditor matching.", icon: FileCheck },
  { id: "ndis-mock-audit", week: "Weeks 3-4", title: "Mock Audit & Training", desc: "Simulate audit-style questions, identify gaps early, and coach your team through the process.", icon: Users },
  { id: "ndis-certification", week: "Ongoing", title: "Registration Decision & Beyond", desc: "Support audit follow-up, respond to findings, and keep your systems ready after the Commission's decision.", icon: Award },
];

const packages = [
  {
    id: "ndis-starter",
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
    id: "ndis-ultimate",
    name: "Ultimate",
    price: "$6,500",
    popular: false,
    features: [
      "Everything in Starter",
      "4 hrs intensive consulting (mock audit)",
      "Audit representation (6 hrs consulting support)",
      "Hard copy & digital policy manual",
      "Internal audit preparation resources",
      "30-day post-registration compliance check",
    ],
  },
];

export default function NDISSection() {
  return (
    <section id="ndis" className="py-20 md:py-32 bg-basalt text-white relative overflow-hidden">
      {/* Sol Monolith background */}
      <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] pointer-events-none sm:block sm:h-[620px] sm:w-[620px] lg:h-[900px] lg:w-[900px]" />
      <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] pointer-events-none sm:block sm:h-[480px] sm:w-[480px] lg:h-[700px] lg:w-[700px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-tight">
            Your Path to NDIS<br />Registration, Simplified
          </h2>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mt-4 leading-relaxed">
            We help sole traders, small providers, and allied health professionals navigate 
            the NDIS Commission audit with confidence.
          </p>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        {/* Image + Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-14 md:mb-24">
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
              alt="Consultants reviewing NDIS registration documents in a professional office"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-[320px] sm:h-[400px] lg:h-full lg:min-h-[400px] object-cover"
            />
          </motion.div>

          {/* Roadmap Timeline */}
          <div className="space-y-0">
            {roadmap.map((step, i) => (
              <motion.div
                key={step.week}
                id={step.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 sm:gap-6 relative scroll-mt-32"
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
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">Simple, Transparent Pricing</h3>
          <p className="text-white/70">Choose the level of support that matches your needs.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              id={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-5 sm:p-8 border scroll-mt-32 ${
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
              <div className="font-display font-bold text-3xl sm:text-4xl text-harvest mb-1">
                {pkg.price}
                <span className="text-base font-normal text-white/70 ml-2">+GST</span>
              </div>
              <ul className="space-y-3 my-6">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/#contact">
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
              </Link>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-white/60 mt-6">*Audit support included. Registration and audit outcomes depend on your circumstances and the independent auditor; individual results are not guaranteed. Terms apply.</p>
      </div>
    </section>
  );
}