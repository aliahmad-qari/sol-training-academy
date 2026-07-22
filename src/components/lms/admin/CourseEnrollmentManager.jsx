import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Users, UserPlus, Search, X, RotateCcw,
  Ban, Trash2, CalendarDays, TrendingUp, Award,
  CheckCircle, XCircle, MoreVertical, RefreshCw, Send, BarChart2,
  BookOpen, HelpCircle, FileText, Loader2, UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";
import { averageQuizPercent, quizAttemptPercentOrZero } from "@/lib/quizScores";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getEnrollmentStatus(enr) {
  if (enr.status === "completed") return "completed";
  if (enr.status === "paused") return "suspended";
  if (!enr.expiry_date) {
    return (enr.progress_percent || 0) > 0 ? "in_progress" : "active";
  }
  const days = differenceInDays(new Date(enr.expiry_date), new Date());
  if (days < 0) return "expired";
  if (days <= 14) return "expiring_soon";
  return (enr.progress_percent || 0) > 0 ? "in_progress" : "active";
}

const getRecordId = (record) => record?._id || record?.id;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const findUserByEmail = async (email, localUsers = []) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const local = localUsers.find((user) => normalizeEmail(user.email) === normalized);
  if (local) return local;

  const matches = await base44.entities.User.filter({ search: normalized, role: "student" }).catch(() => []);
  return matches.find((user) => normalizeEmail(user.email) === normalized) || null;
};

const ensureStudentUser = async ({ fullName, email }, localUsers = []) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail, localUsers);
  if (existing) return { user: existing, created: false };

  try {
    const user = await base44.entities.User.create({
      full_name: String(fullName || normalizedEmail).trim(),
      email: normalizedEmail,
      role: "student",
    });
    return { user, created: true };
  } catch (err) {
    if (err.response?.status === 409) {
      const user = await findUserByEmail(normalizedEmail, []);
      if (user) return { user, created: false };
    }
    throw err;
  }
};
const STATUS_CONFIG = {
  active:        { label: "Active",         color: "bg-blue-100 text-blue-700" },
  in_progress:   { label: "In Progress",    color: "bg-emerald-100 text-emerald-700" },
  completed:     { label: "Completed",      color: "bg-purple-100 text-purple-700" },
  expiring_soon: { label: "Expiring Soon",  color: "bg-amber-100 text-amber-700" },
  expired:       { label: "Expired",        color: "bg-red-100 text-red-700" },
  suspended:     { label: "Suspended",      color: "bg-gray-100 text-gray-600" },
};

