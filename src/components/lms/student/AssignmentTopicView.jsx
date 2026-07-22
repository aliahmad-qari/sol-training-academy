import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AssignmentCard, AssignmentSubmitModal } from "@/components/lms/student/StudentAssessments";
import { FileText, AlertCircle } from "lucide-react";

function LoadingCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="h-5 w-2/5 bg-white/10 rounded mb-3" />
      <div className="h-3 w-1/3 bg-white/10 rounded mb-6" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-20 rounded-xl bg-white/10" />
        <div className="h-20 rounded-xl bg-white/10" />
      </div>
      <div className="h-32 rounded-xl bg-white/10" />
    </div>
  );
}

const FALLBACK_ALLOWED = ["pdf", "doc", "docx", "zip", "jpg", "png"];

export default function AssignmentTopicView({ topic, user, enrollment, isCompleted, onComplete }) {
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const topicId = topic?.id || topic?._id;
        let linked = null;

        if (topic?.assignment_id) {
          linked = await base44.entities.Assignment.get(topic.assignment_id).catch(() => null);
        }
        if (!linked && topicId) {
          const matches = await base44.entities.Assignment.filter({ source_topic_id: topicId }).catch(() => []);
          linked = matches?.[0] || null;
        }

        const normalized = linked || (topic ? {
          id: topic.assignment_id || topicId,
          title: topic.title,
          instructions: topic.assessment_instructions || "",
          duration_days: topic.assessment_due_days || 0,
          max_marks: topic.assessment_max_marks || 100,
          passing_marks: topic.passing_marks || 50,
          brief_file_url: topic.assessment_file_url || "",
          brief_file_name: topic.assessment_file_name || "",
          allowed_file_types: FALLBACK_ALLOWED,
          course_id: enrollment?.course_id,
          course_title: enrollment?.course_title,
          source_topic_id: topicId,
        } : null);

        let currentSubmission = null;
        if (user && normalized?.id) {
          const subs = await base44.entities.AssignmentSubmission.filter({
            user_id: user.id,
            assignment_id: normalized.id,
          }).catch(() => []);
          currentSubmission = subs?.[0] || null;
          if (!currentSubmission && topicId) {
            const legacySubs = await base44.entities.AssignmentSubmission.filter({
              user_id: user.id,
              topic_id: topicId,
            }).catch(() => []);
            currentSubmission = legacySubs?.[0] || null;
          }
          // Final fallback: match by assignment title within this course. Covers
          // submissions whose stored assignment_id/topic_id don't line up with the
          // topic the player resolves (e.g. graded module assessments still showing
          // "Not submitted").
          if (!currentSubmission) {
            const title = (normalized.title || "").trim().toLowerCase();
            const courseId = normalized.course_id ?? enrollment?.course_id;
            if (title) {
              const mySubs = await base44.entities.AssignmentSubmission.filter({
                user_id: user.id,
              }).catch(() => []);
              currentSubmission = (mySubs || []).find((s) =>
                (s.assignment_title || "").trim().toLowerCase() === title &&
                (courseId == null || String(s.course_id) === String(courseId))
              ) || null;
            }
          }
        }

        if (!alive) return;
        setAssignment(normalized);
        setSubmission(currentSubmission);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [topic?.id, topic?.assignment_id, topic?.type, user?.id, enrollment?.course_id]);

  if (loading) return <LoadingCard />;

  if (!assignment) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-amber-300 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">Assignment unavailable</span>
        </div>
        <p className="text-white/60 text-sm">We couldn't load the linked assignment for this topic.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Assignment</span>
      </div>

      <AssignmentCard
        assignment={assignment}
        submission={submission}
        userId={user?.id || user?._id}
        onSubmit={() => setSubmitModal(assignment)}
      />

      {submitModal && (
        <AssignmentSubmitModal
          assignment={submitModal}
          userId={user?.id || user?._id}
          user={user}
          onClose={() => setSubmitModal(null)}
          onSubmitted={async () => {
            setSubmitModal(null);
            const subs = await base44.entities.AssignmentSubmission.filter({
              user_id: user?.id || user?._id,
              assignment_id: assignment.id,
            }).catch(() => []);
            setSubmission(subs?.[0] || null);
            onComplete?.();
          }}
        />
      )}
    </div>
  );
}
