import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, Users, BarChart3, Settings, Menu, X, Award, Video,
  HelpCircle, LogOut, TrendingUp, Eye, RefreshCw, Home,
  Layers, FileText, Megaphone, CreditCard, ChevronRight, ClipboardList, LifeBuoy,
  Gift, DollarSign, Tag, Clock, Download, Users2, Sparkles, Inbox, Shield, Lock,
  Trophy, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdminCourseManager from "@/components/lms/admin/AdminCourseManager";
import AdminStudentManager from "@/components/lms/admin/AdminStudentManager";
import AdminAnalytics from "@/components/lms/admin/AdminAnalytics";
import AdminCertificates from "@/components/lms/admin/AdminCertificates";
import AdminOverview from "@/components/lms/admin/AdminOverview";
import AdminResources from "@/components/lms/admin/AdminResources";
import AdminAnnouncements from "@/components/lms/admin/AdminAnnouncements";
import AdminPayments from "@/components/lms/admin/AdminPayments";
import AdminSettings from "@/components/lms/admin/AdminSettings";
import AdminModuleManager from "@/components/lms/admin/AdminModuleManager";
import AdminVideoLibrary from "@/components/lms/admin/AdminVideoLibrary";
import AdminQuizManager from "@/components/lms/admin/AdminQuizManager";
import AdminAssessmentManager from "@/components/lms/admin/AdminAssessmentManager";
import AdminSupportManager from "@/components/lms/admin/AdminSupportManager";
import AdminReferralReport from "@/components/lms/admin/AdminReferralReport";
import AdminRevenueDashboard from "@/components/lms/admin/AdminRevenueDashboard";
import AdminCoupons from "@/components/lms/admin/AdminCoupons";
import AdminWaitlist from "@/components/lms/admin/AdminWaitlist";
import AdminExportCSV from "@/components/lms/admin/AdminExportCSV";
import AdminGradebook from "@/components/lms/admin/AdminGradebook";
import AdminEnrollmentExpiry from "@/components/lms/admin/AdminEnrollmentExpiry";
import AdminRequestsManager from "@/components/lms/admin/AdminRequestsManager";
import AdminTeamManager from "@/components/lms/admin/AdminTeamManager";
import AIToolsAdmin from "@/pages/AIToolsAdmin";
import AdminLeaderboard from "@/components/lms/admin/AdminLeaderboard";
import AdminDiscussionModeration from "@/components/lms/admin/AdminDiscussionModeration";
import AdminDocumentVerification from "@/components/lms/admin/AdminDocumentVerification";
import AdminNDISIntake from "@/components/lms/admin/AdminNDISIntake";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: Home },
    ]
  },
  {
    label: "Content",
    items: [
      { id: "courses",  label: "Course Management", icon: BookOpen },
      { id: "modules",  label: "Module Management", icon: Layers },
      { id: "videos",   label: "Video Library",     icon: Video },
      { id: "quizzes",  label: "Quiz Management",   icon: HelpCircle },
      { id: "assessments", label: "Assessments",      icon: ClipboardList },
      { id: "gradebook",   label: "Gradebook",         icon: Users2 },
    ]
  },
  {
    label: "Students",
    items: [
      { id: "students",     label: "Student Management", icon: Users },
      { id: "expiry",       label: "Access & Expiry",    icon: Clock },
      { id: "certificates", label: "Certificates",       icon: Award },
    ]
  },
  {
    label: "AI Tools",
    items: [
      { id: "aitools", label: "AI Admin Tools", icon: Sparkles },
    ]
  },
  {
    label: "Team",
    items: [
      { id: "team", label: "Team & Files", icon: Shield },
    ]
  },
  {
    label: "Platform",
    items: [
      { id: "resources",     label: "Training Resources", icon: FileText },
      { id: "announcements", label: "Announcements",      icon: Megaphone },
      { id: "analytics",     label: "Reports & Analytics",icon: BarChart3 },
      { id: "revenue",       label: "Revenue Dashboard",  icon: DollarSign },
      { id: "payments",      label: "Payments",           icon: CreditCard },
      { id: "coupons",       label: "Coupons & Discounts",icon: Tag },
      { id: "waitlist",      label: "Waitlist",           icon: Clock },
      { id: "referrals",     label: "Referral Report",    icon: Gift },
      { id: "export",        label: "Export CSV",         icon: Download },
      { id: "requests",      label: "Student Requests",   icon: Inbox },
      { id: "support",       label: "Support Tickets",    icon: LifeBuoy },
      { id: "leaderboard",   label: "Leaderboard",        icon: Trophy },
      { id: "discussions",   label: "Discussion Moderation", icon: MessageSquare },
      { id: "documents",     label: "Document Verification", icon: FileText },
      { id: "ndis_intake",   label: "NDIS Intake Review",  icon: ClipboardList },
      { id: "settings",      label: "Settings",           icon: Settings },
    ]
  }
];

