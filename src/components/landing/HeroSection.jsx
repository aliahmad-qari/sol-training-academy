import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ShieldCheck, TrendingUp, Users, Award, MapPin, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/Images/services/business-consulting-workshop.webp";

const stats = [
  { value: "3", label: "Training levels" },
  { value: "1,500+", label: "Quiz questions" },
  { value: "24h", label: "Response target" },
];

const trustHighlights = [
  { icon: ShieldCheck, label: "Audit-ready systems", value: "NDIS aligned" },
  { icon: TrendingUp, label: "Growth support", value: "Consulting + marketing" },
  { icon: Users, label: "Client guidance", value: "End-to-end support" },
];

// Honest trust signals drawn from what the business actually offers.
const trustBadges = [
  { icon: MapPin, label: "Australian-owned" },
  { icon: FileCheck, label: "NDIS-aligned processes" },
  { icon: Award, label: "Easy Compliance support" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-0 lg:min-h-screen flex items-center overflow-hidden pt-24 lg:pt-20">
      <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 translate-x-1/3 rounded-full border border-harvest/10 opacity-40 pointer-events-none sm:block sm:h-[520px] sm:w-[520px] lg:h-[800px] lg:w-[800px]" />
      <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 translate-x-1/4 rounded-full border border-harvest/5 opacity-30 pointer-events-none sm:block sm:h-[420px] sm:w-[420px] lg:h-[600px] lg:w-[600px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-10 sm:py-12 lg:py-0">
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-harvest/30 bg-harvest/5 text-harvest text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-5 sm:mb-6">
                <CheckCircle className="w-3.5 h-3.5" />
                Australian Business & NDIS Consulting
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="font-display font-bold text-ink leading-[1.05] tracking-tight">
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">STRUCTURE.</span>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">COMPLIANCE.</span>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-harvest">SCALE.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-base md:text-lg text-slate_mist max-w-lg leading-relaxed"
            >
              From NDIS registration to Easy Compliance and strategic business consulting, we build the foundations that let your business thrive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link to="/#contact" className="w-full sm:w-auto">
                <Button className="w-full justify-center bg-harvest hover:bg-harvest/90 text-white font-display text-base px-6 sm:px-8 py-5 sm:py-6 gap-2 group shadow-lg shadow-harvest/20 sm:w-auto">
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/#services" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full justify-center font-display text-base px-6 sm:px-8 py-5 sm:py-6 border-ink/20 text-ink hover:bg-ink hover:text-white sm:w-auto">
                  Explore Services
                </Button>
              </Link>
            </motion.div>

            {/* Trust-badge cluster (eploy-style social proof row) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2"
            >
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5">
                  <badge.icon className="w-4 h-4 text-harvest flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate_mist">{badge.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-border/60"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-ink">{s.value}</div>
                  <div className="text-xs text-slate_mist tracking-wide uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative mt-4 lg:mt-0"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={HERO_IMAGE}
                alt="Business consultants collaborating around a laptop during a strategic planning workshop"
                width="960"
                height="1280"
                fetchPriority="high"
                decoding="async"
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-[320px] sm:h-[440px] lg:h-[640px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                <div className="grid gap-3">
                  {trustHighlights.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-3 shadow-lg">
                      <div className="w-9 h-9 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-harvest" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate_mist uppercase tracking-wide">{item.label}</p>
                        <p className="font-display font-semibold text-sm text-ink">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-4 right-4 max-w-[calc(100%-2rem)] bg-white rounded-2xl p-5 shadow-xl border border-border/50 sm:-left-6 sm:right-auto sm:max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-display font-semibold text-sm text-ink">Audit Ready</span>
              </div>
              <p className="text-xs text-slate_mist">Your compliance system is configured and reviewed against your workflow.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
