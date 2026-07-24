import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, FileCheck, ShieldCheck, Users, Clock, MessageSquare } from "lucide-react";

const STANDARDS = [
  {
    icon: ShieldCheck,
    title: "NDIS-aware guidance",
    desc: "Support is structured around publicly available NDIS Commission requirements, audit pathways, and provider obligations.",
  },
  {
    icon: FileCheck,
    title: "Documented process",
    desc: "We focus on clear records, version control, practical policies, and evidence your team can actually maintain.",
  },
  {
    icon: Users,
    title: "Human support",
    desc: "You work with a consultant who explains next steps in plain English and keeps your business context in view.",
  },
  {
    icon: Clock,
    title: "Responsive follow-up",
    desc: "New website enquiries are reviewed promptly, with realistic timeframes confirmed after assessing your situation.",
  },
];

const WORK_AREAS = [
  "NDIS registration and audit readiness",
  "Compliance document preparation",
  "Business systems and automation",
  "Bookkeeping, BAS and operational support",
  "Website, marketing and client acquisition",
  "Support coordination training resources",
];

export default function TestimonialSection() {
  return (
    <section className="py-20 md:py-28 bg-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Service Standards</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight max-w-lg">
              Built for Australian Providers and Growing Businesses
            </h2>
            <p className="text-white/70 mt-5 leading-relaxed max-w-md">
              We do not publish client names, ratings, or outcome statistics unless they are verified and approved. This section now focuses on the service standards clients can expect from SOL Business Consultant.
            </p>
            <div className="mt-6 sm:mt-8 flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
              <MessageSquare className="w-5 h-5 text-harvest flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/75 leading-relaxed">
                Have a project in mind? Use the enquiry form and we will confirm scope, cost, and likely timing before any paid work begins.
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {STANDARDS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 hover:border-harvest/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-harvest/15 flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-harvest" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 rounded-2xl bg-harvest/10 border border-harvest/25 p-5 sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-harvest mb-4">Common Support Areas</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORK_AREAS.map((area) => (
              <div key={area} className="flex items-center gap-2 text-sm text-white/75">
                <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0" />
                {area}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
