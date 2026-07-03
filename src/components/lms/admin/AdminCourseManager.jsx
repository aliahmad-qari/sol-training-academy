import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight, Video, HelpCircle,
  BookOpen, Eye, EyeOff, X, Save, FileText, Users, BarChart2, Award, ClipboardList
} from "lucide-react";
import TopicModal from "@/components/lms/admin/TopicModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CourseEnrollmentManager from "@/components/lms/admin/CourseEnrollmentManager";
import AdminAssessmentManager from "@/components/lms/admin/AdminAssessmentManager";
import AdminCertificates from "@/components/lms/admin/AdminCertificates";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700"
};

const LEVEL_BADGE = { level1: "Foundation", level2: "Professional", level3: "Advanced" };
const LEVEL_PILL  = { level1: "bg-blue-100 text-blue-700 border-blue-200", level2: "bg-amber-100 text-amber-700 border-amber-200", level3: "bg-purple-100 text-purple-700 border-purple-200" };

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState(course || {
    title: "", level: "level1", badge: "Foundation", description: "", price: 199,
    duration: "4-6 hours", is_published: true, outcomes: [], sort_order: 0, thumbnail_url: "",
    access_duration_days: 0,
  });
  const [outcomesText, setOutcomesText] = useState((course?.outcomes || []).join("\n"));
  const [saving, setSaving] = useState(false);

  const handleLevelChange = (v) => setForm(f => ({ ...f, level: v, badge: LEVEL_BADGE[v] }));

  const save = async () => {
    if (!form.title.trim()) { toast.error("Course title is required"); return; }
    if (!form.level) { toast.error("Please select a level"); return; }
    setSaving(true);
    const outcomes = outcomesText.split("\n").map(s => s.trim()).filter(Boolean);
    const data = { ...form, outcomes };
    let savedCourse;
    if (course?.id) {
      savedCourse = await base44.entities.Course.update(course.id, data);
      toast.success("Course updated successfully.");
    } else {
      savedCourse = await base44.entities.Course.create(data);
      if (data.is_published) {
        toast.success("Course created and published — students can now enrol!", { duration: 5000 });
      } else {
        toast.success("Course saved as draft. Publish it when ready for students.");
      }
    }
    onClose();
    await onSave();
    setSaving(false);
  };

  const levelPill = LEVEL_PILL[form.level];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-harvest/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-harvest" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink leading-tight">
                {course ? "Edit Course" : "Create New Course"}
              </h3>
              <p className="text-xs text-slate_mist">
                {course ? "Update course details" : "Fill in the details below to add a new training course"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate_mist hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. NDIS Support Coordinator Training — Level 1"
              className="h-10 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Level + Price + Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Level *</Label>
              <Select value={form.level} onValueChange={handleLevelChange}>
                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="level1">Level 1 — Foundation</SelectItem>
                  <SelectItem value="level2">Level 2 — Professional</SelectItem>
                  <SelectItem value="level3">Level 3 — Advanced</SelectItem>
                </SelectContent>
              </Select>
              {form.level && (
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelPill}`}>
                  {LEVEL_BADGE[form.level]}
                </span>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Price (AUD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist text-sm font-medium">$</span>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="h-10 text-sm pl-7" min={0} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Course Length</Label>
              <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 4–6 hours" className="h-10 text-sm" />
            </div>
          </div>

          {/* Access Duration */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">
              Access Duration <span className="normal-case font-normal text-slate_mist/60">(days from enrollment — 0 = unlimited)</span>
            </Label>
            <Select
              value={String(form.access_duration_days || 0)}
              onValueChange={v => setForm(f => ({ ...f, access_duration_days: Number(v) }))}>
              <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unlimited Access</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days (6 Months)</SelectItem>
                <SelectItem value="365">365 Days (1 Year)</SelectItem>
                <SelectItem value="custom">Custom…</SelectItem>
              </SelectContent>
            </Select>
            {form.access_duration_days > 0 && String(form.access_duration_days) !== "custom" && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                ⏰ Students will lose access {form.access_duration_days} days after enrolling.
              </p>
            )}
            {/* Custom input */}
            {String(form.access_duration_days) === "custom" && (
              <Input type="number" min={1} className="mt-2 h-9 text-sm"
                placeholder="Enter number of days…"
                onChange={e => setForm(f => ({ ...f, access_duration_days: Number(e.target.value) }))} />
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="What will students learn in this course? Give a compelling overview…" className="text-sm resize-none" />
          </div>

          {/* Learning Outcomes */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist mb-1.5 block">
              Learning Outcomes <span className="text-slate_mist/60 normal-case font-normal">(one per line)</span>
            </Label>
            <Textarea
              value={outcomesText}
              onChange={e => setOutcomesText(e.target.value)}
              rows={4}
              placeholder={"Understand NDIS funding categories\nCreate support plans\nApply NDIS practice standards"}
              className="text-sm resize-none"
            />
            {outcomesText && (
              <p className="text-xs text-slate_mist mt-1">
                {outcomesText.split("\n").filter(s => s.trim()).length} outcome(s) added
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Publish toggle — prominent */}
          <div
            className={`rounded-xl p-4 border-2 transition-colors cursor-pointer ${form.is_published ? "border-green-200 bg-green-50" : "border-border/50 bg-slate-50"}`}
            onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-6 rounded-full transition-colors ${form.is_published ? "bg-green-500" : "bg-slate-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_published ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${form.is_published ? "text-green-700" : "text-ink"}`}>
                  {form.is_published ? "Published — visible to all students" : "Draft — hidden from students"}
                </p>
                <p className="text-xs text-slate_mist mt-0.5">
                  {form.is_published
                    ? "Students can see and enrol in this course immediately after saving."
                    : "Only admins can see this course. Toggle on when ready to launch."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-slate-50/50">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest hover:bg-harvest/90 text-white font-semibold">
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving…" : course ? "Update Course" : form.is_published ? "Create & Publish" : "Save as Draft"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ModuleRow({ module, courseId, topics, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [topicModal, setTopicModal] = useState(null);
  const modTopics = topics.filter(t => t.module_id === module.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const saveTitle = async () => {
    await base44.entities.CourseModule.update(module.id, { title });
    setEditing(false); onRefresh();
  };
  const deleteMod = async () => {
    if (!confirm("Delete this module and all its topics?")) return;
    for (const t of modTopics) await base44.entities.CourseTopic.delete(t.id);
    await base44.entities.CourseModule.delete(module.id);
    onRefresh();
  };

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-slate-50">
        <button onClick={() => setExpanded(!expanded)} className="text-slate_mist hover:text-ink transition-colors">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {editing ? (
          <Input value={title} onChange={e => setTitle(e.target.value)} className="flex-1 h-8 text-sm" onKeyDown={e => e.key === "Enter" && saveTitle()} />
        ) : (
          <span className="flex-1 font-medium text-sm text-ink">{module.title}</span>
        )}
        <span className="text-xs text-slate_mist bg-white px-2 py-0.5 rounded-full border border-border/40">{modTopics.length} topics</span>
        {editing ? (
          <Button size="sm" onClick={saveTitle} className="bg-harvest text-white h-7 text-xs px-3">Save</Button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-slate_mist hover:text-ink p-1"><Edit2 className="w-3.5 h-3.5" /></button>
        )}
        <button onClick={deleteMod} className="text-slate_mist hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      {expanded && (
        <div className="p-3 space-y-1.5 bg-white">
          {modTopics.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/30 hover:bg-slate-50 transition-colors text-sm">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${t.type === "quiz" ? "bg-purple-100" : t.type === "reading" ? "bg-green-100" : t.type === "assessment" ? "bg-amber-100" : "bg-blue-100"}`}>
                {t.type === "quiz" ? <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> : t.type === "reading" ? <BookOpen className="w-3.5 h-3.5 text-green-600" /> : t.type === "assessment" ? <FileText className="w-3.5 h-3.5 text-amber-600" /> : <Video className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <span className="flex-1 text-ink font-medium truncate">{t.title}</span>
              {t.is_free_preview && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Preview</span>}
              {t.video_duration_mins > 0 && <span className="text-xs text-slate_mist">{t.video_duration_mins}m</span>}
              <button onClick={() => setTopicModal(t)} className="text-slate_mist hover:text-ink p-1"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={async () => { if (confirm("Delete topic?")) { await base44.entities.CourseTopic.delete(t.id); onRefresh(); } }}
                className="text-slate_mist hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => setTopicModal("new")}
            className="flex items-center gap-2 text-xs text-harvest hover:text-harvest/80 transition-colors px-3 py-2 rounded-lg hover:bg-harvest/5 font-medium">
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </button>
        </div>
      )}

      {topicModal && (
        <TopicModal topic={topicModal === "new" ? null : topicModal}
          moduleId={module.id} courseId={courseId}
          onClose={() => setTopicModal(null)} onSave={onRefresh} />
      )}
    </div>
  );
}

const COURSE_TABS = [
  { id: "content",      label: "Course Content",    icon: BookOpen },
  { id: "modules",      label: "Modules",           icon: ClipboardList },
  { id: "assessments",  label: "Assessments",       icon: FileText },
  { id: "certificates", label: "Certificates",      icon: Award },
  { id: "students",     label: "Enrolled Students", icon: Users },
  { id: "analytics",    label: "Analytics",         icon: BarChart2 },
];

function CourseRow({ course, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [enrollmentCount, setEnrollmentCount] = useState(null);

  const loadMods = async () => {
    setLoading(true);
    const [mods, tops, enrs] = await Promise.all([
      base44.entities.CourseModule.filter({ course_id: course.id }, "sort_order"),
      base44.entities.CourseTopic.filter({ course_id: course.id }, "sort_order"),
      base44.entities.CourseEnrollment.filter({ course_id: course.id }),
    ]);
    setModules(mods); setTopics(tops);
    setEnrollmentCount(enrs.length);
    setLoading(false);
  };

  const toggleExpand = () => { if (!expanded) loadMods(); setExpanded(!expanded); };

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    await base44.entities.CourseModule.create({ course_id: course.id, title: newModuleTitle.trim(), sort_order: modules.length });
    setNewModuleTitle(""); setAddingModule(false); loadMods();
  };

  const deleteCourse = async () => {
    if (!confirm("Delete this course and all its content?")) return;
    const [mods, tops] = await Promise.all([
      base44.entities.CourseModule.filter({ course_id: course.id }),
      base44.entities.CourseTopic.filter({ course_id: course.id }),
    ]);
    for (const t of tops) await base44.entities.CourseTopic.delete(t.id);
    for (const m of mods) await base44.entities.CourseModule.delete(m.id);
    await base44.entities.Course.delete(course.id);
    onRefresh();
  };

  const togglePublish = async () => {
    await base44.entities.Course.update(course.id, { is_published: !course.is_published });
    toast.success(course.is_published ? "Course unpublished" : "Course published");
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      {/* Course header row */}
      <div className="flex items-center gap-4 p-4">
        <button onClick={toggleExpand} className="text-slate_mist flex-shrink-0">
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        <div className={`w-1 h-10 rounded-full flex-shrink-0 ${course.level === "level1" ? "bg-blue-400" : course.level === "level2" ? "bg-amber-400" : "bg-purple-400"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-ink truncate">{course.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
              {course.level?.replace("level", "L")}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {course.is_published ? "● Published" : "○ Draft"}
            </span>
            {enrollmentCount !== null && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />{enrollmentCount} enrolled
              </span>
            )}
          </div>
          <p className="text-xs text-slate_mist mt-0.5">${course.price} · {course.duration}{course.access_duration_days > 0 ? ` · ${course.access_duration_days}-day access` : ""}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={togglePublish} className="gap-1 text-xs h-8">
            {course.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {course.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditModal(true)} className="gap-1 text-xs h-8">
            <Edit2 className="w-3 h-3" /> Edit
          </Button>
          <Button size="sm" variant="outline" onClick={deleteCourse} className="text-xs text-destructive border-destructive/30 h-8">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Expanded: tabs + content */}
      {expanded && (
        <div className="border-t border-border/30">
          {/* Tab bar */}
          <div className="flex items-center gap-0 px-4 bg-slate-50 border-b border-border/30 overflow-x-auto">
            {COURSE_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-harvest text-harvest"
                    : "border-transparent text-slate_mist hover:text-ink"
                }`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 bg-slate-50/30">
            {loading ? (
              <div className="text-center py-8 text-slate_mist text-sm">Loading course data…</div>
            ) : (
              <>
                {/* Course Content tab */}
                {activeTab === "content" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded-xl border border-border/50 p-3 text-center">
                        <p className="font-display font-bold text-xl text-ink">{modules.length}</p>
                        <p className="text-[10px] text-slate_mist">Modules</p>
                      </div>
                      <div className="bg-white rounded-xl border border-border/50 p-3 text-center">
                        <p className="font-display font-bold text-xl text-ink">{topics.length}</p>
                        <p className="text-[10px] text-slate_mist">Total Topics</p>
                      </div>
                      <div className="bg-white rounded-xl border border-border/50 p-3 text-center">
                        <p className="font-display font-bold text-xl text-ink">{topics.filter(t => t.type === "quiz").length}</p>
                        <p className="text-[10px] text-slate_mist">Quizzes</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {modules.map(mod => (
                        <ModuleRow key={mod.id} module={mod} courseId={course.id} topics={topics} onRefresh={loadMods} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Modules tab */}
                {activeTab === "modules" && (
                  <div className="space-y-2">
                    {modules.map(mod => (
                      <ModuleRow key={mod.id} module={mod} courseId={course.id} topics={topics} onRefresh={loadMods} />
                    ))}
                    {addingModule ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input autoFocus value={newModuleTitle}
                          onChange={e => setNewModuleTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addModule(); if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); } }}
                          placeholder="Module title…" className="h-8 text-sm flex-1 bg-white" />
                        <Button size="sm" onClick={addModule} className="bg-harvest text-white h-8 text-xs px-3">Add</Button>
                        <Button size="sm" variant="outline" onClick={() => { setAddingModule(false); setNewModuleTitle(""); }} className="h-8 text-xs px-3">Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setAddingModule(true)} variant="outline"
                        className="gap-1.5 text-xs text-harvest border-harvest/30 hover:bg-harvest/5">
                        <Plus className="w-3.5 h-3.5" /> Add Module
                      </Button>
                    )}
                  </div>
                )}

                {/* Assessments tab */}
                {activeTab === "assessments" && (
                  <CourseAssessmentsTab course={course} />
                )}

                {/* Certificates tab */}
                {activeTab === "certificates" && (
                  <CourseEnrollmentCertificatesTab courseId={course.id} />
                )}

                {/* Enrolled Students tab */}
                {activeTab === "students" && (
                  <CourseEnrollmentManager course={course} topics={topics} modules={modules} />
                )}

                {/* Analytics tab */}
                {activeTab === "analytics" && (
                  <CourseAnalyticsTab course={course} topics={topics} modules={modules} />
                )}
              </>
            )}
          </div>
        </div>
      )}
      {editModal && <CourseModal course={course} onClose={() => setEditModal(false)} onSave={onRefresh} />}
    </div>
  );
}

