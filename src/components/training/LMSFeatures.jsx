import React from "react";
import { Monitor, BarChart2, Award, Shield, Smartphone, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Monitor,
    title: "Simple & Powerful Platform",
    desc: "An intuitive, user-friendly LMS that makes navigation and learning a breeze for all skill levels.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Access",
    desc: "Learn on any device, anywhere, anytime. Full mobile support so your training never stops.",
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    desc: "Real-time reporting and analytics so you always know where you are in your learning journey.",
  },
  {
    icon: Award,
    title: "Certificates of Completion",
    desc: "Earn recognised certificates upon completing each level to demonstrate your expertise.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security ensures your data, progress, and certifications are always protected.",
  },
  {
    icon: Zap,
    title: "Gamification & Engagement",
    desc: "Badges, points, and leaderboards keep you motivated and engaged throughout your training.",
  },
];

export default function LMSFeatures() {
  return (
    <section className="py-20 px-6 bg-muted/40 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-harvest mb-3 block">Our Platform</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3">
            Learning Management System
          </h2>
          <p className="text-slate_mist max-w-xl mx-auto">
            Our renowned LMS is a simple, powerful, and easy-to-use platform where all your courses and resources are stored and accessed.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-harvest/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-harvest" />
              </div>
              <h3 className="font-display font-bold text-sm text-ink mb-2">{title}</h3>
              <p className="text-xs text-slate_mist leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}