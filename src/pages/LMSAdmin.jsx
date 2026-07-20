import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import apiClient from "@/api/apiClient";
import {
  BookOpen, Users, BarChart3, Settings, Menu, X, Award, Video,
  HelpCircle, LogOut, TrendingUp, Eye, RefreshCw, Home,
  Layers, FileText, Megaphone, CreditCard, ChevronRight, ClipboardList, LifeBuoy,
  Gift, DollarSign, Tag, Clock, Download, Users2, Sparkles, Inbox, Shield, Lock,
  Trophy, MessageSquare, CheckCircle2, ShieldCheck, Briefcase, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { allowedPageIdsFor } from "@/lib/permissions";
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
import AdminAdminsManager from "@/components/lms/admin/AdminAdminsManager";
import AIToolsAdmin from "@/pages/AIToolsAdmin";
import AdminLeaderboard from "@/components/lms/admin/AdminLeaderboard";
import AdminDiscussionModeration from "@/components/lms/admin/AdminDiscussionModeration";
import AdminDocumentVerification from "@/components/lms/admin/AdminDocumentVerification";
import AdminNDISIntake from "@/components/lms/admin/AdminNDISIntake";
import NotificationCenter from "@/components/lms/NotificationCenter";

const NAV_SECTIONS = [
  { label: "Overview",  items: [{ id: "dashboard",   label: "Dashboard",            icon: Home }] },
  { label: "Content",   items: [
    { id: "courses",       label: "Course Management",  icon: BookOpen },
    { id: "modules",       label: "Module Management",  icon: Layers },
    { id: "videos",        label: "Video Library",      icon: Video },
    { id: "quizzes",       label: "Quiz Management",    icon: HelpCircle },
    { id: "assessments",   label: "Assignments",        icon: ClipboardList },
    { id: "gradebook",     label: "Gradebook",          icon: Users2 },
  ]},
  { label: "Students",  items: [
    { id: "students",      label: "Student Management", icon: Users },
    { id: "expiry",        label: "Access & Expiry",    icon: Clock },
    { id: "certificates",  label: "Certificates",       icon: Award },
  ]},
  { label: "AI Tools",  items: [{ id: "aitools",   label: "AI Admin Tools",    icon: Sparkles }] },
  { label: "Team",      items: [
    { id: "admins",     label: "Admin Accounts",    icon: Shield },
    { id: "team",       label: "Team & Files",      icon: Users2 },
  ]},
  { label: "Platform",  items: [
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
    { id: "ndis_intake",   label: "NDIS Intake Review", icon: ClipboardList },
    { id: "settings",      label: "Settings",           icon: Settings },
  ]},
];

// Flat id → label lookup used by the welcome popup
const ALL_PAGE_LABELS = Object.fromEntries(
  NAV_SECTIONS.flatMap(s => s.items).map(item => [item.id, { label: item.label, icon: item.icon }])
);

// ── Team Member Welcome Popup ─────────────────────────────────────────────────
function TeamWelcomePopup({ user, allowedPageIds, onDismiss }) {
  // Don't count baseline-only (dashboard) as a "real" permission
  const grantedPages = (allowedPageIds || []).filter(id => id !== "dashboard");
  const firstName = (user?.full_name || "there").split(" ")[0];
  const jobRole = user?.job_role || user?.job_title || "Team Member";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header band */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 relative overflow-hidden">
          {/* Decorative ring */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-harvest/10 border border-harvest/20" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 border border-white/10" />

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-harvest flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-display font-bold text-xl">
                {firstName[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-0.5">Welcome back</p>
              <h2 className="text-white font-display font-bold text-xl leading-tight">{firstName}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Briefcase className="w-3 h-3 text-harvest" />
                <span className="text-harvest text-xs font-semibold">{jobRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Organisation badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-none">You are a team member of</p>
              <p className="text-sm font-bold text-ink mt-0.5">SOL Training Academy</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
          </div>

          {/* Notifications reminder */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Your notifications are <span className="font-semibold">live</span> — check the bell icon in the top bar to stay up to date on student activity and platform events.
            </p>
          </div>

          {/* Granted modules */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {grantedPages.length > 0
                ? `You have access to ${grantedPages.length} module${grantedPages.length !== 1 ? "s" : ""}`
                : "Dashboard access only"}
            </p>

            {grantedPages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                {grantedPages.map(id => {
                  const meta = ALL_PAGE_LABELS[id];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-2">
                      <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs font-medium text-emerald-800 leading-tight truncate">{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                Your administrator hasn't granted any module access yet. Contact them to request permissions.
              </p>
            )}
          </div>

          {/* Restriction note */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Modules not listed above are hidden from your sidebar. Contact your administrator to update your access.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onDismiss}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl py-3 transition-colors"
          >
            Got it — Take me to the dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed, allowedPageIds, onLogout }) {
  const isAllowed = (id) => allowedPageIds === null || allowedPageIds.includes(id);
  const visibleSections = NAV_SECTIONS
    .map(s => ({ ...s, items: s.items.filter(item => isAllowed(item.id)) }))
    .filter(s => s.items.length > 0);

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
        <button onClick={() => setCollapsed(!collapsed)}
          className={`text-white/30 hover:text-white transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}>
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {visibleSections.map(section => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/25 px-3 mb-1.5">
                {section.label}
              </p>
            )}
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
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default function LMSAdmin() {
  const { user, logout } = useAuth();

  const [activeTab,      setActiveTab]      = useState("dashboard");
  const [courses,        setCourses]        = useState([]);
  const [enrollments,    setEnrollments]    = useState([]);
  const [quizAttempts,   setQuizAttempts]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [collapsed,      setCollapsed]      = useState(false);
  // null = full admin access, array = restricted to these page IDs
  const [allowedPageIds, setAllowedPageIds] = useState(null);
  // Show the team-member welcome popup once per session
  const [showWelcome,    setShowWelcome]    = useState(false);

  const load = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [crsRes, envsRes, attemptsRes] = await Promise.all([
        apiClient.get('/courses?all=true&limit=200'),          // admin sees all courses
        apiClient.get('/enrollments?limit=500'),               // all enrollments
        apiClient.get('/quizzes/attempts?limit=500'),          // all quiz attempts
      ]);
      setCourses(Array.isArray(crsRes.data?.data) ? crsRes.data.data : []);
      setEnrollments(Array.isArray(envsRes.data?.data) ? envsRes.data.data : []);
      setQuizAttempts(Array.isArray(attemptsRes.data?.data) ? attemptsRes.data.data : []);

      // Apply page-permission restrictions for team_member role.
      // `allowedPageIdsFor` returns null for admins (unrestricted) and, for team
      // members, the baseline pages + their granted page_permissions — so a
      // member with ZERO permissions is correctly restricted to the dashboard
      // (previously an empty list left allowedPageIds=null, i.e. full access).
      if (user && user.role === 'team_member') {
        // Suspended team members shouldn't reach the panel at all.
        if (user.is_active === false) {
          logout();
          return;
        }
        const allowed = allowedPageIdsFor(user); // string[] for team_member
        setAllowedPageIds(allowed);
        setActiveTab(prev => allowed.includes(prev) ? prev : (allowed[0] || 'dashboard'));

        // Show the welcome popup once per browser session
        const sessionKey = `team_welcome_shown_${user._id || user.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          setShowWelcome(true);
        }
      }
    } catch (err) {
      console.error('Failed to load LMS Admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(true); }, []);

  const allTabs = NAV_SECTIONS.flatMap(s => s.items);
  const activeTabLabel = allTabs.find(t => t.id === activeTab)?.label || "";

  const stats = [
    { label: "Total Courses",  value: courses.length,                                               icon: BookOpen,   color: "text-blue-600 bg-blue-50" },
    { label: "Published",      value: courses.filter(c => c.is_published).length,                   icon: Eye,        color: "text-green-600 bg-green-50" },
    { label: "Total Students", value: [...new Set(enrollments.map(e => e.user_id))].length,         icon: Users,      color: "text-purple-600 bg-purple-50" },
    { label: "Completions",    value: enrollments.filter(e => e.status === "completed").length,      icon: Award,      color: "text-amber-600 bg-amber-50" },
    { label: "Quiz Attempts",  value: quizAttempts.length,                                          icon: HelpCircle, color: "text-rose-600 bg-rose-50" },
    {
      label: "Pass Rate",
      value: quizAttempts.length > 0
        ? `${Math.round((quizAttempts.filter(q => q.passed).length / quizAttempts.length) * 100)}%`
        : "—",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-harvest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-display font-semibold text-base mb-1">SOL Training Academy</p>
          <p className="text-white/40 text-sm">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Team member welcome popup — shown once per session */}
      <AnimatePresence>
        {showWelcome && user?.role === 'team_member' && (
          <TeamWelcomePopup
            user={user}
            allowedPageIds={allowedPageIds}
            onDismiss={() => {
              const sessionKey = `team_welcome_shown_${user._id || user.id}`;
              sessionStorage.setItem(sessionKey, "1");
              setShowWelcome(false);
            }}
          />
        )}
      </AnimatePresence>

      <AdminSidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        collapsed={collapsed} setCollapsed={setCollapsed}
        allowedPageIds={allowedPageIds} onLogout={logout}
      />

      <main className={`${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 min-h-screen`}>
        {/* Top header */}
        <div className="bg-white border-b border-border/50 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-ink">{activeTabLabel}</h1>
              <p className="text-xs text-slate_mist mt-0.5">SOL Academy — LMS Admin Panel</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter onSelectTab={setActiveTab} className="" />
              <Button onClick={() => load()} variant="outline" size="sm" className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats bar — shown on all tabs except dashboard */}
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

          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

              {/* Access Denied guard for restricted team members */}
              {allowedPageIds !== null && !allowedPageIds.includes(activeTab) ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mb-5">
                    <Lock className="w-9 h-9 text-red-400" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-ink mb-2">Access Denied</h2>
                  <p className="text-slate-500 text-sm max-w-sm">
                    You don't have permission to view this page. Contact your administrator to request access.
                  </p>
                </div>
              ) : (
                <>
                  {activeTab === "dashboard"    && <AdminOverview courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} setActiveTab={setActiveTab} />}
                  {activeTab === "courses"      && <AdminCourseManager courses={courses} onRefresh={load} filterType="courses" />}
                  {activeTab === "modules"      && <AdminModuleManager courses={courses} />}
                  {activeTab === "videos"       && <AdminVideoLibrary courses={courses} />}
                  {activeTab === "quizzes"      && <AdminQuizManager courses={courses} />}
                  {activeTab === "assessments"  && <AdminAssessmentManager courses={courses} />}
                  {activeTab === "students"     && <AdminStudentManager enrollments={enrollments} courses={courses} onRefresh={load} />}
                  {activeTab === "certificates" && <AdminCertificates enrollments={enrollments} courses={courses} />}
                  {activeTab === "analytics"    && <AdminAnalytics courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} />}
                  {activeTab === "resources"    && <AdminResources />}
                  {activeTab === "announcements"&& <AdminAnnouncements />}
                  {activeTab === "payments"     && <AdminPayments enrollments={enrollments} courses={courses} />}
                  {activeTab === "revenue"      && <AdminRevenueDashboard courses={courses} />}
                  {activeTab === "coupons"      && <AdminCoupons courses={courses} />}
                  {activeTab === "waitlist"     && <AdminWaitlist courses={courses} />}
                  {activeTab === "referrals"    && <AdminReferralReport />}
                  {activeTab === "export"       && <AdminExportCSV courses={courses} />}
                  {activeTab === "gradebook"    && <AdminGradebook courses={courses} />}
                  {activeTab === "expiry"       && <AdminEnrollmentExpiry />}
                  {activeTab === "requests"     && <AdminRequestsManager />}
                  {activeTab === "support"      && <AdminSupportManager />}
                  {activeTab === "settings"     && <AdminSettings />}
                  {activeTab === "aitools"      && <AIToolsAdmin enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
                  {activeTab === "team"         && <AdminTeamManager />}
                  {activeTab === "admins"       && <AdminAdminsManager />}
                  {activeTab === "leaderboard"  && <AdminLeaderboard courses={courses} />}
                  {activeTab === "discussions"  && <AdminDiscussionModeration courses={courses} />}
                  {activeTab === "documents"    && <AdminDocumentVerification />}
                  {activeTab === "ndis_intake"  && <AdminNDISIntake />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

