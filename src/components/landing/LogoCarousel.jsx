import React from "react";
import { motion } from "framer-motion";

const LOGOS = [
  { name: "NDIS Commission", abbr: "NDIS\nCommission" },
  { name: "PRODA", abbr: "PRODA" },
  { name: "Services Australia", abbr: "Services\nAustralia" },
  { name: "Xero", abbr: "Xero" },
  { name: "MYOB", abbr: "MYOB" },
  { name: "Easy Compliance", abbr: "Easy\nCompliance" },
  { name: "CPA Australia", abbr: "CPA\nAustralia" },
  { name: "Fair Work", abbr: "Fair Work\nCommission" },
  { name: "ASIC", abbr: "ASIC" },
  { name: "ATO", abbr: "ATO" },
  { name: "AHPRA", abbr: "AHPRA" },
  { name: "Safe Work Australia", abbr: "Safe Work\nAustralia" },
];

// Duplicate for seamless infinite scroll
const DUPLICATED = [...LOGOS, ...LOGOS];

function LogoPill({ item }) {
  return (
    <div className="flex-shrink-0 mx-5 flex items-center justify-center px-7 py-4 rounded-2xl bg-white border border-border/60 shadow-sm hover:border-harvest/30 hover:shadow-md transition-all duration-300 min-w-[130px]">
      <span className="font-display font-bold text-xs text-slate_mist text-center leading-tight whitespace-pre-line tracking-wide">
        {item.abbr}
      </span>
    </div>
  );
}

export default function LogoCarousel() {
  return (
    <section className="py-20 bg-white overflow-hidden border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">
            Trusted Partners & Platforms
          </span>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-ink">
            Working With Australia's Leading Compliance Bodies
          </h3>
          <p className="text-slate_mist text-sm mt-3 max-w-lg mx-auto">
            Sol Business Consultant works across NDIS, government, and accounting platforms to deliver seamless, compliant outcomes for every client.
          </p>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, white, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, white, transparent)" }} />
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {DUPLICATED.map((item, i) => (
            <LogoPill key={i} item={item} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, white, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, white, transparent)" }} />
        <motion.div
          className="flex"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {DUPLICATED.map((item, i) => (
            <LogoPill key={i} item={item} />
          ))}
        </motion.div>
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-6 mt-12 px-6"
      >
        {[
          { label: "300+ Providers Registered", icon: "🏢" },
          { label: "98% First-Time Audit Pass Rate", icon: "✅" },
          { label: "NDIS Commission Aligned", icon: "🛡️" },
          { label: "CPA-Partnered Accounting", icon: "📊" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 px-5 py-2.5 bg-chalk rounded-full border border-border/50 text-sm text-slate_mist font-medium">
            <span>{b.icon}</span> {b.label}
          </div>
        ))}
      </motion.div>
    </section>
  );
}