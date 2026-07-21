import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  CheckCircle, XCircle, ArrowRight, Megaphone, Search, Mail,
  Share2, BarChart2, Globe, Target, Youtube, Users, Phone, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { icon: Search, title: "Search Engine Optimisation (SEO)", desc: "Rank higher on Google with technical SEO, keyword strategy, on-page optimisation, and backlink building." },
  { icon: Share2, title: "Social Media Marketing", desc: "Professionally managed Facebook, Instagram, LinkedIn & TikTok - content creation, scheduling, and community management included." },
  { icon: Target, title: "Google & Meta Ads", desc: "Data-driven paid campaigns with precision audience targeting, A/B testing, and monthly ROI reporting." },
  { icon: Mail, title: "Email Marketing & Automation", desc: "Segmented campaigns, automated sequences, and high-converting newsletters designed to nurture leads into sales." },
  { icon: Globe, title: "Website & Landing Page Design", desc: "Conversion-optimised, mobile-first websites and landing pages built for SEO and lead generation." },
  { icon: BarChart2, title: "Analytics & Reporting", desc: "Actionable monthly reports covering traffic, conversions, ROI, and performance across every channel." },
  { icon: Youtube, title: "Video & Reels Production", desc: "Short-form video for social media, brand storytelling, testimonials, and promotional campaigns." },
  { icon: Users, title: "Influencer & Community Marketing", desc: "Partner with industry micro and macro influencers to amplify reach and drive authentic engagement." },
];

const PACKAGES = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    color: "border-border",
    badge: null,
    dark: false,
    tagline: "Get your brand online and visible.",
    features: [
      { label: "Social media platforms", value: "2" },
      { label: "Branded posts per month", value: "8" },
      { label: "Basic SEO audit & fixes", value: true },
      { label: "Google Business Profile setup", value: true },
      { label: "Monthly performance report", value: true },
      { label: "SEO blog content writing", value: false },
      { label: "Google Ads management", value: false },
      { label: "Email campaigns", value: false },
      { label: "Video / Reels content", value: false },
      { label: "Dedicated account manager", value: false },
      { label: "Custom analytics dashboard", value: false },
    ],
  },
  {
    name: "Growth",
    price: "$999",
    period: "/mo",
    color: "border-harvest",
    badge: "Most Popular",
    dark: true,
    tagline: "Scale your digital presence and generate leads.",
    features: [
      { label: "Social media platforms", value: "4" },
      { label: "Branded posts per month", value: "20 + stories" },
      { label: "Basic SEO audit & fixes", value: true },
      { label: "Google Business Profile setup", value: true },
      { label: "Monthly performance report", value: true },
      { label: "SEO blog content writing", value: "4 blogs/mo" },
      { label: "Google Ads management", value: "Up to $2k spend" },
      { label: "Email campaigns", value: "2/mo" },
      { label: "Video / Reels content", value: false },
      { label: "Dedicated account manager", value: true },
      { label: "Custom analytics dashboard", value: false },
    ],
  },
  {
    name: "Enterprise",
    price: "$2,499",
    period: "/mo",
    color: "border-ink",
    badge: "Full Service",
    dark: false,
    tagline: "End-to-end marketing for maximum growth.",
    features: [
      { label: "Social media platforms", value: "All platforms" },
      { label: "Branded posts per month", value: "Unlimited" },
      { label: "Basic SEO audit & fixes", value: true },
      { label: "Google Business Profile setup", value: true },
      { label: "Monthly performance report", value: true },
      { label: "SEO blog content writing", value: "Unlimited" },
      { label: "Google Ads management", value: "Up to $10k spend" },
      { label: "Email campaigns", value: "Weekly + automation" },
      { label: "Video / Reels content", value: true },
      { label: "Dedicated account manager", value: true },
      { label: "Custom analytics dashboard", value: true },
    ],
  },
];

