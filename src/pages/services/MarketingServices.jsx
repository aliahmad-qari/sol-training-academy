import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, CheckCircle, Megaphone, Search, Mail, Share2, BarChart2, Star, Globe, Target, TrendingUp, Users, Zap, Instagram, Facebook, Youtube, Quote, Send, Phone, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    badge: null,
    color: "border-border",
    btnClass: "border border-harvest text-harvest hover:bg-harvest hover:text-white",
    desc: "Perfect for new businesses wanting to build their online presence.",
    features: [
      "Social media setup (2 platforms)",
      "8 branded posts per month",
      "Basic SEO audit & on-page fixes",
      "Monthly performance report",
      "Google Business Profile optimisation",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$999",
    period: "/mo",
    badge: "Most Popular",
    color: "border-harvest shadow-xl shadow-harvest/10",
    btnClass: "bg-harvest text-white hover:bg-harvest/90",
    desc: "Ideal for growing businesses ready to scale their digital footprint.",
    features: [
      "Social media management (4 platforms)",
      "20 branded posts + stories per month",
      "SEO content writing (4 blogs/mo)",
      "Google Ads management (up to $2k spend)",
      "Email marketing — 2 campaigns/mo",
      "Monthly strategy call",
      "Competitor analysis report",
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    price: "$2,499",
    period: "/mo",
    badge: "Full Service",
    color: "border-ink",
    btnClass: "bg-ink text-white hover:bg-ink/90",
    desc: "End-to-end marketing for established businesses targeting aggressive growth.",
    features: [
      "Full social media management (all platforms)",
      "Unlimited branded content creation",
      "Advanced SEO + link building",
      "Google & Meta Ads (up to $10k spend)",
      "Weekly email campaigns + automation",
      "Video reels & short-form content",
      "PR & media outreach",
      "CRM integration & lead tracking",
      "Weekly strategy calls",
      "Custom analytics dashboard",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "CEO, Bright Horizons NDIS",
    avatar: "SM",
    rating: 5,
    text: "Within 3 months of starting the Growth package our enquiry volume doubled. The team handled everything — SEO, social, and ads — while we focused on our participants. Genuinely life-changing for our business.",
  },
  {
    name: "David Pham",
    role: "Director, CareLink Allied Health",
    avatar: "DP",
    rating: 5,
    text: "We went from invisible online to ranking on the first page of Google for our key services. The ROI has been incredible — every dollar spent on marketing has come back tenfold.",
  },
  {
    name: "Amara Osei",
    role: "Founder, NextStep Support Services",
    avatar: "AO",
    rating: 5,
    text: "The automation sequences alone saved us 15+ hours a week. Our leads are now nurtured automatically and our conversion rate has gone up by 40%. I can't imagine running the business without this team.",
  },
  {
    name: "James Thornton",
    role: "Managing Director, Pinnacle Disability Care",
    avatar: "JT",
    rating: 5,
    text: "Professional, proactive, and results-focused. They understood the NDIS sector immediately and the content they produce is always compliant and compelling. Our social following grew by 800% in six months.",
  },
  {
    name: "Priya Sharma",
    role: "Operations Manager, Wellness & Beyond",
    avatar: "PS",
    rating: 5,
    text: "We hired them for Google Ads and ended up staying for everything. The reporting is transparent, the team is always available, and the results speak for themselves — best marketing investment we've made.",
  },
  {
    name: "Marcus Webb",
    role: "Owner, Community First Supports",
    avatar: "MW",
    rating: 5,
    text: "Switched from another agency and the difference was night and day. Strategy sessions are actually strategic, content is high quality, and our cost per lead dropped by 60% in the first quarter.",
  },
];

const SERVICES = [
  { icon: Search, title: "Search Engine Optimisation (SEO)", desc: "Rank higher on Google with technical SEO, keyword strategy, content optimisation, and backlink building tailored to your industry." },
  { icon: Share2, title: "Social Media Marketing", desc: "Grow your audience with professionally managed Facebook, Instagram, LinkedIn, TikTok, and YouTube accounts — content creation included." },
  { icon: Target, title: "Google & Meta Ads", desc: "Data-driven paid advertising campaigns with precise audience targeting, A/B testing, and continuous optimisation for maximum ROI." },
  { icon: Mail, title: "Email Marketing & Automation", desc: "Nurture leads with segmented campaigns, automated sequences, and high-converting newsletters designed to drive sales." },
  { icon: Globe, title: "Website & Landing Page Design", desc: "Conversion-optimised websites and landing pages that turn visitors into customers — mobile-first and SEO-ready." },
  { icon: BarChart2, title: "Analytics & Reporting", desc: "Clear, actionable monthly reports tracking traffic, conversions, ROI, and campaign performance across every channel." },
  { icon: Youtube, title: "Video & Reels Production", desc: "Compelling short-form video content for social media, brand storytelling, testimonials, and promotional campaigns." },
  { icon: Users, title: "Influencer & Community Marketing", desc: "Partner with industry-relevant micro and macro influencers to amplify brand reach and drive authentic engagement." },
];

function InquiryForm() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", company_name: "", package_interest: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    await base44.entities.Enquiry.create({
      service_type: "website_development", // closest generic type
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      company_name: form.company_name,
      selected_package: form.package_interest,
      message: `[Marketing Package Enquiry — ${form.package_interest || "General"}]\n\n${form.message}`,
    });
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-harvest/10 border border-harvest/30 rounded-2xl p-10 text-center">
        <CheckCircle className="w-12 h-12 text-harvest mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-ink mb-2">Enquiry Received!</h3>
        <p className="text-slate_mist text-sm">Thanks, {form.full_name}! A marketing specialist will contact you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-8 shadow-sm space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Full Name *</label>
          <input required value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Email Address *</label>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@business.com.au"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Phone Number</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+61 4xx xxx xxx"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Business Name</label>
          <input value={form.company_name} onChange={set("company_name")} placeholder="Your Business Pty Ltd"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Package of Interest</label>
        <select value={form.package_interest} onChange={set("package_interest")}
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest text-slate_mist">
          <option value="">— Select a package —</option>
          <option value="Starter ($499/mo)">Starter — $499/mo</option>
          <option value="Growth ($999/mo)">Growth — $999/mo</option>
          <option value="Enterprise ($2,499/mo)">Enterprise — $2,499/mo</option>
          <option value="Custom / Not sure">Custom / Not sure yet</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Tell Us About Your Goals</label>
        <textarea value={form.message} onChange={set("message")} rows={4} placeholder="What are you hoping to achieve? Any specific challenges or targets?"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-harvest resize-none" />
      </div>
      <Button type="submit" disabled={status === "submitting"} className="w-full bg-harvest hover:bg-harvest/90 text-white h-11 font-semibold gap-2">
        {status === "submitting" ? "Submitting…" : <><Send className="w-4 h-4" /> Send Enquiry</>}
      </Button>
      <p className="text-center text-xs text-slate_mist">We'll respond within 1 business day. No spam, ever.</p>
    </form>
  );
}

