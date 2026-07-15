import React, { useState, useEffect } from "react";
import { Flame, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  { id: "first_login", label: "First Login", icon: Star, color: "text-yellow-500 bg-yellow-50", desc: "Welcome aboard!", req: 1 },
  { id: "streak_3", label: "3-Day Streak", icon: Flame, color: "text-orange-500 bg-orange-50", desc: "3 days in a row!", req: 3 },
  { id: "streak_7", label: "Week Warrior", icon: Zap, color: "text-purple-500 bg-purple-50", desc: "7-day streak!", req: 7 },
  { id: "streak_30", label: "Monthly Master", icon: Trophy, color: "text-amber-500 bg-amber-50", desc: "30-day streak!", req: 30 },
];

export default function LearningStreak({ user, enrollments, quizAttempts }) {
  const [streakDays, setStreakDays] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weekActivity, setWeekActivity] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Calculate streak based on quiz attempts and enrollment updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set();
    quizAttempts.forEach(a => {
      const d = new Date(a.created_date);
      d.setHours(0, 0, 0, 0);
      activityDates.add(d.getTime());
    });
    enrollments.forEach(e => {
      const d = new Date(e.updated_date || e.created_date);
      d.setHours(0, 0, 0, 0);
      activityDates.add(d.getTime());
    });

    // Current streak
    let streak = 0;
    let check = new Date(today);
    while (activityDates.has(check.getTime())) {
      streak++;
      check.setDate(check.getDate() - 1);
    }
    setStreakDays(streak);

    // Week activity (last 7 days)
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      week.push({ date: d, active: activityDates.has(d.getTime()), label: d.toLocaleDateString("en-AU", { weekday: "short" }).charAt(0) });
    }
    setWeekActivity(week);
    setLongestStreak(Math.max(streak, longestStreak));
  }, [user, quizAttempts, enrollments]);

  const earnedBadges = BADGES.filter(b => streakDays >= b.req);
  const nextBadge = BADGES.find(b => streakDays < b.req);
  const nextBadgeProgress = nextBadge ? (streakDays / nextBadge.req) * 100 : 100;

  return (
    <div className="space-y-5">
      {/* Streak Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)" }} />
        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="w-8 h-8 text-yellow-300" />
              <span className="font-display font-black text-5xl">{streakDays}</span>
            </div>
            <p className="text-white/80 text-sm font-medium">Day Streak</p>
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-xl mb-0.5">Keep it up!</p>
            <p className="text-white/70 text-sm">Log in and complete activities daily to build your streak.</p>
            {nextBadge && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Next badge: {nextBadge.label}</span>
                  <span>{streakDays}/{nextBadge.req} days</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-2 bg-yellow-300 rounded-full transition-all" style={{ width: `${Math.min(nextBadgeProgress, 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
        <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-harvest" /> This Week</h3>
        <div className="flex justify-between gap-2">
          {weekActivity.map((day, i) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-[10px] text-slate_mist font-medium">{day.label}</p>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  day.active ? "bg-harvest border-harvest" : isToday ? "border-harvest/50 bg-harvest/10" : "border-border/40 bg-slate-50"
                }`}>
                  {day.active && <Flame className="w-4 h-4 text-white" />}
                </div>
                {isToday && <div className="w-1 h-1 bg-harvest rounded-full" />}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
        <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Streak Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadges.find(b => b.id === badge.id);
            const Icon = badge.icon;
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl p-4 text-center border transition-all ${earned ? badge.color + " border-transparent shadow-sm" : "bg-slate-50 border-border/40 opacity-50"}`}>
                <Icon className={`w-7 h-7 mx-auto mb-2 ${earned ? "" : "text-slate-400"}`} />
                <p className="text-xs font-bold text-ink">{badge.label}</p>
                <p className="text-[10px] text-slate_mist mt-0.5">{badge.desc}</p>
                {!earned && <p className="text-[10px] text-slate_mist mt-1">Requires {badge.req} day streak</p>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}