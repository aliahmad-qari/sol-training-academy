import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CRITERIA = [
  { key: "content_quality",  label: "Content Quality",          hint: "How well was the material written and organised?" },
  { key: "delivery_rating",  label: "Delivery & Presentation",  hint: "Videos, pacing, and learning format." },
  { key: "relevance_rating", label: "NDIS Relevance",           hint: "How relevant is this to real-world NDIS practice?" },
];

function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none disabled:cursor-default">
          <Star className={`w-6 h-6 transition-colors ${
            n <= (hovered || value)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }`} />
        </button>
      ))}
    </div>
  );
}

export default function CourseFeedbackForm({ enrollment, user }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    overall_rating:  0,
    content_quality: 0,
    delivery_rating: 0,
    relevance_rating: 0,
    met_standards:   null,
    would_recommend: null,
    comments: "",
  });

  useEffect(() => {
    base44.entities.CourseFeedback
      .filter({ enrollment_id: enrollment.id, user_id: user.id })
      .then(existing => {
        if (existing.length > 0) setSubmitted(true);
        setLoading(false);
      });
  }, [enrollment.id, user.id]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.overall_rating) { toast.error("Please give an overall rating."); return; }
    setSaving(true);
    await base44.entities.CourseFeedback.create({
      user_id:       user.id,
      user_name:     user.full_name || user.email,
      enrollment_id: enrollment.id,
      course_id:     enrollment.course_id,
      course_title:  enrollment.course_title,
      course_level:  enrollment.course_level,
      ...form,
    });
    toast.success("Thank you! Your feedback has been submitted.");
    setSubmitted(true);
    setSaving(false);
  };

  if (loading) return null;

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-emerald-800 text-sm">Feedback submitted — thank you!</p>
          <p className="text-emerald-600 text-xs mt-0.5">Your response helps us meet Australian training standards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-amber-50 border-b border-amber-100 px-5 py-4 flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-semibold text-slate-800 text-sm">Course Feedback</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Help us maintain Australian training standards — this only takes 1 minute.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Overall rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Overall Rating <span className="text-red-400">*</span>
          </label>
          <StarRating value={form.overall_rating} onChange={v => setField("overall_rating", v)} />
          {form.overall_rating > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.overall_rating]}
            </p>
          )}
        </div>

        {/* Per-criteria ratings */}
        <div className="grid sm:grid-cols-3 gap-4">
          {CRITERIA.map(c => (
            <div key={c.key} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-700 mb-0.5">{c.label}</p>
              <p className="text-[10px] text-slate-400 mb-2">{c.hint}</p>
              <StarRating value={form[c.key]} onChange={v => setField(c.key, v)} />
            </div>
          ))}
        </div>

        {/* Yes/No questions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Did this course meet Australian training standards?
            </p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button key={String(val)} type="button"
                  onClick={() => setField("met_standards", val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    form.met_standards === val
                      ? val ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-400 text-white border-red-400"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}>
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Would you recommend this course to a colleague?
            </p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button key={String(val)} type="button"
                  onClick={() => setField("would_recommend", val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    form.would_recommend === val
                      ? val ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-400 text-white border-red-400"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}>
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Additional Comments <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <Textarea
            value={form.comments}
            onChange={e => setField("comments", e.target.value)}
            placeholder="Share any suggestions, highlights, or areas for improvement…"
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        <Button onClick={handleSubmit} disabled={saving || !form.overall_rating}
          className="w-full bg-harvest text-white gap-2">
          {saving ? "Submitting…" : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}