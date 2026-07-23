import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, CheckCircle, Megaphone, Search, Mail, Share2, BarChart2, Globe, Target, Send, Phone, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "/images/services/marketing-strategy-team.webp";

const PACKAGES = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    badge: null,
    color: "border-border",
    btnClass: "border border-harvest text-harvest hover:bg-harvest hover:text-white",
    desc: "For businesses that need a clean, consistent online presence.",
    features: ["Social media setup", "8 branded posts per month", "Basic SEO audit", "Google Business Profile optimisation", "Monthly performance report"],
  },
  {
    name: "Growth",
    price: "$999",
    period: "/mo",
    badge: "Popular",
    color: "border-harvest shadow-xl shadow-harvest/10",
    btnClass: "bg-harvest text-white hover:bg-harvest/90",
    desc: "For businesses ready to publish regularly and improve lead generation.",
    features: ["Social media management", "SEO content planning", "Google Ads management", "Email campaign support", "Monthly strategy call"],
  },
  {
    name: "Custom",
    price: "Quote",
    period: "",
    badge: "Scoped",
    color: "border-ink",
    btnClass: "bg-ink text-white hover:bg-ink/90",
    desc: "For multi-channel campaigns, larger content needs, or custom reporting.",
    features: ["Custom channel plan", "Paid ads and SEO scope", "Content calendar", "Analytics dashboard options", "Ongoing campaign review"],
  },
];

const SERVICES = [
  { icon: Search, title: "Search Engine Optimisation", desc: "Technical checks, keyword planning, on-page optimisation, and content guidance for Australian search intent." },
  { icon: Share2, title: "Social Media Marketing", desc: "Content planning, post creation, scheduling, and practical community management support." },
  { icon: Target, title: "Google and Meta Ads", desc: "Campaign setup, audience targeting, conversion tracking, and monthly performance review." },
  { icon: Mail, title: "Email Marketing", desc: "Newsletter planning, lead nurture emails, and simple automation journeys." },
  { icon: Globe, title: "Website and Landing Pages", desc: "Conversion-focused website pages connected to enquiry forms and business goals." },
  { icon: BarChart2, title: "Analytics and Reporting", desc: "Clear reporting on activity, traffic, leads, spend, and next actions. Results are reviewed, not guaranteed." },
];

function InquiryForm() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", company_name: "", package_interest: "", message: "" });
  const [status, setStatus] = useState("idle");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    await base44.entities.Enquiry.create({
      service_type: "marketing",
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      company_name: form.company_name,
      selected_package: form.package_interest,
      status: "new",
      source: "marketing_services_page",
      message: `[Marketing Enquiry - ${form.package_interest || "General"}]\n\n${form.message || "No message provided."}`,
    });
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-harvest/10 border border-harvest/30 rounded-2xl p-10 text-center">
        <CheckCircle className="w-12 h-12 text-harvest mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-ink mb-2">Enquiry Received</h3>
        <p className="text-slate_mist text-sm">Thanks, {form.full_name}. A SOL team member will contact you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-8 shadow-sm space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Full Name *</label>
          <input required value={form.full_name} onChange={set("full_name")} placeholder="Your full name" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Email Address *</label>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="Your email address" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Phone Number</label>
          <input value={form.phone} onChange={set("phone")} placeholder="Australian phone number" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Business Name</label>
          <input value={form.company_name} onChange={set("company_name")} placeholder="Business or trading name" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Package of Interest</label>
        <select value={form.package_interest} onChange={set("package_interest")} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-harvest text-slate_mist">
          <option value="">Select a package</option>
          <option value="Starter">Starter</option>
          <option value="Growth">Growth</option>
          <option value="Custom">Custom / Not sure yet</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Tell Us About Your Goals</label>
        <textarea value={form.message} onChange={set("message")} rows={4} placeholder="What are you hoping to achieve?" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-harvest resize-none" />
      </div>
      <Button type="submit" disabled={status === "submitting"} className="w-full bg-harvest hover:bg-harvest/90 text-white h-11 font-semibold gap-2">
        {status === "submitting" ? "Submitting..." : <><Send className="w-4 h-4" /> Send Enquiry</>}
      </Button>
      <p className="text-center text-xs text-slate_mist">We'll respond within 1 business day. No spam.</p>
    </form>
  );
}

