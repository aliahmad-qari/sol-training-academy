import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Edit2, Trash2, Save, X, FileText, HelpCircle, ChevronDown, ChevronUp,
  Eye, CheckCircle, Clock, Search, BookOpen, Layers, Upload, Download, User, Calendar, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Quiz Builder ──────────────────────────────────────────────────────────────
function QuestionEditor({ question, index, onChange, onDelete }) {
  const TYPES = ["mcq", "true_false", "multi_select", "short_answer"];
  const q = question;

  const updateOption = (i, val) => {
    const opts = [...(q.options || [])];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };

  const addOption = () => onChange({ ...q, options: [...(q.options || []), ""] });
  const removeOption = (i) => {
    const opts = (q.options || []).filter((_, idx) => idx !== i);
    onChange({ ...q, options: opts });
  };

  return (
    <div className="bg-slate-50 border border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate_mist uppercase tracking-wider">Q{index + 1}</span>
        <div className="flex items-center gap-2 flex-1">
          <Select value={q.type || "mcq"} onValueChange={v => onChange({ ...q, type: v })}>
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="true_false">True / False</SelectItem>
              <SelectItem value="multi_select">Multiple Select</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 ml-auto">
            <Label className="text-xs text-slate_mist whitespace-nowrap">Marks:</Label>
            <Input type="number" min={1} value={q.marks || 1}
              onChange={e => onChange({ ...q, marks: Number(e.target.value) })}
              className="h-7 w-16 text-xs" />
          </div>
        </div>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Textarea
        value={q.question || ""}
        onChange={e => onChange({ ...q, question: e.target.value })}
        placeholder="Enter question text…"
        rows={2} className="text-sm resize-none"
      />

      {q.type === "short_answer" && (
        <div>
          <Label className="text-xs text-slate_mist mb-1 block">Model Answer (for reference)</Label>
          <Textarea value={q.model_answer || ""}
            onChange={e => onChange({ ...q, model_answer: e.target.value })}
            placeholder="Enter expected answer…" rows={2} className="text-sm resize-none" />
        </div>
      )}

      {q.type === "true_false" && (
        <div className="flex gap-3">
          {["True", "False"].map((opt, i) => (
            <button key={opt}
              onClick={() => onChange({ ...q, correct_index: i })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                q.correct_index === i
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border/50 text-slate_mist hover:bg-slate-100"
              }`}>{opt}</button>
          ))}
        </div>
      )}

      {(q.type === "mcq" || q.type === "multi_select") && (
        <div className="space-y-2">
          <Label className="text-xs text-slate_mist block">
            Options {q.type === "multi_select" ? "(select all correct answers)" : "(select correct answer)"}
          </Label>
          {(q.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (q.type === "multi_select") {
                    const ca = new Set(q.correct_indices || []);
                    if (ca.has(i)) ca.delete(i); else ca.add(i);
                    onChange({ ...q, correct_indices: [...ca] });
                  } else {
                    onChange({ ...q, correct_index: i });
                  }
                }}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  (q.type === "multi_select" ? (q.correct_indices || []).includes(i) : q.correct_index === i)
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-emerald-400"
                }`}>
                {(q.type === "multi_select" ? (q.correct_indices || []).includes(i) : q.correct_index === i) && (
                  <CheckCircle className="w-3 h-3" />
                )}
              </button>
              <Input value={opt} onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 h-8 text-sm" />
              <button onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="text-xs h-7 gap-1">
            <Plus className="w-3 h-3" /> Add Option
          </Button>
        </div>
      )}

      <div>
        <Label className="text-xs text-slate_mist mb-1 block">Explanation (shown after submission)</Label>
        <Input value={q.explanation || ""}
          onChange={e => onChange({ ...q, explanation: e.target.value })}
          placeholder="Optional explanation…" className="h-8 text-sm" />
      </div>
    </div>
  );
}

const DURATION_OPTIONS = [
  { label: "15 Minutes", value: 15 },
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "1 Hour", value: 60 },
  { label: "1.5 Hours", value: 90 },
  { label: "2 Hours", value: 120 },
  { label: "3 Hours", value: 180 },
  { label: "No Limit", value: 0 },
];

function QuizModal({ topic, courses, modules, onClose, onSave }) {
  const [form, setForm] = useState(topic || {
    title: "", type: "quiz", course_id: "", module_id: "", sort_order: 0,
    passing_marks: 75, total_marks: 0, quiz_questions: [],
    time_limit_mins: 0, available_from: "", available_until: "",
  });
  const [saving, setSaving] = useState(false);

  const questions = form.quiz_questions || [];
  const totalMarks = questions.reduce((s, q) => s + (q.marks || 1), 0);

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      quiz_questions: [...(f.quiz_questions || []), {
        type: "mcq", question: "", options: ["", "", "", ""], correct_index: 0, marks: 1, explanation: ""
      }]
    }));
  };

  const updateQuestion = (i, q) => {
    const qs = [...questions]; qs[i] = q;
    setForm(f => ({ ...f, quiz_questions: qs }));
  };

  const deleteQuestion = (i) => {
    setForm(f => ({ ...f, quiz_questions: questions.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    if (!form.title) { toast.error("Title required."); return; }
    if (!form.course_id) { toast.error("Select a course."); return; }
    setSaving(true);
    const data = { ...form, total_marks: totalMarks };
    if (topic?.id) await base44.entities.CourseTopic.update(topic.id, data);
    else await base44.entities.CourseTopic.create(data);
    toast.success("Quiz saved.");
    setSaving(false);
    onSave(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">{topic ? "Edit Quiz" : "New Quiz"}</h3>
            <p className="text-xs text-slate_mist mt-0.5">{questions.length} questions · {totalMarks} total marks</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist hover:text-ink" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Row 1: Title + Pass Mark */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Quiz Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Module 1 Knowledge Check" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Passing Mark (%)</Label>
              <Input type="number" min={1} max={100} value={form.passing_marks}
                onChange={e => setForm(f => ({ ...f, passing_marks: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Row 2: Course + Module */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Course *</Label>
              <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v, module_id: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select course…" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Module</Label>
              <Select value={form.module_id} onValueChange={v => setForm(f => ({ ...f, module_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select module…" /></SelectTrigger>
                <SelectContent>
                  {modules.filter(m => !form.course_id || m.course_id === form.course_id)
                    .map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Duration + Availability */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-border/50">
            <p className="text-xs font-bold text-slate_mist uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Timing & Availability
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate_mist mb-1 block">Quiz Duration</Label>
                <Select value={String(form.time_limit_mins || 0)}
                  onValueChange={v => setForm(f => ({ ...f, time_limit_mins: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(d => (
                      <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate_mist mb-1 block">Available From</Label>
                <Input type="datetime-local" value={form.available_from || ""}
                  onChange={e => setForm(f => ({ ...f, available_from: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-slate_mist mb-1 block">Available Until</Label>
                <Input type="datetime-local" value={form.available_until || ""}
                  onChange={e => setForm(f => ({ ...f, available_until: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
            <p className="text-[10px] text-slate_mist/70">Leave dates blank for always-available. Timer only starts when student clicks "Start Quiz".</p>
          </div>

          {/* Questions */}
          <div className="border-t border-border/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs uppercase tracking-wider text-slate_mist">Questions</Label>
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5 h-7 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </Button>
            </div>
            {questions.length === 0 ? (
              <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate_mist">No questions yet. Click "Add Question" to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionEditor key={i} question={q} index={i}
                    onChange={updated => updateQuestion(i, updated)}
                    onDelete={() => deleteQuestion(i)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white gap-1.5">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Quiz"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

const ASSIGNMENT_DURATION_OPTIONS = [
  { label: "3 Days", value: 3 },
  { label: "7 Days (1 Week)", value: 7 },
  { label: "14 Days (2 Weeks)", value: 14 },
  { label: "21 Days (3 Weeks)", value: 21 },
  { label: "30 Days (1 Month)", value: 30 },
  { label: "60 Days (2 Months)", value: 60 },
  { label: "No Deadline", value: 0 },
];

// ── Assignment Builder ────────────────────────────────────────────────────────
function AssignmentModal({ assignment, courses, modules, onClose, onSave }) {
  const [form, setForm] = useState(assignment || {
    title: "", course_id: "", module_id: "", instructions: "",
    duration_days: 7, max_marks: 100, passing_marks: 50, is_published: false,
    allowed_file_types: ["pdf", "docx", "zip", "jpg", "png"],
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const save = async () => {
    if (!form.title) { toast.error("Title required."); return; }
    if (!form.course_id) { toast.error("Select a course."); return; }
    setSaving(true);
    let data = { ...form };
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      data.brief_file_url = file_url;
      data.brief_file_name = file.name;
    }
    if (assignment?.id) await base44.entities.Assignment.update(assignment.id, data);
    else await base44.entities.Assignment.create(data);
    toast.success("Assignment saved.");
    setSaving(false);
    onSave(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center px-6 py-4 border-b border-border/50 bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">{assignment ? "Edit Assignment" : "New Assignment"}</h3>
            <p className="text-xs text-slate_mist mt-0.5">Fill in the details and optionally attach a brief/instructions file</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist hover:text-ink" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Assignment Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Module 2 Practical Assignment" className="h-10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Course *</Label>
              <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v, module_id: "" }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select course…" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Module</Label>
              <Select value={form.module_id} onValueChange={v => setForm(f => ({ ...f, module_id: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select module…" /></SelectTrigger>
                <SelectContent>
                  {modules.filter(m => !form.course_id || m.course_id === form.course_id)
                    .map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Instructions</Label>
            <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              placeholder="Describe what students need to do…" rows={4} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Max Marks</Label>
              <Input type="number" min={1} value={form.max_marks}
                onChange={e => setForm(f => ({ ...f, max_marks: Number(e.target.value) }))} className="h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Passing Marks</Label>
              <Input type="number" min={0} value={form.passing_marks}
                onChange={e => setForm(f => ({ ...f, passing_marks: Number(e.target.value) }))} className="h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Duration</Label>
              <Select value={String(form.duration_days ?? 7)}
                onValueChange={v => setForm(f => ({ ...f, duration_days: Number(v) }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_DURATION_OPTIONS.map(d => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate_mist mt-1">Deadline starts from student's first access</p>
            </div>
          </div>

          {/* Assignment Brief File Upload */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">
              Assignment Brief / Instructions File <span className="normal-case font-normal text-slate_mist/70">(PDF, DOCX, etc.)</span>
            </Label>
            {form.brief_file_url && !file && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-2">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-700 flex-1 truncate">{form.brief_file_name || "Attached file"}</span>
                <a href={form.brief_file_url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0">
                  <Eye className="w-3 h-3" /> View
                </a>
              </div>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-harvest/50 hover:bg-harvest/5 transition-all select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-slate_mist" />
              </div>
              <div className="flex-1 min-w-0">
                {file ? (
                  <>
                    <p className="text-sm font-semibold text-ink truncate">{file.name}</p>
                    <p className="text-xs text-slate_mist">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate_mist">Click to attach assignment brief</p>
                    <p className="text-xs text-slate_mist/60">PDF, DOCX, ZIP, JPG, PNG supported</p>
                  </>
                )}
              </div>
              {file && (
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
              <input ref={fileInputRef} type="file" className="hidden"
                accept=".pdf,.docx,.doc,.zip,.jpg,.jpeg,.png"
                onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
              className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${form.is_published ? "bg-emerald-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? "left-5" : "left-0.5"}`} />
            </button>
            <Label className="text-sm cursor-pointer" onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}>
              {form.is_published ? "Published (visible to students)" : "Draft (hidden from students)"}
            </Label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50 flex gap-3 bg-slate-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white gap-1.5">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Assignment</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Grading Panel ─────────────────────────────────────────────────────────────
function GradingPanel({ submission, onClose, onGraded }) {
  const [marks, setMarks] = useState(submission.marks_awarded ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [status, setStatus] = useState(submission.status || "submitted");
  const [saving, setSaving] = useState(false);

  const passThreshold = submission.passing_marks || 50;
  const isPassing = marks !== "" && Number(marks) >= passThreshold;

  const save = async () => {
    if (marks === "" || Number(marks) < 0) { toast.error("Enter valid marks."); return; }
    setSaving(true);
    await base44.entities.AssignmentSubmission.update(submission.id, {
      marks_awarded: Number(marks),
      feedback,
      status: "graded",
      passed: isPassing,
      graded_date: new Date().toISOString(),
    });
    // Send grade notification email to student
    base44.functions.invoke("sendGradeFeedbackEmail", { submission_id: submission.id, action: "graded" });
    toast.success("Submission graded & student notified by email.");
    setSaving(false);
    onGraded(); onClose();
  };

  const markForResubmit = async () => {
    setSaving(true);
    await base44.entities.AssignmentSubmission.update(submission.id, {
      status: "resubmit_requested",
      feedback,
    });
    // Send resubmission request email to student
    base44.functions.invoke("sendGradeFeedbackEmail", { submission_id: submission.id, action: "resubmit" });
    toast.success("Student notified to resubmit by email.");
    setSaving(false);
    onGraded(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border/50 bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">Review & Grade Submission</h3>
            <p className="text-xs text-slate_mist mt-0.5">{submission.assignment_title}</p>
          </div>
          <button onClick={onClose} className="text-slate_mist hover:text-ink transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Student Info + Submission Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate_mist uppercase tracking-wider">Student</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{submission.user_name || "—"}</p>
                  <p className="text-xs text-slate_mist">{submission.user_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate_mist">
                <Calendar className="w-3.5 h-3.5" />
                Submitted: {new Date(submission.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate_mist uppercase tracking-wider">Assignment File</p>
              {submission.file_url ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{submission.file_name || "Submitted file"}</p>
                      <p className="text-xs text-slate_mist uppercase">{submission.file_type || "file"}</p>
                    </div>
                  </div>
                  <a href={submission.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Open / Download Submission
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate_mist italic">No file uploaded</p>
              )}
              {submission.submission_notes && (
                <div className="mt-2 bg-white border border-border/50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-slate_mist mb-0.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Student Notes
                  </p>
                  <p className="text-xs text-ink italic">"{submission.submission_notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Grading Section */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Grading</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Marks Awarded *</Label>
                  <Input type="number" min={0} max={submission.max_marks}
                    value={marks} onChange={e => setMarks(e.target.value)}
                    placeholder="0" className="h-10 text-lg font-bold text-center" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Out Of</Label>
                  <div className="h-10 flex items-center justify-center bg-slate-50 rounded-lg border border-border/50 text-lg font-bold text-slate_mist">
                    {submission.max_marks}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Result</Label>
                  <div className={`h-10 flex items-center justify-center rounded-lg text-sm font-bold ${
                    marks !== ""
                      ? isPassing ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                      : "bg-slate-100 text-slate_mist border border-border/50"
                  }`}>
                    {marks !== "" ? (isPassing ? "✓ PASS" : "✗ FAIL") : "—"}
                  </div>
                </div>
              </div>

              {marks !== "" && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-slate_mist mb-1.5">
                    <span>Score: {marks}/{submission.max_marks}</span>
                    <span>Pass threshold: {passThreshold} marks</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${isPassing ? "bg-emerald-500" : "bg-red-400"}`}
                      style={{ width: `${Math.min(100, (Number(marks) / submission.max_marks) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs font-semibold mt-1.5 ${isPassing ? "text-emerald-600" : "text-red-500"}`}>
                    {Math.round((Number(marks) / submission.max_marks) * 100)}%
                    {isPassing ? " — Passes the assignment" : ` — Needs ${passThreshold - Number(marks)} more marks to pass`}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Written Feedback for Student</Label>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback — what was done well, what needs improvement…"
                  rows={4} className="resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/50 flex flex-wrap gap-3 bg-slate-50 rounded-b-2xl">
          <Button variant="outline" onClick={markForResubmit} disabled={saving} className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50">
            Request Resubmission
          </Button>
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || marks === ""} className="bg-harvest text-white gap-1.5 font-semibold">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Submit Grade</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Admin Assessment Manager ─────────────────────────────────────────────
export default function AdminAssessmentManager({ courses }) {
  const [tab, setTab] = useState("quizzes");
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [gradingModal, setGradingModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const [quizTopics, mods, asgns, subs] = await Promise.all([
      base44.entities.CourseTopic.filter({ type: "quiz" }, "sort_order"),
      base44.entities.CourseModule.list("sort_order"),
      base44.entities.Assignment.list("-created_date"),
      base44.entities.AssignmentSubmission.list("-created_date", 200),
    ]);
    setTopics(quizTopics);
    setModules(mods);
    setAssignments(asgns);
    setSubmissions(subs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredTopics = topics.filter(t =>
    (courseFilter === "all" || t.course_id === courseFilter) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAssignments = assignments.filter(a =>
    (courseFilter === "all" || a.course_id === courseFilter) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingSubmissions = submissions.filter(s => s.status === "submitted" || s.status === "under_review");

  const getCourse = id => courses.find(c => c.id === id);
  const getModule = id => modules.find(m => m.id === id);

  const LEVEL_COLORS = {
    level1: "bg-blue-100 text-blue-700",
    level2: "bg-amber-100 text-amber-700",
    level3: "bg-purple-100 text-purple-700",
  };

  const STATUS_COLORS = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    graded: "bg-emerald-100 text-emerald-700",
    resubmit_requested: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Assessment Management</h2>
          <p className="text-sm text-slate_mist">Quizzes, assignments, grading and results.</p>
        </div>
        <Button onClick={() => setModal(tab === "quizzes" ? "new-quiz" : tab === "assignments" ? "new-assignment" : null)}
          className="bg-harvest text-white gap-1.5 text-sm h-9">
          <Plus className="w-4 h-4" /> {tab === "quizzes" ? "New Quiz" : tab === "assignments" ? "New Assignment" : ""}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Quizzes", value: topics.length, color: "text-purple-600 bg-purple-50", icon: HelpCircle },
          { label: "Assignments", value: assignments.length, color: "text-blue-600 bg-blue-50", icon: FileText },
          { label: "Pending Review", value: pendingSubmissions.length, color: "text-amber-600 bg-amber-50", icon: Clock },
          { label: "Graded", value: submissions.filter(s => s.status === "graded").length, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate_mist">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "quizzes", label: "Quizzes", icon: HelpCircle },
          { id: "assignments", label: "Assignments", icon: FileText },
          { id: "submissions", label: `Submissions${pendingSubmissions.length > 0 ? ` (${pendingSubmissions.length})` : ""}`, icon: Eye },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-white shadow text-ink" : "text-slate_mist hover:text-ink"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading…</div>
      ) : (
        <>
          {/* Quizzes Tab */}
          {tab === "quizzes" && (
            filteredTopics.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-display font-semibold text-ink mb-1">No quizzes found</p>
                <Button onClick={() => setModal("new-quiz")} className="bg-harvest text-white gap-2 mt-3">
                  <Plus className="w-4 h-4" /> Create Quiz
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border/30">
                      {["Quiz Title", "Course / Module", "Questions", "Total Marks", "Pass %", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopics.map(topic => {
                      const course = getCourse(topic.course_id);
                      const module = getModule(topic.module_id);
                      const qCount = topic.quiz_questions?.length || 0;
                      const totalMarks = (topic.quiz_questions || []).reduce((s, q) => s + (q.marks || 1), 0);
                      return (
                        <tr key={topic.id} className="border-b border-border/20 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                              </div>
                              <span className="font-medium text-ink">{topic.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-ink truncate max-w-[140px]">{course?.title || "—"}</p>
                            <p className="text-[10px] text-slate_mist">{module?.title || "—"}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-ink">{qCount}</td>
                          <td className="px-4 py-3 font-bold text-ink">{totalMarks}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              {topic.passing_marks || 75}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => setModal(topic)} className="h-7 w-7 p-0">
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                if (!confirm(`Delete "${topic.title}"?`)) return;
                                await base44.entities.CourseTopic.delete(topic.id);
                                toast.success("Deleted."); load();
                              }} className="h-7 w-7 p-0 text-destructive border-destructive/30">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Assignments Tab */}
          {tab === "assignments" && (
            filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-display font-semibold text-ink mb-1">No assignments found</p>
                <Button onClick={() => setModal("new-assignment")} className="bg-harvest text-white gap-2 mt-3">
                  <Plus className="w-4 h-4" /> Create Assignment
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border/30">
                      {["Assignment", "Course / Module", "Max Marks", "Due Date", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map(a => {
                      const course = getCourse(a.course_id);
                      const module = getModule(a.module_id);
                      const subCount = submissions.filter(s => s.assignment_id === a.id).length;
                      return (
                        <tr key={a.id} className="border-b border-border/20 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-medium text-ink block">{a.title}</span>
                                <span className="text-[10px] text-slate_mist">{subCount} submission{subCount !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-ink truncate max-w-[140px]">{course?.title || "—"}</p>
                            <p className="text-[10px] text-slate_mist">{module?.title || "—"}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-ink">{a.max_marks}</td>
                          <td className="px-4 py-3 text-xs text-slate_mist">
                            {a.due_date ? new Date(a.due_date).toLocaleDateString("en-AU") : "No due date"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate_mist"}`}>
                              {a.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => setModal(a)} className="h-7 w-7 p-0">
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                if (!confirm(`Delete "${a.title}"?`)) return;
                                await base44.entities.Assignment.delete(a.id);
                                toast.success("Deleted."); load();
                              }} className="h-7 w-7 p-0 text-destructive border-destructive/30">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Submissions Tab */}
          {tab === "submissions" && (
            submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
                <Eye className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate_mist">No submissions yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border/30">
                      {["Student", "Assignment", "Submitted", "Status", "Marks", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub.id} className="border-b border-border/20 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink text-xs">{sub.user_name || "—"}</p>
                          <p className="text-[10px] text-slate_mist">{sub.user_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-ink font-medium truncate max-w-[160px]">{sub.assignment_title}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate_mist">
                          {new Date(sub.created_date).toLocaleDateString("en-AU")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status] || "bg-slate-100 text-slate_mist"}`}>
                            {sub.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.marks_awarded !== undefined && sub.marks_awarded !== null
                            ? <span className={`font-bold text-sm ${sub.passed ? "text-emerald-600" : "text-red-500"}`}>
                                {sub.marks_awarded}/{sub.max_marks}
                              </span>
                            : <span className="text-slate_mist text-xs">Not graded</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {sub.file_url && (
                              <a href={sub.file_url} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                  <Eye className="w-3 h-3" /> View
                                </Button>
                              </a>
                            )}
                            <Button size="sm" onClick={() => setGradingModal(sub)}
                              className="h-7 text-xs bg-harvest text-white gap-1">
                              <CheckCircle className="w-3 h-3" /> Grade
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Modals */}
      {(modal === "new-quiz" || (modal && modal.type === "quiz")) && (
        <QuizModal
          topic={modal === "new-quiz" ? null : modal}
          courses={courses} modules={modules}
          onClose={() => setModal(null)} onSave={load}
        />
      )}
      {(modal === "new-assignment" || (modal && modal.max_marks !== undefined && modal.type !== "quiz")) && (
        <AssignmentModal
          assignment={modal === "new-assignment" ? null : modal}
          courses={courses} modules={modules}
          onClose={() => setModal(null)} onSave={load}
        />
      )}
      {gradingModal && (
        <GradingPanel
          submission={gradingModal}
          onClose={() => setGradingModal(null)} onGraded={load}
        />
      )}
    </div>
  );
}