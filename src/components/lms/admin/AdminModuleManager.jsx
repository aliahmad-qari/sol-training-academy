import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Layers, Plus, Edit2, Trash2, ChevronDown, ChevronRight, GripVertical, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700",
};

export default function AdminModuleManager({ courses }) {
  const [modules, setModules]       = useState([]);
  const [topics, setTopics]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [expanded, setExpanded]     = useState({});
  const [editingId, setEditingId]   = useState(null);
  const [editTitle, setEditTitle]   = useState("");
  const [addingTo, setAddingTo]     = useState(null);
  const [newModTitle, setNewModTitle] = useState("");

  const load = async () => {
    setLoading(true);
    const [mods, tops] = await Promise.all([
      base44.entities.CourseModule.list("sort_order"),
      base44.entities.CourseTopic.list("sort_order"),
    ]);
    setModules(mods);
    setTopics(tops);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredMods = modules.filter(m => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "all" || m.course_id === courseFilter;
    return matchSearch && matchCourse;
  });

  const getCourse = (id) => courses.find(c => c.id === id);

  const startEdit = (mod) => { setEditingId(mod.id); setEditTitle(mod.title); };

  const saveEdit = async (mod) => {
    if (!editTitle.trim()) return;
    await base44.entities.CourseModule.update(mod.id, { title: editTitle });
    toast.success("Module updated.");
    setEditingId(null);
    load();
  };

  const deleteModule = async (mod) => {
    if (!confirm(`Delete module "${mod.title}" and all its topics?`)) return;
    const modTopics = topics.filter(t => t.module_id === mod.id);
    for (const t of modTopics) await base44.entities.CourseTopic.delete(t.id);
    await base44.entities.CourseModule.delete(mod.id);
    toast.success("Module deleted.");
    load();
  };

  const addModule = async (courseId) => {
    if (!newModTitle.trim()) return;
    const courseMods = modules.filter(m => m.course_id === courseId);
    await base44.entities.CourseModule.create({ course_id: courseId, title: newModTitle.trim(), sort_order: courseMods.length });
    setNewModTitle("");
    setAddingTo(null);
    toast.success("Module added.");
    load();
  };

  const moveModule = async (mod, direction) => {
    const siblings = modules.filter(m => m.course_id === mod.course_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const idx = siblings.findIndex(m => m.id === mod.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const swap = siblings[swapIdx];
    await Promise.all([
      base44.entities.CourseModule.update(mod.id,  { sort_order: swap.sort_order }),
      base44.entities.CourseModule.update(swap.id, { sort_order: mod.sort_order }),
    ]);
    load();
  };

  // Group modules by course
  const courseGroups = courses.map(c => ({
    course: c,
    modules: filteredMods.filter(m => m.course_id === c.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  })).filter(g => courseFilter === "all" ? g.modules.length > 0 || !search : g.course.id === courseFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Module Management</h2>
          <p className="text-sm text-slate_mist">Add, edit, delete and reorder modules within each course.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules…" className="w-44 h-9 text-sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Layers className="w-4 h-4 text-indigo-600" /></div>
          <div><p className="font-display font-bold text-xl text-ink">{modules.length}</p><p className="text-[10px] text-slate_mist">Total Modules</p></div>
        </div>
        <div className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Layers className="w-4 h-4 text-blue-600" /></div>
          <div><p className="font-display font-bold text-xl text-ink">{topics.length}</p><p className="text-[10px] text-slate_mist">Total Topics</p></div>
        </div>
        <div className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Layers className="w-4 h-4 text-green-600" /></div>
          <div><p className="font-display font-bold text-xl text-ink">{courses.length}</p><p className="text-[10px] text-slate_mist">Courses</p></div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading modules…</div>
      ) : (
        <div className="space-y-4">
          {courses.filter(c => courseFilter === "all" || c.id === courseFilter).map(course => {
            const courseMods = modules.filter(m => m.course_id === course.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            const filtered = courseMods.filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()));
            if (search && filtered.length === 0) return null;
            return (
              <div key={course.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                {/* Course header */}
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-border/30">
                  <div className={`w-2 h-6 rounded-full flex-shrink-0 ${course.level === "level1" ? "bg-blue-400" : course.level === "level2" ? "bg-amber-400" : "bg-purple-400"}`} />
                  <h3 className="font-display font-semibold text-ink flex-1 text-sm">{course.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                    {course.level?.replace("level", "L")}
                  </span>
                  <span className="text-xs text-slate_mist">{courseMods.length} module{courseMods.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="p-4 space-y-2">
                  {courseMods.map((mod, idx) => {
                    const modTopics = topics.filter(t => t.module_id === mod.id);
                    const isExpanded = expanded[mod.id];
                    const isEditing  = editingId === mod.id;
                    return (
                      <motion.div key={mod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border border-border/40 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2.5 p-3 bg-slate-50/50">
                          <GripVertical className="w-4 h-4 text-slate_mist/40 cursor-grab flex-shrink-0" />
                          <button onClick={() => setExpanded(e => ({ ...e, [mod.id]: !e[mod.id] }))} className="text-slate_mist hover:text-ink flex-shrink-0">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          {isEditing ? (
                            <Input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && saveEdit(mod)}
                              className="flex-1 h-7 text-sm" />
                          ) : (
                            <span className="flex-1 text-sm font-medium text-ink">{mod.title}</span>
                          )}
                          <span className="text-xs text-slate_mist bg-white px-2 py-0.5 rounded-full border border-border/40 flex-shrink-0">
                            {modTopics.length} topics
                          </span>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button onClick={() => moveModule(mod, "up")} disabled={idx === 0}
                              className="text-slate_mist/40 hover:text-ink p-1 disabled:opacity-20 text-xs">▲</button>
                            <button onClick={() => moveModule(mod, "down")} disabled={idx === courseMods.length - 1}
                              className="text-slate_mist/40 hover:text-ink p-1 disabled:opacity-20 text-xs">▼</button>
                            {isEditing ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(mod)} className="bg-harvest text-white h-7 text-xs px-2 ml-1">Save</Button>
                                <button onClick={() => setEditingId(null)} className="p-1 text-slate_mist hover:text-ink ml-1"><X className="w-3.5 h-3.5" /></button>
                              </>
                            ) : (
                              <button onClick={() => startEdit(mod)} className="p-1 text-slate_mist hover:text-ink"><Edit2 className="w-3.5 h-3.5" /></button>
                            )}
                            <button onClick={() => deleteModule(mod)} className="p-1 text-slate_mist hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 py-2 bg-white">
                            {modTopics.length === 0
                              ? <p className="text-xs text-slate_mist py-2">No topics yet. Go to Course Management to add topics.</p>
                              : modTopics.map(t => (
                                <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0 text-xs text-slate_mist">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === "quiz" ? "bg-purple-400" : "bg-blue-400"}`} />
                                  <span className="flex-1 truncate text-ink">{t.title}</span>
                                  <span className="capitalize opacity-60">{t.type}</span>
                                  {t.video_duration_mins > 0 && <span>{t.video_duration_mins}m</span>}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Add new module inline */}
                  {addingTo === course.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input autoFocus value={newModTitle} onChange={e => setNewModTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addModule(course.id)}
                        placeholder="Module title…" className="flex-1 h-8 text-sm" />
                      <Button size="sm" onClick={() => addModule(course.id)} className="bg-harvest text-white h-8 text-xs">Add</Button>
                      <button onClick={() => setAddingTo(null)}><X className="w-4 h-4 text-slate_mist" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingTo(course.id); setNewModTitle(""); }}
                      className="flex items-center gap-2 text-xs text-harvest hover:text-harvest/80 font-medium px-2 py-2 rounded-lg hover:bg-harvest/5 transition-colors mt-1">
                      <Plus className="w-3.5 h-3.5" /> Add Module to this Course
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
              <Layers className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
              <p className="font-display font-semibold text-ink">No courses found</p>
              <p className="text-sm text-slate_mist">Create a course first, then add modules.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}