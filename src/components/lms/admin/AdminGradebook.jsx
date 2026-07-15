import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Download, Search, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_CONFIG = {
  graded:             { color: "bg-emerald-100 text-emerald-700", label: "Graded" },
  submitted:          { color: "bg-amber-100 text-amber-700",    label: "Submitted" },
  under_review:       { color: "bg-blue-100 text-blue-700",      label: "Under Review" },
  resubmit_requested: { color: "bg-red-100 text-red-700",        label: "Resubmit" },
};

export default function AdminGradebook({ courses }) {
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("assignments");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.AssignmentSubmission.list("-created_date", 300),
      base44.entities.QuizAttempt.list("-created_date", 300),
      base44.entities.Assignment.list("sort_order"),
    ]).then(([subs, attempts, asgns]) => {
      setSubmissions(subs);
      setQuizAttempts(attempts);
      setAssignments(asgns);
      setLoading(false);
    });
  }, []);

  const filteredSubs = submissions.filter(s => {
    const matchCourse = courseFilter === "all" || s.course_id === courseFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchSearch = !search || s.user_name?.toLowerCase().includes(search.toLowerCase()) || s.assignment_title?.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchStatus && matchSearch;
  });

  const filteredQuizzes = quizAttempts.filter(a => {
    const matchCourse = courseFilter === "all" || a.course_id === courseFilter;
    const matchSearch = !search || a.user_id?.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchSearch;
  });

  const avgMark = submissions.filter(s => s.marks_awarded != null).length > 0
    ? Math.round(submissions.filter(s => s.marks_awarded != null).reduce((sum, s) => sum + (s.marks_awarded / s.max_marks) * 100, 0) / submissions.filter(s => s.marks_awarded != null).length)
    : 0;

  const passRate = submissions.filter(s => s.status === "graded").length > 0
    ? Math.round((submissions.filter(s => s.passed).length / submissions.filter(s => s.status === "graded").length) * 100)
    : 0;

  const exportCSV = () => {
    const rows = filteredSubs.map(s => [
      s.user_name || "", s.user_email || "", s.course_title || "", s.assignment_title || "",
      s.status || "", s.marks_awarded ?? "", s.max_marks ?? "", s.passed ? "Pass" : "Fail",
      s.feedback || "", s.created_date ? new Date(s.created_date).toLocaleDateString("en-AU") : "",
    ]);
    const csv = [
      ["Student Name", "Email", "Course", "Assignment", "Status", "Marks", "Max Marks", "Result", "Feedback", "Submitted"],
      ...rows
    ].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "gradebook.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Gradebook exported.");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Gradebook</h2>
          <p className="text-sm text-slate-500">All student assignment marks and quiz scores.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Submissions",  value: submissions.length,                                         color: "text-blue-600 bg-blue-50",    icon: BookOpen },
          { label: "Pending Grading",    value: submissions.filter(s => s.status === "submitted" || s.status === "under_review").length, color: "text-amber-600 bg-amber-50", icon: Clock },
          { label: "Average Mark",       value: `${avgMark}%`,                                              color: "text-harvest bg-harvest/10",  icon: TrendingUp },
          { label: "Pass Rate",          value: `${passRate}%`,                                             color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "assignments", label: "Assignments" },
          { id: "quizzes",     label: "Quiz Scores" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white shadow text-ink" : "text-slate-500 hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or assignment…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {tab === "assignments" && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="resubmit_requested">Resubmit</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate-400 text-sm">Loading gradebook…</div>
      ) : tab === "assignments" ? (
        <div className="bg-white rounded-2xl border border-border/50 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Student", "Course", "Assignment", "Submitted", "Status", "Marks", "Result", "Feedback"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">No submissions found.</td></tr>
              ) : filteredSubs.map(sub => {
                const sc = STATUS_CONFIG[sub.status] || { color: "bg-slate-100 text-slate-500", label: sub.status };
                const pct = sub.marks_awarded != null && sub.max_marks ? Math.round((sub.marks_awarded / sub.max_marks) * 100) : null;
                return (
                  <tr key={sub.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink text-xs">{sub.user_name || "—"}</p>
                      <p className="text-[10px] text-slate-400">{sub.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{sub.course_title || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-ink max-w-[140px] truncate">{sub.assignment_title || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(sub.created_date).toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {sub.marks_awarded != null
                        ? <span className="font-bold text-sm text-ink">{sub.marks_awarded}<span className="text-slate-400 font-normal">/{sub.max_marks}</span></span>
                        : <span className="text-slate-400 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {pct != null ? (
                        <span className={`flex items-center gap-1 text-xs font-bold ${sub.passed ? "text-emerald-600" : "text-red-500"}`}>
                          {sub.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.passed ? "Pass" : "Fail"} ({pct}%)
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs text-slate-500 truncate">{sub.feedback || "—"}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Student", "Course", "Attempt #", "Score", "Result", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No quiz attempts found.</td></tr>
              ) : filteredQuizzes.map(a => {
                const pct = a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-border/20 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink text-xs">{a.user_id?.slice(0, 8) || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{a.course_id || "—"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-ink">#{a.attempt_number || 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-ink">{a.score}<span className="text-slate-400 font-normal">/{a.total_questions}</span></span>
                      <span className="text-xs text-slate-400 ml-1">({pct}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-bold w-fit ${a.passed ? "text-emerald-600" : "text-red-500"}`}>
                        {a.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {a.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(a.created_date).toLocaleDateString("en-AU")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}