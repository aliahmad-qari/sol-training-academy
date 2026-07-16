import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  HelpCircle, FileText, Upload, CheckCircle, XCircle, Clock,
  Award, BarChart2, AlertCircle, X, Timer, Lock,
  MessageSquare, Send, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Date helpers ──────────────────────────────────────────────────────────────
function safeDate(val, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-AU", opts);
  } catch { return "—"; }
}

function safeDatetime(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}
// Stores "first_access_{assignmentId}_{userId}" in localStorage
function useDeadlineCountdown(assignment, userId) {
  const storageKey = `asgn_start_${assignment.id}_${userId}`;
  const durationDays = assignment.duration_days || 0;

  const [deadlineMs, setDeadlineMs] = useState(null);
  const [countdown, setCountdown] = useState(null); // { days, hours, mins, secs, expired }

  useEffect(() => {
    if (!durationDays || !userId) { setDeadlineMs(null); return; }

    let startTime = localStorage.getItem(storageKey);
    if (!startTime) {
      startTime = String(Date.now());
      localStorage.setItem(storageKey, startTime);
    }
    const deadline = parseInt(startTime, 10) + durationDays * 24 * 60 * 60 * 1000;
    setDeadlineMs(deadline);
  }, [assignment.id, userId, durationDays]);

  useEffect(() => {
    if (!deadlineMs) return;
    const tick = () => {
      const diff = deadlineMs - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });
        return;
      }
      const totalSecs = Math.floor(diff / 1000);
      setCountdown({
        days: Math.floor(totalSecs / 86400),
        hours: Math.floor((totalSecs % 86400) / 3600),
        mins: Math.floor((totalSecs % 3600) / 60),
        secs: totalSecs % 60,
        expired: false,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs]);

  return { countdown, deadlineMs };
}

