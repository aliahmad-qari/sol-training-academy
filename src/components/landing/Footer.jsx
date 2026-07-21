import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ABNVerificationBadge from "@/components/ABNVerificationBadge";

const solServices = [
  "NDIS Registration",
  "Support Coordination Training",
  "Bookkeeping & BAS",
  "Company Registration",
  "Website Development",
  "Software & Automation",
];

const complianceLinks = [
  "Easy Compliance Platform",
  "HR Compliance",
  "Participant Management",
  "Compliance Registers",
  "AI Document Validation",
  "Internal Audits",
];

const ndisLinks = [
  "NDIS Registration",
  "Starter Package",
  "Ultimate Package",
  "Support Coordinator Training",
  "Mock Audit Preparation",
  "Policy & Procedure Packs",
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Readiness Quiz", href: "/readiness-quiz" },
  { label: "Complaints & Feedback", href: "/complaints-feedback" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top — CTA Banner */}
        <div className="bg-harvest/10 border border-harvest/20 rounded-2xl p-10 md:p-14 mb-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight">
              Let's Build Your<br />Business Foundation
            </h3>
            <p className="text-white/70 mt-2 text-lg">Start with a free consultation today.</p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors"
          >
            Get Started <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-harvest flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-white text-lg leading-tight">SOL</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-white/40 leading-tight">Business Consultant</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Australia's trusted partner for business consulting, NDIS registration, and compliance solutions.
            </p>
          </div>

          {/* Sol Services */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-5">
              Sol Services
            </h4>
            <ul className="space-y-3">
              {solServices.map((s) => (
                <li key={s}>
                  <a href="#services" className="text-sm text-white/70 hover:text-harvest transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Easy Compliance */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-5">
              Easy Compliance
            </h4>
            <ul className="space-y-3">
              {complianceLinks.map((s) => (
                <li key={s}>
                  <a href="#compliance" className="text-sm text-white/70 hover:text-harvest transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* NDIS */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-5">
              NDIS Registration
            </h4>
            <ul className="space-y-3">
              {ndisLinks.map((s) => (
                <li key={s}>
                  <a href="#ndis" className="text-sm text-white/70 hover:text-harvest transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((s) => (
                <li key={s.label}>
                  {s.href.startsWith("/") && !s.href.startsWith("/#")
                    ? <Link to={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</Link>
                    : <a href={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</a>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ABN Badge */}
        <div className="mb-8 max-w-xs">
          <ABNVerificationBadge />
        </div>

        {/* Contact Bar */}
        <div className="border-t border-white/10 pt-8 mb-4 flex flex-wrap gap-6 text-xs text-white/70">
          <span>📞 <a href="tel:+61460003494" className="hover:text-harvest transition-colors">+61 460 003 494</a></span>
          <span>✉️ <a href="mailto:info@solbusinessconsultant.com.au" className="hover:text-harvest transition-colors">info@solbusinessconsultant.com.au</a></span>
          <span>🌐 <a href="https://www.solbusinessconsultant.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-harvest transition-colors">www.solbusinessconsultant.com.au</a></span>
          <span>📍 Glenroy VIC 3046, Australia</span>
          <span>ABN: 20 662 022 522</span>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} SOL Business Consultant — NDIS registration & compliance support across Australia. Not affiliated with NDIS Commission.
          </p>
        </div>
      </div>
    </footer>
  );
}