export default function MarketingServices() {
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #D97706 0%, transparent 60%)" }} />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Marketing Services</span>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight max-w-3xl mb-6">
              Practical Digital Marketing for Australian Businesses
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mb-8 leading-relaxed">
              SEO, paid ads, social media, email, and reporting support designed around clear scope, Australian audiences, and measurable next actions.
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
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                <img
                  src={HERO_IMAGE}
                  alt="Marketing team collaborating on a campaign strategy in an office"
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

      <div className="bg-harvest py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {["No lock-in plans", "Australian contact", "Monthly reporting", "Clear campaign scope"].map((label) => (
            <div key={label}>
              <p className="font-display font-bold text-xl text-white">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-3">
          {[["packages", "Packages & Pricing"], ["services", "All Services"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab ? "bg-harvest text-white" : "text-slate_mist hover:text-ink hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "packages" && (
        <section id="packages" className="py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Transparent Pricing</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-3">Marketing Packages</h2>
              <p className="text-slate_mist max-w-xl mx-auto">Packages are scoped before work begins. Ad spend, content volume, and reporting needs are confirmed during onboarding.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg, i) => (
                <motion.div key={pkg.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col ${pkg.color}`}>
                  {pkg.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-harvest text-white text-xs font-bold px-4 py-1 rounded-full">{pkg.badge}</span>}
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-xl text-ink mb-1">{pkg.name}</h3>
                    <p className="text-slate_mist text-sm mb-4">{pkg.desc}</p>
                    <div className="flex items-end gap-1">
                      <span className="font-display font-bold text-4xl text-ink">{pkg.price}</span>
                      <span className="text-slate_mist text-sm mb-1">{pkg.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {pkg.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-sm text-slate_mist"><CheckCircle className="w-4 h-4 text-harvest flex-shrink-0 mt-0.5" />{f}</li>)}
                  </ul>
                  <Button asChild className={`w-full h-10 font-semibold transition-colors ${pkg.btnClass}`}><Link to="/#contact">Get Started</Link></Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <motion.div key={svc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="group flex gap-5 p-6 rounded-2xl border border-border/60 bg-white hover:border-harvest/40 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0 group-hover:bg-harvest transition-colors"><svc.icon className="w-5 h-5 text-harvest group-hover:text-white transition-colors" /></div>
                  <div><h3 className="font-display font-semibold text-ink mb-1.5">{svc.title}</h3><p className="text-sm text-slate_mist leading-relaxed">{svc.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-ink">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Megaphone className="w-12 h-12 text-harvest mx-auto mb-4" />
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Ready to Discuss Your Marketing?</h2>
          <p className="text-white/60 mb-8 text-lg">Book a free strategy call and we will scope the right marketing plan before recommending paid work.</p>
          <Button asChild className="bg-harvest hover:bg-harvest/90 text-white gap-2 px-8 h-12 text-base font-semibold"><Link to="/#contact">Book a Free Strategy Call <ArrowRight className="w-4 h-4" /></Link></Button>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Get in Touch</span>
              <h2 className="font-display font-bold text-4xl text-ink mb-4 leading-tight">Enquire About Marketing Support</h2>
              <p className="text-slate_mist leading-relaxed mb-10">Tell us what you need and a SOL team member will respond within one business day.</p>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: "Call Us", value: "+61 460 003 494" },
                  { icon: Mail, label: "Email Us", value: "info@solbusinessconsultant.com.au" },
                  { icon: MapPin, label: "Location", value: "Glenroy VIC 3046 - Australia-wide service" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-harvest" /></div><div><p className="text-xs font-semibold text-slate_mist uppercase tracking-wider">{label}</p><p className="text-sm font-medium text-ink">{value}</p></div></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><InquiryForm /></motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
