import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2 } from "lucide-react";

const TRUST_POINTS = [
  "NDIS Registration & Compliance",
  "Website & Software Development",
  "Accountancy & Business Services",
  "Dedicated Client Portal Access",
];

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-ink flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-harvest/8 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-harvest/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-harvest flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-tight">SOL Business</p>
            <p className="text-white/40 text-[11px] uppercase tracking-widest">Consultant</p>
          </div>
        </Link>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-harvest/15 text-harvest text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Shield className="w-3.5 h-3.5" />
              NDIS Registered Provider Support
            </div>
            <h2 className="font-display font-bold text-white text-4xl leading-tight">
              Your trusted partner for NDIS compliance & business growth
            </h2>
            <p className="text-white/50 mt-4 text-sm leading-relaxed">
              Access your personalised client portal to track your NDIS journey, manage documents, and stay on top of your services — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {TRUST_POINTS.map(point => (
              <li key={point} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-harvest flex-shrink-0" />
                <span className="text-white/70 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs relative z-10">
          © {new Date().getFullYear()} SOL Business Consultant. ABN verified.
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-harvest flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">S</span>
          </div>
          <span className="font-display font-bold text-ink text-base">SOL Business</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-ink">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1.5">{subtitle}</p>}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {children}
          </div>

          {/* Footer link */}
          {footer && (
            <p className="text-center text-sm text-slate-500 mt-6">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}