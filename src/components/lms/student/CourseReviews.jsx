import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, MessageSquare, CheckCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import CourseFeedbackForm from "@/components/lms/student/CourseFeedbackForm";

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export default function CourseReviews({ user, enrollments }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const loadReviews = async () => {
    try {
      const data = await base44.entities.CourseFeedback.filter({ user_id: user.id });
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadReviews();
  }, [user?.id]);

  // Enrollments that don't have a review yet
  const unreviewed = enrollments.filter(e => !reviews.find(r => r.enrollment_id === e.id));
  const reviewed   = enrollments.filter(e => reviews.find(r => r.enrollment_id === e.id));

  if (loading) return <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 text-sm">Loading reviews…</div>;

  return (
    <div className="space-y-6">
      {/* Pending reviews */}
      {unreviewed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-harvest" />
            <h3 className="font-display font-semibold text-[#0d2348]">Awaiting Your Review</h3>
            <span className="bg-harvest/10 text-harvest text-[10px] font-bold px-2 py-0.5 rounded-full">{unreviewed.length}</span>
          </div>
          <div className="space-y-3">
            {unreviewed.map(enr => (
              <div key={enr.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setSelectedEnrollment(selectedEnrollment?.id === enr.id ? null : enr)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-harvest" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0d2348] text-sm">{enr.course_title}</p>
                      <p className="text-xs text-slate-400">
                        {enr.status === "completed" ? "Completed" : `${enr.progress_percent || 0}% complete`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-harvest bg-harvest/10 px-3 py-1 rounded-full">
                    {selectedEnrollment?.id === enr.id ? "Cancel" : "Write Review"}
                  </span>
                </button>
                {selectedEnrollment?.id === enr.id && (
                  <div className="px-5 pb-5">
                    <CourseFeedbackForm
                      enrollment={enr}
                      user={user}
                      onSubmitted={() => {
                        setSelectedEnrollment(null);
                        loadReviews();
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted reviews */}
      {reviewed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="font-display font-semibold text-[#0d2348]">My Reviews</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviewed.map((enr, i) => {
              const review = reviews.find(r => r.enrollment_id === enr.id);
              return (
                <motion.div key={enr.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-[#0d2348] text-sm">{enr.course_title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Reviewed {review?.created_date ? new Date(review.created_date).toLocaleDateString("en-AU") : ""}
                      </p>
                    </div>
                    <StarDisplay value={review?.overall_rating || 0} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Content",    val: review?.content_quality },
                      { label: "Delivery",   val: review?.delivery_rating },
                      { label: "Relevance",  val: review?.relevance_rating },
                    ].map(r => r.val ? (
                      <div key={r.label} className="bg-slate-50 rounded-lg p-2 text-center">
                        <StarDisplay value={r.val} />
                        <p className="text-[10px] text-slate-500 mt-1">{r.label}</p>
                      </div>
                    ) : null)}
                  </div>
                  {review?.comments && (
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 italic">"{review.comments}"</p>
                  )}
                  <div className="flex gap-3 mt-3">
                    {review?.met_standards != null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.met_standards ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {review.met_standards ? "✓ Met Standards" : "✗ Below Standards"}
                      </span>
                    )}
                    {review?.would_recommend != null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.would_recommend ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {review.would_recommend ? "👍 Recommends" : "👎 Wouldn't Recommend"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Enrol in a course to leave a review.</p>
        </div>
      )}
    </div>
  );
}