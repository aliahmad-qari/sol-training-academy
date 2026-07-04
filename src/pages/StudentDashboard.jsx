import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import apiClient from "@/api/apiClient";
import {
  BookOpen, Award, Settings, Play, CheckCircle, LogOut,
  Home, HelpCircle, Bell, LifeBuoy, ChevronRight, Menu, X, Clock,
  TrendingUp, FileText, Megaphone, Video, Target, Calendar, UserCircle, ClipboardList, Gift,
  StickyNote, MessageSquare, Flame, Map, Star, CreditCard, Sparkles, Inbox, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CoursePlayer from "@/components/lms/CoursePlayer";
import ProgressRing from "@/components/lms/ProgressRing";
import StudentOverview from "@/components/lms/student/StudentOverview";
import StudentProgress from "@/components/lms/student/StudentProgress";
import StudentQuizzes from "@/components/lms/student/StudentQuizzes";
import StudentCertificates from "@/components/lms/student/StudentCertificates";
import StudentProfile from "@/components/lms/student/StudentProfile";
import TrainingResources from "@/components/lms/student/TrainingResources";
import SupportCentre from "@/components/lms/student/SupportCentre";
import AnnouncementsSection from "@/components/lms/student/AnnouncementsSection";
import TrainingVideos from "@/components/lms/student/TrainingVideos";
import CareerHub from "@/components/lms/student/CareerHub";
import TrainingCalendar from "@/components/lms/student/TrainingCalendar";
import TrainerInformation from "@/components/lms/student/TrainerInformation";
import AchievementBadges from "@/components/lms/student/AchievementBadges";
import StudentAssessments from "@/components/lms/student/StudentAssessments";
import ReferralHub from "@/components/lms/student/ReferralHub";
import NotesAndBookmarks from "@/components/lms/student/NotesAndBookmarks";
import CourseDiscussion from "@/components/lms/student/CourseDiscussion";
import GoalSetting from "@/components/lms/student/GoalSetting";
import LearningStreak from "@/components/lms/student/LearningStreak";
import SkillMap from "@/components/lms/student/SkillMap";
import CPDHoursTracker from "@/components/lms/student/CPDHoursTracker";
import StudentPayments from "@/components/lms/student/StudentPayments";
import CourseReviews from "@/components/lms/student/CourseReviews";
import StudentRequests from "@/components/lms/student/StudentRequests";
import StudentDocumentUpload from "@/components/lms/student/StudentDocumentUpload";
import AIToolsStudent from "@/pages/AIToolsStudent";



const LEVEL_CONFIG = {
  level1: { bar: "bg-harvest",         pill: "bg-harvest/10 text-harvest border border-harvest/30",       label: "Level 1 — Foundation" },
  level2: { bar: "bg-emerald-500",     pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",  label: "Level 2 — Professional" },
  level3: { bar: "bg-amber-600",       pill: "bg-amber-50 text-amber-700 border border-amber-200",        label: "Level 3 — Advanced" },
};

const NAV_SECTIONS = [
  { label: "Learning", items: [
    { id: "overview",      label: "Dashboard",             icon: Home },
    { id: "courses",       label: "My Courses",            icon: BookOpen },
    { id: "progress",      label: "Learning Progress",     icon: TrendingUp },
    { id: "videos",        label: "Training Videos",       icon: Video },
  ]},
  { label: "Assessments", items: [
    { id: "assessments",   label: "My Assessments",        icon: ClipboardList },
    { id: "quizzes",       label: "Quiz History",          icon: HelpCircle },
    { id: "certificates",  label: "Certificates",          icon: Award },
  ]},
  { label: "Learning Tools", items: [
    { id: "aitools",       label: "AI Learning Tools",     icon: Sparkles },
    { id: "notes",         label: "Notes & Bookmarks",     icon: StickyNote },
    { id: "discussion",    label: "Discussion Board",      icon: MessageSquare },
    { id: "goals",         label: "Goal Setting",          icon: Target },
    { id: "streak",        label: "Learning Streak",       icon: Flame },
    { id: "skillmap",      label: "Skill Map",             icon: Map },
    { id: "cpd",           label: "CPD Hours",             icon: Clock },
    { id: "reviews",       label: "Course Reviews",        icon: Star },
  ]},
  { label: "Resources", items: [
    { id: "resources",     label: "Resource Library",      icon: FileText },
    { id: "career",        label: "Career Hub",            icon: Target },
    { id: "calendar",      label: "Training Calendar",     icon: Calendar },
    { id: "announcements", label: "Announcements",         icon: Megaphone },
  ]},
  { label: "Payments", items: [
    { id: "payments",      label: "Payment History",       icon: CreditCard },
  ]},
  { label: "Support", items: [
    { id: "requests",      label: "My Requests",           icon: Inbox },
    { id: "documents",     label: "My Documents",          icon: FileText },
    { id: "support",       label: "Support Centre",        icon: LifeBuoy },
    { id: "referral",      label: "Refer a Friend",        icon: Gift },
    { id: "trainer",       label: "Trainer Information",   icon: UserCircle },
    { id: "profile",       label: "Profile Settings",      icon: Settings },
  ]},
];

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ activeTab, setActiveTab, user, collapsed, setCollapsed, onLogout }) {
  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-harvest flex items-center justify-center flex-shrink-0">
          <span className="text-white font-display font-bold text-base">S</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">Student Portal</p>
            <p className="text-white/40 text-[10px] tracking-wider">SOL Academy</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className={`text-white/30 hover:text-white transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}>
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 bg-white/5 rounded-xl flex items-center gap-2.5 border border-white/10">
          <div className="w-9 h-9 rounded-full bg-harvest/20 flex items-center justify-center flex-shrink-0">
            <span className="text-harvest font-bold text-sm">
              {(user?.full_name || user?.email || "S")[0].toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name || "Student"}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            {!collapsed && <p className="text-[10px] font-bold uppercase tracking-wider text-white/25 px-3 mb-1.5">{section.label}</p>}
            {section.items.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${
                  activeTab === item.id ? "bg-harvest text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {!collapsed && activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/10">
        <button onClick={onLogout}
          title={collapsed ? "Sign Out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user, logout }              = useAuth();
  const [enrollments, setEnrollments]     = useState([]);
  const [courses, setCourses]             = useState([]);
  const [quizAttempts, setQuizAttempts]   = useState([]);
  const [activeTab, setActiveTab]         = useState("overview");
  const [activeCourse, setActiveCourse]   = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [modules, setModules]             = useState([]);
  const [topics, setTopics]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [envsRes, crsRes, attemptsRes] = await Promise.all([
        apiClient.get('/enrollments'),                  // auto-filters to current user
        apiClient.get('/courses'),                      // public, returns published courses
        apiClient.get('/quizzes/attempts/mine'),        // correct endpoint
      ]);
      setEnrollments(envsRes.data?.data ?? []);
      setCourses(crsRes.data?.data ?? []);
      setQuizAttempts(attemptsRes.data?.data ?? []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    const courseId = course._id || course.id;
    const existing = enrollments.find(e => e.course_id === courseId);
    if (existing) { openCourse(existing); return; }
    try {
      const res = await apiClient.post('/student/enroll', { course_id: courseId });
      const enrollment = res.data?.data;
      await loadData();
      if (enrollment) openCourse(enrollment);
    } catch (err) {
      console.error('Enroll failed:', err);
    }
  };

  const openCourse = async (enrollment) => {
    setActiveCourse(enrollment);
    try {
      const courseId = enrollment.course_id;
      const [modsRes, topsRes] = await Promise.all([
        apiClient.get(`/modules?course_id=${courseId}`),
        apiClient.get(`/topics?course_id=${courseId}`),
      ]);
      const mods = modsRes.data?.data ?? [];
      const tops = topsRes.data?.data ?? [];
      setModules(mods);
      setTopics(tops);
      const lastId = enrollment.last_topic_id;
      setActiveTopicId(lastId || tops[0]?._id || tops[0]?.id);
    } catch (err) {
      console.error('Failed to load course content:', err);
      setModules([]);
      setTopics([]);
    }
  };

  const markTopicComplete = async (topicId, autoAdvance = true) => {
    const enrollmentId = activeCourse._id || activeCourse.id;
    try {
      const res = await apiClient.patch(`/enrollments/${enrollmentId}/progress`, {
        topic_id: topicId,
        completed: true,
      });
      const updated = res.data?.data?.enrollment ?? {};
      setActiveCourse(prev => ({ ...prev, ...updated }));
      setEnrollments(prev => prev.map(e =>
        (e._id || e.id) === enrollmentId ? { ...e, ...updated } : e
      ));
    } catch (err) {
      console.error('Failed to mark topic complete:', err);
    }
    if (autoAdvance) {
      const idx = topics.findIndex(t => (t._id || t.id) === topicId);
      if (idx < topics.length - 1) setActiveTopicId(topics[idx + 1]._id || topics[idx + 1].id);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-harvest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-display font-semibold text-base mb-1">SOL Training Academy</p>
          <p className="text-white/40 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Helper: compute days left for an enrollment
  const enrollmentDaysLeft = (enr) => {
    if (!enr.expiry_date) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const exp = new Date(enr.expiry_date); exp.setHours(0, 0, 0, 0);
    return Math.round((exp - today) / (1000 * 60 * 60 * 24));
  };

  const isExpired = (enr) => {
    if (!enr.expiry_date) return false;
    return enrollmentDaysLeft(enr) < 0;
  };

  /* ── Course Player ─────────────────────────────────────────────────────── */
  if (activeCourse) {
    // Block expired access
    if (isExpired(activeCourse) && activeCourse.status !== "completed") {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-slate-900 rounded-2xl p-10 max-w-md w-full text-center border border-red-500/30">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-white font-display font-bold text-2xl mb-2">Access Expired</h2>
            <p className="text-white/60 text-sm mb-6">
              Your access to <strong className="text-white">{activeCourse.course_title}</strong> expired on{" "}
              {new Date(activeCourse.expiry_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}.
              Please contact support to renew your enrollment.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setActiveCourse(null); setActiveTopicId(null); setModules([]); setTopics([]); }}
                className="flex-1 text-white border-white/20 hover:bg-white/10">← Back</Button>
              <Button onClick={() => { setActiveCourse(null); setActiveTopicId(null); setModules([]); setTopics([]); setActiveTab("support"); }}
                className="flex-1 bg-harvest text-white">Contact Support</Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <CoursePlayer
        enrollment={activeCourse}
        course={courses.find(c => c.id === activeCourse.course_id)}
        modules={modules}
        topics={topics}
        user={user}
        activeTopicId={activeTopicId}
        setActiveTopicId={setActiveTopicId}
        onMarkComplete={(topicId) => markTopicComplete(topicId, false)}
        onBack={() => { setActiveCourse(null); setActiveTopicId(null); setModules([]); setTopics([]); }}
      />
    );
  }

  /* ── Dashboard Shell ───────────────────────────────────────────────────── */
  const ml = sidebarCollapsed ? "ml-16" : "ml-64";


  const allNavItems = NAV_SECTIONS.flatMap(s => s.items);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={logout} />

      <main className={`${ml} transition-all duration-300 min-h-screen`}>
        {/* Top header bar */}
        <div className="bg-white border-b border-border/50 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-ink">
                {allNavItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate_mist mt-0.5">SOL Training Academy — Student Portal</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab("announcements")}
                className="relative w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center text-slate_mist hover:bg-slate-50 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">5</span>
              </button>
              <Button size="sm" onClick={() => setActiveTab("requests")} className="gap-2 text-xs bg-harvest text-white hover:bg-harvest/90 hidden sm:flex">
                <Plus className="w-3.5 h-3.5" /> New Request
              </Button>
              <Link to="/training-courses">
                <Button size="sm" variant="outline" className="gap-2 text-xs hidden sm:flex">
                  <BookOpen className="w-3.5 h-3.5" /> Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>

              {activeTab === "overview" && (
                <div className="space-y-5">
                  <StudentOverview user={user} enrollments={enrollments} courses={courses}
                    quizAttempts={quizAttempts} onOpenCourse={openCourse} setActiveTab={setActiveTab} />
                  <AchievementBadges enrollments={enrollments} quizAttempts={quizAttempts} />
                </div>
              )}
              {activeTab === "courses" && (
                <CoursesTab enrollments={enrollments} courses={courses}
                  onOpenCourse={openCourse} setActiveTab={setActiveTab}
                  user={user} onEnroll={handleEnroll}
                  enrollmentDaysLeft={enrollmentDaysLeft} />
              )}
              {activeTab === "progress" && (
                <StudentProgress enrollments={enrollments} courses={courses} />
              )}
              {activeTab === "assessments" && (
                <StudentAssessments user={user} enrollments={enrollments} quizAttempts={quizAttempts}
                  onOpenCourse={(enrollment, topicId) => {
                    openCourse(enrollment).then(() => {
                      if (topicId) setActiveTopicId(topicId);
                    });
                  }} />
              )}
              {activeTab === "quizzes" && (
                <StudentQuizzes quizAttempts={quizAttempts} enrollments={enrollments} courses={courses} />
              )}
              {activeTab === "certificates" && (
                <StudentCertificates enrollments={enrollments} user={user} />
              )}
              {activeTab === "resources"      && <TrainingResources />}
              {activeTab === "videos"         && <TrainingVideos enrollments={enrollments} />}
              {activeTab === "career"         && <CareerHub />}
              {activeTab === "calendar"       && <TrainingCalendar />}
              {activeTab === "announcements"  && <AnnouncementsSection />}
              {activeTab === "notes"          && <NotesAndBookmarks user={user} enrollments={enrollments} />}
              {activeTab === "discussion"     && <CourseDiscussion user={user} enrollments={enrollments} />}
              {activeTab === "goals"          && <GoalSetting user={user} enrollments={enrollments} />}
              {activeTab === "streak"         && <LearningStreak user={user} enrollments={enrollments} quizAttempts={quizAttempts} />}
              {activeTab === "skillmap"       && <SkillMap enrollments={enrollments} />}
              {activeTab === "cpd"            && <CPDHoursTracker enrollments={enrollments} courses={courses} />}
              {activeTab === "reviews"        && <CourseReviews user={user} enrollments={enrollments} />}
              {activeTab === "aitools"       && <AIToolsStudent enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
              {activeTab === "payments"       && <StudentPayments user={user} />}
              {activeTab === "requests"       && <StudentRequests user={user} />}
              {activeTab === "documents"      && <StudentDocumentUpload user={user} />}
              {activeTab === "support"        && <SupportCentre user={user} />}
              {activeTab === "referral"       && <ReferralHub user={user} />}
              {activeTab === "trainer"        && <TrainerInformation />}
              {activeTab === "profile"        && (
                <StudentProfile user={user} enrollments={enrollments} quizAttempts={quizAttempts} />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ── My Courses tab ────────────────────────────────────────────────────────── */
function CoursesTab({ enrollments, courses, onOpenCourse, setActiveTab, user, onEnroll, enrollmentDaysLeft }) {
  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const availableCourses  = courses.filter(c => !enrolledCourseIds.has(c.id));

  return (
    <div className="space-y-8">
      {/* Enrolled courses */}
      <div>
        <p className="text-sm font-semibold text-ink mb-3">
          My Enrolled Courses <span className="text-slate_mist font-normal">({enrollments.length})</span>
        </p>
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border/50 p-10 text-center shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate_mist text-sm">You haven't enrolled in any courses yet. See available courses below.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrollments.map((enr, i) => {
              const cfg    = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
              const course = courses.find(c => c.id === enr.course_id);
              const lastActivity = enr.updated_date
                ? new Date(enr.updated_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
                : "Not started";
          return (
            <motion.div key={enr.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">

              {/* Thumbnail strip */}
              <div className={`h-2 ${cfg.bar}`} />

              {/* Course thumbnail placeholder */}
              <div className="relative h-32 bg-gradient-to-br from-[#1a1a1a] to-[#2d1f00] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #D97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%)" }} />
                <div className="text-center z-10 px-4">
                  <BookOpen className="w-8 h-8 text-white/60 mx-auto mb-1" />
                  <p className="text-white/80 text-xs font-medium leading-tight">{enr.course_title}</p>
                </div>
                {enr.status === "completed" && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" /> Completed
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                  <ProgressRing progress={enr.progress_percent || 0} size={38} />
                </div>

                <h3 className="font-display font-semibold text-ink text-sm leading-snug mb-2 group-hover:text-harvest transition-colors">
                  {enr.course_title}
                </h3>

                {/* Progress bar */}
                <div className="mb-1">
                  <div className="flex justify-between text-[10px] text-slate_mist mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-ink">{enr.progress_percent || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${cfg.bar}`}
                      style={{ width: `${enr.progress_percent || 0}%` }} />
                  </div>
                </div>

                {/* Last activity */}
                <p className="text-[10px] text-slate_mist flex items-center gap-1 mb-1 mt-1">
                  <Clock className="w-3 h-3" /> Last activity: {lastActivity}
                </p>

                {/* Expiry badge */}
                {(() => {
                  if (!enr.expiry_date) return null;
                  const d = enrollmentDaysLeft(enr);
                  if (d < 0) return (
                    <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
                      ⛔ Expired — {new Date(enr.expiry_date).toLocaleDateString("en-AU")}
                    </p>
                  );
                  if (d <= 7) return (
                    <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
                      ⚠ {d} day{d !== 1 ? "s" : ""} remaining
                    </p>
                  );
                  if (d <= 30) return (
                    <p className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
                      ⏰ {d} days remaining
                    </p>
                  );
                  return (
                    <p className="text-[10px] text-slate_mist mb-2">
                      Expires: {new Date(enr.expiry_date).toLocaleDateString("en-AU")}
                    </p>
                  );
                })()}

                <div className="mt-auto">
                  {enr.status === "completed" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onOpenCourse(enr)}
                        className="flex-1 text-xs gap-1">
                        <Play className="w-3 h-3" /> Review
                      </Button>
                      <Button size="sm" onClick={() => setActiveTab("certificates")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                        <Award className="w-3 h-3" /> Certificate
                      </Button>
                    </div>
                  ) : enrollmentDaysLeft(enr) !== null && enrollmentDaysLeft(enr) < 0 ? (
                    <Button disabled className="w-full gap-2 text-sm">
                      ⛔ Access Expired
                    </Button>
                  ) : (
                    <Button onClick={() => onOpenCourse(enr)}
                      className="w-full bg-harvest text-white gap-2 text-sm">
                      <Play className="w-4 h-4" />
                      {(enr.progress_percent || 0) > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
          </div>
        )}
      </div>

      {/* Available courses to enrol */}
      {availableCourses.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-ink mb-3">
            Available Courses <span className="text-slate_mist font-normal">({availableCourses.length} new)</span>
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {availableCourses.map((course, i) => {
              const cfg = LEVEL_CONFIG[course.level] || LEVEL_CONFIG.level1;
              return (
                <motion.div key={course.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border-2 border-dashed border-border/60 overflow-hidden shadow-sm hover:shadow-md hover:border-harvest/40 transition-all flex flex-col">
                  <div className={`h-2 ${cfg.bar} opacity-40`} />
                  <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-white border border-border/50 text-slate_mist px-2 py-0.5 rounded-full">New</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit mb-2 ${cfg.pill}`}>{cfg.label}</span>
                    <h3 className="font-display font-semibold text-ink text-sm leading-snug mb-1">{course.title}</h3>
                    {course.description && <p className="text-xs text-slate_mist mb-3 line-clamp-2">{course.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate_mist mb-4">
                      {course.duration && <span>⏱ {course.duration}</span>}
                      {course.price > 0 && <span className="font-semibold text-harvest">${course.price}</span>}
                    </div>
                    <div className="mt-auto">
                      <Button onClick={() => onEnroll(course)}
                        className="w-full bg-harvest text-white gap-2 text-sm">
                        Enrol Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}