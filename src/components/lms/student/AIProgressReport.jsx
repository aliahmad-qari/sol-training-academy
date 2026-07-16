import React, { useState } from "react";
import { runStudentTool } from "@/api/aiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle, Target, Star
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AIProgressReport({ user, enrollments = [], quizAttempts = [] }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const generate = async () => {
    setLoading(true);
    setReport(null);

    try {
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length) : 0;
      const completed = enrollments.filter(e => e.status === "completed").length;
      const passRate = quizAttempts.length > 0
        ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100) : null;
      const avgScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / quizAttempts.length) : null;
      const recentAttempts = [...quizAttempts]
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5)
        .map(a => ({ score: a.score_percent, passed: a.passed, topic: a.topic_title || "Quiz" }));

      const courseBreakdown = enrollments.map(e => ({
        title: e.course_title,
        progress: `${e.progress_percent || 0}%`,
        status: e.status,
        lessonsCompleted: e.completed_topic_ids?.length || 0,
      }));

      // Backend owns the prompt + JSON schema (STUDENT_TOOLS.progress_report);
      // we only send precomputed, non-sensitive aggregates. The returned object
      // has exactly: greeting, summary, strengths[], improvements[], next_step,
      // encouragement — matching the fields rendered below.
      const res = await runStudentTool("progress_report", {
        studentName: user?.full_name || "Student",
        enrolledCount: enrollments.length,
        completedCount: completed,
        avgProgress,
        quizAttempts: quizAttempts.length,
        passRate,
        avgScore,
        recentAttempts,
        courseBreakdown,
      });

      setReport(res);
      setExpanded(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't generate your report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-ink">AI Progress Report</h3>
            <p className="text-[10px] text-slate_mist">Personalised summary based on your activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {report && (
            <button onClick={() => setExpanded(e => !e)} className="text-slate_mist hover:text-ink transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <Button onClick={generate} disabled={loading} size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 h-8 text-xs">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
              : report
              ? <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
              : <><Sparkles className="w-3.5 h-3.5" /> Generate Report</>
            }
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!report && !loading && (
        <div className="px-4 sm:px-5 py-8 text-center">
          <Sparkles className="w-8 h-8 text-purple-200 mx-auto mb-3" />
          <p className="text-sm text-slate_mist mb-1">Get your personalised AI progress report</p>
          <p className="text-xs text-slate_mist/70">AI will analyse your quiz scores and course activity to give you tailored feedback.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 sm:px-5 py-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate_mist">Analysing your learning journey…</p>
        </div>
      )}

      {/* Report */}
      <AnimatePresence>
        {report && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 py-5 space-y-4">
              {/* Greeting + Summary */}
              <div>
                <p className="font-display font-semibold text-ink mb-1">{report.greeting}</p>
                <p className="text-sm text-slate_mist leading-relaxed">{report.summary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Strengths */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Your Strengths</p>
                  </div>
                  <ul className="space-y-2">
                    {(report.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                        <Star className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas to improve */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Areas to Improve</p>
                  </div>
                  <ul className="space-y-2">
                    {(report.improvements || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-0.5">Your Next Step This Week</p>
                  <p className="text-sm text-purple-800">{report.next_step}</p>
                </div>
              </div>

              {/* Encouragement */}
              <div className="border-t border-border/30 pt-3">
                <p className="text-sm text-slate_mist italic text-center">{report.encouragement}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}