import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Download, Search, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { quizAttemptPercent, quizScoreLabel } from "@/lib/quizScores";

const STATUS_CONFIG = {
  graded: { color: "bg-emerald-100 text-emerald-700", label: "Graded" },
  submitted: { color: "bg-amber-100 text-amber-700", label: "Submitted" },
  under_review: { color: "bg-blue-100 text-blue-700", label: "Under Review" },
  resubmit_requested: { color: "bg-red-100 text-red-700", label: "Resubmit" },
};

const getId = (item) => String(item?._id || item?.id || "");

const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function AdminGradebook({ courses = [] }) {
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("assignments");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.AssignmentSubmission.list("-created_date", 300),
      base44.entities.QuizAttempt.list("-created_date", 1000),
      base44.entities.CourseEnrollment.list("-created_date", 1000),
      base44.entities.CourseTopic.list("sort_order", 1000),
    ])
      .then(([subs, attempts, envs, topicRows]) => {
        setSubmissions(Array.isArray(subs) ? subs : []);
        setQuizAttempts(Array.isArray(attempts) ? attempts : []);
        setEnrollments(Array.isArray(envs) ? envs : []);
        setTopics(Array.isArray(topicRows) ? topicRows : []);
      })
      .catch((err) => {
        console.error("Failed to load gradebook:", err);
        toast.error(err.response?.data?.message || "Failed to load gradebook.");
      })
      .finally(() => setLoading(false));
  }, []);

  const courseMap = new Map(courses.map(c => [getId(c), c]));
  const topicMap = new Map(topics.map(t => [getId(t), t]));
  const enrollmentByUserCourse = new Map(enrollments.map(e => [`${String(e.user_id)}:${String(e.course_id)}`, e]));

  const getAttemptStudent = (attempt) => enrollmentByUserCourse.get(`${String(attempt.user_id)}:${String(attempt.course_id)}`) || {};
  const getAttemptCourse = (attempt) => courseMap.get(String(attempt.course_id)) || {};
  const getAttemptTopic = (attempt) => topicMap.get(String(attempt.topic_id)) || {};

  const query = search.trim().toLowerCase();

  const filteredSubs = submissions.filter(s => {
    const matchCourse = courseFilter === "all" || String(s.course_id) === String(courseFilter);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchSearch = !query || [s.user_name, s.user_email, s.course_title, s.assignment_title]
      .some(value => String(value || "").toLowerCase().includes(query));
    return matchCourse && matchStatus && matchSearch;
  });

  const filteredQuizzes = quizAttempts.filter(a => {
    const enrollment = getAttemptStudent(a);
    const course = getAttemptCourse(a);
    const topic = getAttemptTopic(a);
    const matchCourse = courseFilter === "all" || String(a.course_id) === String(courseFilter);
    const matchSearch = !query || [
      enrollment.user_name,
      enrollment.user_email,
      course.title,
      topic.title,
      a.user_id,
      a.course_id,
      a.topic_id,
      a.attempt_number,
    ].some(value => String(value || "").toLowerCase().includes(query));
    return matchCourse && matchSearch;
  });

  const scoredSubs = submissions.filter(s => s.marks_awarded != null && s.max_marks);
  const avgMark = scoredSubs.length > 0
    ? Math.round(scoredSubs.reduce((sum, s) => sum + (s.marks_awarded / s.max_marks) * 100, 0) / scoredSubs.length)
    : 0;

  const gradedSubs = submissions.filter(s => s.status === "graded");
  const passRate = gradedSubs.length > 0
    ? Math.round((gradedSubs.filter(s => s.passed).length / gradedSubs.length) * 100)
    : 0;

  const exportCSV = () => {
    const rows = tab === "quizzes"
      ? filteredQuizzes.map(a => {
          const enrollment = getAttemptStudent(a);
          const course = getAttemptCourse(a);
          const topic = getAttemptTopic(a);
          const pct = quizAttemptPercent(a);
          return [
            enrollment.user_name || "",
            enrollment.user_email || "",
            course.title || a.course_id || "",
            topic.title || a.topic_id || "",
            a.attempt_number || 1,
            quizScoreLabel(a),
            pct != null ? `${pct}%` : "",
            a.passed ? "Pass" : "Fail",
            dateLabel(a.created_date || a.createdAt),
          ];
        })
      : filteredSubs.map(s => [
          s.user_name || "", s.user_email || "", s.course_title || "", s.assignment_title || "",
          s.status || "", s.marks_awarded ?? "", s.max_marks ?? "", s.passed ? "Pass" : "Fail",
          s.feedback || "", dateLabel(s.created_date || s.createdAt),
        ]);

    const headers = tab === "quizzes"
      ? ["Student Name", "Email", "Course", "Quiz", "Attempt", "Marks", "Percent", "Result", "Date"]
      : ["Student Name", "Email", "Course", "Assignment", "Status", "Marks", "Max Marks", "Result", "Feedback", "Submitted"];

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tab === "quizzes" ? "quiz-gradebook.csv" : "assignment-gradebook.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Gradebook exported.");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Gradebook</h2>
          <p className="text-sm text-slate-500">All student assignment marks and quiz scores.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Submissions", value: submissions.length, color: "text-blue-600 bg-blue-50", icon: BookOpen },
          { label: "Pending Grading", value: submissions.filter(s => s.status === "submitted" || s.status === "under_review").length, color: "text-amber-600 bg-amber-50", icon: Clock },
          { label: "Average Mark", value: `${avgMark}%`, color: "text-harvest bg-harvest/10", icon: TrendingUp },
          { label: "Pass Rate", value: `${passRate}%`, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
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

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "assignments", label: "Assignments" },
          { id: "quizzes", label: "Quiz Scores" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white shadow text-ink" : "text-slate-500 hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === "quizzes" ? "Search student, course, or quiz..." : "Search student or assignment..."}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={getId(c)} value={getId(c)}>{c.title}</SelectItem>)}
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
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate-400 text-sm">Loading gradebook...</div>
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
                      <p className="font-medium text-ink text-xs">{sub.user_name || "-"}</p>
                      <p className="text-[10px] text-slate-400">{sub.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{sub.course_title || "-"}</td>
                    <td className="px-4 py-3"><p className="text-xs font-medium text-ink max-w-[140px] truncate">{sub.assignment_title || "-"}</p></td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{dateLabel(sub.created_date || sub.createdAt)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span></td>
                    <td className="px-4 py-3">
                      {sub.marks_awarded != null ? <span className="font-bold text-sm text-ink">{sub.marks_awarded}<span className="text-slate-400 font-normal">/{sub.max_marks}</span></span> : <span className="text-slate-400 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {pct != null ? (
                        <span className={`flex items-center gap-1 text-xs font-bold ${sub.passed ? "text-emerald-600" : "text-red-500"}`}>
                          {sub.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.passed ? "Pass" : "Fail"} ({pct}%)
                        </span>
                      ) : <span className="text-slate-300 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]"><p className="text-xs text-slate-500 truncate">{sub.feedback || "-"}</p></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 border-b border-border/30">
                {["Student", "Course", "Quiz", "Attempt", "Marks", "Result", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No quiz attempts found.</td></tr>
              ) : filteredQuizzes.map(a => {
                const enrollment = getAttemptStudent(a);
                const course = getAttemptCourse(a);
                const topic = getAttemptTopic(a);
                const pct = quizAttemptPercent(a);
                return (
                  <tr key={a.id || a._id} className="border-b border-border/20 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink text-xs">{enrollment.user_name || String(a.user_id || "-").slice(0, 8)}</p>
                      <p className="text-[10px] text-slate-400">{enrollment.user_email || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{course.title || a.course_id || "-"}</td>
                    <td className="px-4 py-3 text-xs text-ink font-medium max-w-[180px] truncate">{topic.title || a.topic_id || "Quiz"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-ink">#{a.attempt_number || 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-ink">{quizScoreLabel(a)}</span>
                      {pct != null && <span className="text-xs text-slate-400 ml-1">({pct}%)</span>}
                      {a.total_questions > 0 && <p className="text-[10px] text-slate-400">{a.total_questions} question{a.total_questions === 1 ? "" : "s"}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-bold w-fit ${a.passed ? "text-emerald-600" : "text-red-500"}`}>
                        {a.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {a.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{dateLabel(a.created_date || a.createdAt)}</td>
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