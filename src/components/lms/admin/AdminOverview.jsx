import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Award, HelpCircle, TrendingUp, Layers, Activity, Clock, FileText, BarChart3, ShieldCheck, ChevronRight, Users2, AlertTriangle, CalendarClock, Flame, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import apiClient from "@/api/apiClient";
import { format, differenceInDays } from "date-fns";
import NDISIntakeSummary from "./NDISIntakeSummary";

const PIE_COLORS = ["#D97706", "#3B82F6", "#10B981", "#8B5CF6"];

export default function AdminOverview({ courses, enrollments, quizAttempts, setActiveTab }) {
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [teamCount, setTeamCount] = useState(null); // null = loading

  useEffect(() => {
    // Pending assignment submissions
    apiClient.get('/submissions?status=submitted&limit=200')
      .then(res => setPendingAssignments((res.data?.data ?? []).length))
      .catch(() => {});
    // Total assignment definitions (includes assignment records synced from topics)
    apiClient.get('/assignments?limit=1')
      .then(res => {
        const total = res.data?.meta?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
        setTotalAssignments(total);
      })
      .catch(() => {});
    // Admin overview (pending docs — not yet exposed)
    apiClient.get('/admin/overview')
      .then(() => setPendingDocs([]))
      .catch(() => {});
    // Team member count
    apiClient.get('/users?role=team_member&limit=1')
      .then(res => {
        // Use pagination total if available, otherwise count the returned array
        const total = res.data?.meta?.total ?? res.data?.meta?.count ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
        setTeamCount(total);
      })
      .catch(() => setTeamCount(0));
  }, []);

  const uniqueStudents  = [...new Set(enrollments.map(e => e.user_id))].length;
  const activeStudents  = [...new Set(enrollments.filter(e => e.status === "active").map(e => e.user_id))].length;
  const completions     = enrollments.filter(e => e.status === "completed").length;
  const certs           = enrollments.filter(e => e.certificate_issued).length;
  const passRate        = quizAttempts.length > 0 ? Math.round((quizAttempts.filter(q => q.passed).length / quizAttempts.length) * 100) : 0;
  const completionRate  = enrollments.length > 0 ? Math.round((completions / enrollments.length) * 100) : 0;
  const newEnrollments  = enrollments.filter(e => {
    const d = new Date(e.created_date);
    const now = new Date();
    return (now - d) < 30 * 24 * 60 * 60 * 1000; // last 30 days
  }).length;
  const avgProgress     = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  // Active enrollments whose access expires within the next 14 days
  const expiringSoon = enrollments
    .filter(e => e.status === "active" && e.expiry_date)
    .map(e => ({ ...e, daysLeft: differenceInDays(new Date(e.expiry_date), new Date()) }))
    .filter(e => e.daysLeft >= 0 && e.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6);

  // Enrollment trend — last 6 months
  const trendData = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: format(d, "MMM"),
        Enrollments: 0,
      });
    }
    const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
    enrollments.forEach(e => {
      if (!e.created_date) return;
      const d = new Date(e.created_date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k in idx) months[idx[k]].Enrollments += 1;
    });
    return months;
  })();

  // Top courses by enrollment (with completion rate)
  const topCourses = courses
    .map(c => {
      const rows = enrollments.filter(e => e.course_id === c.id);
      const done = rows.filter(e => e.status === "completed").length;
      return {
        id: c.id,
        title: c.title || c.level?.replace("level", "Level ") || "Untitled",
        enrolled: rows.length,
        rate: rows.length > 0 ? Math.round((done / rows.length) * 100) : 0,
      };
    })
    .filter(c => c.enrolled > 0)
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 5);
  const maxEnrolled = topCourses.reduce((m, c) => Math.max(m, c.enrolled), 0) || 1;

  // "Needs attention" quick actions
  const attentionItems = [
    { label: "Assignments to grade", value: pendingAssignments, icon: FileText, tab: "gradebook", tone: "amber" },
    { label: "Access expiring soon", value: expiringSoon.length, icon: CalendarClock, tab: "expiry", tone: "rose" },
    { label: "Documents to verify",  value: pendingDocs.length,  icon: ShieldCheck, tab: "documents", tone: "blue" },
  ].filter(i => i.value > 0);

  const attentionTone = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose:  "border-rose-200 bg-rose-50 text-rose-700",
    blue:  "border-blue-200 bg-blue-50 text-blue-700",
  };

  const kpis = [
    { label: "Total Students",     value: uniqueStudents,               icon: Users,      color: "text-blue-600 bg-blue-50 border-blue-100",        tab: "students" },
    { label: "Active Students",    value: activeStudents,               icon: Activity,   color: "text-green-600 bg-green-50 border-green-100",      tab: "students" },
    { label: "New Enrollments",    value: newEnrollments,               icon: Layers,     color: "text-purple-600 bg-purple-50 border-purple-100",   tab: "students" },
    { label: "Completion Rate",    value: `${completionRate}%`,         icon: BarChart3,  color: "text-harvest bg-harvest/10 border-harvest/20",     tab: "analytics" },
    { label: "Certificates Issued",value: certs,                        icon: Award,      color: "text-emerald-600 bg-emerald-50 border-emerald-100",tab: "certificates" },
    { label: "Total Assignments",  value: totalAssignments,             icon: FileText,   color: "text-blue-600 bg-blue-50 border-blue-100",         tab: "assessments" },
    { label: "Pending Assignments",value: pendingAssignments,           icon: FileText,   color: "text-amber-600 bg-amber-50 border-amber-100",      tab: "gradebook" },
    { label: "Quiz Attempts",      value: quizAttempts.length,          icon: HelpCircle, color: "text-rose-600 bg-rose-50 border-rose-100",         tab: "analytics" },
    { label: "Quiz Pass Rate",     value: `${passRate}%`,               icon: TrendingUp, color: "text-teal-600 bg-teal-50 border-teal-100",         tab: "analytics" },
    { label: "Avg. Progress",      value: `${avgProgress}%`,            icon: Gauge,      color: "text-indigo-600 bg-indigo-50 border-indigo-100",   tab: "analytics" },
    { label: "Team Members",       value: teamCount === null ? "…" : teamCount, icon: Users2, color: "text-violet-600 bg-violet-50 border-violet-100", tab: "team" },
  ];

  // Level distribution for pie
  const levelDist = [
    { name: "Level 1", value: enrollments.filter(e => e.course_level === "level1").length },
    { name: "Level 2", value: enrollments.filter(e => e.course_level === "level2").length },
    { name: "Level 3", value: enrollments.filter(e => e.course_level === "level3").length },
  ].filter(d => d.value > 0);

  // Per course bar data
  const barData = courses.slice(0, 6).map(c => ({
    name: c.level?.replace("level", "L") || "—",
    Enrolled: enrollments.filter(e => e.course_id === c.id).length,
    Completed: enrollments.filter(e => e.course_id === c.id && e.status === "completed").length,
  }));

  // Recent enrollments
  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-ink rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="text-harvest text-xs font-bold uppercase tracking-widest mb-1">SOL Business Consultant</p>
          <h2 className="font-display font-bold text-2xl text-white mb-1">NDIS Training Academy — Admin</h2>
          <p className="text-white/40 text-sm">Manage all students, courses and training content from one dashboard.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setActiveTab("students")}
            className="bg-harvest hover:bg-harvest/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            + Add Student
          </button>
          <button onClick={() => setActiveTab("courses")}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/20">
            + New Course
          </button>
        </div>
      </div>

      {/* Needs Attention */}
      {attentionItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink flex-shrink-0 pt-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Attention
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {attentionItems.map(a => (
              <button key={a.label} onClick={() => setActiveTab(a.tab)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md ${attentionTone[a.tone]}`}>
                <a.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-lg leading-none">{a.value}</p>
                  <p className="text-[11px] leading-tight opacity-80">{a.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <motion.button key={k.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(k.tab)}
            className={`bg-white rounded-xl border p-4 flex items-center gap-3 hover:shadow-md transition-all text-left ${k.color.split(" ").slice(2).join(" ")} hover:border-current`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${k.color.split(" ").slice(0, 2).join(" ")}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink leading-none">{k.value}</p>
              <p className="text-[10px] text-slate_mist mt-0.5 leading-tight">{k.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Enrollments vs Completions</h3>
          {barData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate_mist text-sm">No course data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Enrolled"  fill="#D97706" radius={[4,4,0,0]} />
                <Bar dataKey="Completed" fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-harvest inline-block" /> Enrolled</span>
            <span className="flex items-center gap-1.5 text-xs text-slate_mist"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Completed</span>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Enrollment by Level</h3>
          {levelDist.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate_mist text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={levelDist} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                    {levelDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {levelDist.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-slate_mist flex-1">{d.name}</span>
                    <span className="text-xs font-bold text-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enrollment trend + Top courses */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* 6-month trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Enrollment Trend (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="Enrollments" stroke="#D97706" strokeWidth={2} fill="url(#enrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top courses */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-harvest" />
            <h3 className="font-display font-semibold text-ink">Top Courses</h3>
          </div>
          {topCourses.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate_mist text-sm">No enrollments yet</div>
          ) : (
            <div className="space-y-3">
              {topCourses.map((c, i) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-ink truncate flex-1">
                      <span className="text-slate_mist mr-1">{i + 1}.</span>{c.title}
                    </span>
                    <span className="text-xs font-bold text-ink flex-shrink-0">{c.enrolled}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${(c.enrolled / maxEnrolled) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-slate_mist mt-0.5">{c.rate}% completed</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Access Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-rose-600" />
              <h3 className="font-display font-semibold text-rose-900 text-sm">Access Expiring Soon</h3>
              <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">{expiringSoon.length}</span>
            </div>
            <button onClick={() => setActiveTab("expiry")} className="text-xs text-rose-600 hover:underline font-medium flex items-center gap-1">
              Manage Access <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border/20">
            {expiringSoon.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold flex-shrink-0">
                  {(e.user_name || e.user_email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{e.user_name || e.user_email || "Unknown"}</p>
                  <p className="text-xs text-slate_mist truncate">{e.course_title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.daysLeft <= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {e.daysLeft === 0 ? "Today" : `${e.daysLeft}d left`}
                  </span>
                  <p className="text-[10px] text-slate_mist mt-1">{format(new Date(e.expiry_date), "dd MMM")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NDIS Intake Summary + Unverified Docs */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Full NDIS intake summary card */}
        <NDISIntakeSummary setActiveTab={setActiveTab} />

        {/* Unverified Student Documents */}
        {pendingDocs.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-semibold text-amber-900 text-sm">Unverified Documents</h3>
                <span className="text-xs font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">{pendingDocs.length}</span>
              </div>
              <button onClick={() => setActiveTab("documents")} className="text-xs text-amber-600 hover:underline font-medium flex items-center gap-1">
                Review All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-border/20">
              {pendingDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">
                    {(doc.user_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{doc.user_name || "Unknown"}</p>
                    <p className="text-xs text-slate_mist truncate">{doc.document_type?.replace(/_/g, " ")} — {doc.document_title || doc.file_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    <p className="text-[10px] text-slate_mist mt-1">{doc.created_date ? format(new Date(doc.created_date), "dd MMM") : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <h3 className="font-display font-semibold text-ink">Recent Enrollments</h3>
          <button onClick={() => setActiveTab("students")} className="text-xs text-harvest hover:underline">View All</button>
        </div>
        {recentEnrollments.length === 0 ? (
          <div className="p-10 text-center text-slate_mist text-sm">No enrollments yet.</div>
        ) : (
          <div className="divide-y divide-border/20">
            {recentEnrollments.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                  {(e.user_name || e.user_email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{e.user_name || e.user_email || "Unknown"}</p>
                  <p className="text-xs text-slate_mist truncate">{e.course_title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${e.progress_percent || 0}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {e.status === "completed" ? "Done" : `${e.progress_percent || 0}%`}
                  </span>
                  <span className="text-[10px] text-slate_mist flex items-center gap-1 hidden md:flex">
                    <Clock className="w-3 h-3" />{e.created_date ? new Date(e.created_date).toLocaleDateString("en-AU") : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}