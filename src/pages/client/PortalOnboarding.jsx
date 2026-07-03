import React from "react";
import { Link } from "react-router-dom";
import { Heart, Briefcase, ArrowRight, Users } from "lucide-react";

const OPTIONS = [
  {
    href: "/client-portal/client-intake",
    icon: Heart,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-400",
    badge: "NDIS Participant",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "I'm an NDIS Participant",
    subtitle: "Register as a client seeking NDIS supports and services.",
    bullets: [
      "Support coordination & plan management",
      "Connect with disability services",
      "Track your NDIS plan & goals",
    ],
  },
  {
    href: "/client-portal/staff-intake",
    icon: Briefcase,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-400",
    badge: "Worker / Staff",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    title: "I'm Applying to Join the Team",
    subtitle: "Apply as a support worker, coordinator, or allied health professional.",
    bullets: [
      "Support worker & coordinator roles",
      "Allied health professionals",
      "Compliance check & onboarding",
    ],
  },
];

export default function PortalOnboarding() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">New Enquiry</h1>
        <p className="text-slate-500 text-sm">
          Select the intake type that applies to you. Each form is tailored to collect the right information.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.href}
              to={opt.href}
              className={`group block border-2 border-slate-200 ${opt.borderHover} rounded-2xl p-6 transition-all hover:shadow-md bg-white`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${opt.badgeBg}`}>{opt.badge}</span>
              </div>

              <h2 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-harvest transition-colors">
                {opt.title}
              </h2>
              <p className="text-slate-500 text-sm mb-4">{opt.subtitle}</p>

              <ul className="space-y-1.5 mb-5">
                {opt.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-sm font-semibold text-harvest group-hover:gap-3 transition-all">
                Start Intake <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <Users className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Not sure which to choose? <Link to="/client-portal/support" className="text-harvest font-semibold hover:underline">Contact our team</Link> and we'll guide you through the right process.
        </p>
      </div>
    </div>
  );
}