import React from "react";
import { motion } from "framer-motion";

const ABOUT_IMAGE = "https://media.base44.com/images/public/6a1e37de99aadfdb49a9ef0d/47fbe6fb5_generated_7c663069.png";

const values = [
  { num: "01", title: "Precision", desc: "Every policy, every document, every system — built with meticulous accuracy." },
  { num: "02", title: "Partnership", desc: "We don't just consult. We walk beside you at every milestone of your journey." },
  { num: "03", title: "Innovation", desc: "AI-powered compliance, cloud-first thinking, and future-ready strategies." },
  { num: "04", title: "Integrity", desc: "Transparent pricing, honest consulting, and a 98% first-time pass rate to prove it." },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
            About Sol
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-ink max-w-2xl leading-tight">
            The Foundation<br />of Your Growth
          </h2>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        {/* Image + Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={ABOUT_IMAGE}
              alt="Modern architectural facade representing structural excellence"
              className="w-full h-[400px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
            style={{color: 'inherit'}}
          >
            <p className="text-lg leading-relaxed" style={{color: '#64748B'}}>
              SOL Business Consultant is Australia's trusted partner for business consulting, 
              NDIS registration, and compliance. We empower businesses and elevate success — 
              helping you streamline finances, optimise operations, and plan for long-term growth.
            </p>
            <p className="text-lg leading-relaxed" style={{color: '#64748B'}}>
              With <strong style={{color: '#0F172A'}}>Easy Compliance</strong> integrated into our ecosystem, 
              we've transformed how NDIS providers manage audits — turning months of stress into 
              weeks of structured, AI-powered preparation. From sole traders to established enterprises, 
              we build the systems that let you focus on what matters.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="font-display font-bold text-3xl text-harvest">300+</div>
                <div className="text-xs text-slate_mist mt-1 uppercase tracking-wide">Providers Registered</div>
              </div>
              <div>
                <div className="font-display font-bold text-3xl text-harvest">100+</div>
                <div className="text-xs text-slate_mist mt-1 uppercase tracking-wide">Businesses Served</div>
              </div>
              <div>
                <div className="font-display font-bold text-3xl text-harvest">98%</div>
                <div className="text-xs text-slate_mist mt-1 uppercase tracking-wide">Pass Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 border-t-2 border-harvest/30 hover:border-harvest transition-colors duration-300"
            >
              <span className="font-display text-5xl font-bold text-border/40">{v.num}</span>
              <h4 className="font-display font-bold text-lg text-ink mt-4 mb-2">{v.title}</h4>
              <p className="text-sm text-slate_mist leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}