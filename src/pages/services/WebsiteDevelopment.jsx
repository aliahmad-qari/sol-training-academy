import React from "react";
import { motion } from "framer-motion";
import { Globe, CheckCircle, Smartphone, Search, Zap, ArrowDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GenericIntakeFlow from "@/components/intake/GenericIntakeFlow";

const HERO_IMAGE = "/images/services/business-consulting-workshop.webp";

const FEATURES = [
  { icon: Smartphone, title: "Mobile-First Design", desc: "Every site we build looks perfect on mobile, tablet, and desktop." },
  { icon: Search, title: "SEO Optimised", desc: "Built to rank. On-page SEO, fast load times, and structured content." },
  { icon: Zap, title: "Fast Delivery", desc: "Professional websites delivered in 2–4 weeks, not months." },
  { icon: Globe, title: "NDIS Specialist Sites", desc: "We understand NDIS provider needs — participant portals, service pages, intake forms." },
];

const SERVICES = [
  "New website from scratch",
  "NDIS provider website",
  "Redesign & refresh",
  "Landing pages",
  "E-commerce & booking systems",
  "Maintenance & hosting support",
];

export default function WebsiteDevelopment() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-36 pb-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-harvest/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/40 bg-harvest/10 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
              <Globe className="w-3.5 h-3.5" /> Website Development
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight mb-6">
              Professional Websites<br />That <span className="text-harvest">Convert</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl leading-relaxed mb-8">
              Mobile-friendly, SEO-optimised websites built for consultants, NDIS providers, 
              and Australian businesses. From landing pages to full digital ecosystems.
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
                  alt="Team planning a website project around a laptop"
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
                className="bg-white rounded-2xl p-6 border border-border/50">
                <f.icon className="w-8 h-8 text-harvest mb-3" />
                <h3 className="font-display font-semibold text-ink mb-1">{f.title}</h3>
                <p className="text-sm text-slate_mist">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-bold text-3xl text-ink mb-4">What We Build</h2>
              <div className="space-y-2">
                {SERVICES.map(s => (
                  <div key={s} className="flex items-center gap-2 text-slate_mist text-sm">
                    <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-basalt rounded-2xl p-8 text-white">
              <h3 className="font-display font-bold text-xl mb-3">Why Sol for Web Development?</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                We understand the NDIS industry. Your website isn't just a brochure — 
                it's your intake system, your credibility engine, and your growth tool. 
                We build sites that do all three, connected to your compliance and registration systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Get Started</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Start Your Website Enquiry</h2>
            <p className="text-slate_mist mt-3 max-w-lg mx-auto">Tell us about your project and we'll prepare a tailored proposal within 1 business day.</p>
          </div>
          <GenericIntakeFlow serviceType="website_development" />
        </div>
      </section>

      <Footer />
    </div>
  );
}