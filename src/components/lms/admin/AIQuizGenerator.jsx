import React, { useState } from "react";
import { runAdminTool } from "@/api/aiClient";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Sparkles, X, Loader2, Save, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AIQuizGenerator({ courses, modules, onClose, onSave }) {
  const [step, setStep] = useState("configure"); // configure | preview | saving
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Config
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [content, setContent] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mcq");
  const [passingScore, setPassingScore] = useState(75);

  // Generated
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const courseMods = modules.filter(m => m.course_id === courseId);

  const generate = async () => {
    if (!content.trim()) { toast.error("Please paste some content first."); return; }
    if (!courseId) { toast.error("Please select a course."); return; }
    if (!moduleId) { toast.error("Please select a module - quizzes must belong to a module."); return; }
    if (!quizTitle.trim()) { toast.error("Please enter a quiz title."); return; }

    setGenerating(true);
    try {
      const result = await runAdminTool('quizgenerator', {
        content,
        numQuestions,
        difficulty,
        questionType,
      });
      const questions = (result.questions || []).map(q => {
        if (q.type === "true_false") {
          return { type: "true_false", question: q.question, correct_index: q.correct_index ?? 0, marks: 1, explanation: q.explanation || "" };
        }
        return { type: "mcq", question: q.question, options: q.options || ["", "", "", ""], correct_index: q.correct_index ?? 0, marks: 1, explanation: q.explanation || "" };
      });
      if (questions.length !== numQuestions) {
        toast.warning(`AI returned ${questions.length} of ${numQuestions} requested questions. Add more source content or regenerate for a full set.`);
      }
      setGeneratedQuestions(questions);
      setStep("preview");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveQuiz = async () => {
    if (!moduleId) { toast.error("Please select a module before saving."); return; }
    setSaving(true);
    try {
      const totalMarks = generatedQuestions.reduce((s, q) => s + (q.marks || 1), 0);
      // `passingScore` is a PERCENTAGE from the UI, but the whole system stores
      // `passing_marks` as ABSOLUTE marks (see TopicModal + quiz.controller
      // gradeAnswers: passed = score >= passing_marks). Convert here, otherwise
      // e.g. 75% on a 5-mark quiz would be saved as "needs 75/5" â€” impossible to pass.
      const passingMarks = Math.max(1, Math.round((passingScore / 100) * totalMarks));
      await base44.entities.CourseTopic.create({
        type: "quiz",
        title: quizTitle,
        course_id: courseId,
        module_id: moduleId,
        sort_order: 0,
        passing_marks: passingMarks,
        total_marks: totalMarks,
        quiz_questions: generatedQuestions,
      });
      toast.success(`Quiz "${quizTitle}" saved with ${generatedQuestions.length} AI-generated questions!`);
      onSave();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (i, field, value) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink">AI Quiz Generator</h3>
              <p className="text-xs text-slate_mist">Paste content â†’ AI creates questions automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate_mist hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-0">
          {[
            { id: "configure", label: "1. Configure" },
            { id: "preview",   label: "2. Review & Save" },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                step === s.id ? "bg-purple-600 text-white" : step === "preview" && s.id === "configure" ? "bg-emerald-100 text-emerald-700" : "text-slate_mist"
              }`}>
                {step === "preview" && s.id === "configure" && <CheckCircle className="w-3 h-3" />}
                {s.label}
              </div>
              {i === 0 && <div className="w-6 h-px bg-border/50 mx-1" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* â”€â”€ CONFIGURE STEP â”€â”€ */}
          {step === "configure" && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course *</Label>
                  <Select value={courseId} onValueChange={v => { setCourseId(v); setModuleId(""); }}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select courseâ€¦" /></SelectTrigger>
                    <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Module *</Label>
                  <Select value={moduleId} onValueChange={setModuleId} disabled={!courseId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={courseId ? "Select moduleâ€¦" : "Select a course first"} /></SelectTrigger>
                    <SelectContent>{courseMods.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
                  </Select>
                  {courseId && courseMods.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">This course has no modules yet â€” create one before adding a quiz.</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Quiz Title *</Label>
                <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                  placeholder="e.g. Module 2 Knowledge Check" className="h-10" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">No. of Questions</Label>
                  <Select value={String(numQuestions)} onValueChange={v => setNumQuestions(Number(v))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 5, 8, 10, 15, 20].map(n => <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Question Type</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ Only</SelectItem>
                      <SelectItem value="true_false">True/False Only</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">
                  Passing Score (%) â€” students need this % to pass
                </Label>
                <Input type="number" min={1} max={100} value={passingScore}
                  onChange={e => setPassingScore(Number(e.target.value))}
                  className="h-10 w-32" />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">
                  Course Content / Topic Material *
                </Label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste your course notes, lecture content, module text, or any learning material here. The AI will generate quiz questions based on this contentâ€¦"
                  rows={8}
                  className="text-sm resize-none"
                />
                <p className="text-[10px] text-slate_mist mt-1">
                  {content.length} characters Â· Tip: more content = better, more varied questions
                </p>
              </div>
            </>
          )}

          {/* â”€â”€ PREVIEW STEP â”€â”€ */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {generatedQuestions.length} questions generated for <span className="text-purple-700">{quizTitle}</span>
                  </p>
                  <p className="text-xs text-slate_mist mt-0.5">
                    Review below. You can edit question text or correct answers before saving.
                  </p>
                </div>
              </div>

              {generatedQuestions.map((q, i) => (
                <div key={i} className="bg-white border border-border/50 rounded-xl p-4 space-y-3">
                  {/* Question header */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Q{i + 1}</span>
                    <span className="text-[10px] bg-slate-100 text-slate_mist px-2 py-0.5 rounded-full font-medium uppercase">
                      {q.type === "true_false" ? "True/False" : "MCQ"}
                    </span>
                  </div>

                  {/* Question text */}
                  <Textarea
                    value={q.question}
                    onChange={e => updateQuestion(i, "question", e.target.value)}
                    rows={2} className="text-sm resize-none font-medium"
                  />

                  {/* Options for MCQ */}
                  {q.type === "mcq" && (
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          q.correct_index === oi ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-border/40"
                        }`}>
                          <button type="button"
                            onClick={() => updateQuestion(i, "correct_index", oi)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              q.correct_index === oi ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                            }`}>
                            {q.correct_index === oi && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          <span className="text-xs font-bold text-slate_mist w-4">{String.fromCharCode(65 + oi)}.</span>
                          <Input value={opt}
                            onChange={e => {
                              const opts = [...(q.options || [])]; opts[oi] = e.target.value;
                              updateQuestion(i, "options", opts);
                            }}
                            className="flex-1 h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {q.type === "true_false" && (
                    <div className="flex gap-2">
                      {["True", "False"].map((opt, oi) => (
                        <button key={opt} type="button"
                          onClick={() => updateQuestion(i, "correct_index", oi)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            q.correct_index === oi
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-border/50 text-slate_mist hover:bg-slate-50"
                          }`}>{opt}</button>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-xs text-blue-800">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-slate-50 rounded-b-2xl flex gap-3">
          {step === "configure" ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={generate} disabled={generating}
                className="flex-2 bg-purple-600 hover:bg-purple-700 text-white gap-2 flex-1">
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generatingâ€¦</>
                  : <><Sparkles className="w-4 h-4" /> Generate {numQuestions} Questions</>
                }
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("configure")} className="gap-1.5">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </Button>
              <Button onClick={saveQuiz} disabled={saving}
                className="flex-1 bg-harvest text-white gap-2 font-semibold">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Savingâ€¦</>
                  : <><Save className="w-4 h-4" /> Save Quiz ({generatedQuestions.length} Questions)</>
                }
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

