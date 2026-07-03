import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "SOL Business Consultant helped us go from zero to NDIS registered in under 8 weeks. Their policy templates, branded document pack, and mock audit preparation were exceptional. We passed first time with zero corrective actions.",
    name: "Michelle T.",
    role: "Director",
    company: "Horizon Care Services",
    location: "Melbourne, VIC",
    service: "NDIS Registration",
    rating: 5,
  },
  {
    quote: "Easy Compliance completely transformed how we approach audits. What used to take our team weeks of frantic document hunting now takes a few clicks. The AI document validation alone has saved us countless hours every month.",
    name: "James R.",
    role: "Operations Manager",
    company: "Pathway Support Coordination",
    location: "Sydney, NSW",
    service: "Easy Compliance",
    rating: 5,
  },
  {
    quote: "The team didn't just hand us templates — they walked us through every step of the NDIS Commission process. Our audit went perfectly. The level of care and expertise was unlike anything I've experienced with other consultants.",
    name: "Priya S.",
    role: "Founder",
    company: "SunriseSIL Provider",
    location: "Brisbane, QLD",
    service: "NDIS Registration",
    rating: 5,
  },
  {
    quote: "Sol's support coordination training curriculum is genuinely the most comprehensive I've seen in Australia. The 12 modules, quiz bank, and scenario assessments gave our entire team a rock-solid foundation to operate confidently.",
    name: "David K.",
    role: "Training Manager",
    company: "CareForward Australia",
    location: "Perth, WA",
    service: "Support Coordination Training",
    rating: 5,
  },
  {
    quote: "Our bookkeeping and BAS were a mess before Sol took over. Within two months everything was reconciled, lodged on time, and we had a clear financial picture for the first time. Outstanding accountancy service.",
    name: "Sarah M.",
    role: "CEO",
    company: "Ability Connect Pty Ltd",
    location: "Adelaide, SA",
    service: "Accountancy",
    rating: 5,
  },
  {
    quote: "The automation system Sol built for our NDIS document generation is a game-changer. What used to be a manual 3-hour process is now fully automated in seconds. Incredibly well-built and the handover training was thorough.",
    name: "Tom L.",
    role: "Compliance Lead",
    company: "SupportSphere NDIS",
    location: "Melbourne, VIC",
    service: "Software & Automation",
    rating: 5,
  },
];

const SERVICE_COLORS = {
  "NDIS Registration": "bg-harvest/10 text-harvest",
  "Easy Compliance": "bg-blue-50 text-blue-600",
  "Support Coordination Training": "bg-emerald-50 text-emerald-600",
  "Accountancy": "bg-purple-50 text-purple-600",
  "Software & Automation": "bg-orange-50 text-orange-600",
};

function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-harvest text-harvest" />
      ))}
    </div>
  );
}

export default function TestimonialSection() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActive(a => (a + 1) % TESTIMONIALS.length);

  // Show 3 cards on desktop, 1 on mobile (centred on active)
  const visible = [
    TESTIMONIALS[(active) % TESTIMONIALS.length],
    TESTIMONIALS[(active + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(active + 2) % TESTIMONIALS.length],
  ];

  return (
    <section className="py-28 bg-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Client Stories</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight max-w-lg">
              Trusted by Providers<br />Across Australia
            </h2>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex -space-x-1">
                {["M","J","P","D","S"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-harvest/20 border-2 border-ink flex items-center justify-center">
                    <span className="text-xs font-bold text-harvest">{l}</span>
                  </div>
                ))}
              </div>
              <div>
                <StarRating />
                <p className="text-xs text-white/40 mt-0.5">300+ providers registered & supported</p>
              </div>
            </div>
          </motion.div>

          {/* Nav buttons */}
          <div className="flex gap-3">
            <button onClick={prev} className="w-11 h-11 rounded-full border border-white/20 hover:border-harvest hover:bg-harvest/10 flex items-center justify-center text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="w-11 h-11 rounded-full border border-white/20 hover:border-harvest hover:bg-harvest/10 flex items-center justify-center text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards — desktop: 3 columns, mobile: 1 */}
        <div className="grid md:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <motion.div
              key={`${active}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-2xl p-7 border flex flex-col gap-5 transition-all duration-300 ${
                i === 0
                  ? "bg-harvest border-harvest/40 shadow-2xl shadow-harvest/10"
                  : "bg-white/5 border-white/10 hover:border-white/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <Quote className={`w-7 h-7 flex-shrink-0 ${i === 0 ? "text-white/40" : "text-harvest/40"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  i === 0 ? "bg-white/20 text-white" : (SERVICE_COLORS[t.service] || "bg-white/10 text-white/60")
                }`}>
                  {t.service}
                </span>
              </div>

              <p className={`text-[15px] leading-relaxed flex-1 ${i === 0 ? "text-white" : "text-white/70"}`}>
                "{t.quote}"
              </p>

              <div className={`border-t pt-5 flex items-center justify-between ${i === 0 ? "border-white/20" : "border-white/10"}`}>
                <div>
                  <p className={`font-display font-bold text-sm ${i === 0 ? "text-white" : "text-white"}`}>{t.name}</p>
                  <p className={`text-xs mt-0.5 ${i === 0 ? "text-white/70" : "text-white/40"}`}>{t.role}, {t.company}</p>
                  <p className={`text-[10px] mt-0.5 ${i === 0 ? "text-white/50" : "text-white/30"}`}>{t.location}</p>
                </div>
                <StarRating count={t.rating} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-6 h-2 bg-harvest" : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}