import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle, FileText, Calculator, Globe,
  CreditCard, Users, TrendingUp, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    icon: FileText,
    category: "Compliance & Registration",
    name: "NDIS Starter Pack",
    price: "From $1,500",
    badge: null,
    highlight: false,
    tagline: "Everything you need to become a registered NDIS provider.",
    features: [
      "NDIS registration application",
      "Policy & procedure pack (30+ docs)",
      "Audit preparation & guidance",
      "ABN / company setup",
      "Ongoing compliance support",
    ],
    cta: "Get Registered",
    href: "/services/ndis-registration",
  },
  {
    icon: Zap,
    category: "Technology & Automation",
    name: "Easy Compliance Suite",
    price: "From $2,500",
    badge: "Most Popular",
    highlight: true,
    tagline: "Automated NDIS compliance, document generation & dashboards.",
    features: [
      "Custom compliance dashboard",
      "Automated document generation",
      "Staff training & onboarding portal",
      "Incident & risk management tools",
      "Integration with your existing systems",
      "6 months ongoing support",
    ],
    cta: "Start Automating",
    href: "/services/software-automation",
  },
  {
    icon: Globe,
    category: "Digital Presence",
    name: "Business Website Package",
    price: "From $1,800",
    badge: null,
    highlight: false,
    tagline: "Professional, SEO-ready website built to convert visitors into clients.",
    features: [
      "5–10 page responsive website",
      "SEO optimisation & setup",
      "Google Business Profile setup",
      "Contact & enquiry forms",
      "1-year hosting & maintenance",
    ],
    cta: "Build My Site",
    href: "/services/website-development",
  },
  {
    icon: Users,
    category: "Training & Development",
    name: "Support Coordination Training",
    price: "From $497",
    badge: "Best Value",
    highlight: false,
    tagline: "Industry-leading 12-module training program for NDIS workers.",
    features: [
      "12 comprehensive modules",
      "1,500+ quiz questions",
      "Video scripts & slide decks",
      "Audit-ready assessments",
      "Certificate on completion",
    ],
    cta: "Enrol Now",
    href: "/services/support-coordination-training",
  },
  {
    icon: Calculator,
    category: "Finance & Accounting",
    name: "NDIS Financial Management",
    price: "From $300/mo",
    badge: null,
    highlight: false,
    tagline: "Bookkeeping, BAS, payroll and NDIS-specific financial reporting.",
    features: [
      "Monthly bookkeeping",
      "BAS & GST lodgements",
      "Payroll & STP reporting",
      "NDIS financial reporting",
      "Tax planning & advisory",
    ],
    cta: "Get a Quote",
    href: "/services/accountancy",
  },
  {
    icon: TrendingUp,
    category: "Digital Marketing",
    name: "Marketing Growth Package",
    price: "From $499/mo",
    badge: null,
    highlight: false,
    tagline: "SEO, social media, paid ads and content to grow your client base.",
    features: [
      "Social media management",
      "SEO & Google Business",
      "Google & Meta Ads",
      "Email marketing campaigns",
      "Monthly performance reports",
    ],
    cta: "Grow My Business",
    href: "/services/marketing",
  },
];

export default function ConsultingPackagesSection() {
  return (
    <section id="consulting-packages" className="py-32 bg-ink relative overflow-hidden">
      {/* BG texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #D97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D97706 0%, transparent 50%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
              Business Consulting Packages
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white max-w-xl leading-tight">
              The Right Package for Every Stage of Growth
            </h2>
            <div className="w-20 h-[2px] bg-harvest mt-6" />
          </div>
          <p className="text-white/50 max-w-xs text-sm leading-relaxed">
            Transparent pricing. No surprises. Every package is backed by our team of industry specialists.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl border-2 p-7 flex flex-col transition-all duration-300 ${
                pkg.highlight
                  ? "bg-harvest border-harvest text-white shadow-2xl shadow-harvest/30 scale-[1.03]"
                  : "bg-white/5 border-white/10 hover:border-harvest/50 hover:bg-white/8 backdrop-blur-sm"
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <span className={`absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full ${
                  pkg.highlight ? "bg-white text-harvest" : "bg-harvest text-white"
                }`}>
                  {pkg.badge}
                </span>
              )}

              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  pkg.highlight ? "bg-white/20" : "bg-harvest/15"
                }`}>
                  <pkg.icon className={`w-5 h-5 ${pkg.highlight ? "text-white" : "text-harvest"}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                  pkg.highlight ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                }`}>
                  {pkg.category}
                </span>
              </div>

              {/* Name & tagline */}
              <h3 className={`font-display font-bold text-xl mb-1 ${pkg.highlight ? "text-white" : "text-white"}`}>
                {pkg.name}
              </h3>
              <p className={`text-sm mb-4 leading-relaxed ${pkg.highlight ? "text-white/80" : "text-white/50"}`}>
                {pkg.tagline}
              </p>

              {/* Price */}
              <div className={`font-display font-bold text-2xl mb-5 ${pkg.highlight ? "text-white" : "text-harvest"}`}>
                {pkg.price}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {pkg.features.map(f => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${pkg.highlight ? "text-white/90" : "text-white/60"}`}>
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pkg.highlight ? "text-white" : "text-harvest"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={`w-full h-10 font-semibold gap-2 ${
                  pkg.highlight
                    ? "bg-white text-harvest hover:bg-white/90"
                    : "bg-harvest hover:bg-harvest/90 text-white"
                }`}
              >
                <Link to={pkg.href}>
                  {pkg.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 rounded-2xl px-8 py-6"
        >
          <div className="flex items-center gap-4">
            <Star className="w-8 h-8 text-harvest flex-shrink-0" />
            <div>
              <p className="font-display font-bold text-white">Not sure which package is right for you?</p>
              <p className="text-white/50 text-sm">Book a free 30-minute consultation and we'll map the perfect plan.</p>
            </div>
          </div>
          <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-6 h-10 whitespace-nowrap font-semibold">
            <a href="/#contact">Book Free Consultation <ArrowRight className="w-4 h-4" /></a>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}