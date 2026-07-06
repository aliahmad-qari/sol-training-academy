import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Save, Plus, Trash2, Video, BookOpen, HelpCircle, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TYPE_CONFIG = {
  video:      { icon: Video,      color: "bg-blue-100 text-blue-600",   label: "Video" },
  reading:    { icon: BookOpen,   color: "bg-green-100 text-green-600", label: "Reading" },
  quiz:       { icon: HelpCircle, color: "bg-purple-100 text-purple-600", label: "Quiz" },
  assessment: { icon: FileText,   color: "bg-amber-100 text-amber-600", label: "Assessment" },
};

const EMPTY_QUESTION = { question: "", options: ["", "", "", ""], correct_index: 0, marks: 1, explanation: "" };

function FieldLabel({ children }) {
  return <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">{children}</Label>;
}

function SectionBox({ children, className = "" }) {
  return <div className={`bg-slate-50 rounded-xl p-4 space-y-3 border border-border/40 ${className}`}>{children}</div>;
}

// ── Video Fields ─────────────────────────────────────────────────────────────
function VideoFields({ form, setForm }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.info("Uploading video…");
    const { file_url, publicId } = await base44.integrations.Core.UploadFile({ file, kind: "video" });
    // Persist the Cloudinary public_id so the asset can be reclaimed on delete.
    setForm(f => ({ ...f, video_url: file_url, video_public_id: publicId || f.video_public_id }));
    toast.success("Video uploaded!");
    setUploading(false);
  };

  return (
    <SectionBox>
      <div>
        <FieldLabel>Video URL</FieldLabel>
        <Input value={form.video_url || ""} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
          placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…" className="text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate_mist">— or upload a file —</span>
        <label className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg border border-harvest/40 text-harvest hover:bg-harvest/5 font-medium transition-colors flex items-center gap-1.5 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "Uploading…" : "Upload Video"}
          <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {form.video_url && <span className="text-xs text-green-600 font-semibold">✓ Video set</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Duration (mins)</FieldLabel>
          <Input type="number" min={0} value={form.video_duration_mins || ""} onChange={e => setForm(f => ({ ...f, video_duration_mins: Number(e.target.value) }))} placeholder="e.g. 15" className="text-sm" />
        </div>
      </div>
      <div>
        <FieldLabel>Description / Notes</FieldLabel>
        <Textarea value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={3} placeholder="Brief description of what this video covers…" className="text-sm resize-none" />
      </div>
    </SectionBox>
  );
}

