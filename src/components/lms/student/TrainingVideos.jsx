import React, { useState } from "react";
import { Video, Search, Play, CheckCircle, Clock, Filter, BookOpen, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VIDEO_CATEGORIES = [
  {
    id: "all", label: "All Videos", count: 237,
  },
  {
    id: "l1", label: "Level 1 — Foundation", count: 72,
  },
  {
    id: "l2", label: "Level 2 — Professional", count: 89,
  },
  {
    id: "l3", label: "Level 3 — Advanced", count: 76,
  },
];

const MODULES = [
  {
    id: 1, level: "l1", title: "Introduction to NDIS",
    videos: [
      { id: 1, title: "What is the NDIS? An Overview", duration: "12:30", completed: true, views: 1 },
      { id: 2, title: "NDIS Eligibility Criteria Explained", duration: "9:45", completed: true, views: 1 },
      { id: 3, title: "The Role of a Support Coordinator", duration: "14:20", completed: false, views: 0 },
      { id: 4, title: "NDIS Participant Pathways", duration: "11:00", completed: false, views: 0 },
    ]
  },
  {
    id: 2, level: "l1", title: "NDIS Plans & Funding",
    videos: [
      { id: 5, title: "Understanding NDIS Plans", duration: "16:10", completed: false, views: 0 },
      { id: 6, title: "Funding Categories & Budgets", duration: "13:55", completed: false, views: 0 },
      { id: 7, title: "Plan Management Options", duration: "10:20", completed: false, views: 0 },
    ]
  },
  {
    id: 3, level: "l2", title: "Advanced Support Coordination",
    videos: [
      { id: 8, title: "Complex Support Needs Assessment", duration: "18:40", completed: false, views: 0 },
      { id: 9, title: "Crisis Intervention Strategies", duration: "22:15", completed: false, views: 0 },
      { id: 10, title: "Specialist Disability Accommodation", duration: "15:30", completed: false, views: 0 },
    ]
  },
  {
    id: 4, level: "l2", title: "NDIS Practice Standards",
    videos: [
      { id: 11, title: "Quality & Safeguards Framework", duration: "20:00", completed: false, views: 0 },
      { id: 12, title: "Incident Reporting Requirements", duration: "12:45", completed: false, views: 0 },
      { id: 13, title: "Complaint Management Process", duration: "11:30", completed: false, views: 0 },
    ]
  },
  {
    id: 5, level: "l3", title: "Specialist Coordination",
    videos: [
      { id: 14, title: "Behaviour Support Plans", duration: "25:10", completed: false, views: 0 },
      { id: 15, title: "Complex Case Management", duration: "28:00", completed: false, views: 0 },
      { id: 16, title: "Tribunal & Appeals Process", duration: "19:20", completed: false, views: 0 },
    ]
  },
];

const LEVEL_COLORS = {
  l1: "bg-harvest/10 text-harvest border-harvest/30",
  l2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  l3: "bg-amber-50 text-amber-700 border-amber-200",
};
const LEVEL_LABELS = { l1: "Level 1", l2: "Level 2", l3: "Level 3" };

export default function TrainingVideos({ enrollments = [] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedModule, setExpandedModule] = useState(1);

  const totalCompleted = MODULES.flatMap(m => m.videos).filter(v => v.completed).length;
  const totalRemaining = 237 - totalCompleted;

  const filteredModules = MODULES.filter(m => {
    if (activeCategory !== "all" && m.level !== activeCategory) return false;
    if (search) {
      return m.videos.some(v => v.title.toLowerCase().includes(search.toLowerCase())) ||
        m.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
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
            <p className="text-white/50 text-sm">237 professional NDIS training videos across 3 certification levels</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search videos…"
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-9 text-sm" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Videos", value: "237", color: "text-white" },
            { label: "Completed", value: totalCompleted.toString(), color: "text-emerald-400" },
            { label: "Remaining", value: totalRemaining.toString(), color: "text-amber-400" },
            { label: "Est. Hours", value: "~58h", color: "text-harvest" },
          ].map(s => (
            <div key={s.label} className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {VIDEO_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? "bg-harvest text-white border-harvest shadow-sm"
                : "bg-white text-slate-600 border-border hover:border-harvest/50 hover:text-harvest"
            }`}>
            {cat.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Continue watching */}
      <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-harvest" />
          <h3 className="font-display font-semibold text-ink">Continue Watching</h3>
        </div>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-10 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">The Role of a Support Coordinator</p>
            <p className="text-white/40 text-xs mt-0.5">Level 1 · Introduction to NDIS · 14:20</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full">
                <div className="h-1 bg-harvest rounded-full" style={{ width: "35%" }} />
              </div>
              <span className="text-white/40 text-[10px] flex-shrink-0">35% watched</span>
            </div>
          </div>
          <Button size="sm" className="bg-harvest text-white flex-shrink-0 gap-1 text-xs">
            <Play className="w-3 h-3 fill-white" /> Resume
          </Button>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {filteredModules.map(module => {
          const moduleVideos = search
            ? module.videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
            : module.videos;
          const doneCount = moduleVideos.filter(v => v.completed).length;
          const isOpen = expandedModule === module.id;

          return (
            <div key={module.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <button onClick={() => setExpandedModule(isOpen ? null : module.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doneCount === moduleVideos.length && moduleVideos.length > 0
                    ? "bg-emerald-100" : "bg-slate-100"
                }`}>
                  {doneCount === moduleVideos.length && moduleVideos.length > 0
                    ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                    : <BookOpen className="w-4 h-4 text-slate-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[module.level]}`}>
                      {LEVEL_LABELS[module.level]}
                    </span>
                    <h4 className="font-display font-semibold text-ink text-sm">{module.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 max-w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-1 bg-harvest rounded-full"
                      style={{ width: `${moduleVideos.length ? (doneCount / moduleVideos.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">{doneCount}/{moduleVideos.length} videos</span>
                  </div>
                </div>
                <span className={`text-white/80 transition-transform duration-200 text-slate-300 ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {moduleVideos.map(video => (
                    <div key={video.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group cursor-pointer`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                        ${video.completed ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-harvest/10"}`}>
                        {video.completed
                          ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                          : <Play className="w-4 h-4 text-slate-400 group-hover:text-harvest" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors
                          ${video.completed ? "text-slate-400 line-through" : "text-ink group-hover:text-harvest"}`}>
                          {video.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {video.completed && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Watched
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
            <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No videos found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}