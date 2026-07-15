import React from "react";
import { User, Mail, Phone, Award, BookOpen, Star, Globe, CheckCircle } from "lucide-react";

const TRAINERS = [
  {
    name: "SOL Training Team",
    title: "Lead NDIS Trainer & Consultant",
    initials: "ST",
    avatarColor: "bg-harvest",
    experience: "10+ Years",
    qualifications: [
      "Certificate IV in Training & Assessment (TAE40116)",
      "Diploma in Community Services",
      "NDIS Registered Provider",
      "Australian Institute of Disability Practice — Member",
    ],
    expertise: [
      "NDIS Support Coordination",
      "Disability Practice Standards",
      "NDIS Registration & Compliance",
      "Support Coordinator Training",
      "Allied Health Integration",
      "Behaviour Support",
    ],
    bio: "SOL Business Consultant delivers professional NDIS training to support coordinators, disability workers, and allied health professionals across Australia. Our training team brings over a decade of hands-on NDIS experience, combining real-world case knowledge with up-to-date practice standards. Every course is designed to be practical, compliant, and relevant to the Australian NDIS landscape.",
    email: "info@solbusinessconsultant.com.au",
    phone: "+61 460 003 494",
    website: "www.solbusinessconsultant.com.au",
    courses: ["Level 1 — Foundation", "Level 2 — Professional", "Level 3 — Advanced"],
    stats: [
      { label: "Students Trained", value: "500+" },
      { label: "Course Videos", value: "237" },
      { label: "Years Experience", value: "10+" },
      { label: "Satisfaction Rate", value: "98%" },
    ],
  },
];

export default function TrainerInformation() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-harvest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Trainer Information</h2>
            <p className="text-white/50 text-sm">Meet your NDIS training professionals</p>
          </div>
        </div>
      </div>

      {TRAINERS.map((trainer, i) => (
        <div key={i} className="space-y-4">
          {/* Trainer card */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800 relative">
              <div className="absolute bottom-0 left-5 translate-y-1/2">
                <div className={`w-16 h-16 rounded-2xl ${trainer.avatarColor} flex items-center justify-center border-4 border-white shadow-lg`}>
                  <span className="text-white font-display font-bold text-xl">{trainer.initials}</span>
                </div>
              </div>
            </div>

            <div className="pt-12 pb-5 px-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-ink text-xl">{trainer.name}</h3>
                  <p className="text-slate-500 text-sm">{trainer.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold">4.9</span>
                    <span className="text-xs text-amber-600">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">NDIS Verified</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {trainer.stats.map((s, si) => (
                  <div key={si} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="font-display font-bold text-ink text-lg">{s.value}</p>
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-600 leading-relaxed mb-5">{trainer.bio}</p>

              {/* Contact */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: "Email", value: trainer.email, href: `mailto:${trainer.email}` },
                  { icon: Phone, label: "Phone", value: trainer.phone, href: `tel:${trainer.phone.replace(/\s/g, "")}` },
                  { icon: Globe, label: "Website", value: trainer.website, href: `https://${trainer.website}`, external: true },
                ].map(c => (
                  <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-slate-50 hover:bg-harvest/5 border border-slate-100 hover:border-harvest/30 rounded-xl p-3.5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-4 h-4 text-harvest" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{c.label}</p>
                      <p className="text-xs font-medium text-ink truncate group-hover:text-harvest transition-colors">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Qualifications */}
            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-harvest" />
                <h4 className="font-display font-semibold text-ink">Qualifications</h4>
              </div>
              <div className="space-y-2.5">
                {trainer.qualifications.map((q, qi) => (
                  <div key={qi} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-harvest" />
                <h4 className="font-display font-semibold text-ink">Training Expertise</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {trainer.expertise.map((e, ei) => (
                  <span key={ei} className="text-xs bg-harvest/10 text-harvest border border-harvest/20 px-2.5 py-1 rounded-full font-medium">{e}</span>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Courses Delivered</p>
                <div className="space-y-1.5">
                  {trainer.courses.map((c, ci) => (
                    <div key={ci} className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-harvest flex-shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}