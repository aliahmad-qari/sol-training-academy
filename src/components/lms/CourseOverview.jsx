import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Video, HelpCircle, FileText, CheckCircle, Play, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVEL_CONFIG = {
  level1: { label: "Level 1 — Foundation",    color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/30",  bar: "bg-amber-400" },
  level2: { label: "Level 2 — Professional",  color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/30", bar: "bg-emerald-400" },
  level3: { label: "Level 3 — Advanced",      color: "text-blue-400",    bg: "bg-blue-500/10",   border: "border-blue-500/30",   bar: "bg-blue-400" },
};

function StatCard({ icon: StatIcon, label, value, color = "text-harvest" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${color}`}>
        <StatIcon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-display font-bold text-xl leading-none">{value}</p>
        <p className="text-white/40 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function CourseOverview({ enrollment, course, modules, topics, onStartLearning, onOpenTopic }) {
  const cfg = LEVEL_CONFIG[enrollment.course_level] || LEVEL_CONFIG.level1;
  const progress = enrollment.progress_percent || 0;
  const completedIds = enrollment.completed_topic_ids || [];

  const videoTopics      = topics.filter(t => t.type === "video" || !t.type);
  const quizTopics       = topics.filter(t => t.type === "quiz");
  const readingTopics    = topics.filter(t => t.type === "reading");
  const assessmentTopics = topics.filter(t => t.type === "assessment");

  const daysLeft = (() => {
    if (!enrollment.expiry_date) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const exp = new Date(enrollment.expiry_date); exp.setHours(0,0,0,0);
    return Math.round((exp - today) / (1000 * 60 * 60 * 24));
  })();

  // Find the first incomplete topic to resume
  const nextTopic = topics.find(t => !completedIds.includes(t.id));

  const TOPIC_TYPE = {
    video:      { icon: "📹", label: "Video",      color: "bg-blue-500/20 text-blue-300",    border: "border-blue-500/20" },
    reading:    { icon: "📖", label: "Reading",    color: "bg-green-500/20 text-green-300",  border: "border-green-500/20" },
    quiz:       { icon: "❓", label: "Quiz",        color: "bg-purple-500/20 text-purple-300", border: "border-purple-500/20" },
    assessment: { icon: "📝", label: "Assessment", color: "bg-amber-500/20 text-amber-300",  border: "border-amber-500/20" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6">

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #D97706 0%, transparent 50%)" }} />
        <div className="relative z-10 p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color} uppercase tracking-wider`}>
                {cfg.label}
              </span>
              <h1 className="text-white font-display font-bold text-2xl sm:text-3xl mt-3 mb-2 leading-tight">
                {enrollment.course_title}
              </h1>
              {course?.description && (
                <p className="text-white/50 text-sm leading-relaxed max-w-xl">{course.description}</p>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0 w-full md:w-auto">
              {progress === 100 ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award className="w-6 h-6" />
                  <span className="font-display font-bold text-lg">Completed!</span>
                </div>
              ) : (
                <Button onClick={onStartLearning}
                  className="w-full md:w-auto bg-harvest hover:bg-harvest/90 text-white gap-2 px-6 py-5 text-base font-semibold font-display">
                  <Play className="w-5 h-5" />
                  {progress > 0 ? "Continue Learning" : "Start Learning"}
                </Button>
              )}
              {nextTopic && progress < 100 && (
                <p className="text-white/40 text-xs md:text-right truncate max-w-full">Next: {nextTopic.title}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Course Progress</span>
              <span className="font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div className={`h-2.5 rounded-full ${cfg.bar}`}
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
            <div className="flex justify-between text-xs text-white/30 mt-1.5">
              <span>{completedIds.length} of {topics.length} topics completed</span>
              {daysLeft !== null && (
                <span className={daysLeft <= 7 ? "text-red-400 font-semibold" : daysLeft <= 30 ? "text-amber-400 font-semibold" : ""}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : "Access expired"}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}   label="Total Modules"  value={modules.length}         color="text-harvest" />
        <StatCard icon={Video}      label="Video Lessons"  value={videoTopics.length}     color="text-blue-400" />
        <StatCard icon={HelpCircle} label="Quizzes"        value={quizTopics.length}      color="text-purple-400" />
        <StatCard icon={FileText}   label="Assessments"    value={assessmentTopics.length} color="text-amber-400" />
      </motion.div>

      {/* Module Structure */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-white font-display font-bold text-xl mb-4">Course Content</h2>
        <div className="space-y-4">
          {modules.map((mod, mi) => {
            const modTopics = topics.filter(t => t.module_id === mod.id);
            const modDone   = modTopics.filter(t => completedIds.includes(t.id)).length;
            const modPct    = modTopics.length > 0 ? Math.round((modDone / modTopics.length) * 100) : 0;

            return (
              <div key={mod.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Module header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-harvest/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-harvest font-display font-bold text-sm">{mi + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-display font-semibold">{mod.title}</p>
                      <p className="text-white/40 text-xs">{modTopics.length} topic{modTopics.length !== 1 ? "s" : ""} · {modDone} completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all ${cfg.bar}`} style={{ width: `${modPct}%` }} />
                    </div>
                    <span className="text-white/40 text-xs font-mono">{modPct}%</span>
                    {modPct === 100 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>

                {/* Topics list */}
                <div className="divide-y divide-white/5">
                  {modTopics.map((topic, ti) => {
                    const tc = TOPIC_TYPE[topic.type] || TOPIC_TYPE.video;
                    const done = completedIds.includes(topic.id);
                    return (
                      <button key={topic.id} onClick={() => onOpenTopic(topic.id)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors text-left group">
                        <span className="text-xl flex-shrink-0 w-6 text-center">{tc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate transition-colors ${done ? "text-emerald-400" : "text-white/80 group-hover:text-white"}`}>
                            {topic.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tc.color}`}>{tc.label}</span>
                            {topic.video_duration_mins > 0 && <span className="text-[10px] text-white/30">{topic.video_duration_mins} min</span>}
                            {topic.reading_duration_mins > 0 && <span className="text-[10px] text-white/30">{topic.reading_duration_mins} min read</span>}
                            {topic.quiz_questions?.length > 0 && <span className="text-[10px] text-white/30">{topic.quiz_questions.length} questions</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {done ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-harvest/60 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}