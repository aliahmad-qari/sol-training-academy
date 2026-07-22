import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, TrendingUp, Play, ChevronRight, Target, Zap, Clock, CheckCircle, BarChart3, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProgressRing from "@/components/lms/ProgressRing";
import { base44 } from "@/api/base44Client";
import AIProgressReport from "@/components/lms/student/AIProgressReport";
import { quizAttemptPercentOrZero, quizScoreLabel } from "@/lib/quizScores";
import { findSubmissionForAssignment } from "@/components/lms/student/StudentAssessments";

const LEVEL_CONFIG = {
  level1: { bar: "bg-harvest",     pill: "bg-harvest/10 text-harvest",       label: "Level 1" },
  level2: { bar: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700",   label: "Level 2" },
  level3: { bar: "bg-amber-600",   pill: "bg-amber-50 text-amber-700",       label: "Level 3" },
};

export default function StudentOverview({ user, enrollments, courses, quizAttempts, onOpenCourse, setActiveTab }) {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (!enrollments.length) return;
    const courseIds = [...new Set(enrollments.map(e => String(e.course_id)))];
    const courseLevels = [...new Set(enrollments.map(e => e.course_level).filter(Boolean))];
    // Assignment deadlines are server-owned and start when the student opens
    // the assignment. The overview lists unsubmitted work without starting timers.
    Promise.all([
      base44.entities.Assignment.filter({ is_published: true }, "-created_date", 50).catch(() => []),
      user ? base44.entities.AssignmentSubmission.filter({ user_id: user.id }).catch(() => []) : Promise.resolve([]),
    ]).then(([all, subs]) => {
      const mine = all
        .filter(a =>
          (courseIds.includes(String(a.course_id)) || (a.course_level && courseLevels.includes(a.course_level))) &&
          !findSubmissionForAssignment(subs, a)
        )
        .map(a => ({ ...a, dueMs: null }))
        .slice(0, 5);
      setAssignments(mine);
    }).catch(() => setAssignments([]));
  }, [enrollments, user]);

  const completed   = enrollments.filter(e => e.status === "completed").length;
  const inProgress  = enrollments.filter(e => e.status === "active" && (e.progress_percent || 0) > 0).length;
  const certs       = enrollments.filter(e => e.certificate_issued).length;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length) : 0;
  const passedQuizzes = quizAttempts.filter(q => q.passed).length;
  const totalTopicsDone = enrollments.reduce((s, e) => s + (e.completed_topic_ids?.length || 0), 0);

  const stats = [
    { label: "Enrolled Courses",  value: enrollments.length, icon: BookOpen,   color: "text-harvest bg-harvest/10 border-harvest/20",     tab: "courses" },
    { label: "Completed",         value: completed,          icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100", tab: "courses" },
    { label: "Overall Progress",  value: `${avgProgress}%`,  icon: TrendingUp,  color: "text-harvest bg-harvest/10 border-harvest/20",     tab: "progress" },
    { label: "Certificates",      value: certs,              icon: Award,       color: "text-amber-600 bg-amber-50 border-amber-100",       tab: "certificates" },
    { label: "Quizzes Passed",    value: passedQuizzes,      icon: Target,      color: "text-emerald-600 bg-emerald-50 border-emerald-100", tab: "quizzes" },
    { label: "Lessons Completed", value: totalTopicsDone,    icon: Zap,         color: "text-harvest bg-harvest/10 border-harvest/20",     tab: "progress" },
  ];

  const continueCourses = enrollments
    .filter(e => e.status === "active" && (e.progress_percent || 0) > 0)
    .slice(0, 3);
  const notStarted = enrollments
    .filter(e => !e.progress_percent || e.progress_percent === 0)
    .slice(0, 2);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl overflow-hidden shadow-md"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d1f00 60%, #3d2800 100%)" }}>
        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-8">
          <div className="min-w-0 max-w-xl space-y-3">
            <p className="text-harvest/70 text-xs font-semibold uppercase tracking-widest">
              NDIS Training Academy
            </p>
            <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
              Welcome back, {user?.full_name?.split(" ")[0] || "Student"}! 👋
            </h2>
            <p className="max-w-full text-sm text-white/50 sm:max-w-md">
              {inProgress > 0
                ? `You have ${inProgress} course${inProgress > 1 ? "s" : ""} in progress. Keep up the great work!`
                : completed > 0
                ? `You've completed ${completed} course${completed > 1 ? "s" : ""}. Ready for the next level?`
                : "Start your NDIS Support Coordinator training journey today."}
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
              {inProgress > 0 ? (
                <Button
                  onClick={() => setActiveTab("courses")}
                  className="w-full gap-2 bg-harvest text-white shadow-lg shadow-harvest/30 hover:bg-harvest/90 sm:w-auto"
                >
                  <Play className="w-4 h-4" /> Continue Learning
                </Button>
              ) : (
                <Link to="/training-courses">
                  <Button className="w-full gap-2 bg-harvest text-white hover:bg-harvest/90 sm:w-auto">
                    <BookOpen className="w-4 h-4" /> Browse Courses
                  </Button>
                </Link>
              )}
              {certs > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("certificates")}
                  className="w-full gap-2 border-white/20 text-white hover:bg-white/10 sm:w-auto"
                >
                  <Award className="w-4 h-4" /> My Certificates
                </Button>
              )}
            </div>
          </div>
          {enrollments.length > 0 && (
            <div className="flex w-full flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5 lg:justify-self-end">
              <ProgressRing progress={avgProgress} size={80} />
              <div>
                <p className="font-display text-3xl font-bold leading-none text-white">{avgProgress}%</p>
                <p className="mt-1 text-xs text-white/40">Avg Progress</p>
                <p className="text-xs text-white/40">{completed}/{enrollments.length} courses done</p>
              </div>
            </div>
          )}
        </div>
        {/* Upcoming notice bar */}
        <div className="bg-harvest/20 border-t border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          <Clock className="w-3.5 h-3.5 text-harvest" />
          <p className="text-harvest/80 text-xs">
            <strong>Upcoming:</strong> New NDIS Practice Standards update — content reviewed June 2026
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {stats.map((s, i) => (
          <motion.button key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-xl border p-3 sm:p-4 flex flex-col gap-2 hover:shadow-md transition-all text-left ${s.color.split(" ").slice(2).join(" ")} hover:border-current`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color.split(" ").slice(0, 2).join(" ")}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-lg sm:text-xl text-[#0d2348] leading-none">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Course Progress Bars ───────────────────────────────── */}
      {enrollments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-harvest" />
              <h3 className="font-display font-semibold text-[#0d2348]">Course Progress</h3>
            </div>
            <button onClick={() => setActiveTab("courses")}
              className="text-xs text-harvest hover:underline flex items-center gap-1 self-start sm:self-auto">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {enrollments.map((enr, i) => {
              const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
              const pct = enr.progress_percent || 0;
              const isCompleted = enr.status === "completed";
              return (
                <motion.div key={enr.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.pill}`}>{cfg.label}</span>
                      <p className="text-sm font-medium text-ink truncate">{enr.course_title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isCompleted
                        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                        : <span className="text-sm font-bold text-ink">{pct}%</span>
                      }
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                      className={`h-3 rounded-full ${isCompleted ? "bg-emerald-500" : cfg.bar}`}
                    />
                  </div>
                  {!isCompleted && pct > 0 && (
                    <p className="text-[10px] text-slate_mist mt-0.5">{enr.completed_topic_ids?.length || 0} lessons completed</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI Progress Report ─────────────────────────────────── */}
      <AIProgressReport user={user} enrollments={enrollments} quizAttempts={quizAttempts} />

      {/* ── Upcoming Deadlines + Continue Learning ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Upcoming Assignment Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-harvest" />
            <h3 className="font-display font-semibold text-[#0d2348]">Upcoming Deadlines</h3>
          </div>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No upcoming deadlines</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map(a => {
                const hasDeadline = a.dueMs != null;
                const dueDate = hasDeadline ? new Date(a.dueMs) : null;
                const daysLeft = hasDeadline ? Math.ceil((a.dueMs - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                const isUrgent = hasDeadline && daysLeft <= 3;
                const isSoon = hasDeadline && daysLeft <= 7;
                return (
                  <div key={a.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isUrgent ? "bg-red-50 border-red-200" : isSoon ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isUrgent ? "bg-red-100" : isSoon ? "bg-amber-100" : "bg-slate-200"}`}>
                      {isUrgent ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className={`w-4 h-4 ${isSoon ? "text-amber-600" : "text-slate_mist"}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{a.title}</p>
                      <p className="text-xs text-slate_mist truncate">{a.course_title}</p>
                      <p className={`text-xs font-bold mt-0.5 ${isUrgent ? "text-red-600" : isSoon ? "text-amber-600" : "text-slate_mist"}`}>
                        {!hasDeadline
                          ? (a.duration_days > 0 ? `${a.duration_days}-day deadline (starts on open)` : "No deadline")
                          : daysLeft <= 0 ? "Due today!" : daysLeft === 1 ? "Due tomorrow!" : `Due in ${daysLeft} days`}
                        {dueDate && (
                          <span className="font-normal text-slate_mist ml-1">· {dueDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Continue learning */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="font-display font-semibold text-[#0d2348]">Continue Learning</h3>
            <button onClick={() => setActiveTab("courses")}
              className="text-xs text-harvest hover:underline flex items-center gap-1 self-start sm:self-auto">
              All courses <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {[...continueCourses, ...notStarted].length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 mb-3">No courses enrolled yet</p>
              <Link to="/training-courses">
                <Button size="sm" className="bg-harvest hover:bg-harvest/90 text-white">Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {[...continueCourses, ...notStarted].map(enr => {
                const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
                return (
                  <button key={enr.id} onClick={() => onOpenCourse(enr)}
                    className="w-full flex items-start sm:items-center gap-3 p-3 rounded-xl hover:bg-harvest/5 transition-all text-left group border border-transparent hover:border-harvest/20">
                    <div className={`w-2 h-8 rounded-full flex-shrink-0 ${cfg.bar}`} />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-ink truncate group-hover:text-harvest transition-colors">{enr.course_title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-1 rounded-full ${cfg.bar}`} style={{ width: `${enr.progress_percent || 0}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{enr.progress_percent || 0}%</span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-300 group-hover:text-harvest transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm lg:col-span-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="font-display font-semibold text-[#0d2348]">Quiz Activity</h3>
            <button onClick={() => setActiveTab("quizzes")}
              className="text-xs text-harvest hover:underline flex items-center gap-1 self-start sm:self-auto">
              All quizzes <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {quizAttempts.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No quiz attempts yet</p>
              <p className="text-xs text-slate-400 mt-1">Complete a lesson to unlock quizzes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizAttempts.slice(0, 4).map(attempt => {
                const pct = quizAttemptPercentOrZero(attempt);
                return (
                  <div key={attempt.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs
                      ${attempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {pct}%
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#0d2348]">Attempt #{attempt.attempt_number || 1}</p>
                      <p className="text-[10px] text-slate-400">{quizScoreLabel(attempt)} marks · {new Date(attempt.created_date).toLocaleDateString("en-AU")}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${attempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {attempt.passed ? "Passed" : "Retry"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

