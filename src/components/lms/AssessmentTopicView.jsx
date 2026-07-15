import React, { useState, useRef, useCallback } from "react";
import { FileText, Upload, CheckCircle, Clock, Award, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/api/uploadClient";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";

export default function AssessmentTopicView({ topic, user, enrollment, isCompleted, onComplete }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const dueDate = (() => {
    if (!topic.assessment_due_days || !enrollment?.createdAt) return null;
    const start = new Date(enrollment.createdAt);
    start.setDate(start.getDate() + topic.assessment_due_days);
    return start;
  })();

  const daysLeft = dueDate ? Math.round((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a file to upload."); return; }
    setUploading(true);
    try {
      const { file_url } = await uploadFile({ file, kind: "assignment" });
      await apiClient.post('/submissions', {
        assignment_id: topic._id || topic.id,
        assignment_title: topic.title,
        course_id: enrollment.course_id,
        course_title: enrollment.course_title,
        user_id: user._id || user.id,
        user_name: user.full_name || "",
        user_email: user.email || "",
        file_url,
        file_name: file.name,
        file_type: file.name.split(".").pop().toLowerCase(),
        submission_notes: notes,
        status: "submitted",
        max_marks: topic.assessment_max_marks || 100,
      });
      toast.success("Assessment submitted successfully!");
      setSubmitted(true);
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = useCallback((e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  }, []);

  const handleDropZoneClick = useCallback(() => fileRef.current?.click(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📝</span>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">Assessment</span>
        </div>
        <h2 className="text-white font-display font-bold text-xl sm:text-2xl leading-snug">{topic.title}</h2>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Award,  label: "Max Marks", value: topic.assessment_max_marks || 100 },
          { icon: Clock,  label: "Due In",    value: topic.assessment_due_days ? `${topic.assessment_due_days} days` : "No deadline" },
          { icon: FileText, label: "Status",  value: isCompleted || submitted ? "Submitted ✓" : "Pending" },
        ].map(card => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <card.icon className="w-5 h-5 text-harvest mx-auto mb-1.5" />
            <p className="text-white font-display font-bold text-lg leading-tight">{card.value}</p>
            <p className="text-white/40 text-xs">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Due Date Warning */}
      {daysLeft !== null && daysLeft <= 7 && !(isCompleted || submitted) && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm font-medium">
            {daysLeft <= 0 ? "Deadline has passed!" : `Due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}!`}
          </p>
        </div>
      )}

      {/* Instructions */}
      {topic.assessment_instructions && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Instructions</p>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{topic.assessment_instructions}</p>
        </div>
      )}

      {/* Brief file */}
      {topic.assessment_file_url && (
        <a href={topic.assessment_file_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
          <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{topic.assessment_file_name || "Assignment Brief"}</p>
            <p className="text-white/40 text-xs">Click to download</p>
          </div>
        </a>
      )}

      {/* Upload Area */}
      {isCompleted || submitted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-400 font-display font-bold text-lg">Assessment Submitted</p>
          <p className="text-white/50 text-sm mt-1">Your assessor will review and provide feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Upload Your Submission</p>
            <div onClick={handleDropZoneClick}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-harvest/50 hover:bg-harvest/5 transition-all">
              <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-white text-sm font-semibold">{file.name}</p>
                  <p className="text-white/40 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-white/50 text-sm">Click to browse files</p>
                  <p className="text-white/30 text-xs mt-1">PDF, DOCX, ZIP, JPG, PNG</p>
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                onChange={handleFileChange} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Notes (Optional)</p>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any notes for your assessor…"
              rows={3} className="bg-white/5 border-white/10 text-white placeholder-white/30 resize-none" />
          </div>
          <Button onClick={handleSubmit} disabled={uploading || !file}
            className="w-full bg-harvest hover:bg-harvest/90 text-white gap-2 py-5 font-semibold font-display">
            {uploading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
              : <><Upload className="w-4 h-4" /> Submit Assessment</>}
          </Button>
        </div>
      )}
    </div>
  );
}