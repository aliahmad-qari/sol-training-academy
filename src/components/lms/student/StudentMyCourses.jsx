import React, { useState } from "react";
import { BookOpen, Play, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LEVEL_CONFIG = {
  level1: { pill: "bg-blue-100 text-blue-700",   bar: "bg-blue-400",   label: "Level 1 — Foundation" },
  level2: { pill: "bg-amber-100 text-amber-700",  bar: "bg-amber-400",  label: "Level 2 — Professional" },
  level3: { pill: "bg-purple-100 text-purple-700", bar: "bg-purple-400", label: "Level 3 — Advanced" },
};

const STATUS_FILTER = ["all", "active", "completed", "paused"];

export default function StudentMyCourses({ enrollments, courses = [], onOpenCourse }) {
  const [filter, setFilter] = useState("all");

  // Build lookup: course_id (string) → thumbnail_url
  // Normalise both sides to String so ObjectId vs string never mismatches
  const thumbMap = {};
  courses.forEach(c => {
    const key = String(c._id || c.id);
    if (key) thumbMap[key] = c.thumbnail_url || "";
  });

  const getThumbnail = (enr) =>
    enr.course_thumbnail_url || thumbMap[String(enr.course_id)] || "";

  const filtered = filter === "all" ? enrollments : enrollments.filter(e => e.status === filter);

  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-[#0d2348] mb-2">No courses yet</h3>
        <p className="text-slate-500 text-sm mb-4">Browse our NDIS training courses to get started.</p>
        <Link to="/training-courses">
          <Button className="bg-harvest hover:bg-harvest/90 text-white gap-2">
            <BookOpen className="w-4 h-4" /> Browse Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_FILTER.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === s ? "bg-white shadow text-ink" : "text-slate-500 hover:text-ink"}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No {filter} courses.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(enr => {
            const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
            const pct = enr.progress_percent || 0;
            const isCompleted = enr.status === "completed";

            return (
              <button key={enr.id} onClick={() => onOpenCourse(enr)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all text-left group">
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                  {getThumbnail(enr) ? (
                    <img
                      src={getThumbnail(enr)}
                      alt={enr.course_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center`}
                      style={{ background: `linear-gradient(135deg, #1a1a1a 0%, #2d1f00 100%)` }}>
                      <BookOpen className="w-10 h-10 text-white/30" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-4 h-4 text-ink ml-0.5" />
                    </div>
                  </div>
                  {/* Status badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                  <h4 className="font-display font-semibold text-[#0d2348] mt-2 mb-3 leading-snug line-clamp-2">
                    {enr.course_title}
                  </h4>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{enr.completed_topic_ids?.length || 0} lessons done</span>
                      <span className={`font-bold ${isCompleted ? "text-emerald-600" : "text-ink"}`}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${isCompleted ? "bg-emerald-500" : cfg.bar}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