// ── Reading Fields ────────────────────────────────────────────────────────────
function ReadingFields({ form, setForm }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.info("Uploading file…");
    const { file_url, publicId } = await base44.integrations.Core.UploadFile({ file, kind: "reading" });
    setForm(f => ({
      ...f,
      reading_file_url: file_url,
      reading_file_public_id: publicId || f.reading_file_public_id,
      reading_file_name: file.name,
    }));
    toast.success("File uploaded!");
    setUploading(false);
  };

  return (
    <SectionBox>
      <div>
        <FieldLabel>Upload PDF / DOCX</FieldLabel>
        <label className={`flex items-center gap-3 cursor-pointer border-2 border-dashed border-border/50 rounded-xl px-4 py-5 hover:border-harvest/40 hover:bg-harvest/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-5 h-5 text-slate_mist flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {form.reading_file_name ? (
              <>
                <p className="text-sm font-semibold text-ink truncate">{form.reading_file_name}</p>
                <p className="text-xs text-green-600 font-medium">✓ File uploaded — click to replace</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate_mist">{uploading ? "Uploading…" : "Click to upload PDF or DOCX"}</p>
                <p className="text-xs text-slate_mist/60">Supported: PDF, DOCX, DOC</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <div>
        <FieldLabel>Rich Text Content</FieldLabel>
        <Textarea value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={5} placeholder="Paste or type reading content here. Supports markdown-style formatting…" className="text-sm resize-none font-mono" />
      </div>
      <div>
        <FieldLabel>Estimated Reading Duration (mins)</FieldLabel>
        <Input type="number" min={1} value={form.reading_duration_mins || ""} onChange={e => setForm(f => ({ ...f, reading_duration_mins: Number(e.target.value) }))} placeholder="e.g. 10" className="text-sm w-40" />
      </div>
    </SectionBox>
  );
}

// ── Quiz Fields ───────────────────────────────────────────────────────────────
function QuizFields({ form, setForm }) {
  const questions = form.quiz_questions?.length ? form.quiz_questions : [];

  const addQuestion = () => setForm(f => ({ ...f, quiz_questions: [...(f.quiz_questions || []), { ...EMPTY_QUESTION }] }));

  const updateQuestion = (qi, field, val) => setForm(f => {
    const qs = [...(f.quiz_questions || [])];
    qs[qi] = { ...qs[qi], [field]: val };
    return { ...f, quiz_questions: qs };
  });

  const updateOption = (qi, oi, val) => setForm(f => {
    const qs = [...(f.quiz_questions || [])];
    const opts = [...qs[qi].options];
    opts[oi] = val;
    qs[qi] = { ...qs[qi], options: opts };
    return { ...f, quiz_questions: qs };
  });

  const removeQuestion = (qi) => setForm(f => ({ ...f, quiz_questions: (f.quiz_questions || []).filter((_, i) => i !== qi) }));

  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 1), 0);

  return (
    <div className="space-y-4">
      {/* Quiz Config */}
      <SectionBox>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>Time Limit (mins)</FieldLabel>
            <Input type="number" min={0} value={form.time_limit_mins || ""} onChange={e => setForm(f => ({ ...f, time_limit_mins: Number(e.target.value) }))} placeholder="0 = unlimited" className="text-sm" />
          </div>
          <div>
            <FieldLabel>Passing Marks</FieldLabel>
            <Input type="number" min={0} value={form.passing_marks || ""} onChange={e => setForm(f => ({ ...f, passing_marks: Number(e.target.value) }))} placeholder="e.g. 70" className="text-sm" />
          </div>
          <div>
            <FieldLabel>Total Marks</FieldLabel>
            <div className="h-9 px-3 flex items-center rounded-md border border-border bg-slate-100 text-sm font-semibold text-ink">
              {totalMarks} <span className="text-slate_mist font-normal ml-1">(auto)</span>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* Question Builder */}
      <div className="space-y-3">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white border border-border/50 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate_mist uppercase tracking-wider">Question {qi + 1}</span>
              <button onClick={() => removeQuestion(qi)} className="text-slate_mist hover:text-destructive p-1 rounded">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <FieldLabel>Question Text</FieldLabel>
              <Textarea value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)} rows={2} placeholder="Enter the question…" className="text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(q.options || ["", "", "", ""]).map((opt, oi) => (
                <div key={oi} className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${q.correct_index === oi ? "border-green-400 bg-green-50" : "border-border/40"}`}>
                  <button
                    onClick={() => updateQuestion(qi, "correct_index", oi)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${q.correct_index === oi ? "border-green-500 bg-green-500" : "border-slate-300"}`}
                    title="Mark as correct"
                  >
                    {q.correct_index === oi && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                  </button>
                  <Input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`} className="border-0 shadow-none p-0 h-auto text-sm focus-visible:ring-0 bg-transparent" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FieldLabel>Marks</FieldLabel>
                <Input type="number" min={1} value={q.marks || 1} onChange={e => updateQuestion(qi, "marks", Number(e.target.value))} className="w-16 h-7 text-sm text-center p-1" />
              </div>
              <div className="flex-1">
                <FieldLabel>Explanation (optional)</FieldLabel>
                <Input value={q.explanation || ""} onChange={e => updateQuestion(qi, "explanation", e.target.value)} placeholder="Shown after student answers…" className="text-sm" />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addQuestion} className="w-full gap-2 text-sm border-dashed border-harvest/40 text-harvest hover:bg-harvest/5">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>
    </div>
  );
}

