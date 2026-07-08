import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { runStudentTool } from "@/api/aiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, MessageSquare, Layers, Loader2,
  ChevronRight, ArrowLeft, RefreshCw, Copy, CheckCircle, Lightbulb,
  Upload, FileText, X, PenLine, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/* ── Tool Card ── */
function ToolCard({ tool, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white border border-border/50 rounded-2xl p-5 text-left hover:shadow-lg transition-all group w-full"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tool.bg}`}>
        <tool.icon className={`w-5 h-5 ${tool.color}`} />
      </div>
      <h3 className="font-display font-semibold text-ink mb-1 group-hover:text-harvest transition-colors">{tool.title}</h3>
      <p className="text-xs text-slate_mist leading-relaxed">{tool.desc}</p>
      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-harvest">
        Open Tool <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </motion.button>
  );
}

/* ── Result Box ── */
function ResultBox({ content, onCopy }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-slate-50 border border-border/50 rounded-xl p-4 relative">
      <button onClick={copy} className="absolute top-3 right-3 text-slate_mist hover:text-ink transition-colors">
        {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="text-sm text-ink whitespace-pre-wrap leading-relaxed pr-8 font-body">{content}</pre>
    </div>
  );
}

/* ── Study Buddy ── */
function StudyBuddy() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("simple");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!topic.trim()) { toast.error("Please enter a topic."); return; }
    setLoading(true); setResult("");
    try {
      const res = await runStudentTool("studybuddy", { topic, level });
      setResult(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Topic or Concept</Label>
        <Textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. NDIS support coordination, restrictive practices, capacity building…"
          rows={3} className="resize-none text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Explanation Level</Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple — beginner friendly</SelectItem>
            <SelectItem value="intermediate">Intermediate — some background</SelectItem>
            <SelectItem value="advanced">Advanced — detailed & technical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Explaining…</> : <><Sparkles className="w-4 h-4" /> Explain This Topic</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Assignment Feedback ── */
function AssignmentFeedback() {
  const [draft, setDraft] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null); // { name }
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["pdf", "docx", "txt", "doc"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) { toast.error("Please upload a PDF, DOCX, or TXT file."); return; }
    setUploading(true);
    setUploadedFile(null);
    setDraft("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        mimeType: file.type,
        fileName: file.name,
      });
      if (extracted.status === "success") {
        const text = extracted.output?.text || JSON.stringify(extracted.output);
        setDraft(text);
        setUploadedFile({ name: file.name });
        toast.success("File extracted successfully!");
      } else {
        toast.error(extracted.error || "Could not read the file. Try pasting the text instead.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not read the file. Try pasting the text instead.");
    } finally {
      setUploading(false);
    }
  };

  const run = async () => {
    if (!draft.trim()) { toast.error("Please upload a file or paste your draft first."); return; }
    setLoading(true); setResult("");
    try {
      const res = await runStudentTool("feedback", { instructions, draft });
      setResult(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Assignment Instructions (Optional)</Label>
        <Input value={instructions} onChange={e => setInstructions(e.target.value)}
          placeholder="e.g. Describe the role of a support coordinator in NDIS planning…" className="h-10 text-sm" />
      </div>

      {/* Upload or paste toggle */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Your Draft *</Label>

        {/* File upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all mb-3"
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFileUpload} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Extracting text from file…</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-700">{uploadedFile.name}</p>
              <button onClick={e => { e.stopPropagation(); setUploadedFile(null); setDraft(""); }}
                className="text-slate_mist hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-6 h-6 text-blue-400" />
              <p className="text-sm font-semibold text-blue-600">Upload your file</p>
              <p className="text-xs text-slate_mist">PDF, DOCX, or TXT — click to browse</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate_mist text-center mb-2">— or paste text below —</p>
        <Textarea value={draft} onChange={e => { setDraft(e.target.value); setUploadedFile(null); }}
          placeholder="Paste your assignment draft here for AI review…"
          rows={6} className="resize-none text-sm" />
      </div>

      <Button onClick={run} disabled={loading || uploading || !draft.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing…</> : <><Sparkles className="w-4 h-4" /> Get AI Feedback</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Course Recommender ── */
function CourseRecommender({ enrollments, quizAttempts, courses }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    setLoading(true); setResult("");
    try {
      const summary = enrollments.map(e => ({
        course: e.course_title,
        progress: `${e.progress_percent || 0}%`,
        status: e.status,
      }));
      const avgScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / quizAttempts.length)
        : null;
      const passRate = quizAttempts.length > 0
        ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100)
        : 0;
      const res = await runStudentTool("recommender", { summary, avgScore, passRate });
      setResult(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-ink">Personalised Recommendations</p>
        </div>
        <p className="text-xs text-slate_mist">
          AI will analyse your {enrollments.length} enrollment(s) and {quizAttempts.length} quiz attempt(s) to recommend your optimal learning path.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Enrolled Courses", value: enrollments.length },
          { label: "Quiz Attempts", value: quizAttempts.length },
          { label: "Avg Score", value: quizAttempts.length > 0 ? `${Math.round(quizAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / quizAttempts.length)}%` : "—" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border/50 rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </div>
        ))}
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> Get My Recommendations</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Flashcard Generator ── */
function FlashcardGenerator() {
  const [content, setContent] = useState("");
  const [count, setCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const run = async () => {
    if (!content.trim()) { toast.error("Paste some content first."); return; }
    setLoading(true); setCards([]); setCurrent(0); setFlipped(false);
    try {
      const res = await runStudentTool("flashcards", { content, count });
      setCards(res.flashcards || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cards.length > 0) {
    const card = cards[current];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate_mist">Card {current + 1} of {cards.length}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCards([]); setCurrent(0); setFlipped(false); }}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> New Set
            </Button>
          </div>
        </div>
        <div className="w-full h-48 cursor-pointer" onClick={() => setFlipped(f => !f)}>
          <div className={`w-full h-full rounded-2xl border-2 flex items-center justify-center p-6 text-center transition-all duration-300 ${
            flipped ? "bg-harvest/10 border-harvest" : "bg-white border-border/50"
          }`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-slate_mist">
                {flipped ? "Answer" : "Question — tap to reveal"}
              </p>
              <p className="text-ink font-semibold text-base leading-snug">
                {flipped ? card.back : card.front}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={current === 0} onClick={() => { setCurrent(c => c - 1); setFlipped(false); }} className="flex-1">← Prev</Button>
          <Button disabled={current === cards.length - 1} onClick={() => { setCurrent(c => c + 1); setFlipped(false); }} className="flex-1 bg-harvest text-white">Next →</Button>
        </div>
        <div className="flex gap-1 justify-center flex-wrap">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setFlipped(false); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-harvest w-4" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Content *</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Paste your course notes, reading material, or any content to turn into flashcards…"
          rows={7} className="resize-none text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Number of Flashcards</Label>
        <Select value={count} onValueChange={setCount}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["5", "10", "15", "20"].map(n => <SelectItem key={n} value={n}>{n} cards</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Flashcards</>}
      </Button>
    </div>
  );
}

/* ── Essay/Assignment Writer Assistant ── */
function AssignmentWriter() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("brainstorm");
  const [level, setLevel] = useState("level1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!topic.trim()) { toast.error("Please enter your assignment topic."); return; }
    setLoading(true); setResult("");
    try {
      const res = await runStudentTool("writer", { topic, type, level });
      setResult(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Assignment Topic or Question *</Label>
        <Textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Discuss the role of a support coordinator in developing an NDIS plan that builds participant capacity…"
          rows={3} className="resize-none text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">What do you need?</Label>
          <div className="flex flex-col gap-2">
            {[
              { value: "brainstorm", label: "💡 Brainstorm Ideas", desc: "Generate angles & arguments" },
              { value: "outline",    label: "📋 Assignment Outline", desc: "Structure with sections" },
              { value: "draft",      label: "✍️ First Draft",        desc: "Full written draft" },
            ].map(o => (
              <button key={o.value} onClick={() => setType(o.value)}
                className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  type === o.value ? "border-harvest bg-harvest/10" : "border-border/50 hover:border-harvest/40"
                }`}>
                <div>
                  <p className="text-xs font-semibold text-ink">{o.label}</p>
                  <p className="text-[11px] text-slate_mist">{o.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Level</Label>
          <select value={level} onChange={e => setLevel(e.target.value)}
            className="w-full h-10 border border-input rounded-md px-3 text-sm bg-transparent">
            <option value="level1">Level 1 — Foundation</option>
            <option value="level2">Level 2 — Professional</option>
            <option value="level3">Level 3 — Advanced</option>
          </select>
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Working…</> : <><PenLine className="w-4 h-4" /> Generate {type === "brainstorm" ? "Ideas" : type === "outline" ? "Outline" : "Draft"}</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── AI Concept Explainer ── */
function ConceptExplainer() {
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("simple");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!concept.trim()) { toast.error("Please enter a concept to explain."); return; }
    setLoading(true); setResult("");
    try {
      const res = await runStudentTool("explainer", { concept, style });
      setResult(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Concept or Term *</Label>
        <Input value={concept} onChange={e => setConcept(e.target.value)}
          placeholder="e.g. Reasonable and Necessary, SIL, Support Coordinator vs Plan Manager, Duty of Care…"
          className="h-10 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Explanation Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "simple",   label: "🟢 Simple",   desc: "Beginner friendly" },
            { value: "story",    label: "📖 Story",     desc: "Learn via scenario" },
            { value: "detailed", label: "🔬 Detailed",  desc: "Full deep-dive" },
          ].map(s => (
            <button key={s.value} onClick={() => setStyle(s.value)}
              className={`px-3 py-2.5 rounded-xl border text-center transition-all ${
                style === s.value ? "border-harvest bg-harvest/10" : "border-border/50 hover:border-harvest/40"
              }`}>
              <p className="text-xs font-semibold text-ink">{s.label}</p>
              <p className="text-[11px] text-slate_mist">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Explaining…</> : <><Zap className="w-4 h-4" /> Explain This Concept</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Main Page ── */
const TOOLS = [
  { id: "studybuddy",   title: "AI Study Buddy",               desc: "Paste a topic and get a simple, clear explanation with practical tips.", icon: Brain, bg: "bg-purple-100", color: "text-purple-600" },
  { id: "feedback",     title: "Assignment Feedback",           desc: "Upload or paste your draft and AI reviews it with improvement suggestions.", icon: MessageSquare, bg: "bg-blue-100", color: "text-blue-600" },
  { id: "writer",       title: "Assignment Writer Assistant",   desc: "Brainstorm ideas, get an outline, or generate a first draft for any assignment.", icon: PenLine, bg: "bg-indigo-100", color: "text-indigo-600" },
  { id: "explainer",    title: "AI Concept Explainer",         desc: "Type any confusing term or concept and AI explains it in plain English with examples.", icon: Zap, bg: "bg-teal-100", color: "text-teal-600" },
  { id: "recommender",  title: "Course Recommender",           desc: "AI analyses your quiz scores and progress to recommend what to study next.", icon: Lightbulb, bg: "bg-emerald-100", color: "text-emerald-600" },
  { id: "flashcards",   title: "Flashcard Generator",          desc: "Turn any course content into interactive flashcards for revision.", icon: Layers, bg: "bg-amber-100", color: "text-amber-600" },
];

export default function AIToolsStudent({ enrollments = [], quizAttempts = [], courses = [] }) {
  const [activeTool, setActiveTool] = useState(null);

  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div>
      {activeTool ? (
        <div>
          <button onClick={() => setActiveTool(null)}
            className="flex items-center gap-1.5 text-sm text-slate_mist hover:text-ink transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Back to AI Tools
          </button>
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <div className={`px-6 py-4 border-b border-border/50 flex items-center gap-3 ${
              activeTool === "studybuddy" ? "bg-purple-50" :
              activeTool === "feedback" ? "bg-blue-50" :
              activeTool === "recommender" ? "bg-emerald-50" : "bg-amber-50"
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tool.bg}`}>
                <tool.icon className={`w-5 h-5 ${tool.color}`} />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">{tool.title}</h3>
                <p className="text-xs text-slate_mist">{tool.desc}</p>
              </div>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeTool} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {activeTool === "studybuddy"  && <StudyBuddy />}
                  {activeTool === "feedback"    && <AssignmentFeedback />}
                  {activeTool === "writer"      && <AssignmentWriter />}
                  {activeTool === "explainer"   && <ConceptExplainer />}
                  {activeTool === "recommender" && <CourseRecommender enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
                  {activeTool === "flashcards"  && <FlashcardGenerator />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-display font-bold text-xl text-ink">AI Learning Tools</h2>
            </div>
            <p className="text-sm text-slate_mist ml-12">Powered by AI to supercharge your learning experience.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <ToolCard tool={tool} onClick={() => setActiveTool(tool.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}