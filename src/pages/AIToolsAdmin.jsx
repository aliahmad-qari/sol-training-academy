import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, FileText, BarChart3, Award, LifeBuoy, TrendingDown,
  HelpCircle, ChevronRight, ArrowLeft, Loader2, Copy, CheckCircle,
  Users, BookOpen, AlertTriangle, Megaphone, ClipboardCheck, Layers, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/* ── Shared: Result Box ── */
function ResultBox({ content }) {
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

/* ── AI Course Content Writer ── */
function CourseContentWriter() {
  const [topicTitle, setTopicTitle] = useState("");
  const [level, setLevel] = useState("level1");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!topicTitle.trim()) { toast.error("Enter a topic title."); return; }
    setLoading(true); setResult("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert curriculum writer for SOL Training Academy, which provides NDIS and support coordination training in Australia.\n\nWrite a complete, detailed reading module for the following topic:\n\nTOPIC: ${topicTitle}\nCOURSE LEVEL: ${level === "level1" ? "Level 1 — Foundation" : level === "level2" ? "Level 2 — Professional" : "Level 3 — Advanced"}\nESTIMATED READING TIME: ${duration} minutes\n\nStructure the content as:\n1. Introduction (What this topic is about and why it matters)\n2. Key Concepts (detailed explanation with subheadings)\n3. Practical Application (real-world examples in NDIS/support coordination context)\n4. Case Study or Scenario (a brief relevant example)\n5. Summary & Key Takeaways (bullet points)\n6. Further Reflection Questions (2-3 thought-provoking questions)\n\nWrite in clear, professional Australian English. The content should be comprehensive enough for a ${duration}-minute read.`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Topic Title *</Label>
        <Input value={topicTitle} onChange={e => setTopicTitle(e.target.value)}
          placeholder="e.g. Understanding NDIS Support Coordination, Restrictive Practices…" className="h-10 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="level1">Level 1 — Foundation</SelectItem>
              <SelectItem value="level2">Level 2 — Professional</SelectItem>
              <SelectItem value="level3">Level 3 — Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Reading Time (mins)</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["10", "15", "20", "30", "45", "60"].map(n => <SelectItem key={n} value={n}>{n} minutes</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing content…</> : <><Sparkles className="w-4 h-4" /> Generate Course Content</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── AI Student Progress Summariser ── */
function StudentProgressSummariser({ enrollments, quizAttempts, courses }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    setLoading(true); setResult("");
    const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))].length;
    const completed = enrollments.filter(e => e.status === "completed").length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length)
      : 0;
    const passRate = quizAttempts.length > 0
      ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100)
      : 0;
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / quizAttempts.length)
      : 0;

    // Course-level breakdown
    const courseBreakdown = courses.map(c => {
      const cEnvs = enrollments.filter(e => e.course_id === c.id);
      const cAttempts = quizAttempts.filter(a => a.course_id === c.id);
      return {
        title: c.title,
        enrolled: cEnvs.length,
        completed: cEnvs.filter(e => e.status === "completed").length,
        avgProgress: cEnvs.length ? Math.round(cEnvs.reduce((s, e) => s + (e.progress_percent || 0), 0) / cEnvs.length) : 0,
        quizPassRate: cAttempts.length ? Math.round((cAttempts.filter(a => a.passed).length / cAttempts.length) * 100) : null,
      };
    });

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an educational analytics expert. Write a clear, plain-English performance report for an LMS admin based on this data.\n\nOVERALL STATS:\n- Total students: ${uniqueStudents}\n- Total enrollments: ${enrollments.length}\n- Completed: ${completed}\n- Average progress: ${avgProgress}%\n- Quiz attempts: ${quizAttempts.length}\n- Overall pass rate: ${passRate}%\n- Average quiz score: ${avgQuizScore}%\n\nPER COURSE DATA:\n${JSON.stringify(courseBreakdown, null, 2)}\n\nWrite the report in sections:\n1. Executive Summary (2-3 sentences)\n2. Strengths (what's going well)\n3. Areas of Concern (what needs attention)\n4. Course-by-Course Insights\n5. Recommended Actions (3-5 concrete steps admin should take)\n\nUse plain English. Be specific about numbers. Avoid jargon.`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Enrollments", value: enrollments.length },
          { label: "Completions", value: enrollments.filter(e => e.status === "completed").length },
          { label: "Quiz Attempts", value: quizAttempts.length },
          { label: "Courses", value: courses.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border/50 rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-slate_mist">AI will read all {enrollments.length} enrollments and {quizAttempts.length} quiz attempts and write a plain-English report with recommendations.</p>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating report…</> : <><Sparkles className="w-4 h-4" /> Generate Progress Report</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Certificate Message Generator ── */
function CertificateMessageGenerator() {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!studentName.trim() || !courseName.trim()) { toast.error("Enter student name and course name."); return; }
    setLoading(true); setResult("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write 3 different personalised certificate congratulations messages for a student who has completed a training course. Each message should be warm, professional, and inspiring.\n\nSTUDENT NAME: ${studentName}\nCOURSE: ${courseName}\nADDITIONAL DETAILS: ${details || "None"}\n\nFor each message provide:\n- Short version (1-2 sentences, for the certificate itself)\n- Medium version (3-4 sentences, for an email)\n- Formal version (1 paragraph, for official documentation)\n\nMake each feel personal and genuine, not generic.`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Student Name *</Label>
          <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Sarah Johnson" className="h-10 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Name *</Label>
          <Input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. NDIS Support Coordination Level 1" className="h-10 text-sm" />
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Additional Details (Optional)</Label>
        <Input value={details} onChange={e => setDetails(e.target.value)}
          placeholder="e.g. completed with distinction, 6 months study, plans to work as a support coordinator…" className="h-10 text-sm" />
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing messages…</> : <><Sparkles className="w-4 h-4" /> Generate Messages</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Support Ticket Auto-Reply ── */
function SupportTicketReply() {
  const [ticket, setTicket] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!ticket.trim()) { toast.error("Paste the ticket message first."); return; }
    setLoading(true); setResult("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful support team member at SOL Training Academy (NDIS & support coordination training, Australia). Draft a professional, empathetic reply to this student support ticket.\n\nTICKET CATEGORY: ${category}\nSTUDENT MESSAGE:\n${ticket}\n\nWrite:\n1. Draft Reply — a complete, ready-to-send email reply (warm, professional, helpful)\n2. Key Points Addressed — bullet list of issues you responded to\n3. Any Follow-up Actions Suggested — if admin needs to do anything further\n\nTone: friendly, professional, helpful. Sign off as "SOL Training Academy Support Team".`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Ticket Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Enquiry</SelectItem>
            <SelectItem value="technical">Technical Issue</SelectItem>
            <SelectItem value="course">Course Content Question</SelectItem>
            <SelectItem value="billing">Billing / Payment</SelectItem>
            <SelectItem value="certificate">Certificate Request</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Student Ticket Message *</Label>
        <Textarea value={ticket} onChange={e => setTicket(e.target.value)}
          placeholder="Paste the student's support ticket message here…"
          rows={6} className="resize-none text-sm" />
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting reply…</> : <><Sparkles className="w-4 h-4" /> Generate Reply</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Quiz Analyser ── */
function QuizAnalyser({ quizAttempts, courses }) {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    setLoading(true); setResult("");
    const filtered = selectedCourse === "all" ? quizAttempts : quizAttempts.filter(a => a.course_id === selectedCourse);
    const passRate = filtered.length > 0 ? Math.round((filtered.filter(a => a.passed).length / filtered.length) * 100) : 0;
    const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, a) => s + (a.score_percent || 0), 0) / filtered.length) : 0;
    const failedAttempts = filtered.filter(a => !a.passed);
    const failedAvg = failedAttempts.length > 0 ? Math.round(failedAttempts.reduce((s, a) => s + (a.score_percent || 0), 0) / failedAttempts.length) : 0;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an educational data analyst. Analyse these quiz attempt patterns and identify which areas students are struggling with.\n\nDATA:\n- Total attempts: ${filtered.length}\n- Pass rate: ${passRate}%\n- Average score: ${avgScore}%\n- Failed attempts: ${failedAttempts.length}\n- Average score of failed attempts: ${failedAvg}%\n- Course filter: ${selectedCourse === "all" ? "All courses" : courses.find(c => c.id === selectedCourse)?.title || "Unknown"}\n\nProvide:\n1. Overall Performance Analysis\n2. Key Problem Areas (based on pass rates and score distributions)\n3. Student Struggles — what types of students are failing (high scorers who barely pass, consistently low scorers, etc.)\n4. Recommendations for Instructors (how to improve quiz results)\n5. Content Improvement Suggestions (what course content may need clarification)\n6. Action Plan (3 concrete steps to improve pass rates)`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Filter by Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Attempts", value: quizAttempts.length },
          { label: "Passed", value: quizAttempts.filter(a => a.passed).length },
          { label: "Failed", value: quizAttempts.filter(a => !a.passed).length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border/50 rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </div>
        ))}
      </div>
      <Button onClick={run} disabled={loading || quizAttempts.length === 0} className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> Analyse Quiz Patterns</>}
      </Button>
      {quizAttempts.length === 0 && <p className="text-xs text-slate_mist text-center">No quiz attempts yet to analyse.</p>}
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── Dropout Predictor ── */
function DropoutPredictor({ enrollments, quizAttempts, courses }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [atRisk, setAtRisk] = useState([]);

  const run = async () => {
    setLoading(true); setResult(""); setAtRisk([]);

    // Identify at-risk students using heuristics
    const riskList = enrollments
      .filter(e => e.status === "active")
      .map(e => {
        const attempts = quizAttempts.filter(a => a.user_id === e.user_id && a.course_id === e.course_id);
        const failRate = attempts.length > 0 ? (attempts.filter(a => !a.passed).length / attempts.length) : 0;
        const lastActivity = e.updated_date ? new Date(e.updated_date) : new Date(e.created_date);
        const daysSinceActivity = Math.round((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
        let riskScore = 0;
        if (e.progress_percent < 10) riskScore += 3;
        else if (e.progress_percent < 30) riskScore += 2;
        if (daysSinceActivity > 30) riskScore += 3;
        else if (daysSinceActivity > 14) riskScore += 2;
        if (failRate > 0.5) riskScore += 2;
        if (e.expiry_date) {
          const daysLeft = Math.round((new Date(e.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysLeft < 30 && e.progress_percent < 50) riskScore += 3;
        }
        return { ...e, riskScore, daysSinceActivity, failRate: Math.round(failRate * 100), attempts: attempts.length };
      })
      .filter(e => e.riskScore >= 3)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 15);

    setAtRisk(riskList);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a student retention specialist for an online training academy. Based on this at-risk student data, provide retention recommendations.\n\nAT-RISK STUDENTS IDENTIFIED: ${riskList.length}\nCRITERIA USED: low progress, inactivity (days since last login), high quiz fail rate, expiry deadline approaching\n\nTOP AT-RISK CASES:\n${JSON.stringify(riskList.slice(0, 5).map(e => ({
        course: e.course_title,
        progress: `${e.progress_percent}%`,
        daysSinceActivity: e.daysSinceActivity,
        quizFailRate: `${e.failRate}%`,
        attempts: e.attempts,
      })), null, 2)}\n\nProvide:\n1. Key Risk Patterns (what patterns do you see)\n2. Immediate Actions (what to do in next 24-48 hours)\n3. Outreach Message Template (a re-engagement email template)\n4. Structural Improvements (long-term changes to reduce dropout)\n5. Priority Order (who to contact first and why)`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">AI will flag students with low progress, long inactivity, high quiz fail rates, or approaching expiry deadlines — and suggest re-engagement strategies.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Enrollments", value: enrollments.filter(e => e.status === "active").length },
          { label: "Below 30% Progress", value: enrollments.filter(e => e.status === "active" && (e.progress_percent || 0) < 30).length },
          { label: "No Quiz Attempts", value: enrollments.filter(e => e.status === "active" && !quizAttempts.find(a => a.user_id === e.user_id)).length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border/50 rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </div>
        ))}
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> Run Dropout Prediction</>}
      </Button>
      {atRisk.length > 0 && (
        <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate_mist px-4 py-3 border-b border-border/30 bg-slate-50">
            {atRisk.length} At-Risk Student Enrollments Identified
          </p>
          <div className="divide-y divide-border/20 max-h-48 overflow-y-auto">
            {atRisk.map((e, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{e.user_name || "Unknown"}</p>
                  <p className="text-xs text-slate_mist">{e.course_title} · {e.progress_percent}% progress · {e.daysSinceActivity}d inactive</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  e.riskScore >= 6 ? "bg-red-100 text-red-700" : e.riskScore >= 4 ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {e.riskScore >= 6 ? "High Risk" : e.riskScore >= 4 ? "Medium" : "Low"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── AI Course Content Generator (Module Outline) ── */
function CourseOutlineGenerator() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("level1");
  const [numLessons, setNumLessons] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!topic.trim()) { toast.error("Enter a topic."); return; }
    setLoading(true); setResult(null);
    const levelLabel = level === "level1" ? "Level 1 — Foundation" : level === "level2" ? "Level 2 — Professional" : "Level 3 — Advanced";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert curriculum designer for SOL Training Academy (NDIS & support coordination training, Australia).\n\nGenerate a comprehensive, production-ready module outline for the following:\n\nTOPIC: ${topic}\nCOURSE LEVEL: ${levelLabel}\nNUMBER OF LESSONS: ${numLessons}\n\nFor each lesson provide:\n- A clear, engaging lesson title\n- Type (video / reading / quiz / assessment)\n- Estimated duration\n- 3–5 specific key points that students will learn (these are the core takeaways, not vague objectives)\n- A brief content description (what the lesson covers)\n- 2–3 suggested reading/resource links: real Australian NDIS-related resources, NDIS website pages, NDIS Quality and Safeguards Commission resources, or reputable academic/professional references. Include the resource title, author/source, and URL.\n\nAlso include module-level:\n- A compelling module title\n- A clear module overview description (2-3 sentences)\n- Total estimated duration\n- 3–5 overall module learning outcomes`,
      response_json_schema: {
        type: "object",
        properties: {
          module_title: { type: "string" },
          module_description: { type: "string" },
          estimated_total_duration: { type: "string" },
          learning_outcomes: { type: "array", items: { type: "string" } },
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lesson_number: { type: "number" },
                title: { type: "string" },
                type: { type: "string" },
                duration: { type: "string" },
                description: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                reading_resources: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      source: { type: "string" },
                      url: { type: "string" },
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Module Topic *</Label>
        <Input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. NDIS Plan Management, Restrictive Practices, Building Participant Capacity…"
          className="h-10 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Level</Label>
          <select value={level} onChange={e => setLevel(e.target.value)}
            className="w-full h-10 border border-input rounded-md px-3 text-sm bg-transparent">
            <option value="level1">Level 1 — Foundation</option>
            <option value="level2">Level 2 — Professional</option>
            <option value="level3">Level 3 — Advanced</option>
          </select>
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Number of Lessons</Label>
          <select value={numLessons} onChange={e => setNumLessons(e.target.value)}
            className="w-full h-10 border border-input rounded-md px-3 text-sm bg-transparent">
            {["3","4","5","6","7","8","10"].map(n => <option key={n} value={n}>{n} lessons</option>)}
          </select>
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating outline…</> : <><Sparkles className="w-4 h-4" /> Generate Module Outline</>}
      </Button>
      {result && (
        <div className="space-y-4">
          {/* Module Header */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-display font-bold text-ink text-base">{result.module_title}</h4>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">⏱ {result.estimated_total_duration}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{result.module_description}</p>
            {result.learning_outcomes?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">Module Learning Outcomes</p>
                <ul className="space-y-1">
                  {result.learning_outcomes.map((o, i) => (
                    <li key={i} className="text-xs text-blue-800 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5 font-bold">→</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lessons */}
          <div className="space-y-3">
            {(result.lessons || []).map((lesson, i) => (
              <div key={i} className="bg-white border border-border/50 rounded-xl overflow-hidden shadow-sm">
                {/* Lesson Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-border/40">
                  <span className="text-xs font-bold text-slate_mist uppercase tracking-wider">Lesson {lesson.lesson_number}</span>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border/50 text-slate-600 font-semibold capitalize">{lesson.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-semibold">{lesson.duration}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="font-display font-semibold text-ink">{lesson.title}</p>
                  <p className="text-xs text-slate_mist leading-relaxed">{lesson.description}</p>

                  {/* Key Points */}
                  {lesson.key_points?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">Key Points</p>
                      <ul className="space-y-1">
                        {lesson.key_points.map((pt, j) => (
                          <li key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>{pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reading Resources */}
                  {lesson.reading_resources?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Suggested Reading & Resources</p>
                      <ul className="space-y-1.5">
                        {lesson.reading_resources.map((res, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs">
                            <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <a href={res.url} target="_blank" rel="noopener noreferrer"
                                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">{res.title}</a>
                              <span className="text-slate_mist"> — {res.source}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Copy raw JSON button */}
          <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast.success("Outline copied as JSON"); }}
            className="w-full py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-slate_mist hover:text-ink hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Copy className="w-3.5 h-3.5" /> Copy Full Outline as JSON
          </button>
        </div>
      )}
    </div>
  );
}

/* ── AI Student Performance Analyser ── */
function StudentPerformanceAnalyser({ enrollments, quizAttempts, courses }) {
  const [loading, setLoading] = useState(false);
  const [atRisk, setAtRisk] = useState([]);
  const [result, setResult] = useState("");

  const run = async () => {
    setLoading(true); setResult(""); setAtRisk([]);

    const riskList = enrollments
      .filter(e => e.status === "active")
      .map(e => {
        const attempts = quizAttempts.filter(a => a.user_id === e.user_id && a.course_id === e.course_id);
        const failRate = attempts.length > 0 ? attempts.filter(a => !a.passed).length / attempts.length : 0;
        const lastActivity = e.updated_date ? new Date(e.updated_date) : new Date(e.created_date);
        const daysSince = Math.round((new Date() - lastActivity) / 86400000);
        let risk = 0;
        if ((e.progress_percent || 0) < 10) risk += 3;
        else if ((e.progress_percent || 0) < 30) risk += 2;
        if (daysSince > 30) risk += 3;
        else if (daysSince > 14) risk += 2;
        if (failRate > 0.5) risk += 2;
        return { ...e, risk, daysSince, failRate: Math.round(failRate * 100), attempts: attempts.length };
      })
      .filter(e => e.risk >= 3)
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 20);

    setAtRisk(riskList);

    const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))].length;
    const passRate = quizAttempts.length > 0 ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100) : 0;
    const avgProgress = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length) : 0;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a student success analyst. Based on the LMS data below, write a clear report flagging at-risk students and providing actionable recommendations.\n\nOVERALL:\n- Students: ${uniqueStudents}, Enrollments: ${enrollments.length}, Avg Progress: ${avgProgress}%, Quiz Pass Rate: ${passRate}%\n\nAT-RISK FLAGGED: ${riskList.length} students\nTOP AT-RISK:\n${JSON.stringify(riskList.slice(0, 8).map(e => ({ name: e.user_name, course: e.course_title, progress: e.progress_percent + "%", daysInactive: e.daysSince, quizFailRate: e.failRate + "%" })), null, 2)}\n\nProvide:\n1. Summary of findings\n2. Key risk patterns observed\n3. Top 3 students who need immediate outreach (and why)\n4. Re-engagement email template\n5. Structural recommendations to reduce at-risk rates`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">AI analyses all student activity, quiz scores, and progress to flag who is at risk of not completing — and tells you exactly what to do.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Enrollments", value: enrollments.filter(e => e.status === "active").length },
          { label: "Below 30% Progress", value: enrollments.filter(e => (e.progress_percent || 0) < 30 && e.status === "active").length },
          { label: "Quiz Attempts", value: quizAttempts.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border/50 rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-[10px] text-slate_mist">{s.label}</p>
          </div>
        ))}
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> Analyse Student Performance</>}
      </Button>
      {atRisk.length > 0 && (
        <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate_mist px-4 py-3 border-b bg-slate-50">
            {atRisk.length} At-Risk Students Flagged
          </p>
          <div className="divide-y divide-border/20 max-h-52 overflow-y-auto">
            {atRisk.map((e, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{e.user_name || "Unknown"}</p>
                  <p className="text-xs text-slate_mist">{e.course_title} · {e.progress_percent}% · {e.daysSince}d inactive</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.risk >= 6 ? "bg-red-100 text-red-700" : e.risk >= 4 ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {e.risk >= 6 ? "High" : e.risk >= 4 ? "Medium" : "Low"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && <ResultBox content={result} />}
    </div>
  );
}

/* ── AI Assignment Auto-Grader ── */
function AssignmentAutoGrader() {
  const [submission, setSubmission] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf","docx","txt","doc"].includes(ext)) { toast.error("Upload PDF, DOCX, or TXT only."); return; }
    setUploading(true); setUploadedFile(null); setSubmission("");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: { type: "object", properties: { text: { type: "string" } } }
    });
    if (extracted.status === "success") {
      setSubmission(extracted.output?.text || "");
      setUploadedFile({ name: file.name });
      toast.success("File extracted!");
    } else {
      toast.error("Could not read file. Paste text instead.");
    }
    setUploading(false);
  };

  const run = async () => {
    if (!submission.trim()) { toast.error("Please upload or paste the student submission."); return; }
    setLoading(true); setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert assessor for a support coordination training course. Grade this student submission fairly and provide detailed feedback.\n\nASSIGNMENT INSTRUCTIONS: ${instructions || "General assignment — assess content quality, structure, and understanding."}\nMAXIMUM MARKS: ${maxMarks}\n\nSTUDENT SUBMISSION:\n${submission}`,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_mark: { type: "number" },
          percentage: { type: "number" },
          grade: { type: "string" },
          passed: { type: "boolean" },
          overall_impression: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          detailed_feedback: { type: "string" },
          recommendation: { type: "string" },
        }
      }
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Assignment Instructions (Optional)</Label>
        <Input value={instructions} onChange={e => setInstructions(e.target.value)}
          placeholder="e.g. Write a 500-word reflection on the role of support coordination in NDIS…" className="h-10 text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Max Marks</Label>
          <select value={maxMarks} onChange={e => setMaxMarks(e.target.value)}
            className="w-full h-10 border border-input rounded-md px-3 text-sm bg-transparent">
            {["50","100","150","200"].map(n => <option key={n} value={n}>{n} marks</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Student Submission *</Label>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-purple-200 bg-purple-50/40 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 transition-all mb-3">
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 text-purple-500 animate-spin" /><span className="text-sm text-purple-600">Reading file…</span></div>
          ) : uploadedFile ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">{uploadedFile.name}</span>
              <button onClick={e => { e.stopPropagation(); setUploadedFile(null); setSubmission(""); }} className="text-slate_mist hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div><Upload className="w-5 h-5 text-purple-400 mx-auto mb-1" /><p className="text-sm text-purple-600 font-medium">Upload submission (PDF, DOCX, TXT)</p></div>
          )}
        </div>
        <p className="text-xs text-slate_mist text-center mb-2">— or paste text below —</p>
        <textarea value={submission} onChange={e => { setSubmission(e.target.value); setUploadedFile(null); }}
          placeholder="Paste student submission here…"
          rows={5} className="w-full resize-none border border-input rounded-md px-3 py-2 text-sm bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <Button onClick={run} disabled={loading || uploading || !submission.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Grading…</> : <><ClipboardCheck className="w-4 h-4" /> Auto-Grade Submission</>}
      </Button>
      {result && (
        <div className="space-y-3">
          <div className={`rounded-xl p-5 border ${result.passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`text-3xl font-display font-bold ${result.passed ? "text-emerald-700" : "text-red-700"}`}>
                  {result.suggested_mark}/{maxMarks}
                </span>
                <span className="ml-2 text-sm text-slate_mist">({result.percentage}%)</span>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${result.passed ? "text-emerald-700" : "text-red-700"}`}>{result.grade}</span>
                <p className={`text-xs font-semibold ${result.passed ? "text-emerald-600" : "text-red-600"}`}>{result.passed ? "✓ PASSED" : "✗ NOT PASSED"}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700">{result.overall_impression}</p>
          </div>
          {result.strengths?.length > 0 && (
            <div className="bg-white border border-border/50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase text-emerald-700 mb-2">Strengths</p>
              <ul className="space-y-1">{result.strengths.map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-emerald-500">✓</span>{s}</li>)}</ul>
            </div>
          )}
          {result.improvements?.length > 0 && (
            <div className="bg-white border border-border/50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase text-amber-700 mb-2">Areas to Improve</p>
              <ul className="space-y-1">{result.improvements.map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-amber-500">→</span>{s}</li>)}</ul>
            </div>
          )}
          {result.detailed_feedback && <ResultBox content={result.detailed_feedback} />}
          {result.recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 mb-1">Recommendation</p>
              <p className="text-sm text-blue-800">{result.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── AI Announcement Writer ── */
function AnnouncementWriter() {
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("friendly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!brief.trim()) { toast.error("Describe what you want to announce."); return; }
    setLoading(true); setResult("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional communications writer for SOL Training Academy (NDIS & support coordination training, Australia). Write a polished announcement based on the brief below.\n\nBRIEF: ${brief}\nTONE: ${tone}\n\nWrite 3 versions:\n1. Short Version (2-3 sentences, for a banner or push notification)\n2. Standard Version (1 paragraph, for email or dashboard announcement)\n3. Detailed Version (2-3 paragraphs with context, actions required, and a friendly sign-off)\n\nMake each version feel professional, warm, and on-brand for an NDIS training academy.`,
    });
    setResult(res); setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">What do you want to announce? *</Label>
        <textarea value={brief} onChange={e => setBrief(e.target.value)}
          placeholder="e.g. New Level 2 course is launching next Monday. Students should check their dashboard. Early bird discount of 20% for the first week…"
          rows={4} className="w-full resize-none border border-input rounded-md px-3 py-2 text-sm bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Tone</Label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "friendly",    label: "😊 Friendly & Warm" },
            { value: "formal",      label: "🎓 Formal & Professional" },
            { value: "urgent",      label: "🚨 Urgent & Action-Oriented" },
            { value: "celebratory", label: "🎉 Celebratory" },
          ].map(t => (
            <button key={t.value} onClick={() => setTone(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                tone === t.value ? "border-harvest bg-harvest/10 text-harvest" : "border-border/50 text-slate-500 hover:border-harvest/40"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing…</> : <><Megaphone className="w-4 h-4" /> Write Announcement</>}
      </Button>
      {result && <ResultBox content={result} />}
    </div>
  );
}

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

const ADMIN_TOOLS = [
  { id: "contentwriter",    title: "Course Content Writer",        desc: "Enter a topic and AI drafts full lesson reading content for your course.", icon: FileText, bg: "bg-blue-100", color: "text-blue-600" },
  { id: "outlinegenerator", title: "Course Content Generator",     desc: "Enter a topic and AI generates a complete module outline with lessons, types, and objectives.", icon: Layers, bg: "bg-sky-100", color: "text-sky-600" },
  { id: "progressreport",   title: "Student Progress Summariser",  desc: "AI reads all student data and writes a plain-English performance report.", icon: BarChart3, bg: "bg-purple-100", color: "text-purple-600" },
  { id: "performanceanalysis", title: "Student Performance Analyser", desc: "AI flags at-risk students with low progress or inactivity and tells you exactly what to do.", icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
  { id: "autograder",       title: "Assignment Auto-Grader",       desc: "Upload or paste a student submission and AI grades it with marks, feedback, and recommendations.", icon: ClipboardCheck, bg: "bg-purple-100", color: "text-purple-700" },
  { id: "announcementwriter", title: "Announcement Writer",        desc: "Describe what you want to say and AI writes a polished announcement in multiple formats.", icon: Megaphone, bg: "bg-rose-100", color: "text-rose-600" },
  { id: "certmessage",      title: "Certificate Message Generator", desc: "AI writes unique, personalised congratulations messages for graduating students.", icon: Award, bg: "bg-amber-100", color: "text-amber-600" },
  { id: "ticketreply",      title: "Support Ticket Auto-Reply",    desc: "Paste a student ticket and AI drafts a professional, empathetic reply.", icon: LifeBuoy, bg: "bg-emerald-100", color: "text-emerald-600" },
  { id: "quizanalyser",     title: "Quiz Pattern Analyser",        desc: "Analyse quiz attempt patterns to identify which areas students struggle with most.", icon: HelpCircle, bg: "bg-rose-100", color: "text-rose-600" },
  { id: "dropout",          title: "Dropout Predictor",           desc: "AI flags students likely to not complete based on activity, progress, and quiz data.", icon: TrendingDown, bg: "bg-orange-100", color: "text-orange-600" },
];

export default function AIToolsAdmin({ enrollments = [], quizAttempts = [], courses = [] }) {
  const [activeTool, setActiveTool] = useState(null);
  const tool = ADMIN_TOOLS.find(t => t.id === activeTool);

  return (
    <div>
      {activeTool ? (
        <div>
          <button onClick={() => setActiveTool(null)}
            className="flex items-center gap-1.5 text-sm text-slate_mist hover:text-ink transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Back to AI Tools
          </button>
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <div className={`px-6 py-4 border-b border-border/50 flex items-center gap-3 ${tool.bg}/30`}>
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
                  {activeTool === "contentwriter"      && <CourseContentWriter />}
                  {activeTool === "outlinegenerator"  && <CourseOutlineGenerator />}
                  {activeTool === "progressreport"    && <StudentProgressSummariser enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
                  {activeTool === "performanceanalysis" && <StudentPerformanceAnalyser enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
                  {activeTool === "autograder"        && <AssignmentAutoGrader />}
                  {activeTool === "announcementwriter" && <AnnouncementWriter />}
                  {activeTool === "certmessage"       && <CertificateMessageGenerator />}
                  {activeTool === "ticketreply"       && <SupportTicketReply />}
                  {activeTool === "quizanalyser"      && <QuizAnalyser quizAttempts={quizAttempts} courses={courses} />}
                  {activeTool === "dropout"           && <DropoutPredictor enrollments={enrollments} quizAttempts={quizAttempts} courses={courses} />}
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
              <h2 className="font-display font-bold text-xl text-ink">AI Admin Tools</h2>
            </div>
            <p className="text-sm text-slate_mist ml-12">AI-powered tools to save time, improve content, and boost student success.</p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ADMIN_TOOLS.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <ToolCard tool={tool} onClick={() => setActiveTool(tool.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}