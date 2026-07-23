import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ABNVerificationBadge from "@/components/ABNVerificationBadge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const solServices = [
  { label: "NDIS Registration", href: "/services/ndis-registration" },
  { label: "Support Coordination Training", href: "/services/support-coordination-training" },
  { label: "Bookkeeping & BAS", href: "/services/accountancy" },
  { label: "Company Registration", href: "/#services" },
  { label: "Website Development", href: "/services/website-development" },
  { label: "Software & Automation", href: "/services/software-automation" },
];

const complianceLinks = [
  { label: "Easy Compliance Platform", href: "/#compliance" },
  { label: "HR Compliance", href: "/#compliance-onboarding-training" },
  { label: "Participant Management", href: "/#compliance-setup-configuration" },
  { label: "Compliance Registers", href: "/#compliance-ongoing-compliance" },
  { label: "AI Document Validation", href: "/#compliance-ai-document-validation" },
  { label: "Internal Audits", href: "/#compliance-internal-audits" },
];

const ndisLinks = [
  { label: "NDIS Registration", href: "/#ndis" },
  { label: "Starter Package", href: "/#ndis-starter" },
  { label: "Ultimate Package", href: "/#ndis-ultimate" },
  { label: "Support Coordinator Training", href: "/services/support-coordination-training" },
  { label: "Mock Audit Preparation", href: "/#ndis-mock-audit" },
  { label: "Policy & Procedure Packs", href: "/#ndis-documentation" },
];

const companyLinks = [
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Readiness Quiz", href: "/readiness-quiz" },
  { label: "Complaints & Feedback", href: "/complaints-feedback" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setNewsletterLoading(true);
    try {
      await base44.entities.Enquiry.create({
        service_type: "newsletter_signup",
        full_name: "Newsletter subscriber",
        email,
        phone: "",
        company_name: "",
        message: "Newsletter signup from website footer.",
        status: "new",
        source: "website_footer_newsletter",
      });
      toast.success("You're on the SOL update list.");
      setNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter signup failed:", error);
      toast.error("We couldn't add you right now. Please try again later.");
    } finally {
      setNewsletterLoading(false);
    }
  };

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
          <Link
            to="/#contact"
            className="flex-shrink-0 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors"
          >
            Get Started <ArrowUpRight className="w-5 h-5" />
          </Link>
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
            <form onSubmit={handleNewsletterSubmit} className="mt-5 max-w-xs space-y-2">
              <label htmlFor="footer-newsletter" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Monthly compliance tips
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-harvest/60">
                <input
                  id="footer-newsletter"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email address"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-harvest px-3 text-xs font-bold text-white transition-colors hover:bg-harvest/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {newsletterLoading ? "..." : "Join"}
                </button>
              </div>
            </form>
          </div>

          {/* Sol Services */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-5">
              Sol Services
            </h4>
            <ul className="space-y-3">
              {solServices.map((s) => (
                <li key={s.label}>
                  <Link to={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</Link>
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
                <li key={s.label}>
                  <Link to={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</Link>
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
                <li key={s.label}>
                  <Link to={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</Link>
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
                  <Link to={s.href} className="text-sm text-white/70 hover:text-harvest transition-colors">{s.label}</Link>
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
