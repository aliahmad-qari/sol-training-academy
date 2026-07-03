import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  HelpCircle, Search, Edit2, Trash2, Plus, Save, X, CheckCircle, BarChart3, Sparkles
} from "lucide-react";
import AIQuizGenerator from "@/components/lms/admin/AIQuizGenerator";
import AIQuizQuestionsPanel from "@/components/lms/admin/AIQuizQuestionsPanel";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700",
};

// ── Reusable Question Editor ───────────────────────────────────────────────────
function QuestionEditor({ question, index, onChange, onDelete }) {
  const q = question;

  const updateOption = (i, val) => {
    const opts = [...(q.options || [])];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };

  const addOption = () => onChange({ ...q, options: [...(q.options || []), ""] });
  const removeOption = (i) => onChange({ ...q, options: (q.options || []).filter((_, idx) => idx !== i) });

  return (
    <div className="bg-slate-50 border border-border/50 rounded-xl p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate_mist bg-slate-200 px-2 py-0.5 rounded-full">Q{index + 1}</span>

        <Select value={q.type || "mcq"} onValueChange={v => onChange({ ...q, type: v })}>
          <SelectTrigger className="h-7 w-44 text-xs flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
            <SelectItem value="true_false">True / False</SelectItem>
            <SelectItem value="multi_select">Multiple Select</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 ml-auto">
          <Label className="text-xs text-slate_mist whitespace-nowrap font-semibold">Marks:</Label>
          <Input
            type="number" min={1}
            value={q.marks !== undefined ? q.marks : 1}
            onChange={e => onChange({ ...q, marks: Number(e.target.value) })}
            className="h-7 w-16 text-xs text-center font-bold"
          />
        </div>

        <button onClick={onDelete} className="ml-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Question Text */}
      <Textarea
        value={q.question || ""}
        onChange={e => onChange({ ...q, question: e.target.value })}
        placeholder={`Enter question ${index + 1} text here…`}
        rows={2} className="text-sm resize-none"
      />

      {/* Short Answer model */}
      {q.type === "short_answer" && (
        <div>
          <Label className="text-xs text-slate_mist mb-1 block">Model Answer (for marker reference)</Label>
          <Textarea value={q.model_answer || ""}
            onChange={e => onChange({ ...q, model_answer: e.target.value })}
            placeholder="Enter the expected answer for reference…" rows={2} className="text-sm resize-none" />
        </div>
      )}

      {/* True / False */}
      {q.type === "true_false" && (
        <div>
          <Label className="text-xs text-slate_mist mb-2 block">Select correct answer:</Label>
          <div className="flex gap-3">
            {["True", "False"].map((opt, i) => (
              <button key={opt} type="button"
                onClick={() => onChange({ ...q, correct_index: i })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  q.correct_index === i
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "border-border/50 text-slate_mist hover:bg-slate-100 hover:border-slate-300"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {/* MCQ / Multi-select Options */}
      {(q.type === "mcq" || q.type === "multi_select" || !q.type) && (
        <div className="space-y-2">
          <Label className="text-xs text-slate_mist block">
            {q.type === "multi_select"
              ? "Answer Options — click checkboxes to mark ALL correct answers"
              : "Answer Options — click circle to mark the correct answer"}
          </Label>
          {(q.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Correct toggle */}
              <button type="button"
                onClick={() => {
                  if (q.type === "multi_select") {
                    const ca = new Set(q.correct_indices || []);
                    if (ca.has(i)) ca.delete(i); else ca.add(i);
                    onChange({ ...q, correct_indices: [...ca] });
                  } else {
                    onChange({ ...q, correct_index: i });
                  }
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  (q.type === "multi_select"
                    ? (q.correct_indices || []).includes(i)
                    : q.correct_index === i)
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-emerald-400"
                }`}>
                {(q.type === "multi_select" ? (q.correct_indices || []).includes(i) : q.correct_index === i) && (
                  <CheckCircle className="w-3 h-3" />
                )}
              </button>

              <span className="text-xs font-bold text-slate_mist w-5 flex-shrink-0">
                {String.fromCharCode(65 + i)}.
              </span>

              <Input value={opt} onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 h-8 text-sm" />

              {(q.options || []).length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={addOption} className="text-xs h-7 gap-1">
            <Plus className="w-3 h-3" /> Add Option
          </Button>
        </div>
      )}

      {/* Explanation */}
      <div>
        <Label className="text-xs text-slate_mist mb-1 block">Explanation (displayed to student after submission)</Label>
        <Input value={q.explanation || ""}
          onChange={e => onChange({ ...q, explanation: e.target.value })}
          placeholder="Optional — explain the correct answer…" className="h-8 text-sm" />
      </div>
    </div>
  );
}

// ── Quiz Modal ─────────────────────────────────────────────────────────────────
function QuizModal({ topic, modules, courses, onClose, onSave }) {
  const [form, setForm] = useState(topic || {
    title: "", type: "quiz", module_id: "", course_id: "",
    sort_order: 0, passing_marks: 75, quiz_questions: [],
  });
  const [saving, setSaving] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const questions = form.quiz_questions || [];
  const totalMarks = questions.reduce((s, q) => s + (q.marks !== undefined ? q.marks : 1), 0);

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      quiz_questions: [...(f.quiz_questions || []), {
        type: "mcq", question: "", options: ["", "", "", ""],
        correct_index: 0, marks: 1, explanation: "",
      }],
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
    if (!form.title) { toast.error("Quiz title is required."); return; }
    if (!form.course_id) { toast.error("Please select a course."); return; }
    setSaving(true);
    const data = { ...form, total_marks: totalMarks };
    if (topic?.id) await base44.entities.CourseTopic.update(topic.id, data);
    else await base44.entities.CourseTopic.create(data);
    toast.success("Quiz saved successfully.");
    setSaving(false);
    onSave(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border/50 bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">{topic ? "Edit Quiz" : "Create New Quiz"}</h3>
            <p className="text-xs text-slate_mist mt-0.5">
              {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalMarks} total marks · {form.passing_marks}% to pass
            </p>
          </div>
          <button onClick={onClose} className="text-slate_mist hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Quiz Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Module 1 Knowledge Check" className="h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Passing Score (%)</Label>
              <Input type="number" min={1} max={100} value={form.passing_marks}
                onChange={e => setForm(f => ({ ...f, passing_marks: Number(e.target.value) }))}
                className="h-10" />
            </div>
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
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Module (Optional)</Label>
              <Select value={form.module_id} onValueChange={v => setForm(f => ({ ...f, module_id: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select module…" /></SelectTrigger>
                <SelectContent>
                  {modules.filter(m => !form.course_id || m.course_id === form.course_id)
                    .map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1.5 block font-semibold">Sort Order</Label>
              <Input type="number" value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="h-10 w-32" />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-border/30 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-sm font-display font-semibold text-ink">Quiz Questions</Label>
                <p className="text-xs text-slate_mist mt-0.5">Total marks: <strong>{totalMarks}</strong></p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button"
                  onClick={() => setShowAIPanel(v => !v)}
                  className="gap-1.5 h-8 text-xs font-semibold border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate
                </Button>
                <Button variant="outline" size="sm" type="button" onClick={addQuestion} className="gap-1.5 h-8 text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </Button>
              </div>
            </div>

            {/* AI Questions Panel */}
            <AnimatePresence>
              {showAIPanel && (
                <div className="mb-4">
                  <AIQuizQuestionsPanel
                    onAddQuestions={(qs) => setForm(f => ({ ...f, quiz_questions: [...(f.quiz_questions || []), ...qs] }))}
                    onClose={() => setShowAIPanel(false)}
                  />
                </div>
              )}
            </AnimatePresence>

            {questions.length === 0 ? (
              <div className="border-2 border-dashed border-border/40 rounded-xl p-10 text-center">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-display font-semibold text-ink mb-1">No Questions Yet</p>
                <p className="text-sm text-slate_mist mb-4">Add MCQ, True/False, Multiple Select, or Short Answer questions.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" type="button"
                    onClick={() => setShowAIPanel(true)}
                    className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Sparkles className="w-3.5 h-3.5" /> AI Generate
                  </Button>
                  <Button variant="outline" size="sm" type="button" onClick={addQuestion} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionEditor
                    key={i} question={q} index={i}
                    onChange={updated => updateQuestion(i, updated)}
                    onDelete={() => deleteQuestion(i)}
                  />
                ))}
                <button type="button" onClick={addQuestion}
                  className="w-full py-3 border-2 border-dashed border-border/40 rounded-xl text-sm text-slate_mist hover:border-harvest/50 hover:text-harvest hover:bg-harvest/5 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Another Question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex gap-3 bg-slate-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white gap-1.5 font-semibold">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : `Save Quiz (${questions.length} Qs · ${totalMarks} marks)`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Admin Quiz Manager ────────────────────────────────────────────────────
export default function AdminQuizManager({ courses }) {
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const load = async () => {
    setLoading(true);
    const [quizTopics, mods] = await Promise.all([
      base44.entities.CourseTopic.filter({ type: "quiz" }, "sort_order"),
      base44.entities.CourseModule.list("sort_order"),
    ]);
    setTopics(quizTopics);
    setModules(mods);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = topics.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
    (courseFilter === "all" || t.course_id === courseFilter)
  );

  const deleteQuiz = async (topic) => {
    if (!confirm(`Delete quiz "${topic.title}"?`)) return;
    await base44.entities.CourseTopic.delete(topic.id);
    toast.success("Quiz deleted.");
    load();
  };

  const getCourse = id => courses.find(c => c.id === id);
  const getModule = id => modules.find(m => m.id === id);

  const totalQuestions = topics.reduce((s, t) => s + (t.quiz_questions?.length || 0), 0);
  const totalMarksAll = topics.reduce((s, t) => s + (t.quiz_questions || []).reduce((m, q) => m + (q.marks || 1), 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Quiz Management</h2>
          <p className="text-sm text-slate_mist">Create MCQ, True/False, Multiple Select, and Short Answer quizzes.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAIGenerator(true)} variant="outline"
            className="gap-1.5 text-sm h-9 border-purple-300 text-purple-700 hover:bg-purple-50">
            <Sparkles className="w-4 h-4" /> AI Generate
          </Button>
          <Button onClick={() => setModal("new")} className="bg-harvest text-white gap-1.5 text-sm h-9">
            <Plus className="w-4 h-4" /> New Quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Quizzes", value: topics.length, color: "text-purple-600 bg-purple-50" },
          { label: "Total Questions", value: totalQuestions, color: "text-blue-600 bg-blue-50" },
          { label: "Total Marks", value: totalMarksAll, color: "text-amber-600 bg-amber-50" },
          { label: "Avg Pass Score", value: topics.length > 0 ? `${Math.round(topics.reduce((s, t) => s + (t.passing_marks || 75), 0) / topics.length)}%` : "—", color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate_mist">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={courseFilter} onValueChange={setFilter}>
          <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading quizzes…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-display font-semibold text-ink mb-1">No quizzes found</p>
          <p className="text-sm text-slate_mist mb-4">Create professional quizzes with MCQ, True/False, and more.</p>
          <Button onClick={() => setModal("new")} className="bg-harvest text-white gap-2">
            <Plus className="w-4 h-4" /> Create Quiz
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Quiz Title", "Course / Module", "Questions", "Total Marks", "Pass Score", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(topic => {
                  const course = getCourse(topic.course_id);
                  const module = getModule(topic.module_id);
                  const qCount = topic.quiz_questions?.length || 0;
                  const totalMarks = (topic.quiz_questions || []).reduce((s, q) => s + (q.marks !== undefined ? q.marks : 1), 0);
                  const typeBreakdown = (topic.quiz_questions || []).reduce((acc, q) => {
                    const t = q.type || "mcq";
                    acc[t] = (acc[t] || 0) + 1;
                    return acc;
                  }, {});
                  return (
                    <tr key={topic.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-ink block">{topic.title}</span>
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {Object.entries(typeBreakdown).map(([type, count]) => (
                                <span key={type} className="text-[9px] bg-slate-100 text-slate_mist px-1.5 py-0.5 rounded-full font-medium">
                                  {count} {type.replace("_", "/").toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-ink truncate max-w-[140px]">{course?.title || "—"}</p>
                        {course && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                            {course.level?.replace("level", "Level ")}
                          </span>
                        )}
                        {module && <p className="text-[10px] text-slate_mist mt-0.5 truncate max-w-[140px]">{module.title}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-ink text-lg">{qCount}</span>
                        <span className="text-slate_mist text-xs ml-1">questions</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-ink text-lg">{totalMarks}</span>
                        <span className="text-slate_mist text-xs ml-1">marks</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> {topic.passing_marks || 75}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setModal(topic)} className="h-8 px-3 text-xs gap-1.5">
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteQuiz(topic)}
                            className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/5">
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
          <div className="p-3 border-t border-border/20 text-xs text-slate_mist flex items-center justify-between">
            <span>{filtered.length} of {topics.length} quizzes</span>
            <span>{totalQuestions} questions · {totalMarksAll} total marks</span>
          </div>
        </div>
      )}

      {modal && (
        <QuizModal
          topic={modal === "new" ? null : modal}
          modules={modules}
          courses={courses}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}

      {showAIGenerator && (
        <AIQuizGenerator
          courses={courses}
          modules={modules}
          onClose={() => setShowAIGenerator(false)}
          onSave={load}
        />
      )}
    </div>
  );
}