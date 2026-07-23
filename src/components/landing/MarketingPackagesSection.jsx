import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    badge: null,
    highlight: false,
    features: ["Social media (2 platforms)", "8 branded posts/mo", "Basic SEO audit", "Google Business Profile", "Monthly report"],
  },
  {
    name: "Growth",
    price: "$999",
    period: "/mo",
    badge: "Most Popular",
    highlight: true,
    features: ["Social media (4 platforms)", "20 posts + stories/mo", "SEO blog content (4/mo)", "Google Ads management", "Email campaigns (2/mo)", "Dedicated account manager"],
  },
  {
    name: "Enterprise",
    price: "$2,499",
    period: "/mo",
    badge: "Full Service",
    highlight: false,
    features: ["All platforms managed", "Scoped content creation plan", "Advanced SEO + link building", "Google & Meta Ads", "Video reels & PR outreach", "Custom analytics dashboard"],
  },
];

export default function MarketingPackagesSection() {
  return (
    <section id="marketing" className="py-32 bg-chalk relative overflow-hidden">
      {/* BG accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-harvest/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

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
              Digital Marketing
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ink max-w-xl leading-tight">
              Marketing Packages Built for Measurable Growth
            </h2>
            <div className="w-20 h-[2px] bg-harvest mt-6" />
          </div>
          <p className="text-slate_mist max-w-xs text-sm leading-relaxed">
            From social media to paid ads, we manage the digital channels that support your growth goals.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col border-2 transition-all ${
                pkg.highlight
                  ? "bg-ink border-harvest text-white shadow-2xl shadow-harvest/10 scale-[1.02]"
                  : "bg-white border-border hover:border-harvest/40 hover:shadow-lg"
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-harvest text-white text-xs font-bold px-4 py-1 rounded-full">
                  {pkg.badge}
                </span>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pkg.highlight ? "bg-harvest/20" : "bg-harvest/10"}`}>
                    <Megaphone className="w-4 h-4 text-harvest" />
                  </div>
                  <h3 className={`font-display font-bold text-lg ${pkg.highlight ? "text-white" : "text-ink"}`}>{pkg.name}</h3>
                </div>
                <div className="flex items-end gap-1">
                  <span className={`font-display font-bold text-4xl ${pkg.highlight ? "text-white" : "text-ink"}`}>{pkg.price}</span>
                  <span className={`text-sm mb-1 ${pkg.highlight ? "text-white/60" : "text-slate_mist"}`}>{pkg.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {pkg.features.map(f => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${pkg.highlight ? "text-white/80" : "text-slate_mist"}`}>
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pkg.highlight ? "text-harvest" : "text-harvest"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full h-10 font-semibold ${
                  pkg.highlight
                    ? "bg-harvest hover:bg-harvest/90 text-white"
                    : "border border-harvest text-harvest hover:bg-harvest hover:text-white bg-transparent"
                }`}
              >
                <Link to="/marketing-packages">Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/marketing-packages" className="inline-flex items-center gap-2 text-harvest font-semibold text-sm hover:gap-3 transition-all">
            View all marketing services & custom packages <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}