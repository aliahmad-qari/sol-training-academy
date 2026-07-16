import React from "react";
import { Trophy } from "lucide-react";

const BADGES = [
  {
    id: "first_lesson", icon: "🎬", title: "First Lesson", desc: "Completed your very first lesson",
    color: "from-blue-400 to-blue-600", earned: true,
  },
  {
    id: "quiz_master", icon: "🏆", title: "Quiz Master", desc: "Passed 5 quizzes with 80%+ score",
    color: "from-amber-400 to-amber-600", earned: false,
  },
  {
    id: "level1", icon: "🥉", title: "Level 1 Graduate", desc: "Completed Level 1 — Foundation",
    color: "from-orange-400 to-orange-600", earned: false,
  },
  {
    id: "level2", icon: "🥈", title: "Level 2 Professional", desc: "Completed Level 2 — Professional",
    color: "from-slate-400 to-slate-600", earned: false,
  },
  {
    id: "level3", icon: "🥇", title: "Level 3 Specialist", desc: "Completed Level 3 — Advanced",
    color: "from-yellow-400 to-yellow-600", earned: false,
  },
  {
    id: "streak_7", icon: "🔥", title: "7-Day Streak", desc: "Logged in and learned for 7 days straight",
    color: "from-red-400 to-orange-500", earned: false,
  },
  {
    id: "fast_learner", icon: "⚡", title: "Fast Learner", desc: "Completed 10 lessons in a single week",
    color: "from-violet-400 to-violet-600", earned: false,
  },
  {
    id: "ndis_expert", icon: "🎓", title: "NDIS Expert", desc: "Completed all 3 certification levels",
    color: "from-emerald-400 to-emerald-600", earned: false,
  },
];

export default function AchievementBadges({ enrollments = [], quizAttempts = [] }) {
  const earned = BADGES.filter(b => b.earned);
  const locked = BADGES.filter(b => !b.earned);

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-harvest" />
          <h3 className="font-display font-semibold text-ink">Achievement Badges</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">{earned.length}/{BADGES.length} earned</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-harvest to-amber-400 rounded-full transition-all"
            style={{ width: `${(earned.length / BADGES.length) * 100}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{Math.round((earned.length / BADGES.length) * 100)}% of badges unlocked</p>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Earned Badges</p>
          <div className="flex flex-wrap gap-3">
            {earned.map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-1.5 cursor-default group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {badge.icon}
                </div>
                <p className="text-[9px] font-bold text-ink text-center max-w-[60px] leading-tight">{badge.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Locked Badges</p>
        <div className="flex flex-wrap gap-3">
          {locked.map(badge => (
            <div key={badge.id} className="flex flex-col items-center gap-1.5 cursor-default group" title={badge.desc}>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center text-2xl opacity-30 group-hover:opacity-50 transition-opacity">
                {badge.icon}
              </div>
              <p className="text-[9px] text-slate-400 text-center max-w-[60px] leading-tight">{badge.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}