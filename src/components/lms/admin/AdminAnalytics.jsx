import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import {
  TrendingUp, Users, Award, Target, BookOpen, Clock,
  ChevronDown, ChevronUp, Layers, HelpCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { averageQuizPercent, quizAttemptPercentOrZero } from "@/lib/quizScores";

const PIE_COLORS = ["#D97706", "#3B82F6", "#10B981", "#8B5CF6", "#F43F5E"];
const LEVEL_COLORS = { level1: "#3B82F6", level2: "#F59E0B", level3: "#8B5CF6" };

const TABS = [
  { id: "overview",   label: "Overview",         icon: TrendingUp },
  { id: "progress",   label: "Student Progress",  icon: Users },
  { id: "completion", label: "Completion Rates",  icon: Award },
  { id: "quizattempts", label: "Quiz Attempts",   icon: HelpCircle },
  { id: "modules",    label: "Module Time",        icon: Clock },
];

export default function AdminAnalytics({ courses, enrollments, quizAttempts }) {
  const [tab, setTab] = useState("overview");
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CourseModule.list("sort_order"),
      base44.entities.CourseTopic.list("sort_order"),
    ]).then(([mods, tops]) => {
      setModules(mods);
      setTopics(tops);
    }).catch(() => {
      setModules([]);
      setTopics([]);
    }).finally(() => setLoading(false));
  }, []);

  // ── Shared derived data ─────────────────────────────────────────────────────
  const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))].length;
  const totalAttempts = quizAttempts.length;
  const passedAttempts = quizAttempts.filter(q => q.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore = averageQuizPercent(quizAttempts) ?? 0;
  const overallCompletionRate = enrollments.length > 0
    ? Math.round((enrollments.filter(e => e.status === "completed").length / enrollments.length) * 100)
    : 0;

  const courseStats = courses.map(c => {
    const cEnvs = enrollments.filter(e => e.course_id === c.id);
    const completed = cEnvs.filter(e => e.status === "completed").length;
    const avgPct = cEnvs.length > 0
      ? Math.round(cEnvs.reduce((s, e) => s + (e.progress_percent || 0), 0) / cEnvs.length)
      : 0;
    return {
      id: c.id,
      name: c.title?.length > 22 ? c.title.slice(0, 22) + "…" : c.title,
      fullName: c.title,
      enrolled: cEnvs.length,
      completed,
      avgProgress: avgPct,
      completionRate: cEnvs.length > 0 ? Math.round((completed / cEnvs.length) * 100) : 0,
      level: c.level,
      active: cEnvs.filter(e => e.status === "active").length,
      paused: cEnvs.filter(e => e.status === "paused").length,
    };
  });

  const statusCounts = [
    { name: "Active",    value: enrollments.filter(e => e.status === "active").length },
    { name: "Completed", value: enrollments.filter(e => e.status === "completed").length },
    { name: "Paused",    value: enrollments.filter(e => e.status === "paused").length },
    { name: "Expired",   value: enrollments.filter(e => e.status === "expired").length },
  ].filter(s => s.value > 0);

  // ── Student Progress data ───────────────────────────────────────────────────
  // Group enrollments by student
  const studentMap = {};
  enrollments.forEach(e => {
    if (!studentMap[e.user_id]) {
      studentMap[e.user_id] = {
        id: e.user_id,
        name: e.user_name || "Unknown",
        email: e.user_email || "",
        enrollments: [],
      };
    }
    studentMap[e.user_id].enrollments.push(e);
  });

  let studentRows = Object.values(studentMap).map(s => {
    const envs = s.enrollments;
    const completedCourses = envs.filter(e => e.status === "completed").length;
    const avgProgress = envs.length > 0
      ? Math.round(envs.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / envs.length)
      : 0;
    const studentAttempts = quizAttempts.filter(a => a.user_id === s.id);
    const avgQuiz = averageQuizPercent(studentAttempts);
    return { ...s, completedCourses, avgProgress, avgQuiz, totalEnrolled: envs.length };
  });

  if (courseFilter !== "all") {
    studentRows = studentRows.filter(s => s.enrollments.some(e => e.course_id === courseFilter));
  }
  if (studentSearch) {
    const q = studentSearch.toLowerCase();
    studentRows = studentRows.filter(s =>
      s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }
  studentRows.sort((a, b) => {
    let av = a[sortBy], bv = b[sortBy];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  // ── Module time data ────────────────────────────────────────────────────────
  // For each module, estimate avg time spent = avg(completed topics' duration per enrolled student)
  const moduleTimeData = courses.map(course => {
    const courseMods = modules.filter(m => m.course_id === course.id);
    const courseEnvs = enrollments.filter(e => e.course_id === course.id);
    if (courseEnvs.length === 0 || courseMods.length === 0) return null;

    return courseMods.map(mod => {
      const modTopics = topics.filter(t => t.module_id === mod.id);
      // Total possible duration of the module in mins
      const totalDuration = modTopics.reduce((s, t) =>
        s + (t.video_duration_mins || t.reading_duration_mins || 5), 0);

      // Avg % of module topics each student has completed
      const avgCompletedRatio = courseEnvs.reduce((sum, enr) => {
        const doneInMod = modTopics.filter(t => (enr.completed_topic_ids || []).includes(t.id)).length;
        return sum + (modTopics.length > 0 ? doneInMod / modTopics.length : 0);
      }, 0) / courseEnvs.length;

      const avgTimeMins = Math.round(totalDuration * avgCompletedRatio);

      return {
        module: mod.title?.length > 20 ? mod.title.slice(0, 20) + "…" : mod.title,
        fullModule: mod.title,
        course: course.title?.split("—")[1]?.trim() || course.title,
        courseId: course.id,
        avgTimeMins,
        totalDuration,
        completionPct: Math.round(avgCompletedRatio * 100),
        topics: modTopics.length,
      };
    });
  }).filter(Boolean).flat();

  const filteredModuleData = courseFilter !== "all"
    ? moduleTimeData.filter(m => m.courseId === courseFilter)
    : moduleTimeData;

  const handleSort = (col) => {
    if (sortBy === col) setSortAsc(a => !a);
    else { setSortBy(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />)
    : null;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Students",    value: uniqueStudents,           icon: Users,     color: "text-blue-600 bg-blue-50" },
          { label: "Overall Completion",value: `${overallCompletionRate}%`, icon: Award,  color: "text-green-600 bg-green-50" },
          { label: "Quiz Pass Rate",    value: `${passRate}%`,           icon: Target,    color: "text-purple-600 bg-purple-50" },
          { label: "Avg Quiz Score",    value: `${avgScore}%`,           icon: TrendingUp,color: "text-amber-600 bg-amber-50" },
          { label: "Total Enrollments", value: enrollments.length,       icon: BookOpen,  color: "text-rose-600 bg-rose-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink leading-none">{s.value}</p>
              <p className="text-[10px] text-slate_mist mt-1 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "bg-white shadow text-ink" : "text-slate_mist hover:text-ink"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Enrollments + completions per course */}
          <div className="bg-white rounded-2xl border border-border/50 p-5">
            <h3 className="font-display font-semibold text-ink mb-4">Enrollments vs Completions</h3>
            {courseStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate_mist text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courseStats} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="enrolled"  fill="#D97706" radius={[4,4,0,0]} name="Enrolled" />
                  <Bar dataKey="completed" fill="#10B981" radius={[4,4,0,0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-harvest inline-block" /> Enrolled</span>
              <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Completed</span>
            </div>
          </div>

          {/* Status pie */}
          <div className="bg-white rounded-2xl border border-border/50 p-5">
            <h3 className="font-display font-semibold text-ink mb-4">Enrollment Status</h3>
            {statusCounts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate_mist text-sm">No enrollments yet</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={statusCounts} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 flex-1">
                  {statusCounts.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-slate_mist">{s.name}</span>
                      </div>
                      <span className="text-xs font-bold text-ink">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STUDENT PROGRESS ─────────────────────────────────────── */}
      {tab === "progress" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Search students…" value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)} className="h-9 text-sm max-w-xs" />
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border/30">
                    {[
                      { label: "Student",        col: "name" },
                      { label: "Enrolled",        col: "totalEnrolled" },
                      { label: "Completed",       col: "completedCourses" },
                      { label: "Avg Progress",    col: "avgProgress" },
                      { label: "Avg Quiz Score",  col: "avgQuiz" },
                    ].map(h => (
                      <th key={h.col} onClick={() => handleSort(h.col)}
                        className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider cursor-pointer hover:text-ink select-none">
                        {h.label}<SortIcon col={h.col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentRows.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-slate_mist text-sm">No students found.</td></tr>
                  ) : studentRows.map((s, i) => (
                    <tr key={s.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                            {(s.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink text-sm">{s.name}</p>
                            <p className="text-[10px] text-slate_mist">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-ink">{s.totalEnrolled}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${s.completedCourses > 0 ? "text-emerald-600" : "text-slate_mist"}`}>
                          {s.completedCourses}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${s.avgProgress >= 80 ? "bg-emerald-500" : s.avgProgress >= 40 ? "bg-harvest" : "bg-slate-300"}`}
                              style={{ width: `${s.avgProgress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-ink w-8">{s.avgProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {s.avgQuiz !== null
                          ? <span className={`text-sm font-bold ${s.avgQuiz >= 70 ? "text-emerald-600" : "text-red-500"}`}>{s.avgQuiz}%</span>
                          : <span className="text-xs text-slate_mist">No attempts</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-border/20 text-xs text-slate_mist">
              {studentRows.length} student{studentRows.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETION RATES ─────────────────────────────────────── */}
      {tab === "completion" && (
        <div className="space-y-4">
          {/* Completion rate bar chart */}
          <div className="bg-white rounded-2xl border border-border/50 p-5">
            <h3 className="font-display font-semibold text-ink mb-4">Completion Rate by Course</h3>
            {courseStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate_mist text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courseStats} margin={{ left: -15 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Bar dataKey="completionRate" name="Completion Rate" radius={[4,4,0,0]}>
                    {courseStats.map((c, i) => (
                      <Cell key={i} fill={c.completionRate >= 70 ? "#10B981" : c.completionRate >= 40 ? "#D97706" : "#F43F5E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> ≥70% Excellent</span>
              <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-harvest inline-block" /> 40–69% Good</span>
              <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> &lt;40% Needs attention</span>
            </div>
          </div>

          {/* Per-course detail table */}
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="font-display font-semibold text-ink">Course Performance Detail</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border/30">
                    {["Course", "Level", "Enrolled", "Active", "Completed", "Paused", "Completion Rate", "Avg Progress"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((c, i) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-ink max-w-[200px]"><p className="truncate">{c.fullName}</p></td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: LEVEL_COLORS[c.level] + "20", color: LEVEL_COLORS[c.level] }}>
                          {c.level?.replace("level", "L")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-ink">{c.enrolled}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">{c.active}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">{c.completed}</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold">{c.paused}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${c.completionRate}%`,
                                background: c.completionRate >= 70 ? "#10B981" : c.completionRate >= 40 ? "#D97706" : "#F43F5E"
                              }} />
                          </div>
                          <span className="text-xs font-bold w-9">{c.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${c.avgProgress}%` }} />
                          </div>
                          <span className="text-xs font-bold w-9">{c.avgProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE TIME ──────────────────────────────────────────── */}
      {tab === "modules" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-64 h-9 text-sm"><SelectValue placeholder="Filter by course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate_mist">
              Avg time = estimated from topic durations × student completion ratio
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading module data…</div>
          ) : filteredModuleData.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-border p-12 text-center">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate_mist text-sm">No module data available. Add topics with durations to see time estimates.</p>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-white rounded-2xl border border-border/50 p-5">
                <h3 className="font-display font-semibold text-ink mb-4">Avg Time Spent per Module (mins)</h3>
                <ResponsiveContainer width="100%" height={Math.max(200, filteredModuleData.length * 35)}>
                  <BarChart data={filteredModuleData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} unit=" min" />
                    <YAxis dataKey="module" type="category" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip formatter={(v, n) => [`${v} min`, n]} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <Bar dataKey="avgTimeMins" name="Avg Time Spent" fill="#D97706" radius={[0,4,4,0]} />
                    <Bar dataKey="totalDuration" name="Total Duration" fill="#CBD5E1" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-harvest inline-block" /> Avg Time Spent</span>
                  <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" /> Total Duration</span>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-display font-semibold text-ink">Module Engagement Detail</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border/30">
                        {["Module", "Course", "Topics", "Total Duration", "Avg Time Spent", "Avg Completion"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModuleData.map((m, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Layers className="w-3.5 h-3.5 text-harvest" />
                              </div>
                              <span className="font-medium text-ink text-sm">{m.fullModule}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate_mist max-w-[140px]">
                            <p className="truncate">{m.course}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-ink">{m.topics}</td>
                          <td className="px-4 py-3 text-sm text-slate_mist">
                            {m.totalDuration > 0 ? `${m.totalDuration} min` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-harvest flex-shrink-0" />
                              <span className="font-semibold text-ink text-sm">
                                {m.avgTimeMins > 0 ? `${m.avgTimeMins} min` : "< 1 min"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full ${m.completionPct >= 70 ? "bg-emerald-500" : m.completionPct >= 40 ? "bg-harvest" : "bg-red-400"}`}
                                  style={{ width: `${m.completionPct}%` }} />
                              </div>
                              <span className="text-xs font-bold text-ink w-9">{m.completionPct}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── QUIZ ATTEMPTS ────────────────────────────────────────── */}
      {tab === "quizattempts" && (() => {
        // Build per-student quiz summary
        const attemptsByStudent = {};
        quizAttempts.forEach(a => {
          const key = a.user_id;
          if (!attemptsByStudent[key]) {
            // Get name/email from enrollments
            const enr = enrollments.find(e => e.user_id === key || String(e.user_id) === String(key));
            attemptsByStudent[key] = {
              user_id: key,
              name: enr?.user_name || a.user_name || "Unknown",
              email: enr?.user_email || a.user_email || "",
              attempts: [],
            };
          }
          attemptsByStudent[key].attempts.push(a);
        });

        let quizStudentRows = Object.values(attemptsByStudent).map(s => {
          const attempts = s.attempts;
          const totalAtts = attempts.length;
          const passed = attempts.filter(a => a.passed).length;
          const passRatePct = totalAtts > 0 ? Math.round((passed / totalAtts) * 100) : 0;
          const scores = attempts.map(quizAttemptPercentOrZero);
          const avgPct = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
          const highestPct = scores.length > 0 ? Math.max(...scores) : 0;
          const courseIds = [...new Set(attempts.map(a => a.course_id))];
          return {
            ...s,
            totalAttempts: totalAtts,
            passed,
            passRatePct,
            avgPct,
            highestPct,
            courseIds,
            latestAttempt: attempts.sort((a, b) => new Date(b.createdAt || b.created_date) - new Date(a.createdAt || a.created_date))[0],
          };
        });

        // Filter by course
        if (courseFilter !== "all") {
          quizStudentRows = quizStudentRows.filter(s => s.courseIds.includes(courseFilter));
        }
        if (studentSearch) {
          const q = studentSearch.toLowerCase();
          quizStudentRows = quizStudentRows.filter(s =>
            s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
          );
        }
        quizStudentRows.sort((a, b) => b.avgPct - a.avgPct);

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Search students…" value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)} className="h-9 text-sm max-w-xs" />
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {quizStudentRows.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-border p-12 text-center">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate_mist text-sm">No quiz attempts recorded yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border/30">
                        {["Student", "Total Attempts", "Passed", "Pass Rate", "Avg Score %", "Highest Score %", "Last Attempt"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quizStudentRows.map((s, i) => (
                        <tr key={s.user_id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                                {(s.name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-ink text-sm">{s.name}</p>
                                <p className="text-[10px] text-slate_mist">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-ink">{s.totalAttempts}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-emerald-600">{s.passed}</span>
                            <span className="text-slate_mist text-xs"> / {s.totalAttempts}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full ${s.passRatePct >= 70 ? "bg-emerald-500" : s.passRatePct >= 40 ? "bg-harvest" : "bg-red-400"}`}
                                  style={{ width: `${s.passRatePct}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${s.passRatePct >= 70 ? "text-emerald-600" : s.passRatePct >= 40 ? "text-harvest" : "text-red-500"}`}>
                                {s.passRatePct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full ${s.avgPct >= 70 ? "bg-emerald-500" : s.avgPct >= 40 ? "bg-harvest" : "bg-red-400"}`}
                                  style={{ width: `${s.avgPct}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${s.avgPct >= 70 ? "text-emerald-600" : s.avgPct >= 40 ? "text-harvest" : "text-red-500"}`}>
                                {s.avgPct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${s.highestPct >= 90 ? "text-emerald-600" : s.highestPct >= 70 ? "text-ink" : "text-slate_mist"}`}>
                              {s.highestPct}%
                              {s.highestPct >= 90 && <span className="text-[10px] ml-1 text-emerald-600">⭐ Excellent</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                            {s.latestAttempt ? (
                              new Date(s.latestAttempt.createdAt || s.latestAttempt.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-border/20 text-xs text-slate_mist">
                  {quizStudentRows.length} student{quizStudentRows.length !== 1 ? "s" : ""} · {quizAttempts.length} total attempts
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}