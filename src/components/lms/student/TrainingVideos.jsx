import React, { useState, useEffect } from "react";
import { Video, Search, Play, CheckCircle, Clock, BookOpen, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import apiClient from "@/api/apiClient";

const LEVEL_CONFIG = {
  level1: { pill: "bg-harvest/10 text-harvest border-harvest/30",         bar: "bg-harvest",     label: "Level 1 — Foundation" },
  level2: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200",    bar: "bg-emerald-500", label: "Level 2 — Professional" },
  level3: { pill: "bg-amber-50 text-amber-700 border-amber-200",          bar: "bg-amber-500",   label: "Level 3 — Advanced" },
};

export default function TrainingVideos({ enrollments = [] }) {
  const [topics, setTopics]         = useState([]);   // all video topics across enrolled courses
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeEnrId, setActiveEnrId] = useState("all");

  // Fetch video topics for every enrolled course
  useEffect(() => {
    if (!enrollments.length) { setLoading(false); return; }
    const courseIds = [...new Set(enrollments.map(e => e.course_id))];
    Promise.all(
      courseIds.map(cid =>
        apiClient.get(`/topics?course_id=${cid}&type=video&limit=200`)
          .then(r => r.data?.data ?? [])
          .catch(() => [])
      )
    ).then(results => {
      setTopics(results.flat());
      setLoading(false);
    });
  }, [enrollments]);

  if (!enrollments.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
        <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-[#0d2348] mb-2">No training videos yet</h3>
        <p className="text-slate-500 text-sm">Enrol in a course to access its training videos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Build per-enrollment completed set for quick lookup
  const completedMap = {};
  enrollments.forEach(e => {
    (e.completed_topic_ids || []).forEach(id => { completedMap[String(id)] = true; });
  });

  // Filter topics by selected enrollment and search
  const visibleTopics = topics.filter(t => {
    const enrMatch = activeEnrId === "all" || enrollments.find(
      e => String(e.course_id) === String(t.course_id) && (e._id || e.id) === activeEnrId
    );
    const searchMatch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return enrMatch && searchMatch;
  });

  const totalVideos    = visibleTopics.length;
  const totalCompleted = visibleTopics.filter(t => completedMap[String(t._id || t.id)]).length;
  const totalMins      = visibleTopics.reduce((s, t) => s + (t.video_duration_mins || 0), 0);
  const totalHours     = totalMins > 0 ? (totalMins / 60).toFixed(1) : "—";

  // Group by course
  const grouped = {};
  visibleTopics.forEach(t => {
    const key = String(t.course_id);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-harvest/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-harvest" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-white text-lg">Training Videos</h2>
            <p className="text-white/50 text-sm">Video lessons from your enrolled courses</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search videos…"
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-9 text-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Videos",  value: totalVideos,                    color: "text-white" },
            { label: "Completed",     value: totalCompleted,                 color: "text-emerald-400" },
            { label: "Remaining",     value: totalVideos - totalCompleted,   color: "text-amber-400" },
            { label: "Est. Hours",    value: `~${totalHours}h`,              color: "text-harvest" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveEnrId("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            activeEnrId === "all"
              ? "bg-harvest text-white border-harvest"
              : "bg-white text-slate-600 border-border hover:border-harvest/50 hover:text-harvest"
          }`}>
          All Courses
        </button>
        {enrollments.map(e => (
          <button key={e._id || e.id} onClick={() => setActiveEnrId(e._id || e.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border truncate max-w-[200px] ${
              activeEnrId === (e._id || e.id)
                ? "bg-harvest text-white border-harvest"
                : "bg-white text-slate-600 border-border hover:border-harvest/50 hover:text-harvest"
            }`}>
            {e.course_title}
          </button>
        ))}
      </div>

      {/* No results */}
      {visibleTopics.length === 0 && (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {search ? "No videos match your search." : "No video topics found in your enrolled courses."}
          </p>
        </div>
      )}

      {/* Grouped by course */}
      {Object.entries(grouped).map(([courseId, courseTopics]) => {
        const enr = enrollments.find(e => String(e.course_id) === courseId);
        if (!enr) return null;
        const cfg = LEVEL_CONFIG[enr.course_level] || LEVEL_CONFIG.level1;
        const doneCourse = courseTopics.filter(t => completedMap[String(t._id || t.id)]).length;

        return (
          <div key={courseId} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            {/* Course header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-border/30 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
                    {cfg.label}
                  </span>
                  <h4 className="font-display font-semibold text-ink text-sm truncate">{enr.course_title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-1 rounded-full ${cfg.bar}`}
                      style={{ width: `${courseTopics.length ? (doneCourse / courseTopics.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{doneCourse}/{courseTopics.length} videos</span>
                </div>
              </div>
            </div>

            {/* Video list */}
            <div className="divide-y divide-slate-50">
              {courseTopics
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map(topic => {
                  const topicId   = String(topic._id || topic.id);
                  const done      = !!completedMap[topicId];
                  const isExpired = enr.expiry_date && new Date(enr.expiry_date) < new Date();

                  return (
                    <div key={topicId}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                        ${done ? "bg-emerald-100" : isExpired ? "bg-slate-100" : "bg-slate-100 group-hover:bg-harvest/10"}`}>
                        {done
                          ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                          : isExpired
                          ? <Lock className="w-4 h-4 text-slate-400" />
                          : <Play className="w-4 h-4 text-slate-400 group-hover:text-harvest" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors
                          ${done ? "text-slate-400 line-through" : "text-ink group-hover:text-harvest"}`}>
                          {topic.title}
                        </p>
                        {topic.content && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{topic.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {done && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Watched
                          </span>
                        )}
                        {topic.video_duration_mins > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{topic.video_duration_mins}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
