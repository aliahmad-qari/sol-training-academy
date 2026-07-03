import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle, Target, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIProgressReport({ user, enrollments, quizAttempts }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const generate = async () => {
    setLoading(true);
    setReport(null);

    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length) : 0;
    const completed = enrollments.filter(e => e.status === "completed").length;
    const passRate = quizAttempts.length > 0
      ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100) : null;
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / quizAttempts.length) : null;
    const recentAttempts = quizAttempts
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5)
      .map(a => ({ score: a.score_percent, passed: a.passed, topic: a.topic_title || "Quiz" }));

    const courseBreakdown = enrollments.map(e => ({
      title: e.course_title,
      progress: `${e.progress_percent || 0}%`,
      status: e.status,
      lessonsCompleted: e.completed_topic_ids?.length || 0,
    }));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a supportive, encouraging learning coach at SOL Training Academy. Write a warm, personalised progress report for this student.\n\nSTUDENT NAME: ${user?.full_name || "Student"}\n\nLEARNING DATA:\n- Enrolled courses: ${enrollments.length}\n- Completed courses: ${completed}\n- Average progress: ${avgProgress}%\n- Quiz attempts: ${quizAttempts.length}\n- Quiz pass rate: ${passRate !== null ? passRate + "%" : "No attempts yet"}\n- Average quiz score: ${avgScore !== null ? avgScore + "%" : "No attempts yet"}\n- Recent quiz results: ${JSON.stringify(recentAttempts)}\n- Course breakdown: ${JSON.stringify(courseBreakdown)}\n\nWrite a JSON response with exactly these keys:\n- greeting: A warm 1-sentence personalised greeting using their first name\n- summary: 2-3 sentences summarising their overall progress in plain English\n- strengths: Array of exactly 2-3 specific strengths based on their data (short bullet points)\n- improvements: Array of exactly 2-3 specific, actionable areas to improve (short bullet points)\n- next_step: One clear, motivating next action they should take this week\n- encouragement: One short, genuine motivational sentence to end on`,
      response_json_schema: {
        type: "object",
        properties: {
          greeting:      { type: "string" },
          summary:       { type: "string" },
          strengths:     { type: "array", items: { type: "string" } },
          improvements:  { type: "array", items: { type: "string" } },
          next_step:     { type: "string" },
          encouragement: { type: "string" },
        }
      }
    });

    setReport(res);
    setLoading(false);
    setExpanded(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink">AI Progress Report</h3>
            <p className="text-[10px] text-slate_mist">Personalised summary based on your activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="px-5 py-8 text-center">
          <Sparkles className="w-8 h-8 text-purple-200 mx-auto mb-3" />
          <p className="text-sm text-slate_mist mb-1">Get your personalised AI progress report</p>
          <p className="text-xs text-slate_mist/70">AI will analyse your quiz scores and course activity to give you tailored feedback.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-5 py-8 text-center">
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
            <div className="px-5 py-5 space-y-4">
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