// ── Assessment Fields ─────────────────────────────────────────────────────────
function AssessmentFields({ form, setForm }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.info("Uploading attachment…");
    const { file_url, publicId } = await base44.integrations.Core.UploadFile({ file, kind: "assignment_brief" });
    setForm(f => ({
      ...f,
      assessment_file_url: file_url,
      assessment_file_public_id: publicId || f.assessment_file_public_id,
      assessment_file_name: file.name,
    }));
    toast.success("Attachment uploaded!");
    setUploading(false);
  };

  return (
    <SectionBox>
      <div>
        <FieldLabel>Assignment Instructions</FieldLabel>
        <Textarea value={form.assessment_instructions || ""} onChange={e => setForm(f => ({ ...f, assessment_instructions: e.target.value }))}
          rows={4} placeholder="Describe what students need to submit, how to complete the assessment…" className="text-sm resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Due Days (from enrollment)</FieldLabel>
          <Input type="number" min={0} value={form.assessment_due_days || ""} onChange={e => setForm(f => ({ ...f, assessment_due_days: Number(e.target.value) }))} placeholder="0 = no deadline" className="text-sm" />
        </div>
        <div>
          <FieldLabel>Maximum Marks</FieldLabel>
          <Input type="number" min={1} value={form.assessment_max_marks || ""} onChange={e => setForm(f => ({ ...f, assessment_max_marks: Number(e.target.value) }))} placeholder="e.g. 100" className="text-sm" />
        </div>
      </div>
      <div>
        <FieldLabel>Assignment Brief / Attachment (optional)</FieldLabel>
        <label className={`flex items-center gap-3 cursor-pointer border-2 border-dashed border-border/50 rounded-xl px-4 py-4 hover:border-harvest/40 hover:bg-harvest/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-5 h-5 text-slate_mist flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {form.assessment_file_name ? (
              <>
                <p className="text-sm font-semibold text-ink truncate">{form.assessment_file_name}</p>
                <p className="text-xs text-green-600 font-medium">✓ Uploaded — click to replace</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate_mist">{uploading ? "Uploading…" : "Upload brief or instruction file"}</p>
                <p className="text-xs text-slate_mist/60">PDF, DOCX, ZIP, images</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.doc,.docx,.zip,.jpg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </SectionBox>
  );
}

// ── Main TopicModal ───────────────────────────────────────────────────────────
export default function TopicModal({ topic, moduleId, courseId, onClose, onSave }) {
  const [form, setForm] = useState(topic || {
    title: "", type: "video", sort_order: 0, is_free_preview: false,
    module_id: moduleId, course_id: courseId,
    video_url: "", video_duration_mins: "", content: "",
    reading_file_url: "", reading_file_name: "", reading_duration_mins: "",
    quiz_questions: [], time_limit_mins: "", passing_marks: "", total_marks: "",
    assessment_instructions: "", assessment_due_days: "", assessment_max_marks: "", assessment_file_url: "", assessment_file_name: "",
  });
  const [saving, setSaving] = useState(false);

  const cfg = TYPE_CONFIG[form.type] || TYPE_CONFIG.video;
  const Icon = cfg.icon;

  const handleTypeChange = (val) => setForm(f => ({ ...f, type: val }));

  const toNum = (v) => (v === "" || v === null || v === undefined) ? null : Number(v);

  const save = async () => {
    if (!form.title.trim()) { toast.error("Topic title is required"); return; }
    if (form.type === "quiz" && (!form.quiz_questions || form.quiz_questions.length === 0)) {
      toast.error("Please add at least one question"); return;
    }
    setSaving(true);
    const data = {
      ...form,
      video_duration_mins: toNum(form.video_duration_mins),
      reading_duration_mins: toNum(form.reading_duration_mins),
      time_limit_mins: toNum(form.time_limit_mins),
      passing_marks: toNum(form.passing_marks),
      total_marks: form.type === "quiz"
        ? (form.quiz_questions || []).reduce((s, q) => s + (Number(q.marks) || 1), 0)
        : toNum(form.total_marks),
      assessment_due_days: toNum(form.assessment_due_days),
      assessment_max_marks: toNum(form.assessment_max_marks),
    };
    if (topic?.id) {
      await base44.entities.CourseTopic.update(topic.id, data);
    } else {
      await base44.entities.CourseTopic.create(data);
    }
    toast.success("Topic saved.");
    onClose();
    await onSave();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink leading-tight">
                {topic ? "Edit Topic" : "New Topic"}
              </h3>
              <p className="text-xs text-slate_mist">{cfg.label} topic</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate_mist hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Common: Title + Type + Sort */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FieldLabel>Topic Title *</FieldLabel>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Introduction to NDIS Funding" className="text-sm" autoFocus />
            </div>
            <div>
              <FieldLabel>Sort Order</FieldLabel>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="text-sm" />
            </div>
          </div>

          {/* Type Selector — pill buttons */}
          <div>
            <FieldLabel>Topic Type</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_CONFIG).map(([val, c]) => {
                const TIcon = c.icon;
                const active = form.type === val;
                return (
                  <button key={val} onClick={() => handleTypeChange(val)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${active ? `border-harvest bg-harvest/10 text-harvest` : "border-border/40 text-slate_mist hover:border-harvest/30 hover:bg-harvest/5"}`}>
                    <TIcon className="w-4 h-4" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Fields */}
          {form.type === "video"      && <VideoFields form={form} setForm={setForm} />}
          {form.type === "reading"    && <ReadingFields form={form} setForm={setForm} />}
          {form.type === "quiz"       && <QuizFields form={form} setForm={setForm} />}
          {form.type === "assessment" && <AssessmentFields form={form} setForm={setForm} />}

          {/* Free Preview */}
          <div
            className={`rounded-xl p-3 border cursor-pointer transition-colors ${form.is_free_preview ? "border-green-200 bg-green-50" : "border-border/40 bg-slate-50"}`}
            onClick={() => setForm(f => ({ ...f, is_free_preview: !f.is_free_preview }))}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.is_free_preview ? "border-green-500 bg-green-500" : "border-slate-300"}`}>
                {form.is_free_preview && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${form.is_free_preview ? "text-green-700" : "text-ink"}`}>Free Preview</p>
                <p className="text-xs text-slate_mist">Visible to non-enrolled students as a sample</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-slate-50/50 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white font-semibold">
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving…" : topic ? "Update Topic" : "Create Topic"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}