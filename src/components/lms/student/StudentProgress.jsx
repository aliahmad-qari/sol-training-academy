import React, { useState } from "react";
import { TrendingUp, CheckCircle, Clock, BookOpen, BarChart3, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProgressRing from "@/components/lms/ProgressRing";
import CPDHoursTracker from "@/components/lms/student/CPDHoursTracker";

const LEVEL_CONFIG = {
  level1: { bar: "bg-harvest",     text: "text-harvest",     chart: "#D97706", label: "Level 1 — Foundation",    pill: "bg-harvest/10 text-harvest border-harvest/30" },
  level2: { bar: "bg-emerald-500", text: "text-emerald-600", chart: "#10B981", label: "Level 2 — Professional",   pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  level3: { bar: "bg-amber-600",   text: "text-amber-600",   chart: "#D97706", label: "Level 3 — Advanced",       pill: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function StudentProgress({ enrollments, courses }) {
  const [tab, setTab] = useState("progress");
  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-[#0d2348] mb-2">No progress to show yet</h3>
        <p className="text-slate-500 text-sm">Enrol in a course and start learning to track your progress here.</p>
      </div>
    );
  }

  const totalDone   = enrollments.reduce((s, e) => s + (e.completed_topic_ids?.length || 0), 0);
  const overallAvg  = Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length);
  const completed   = enrollments.filter(e => e.status === "completed").length;

  const chartData = enrollments.map(enr => {
    const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
    return {
      name: enr.course_level?.replace("level", "L") || "—",
      Progress: enr.progress_percent || 0,
      fill: cfg.chart,
    };
  });

  return (
    <div className="space-y-5">
      {/* Tab toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[{ id: "progress", label: "Learning Progress" }, { id: "cpd", label: "CPD Hours Tracker" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white shadow text-ink" : "text-slate-500 hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cpd" && <CPDHoursTracker enrollments={enrollments} courses={courses} />}
      {tab === "progress" && <>

      {/* Summary KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Overall Progress",  value: `${overallAvg}%`, icon: TrendingUp,  color: "text-harvest bg-harvest/10 border-harvest/20" },
          { label: "Lessons Completed", value: totalDone,         icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Courses Finished",  value: completed,         icon: BookOpen,    color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${s.color.split(" ").slice(2).join(" ")}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color.split(" ").slice(0, 2).join(" ")}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-[#0d2348]">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-display font-semibold text-[#0d2348] mb-4">Progress by Course Level</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => [`${v}%`, "Progress"]} />
              <Bar dataKey="Progress" radius={[6, 6, 0, 0]}
                cell={(entry) => <rect fill={entry.fill} />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-course breakdown */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-[#0d2348]">Course Breakdown</h3>
        {enrollments.map(enr => {
          const cfg       = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
          const topicsDone = enr.completed_topic_ids?.length || 0;
          return (
            <div key={enr.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.pill}`}>{cfg.label}</span>
                    {enr.status === "completed" && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-semibold text-[#0d2348] mb-3">{enr.course_title}</h4>
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{topicsDone} lessons done</span>
                    </div>
                    {enr.completed_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Completed {new Date(enr.completed_date).toLocaleDateString("en-AU")}</span>
                      </div>
                    )}
                    {!enr.completed_date && enr.updated_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last active {new Date(enr.updated_date).toLocaleDateString("en-AU")}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Course Progress</span>
                      <span className={`font-bold ${cfg.text}`}>{enr.progress_percent || 0}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-2.5 rounded-full transition-all duration-700 ${cfg.bar}`}
                        style={{ width: `${enr.progress_percent || 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ProgressRing progress={enr.progress_percent || 0} size={70} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>}
    </div>
  );
}