// ── Deadline Display ──────────────────────────────────────────────────────────
function DeadlineCountdown({ countdown, durationDays }) {
  if (!durationDays) return null;
  if (!countdown) return <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />;

  if (countdown.expired) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold">Deadline Expired</span>
      </div>
    );
  }

  const urgent = countdown.days === 0 && countdown.hours < 24;
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border text-xs font-mono font-bold ${
      urgent ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
    }`}>
      <Timer className="w-3.5 h-3.5 flex-shrink-0" />
      {countdown.days > 0 && <span>{countdown.days}d </span>}
      <span>{String(countdown.hours).padStart(2,"0")}h </span>
      <span>{String(countdown.mins).padStart(2,"0")}m </span>
      <span>{String(countdown.secs).padStart(2,"0")}s</span>
    </div>
  );
}

// ── Assignment Submission Modal ───────────────────────────────────────────────
function AssignmentSubmitModal({ assignment, userId, user, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { countdown } = useDeadlineCountdown(assignment, userId);
  const isExpired = countdown?.expired;

  const allowed = assignment.allowed_file_types || ["pdf", "docx", "zip", "jpg", "png"];

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a file."); return; }
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error(`File type .${ext} not allowed. Allowed: ${allowed.join(", ")}`);
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.AssignmentSubmission.create({
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      course_id: assignment.course_id,
      course_title: assignment.course_title,
      user_id: userId,
      user_name: user?.full_name || "",
      user_email: user?.email || "",
      file_url,
      file_name: file.name,
      file_type: ext,
      submission_notes: notes,
      status: "submitted",
      max_marks: assignment.max_marks,
      passing_marks: assignment.passing_marks,
    });
    toast.success("Assignment submitted successfully!");
    setUploading(false);
    onSubmitted(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-2xl flex flex-col max-h-[95dvh] rounded-t-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start px-5 py-4 border-b border-border/50 flex-shrink-0">
          <div className="min-w-0 pr-3 flex-1">
            <h3 className="font-display font-bold text-base sm:text-lg text-ink">Submit Assignment</h3>
            <p className="text-xs text-slate_mist mt-0.5 truncate">{assignment.title}</p>
          </div>
          {countdown && (
            <div className="mr-2 flex-shrink-0">
              <DeadlineCountdown countdown={countdown} durationDays={assignment.duration_days} />
            </div>
          )}
          <button onClick={onClose} className="flex-shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate_mist" />
          </button>
        </div>

        {/* Expired banner */}
        {isExpired && (
          <div className="flex items-center gap-2 bg-red-50 border-b border-red-200 px-5 py-2.5">
            <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">Deadline has passed — submission is locked.</p>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Instructions</p>
              <p className="text-sm text-blue-800 leading-relaxed">{assignment.instructions}</p>
            </div>
          )}

          {/* Assignment brief file — view in browser */}
          {assignment.brief_file_url && (
            <a
              href={assignment.brief_file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {assignment.brief_file_name || "Assignment Brief"}
                </p>
                <p className="text-xs text-blue-600 group-hover:underline">Click to open / view</p>
              </div>
              <Eye className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </a>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate_mist">Max Marks</p>
              <p className="font-bold text-ink text-lg">{assignment.max_marks}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate_mist">Passing Mark</p>
              <p className="font-bold text-ink text-lg">{assignment.passing_marks}</p>
            </div>
          </div>

          {!isExpired && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-2 block font-semibold">
                Upload File * <span className="normal-case font-normal">(Allowed: {allowed.join(", ")})</span>
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-harvest/50 hover:bg-harvest/5 transition-all select-none min-h-[110px]"
              >
                <Upload className="w-7 h-7 text-slate-400 mb-2" />
                {file ? (
                  <div className="text-center w-full px-2">
                    <p className="text-sm font-semibold text-ink break-all">{file.name}</p>
                    <p className="text-xs text-slate_mist mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Tap to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate_mist">Tap to browse files</p>
                    <p className="text-xs text-slate_mist/60 mt-1">{allowed.join(", ").toUpperCase()}</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden"
                  accept={allowed.map(e => `.${e}`).join(",")}
                  onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
              </div>

              <div className="mt-3">
                <Label className="text-xs uppercase tracking-wider text-slate_mist mb-2 block font-semibold">Notes (Optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any notes for your assessor…" rows={3} className="resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/50 flex gap-3 flex-shrink-0 bg-white rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          {isExpired ? (
            <Button disabled className="flex-1 h-11 gap-2 font-semibold">
              <Lock className="w-4 h-4" /> Submission Locked
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={uploading || !file} className="flex-1 h-11 bg-harvest text-white gap-2 font-semibold">
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4" /> Submit Assignment</>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Assignment Card (with live deadline) ──────────────────────────────────────
function AssignmentCard({ assignment, submission: initialSubmission, userId, onSubmit }) {
  const { countdown } = useDeadlineCountdown(assignment, userId);
  const isExpired = countdown?.expired;

  const [submission, setSubmission] = useState(initialSubmission);
  const [showThread, setShowThread] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  // Keep local copy in sync when the parent reloads submissions.
  useEffect(() => { setSubmission(initialSubmission); }, [initialSubmission]);

  const messages = submission?.messages || [];

  useEffect(() => {
    if (showThread) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, showThread]);

  const sendReply = async () => {
    if (!replyText.trim() || !submission?.id) return;
    setSendingReply(true);
    try {
      const updated = await base44.entities.AssignmentSubmission.reply(submission.id, replyText.trim());
      setSubmission(updated);
      setReplyText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSendingReply(false);
    }
  };

  const STATUS_COLORS = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    graded: "bg-emerald-100 text-emerald-700",
    resubmit_requested: "bg-red-100 text-red-700",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 flex-1 w-full min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-display font-semibold text-ink break-words">{assignment.title}</h3>
                {isExpired && !submission && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Expired
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate_mist mb-2">
                <span>Max: <strong className="text-ink">{assignment.max_marks} marks</strong></span>
                <span>Pass: <strong className="text-ink">{assignment.passing_marks} marks</strong></span>
                {assignment.duration_days > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {assignment.duration_days}-day deadline
                  </span>
                )}
              </div>
              {assignment.instructions && (
                <p className="text-xs text-slate_mist line-clamp-2">{assignment.instructions}</p>
              )}
              {/* Assignment brief file — view only, no forced download */}
              {assignment.brief_file_url && (
                <div className="mt-2">
                  <a
                    href={assignment.brief_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    {assignment.brief_file_name || "View Assignment Brief"}
                    <Eye className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto flex-wrap">
            {/* Countdown */}
            {!submission && (
              <DeadlineCountdown countdown={countdown} durationDays={assignment.duration_days} />
            )}

            {submission ? (
              <>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[submission.status]}`}>
                  {submission.status.replace("_", " ")}
                </span>
                {submission.status === "graded" && (
                  <span className={`text-sm font-bold ${submission.passed ? "text-emerald-600" : "text-red-500"}`}>
                    {submission.marks_awarded}/{submission.max_marks} marks
                  </span>
                )}
                {submission.status === "resubmit_requested" && !isExpired && (
                  <Button size="sm" onClick={() => onSubmit(assignment)}
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs h-8">
                    <Upload className="w-3.5 h-3.5" /> Resubmit
                  </Button>
                )}
              </>
            ) : isExpired ? (
              <Button size="sm" disabled className="gap-1.5 text-xs h-8">
                <Lock className="w-3.5 h-3.5" /> Locked
              </Button>
            ) : (
              <Button size="sm" onClick={() => onSubmit(assignment)}
                className="bg-harvest text-white gap-1.5 text-xs h-8">
                <Upload className="w-3.5 h-3.5" /> Submit
              </Button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {submission?.feedback && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs font-bold text-slate_mist uppercase tracking-wider mb-1">Assessor Feedback</p>
            <p className="text-sm text-ink bg-slate-50 rounded-lg p-3">{submission.feedback}</p>
          </div>
        )}

        {/* Message thread with assessor */}
        {submission && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <button
              onClick={() => setShowThread(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate_mist uppercase tracking-wider hover:text-ink transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              Messages ({messages.length})
              <span className="text-[10px] font-normal normal-case text-blue-600">
                {showThread ? "Hide" : "Open"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {showThread && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden">
                  <div className="mt-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-slate_mist text-center py-3">
                        No messages yet. Send a message to your assessor below.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {messages.map((msg, i) => {
                          const isStudent = msg.sender_role === "student";
                          return (
                            <div key={i} className={`flex gap-2 ${isStudent ? "flex-row-reverse" : "flex-row"}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                                isStudent ? "bg-harvest/20 text-harvest" : "bg-blue-100 text-blue-700"
                              }`}>
                                {(msg.sender_name || "?")[0].toUpperCase()}
                              </div>
                              <div className={`flex-1 flex flex-col ${isStudent ? "items-end" : "items-start"}`}>
                                <div className={`rounded-xl px-3 py-2 max-w-[85%] ${
                                  isStudent
                                    ? "bg-harvest/10 border border-harvest/20 text-ink"
                                    : "bg-slate-100 border border-slate-200 text-ink"
                                }`}>
                                  <p className="text-xs whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                                <p className="text-[10px] text-slate_mist mt-0.5 px-1">
                                  {msg.sender_name} · {safeDatetime(msg.sent_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}

                    {/* Reply input */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Message your assessor…"
                        className="flex-1 h-9 text-sm rounded-lg border border-border/50 px-3 focus:outline-none focus:border-harvest/50"
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      />
                      <Button
                        size="sm"
                        onClick={sendReply}
                        disabled={sendingReply || !replyText.trim()}
                        className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-3">
                        {sendingReply
                          ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Student Assessments ───────────────────────────────────────────────────
export default function StudentAssessments({ user, enrollments, quizAttempts: initialAttempts, onOpenCourse }) {
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState(initialAttempts || []);
  const [quizTopics, setQuizTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);

  const enrolledCourseIds = enrollments.map(e => e.course_id);

  const load = async () => {
    setLoading(true);
    const [asgns, subs, attempts, allTopics] = await Promise.all([
      base44.entities.Assignment.filter({ is_published: true }).catch(() => []),
      user ? base44.entities.AssignmentSubmission.filter({ user_id: user.id }).catch(() => []) : Promise.resolve([]),
      user ? base44.entities.QuizAttempt.filter({ user_id: user.id }).catch(() => quizAttempts) : Promise.resolve(quizAttempts),
      base44.entities.CourseTopic.filter({ type: "quiz" }).catch(() => []),
    ]);
    setAssignments(asgns.filter(a => enrolledCourseIds.includes(a.course_id)));
    setSubmissions(subs);
    setQuizAttempts(attempts);
    setQuizTopics(allTopics.filter(t => enrolledCourseIds.includes(t.course_id)));
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const totalQuizMarks = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.score || 0), 0) / quizAttempts.length)
    : null;

  const gradedSubs = submissions.filter(s => s.status === "graded" && s.marks_awarded !== undefined);
  const totalAssignmentPct = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((s, sub) => s + ((sub.marks_awarded / sub.max_marks) * 100), 0) / gradedSubs.length)
    : null;

  const overallPct = (totalQuizMarks !== null && totalAssignmentPct !== null)
    ? Math.round((totalQuizMarks + totalAssignmentPct) / 2)
    : (totalQuizMarks ?? totalAssignmentPct);

  const passed = overallPct !== null && overallPct >= 70;
  const certEligible = passed && enrollments.some(e => e.status === "completed");

  const STATUS_COLORS = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    graded: "bg-emerald-100 text-emerald-700",
    resubmit_requested: "bg-red-100 text-red-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Quiz Average", value: totalQuizMarks !== null ? `${totalQuizMarks}%` : "—", icon: HelpCircle, color: "text-purple-600 bg-purple-50", sub: `${quizAttempts.length} attempt${quizAttempts.length !== 1 ? "s" : ""}` },
          { label: "Assignment Avg.", value: totalAssignmentPct !== null ? `${totalAssignmentPct}%` : "—", icon: FileText, color: "text-blue-600 bg-blue-50", sub: `${gradedSubs.length} graded` },
          { label: "Overall Score", value: overallPct !== null ? `${overallPct}%` : "—", icon: BarChart2, color: overallPct !== null ? (passed ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50") : "text-slate-400 bg-slate-100", sub: overallPct !== null ? (passed ? "✓ PASS" : "✗ FAIL") : "In progress" },
          { label: "Certificate", value: certEligible ? "Eligible" : "Pending", icon: Award, color: certEligible ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-100", sub: certEligible ? "Ready to issue" : "Complete course to unlock" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <card.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs text-slate_mist">{card.label}</p>
                <p className="font-display font-bold text-xl text-ink leading-none">{card.value}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate_mist">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "quizzes", label: `Quizzes (${quizAttempts.length})` },
          { id: "assignments", label: `Assignments (${assignments.length})` },
          { id: "history", label: "History" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "bg-white shadow text-ink" : "text-slate_mist hover:text-ink"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {/* Overview */}
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-500" /> Quiz Results
                  </h3>
                  <button onClick={() => setTab("quizzes")} className="text-xs text-harvest hover:underline">View all</button>
                </div>
                <div className="p-5">
                  {quizAttempts.length === 0 ? (
                    <p className="text-sm text-slate_mist text-center py-4">No quiz attempts yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {quizAttempts.slice(0, 4).map((a, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-ink">Quiz attempt #{a.attempt_number || 1}</p>
                            <p className="text-[10px] text-slate_mist">{safeDate(a.created_date || a.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-1.5 rounded-full ${a.score >= 70 ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${a.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${a.score >= 70 ? "text-emerald-600" : "text-red-500"}`}>{a.score}%</span>
                            {a.passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Assignments
                  </h3>
                  <button onClick={() => setTab("assignments")} className="text-xs text-harvest hover:underline">View all</button>
                </div>
                <div className="p-5">
                  {assignments.length === 0 ? (
                    <p className="text-sm text-slate_mist text-center py-4">No assignments available yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.slice(0, 4).map((a) => {
                        const mySub = submissions.find(s => s.assignment_id === a.id);
                        return (
                          <div key={a.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-ink truncate">{a.title}</p>
                              {a.duration_days > 0 && (
                                <p className="text-[10px] text-slate_mist">{a.duration_days}-day deadline</p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {mySub ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[mySub.status]}`}>
                                  {mySub.status === "graded" ? `${mySub.marks_awarded}/${mySub.max_marks}` : mySub.status.replace("_", " ")}
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-600 bg-amber-50 font-bold px-2 py-0.5 rounded-full">Not submitted</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {tab === "quizzes" && (
            <div className="space-y-5">
              {/* Available Quizzes */}
              <div>
                <h3 className="font-display font-semibold text-ink mb-3">Available Quizzes ({quizTopics.length})</h3>
                {quizTopics.length === 0 ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-10 text-center">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate_mist text-sm">No quizzes available. Enrol in a course that contains quizzes.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {quizTopics.map(topic => {
                      const myAttempts = quizAttempts.filter(a => a.topic_id === topic.id);
                      const bestAttempt = myAttempts.length > 0
                        ? myAttempts.reduce((best, a) => a.score > best.score ? a : best, myAttempts[0])
                        : null;
                      const enrollment = enrollments.find(e => e.course_id === topic.course_id);
                      const isPassed = bestAttempt?.passed;
                      const qCount = topic.quiz_questions?.length || 0;
                      const totalMarks = (topic.quiz_questions || []).reduce((s, q) => s + (q.marks || 1), 0);
                      return (
                        <motion.div key={topic.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPassed ? "bg-emerald-100" : "bg-purple-100"}`}>
                              {isPassed
                                ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                                : <HelpCircle className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-semibold text-ink text-sm truncate">{topic.title}</h4>
                              <p className="text-xs text-slate_mist mt-0.5">
                                {qCount} question{qCount !== 1 ? "s" : ""} · {totalMarks} marks · {topic.passing_marks || 75}% to pass
                                {topic.time_limit_mins ? ` · ${topic.time_limit_mins} min` : ""}
                              </p>
                            </div>
                          </div>

                          {bestAttempt && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full ${isPassed ? "bg-emerald-500" : "bg-red-400"}`}
                                  style={{ width: `${bestAttempt.score}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${isPassed ? "text-emerald-600" : "text-red-500"}`}>
                                Best: {bestAttempt.score}%
                              </span>
                              {isPassed
                                ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Passed</span>
                                : <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Failed</span>
                              }
                            </div>
                          )}

                          <Button
                            size="sm"
                            onClick={() => enrollment && onOpenCourse && onOpenCourse(enrollment, topic.id)}
                            className={`w-full gap-2 text-xs h-8 ${isPassed ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-harvest text-white"}`}>
                            <HelpCircle className="w-3.5 h-3.5" />
                            {myAttempts.length === 0 ? "Start Quiz" : isPassed ? "Review Quiz" : "Retry Quiz"}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Attempt History */}
              {quizAttempts.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-ink mb-3">Attempt History</h3>
                  <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border/30">
                          {["Quiz", "Date", "Score", "Questions", "Status"].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quizAttempts.map((attempt, i) => {
                          const topic = quizTopics.find(t => t.id === attempt.topic_id);
                          return (
                            <tr key={i} className="border-b border-border/20 hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                                  </div>
                                  <div>
                                    <span className="font-medium text-ink text-xs block">{topic?.title || "Quiz"}</span>
                                    <span className="text-[10px] text-slate_mist">Attempt #{attempt.attempt_number || 1}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate_mist">{safeDate(attempt.created_date || attempt.createdAt)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-1.5 rounded-full ${attempt.score >= 70 ? "bg-emerald-500" : "bg-red-400"}`}
                                      style={{ width: `${attempt.score}%` }} />
                                  </div>
                                  <span className={`text-xs font-bold ${attempt.score >= 70 ? "text-emerald-600" : "text-red-500"}`}>{attempt.score}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate_mist">{attempt.total_questions} Qs</td>
                              <td className="px-4 py-3">
                                {attempt.passed
                                  ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Passed</span>
                                  : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Failed</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {tab === "assignments" && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate_mist text-sm">No assignments available yet.</p>
                </div>
              ) : (
                assignments.map(a => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    submission={submissions.find(s => s.assignment_id === a.id)}
                    userId={user?.id}
                    onSubmit={setSubmitModal}
                  />
                ))
              )}
            </div>
          )}

          {/* History Tab */}
          {tab === "history" && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-5 border ${passed ? "bg-emerald-50 border-emerald-200" : overallPct !== null ? "bg-red-50 border-red-200" : "bg-slate-50 border-border/50"}`}>
                <div className="flex items-center gap-3">
                  {passed ? <CheckCircle className="w-8 h-8 text-emerald-600" />
                    : overallPct !== null ? <XCircle className="w-8 h-8 text-red-500" />
                    : <AlertCircle className="w-8 h-8 text-slate-400" />}
                  <div>
                    <p className="font-display font-bold text-lg text-ink">
                      {passed ? "Congratulations — You Passed!" : overallPct !== null ? "Not Yet Passed" : "Assessment In Progress"}
                    </p>
                    <p className="text-sm text-slate_mist">
                      {overallPct !== null ? `Overall score: ${overallPct}% (minimum 70% required)` : "Complete assessments to see your result."}
                    </p>
                    {certEligible && (
                      <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> You are eligible for a certificate!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/30">
                  <h3 className="font-display font-semibold text-ink">Full Assessment History</h3>
                </div>
                <div className="divide-y divide-border/20">
                  {quizAttempts.length === 0 && submissions.length === 0 ? (
                    <p className="p-6 text-sm text-slate_mist text-center">No assessment history yet.</p>
                  ) : (
                    <>
                      {quizAttempts.map((a, i) => (
                        <div key={`q-${i}`} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-ink">Quiz — Attempt #{a.attempt_number || 1}</p>
                              <p className="text-[10px] text-slate_mist">{safeDate(a.created_date || a.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ink">{a.score}%</span>
                            {a.passed
                              ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Pass</span>
                              : <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Fail</span>
                            }
                          </div>
                        </div>
                      ))}
                      {submissions.map((sub, i) => (
                        <div key={`s-${i}`} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-ink">{sub.assignment_title}</p>
                              <p className="text-[10px] text-slate_mist">Submitted {safeDate(sub.created_date || sub.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {sub.status === "graded" ? (
                              <>
                                <span className="text-sm font-bold text-ink">{sub.marks_awarded}/{sub.max_marks}</span>
                                {sub.passed
                                  ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Pass</span>
                                  : <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Fail</span>
                                }
                              </>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}>
                                {sub.status.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {submitModal && (
        <AssignmentSubmitModal
          assignment={submitModal}
          userId={user?.id} user={user}
          onClose={() => setSubmitModal(null)}
          onSubmitted={load}
        />
      )}
    </div>
  );
}