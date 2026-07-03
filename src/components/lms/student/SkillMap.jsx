import React from "react";
import { CheckCircle, Lock, Star, Zap, Shield, BookOpen, Award, TrendingUp, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";

const SKILL_TREE = [
  {
    category: "Foundation",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200",
    skills: [
      { name: "NDIS Overview", icon: BookOpen, level: 1 },
      { name: "Support Coordination Basics", icon: Users, level: 1 },
      { name: "Participant Plans", icon: Shield, level: 1 },
    ]
  },
  {
    category: "Professional",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    skills: [
      { name: "Complex Support Needs", icon: Heart, level: 2 },
      { name: "Service Provider Management", icon: Zap, level: 2 },
      { name: "Risk Management", icon: Shield, level: 2 },
    ]
  },
  {
    category: "Advanced",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 border-purple-200",
    skills: [
      { name: "NDIS Practice Standards", icon: Star, level: 3 },
      { name: "Quality & Safeguarding", icon: Award, level: 3 },
      { name: "Leadership in Support", icon: TrendingUp, level: 3 },
    ]
  },
];

export default function SkillMap({ enrollments }) {
  const completedLevels = new Set(
    enrollments.filter(e => e.status === "completed").map(e => e.course_level)
  );
  const activeLevels = new Set(
    enrollments.filter(e => e.status === "active").map(e => e.course_level)
  );

  const getSkillStatus = (level) => {
    const levelKey = `level${level}`;
    if (completedLevels.has(levelKey)) return "completed";
    if (activeLevels.has(levelKey)) return "active";
    return "locked";
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <Star className="w-5 h-5 text-purple-600" />
          <h2 className="font-display font-bold text-ink">Skill Map</h2>
        </div>
        <p className="text-sm text-slate_mist">Your journey through NDIS Support Coordination skills.</p>
      </div>

      <div className="space-y-6">
        {SKILL_TREE.map((tier, ti) => {
          const status = getSkillStatus(ti + 1);
          const isCompleted = status === "completed";
          const isActive = status === "active";
          const isLocked = status === "locked";
          return (
            <div key={tier.category}>
              {/* Connector */}
              {ti > 0 && (
                <div className="flex justify-center mb-4">
                  <div className={`w-0.5 h-8 rounded-full ${isLocked ? "bg-slate-200" : "bg-emerald-400"}`} />
                </div>
              )}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ti * 0.1 }}
                className={`rounded-2xl border-2 p-5 ${isLocked ? "bg-slate-50 border-slate-200 opacity-60" : tier.bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <span className="text-white font-bold">{ti + 1}</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-ink">{tier.category}</p>
                    <p className="text-xs text-slate_mist">Level {ti + 1} Course Skills</p>
                  </div>
                  <div className="ml-auto">
                    {isCompleted && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>}
                    {isActive && <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">In Progress</span>}
                    {isLocked && <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {tier.skills.map((skill, si) => {
                    const Icon = skill.icon;
                    return (
                      <div key={si} className={`rounded-xl p-3 flex items-center gap-2.5 border ${
                        isCompleted ? "bg-white border-emerald-200" : isActive ? "bg-white border-blue-200" : "bg-white/50 border-slate-200"
                      }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? "bg-emerald-100" : isActive ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          {isLocked ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Icon className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-xs font-medium text-ink">{skill.name}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}