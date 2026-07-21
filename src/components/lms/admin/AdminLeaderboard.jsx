import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, Award, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quizAttemptPercentOrZero } from "@/lib/quizScores";

export default function AdminLeaderboard({ courses }) {
  const [enrollments, setEnrollments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [metric, setMetric] = useState("progress"); // progress | quizScore | completions

  const load = async () => {
    setLoading(true);
    try {
      const [envs, attempts] = await Promise.all([
        base44.entities.CourseEnrollment.list("-updated_date", 500),
        base44.entities.QuizAttempt.list("-created_date", 500),
      ]);
      setEnrollments(envs);
      setQuizAttempts(attempts);
    } catch {
      setEnrollments([]);
      setQuizAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build leaderboard data per student
  const studentMap = {};
  enrollments.filter(e => courseFilter === "all" || e.course_id === courseFilter).forEach(e => {
    const key = e.user_email || e.user_id;
    if (!studentMap[key]) {
      studentMap[key] = {
        name: e.user_name || e.user_email || "Unknown",
        email: e.user_email || e.user_id,
        totalProgress: 0,
        enrollmentCount: 0,
        completions: 0,
        quizScores: [],
      };
    }
    studentMap[key].totalProgress += (e.progress_percent || 0);
    studentMap[key].enrollmentCount += 1;
    if (e.status === "completed") studentMap[key].completions += 1;
  });

  quizAttempts.forEach(a => {
    const key = a.user_email || a.user_id;
    if (studentMap[key]) studentMap[key].quizScores.push(quizAttemptPercentOrZero(a));
  });

  const students = Object.values(studentMap).map(s => ({
    ...s,
    avgProgress: s.enrollmentCount > 0 ? Math.round(s.totalProgress / s.enrollmentCount) : 0,
    avgQuizScore: s.quizScores.length > 0 ? Math.round(s.quizScores.reduce((a, b) => a + b, 0) / s.quizScores.length) : 0,
  }));

  const sorted = [...students].sort((a, b) => {
    if (metric === "progress") return b.avgProgress - a.avgProgress;
    if (metric === "quizScore") return b.avgQuizScore - a.avgQuizScore;
    return b.completions - a.completions;
  });

  const RANK_STYLES = [
    { bg: "bg-amber-50 border-amber-200", icon: <Trophy className="w-5 h-5 text-amber-500" />, badge: "bg-amber-500 text-white" },
    { bg: "bg-slate-50 border-slate-200", icon: <Medal className="w-5 h-5 text-slate-400" />, badge: "bg-slate-400 text-white" },
    { bg: "bg-orange-50 border-orange-200", icon: <Award className="w-5 h-5 text-orange-400" />, badge: "bg-orange-400 text-white" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-ink">Student Leaderboard</h2>
          <p className="text-xs text-slate-500">Top performers across the platform</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Avg. Progress</SelectItem>
              <SelectItem value="quizScore">Avg. Quiz Score</SelectItem>
              <SelectItem value="completions">Course Completions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="w-9 h-9" onClick={load}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">No student data yet.</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3">
            {sorted.slice(0, 3).map((s, i) => {
              const style = RANK_STYLES[i];
              const value = metric === "progress" ? `${s.avgProgress}%`
                : metric === "quizScore" ? `${s.avgQuizScore}%`
                : `${s.completions} courses`;
              return (
                <div key={s.email} className={`rounded-2xl border-2 p-4 text-center ${style.bg}`}>
                  <div className="flex justify-center mb-2">{style.icon}</div>
                  <div className={`w-8 h-8 rounded-full ${style.badge} flex items-center justify-center font-bold text-sm mx-auto mb-2`}>
                    {i + 1}
                  </div>
                  <p className="font-display font-bold text-sm text-ink truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 truncate mb-1">{s.email}</p>
                  <p className="font-bold text-lg text-ink">{value}</p>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Rank", "Student", "Enrollments", "Completions", "Avg. Progress", "Avg. Quiz Score"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => (
                  <tr key={s.email} className="border-b border-border/20 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-amber-100 text-amber-700"
                          : i === 1 ? "bg-slate-100 text-slate-600"
                          : i === 2 ? "bg-orange-100 text-orange-600"
                          : "bg-slate-50 text-slate-400"
                      }`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink font-semibold">{s.enrollmentCount}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-emerald-700">{s.completions}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${s.avgProgress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink">{s.avgProgress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.quizScores.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${s.avgQuizScore >= 70 ? "bg-emerald-500" : "bg-red-400"}`}
                              style={{ width: `${s.avgQuizScore}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${s.avgQuizScore >= 70 ? "text-emerald-600" : "text-red-500"}`}>{s.avgQuizScore}%</span>
                        </div>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}