function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed, allowedPageIds }) {
  // If allowedPageIds is null → full admin access (no restrictions)
  const isAllowed = (id) => allowedPageIds === null || allowedPageIds.includes(id);

  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => isAllowed(item.id))
  })).filter(section => section.items.length > 0);

  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-harvest flex items-center justify-center flex-shrink-0">
          <span className="text-white font-display font-bold text-base">S</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">LMS Admin</p>
            <p className="text-white/40 text-[10px] tracking-wider">SOL Academy</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className={`text-white/30 hover:text-white transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}>
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {visibleSections.map(section => (
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

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/student-dashboard">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Eye className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Student View</span>}
          </button>
        </Link>
        <button onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default function LMSAdmin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  // null = full admin access, array = restricted to these page ids
  const [allowedPageIds, setAllowedPageIds] = useState(null);

  const load = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const [crs, envs, attempts, me] = await Promise.all([
      base44.entities.Course.list("sort_order"),
      base44.entities.CourseEnrollment.list("-created_date", 200),
      base44.entities.QuizAttempt.list("-created_date", 200),
      base44.auth.me(),
    ]);
    setCourses(crs);
    setEnrollments(envs);
    setQuizAttempts(attempts);

    // Check if current user is a restricted TeamMember
    if (me && me.role !== "admin") {
      const members = await base44.entities.TeamMember.filter({ email: me.email });
      const member = members[0];
      if (member && member.status && !["active"].includes(member.status)) {
        // Blocked/suspended — log out
        base44.auth.logout();
        return;
      }
      if (member && Array.isArray(member.page_permissions) && member.page_permissions.length > 0) {
        setAllowedPageIds(member.page_permissions);
        // Ensure activeTab is allowed
        setActiveTab(prev => member.page_permissions.includes(prev) ? prev : (member.page_permissions[0] || "dashboard"));
      }
    }

    setLoading(false);
  };

  useEffect(() => { load(true); }, []);

  const allTabs = NAV_SECTIONS.flatMap(s => s.items);
  const activeTabLabel = allTabs.find(t => t.id === activeTab)?.label || "";

  const stats = [
    { label: "Total Courses",  value: courses.length,                                                    icon: BookOpen,   color: "text-blue-600 bg-blue-50" },
    { label: "Published",      value: courses.filter(c => c.is_published).length,                        icon: Eye,        color: "text-green-600 bg-green-50" },
    { label: "Total Students", value: [...new Set(enrollments.map(e => e.user_id))].length,              icon: Users,      color: "text-purple-600 bg-purple-50" },
    { label: "Completions",    value: enrollments.filter(e => e.status === "completed").length,           icon: Award,      color: "text-amber-600 bg-amber-50" },
    { label: "Quiz Attempts",  value: quizAttempts.length,                                               icon: HelpCircle, color: "text-rose-600 bg-rose-50" },
    { label: "Pass Rate",      value: quizAttempts.length > 0 ? `${Math.round((quizAttempts.filter(q => q.passed).length / quizAttempts.length) * 100)}%` : "—", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} allowedPageIds={allowedPageIds} />

      <main className={`${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 min-h-screen`}>
        {/* Top header */}
        <div className="bg-white border-b border-border/50 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-ink">{activeTabLabel}</h1>
              <p className="text-xs text-slate_mist mt-0.5">SOL Academy — LMS Admin Panel</p>
            </div>
            <Button onClick={load} variant="outline" size="sm" className="gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats bar — shown on all tabs except dashboard (which has its own) */}
          {activeTab !== "dashboard" && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              {stats.map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg text-ink leading-none">{s.value}</p>
                    <p className="text-[10px] text-slate_mist leading-tight mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Access Denied guard for restricted team members */}
              {allowedPageIds !== null && !allowedPageIds.includes(activeTab) ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mb-5">
                    <Lock className="w-9 h-9 text-red-400" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-ink mb-2">Access Denied</h2>
                  <p className="text-slate-500 text-sm max-w-sm">You don't have permission to view this page. Please contact your administrator to request access.</p>
                </div>
              ) : null}
              {(allowedPageIds === null || allowedPageIds.includes(activeTab)) && (<>
              {activeTab === "dashboard" && (
                <AdminOverview courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} setActiveTab={setActiveTab} />
              )}
              {activeTab === "courses" && (
                <AdminCourseManager courses={courses} onRefresh={load} filterType="courses" />
              )}
              {activeTab === "modules" && (
                <AdminModuleManager courses={courses} />
              )}
              {activeTab === "videos" && (
                <AdminVideoLibrary courses={courses} />
              )}
              {activeTab === "quizzes" && (
                <AdminQuizManager courses={courses} />
              )}
              {activeTab === "assessments" && (
                <AdminAssessmentManager courses={courses} />
              )}
              {activeTab === "students" && (
                <AdminStudentManager enrollments={enrollments} courses={courses} onRefresh={load} />
              )}
              {activeTab === "certificates" && (
                <AdminCertificates enrollments={enrollments} courses={courses} />
              )}
              {activeTab === "analytics" && (
                <AdminAnalytics courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} />
              )}
              {activeTab === "resources"     && <AdminResources />}
              {activeTab === "announcements" && <AdminAnnouncements />}
              {activeTab === "payments"      && <AdminPayments enrollments={enrollments} courses={courses} />}
              {activeTab === "revenue"       && <AdminRevenueDashboard courses={courses} />}
              {activeTab === "coupons"       && <AdminCoupons courses={courses} />}
              {activeTab === "waitlist"      && <AdminWaitlist courses={courses} />}
              {activeTab === "referrals"     && <AdminReferralReport />}
              {activeTab === "export"        && <AdminExportCSV courses={courses} />}
              {activeTab === "gradebook"     && <AdminGradebook courses={courses} />}
              {activeTab === "expiry"        && <AdminEnrollmentExpiry />}
              {activeTab === "requests"      && <AdminRequestsManager />}
              {activeTab === "support"       && <AdminSupportManager />}
              {activeTab === "settings"      && <AdminSettings />}
              {activeTab === "aitools"       && <AIToolsAdmin enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
              {activeTab === "team"          && <AdminTeamManager />}
              {activeTab === "leaderboard"   && <AdminLeaderboard courses={courses} />}
              {activeTab === "discussions"   && <AdminDiscussionModeration courses={courses} />}
              {activeTab === "documents"     && <AdminDocumentVerification />}
              {activeTab === "ndis_intake"   && <AdminNDISIntake />}
              </>)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}