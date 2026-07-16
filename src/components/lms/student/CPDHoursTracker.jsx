import React from "react";
import { Clock, CheckCircle, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Each topic averages a certain CPD hours contribution (based on video_duration_mins if set, else 0.5h per lesson)
const MINS_TO_HOURS = (mins) => mins ? parseFloat((mins / 60).toFixed(1)) : 0.5;

export default function CPDHoursTracker({ enrollments, courses }) {
  // Calculate CPD hours from completed topics across all enrollments
  // We use a simple model: each completed lesson = 0.5 CPD hours (or actual video duration)
  // Total possible = total lessons across all enrolled courses * 0.5

  const totalCompletedLessons = enrollments.reduce((s, e) => s + (e.completed_topic_ids?.length || 0), 0);
  const totalEnrolledLessons  = enrollments.reduce((s, e) => {
    const course = courses.find(c => c.id === e.course_id);
    return s + (course?.total_topics || 0);
  }, 0);

  // Approximate CPD: 0.5h per completed lesson
  const completedCPD = parseFloat((totalCompletedLessons * 0.5).toFixed(1));
  const totalCPD     = parseFloat((totalEnrolledLessons * 0.5).toFixed(1)) || completedCPD + 5;
  const remainingCPD = parseFloat(Math.max(0, totalCPD - completedCPD).toFixed(1));
  const pct          = totalCPD > 0 ? Math.round((completedCPD / totalCPD) * 100) : 0;

  const perCourse = enrollments.map(enr => {
    const course   = courses.find(c => c.id === enr.course_id);
    const total    = course?.total_topics || 0;
    const done     = enr.completed_topic_ids?.length || 0;
    const cpdDone  = parseFloat((done * 0.5).toFixed(1));
    const cpdTotal = parseFloat((total * 0.5).toFixed(1)) || 1;
    const p        = Math.round((cpdDone / cpdTotal) * 100);
    return { enr, cpdDone, cpdTotal, p };
  });

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Completed CPD Hours", value: `${completedCPD}h`, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Total Learning Hours", value: `${totalCPD}h`,    icon: BookOpen,    color: "text-harvest bg-harvest/10 border-harvest/20" },
          { label: "Remaining Hours",      value: `${remainingCPD}h`,icon: Clock,       color: "text-blue-600 bg-blue-50 border-blue-100" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-center gap-4 shadow-sm ${s.color.split(" ").slice(2).join(" ")}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color.split(" ").slice(0, 2).join(" ")}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-xl sm:text-2xl text-[#0d2348]">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-harvest" />
            <h3 className="font-display font-semibold text-[#0d2348]">Overall CPD Progress</h3>
          </div>
          <span className="font-bold text-harvest text-sm">{pct}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-4 bg-harvest rounded-full"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">{completedCPD}h of {totalCPD}h completed · {remainingCPD}h remaining</p>
      </div>

      {/* Per-course breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-display font-semibold text-[#0d2348] mb-4">CPD Hours by Course</h3>
        {perCourse.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No enrolled courses.</p>
        ) : (
          <div className="space-y-4">
            {perCourse.map(({ enr, cpdDone, cpdTotal, p }, i) => (
              <motion.div key={enr.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-[#0d2348] truncate min-w-0">{enr.course_title}</p>
                  <span className="text-xs font-bold text-harvest ml-2 flex-shrink-0 whitespace-nowrap">{cpdDone}h / {cpdTotal}h</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07, ease: "easeOut" }}
                    className={`h-2.5 rounded-full ${enr.status === "completed" ? "bg-emerald-500" : "bg-harvest"}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{p}% complete · {enr.completed_topic_ids?.length || 0} lessons done</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">About CPD Hours</p>
          <p className="text-xs text-blue-600 mt-0.5">
            CPD (Continuing Professional Development) hours are calculated at 0.5 hours per completed lesson.
            These hours contribute to your NDIS Support Coordinator professional development requirements under Australian standards.
          </p>
        </div>
      </div>
    </div>
  );
}