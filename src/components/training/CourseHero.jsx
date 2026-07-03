import React from "react";
import { GraduationCap, Users, Award, Clock } from "lucide-react";

const STATS = [
  { icon: GraduationCap, value: "3 Levels", label: "Structured Learning" },
  { icon: Users, value: "100% Online", label: "Learn Anywhere" },
  { icon: Award, value: "Certificate", label: "Upon Completion" },
  { icon: Clock, value: "Self-Paced", label: "Lifetime Access" },
];

export default function CourseHero() {
  return (
    <section className="pt-32 pb-20 bg-ink text-white px-6">
      <div className="max-w-5xl mx-auto text-center">
        <span className="inline-block bg-harvest/20 text-harvest text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          Online LMS Training
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-5">
          NDIS Support Coordinator<br />
          <span className="text-harvest">Training Courses</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12">
          Three structured levels designed to take you from foundational knowledge to advanced practice. 
          Self-paced, online, and built specifically for Australian NDIS professionals.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Icon className="w-6 h-6 text-harvest mx-auto mb-2" />
              <div className="font-display font-bold text-white text-lg">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}