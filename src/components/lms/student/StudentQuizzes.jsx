import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle, Target, TrendingUp, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function StudentQuizzes({ quizAttempts, enrollments, courses }) {
  const [filter, setFilter] = useState("all");
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (enrollments.length === 0) { setLoadingQuizzes(false); return; }
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];
      // Fetch all quiz topics for enrolled courses
      const allQuizzes = [];
      for (const cid of courseIds) {
        const topics = await base44.entities.CourseTopic.filter({ course_id: cid, type: "quiz" }, "sort_order");
        allQuizzes.push(...topics);
      }
      setAvailableQuizzes(allQuizzes);
      setLoadingQuizzes(false);
    };
    fetchQuizzes();
  }, [enrollments]);

  if (quizAttempts.length === 0) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-[#0d2348] mb-2">No quiz attempts yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Open a course and complete lessons — quizzes appear inside the course player for each module.
          </p>
        </div>
        {!loadingQuizzes && availableQuizzes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-display font-semibold text-[#0d2348] mb-3">Available Quizzes in Your Courses ({availableQuizzes.length})</h3>
            <div className="space-y-2">
              {availableQuizzes.map(q => {
                const course = courses.find(c => c.id === q.course_id);
                return (
                  <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0d2348]">{q.title}</p>
                      <p className="text-xs text-slate-400">{course?.title} · {q.quiz_questions?.length || 0} questions</p>
                    </div>
                    <span className="text-xs text-slate_mist bg-slate-200 px-2 py-0.5 rounded-full">Open in course</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const passed   = quizAttempts.filter(q => q.passed).length;
  const failed   = quizAttempts.length - passed;
  const passRate = Math.round((passed / quizAttempts.length) * 100);
  const avgScore = Math.round(
    quizAttempts.reduce((s, q) => s + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0) / quizAttempts.length
  );

  const filtered = quizAttempts.filter(q => {
    if (filter === "passed") return q.passed;
    if (filter === "failed") return !q.passed;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d2348] to-[#1a3a6e] rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Quizzes & Assessments</h2>
            <p className="text-white/50 text-sm">{quizAttempts.length} total attempts recorded</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Attempts", value: quizAttempts.length, icon: HelpCircle },
            { label: "Passed",         value: passed,              icon: CheckCircle },
            { label: "Pass Rate",      value: `${passRate}%`,      icon: Target },
            { label: "Avg Score",      value: `${avgScore}%`,      icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-white/8 border border-white/10 rounded-xl p-3 text-center">
              <p className="font-display font-bold text-xl text-white">{s.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit shadow-sm">
        {["all", "passed", "failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-[#0d2348]"}`}>
            {f === "all" ? `All (${quizAttempts.length})` : f === "passed" ? `Passed (${passed})` : `Need Retry (${failed})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Date", "Attempt", "Score", "Questions", "Result", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(attempt => {
                const pct = attempt.total_questions > 0
                  ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;
                return (
                  <tr key={attempt.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {attempt.created_date ? new Date(attempt.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-[#0d2348] bg-slate-100 px-2 py-0.5 rounded-full">
                        #{attempt.attempt_number || 1}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full transition-all ${attempt.passed ? "bg-emerald-500" : "bg-rose-400"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#0d2348]">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      {attempt.score}/{attempt.total_questions} correct
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border
                        ${attempt.passed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                        {attempt.passed
                          ? <><CheckCircle className="w-3 h-3" /> Passed</>
                          : <><XCircle className="w-3 h-3" /> Failed</>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {!attempt.passed && (
                        <Button size="sm" variant="outline"
                          className="text-xs gap-1 h-7 border-blue-200 text-blue-600 hover:bg-blue-50">
                          <RotateCcw className="w-3 h-3" /> Retake
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">No {filter} attempts to show.</div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> You can retake any quiz unlimited times. A passing score is typically 75% or above.
          Review the lesson content before retrying to improve your score.
        </p>
      </div>

      {/* Available quizzes in enrolled courses */}
      {!loadingQuizzes && availableQuizzes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-display font-semibold text-[#0d2348] mb-3">All Quizzes in Your Courses ({availableQuizzes.length})</h3>
          <div className="space-y-2">
            {availableQuizzes.map(q => {
              const course = courses.find(c => c.id === q.course_id);
              const attempts = quizAttempts.filter(a => a.topic_id === q.id);
              const bestAttempt = attempts.find(a => a.passed) || attempts[0];
              return (
                <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0d2348]">{q.title}</p>
                    <p className="text-xs text-slate-400">{course?.title} · {q.quiz_questions?.length || 0} questions</p>
                  </div>
                  {bestAttempt ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bestAttempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {bestAttempt.passed ? "✓ Passed" : "Retry"}
                    </span>
                  ) : (
                    <span className="text-xs text-slate_mist bg-slate-200 px-2 py-0.5 rounded-full">Not attempted</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}