// ── Enroll Student Modal ──────────────────────────────────────────────────────
function EnrollStudentModal({ course, onClose, onDone }) {
  const [step, setStep] = useState("search"); // search | form
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "", email: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    access_duration_days: course?.access_duration_days || 0,
    expiry_date: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    base44.entities.User.list().then(u => { setAllUsers(u); }).catch(() => setAllUsers([])).finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFilteredUsers([]); return; }
    const q = query.toLowerCase();
    setFilteredUsers(allUsers.filter(u =>
      u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, allUsers]);

  // Auto-calculate expiry date
  useEffect(() => {
    if (form.access_duration_days > 0 && form.enrollment_date) {
      const exp = addDays(new Date(form.enrollment_date), form.access_duration_days);
      setForm(f => ({ ...f, expiry_date: exp.toISOString().split("T")[0] }));
    } else {
      setForm(f => ({ ...f, expiry_date: "" }));
    }
  }, [form.access_duration_days, form.enrollment_date]);

  const selectExistingUser = (user) => {
    setSelectedUser(user);
    setForm(f => ({ ...f, full_name: user.full_name || "", email: user.email || "" }));
    setStep("form");
  };

  const createNewStudent = () => {
    setSelectedUser(null);
    setStep("form");
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required."); return;
    }
    setSaving(true);

    try {
      const { user, created } = selectedUser
        ? { user: selectedUser, created: false }
        : await ensureStudentUser({ fullName: form.full_name, email: form.email }, allUsers);
      const userId = getRecordId(user);

      if (!userId) throw new Error("Could not resolve a valid student account ID.");

      const existing = await base44.entities.CourseEnrollment.filter({ user_id: userId, course_id: course.id });
      if (existing.length > 0) {
        toast.error("This student is already enrolled in this course.");
        return;
      }

      const enrollment = await base44.entities.CourseEnrollment.create({
        user_id: userId,
        course_id: course.id,
      });

      const enrollmentId = getRecordId(enrollment);
      const update = {
        ...(form.status !== "active" ? { status: form.status } : {}),
        ...(form.expiry_date ? { expiry_date: form.expiry_date } : {}),
      };
      if (enrollmentId && Object.keys(update).length > 0) {
        await base44.entities.CourseEnrollment.update(enrollmentId, update);
      }

      // Send welcome/enrollment email when an integration becomes available.
      try {
        await base44.integrations.Core.SendEmail({
          to: normalizeEmail(form.email),
          subject: `You've been enrolled in ${course.title}`,
          body: `Hi ${form.full_name},\n\nYou have been successfully enrolled in ${course.title}.\n\nPlease log in to your student portal to begin learning.\n\nBest regards,\nSOL Training Academy`,
        });
      } catch (e) { /* non-critical */ }

      toast.success(created ? `${form.full_name} account created and enrolled successfully!` : `${form.full_name} enrolled successfully!`);
      if (created && user.generated_password) {
        toast.info(`Temporary password: ${user.generated_password}`, { duration: 30000 });
      }
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to enrol student.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-harvest/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-harvest" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Enrol Student</h3>
              <p className="text-xs text-slate_mist truncate max-w-xs">{course.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate_mist hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {step === "search" ? (
            <>
              {/* Search Existing */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-2 block">Search Existing Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate_mist" />
                  <Input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name or email…" className="pl-9 h-10 text-sm" autoFocus />
                </div>
                {loadingUsers && <p className="text-xs text-slate_mist mt-2">Loading users…</p>}
                {filteredUsers.length > 0 && (
                  <div className="mt-2 border border-border/50 rounded-xl overflow-hidden divide-y divide-border/30">
                    {filteredUsers.map(u => (
                      <button key={u.id} onClick={() => selectExistingUser(u)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors">
                        <div className="w-8 h-8 rounded-full bg-harvest/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-harvest font-bold text-sm">{(u.full_name || u.email)[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{u.full_name || "—"}</p>
                          <p className="text-xs text-slate_mist">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {query.length > 1 && filteredUsers.length === 0 && !loadingUsers && (
                  <p className="text-xs text-slate_mist mt-2">No students found for "{query}"</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-slate_mist font-medium">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <Button onClick={createNewStudent} variant="outline" className="w-full gap-2 h-10 border-harvest/30 text-harvest hover:bg-harvest/5">
                <UserPlus className="w-4 h-4" /> Create New Student
              </Button>
            </>
          ) : (
            <>
              {selectedUser && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-sm">{(selectedUser.full_name || selectedUser.email)[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800">{selectedUser.full_name}</p>
                    <p className="text-xs text-blue-600">{selectedUser.email} · Existing student</p>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setStep("search"); setQuery(""); }}
                    className="text-blue-400 hover:text-blue-600"><X className="w-4 h-4" /></button>
                </div>
              )}

              {!selectedUser && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Full Name *</Label>
                    <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Jane Smith" className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Email Address *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com" className="h-10 text-sm" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Enrollment Date</Label>
                  <Input type="date" value={form.enrollment_date}
                    onChange={e => setForm(f => ({ ...f, enrollment_date: e.target.value }))}
                    className="h-10 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Duration</Label>
                  <Select value={String(form.access_duration_days)}
                    onValueChange={v => setForm(f => ({ ...f, access_duration_days: Number(v) }))}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Unlimited</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="180">180 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Expiry Date</Label>
                  <Input type="date" value={form.expiry_date}
                    onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                    className="h-10 text-sm" placeholder="Auto-calculated" />
                  {form.expiry_date && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      ⏰ Access expires {format(new Date(form.expiry_date), "d MMM yyyy")}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!selectedUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">New Student Account</p>
                  <p className="text-xs text-blue-600">An invitation email will be sent to the student with login instructions. They will set their own password on first login.</p>
                </div>
              )}

              <button onClick={() => setStep("search")} className="text-xs text-slate_mist hover:text-ink underline">
                ← Back to search
              </button>
            </>
          )}
        </div>

        {step === "form" && (
          <div className="flex gap-3 px-6 py-4 border-t border-border/50 flex-shrink-0 bg-slate-50/50">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-harvest hover:bg-harvest/90 text-white font-semibold">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enrolling…</> : <><UserPlus className="w-4 h-4 mr-1.5" />Enrol Student</>}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Adjust Access Modal (extend OR reduce) ────────────────────────────────────
// Normalize any stored expiry (ISO string / Date) to the yyyy-MM-dd format an
// <input type="date"> requires. Without this the custom field renders blank and
// a save would send an empty, invalid expiry_date.
function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd");
}

function ExtendAccessModal({ enrollment, onClose, onDone }) {
  const [mode, setMode] = useState("preset"); // preset | custom
  const [days, setDays] = useState(30); // may be negative to reduce access
  const [customDate, setCustomDate] = useState(toDateInputValue(enrollment.expiry_date));
  const [saving, setSaving] = useState(false);

  const currentExpiry = enrollment.expiry_date ? new Date(enrollment.expiry_date) : new Date();
  const previewExpiry = mode === "custom"
    ? (customDate ? new Date(customDate) : null)
    : addDays(currentExpiry, days);
  const isReducing = mode === "preset" && days < 0;

  const handleSave = async () => {
    let newExpiry;
    if (mode === "custom") {
      if (!customDate) { toast.error("Please pick a date."); return; }
      newExpiry = customDate;
    } else {
      // date-fns addDays accepts negative values, so this handles reduce too.
      // Format as LOCAL yyyy-MM-dd — toISOString() would shift the day backwards
      // in positive-UTC timezones (e.g. Australia), landing on the wrong date.
      const base = enrollment.expiry_date ? new Date(enrollment.expiry_date) : new Date();
      newExpiry = format(addDays(base, days), "yyyy-MM-dd");
    }

    setSaving(true);
    try {
      // If the new expiry is in the past, the enrollment should read as expired.
      const isPast = new Date(newExpiry).getTime() < Date.now();
      await base44.entities.CourseEnrollment.update(enrollment.id, {
        expiry_date: newExpiry,
        status: isPast ? "expired" : "active",
      });
      toast.success(`Access ${isPast ? "reduced" : "updated"} to ${format(new Date(newExpiry), "d MMM yyyy")}`);
      onDone(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update access.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <h3 className="font-display font-bold text-lg text-ink">Adjust Access</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs text-slate_mist mb-1">Student: <strong className="text-ink">{enrollment.user_name}</strong></p>
            <p className="text-xs text-slate_mist">
              Current expiry: <strong className="text-ink">{enrollment.expiry_date ? format(new Date(enrollment.expiry_date), "d MMM yyyy") : "No expiry"}</strong>
            </p>
          </div>

          {/* Extend presets */}
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1.5 block">Extend</Label>
            <div className="flex gap-2 flex-wrap">
              {[1, 5, 10, 30, 60, 90].map(d => (
                <button key={d} onClick={() => { setDays(d); setMode("preset"); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${mode === "preset" && days === d ? "border-harvest bg-harvest/10 text-harvest" : "border-border/50 text-ink hover:border-harvest/30"}`}>
                  +{d} Days
                </button>
              ))}
            </div>
          </div>

          {/* Reduce presets */}
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-red-600 mb-1.5 block">Reduce</Label>
            <div className="flex gap-2 flex-wrap">
              {[-1, -5, -10, -30, -60].map(d => (
                <button key={d} onClick={() => { setDays(d); setMode("preset"); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${mode === "preset" && days === d ? "border-red-500 bg-red-50 text-red-600" : "border-border/50 text-ink hover:border-red-300"}`}>
                  {d} Days
                </button>
              ))}
              <button onClick={() => setMode("custom")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${mode === "custom" ? "border-harvest bg-harvest/10 text-harvest" : "border-border/50 text-ink hover:border-harvest/30"}`}>
                Custom Date
              </button>
            </div>
          </div>

          {mode === "custom" && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">New Expiry Date</Label>
              <Input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="h-10 text-sm" />
            </div>
          )}
          {mode === "preset" && previewExpiry && (
            <p className="text-xs text-slate_mist">
              New expiry: <strong className={isReducing ? "text-red-600" : "text-emerald-600"}>{format(previewExpiry, "d MMM yyyy")}</strong>
              {isReducing && previewExpiry.getTime() < Date.now() && (
                <span className="text-red-500 font-semibold"> — access will expire immediately</span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className={`flex-1 text-white ${isReducing ? "bg-red-600 hover:bg-red-700" : "bg-harvest hover:bg-harvest/90"}`}>
            {saving ? "Saving…" : isReducing ? "Reduce Access" : "Update Access"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Student Progress Detail Modal ─────────────────────────────────────────────
function StudentProgressModal({ enrollment, topics, modules, onClose }) {
  const completedIds = enrollment.completed_topic_ids || [];
  const completedModules = modules.filter(m => {
    const modTopics = topics.filter(t => t.module_id === m.id);
    return modTopics.length > 0 && modTopics.every(t => completedIds.includes(t.id));
  });

  const [quizAttempts, setQuizAttempts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [progressTab, setProgressTab] = useState("overview");

  useEffect(() => {
    setLoadingScores(true);
    Promise.all([
      base44.entities.QuizAttempt.filter({ user_id: enrollment.user_id }),
      base44.entities.AssignmentSubmission.filter({ user_id: enrollment.user_id, course_id: enrollment.course_id }),
    ]).then(([qa, subs]) => {
      const courseTopicIds = new Set(topics.map(t => t.id));
      setQuizAttempts(qa.filter(a => courseTopicIds.has(a.topic_id)));
      setSubmissions(subs);
    }).catch(() => {
      setQuizAttempts([]);
      setSubmissions([]);
    }).finally(() => setLoadingScores(false));
  }, [enrollment.user_id, enrollment.course_id, topics]);

  const avgQuizScore = averageQuizPercent(quizAttempts);

  const gradedSubs = submissions.filter(s => s.status === "graded" && s.marks_awarded !== undefined);
  const avgAssignmentPct = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((s, sub) => s + ((sub.marks_awarded / sub.max_marks) * 100), 0) / gradedSubs.length)
    : null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "quizzes", label: `Quizzes (${quizAttempts.length})` },
    { id: "assignments", label: `Assignments (${submissions.length})` },
    { id: "modules", label: "Modules" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-harvest/10 flex items-center justify-center flex-shrink-0">
              <span className="text-harvest font-bold text-base">{(enrollment.user_name || "?")[0].toUpperCase()}</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink">{enrollment.user_name}</h3>
              <p className="text-xs text-slate_mist">{enrollment.user_email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate_mist" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 px-4 border-b border-border/30 bg-slate-50 flex-shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setProgressTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                progressTab === t.id ? "border-harvest text-harvest" : "border-transparent text-slate_mist hover:text-ink"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Overview */}
          {progressTab === "overview" && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Progress", value: `${enrollment.progress_percent || 0}%`, icon: TrendingUp, color: "text-harvest" },
                  { label: "Topics Done", value: `${completedIds.length}/${topics.length}`, icon: BookOpen, color: "text-blue-500" },
                  { label: "Modules Done", value: `${completedModules.length}/${modules.length}`, icon: Award, color: "text-emerald-500" },
                  { label: "Quiz Avg.", value: avgQuizScore !== null ? `${avgQuizScore}%` : "—", icon: HelpCircle, color: "text-purple-500" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-border/40">
                    <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                    <p className="font-display font-bold text-lg text-ink leading-none">{s.value}</p>
                    <p className="text-[10px] text-slate_mist mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Certificate eligibility */}
              <div className={`rounded-xl p-4 border flex items-center gap-3 ${enrollment.status === "completed" ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-border/40"}`}>
                <Award className={`w-5 h-5 flex-shrink-0 ${enrollment.status === "completed" ? "text-emerald-600" : "text-slate_mist"}`} />
                <div>
                  <p className="text-sm font-semibold text-ink">Certificate Eligibility</p>
                  <p className="text-xs text-slate_mist">
                    {enrollment.status === "completed"
                      ? "✓ Eligible — Course completed"
                      : `Complete all ${topics.length} topics to unlock certificate`}
                  </p>
                </div>
              </div>

              {/* Score summary */}
              {!loadingScores && (avgQuizScore !== null || avgAssignmentPct !== null) && (
                <div className="grid grid-cols-2 gap-3">
                  {avgQuizScore !== null && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate_mist mb-1">Average Quiz Score</p>
                      <p className={`font-display font-bold text-2xl ${avgQuizScore >= 70 ? "text-emerald-600" : "text-red-500"}`}>{avgQuizScore}%</p>
                      <p className="text-[10px] text-slate_mist mt-1">{quizAttempts.length} attempt{quizAttempts.length !== 1 ? "s" : ""}</p>
                    </div>
                  )}
                  {avgAssignmentPct !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate_mist mb-1">Assignment Average</p>
                      <p className={`font-display font-bold text-2xl ${avgAssignmentPct >= 50 ? "text-emerald-600" : "text-red-500"}`}>{avgAssignmentPct}%</p>
                      <p className="text-[10px] text-slate_mist mt-1">{gradedSubs.length} graded</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Quizzes tab */}
          {progressTab === "quizzes" && (
            <div>
              {loadingScores ? (
                <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-harvest mx-auto" /></div>
              ) : quizAttempts.length === 0 ? (
                <div className="py-10 text-center">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate_mist">No quiz attempts yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {quizAttempts.map((a, i) => {
                    const topic = topics.find(t => t.id === a.topic_id);
                    return (
                      <div key={i} className="bg-white border border-border/40 rounded-xl p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.passed ? "bg-emerald-100" : "bg-red-100"}`}>
                          {a.passed ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{topic?.title || "Quiz"}</p>
                          <p className="text-[10px] text-slate_mist">
                            {format(new Date(a.created_date), "d MMM yyyy")} · Attempt #{a.attempt_number || 1}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${quizAttemptPercentOrZero(a) >= 70 ? "bg-emerald-500" : "bg-red-400"}`}
                              style={{ width: `${quizAttemptPercentOrZero(a)}%` }} />
                          </div>
                          <span className={`text-sm font-bold ${quizAttemptPercentOrZero(a) >= 70 ? "text-emerald-600" : "text-red-500"}`}>{quizAttemptPercentOrZero(a)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Assignments tab */}
          {progressTab === "assignments" && (
            <div>
              {loadingScores ? (
                <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-harvest mx-auto" /></div>
              ) : submissions.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate_mist">No assignments submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub, i) => (
                    <div key={i} className="bg-white border border-border/40 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{sub.assignment_title}</p>
                            <p className="text-[10px] text-slate_mist">
                              Submitted {format(new Date(sub.created_date), "d MMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.status === "graded" ? "bg-emerald-100 text-emerald-700"
                            : sub.status === "submitted" ? "bg-amber-100 text-amber-700"
                            : sub.status === "under_review" ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                          }`}>
                            {sub.status?.replace("_", " ")}
                          </span>
                          {sub.status === "graded" && sub.marks_awarded !== undefined && (
                            <p className={`text-sm font-bold mt-1 ${sub.passed ? "text-emerald-600" : "text-red-500"}`}>
                              {sub.marks_awarded}/{sub.max_marks} marks
                            </p>
                          )}
                        </div>
                      </div>
                      {sub.feedback && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-slate_mist uppercase tracking-wider mb-1">Feedback</p>
                          <p className="text-xs text-ink">{sub.feedback}</p>
                        </div>
                      )}
                      {sub.file_url && (
                        <a href={sub.file_url} target="_blank" rel="noreferrer"
                          className="mt-2 flex items-center gap-1.5 text-xs text-harvest hover:underline">
                          <FileText className="w-3 h-3" /> View Submission File
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modules tab */}
          {progressTab === "modules" && (
            <div className="space-y-2">
              {modules.map(mod => {
                const modTopics = topics.filter(t => t.module_id === mod.id);
                const modDone = modTopics.filter(t => completedIds.includes(t.id)).length;
                const pct = modTopics.length > 0 ? Math.round((modDone / modTopics.length) * 100) : 0;
                return (
                  <div key={mod.id} className="bg-white rounded-xl border border-border/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-ink">{mod.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate_mist">{modDone}/{modTopics.length}</span>
                        {pct === 100 && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-harvest"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="space-y-1">
                      {modTopics.map(topic => {
                        const done = completedIds.includes(topic.id);
                        const tc = { video: "📹", reading: "📖", quiz: "❓", assessment: "📝" };
                        return (
                          <div key={topic.id} className="flex items-center gap-2 text-xs">
                            <span>{tc[topic.type] || "📹"}</span>
                            <span className={`flex-1 truncate ${done ? "text-emerald-600" : "text-slate_mist"}`}>{topic.title}</span>
                            {done ? <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              : <div className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Row Actions Dropdown ──────────────────────────────────────────────────────
function RowActions({ enrollment, topics, modules, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [extendModal, setExtendModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);

  const suspend = async () => {
    try {
      await base44.entities.CourseEnrollment.update(enrollment.id, { status: "paused" });
      toast.success("Enrollment suspended."); setOpen(false); onRefresh();
    } catch { toast.error("Failed to suspend enrollment."); }
  };
  const reactivate = async () => {
    try {
      await base44.entities.CourseEnrollment.update(enrollment.id, { status: "active" });
      toast.success("Enrollment reactivated."); setOpen(false); onRefresh();
    } catch { toast.error("Failed to reactivate enrollment."); }
  };
  const resetProgress = async () => {
    if (!confirm(`Reset all progress for ${enrollment.user_name}? This cannot be undone.`)) return;
    try {
      await base44.entities.CourseEnrollment.update(enrollment.id, {
        progress_percent: 0, completed_topic_ids: [], status: "active", completed_date: null,
        certificate_issued: false, last_topic_id: null,
      });
      toast.success("Progress reset."); setOpen(false); onRefresh();
    } catch { toast.error("Failed to reset progress."); }
  };
  const remove = async () => {
    if (!confirm(`Remove ${enrollment.user_name} from this course? This will delete their enrollment record.`)) return;
    try {
      await base44.entities.CourseEnrollment.delete(enrollment.id);
      toast.success("Enrollment removed."); setOpen(false); onRefresh();
    } catch { toast.error("Failed to remove enrollment."); }
  };
  const sendEmail = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: enrollment.user_email,
        subject: `Reminder: Continue your ${enrollment.course_title} training`,
        body: `Hi ${enrollment.user_name},\n\nJust a reminder that you have an ongoing course: ${enrollment.course_title}.\n\nYour current progress is ${enrollment.progress_percent || 0}%. Keep going!\n\nBest regards,\nSOL Training Academy`,
      });
      toast.success("Reminder email sent."); setOpen(false);
    } catch { toast.error("Failed to send reminder email."); }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate_mist hover:bg-slate-100 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 w-52 bg-white rounded-xl shadow-xl border border-border/50 z-20 py-1 overflow-hidden">
            {[
              { label: "View Progress", icon: BarChart2, action: () => { setProgressModal(true); setOpen(false); } },
              { label: "View Profile", icon: UserCircle, action: () => { window.open(`mailto:${enrollment.user_email}`, "_blank"); setOpen(false); } },
              { label: "Extend Access", icon: CalendarDays, action: () => { setExtendModal(true); setOpen(false); } },
              { label: "Send Reminder", icon: Send, action: sendEmail },
              { label: enrollment.status === "paused" ? "Reactivate" : "Suspend", icon: enrollment.status === "paused" ? CheckCircle : Ban,
                action: enrollment.status === "paused" ? reactivate : suspend, className: "text-amber-600" },
              { label: "Reset Progress", icon: RotateCcw, action: resetProgress, className: "text-orange-600" },
              { label: "Remove Enrollment", icon: Trash2, action: remove, className: "text-destructive" },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${item.className || "text-ink"}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
      {extendModal && (
        <ExtendAccessModal enrollment={enrollment} onClose={() => setExtendModal(false)} onDone={onRefresh} />
      )}
      {progressModal && (
        <StudentProgressModal enrollment={enrollment} topics={topics} modules={modules} onClose={() => setProgressModal(false)} />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CourseEnrollmentManager({ course, topics, modules }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollModal, setEnrollModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CourseEnrollment.filter({ course_id: course.id }, "-created_date");
      setEnrollments(data);
    } catch {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [course.id]);

  // Computed status for each enrollment
  const withStatus = enrollments.map(e => ({ ...e, _status: getEnrollmentStatus(e) }));

  // Analytics
  const analytics = {
    total: withStatus.length,
    active: withStatus.filter(e => e._status === "active" || e._status === "in_progress").length,
    completed: withStatus.filter(e => e._status === "completed").length,
    expiring: withStatus.filter(e => e._status === "expiring_soon").length,
    expired: withStatus.filter(e => e._status === "expired").length,
    avgProgress: withStatus.length > 0
      ? Math.round(withStatus.reduce((s, e) => s + (e.progress_percent || 0), 0) / withStatus.length)
      : 0,
  };

  const filtered = withStatus.filter(e => {
    const matchSearch = !search ||
      e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e._status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Enrolled", value: analytics.total, color: "text-ink", bg: "bg-slate-50 border-border/50" },
          { label: "Active / In Progress", value: analytics.active, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Completed", value: analytics.completed, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
          { label: "Expiring Soon", value: analytics.expiring, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Expired", value: analytics.expired, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { label: "Avg. Progress", value: `${analytics.avgProgress}%`, color: "text-harvest", bg: "bg-harvest/5 border-harvest/20" },
        ].map(card => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${card.bg}`}>
            <p className={`font-display font-bold text-2xl leading-none ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-slate_mist mt-1 leading-tight">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate_mist" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students…" className="pl-9 h-9 text-sm w-52" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-sm w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setEnrollModal(true)} className="bg-harvest text-white gap-2 h-9 text-sm">
          <UserPlus className="w-4 h-4" /> Enrol Student
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/50 p-14 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-display font-semibold text-ink mb-1">
            {withStatus.length === 0 ? "No students enrolled yet" : "No students match your filter"}
          </p>
          <p className="text-sm text-slate_mist mb-4">
            {withStatus.length === 0 ? "Enrol your first student to get started." : "Try adjusting your search or filter."}
          </p>
          {withStatus.length === 0 && (
            <Button onClick={() => setEnrollModal(true)} className="bg-harvest text-white gap-2">
              <UserPlus className="w-4 h-4" /> Enrol Student
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/40">
                  {["Student", "Enrollment Date", "Expiry / Days Left", "Progress", "Topics", "Modules", "Last Activity", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map((enr, i) => {
                  const sc = STATUS_CONFIG[enr._status] || STATUS_CONFIG.active;
                  const completedTopicsCount = (enr.completed_topic_ids || []).length;
                  const completedModulesCount = modules.filter(m => {
                    const mt = topics.filter(t => t.module_id === m.id);
                    return mt.length > 0 && mt.every(t => (enr.completed_topic_ids || []).includes(t.id));
                  }).length;

                  const daysLeft = enr.expiry_date
                    ? differenceInDays(new Date(enr.expiry_date), new Date())
                    : null;

                  const lastActivity = enr.updated_date
                    ? format(new Date(enr.updated_date), "d MMM yy")
                    : "—";

                  return (
                    <motion.tr key={enr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/50 transition-colors">
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-harvest/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-harvest font-bold text-xs">
                              {(enr.user_name || enr.user_email || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-ink text-sm leading-tight">{enr.user_name || "—"}</p>
                            <p className="text-[10px] text-slate_mist">{enr.user_email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Enrollment Date */}
                      <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                        {enr.created_date ? format(new Date(enr.created_date), "d MMM yyyy") : "—"}
                      </td>
                      {/* Expiry */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {enr.expiry_date ? (
                          <div>
                            <p className="text-xs text-ink">{format(new Date(enr.expiry_date), "d MMM yyyy")}</p>
                            <p className={`text-[10px] font-semibold ${daysLeft < 0 ? "text-red-500" : daysLeft <= 14 ? "text-amber-500" : "text-slate_mist"}`}>
                              {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? "Expires today" : `${daysLeft}d remaining`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate_mist">Unlimited</span>
                        )}
                      </td>
                      {/* Progress */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${enr.progress_percent >= 100 ? "bg-emerald-500" : enr.progress_percent > 50 ? "bg-harvest" : "bg-blue-400"}`}
                              style={{ width: `${enr.progress_percent || 0}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-ink">{enr.progress_percent || 0}%</span>
                        </div>
                      </td>
                      {/* Topics */}
                      <td className="px-4 py-3 text-xs text-ink">
                        {completedTopicsCount}<span className="text-slate_mist">/{topics.length}</span>
                      </td>
                      {/* Modules */}
                      <td className="px-4 py-3 text-xs text-ink">
                        {completedModulesCount}<span className="text-slate_mist">/{modules.length}</span>
                      </td>
                      {/* Last activity */}
                      <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">{lastActivity}</td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <RowActions enrollment={enr} topics={topics} modules={modules} onRefresh={load} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50/50 border-t border-border/30 flex items-center justify-between">
            <p className="text-xs text-slate_mist">Showing {filtered.length} of {withStatus.length} students</p>
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate_mist hover:text-ink transition-colors">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      )}

      {enrollModal && (
        <EnrollStudentModal course={course} onClose={() => setEnrollModal(false)} onDone={load} />
      )}
    </div>
  );
}