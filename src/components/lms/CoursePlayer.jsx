import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, HelpCircle, BookOpen, FileText,
  Menu, X, Clock, TrendingUp, LayoutGrid, ChevronDown, ChevronUp, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/lms/VideoPlayer";
import QuizComponent from "@/components/lms/QuizComponent";
import ReadingTopicView from "@/components/lms/ReadingTopicView";
import AssessmentTopicView from "@/components/lms/AssessmentTopicView";
import TopicNotes from "@/components/lms/TopicNotes";
import CourseOverview from "@/components/lms/CourseOverview";

const TOPIC_TYPE = {
  video:      { icon: "📹", label: "Video",      textColor: "text-blue-300",    bg: "bg-blue-500/20" },
  reading:    { icon: "📖", label: "Reading",    textColor: "text-green-300",   bg: "bg-green-500/20" },
  quiz:       { icon: "❓", label: "Quiz",        textColor: "text-purple-300",  bg: "bg-purple-500/20" },
  assessment: { icon: "📝", label: "Assessment", textColor: "text-amber-300",   bg: "bg-amber-500/20" },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function CourseSidebar({ modules, topics, enrollment, activeTopicId, setActiveTopicId, onShowOverview, showingOverview }) {
  const completedIds = (enrollment.completed_topic_ids || []).map(String);
  const tid = (t) => t._id || t.id;
  const mid = (m) => m._id || m.id;
  const [expandedModules, setExpandedModules] = useState(() => {
    const set = new Set();
    if (activeTopicId) {
      const t = topics.find(t => tid(t) === activeTopicId);
      if (t) set.add(t.module_id?.toString());
    } else {
      modules.forEach(m => set.add(mid(m)));
    }
    return set;
  });

  const toggleModule = (id) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const progress = enrollment.progress_percent || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Mini progress */}
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <span>Progress</span>
          <span className="font-bold text-white">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-1.5 bg-harvest rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Overview button */}
      <button onClick={onShowOverview}
        className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-b border-white/5 transition-colors flex-shrink-0 ${showingOverview ? "bg-harvest/20 text-harvest" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
        <LayoutGrid className="w-4 h-4 flex-shrink-0" />
        Course Overview
      </button>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((mod, mi) => {
          const modId      = mid(mod);
          const modTopics  = topics.filter(t => String(t.module_id) === String(modId));
          const modDone    = modTopics.filter(t => completedIds.includes(String(tid(t)))).length;
          const expanded   = expandedModules.has(modId);
          const modPct     = modTopics.length > 0 ? Math.round((modDone / modTopics.length) * 100) : 0;

          return (
            <div key={modId} className="mb-1">
              {/* Module header */}
              <button onClick={() => toggleModule(modId)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                <div className="w-5 h-5 rounded bg-harvest/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-harvest text-[10px] font-bold">{mi + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-semibold truncate">{mod.title}</p>
                  <p className="text-white/30 text-[10px]">{modDone}/{modTopics.length} · {modPct}%</p>
                </div>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
              </button>

              {/* Topics */}
              {expanded && modTopics.map(topic => {
                const tc     = TOPIC_TYPE[topic.type] || TOPIC_TYPE.video;
                const topicId = tid(topic);
                const done   = completedIds.includes(String(topicId));
                const active = topicId === activeTopicId;
                return (
                  <button key={topicId} onClick={() => setActiveTopicId(topicId)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all pl-8 ${active ? "bg-harvest/20 border-r-2 border-harvest" : "hover:bg-white/5"}`}>
                    <span className="text-base flex-shrink-0">{tc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${active ? "text-white" : done ? "text-emerald-400" : "text-white/60"}`}>{topic.title}</p>
                      <span className={`text-[9px] font-semibold ${tc.textColor}`}>{tc.label}</span>
                    </div>
                    <div className="flex-shrink-0">
                      {done ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                             : <div className={`w-3.5 h-3.5 rounded-full border ${active ? "border-harvest" : "border-white/20"}`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// ── Topic Content ─────────────────────────────────────────────────────────────
function TopicContent({ topic, user, enrollment, isCompleted, onComplete, onNext, onPrev, hasPrev, hasNext, topics, modules }) {
  const tc = TOPIC_TYPE[topic.type] || TOPIC_TYPE.video;
  const tid = (t) => t._id || t.id;
  const mid = (m) => m._id || m.id;

  // Module info
  const mod = modules.find(m => String(mid(m)) === String(topic.module_id));
  const modTopics = topics.filter(t => String(t.module_id) === String(topic.module_id));
  const topicIndexInModule = modTopics.findIndex(t => String(tid(t)) === String(tid(topic))) + 1;

  return (
    <div className="flex flex-col h-full">
      {/* Topic header bar */}
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          {mod && <span className="text-white/30 text-xs">{mod.title}</span>}
          <span className="text-white/20 text-xs">›</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tc.bg} ${tc.textColor}`}>
            {tc.icon} {tc.label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-white font-display font-bold text-xl leading-tight">{topic.title}</h1>
          <div className="text-white/30 text-xs flex-shrink-0">
            {topicIndexInModule}/{modTopics.length} in module
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={tid(topic)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {(topic.type === "video" || !topic.type) && (
              <VideoPlayer topic={topic} isCompleted={isCompleted} onComplete={onComplete} />
            )}
            {topic.type === "reading" && (
              <ReadingTopicView topic={topic} isCompleted={isCompleted} onComplete={onComplete} />
            )}
            {topic.type === "quiz" && (
              <QuizComponent topic={topic} userId={user?._id || user?.id} courseId={enrollment.course_id}
                onPass={onComplete} onNext={onNext} isCompleted={isCompleted} />
            )}
            {topic.type === "assessment" && (
              <AssessmentTopicView topic={topic} user={user} enrollment={enrollment}
                isCompleted={isCompleted} onComplete={onComplete} />
            )}

            {/* Topic Notes */}
            {topic.type !== "quiz" && (
              <div className="mt-8">
                <TopicNotes userId={user?._id || user?.id} courseId={enrollment.course_id}
                  courseTitle={enrollment.course_title}
                  topicId={tid(topic)} topicTitle={topic.title} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0 bg-slate-950/50">
        <Button variant="outline" onClick={onPrev} disabled={!hasPrev}
          className="gap-2 text-white border-white/20 hover:bg-white/10 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <div className="flex items-center gap-2 text-white/30 text-xs">
          {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isCompleted ? "Completed" : "In Progress"}</span>
        </div>

        <Button onClick={onNext} disabled={!hasNext}
          className="gap-2 bg-harvest hover:bg-harvest/90 text-white disabled:opacity-30">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main CoursePlayer ─────────────────────────────────────────────────────────
export default function CoursePlayer({ enrollment, course, modules, topics, user, activeTopicId, setActiveTopicId, onMarkComplete, onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOverview, setShowOverview] = useState(!activeTopicId);

  const tid = (t) => t._id || t.id;
  const activeTopic = topics.find(t => tid(t) === activeTopicId);
  const topicIndex  = topics.findIndex(t => tid(t) === activeTopicId);
  const completedIds = (enrollment.completed_topic_ids || []).map(String);
  const progress     = enrollment.progress_percent || 0;
  const completedCount = completedIds.length;

  const daysLeft = (() => {
    if (!enrollment.expiry_date) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const exp = new Date(enrollment.expiry_date); exp.setHours(0,0,0,0);
    return Math.round((exp - today) / (1000 * 60 * 60 * 24));
  })();

  const goPrev = () => {
    if (topicIndex > 0) { setActiveTopicId(tid(topics[topicIndex - 1])); setShowOverview(false); }
  };
  const goNext = () => {
    if (topicIndex < topics.length - 1) { setActiveTopicId(tid(topics[topicIndex + 1])); setShowOverview(false); }
  };

  const handleOpenTopic = (topicId) => {
    setActiveTopicId(topicId);
    setShowOverview(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Top Bar ── */}
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-30">
        {/* Back button */}
        <button onClick={onBack}
          className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5 text-sm flex-shrink-0">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(s => !s)}
          className="text-white/40 hover:text-white transition-colors flex-shrink-0">
          <Menu className="w-4 h-4" />
        </button>

        {/* Course title */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-white font-semibold text-sm truncate">{enrollment.course_title}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-harvest" />
            <span className="text-white text-xs font-bold">{progress}%</span>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-white/40 text-xs">{completedCount}/{topics.length}</span>
          {daysLeft !== null && (
            <span className={`text-xs font-semibold flex items-center gap-1 ${daysLeft <= 7 ? "text-red-400" : daysLeft <= 30 ? "text-amber-400" : "text-white/40"}`}>
              <Clock className="w-3 h-3" /> {daysLeft}d
            </span>
          )}
          {progress === 100 && <Award className="w-4 h-4 text-amber-400" />}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-slate-900 border-r border-white/10 overflow-hidden flex-shrink-0 flex flex-col"
              style={{ width: 280 }}>
              <CourseSidebar
                modules={modules} topics={topics} enrollment={enrollment}
                activeTopicId={activeTopicId} setActiveTopicId={(id) => { setActiveTopicId(id); setShowOverview(false); }}
                onShowOverview={() => { setShowOverview(true); setActiveTopicId(null); }}
                showingOverview={showOverview}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showOverview || !activeTopic ? (
            <div className="flex-1 overflow-y-auto">
              <CourseOverview
                enrollment={enrollment} course={course}
                modules={modules} topics={topics}
                onStartLearning={() => {
                  const next = topics.find(t => !completedIds.includes(String(tid(t)))) || topics[0];
                  if (next) { setActiveTopicId(tid(next)); setShowOverview(false); }
                }}
                onOpenTopic={handleOpenTopic}
              />
            </div>
          ) : (
            <TopicContent
              topic={activeTopic} user={user} enrollment={enrollment}
              isCompleted={completedIds.includes(String(tid(activeTopic)))}
              onComplete={() => onMarkComplete(tid(activeTopic))}
              onNext={goNext} onPrev={goPrev}
              hasPrev={topicIndex > 0} hasNext={topicIndex < topics.length - 1}
              topics={topics} modules={modules}
            />
          )}
        </div>
      </div>
    </div>
  );
}