export default function MarketingServices() {
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #D97706 0%, transparent 60%)" }} />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
              Marketing Services
            </span>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight max-w-3xl mb-6">
              Grow Your Business with Expert Digital Marketing
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mb-8 leading-relaxed">
              From SEO and paid ads to social media and email campaigns — we handle your entire online presence so you can focus on running your business.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-6 h-11">
                <Link to="/#contact">Get a Free Strategy Call <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 px-6 h-11">
                <a href="#packages">View Packages</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-harvest py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["300+", "Businesses Grown"], ["85%", "Avg. Traffic Increase"], ["4.8★", "Client Satisfaction"], ["$2M+", "Ad Spend Managed"]].map(([val, label]) => (
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
          {[["packages", "Packages & Pricing"], ["services", "All Services"]].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab ? "bg-harvest text-white" : "text-slate_mist hover:text-ink hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Packages */}
      {activeTab === "packages" && (
        <section id="packages" className="py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Transparent Pricing</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-3">Marketing Packages for Every Budget</h2>
              <p className="text-slate_mist max-w-xl mx-auto">All packages include onboarding, setup, and a dedicated account manager. No lock-in contracts.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col ${pkg.color}`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-harvest text-white text-xs font-bold px-4 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-xl text-ink mb-1">{pkg.name}</h3>
                    <p className="text-slate_mist text-sm mb-4">{pkg.desc}</p>
                    <div className="flex items-end gap-1">
                      <span className="font-display font-bold text-4xl text-ink">{pkg.price}</span>
                      <span className="text-slate_mist text-sm mb-1">{pkg.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate_mist">
                        <CheckCircle className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full h-10 font-semibold transition-colors ${pkg.btnClass}`}>
                    <Link to="/#contact">Get Started</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-slate_mist text-sm mt-8">
              Need a custom package? <Link to="/#contact" className="text-harvest font-semibold hover:underline">Contact us for a tailored quote →</Link>
            </p>
          </div>
        </section>
      )}

      {/* Services */}
      {activeTab === "services" && (
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">What We Do</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-3">Our Marketing Services</h2>
              <div className="w-16 h-0.5 bg-harvest" />
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              {SERVICES.map((svc, i) => (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group flex gap-5 p-6 rounded-2xl border border-border/60 bg-white hover:border-harvest/40 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0 group-hover:bg-harvest transition-colors">
                    <svc.icon className="w-5 h-5 text-harvest group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-ink mb-1.5">{svc.title}</h3>
                    <p className="text-sm text-slate_mist leading-relaxed">{svc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-chalk">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Client Stories</span>
            <h2 className="font-display font-bold text-4xl text-ink mb-3">Trusted by Businesses Across Australia</h2>
            <p className="text-slate_mist max-w-xl mx-auto">Real results from real clients who trusted us to grow their business.</p>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-harvest text-harvest" />)}
              <span className="text-sm font-semibold text-ink ml-2">4.9 / 5 across 300+ clients</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-border/60 p-7 flex flex-col hover:shadow-lg hover:border-harvest/30 transition-all"
              >
                <Quote className="w-8 h-8 text-harvest/30 mb-4 flex-shrink-0" />
                <p className="text-sm text-slate_mist leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-harvest text-harvest" />)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-harvest/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-harvest font-bold text-xs">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{t.name}</p>
                    <p className="text-xs text-slate_mist">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Megaphone className="w-12 h-12 text-harvest mx-auto mb-4" />
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Ready to Grow Your Business?</h2>
          <p className="text-white/60 mb-8 text-lg">Book a free 30-minute strategy session and we'll map out a custom marketing plan for your business.</p>
          <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-8 h-12 text-base font-semibold">
            <Link to="/#contact">Book a Free Strategy Call <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Contact / Inquiry Form */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left — info */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Get in Touch</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-4 leading-tight">
                Enquire About Our Marketing Packages
              </h2>
              <p className="text-slate_mist leading-relaxed mb-10">
                Fill in the form and one of our marketing specialists will reach out within one business day to discuss the best package for your goals — no obligation.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: "Call Us", value: "+61 2 0000 0000" },
                  { icon: Mail, label: "Email Us", value: "marketing@ndisacademy.com.au" },
                  { icon: MapPin, label: "Location", value: "Sydney, NSW — Australia-wide service" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-harvest" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate_mist uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-ink">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — form */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <InquiryForm />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}