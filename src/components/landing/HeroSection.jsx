import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "https://media.base44.com/images/public/6a1e37de99aadfdb49a9ef0d/ce4b4d474_generated_ebcd4dde.png";

const stats = [
  { value: "NDIS", label: "Registration Support" },
  { value: "AUD", label: "Australian Business Focus" },
  { value: "BAS", label: "Finance & Compliance" },
];

const trustHighlights = [
  { icon: ShieldCheck, label: "Audit-ready systems", value: "NDIS aligned" },
  { icon: TrendingUp, label: "Growth support", value: "Consulting + marketing" },
  { icon: Users, label: "Client guidance", value: "End-to-end support" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full border border-harvest/10 opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full border border-harvest/5 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-0">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-harvest/30 bg-harvest/5 text-harvest text-xs font-semibold tracking-wide uppercase mb-6">
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
                <span className="block text-5xl md:text-6xl lg:text-7xl">STRUCTURE.</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl">COMPLIANCE.</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl text-harvest">SCALE.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg text-slate_mist max-w-lg leading-relaxed"
            >
              From NDIS registration to Easy Compliance and strategic business consulting, we build the foundations that let your business thrive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#contact">
                <Button className="bg-harvest hover:bg-harvest/90 text-white font-display text-base px-8 py-6 gap-2 group shadow-lg shadow-harvest/20">
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#services">
                <Button variant="outline" className="font-display text-base px-8 py-6 border-ink/20 text-ink hover:bg-ink hover:text-white">
                  Explore Services
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex gap-8 pt-6 border-t border-border/60"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-3xl text-ink">{s.value}</div>
                  <div className="text-xs text-slate_mist tracking-wide uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={HERO_IMAGE}
                alt="Modern architectural interior representing structural excellence"
                className="w-full h-[640px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid gap-3">
                  {trustHighlights.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg">
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

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-border/50 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-display font-semibold text-sm text-ink">Audit Ready</span>
              </div>
              <p className="text-xs text-slate_mist">Your compliance system is configured and verified by Easy Compliance.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