const ADD_ONS = [
  { name: "Extra Blog Posts", price: "$120/post", desc: "Additional SEO-optimised articles beyond your plan's allocation." },
  { name: "Google Ads Top-Up", price: "$200/mo", desc: "Increase managed ad spend by $1,000 per month on top of your plan." },
  { name: "Video Production Pack", price: "$350/mo", desc: "4 short-form video reels or testimonial videos produced monthly." },
  { name: "PR & Media Outreach", price: "$500/mo", desc: "Press releases and media placement in industry publications." },
  { name: "CRM Setup & Integration", price: "$800 one-off", desc: "Full CRM onboarding + lead pipeline automation setup." },
  { name: "Brand Identity Design", price: "$1,200 one-off", desc: "Logo, colour palette, typography, brand guidelines document." },
];

function FeatureCell({ value, dark }) {
  if (value === true) return <CheckCircle className={`w-5 h-5 mx-auto ${dark ? "text-harvest" : "text-harvest"}`} />;
  if (value === false) return <XCircle className="w-5 h-5 mx-auto text-slate-300" />;
  return <span className={`text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>{value}</span>;
}

export default function MarketingPackages() {
  const [activeTab, setActiveTab] = useState("table");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 40%, #D97706 0%, transparent 60%)" }} />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Digital Marketing</span>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight max-w-3xl mb-6">
              Marketing Packages & Services
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mb-8 leading-relaxed">
              Transparent pricing and flexible plans. Choose a package or build a custom plan with our team.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-6 h-11">
                <a href="#packages">View Packages <ArrowRight className="w-4 h-4" /></a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 px-6 h-11">
                <a href="#contact-cta">Talk to Us</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-harvest py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[ ["Scoped", "Campaign Plans"], ["Monthly", "Performance Review"], ["No Lock-In", "Flexible Plans"], ["Australia", "Local Contact"] ].map(([val, label]) => (
            <div key={label}>
              <p className="font-display font-bold text-3xl text-white">{val}</p>
              <p className="text-white/80 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-3">
          {[["table", "Package Comparison"], ["cards", "Package Cards"], ["services", "All Services"], ["addons", "Add-Ons"]].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab ? "bg-harvest text-white" : "text-slate_mist hover:text-ink hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      {activeTab === "table" && (
        <section id="packages" className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Compare Plans</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-3">Feature Comparison</h2>
              <p className="text-slate_mist max-w-xl mx-auto">All plans include onboarding, setup, and a no lock-in monthly contract.</p>
            </motion.div>

            <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-5 bg-slate-50 text-slate_mist font-semibold text-xs uppercase tracking-wider w-1/3 border-b border-border">Feature</th>
                    {PACKAGES.map(pkg => (
                      <th key={pkg.name} className={`px-6 py-5 text-center border-b border-border ${pkg.dark ? "bg-ink" : "bg-slate-50"}`}>
                        <div className="flex flex-col items-center gap-1">
                          {pkg.badge && (
                            <span className="bg-harvest text-white text-[10px] font-bold px-3 py-0.5 rounded-full mb-1">{pkg.badge}</span>
                          )}
                          <span className={`font-display font-bold text-base ${pkg.dark ? "text-white" : "text-ink"}`}>{pkg.name}</span>
                          <div className="flex items-end gap-0.5">
                            <span className={`font-display font-bold text-2xl ${pkg.dark ? "text-harvest" : "text-ink"}`}>{pkg.price}</span>
                            <span className={`text-xs mb-1 ${pkg.dark ? "text-white/50" : "text-slate_mist"}`}>{pkg.period}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PACKAGES[0].features.map((feat, i) => (
                    <tr key={feat.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-6 py-4 text-slate_mist font-medium">{feat.label}</td>
                      {PACKAGES.map(pkg => (
                        <td key={pkg.name} className={`px-6 py-4 text-center ${pkg.dark ? "bg-ink/5" : ""}`}>
                          <FeatureCell value={pkg.features[i].value} dark={pkg.dark} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* CTA row */}
                  <tr className="bg-slate-50 border-t border-border">
                    <td className="px-6 py-5 font-semibold text-ink">Ready to get started?</td>
                    {PACKAGES.map(pkg => (
                      <td key={pkg.name} className="px-6 py-5 text-center">
                        <Button
                          asChild
                          className={pkg.dark
                            ? "bg-harvest hover:bg-harvest/90 text-white w-full"
                            : "border border-harvest text-harvest hover:bg-harvest hover:text-white bg-transparent w-full"
                          }
                        >
                          <a href="#contact-cta">Get {pkg.name}</a>
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* PACKAGE CARDS */}
      {activeTab === "cards" && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Choose Your Plan</span>
              <h2 className="font-display font-bold text-4xl text-ink">Marketing Packages</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col ${pkg.dark ? "bg-ink border-harvest text-white" : "bg-white border-border hover:border-harvest/40 hover:shadow-lg"} transition-all`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-harvest text-white text-xs font-bold px-4 py-1 rounded-full">{pkg.badge}</span>
                  )}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pkg.dark ? "bg-harvest/20" : "bg-harvest/10"}`}>
                        <Megaphone className="w-4 h-4 text-harvest" />
                      </div>
                      <h3 className={`font-display font-bold text-xl ${pkg.dark ? "text-white" : "text-ink"}`}>{pkg.name}</h3>
                    </div>
                    <p className={`text-sm mb-4 ${pkg.dark ? "text-white/60" : "text-slate_mist"}`}>{pkg.tagline}</p>
                    <div className="flex items-end gap-1 mb-6">
                      <span className={`font-display font-bold text-4xl ${pkg.dark ? "text-white" : "text-ink"}`}>{pkg.price}</span>
                      <span className={`text-sm mb-1 ${pkg.dark ? "text-white/50" : "text-slate_mist"}`}>{pkg.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {pkg.features.filter(f => f.value !== false).map(f => (
                      <li key={f.label} className={`flex items-start gap-2.5 text-sm ${pkg.dark ? "text-white/80" : "text-slate_mist"}`}>
                        <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />
                        <span>{f.label}{typeof f.value === "string" ? `: ${f.value}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full h-10 font-semibold ${pkg.dark ? "bg-harvest hover:bg-harvest/90 text-white" : "border border-harvest text-harvest hover:bg-harvest hover:text-white bg-transparent"}`}
                  >
                    <a href="#contact-cta">Get Started <ArrowRight className="w-4 h-4 ml-1" /></a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL SERVICES */}
      {activeTab === "services" && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Full Service List</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-2">All Marketing Services</h2>
              <div className="w-16 h-0.5 bg-harvest" />
            </motion.div>
            <div className="grid md:grid-cols-2 gap-5">
              {SERVICES.map((svc, i) => (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex gap-5 p-6 rounded-2xl border border-border/60 bg-white hover:border-harvest/40 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0 group-hover:bg-harvest transition-colors">
                    <svc.icon className="w-5 h-5 text-harvest group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink mb-1.5">{svc.title}</h3>
                    <p className="text-sm text-slate_mist leading-relaxed mb-3">{svc.desc}</p>
                    <Button asChild size="sm" className="border border-harvest text-harvest hover:bg-harvest hover:text-white bg-transparent text-xs h-8">
                      <a href="#contact-cta">Enquire Now</a>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ADD-ONS */}
      {activeTab === "addons" && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Enhancements</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-2">Optional Add-Ons</h2>
              <p className="text-slate_mist">Bolt these on to any plan to supercharge your results.</p>
              <div className="w-16 h-0.5 bg-harvest mt-4" />
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ADD_ONS.map((addon, i) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-border p-6 flex flex-col hover:border-harvest/40 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-semibold text-ink">{addon.name}</h3>
                    <span className="text-harvest font-bold text-sm bg-harvest/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">{addon.price}</span>
                  </div>
                  <p className="text-sm text-slate_mist leading-relaxed flex-1 mb-4">{addon.desc}</p>
                  <Button asChild size="sm" className="border border-harvest text-harvest hover:bg-harvest hover:text-white bg-transparent w-full">
                    <a href="#contact-cta">Add to My Plan</a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section id="contact-cta" className="py-24 bg-ink">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Megaphone className="w-12 h-12 text-harvest mx-auto mb-5" />
            <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to Grow Your Business?</h2>
            <p className="text-white/60 mb-10 text-lg max-w-xl mx-auto">Book a free strategy session. We will review your goals and scope a practical marketing plan before recommending paid work.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-8 h-12 text-base font-semibold">
                <a href="tel:+61460003494"><Phone className="w-4 h-4" /> Call SOL</a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 px-8 h-12 text-base font-semibold">
                <Link to="/#contact"><MessageSquare className="w-4 h-4" /> Send an Enquiry</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
