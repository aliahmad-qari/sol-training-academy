import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  BookOpen,
  Award,
  Target,
  Clock,
  Edit2,
  Camera,
  Shield,
  CheckCircle2,
  AlertCircle,
  Play,
  ExternalLink,
  ClipboardList,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import apiClient from "@/api/apiClient";
import { uploadFile } from "@/api/uploadClient";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { quizAttemptPercent } from "@/lib/quizScores";

const LEVEL_COLORS = {
  level1: "bg-harvest/10 text-harvest border-harvest/30",
  level2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  level3: "bg-amber-50 text-amber-700 border-amber-200",
};

const ASSIGNMENT_STATUS_STYLES = {
  graded: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  under_review: "bg-blue-100 text-blue-700 border-blue-200",
  resubmit_requested: "bg-rose-100 text-rose-700 border-rose-200",
};

const safeDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function StudentProfile({ user, enrollments = [], quizAttempts = [], onOpenCourse, setActiveTab }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingLearningData, setLoadingLearningData] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    setPhone(user?.phone || "");
  }, [user?.phone]);

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || "");
  }, [user?.avatar_url]);

  useEffect(() => {
    let active = true;

    const loadLearningData = async () => {
      if (!user?.id) {
        setAssignments([]);
        setSubmissions([]);
        return;
      }

      setLoadingLearningData(true);
      try {
        const enrolledCourseIds = Array.from(
          new Set(
            enrollments
              .map((enrollment) => String(enrollment.course_id || enrollment.courseId || ""))
              .filter(Boolean)
          )
        );

        const [allAssignments, mySubmissions] = await Promise.all([
          base44.entities.Assignment.filter({ is_published: true }).catch(() => []),
          base44.entities.AssignmentSubmission.filter({ user_id: user.id }).catch(() => []),
        ]);

        if (!active) return;

        const visibleAssignments = Array.isArray(allAssignments)
          ? allAssignments.filter((assignment) => {
              if (!enrolledCourseIds.length) return true;
              return enrolledCourseIds.includes(String(assignment.course_id || assignment.courseId || ""));
            })
          : [];

        setAssignments(visibleAssignments);
        setSubmissions(Array.isArray(mySubmissions) ? mySubmissions : []);
      } catch {
        if (active) {
          setAssignments([]);
          setSubmissions([]);
        }
      } finally {
        if (active) setLoadingLearningData(false);
      }
    };

    loadLearningData();

    return () => {
      active = false;
    };
  }, [user?.id, enrollments]);

  const completed = enrollments.filter((e) => e.status === "completed").length;
  const certs = enrollments.filter((e) => e.certificate_issued).length;
  const passedQ = quizAttempts.filter((q) => q.passed).length;
  const submittedAssignmentsCount = submissions.length;

  const scoredPercents = quizAttempts
    .map(quizAttemptPercent)
    .filter((percent) => percent !== null);

  const avgQuizGrade = scoredPercents.length > 0
    ? Math.round(scoredPercents.reduce((sum, percent) => sum + percent, 0) / scoredPercents.length)
    : null;

  const featuredEnrollment = useMemo(() => {
    if (!enrollments.length) return null;

    const ranked = [...enrollments].sort((a, b) => {
      const aActive = a.status === "active" || Number(a.progress_percent || 0) > 0;
      const bActive = b.status === "active" || Number(b.progress_percent || 0) > 0;
      if (aActive !== bActive) return aActive ? -1 : 1;

      const aProgress = Number(a.progress_percent || 0);
      const bProgress = Number(b.progress_percent || 0);
      if (bProgress !== aProgress) return bProgress - aProgress;

      const aDate = new Date(a.created_date || a.createdAt || 0).getTime();
      const bDate = new Date(b.created_date || b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return ranked[0] || enrollments[0];
  }, [enrollments]);

  const featuredProgress = featuredEnrollment
    ? Math.min(
        100,
        Math.max(Number(featuredEnrollment.progress_percent || 0), featuredEnrollment.status === "completed" ? 100 : 0)
      )
    : 0;

  const certificateEnrollments = useMemo(
    () => enrollments.filter((enrollment) => enrollment.certificate_issued),
    [enrollments]
  );

  const assignmentRows = useMemo(() => {
    const submissionForAssignment = (assignment) => {
      const assignmentId = String(assignment.id || assignment._id || assignment.assignment_id || "");
      return submissions.find((submission) => {
        const submissionAssignmentId = String(submission.assignment_id || "");
        const titleMatch =
          assignment.title &&
          submission.assignment_title &&
          assignment.title.trim().toLowerCase() === submission.assignment_title.trim().toLowerCase();

        return (assignmentId && submissionAssignmentId && assignmentId === submissionAssignmentId) || titleMatch;
      });
    };

    const fromAssignments = assignments.map((assignment) => {
      const submission = submissionForAssignment(assignment);
      const statusKey = submission
        ? submission.status === "graded"
          ? "graded"
          : submission.status === "under_review"
            ? "under_review"
            : submission.status === "resubmit_requested"
              ? "resubmit_requested"
              : "pending"
        : "pending";

      return {
        id: assignment.id || assignment._id || assignment.title,
        name: assignment.title || assignment.assignment_title || "Assignment",
        submittedAt: submission ? safeDate(submission.created_date || submission.createdAt || submission.updatedAt) : "—",
        statusKey,
        statusLabel: submission
          ? submission.status === "graded"
            ? "Graded"
            : submission.status === "under_review"
              ? "Under Review"
              : submission.status === "resubmit_requested"
                ? "Resubmit Requested"
                : "Pending"
          : "Pending",
      };
    });

    if (fromAssignments.length > 0) {
      return fromAssignments.slice(0, 5);
    }

    return submissions.slice(0, 5).map((submission) => ({
      id: submission.id || submission._id || `${submission.assignment_title || "assignment"}-${submission.created_date || submission.createdAt || "row"}`,
      name: submission.assignment_title || "Assignment",
      submittedAt: safeDate(submission.created_date || submission.createdAt || submission.updatedAt),
      statusKey: submission.status === "graded"
        ? "graded"
        : submission.status === "under_review"
          ? "under_review"
          : submission.status === "resubmit_requested"
            ? "resubmit_requested"
            : "pending",
      statusLabel: submission.status === "graded"
        ? "Graded"
        : submission.status === "under_review"
          ? "Under Review"
          : submission.status === "resubmit_requested"
            ? "Resubmit Requested"
            : "Pending",
    }));
  }, [assignments, submissions]);

  const initials = useMemo(() => {
    return (user?.full_name || user?.email || "S")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.email, user?.full_name]);

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Please choose a file under 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const { file_url } = await uploadFile({ file, kind: "avatar" });
      await base44.auth.updateMe({ avatar_url: file_url });
      setAvatarUrl(file_url);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone });
      toast.success("Profile updated successfully.");
      setEditMode(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const openFeaturedCourse = async () => {
    if (!featuredEnrollment) return;
    if (onOpenCourse) {
      await onOpenCourse(featuredEnrollment);
      setActiveTab?.("courses");
      return;
    }
    toast.info("Open this course from the student dashboard to resume learning.");
  };

  const handleResumeLearning = () => openFeaturedCourse();
  const handleViewCurriculum = () => openFeaturedCourse();

  const openPasswordModal = () => {
    setPasswordOpen(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setPasswordOpen(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await apiClient.patch("/auth/change-password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      toast.success("Password changed successfully.");
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const statCards = [
    { label: "Courses Enrolled", value: enrollments.length, icon: BookOpen, color: "text-harvest bg-harvest/10" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Certificates", value: certs, icon: Award, color: "text-blue-600 bg-blue-50" },
    { label: "Quizzes Passed", value: passedQ, icon: Target, color: "text-amber-600 bg-amber-50" },
    { label: "Assignments", value: submittedAssignmentsCount, icon: ClipboardList, color: "text-sky-600 bg-sky-50" },
    { label: "Avg. Quiz Grade", value: avgQuizGrade !== null ? `${avgQuizGrade}%` : "N/A", icon: FileText, color: "text-violet-600 bg-violet-50" },
  ];
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="relative h-24 bg-gradient-to-r from-harvest via-amber-500 to-amber-600 sm:h-28">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }}
          />
        </div>

        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-14 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <div className="relative self-start sm:self-auto">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-harvest to-amber-600 shadow-lg sm:h-24 sm:w-24">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user?.full_name || "Profile"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl font-bold text-white sm:text-3xl">{initials}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
                <button
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-harvest bg-white text-harvest shadow-md transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                    {user?.full_name || "Student"}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active Student
                  </span>
                </div>
                <p className="break-all text-sm text-slate-500">{user?.email}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Verified account
                </div>
              </div>
            </div>

            {!editMode ? (
              <Button
                size="sm"
                type="button"
                onClick={() => setEditMode(true)}
                className="w-full gap-2 bg-harvest text-white hover:bg-harvest/90 sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button size="sm" type="button" variant="outline" onClick={() => setEditMode(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full bg-harvest text-white hover:bg-harvest/90 sm:w-auto"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-slate-200 p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4">
            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-xl font-bold text-ink sm:text-2xl">{stat.value}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-600 sm:text-xs">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Account Information */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <User className="h-5 w-5 text-harvest" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Account Information</h3>
            <p className="text-sm text-slate-500">Your contact and membership details</p>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-ink">
                <User className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="min-w-0 truncate">{user?.full_name || "Not provided"}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Contact support to change</p>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="min-w-0 truncate">{user?.email || "Not provided"}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Verified and secure</p>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</Label>
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+61 4XX XXX XXX"
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-11 w-full"
                  />
                  <p className="text-xs text-slate-400">Used for secure account contact and support updates.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{user?.phone || phone || ""}</p>
                      {!user?.phone && !phone && (
                        <p className="text-xs text-slate-400">Add a phone number for secure account contact.</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    {user?.phone || phone ? "Update Phone" : "Add Phone"}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Account Type</Label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <Shield className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="capitalize">{user?.role === "admin" ? "Instructor" : "Student"}</span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <p className="text-sm text-blue-800">
                To update your name or email,{' '}
                <a href="mailto:info@solbusinessconsultant.com.au" className="font-semibold hover:underline">
                  contact support
                </a>
              </p>
            </div>
          )}
        </div>
      </Card>
      {/* Featured Course Card */}
      <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 shadow-sm">
        <div className="border-b border-amber-100 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                  Current Course
                </span>
                {featuredEnrollment && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {featuredEnrollment.status === "completed" ? "Completed" : `${featuredProgress}% in progress`}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
                {featuredEnrollment?.course_title || "NDIS Support Coordinator Training"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                {featuredEnrollment
                  ? featuredEnrollment.status === "completed"
                    ? "You have completed this course. Review the curriculum or move to your certificates."
                    : "Continue from where you left off and keep building momentum in your training path."
                  : "No active course found yet. Browse training options to start your learning journey."}
              </p>
            </div>

            {featuredEnrollment ? (
              <div className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm lg:max-w-[220px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Progress</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-3xl font-bold text-ink">{featuredProgress}%</span>
                  <span className="pb-1 text-xs text-slate-400">complete</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-harvest transition-all"
                    style={{ width: `${featuredProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {featuredEnrollment ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" onClick={handleResumeLearning} className="w-full gap-2 bg-harvest text-white hover:bg-harvest/90">
                <Play className="h-4 w-4" />
                Resume Learning
              </Button>
              <Button type="button" variant="outline" onClick={handleViewCurriculum} className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                View Curriculum
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full gap-2 bg-harvest text-white hover:bg-harvest/90 sm:w-auto">
              <Link to="/training-courses">
                <BookOpen className="h-4 w-4" />
                Browse Training Courses
              </Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Learning History */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <Clock className="h-5 w-5 text-harvest" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Enrollment History</h3>
            <p className="text-sm text-slate-500">Track your completed and in-progress courses</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 text-center sm:p-10">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-slate-500">No course enrollments yet. Start learning today!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="px-4 py-4 transition-colors hover:bg-slate-50 sm:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-ink">{enrollment.course_title}</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Enrolled {enrollment.created_date ? safeDate(enrollment.created_date) : "—"}
                      {enrollment.completed_date && ` • Completed ${safeDate(enrollment.completed_date)}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${LEVEL_COLORS[enrollment.course_level] || "border-gray-200 bg-gray-100 text-gray-600"}`}
                    >
                      {enrollment.course_level?.replace("level", "Level ") || "Course"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        enrollment.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-harvest/10 text-harvest"
                      }`}
                    >
                      {enrollment.status === "completed" ? "Completed" : `${enrollment.progress_percent || 0}%`}
                    </span>
                  </div>
                </div>

                {enrollment.status !== "completed" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-harvest transition-all"
                      style={{ width: `${enrollment.progress_percent || 0}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Certificates */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Award className="h-5 w-5 flex-shrink-0 text-harvest" />
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-ink">My Certificates</h3>
              <p className="text-sm text-slate-500">Completed course credentials and certificate access</p>
            </div>
          </div>
          <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {certs} total
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {certificateEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                <Award className="h-7 w-7" />
              </div>
              <h4 className="font-display text-lg font-bold text-ink">Complete your course to unlock certificates</h4>
              <p className="mt-2 text-sm text-slate-500">
                Your certificates will appear here once you finish the required course milestones.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {certificateEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-ink">{enrollment.course_title}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Issued {safeDate(enrollment.completed_date || enrollment.created_date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Certificate issued
                    </span>
                    {enrollment.certificate_url && (
                      <Button asChild variant="outline" size="sm" className="ml-auto gap-2">
                        <a href={enrollment.certificate_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Assignment Status */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <ClipboardList className="h-5 w-5 text-harvest" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Assignment Status</h3>
            <p className="text-sm text-slate-500">Recent assignment submissions and grading status</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loadingLearningData && assignmentRows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Loading your assignment activity...
            </div>
          ) : assignmentRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h4 className="font-display text-lg font-bold text-ink">No assignment activity yet</h4>
              <p className="mt-2 text-sm text-slate-500">
                Submit an assignment and grading updates will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Assignment Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Grade Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignmentRows.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <p className="max-w-[28rem] truncate font-medium text-ink">{row.name}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{row.submittedAt}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${ASSIGNMENT_STATUS_STYLES[row.statusKey] || ASSIGNMENT_STATUS_STYLES.pending}`}
                          >
                            {row.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {assignmentRows.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{row.name}</p>
                        <p className="mt-1 text-sm text-slate-500">Date Submitted: {row.submittedAt}</p>
                      </div>
                      <span
                        className={`inline-flex flex-shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${ASSIGNMENT_STATUS_STYLES[row.statusKey] || ASSIGNMENT_STATUS_STYLES.pending}`}
                      >
                        {row.statusLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Security & Password */}
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-200">
            <Lock className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-display text-lg font-bold text-ink">Password & Security</h4>
              <p className="text-sm text-slate-600">Keep your account secure by updating your password regularly.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openPasswordModal}>
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
            <p className="text-xs text-slate-500">
              Need help?{' '}
              <a href="mailto:info@solbusinessconsultant.com.au" className="font-semibold text-harvest hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </Card>

      <Dialog open={passwordOpen} onOpenChange={(open) => (open ? openPasswordModal() : closePasswordModal())}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password securely from this page. Use a strong password you have not used before.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="h-11 w-full"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="h-11 w-full"
                placeholder="Create a new password"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="h-11 w-full"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={closePasswordModal} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePasswordChange}
              disabled={passwordSaving}
              className="w-full bg-harvest text-white hover:bg-harvest/90 sm:w-auto"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
