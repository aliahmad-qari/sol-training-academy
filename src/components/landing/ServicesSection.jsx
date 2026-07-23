import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Calculator, Users, Globe, Building2, CreditCard, TrendingUp } from "lucide-react";
import ServiceComparisonTable from "./ServiceComparisonTable";

const SERVICES_IMAGE = "/Images/services/business-consulting-workshop.webp";

const services = [
  { icon: FileText, num: "01", title: "NDIS Registration", desc: "Full end-to-end registration support — from application to certification.", href: "/services/ndis-registration" },
  { icon: Calculator, num: "02", title: "Accountancy & Bookkeeping", desc: "Bookkeeping, BAS, payroll, tax planning, and NDIS financial reporting.", href: "/services/accountancy" },
  { icon: Globe, num: "03", title: "Website Development", desc: "Mobile-friendly, SEO-optimised sites with conversion-focused design.", href: "/services/website-development" },
  { icon: CreditCard, num: "04", title: "Software & NDIS Automation", desc: "Document automation, compliance dashboards, and Easy Compliance setup.", href: "/services/software-automation" },
  { icon: Users, num: "05", title: "Support Coordination Training", desc: "12-module curriculum with 1,500+ quiz questions, video scripts, slide decks, and audit-ready assessments.", href: "/services/support-coordination-training" },
  { icon: Building2, num: "06", title: "Company & Business Registration", desc: "Fast ASIC company setup with ABN/TFN/GST registration and structuring.", href: "/#contact" },
  { icon: TrendingUp, num: "07", title: "Digital Marketing", desc: "SEO, social media, Google & Meta Ads, email campaigns, and full digital presence management for business growth.", href: "/services/marketing" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-32 relative">
      {/* Vertical rule */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 hidden xl:block" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
            Our Services
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-ink max-w-2xl leading-tight">
            Comprehensive Solutions for Every Stage of Growth
          </h2>
          <div className="w-20 h-[2px] bg-harvest mt-6" />
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-8 rounded-2xl border border-border/60 bg-white hover:border-harvest/40 hover:shadow-lg hover:shadow-harvest/5 transition-all duration-500 block"
              as={Link}
            >
              <Link to={service.href} className="block">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-chalk flex items-center justify-center group-hover:bg-harvest/10 transition-colors duration-300">
                    <service.icon className="w-5 h-5 text-slate_mist group-hover:text-harvest transition-colors duration-300" />
                  </div>
                  <span className="font-display text-4xl font-bold text-border/60 group-hover:text-harvest/20 transition-colors duration-300">
                    {service.num}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-2 group-hover:text-harvest transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-slate_mist leading-relaxed">
                  {service.desc}
                </p>
                <div className="flex items-center gap-1 mt-3 text-harvest text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <ServiceComparisonTable />

        {/* Image banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 rounded-3xl overflow-hidden relative"
        >
          <img
            src={SERVICES_IMAGE}
            alt="Business consultants collaborating around a laptop during a planning workshop"
            width="1400"
            height="800"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="font-display font-bold text-3xl md:text-4xl mb-3">
                Your One-Stop Business Partner
              </h3>
              <p className="text-white/70 max-w-lg mx-auto text-lg">
                From startup to scale — every service integrated under one roof
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}