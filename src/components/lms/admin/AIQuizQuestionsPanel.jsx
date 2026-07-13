import React, { useState } from "react";
import { runAdminTool } from "@/api/aiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, CheckCircle, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/**
 * Inline AI question generator panel — generates questions and lets you
 * append selected ones to the current quiz being edited.
 *
 * Props:
 *   onAddQuestions(questions[]) — called with the questions to append
 *   onClose() — called to close the panel
 */
export default function AIQuizQuestionsPanel({ onAddQuestions, onClose }) {
  const [content, setContent] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mcq");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const generate = async () => {
    if (!content.trim()) { toast.error("Please paste some content first."); return; }
    setGenerating(true);
    setGenerated([]);
    setSelected(new Set());

    try {
      // Backend owns the prompt + JSON schema (ADMIN_TOOLS.quizgenerator); we
      // only send structured inputs. Same tool the AIQuizGenerator modal uses.
      const result = await runAdminTool("quizgenerator", {
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

      if (questions.length === 0) {
        toast.error("The AI didn't return any questions. Try adding more content and regenerate.");
        return;
      }

      if (questions.length !== numQuestions) {
        toast.warning(`AI returned ${questions.length} of ${numQuestions} requested questions. Add more source content or regenerate for a full set.`);
      }
      setGenerated(questions);
      setSelected(new Set(questions.map((_, i) => i))); // select all by default
      toast.success(`${questions.length} questions generated!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleAdd = () => {
    const toAdd = generated.filter((_, i) => selected.has(i));
    if (!toAdd.length) { toast.error("Select at least one question."); return; }
    onAddQuestions(toAdd);
    toast.success(`${toAdd.length} question${toAdd.length !== 1 ? "s" : ""} added to quiz!`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="border-2 border-purple-200 bg-purple-50/50 rounded-2xl overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-100 to-blue-50 border-b border-purple-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-ink">AI Question Generator</p>
            <p className="text-[10px] text-slate-500">Paste content → AI creates questions → add to this quiz</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-ink transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Config row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Questions</Label>
            <Select value={String(numQuestions)} onValueChange={v => setNumQuestions(Number(v))}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 8, 10, 15, 20].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">MCQ Only</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content textarea */}
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
            Course / Topic Content *
          </Label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your course notes, module text, or any learning material here…"
            rows={4}
            className="text-sm resize-none bg-white"
          />
          <p className="text-[10px] text-slate-400 mt-1">{content.length} characters</p>
        </div>

        <Button onClick={generate} disabled={generating || !content.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 h-9">
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating questions…</>
            : <><Sparkles className="w-4 h-4" /> Generate {numQuestions} Questions</>
          }
        </Button>

        {/* Generated questions preview */}
        <AnimatePresence>
          {generated.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">{generated.length} questions generated — select which to add:</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(generated.map((_, i) => i)))}
                    className="text-[10px] text-purple-600 hover:underline font-semibold">Select all</button>
                  <button onClick={() => setSelected(new Set())}
                    className="text-[10px] text-slate-500 hover:underline font-semibold">Clear</button>
                </div>
              </div>

              {generated.map((q, i) => (
                <div key={i}
                  onClick={() => toggleSelect(i)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${
                    selected.has(i)
                      ? "bg-white border-purple-300 shadow-sm"
                      : "bg-slate-50 border-border/30 opacity-60"
                  }`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      selected.has(i) ? "bg-purple-600 border-purple-600" : "border-slate-300"
                    }`}>
                      {selected.has(i) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Q{i + 1}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-medium">
                          {q.type === "true_false" ? "True/False" : "MCQ"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-ink">{q.question}</p>
                      {q.type === "mcq" && q.options && (
                        <div className="mt-1.5 space-y-0.5">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className={`text-xs px-2 py-0.5 rounded ${
                              q.correct_index === oi ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-slate-500"
                            }`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </p>
                          ))}
                        </div>
                      )}
                      {q.type === "true_false" && (
                        <p className="text-xs mt-1 font-semibold text-emerald-700">
                          âœ“ {q.correct_index === 0 ? "True" : "False"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={generate} disabled={generating} className="gap-1.5 text-xs h-8">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </Button>
                <Button onClick={handleAdd} disabled={selected.size === 0}
                  className="flex-1 bg-harvest text-white gap-1.5 text-sm h-8 font-semibold">
                  <Plus className="w-4 h-4" /> Add {selected.size} Question{selected.size !== 1 ? "s" : ""} to Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