// ── Course-scoped Assessments Tab ─────────────────────────────────────────────
function CourseAssessmentsTab({ course }) {
  return (
    <AdminAssessmentManager courses={[course]} />
  );
}

// ── Course-scoped Certificates Tab ────────────────────────────────────────────
function CourseEnrollmentCertificatesTab({ courseId }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CourseEnrollment.filter({ course_id: courseId }).then(e => {
      setEnrollments(e); setLoading(false);
    });
  }, [courseId]);

  if (loading) return <div className="py-8 text-center text-slate_mist text-sm">Loading certificates…</div>;

  return <AdminCertificates enrollments={enrollments} courses={[]} />;
}

function CourseAnalyticsTab({ course, topics, modules }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CourseEnrollment.filter({ course_id: course.id }).then(e => { setEnrollments(e); setLoading(false); });
  }, [course.id]);

  if (loading) return <div className="py-8 text-center text-slate_mist text-sm">Loading analytics…</div>;

  const total = enrollments.length;
  const completed = enrollments.filter(e => e.status === "completed").length;
  const avgProgress = total > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / total) : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const topicCompletion = topics.map(t => ({
    title: t.title,
    type: t.type || "video",
    count: enrollments.filter(e => (e.completed_topic_ids || []).includes(t.id)).length,
    pct: total > 0 ? Math.round((enrollments.filter(e => (e.completed_topic_ids || []).includes(t.id)).length / total) * 100) : 0,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Enrolled", value: total },
          { label: "Completed", value: completed },
          { label: "Avg. Progress", value: `${avgProgress}%` },
          { label: "Completion Rate", value: `${completionRate}%` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 text-center">
            <p className="font-display font-bold text-2xl text-ink">{s.value}</p>
            <p className="text-xs text-slate_mist mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-border/30 bg-slate-50">
          <p className="text-sm font-semibold text-ink">Topic Completion Rates</p>
        </div>
        <div className="divide-y divide-border/20">
          {topicCompletion.map(tc => (
            <div key={tc.title} className="px-5 py-3 flex items-center gap-3">
              <span className="text-sm flex-shrink-0">{tc.type === "quiz" ? "❓" : tc.type === "reading" ? "📖" : tc.type === "assessment" ? "📝" : "📹"}</span>
              <p className="text-sm text-ink flex-1 truncate">{tc.title}</p>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                <div className={`h-1.5 rounded-full ${tc.pct >= 70 ? "bg-emerald-500" : tc.pct >= 40 ? "bg-harvest" : "bg-red-400"}`}
                  style={{ width: `${tc.pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-ink w-10 text-right flex-shrink-0">{tc.pct}%</span>
              <span className="text-[10px] text-slate_mist flex-shrink-0">{tc.count}/{total}</span>
            </div>
          ))}
          {topicCompletion.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate_mist text-center">No topic data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCourseManager({ courses, onRefresh, filterType }) {
  const [courseModal, setCourseModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  let title = "All Courses";
  let description = "Manage your NDIS training courses, modules, and content.";
  if (filterType === "videos") { title = "Video Library"; description = "All video topics across your courses."; }
  if (filterType === "quizzes") { title = "Quiz Management"; description = "All quiz topics across your courses."; }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
          <p className="text-sm text-slate_mist">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="w-48 h-9 text-sm" />
          <Button onClick={() => setCourseModal(true)} className="bg-harvest text-white gap-1.5 text-sm h-9">
            <Plus className="w-4 h-4" /> New Course
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
          <p className="font-display font-semibold text-ink mb-1">No courses found</p>
          <p className="text-sm text-slate_mist mb-4">Create your first NDIS training course.</p>
          <Button onClick={() => setCourseModal(true)} className="bg-harvest text-white gap-2">
            <Plus className="w-4 h-4" /> Create Course
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <CourseRow key={c.id} course={c} onRefresh={onRefresh} />)}
        </div>
      )}
      {courseModal && <CourseModal onClose={() => setCourseModal(false)} onSave={onRefresh} />}
    </div>
  );
}