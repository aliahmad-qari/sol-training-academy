import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Layers, Plus, Edit2, Trash2, ChevronDown, ChevronRight, GripVertical, X } from "lucide-react";
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

/** Pure array move helper — returns a new array with `start` moved to `end`. */
const reorderList = (list, start, end) => {
  const result = Array.from(list);
  const [moved] = result.splice(start, 1);
  result.splice(end, 0, moved);
  return result;
};

export default function AdminModuleManager({ courses }) {
  const [modules, setModules]       = useState([]);
  const [topics, setTopics]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
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

  // Reordering is index-based; a search filter hides rows and breaks index
  // alignment, so drag is only enabled when the full list is visible.
  const dragEnabled = !search && !editingId;

  /**
   * Single drag handler for both modules and topics. Updates local state
   * instantly (optimistic) and persists the new order in ONE bulk request.
   * On failure it reverts to the pre-drag snapshot so the UI never drifts
   * from the database — Mongo remains the source of truth.
   */
  const onDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // ── Modules: reorder within their course ────────────────────────────────
    if (type === "module") {
      if (destination.droppableId !== source.droppableId) return; // no cross-course moves
      const courseId = source.droppableId.replace("modules-", "");
      const siblings = modules
        .filter(m => m.course_id === courseId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const reordered = reorderList(siblings, source.index, destination.index)
        .map((m, i) => ({ ...m, sort_order: i }));

      const snapshot = modules;
      setModules([...modules.filter(m => m.course_id !== courseId), ...reordered]);
      setSavingOrder(true);
      try {
        await base44.entities.CourseModule.reorder(
          reordered.map(m => ({ id: m.id, sort_order: m.sort_order }))
        );
      } catch {
        setModules(snapshot);
        toast.error("Couldn't save module order — reverted.");
      } finally {
        setSavingOrder(false);
      }
      return;
    }

    // ── Topics: reorder within a module, or move across modules ──────────────
    if (type === "topic") {
      const srcModId = source.droppableId.replace("topics-", "");
      const dstModId = destination.droppableId.replace("topics-", "");
      const srcList = topics
        .filter(t => t.module_id === srcModId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const snapshot = topics;
      let payload = [];
      let nextTopics = [];

      if (srcModId === dstModId) {
        // In-module reorder.
        const reordered = reorderList(srcList, source.index, destination.index)
          .map((t, i) => ({ ...t, sort_order: i }));
        payload = reordered.map(t => ({ id: t.id, sort_order: t.sort_order }));
        nextTopics = [...topics.filter(t => t.module_id !== srcModId), ...reordered];
      } else {
        // Cross-module move: splice out of source, insert into destination.
        const dstList = topics
          .filter(t => t.module_id === dstModId)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const newSrc = Array.from(srcList);
        const [moved] = newSrc.splice(source.index, 1);
        const newDst = Array.from(dstList);
        newDst.splice(destination.index, 0, { ...moved, module_id: dstModId });

        const src2 = newSrc.map((t, i) => ({ ...t, sort_order: i }));
        const dst2 = newDst.map((t, i) => ({ ...t, sort_order: i, module_id: dstModId }));

        payload = [
          ...src2.map(t => ({ id: t.id, sort_order: t.sort_order })),
          ...dst2.map(t => ({ id: t.id, sort_order: t.sort_order, module_id: dstModId })),
        ];
        nextTopics = [
          ...topics.filter(t => t.module_id !== srcModId && t.module_id !== dstModId),
          ...src2,
          ...dst2,
        ];
      }

      setTopics(nextTopics);
      setSavingOrder(true);
      try {
        await base44.entities.CourseTopic.reorder(payload);
      } catch {
        setTopics(snapshot);
        toast.error("Couldn't save topic order — reverted.");
      } finally {
        setSavingOrder(false);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Module Management</h2>
          <p className="text-sm text-slate_mist">
            Add, edit, delete and drag-to-reorder modules and topics within each course.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savingOrder && <span className="text-xs text-harvest font-medium animate-pulse">Saving order…</span>}
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

      {!dragEnabled && !loading && (
        <p className="text-[11px] text-slate_mist mb-3 flex items-center gap-1.5">
          <GripVertical className="w-3 h-3 opacity-40" />
          Drag-to-reorder is paused while searching or editing a title. Clear the search to rearrange.
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading modules…</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
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

                  <Droppable droppableId={`modules-${course.id}`} type="module" isDropDisabled={!dragEnabled}>
                    {(dropProvided) => (
                      <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="p-4 space-y-2">
                        {(search ? filtered : courseMods).map((mod, idx) => {
                          const modTopics = topics.filter(t => t.module_id === mod.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                          const isExpanded = expanded[mod.id];
                          const isEditing  = editingId === mod.id;
                          return (
                            <Draggable key={mod.id} draggableId={mod.id} index={idx} isDragDisabled={!dragEnabled}>
                              {(dragProvided, snapshot) => (
                                <motion.div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                  className={`border rounded-xl overflow-hidden bg-white ${snapshot.isDragging ? "border-harvest shadow-lg" : "border-border/40"}`}
                                >
                                  <div className="flex items-center gap-2.5 p-3 bg-slate-50/50">
                                    <span {...dragProvided.dragHandleProps}
                                      className={`flex-shrink-0 ${dragEnabled ? "cursor-grab active:cursor-grabbing text-slate_mist/50 hover:text-slate_mist" : "text-slate_mist/20 cursor-not-allowed"}`}
                                      title={dragEnabled ? "Drag to reorder" : "Clear search to reorder"}>
                                      <GripVertical className="w-4 h-4" />
                                    </span>
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
                                    <Droppable droppableId={`topics-${mod.id}`} type="topic" isDropDisabled={!dragEnabled}>
                                      {(topicDrop) => (
                                        <div ref={topicDrop.innerRef} {...topicDrop.droppableProps} className="px-4 py-2 bg-white">
                                          {modTopics.length === 0
                                            ? <p className="text-xs text-slate_mist py-2">No topics yet. Go to Course Management to add topics.</p>
                                            : modTopics.map((t, ti) => (
                                              <Draggable key={t.id} draggableId={`topic-${t.id}`} index={ti} isDragDisabled={!dragEnabled}>
                                                {(tDrag, tSnap) => (
                                                  <div ref={tDrag.innerRef} {...tDrag.draggableProps}
                                                    className={`flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0 text-xs text-slate_mist rounded ${tSnap.isDragging ? "bg-harvest/5 shadow-sm" : ""}`}>
                                                    <span {...tDrag.dragHandleProps}
                                                      className={`flex-shrink-0 ${dragEnabled ? "cursor-grab active:cursor-grabbing text-slate_mist/40 hover:text-slate_mist" : "text-slate_mist/15"}`}>
                                                      <GripVertical className="w-3 h-3" />
                                                    </span>
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === "quiz" ? "bg-purple-400" : t.type === "reading" ? "bg-green-400" : (t.type === "assessment" || t.type === "assignment") ? "bg-amber-400" : "bg-blue-400"}`} />
                                                    <span className="flex-1 truncate text-ink">{t.title}</span>
                                                    <span className="capitalize opacity-60">{t.type}</span>
                                                    {t.video_duration_mins > 0 && <span>{t.video_duration_mins}m</span>}
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))
                                          }
                                          {topicDrop.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  )}
                                </motion.div>
                              )}
                            </Draggable>
                          );
                        })}
                        {dropProvided.placeholder}

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
                    )}
                  </Droppable>
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
        </DragDropContext>
      )}
    </div>
  );
}
