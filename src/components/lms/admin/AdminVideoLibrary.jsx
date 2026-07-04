import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { uploadFile } from "@/api/uploadClient";
import { Video, Search, Trash2, Play, Upload, ExternalLink, X, Save, Link, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700",
};

function getVideoThumb(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
  return null;
}

function UploadModal({ courses, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", course_id: "", module_id: "", video_duration_mins: 5 });
  const [modules, setModules] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [videoTab, setVideoTab] = useState("file"); // "file" | "url"
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadModules = async (courseId) => {
    if (!courseId) return;
    const mods = await base44.entities.CourseModule.filter({ course_id: courseId }, "sort_order");
    setModules(mods);
  };

  const handleCourseChange = (v) => {
    setForm(f => ({ ...f, course_id: v, module_id: "" }));
    loadModules(v);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.info("Uploading video, please wait…");
    try {
      const { file_url } = await uploadFile({ file, kind: "video" });
      setVideoUrl(file_url);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed: " + (err.response?.data?.message || err.message));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (!form.course_id) { toast.error("Please select a course"); return; }
    if (!form.module_id) { toast.error("Please select a module"); return; }
    if (!videoUrl) { toast.error("Please upload a video or paste a URL"); return; }
    setSaving(true);
    try {
      const selectedCourse = courses.find(c => c.id === form.course_id);
      await base44.entities.CourseTopic.create({
        ...form,
        type: "video",
        video_url: videoUrl,
        course_level: selectedCourse?.level || "",
        sort_order: 0,
        is_free_preview: false,
      });
      toast.success("Video topic created!");
      onClose();
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-xl text-ink">Upload Video</h3>
          <button onClick={onClose} className="text-slate_mist hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Video Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to NDIS" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Course *</Label>
              <Select value={form.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Module *</Label>
              <Select value={form.module_id} onValueChange={v => setForm(f => ({ ...f, module_id: v }))} disabled={!modules.length}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Duration (mins)</Label>
            <Input type="number" value={form.video_duration_mins} onChange={e => setForm(f => ({ ...f, video_duration_mins: Number(e.target.value) }))} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Video *</Label>
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-border overflow-hidden mb-3">
              <button type="button" onClick={() => setVideoTab("file")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold transition-colors ${videoTab === "file" ? "bg-harvest text-white" : "bg-white text-slate_mist hover:bg-slate-50"}`}>
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <button type="button" onClick={() => setVideoTab("url")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold transition-colors ${videoTab === "url" ? "bg-harvest text-white" : "bg-white text-slate_mist hover:bg-slate-50"}`}>
                <Youtube className="w-3.5 h-3.5" /> YouTube / URL
              </button>
            </div>
            {videoTab === "file" ? (
              <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors ${uploading ? "opacity-60 pointer-events-none border-slate-200" : "border-harvest/40 hover:border-harvest hover:bg-harvest/5"}`}>
                <Upload className="w-5 h-5 text-harvest" />
                <span className="text-sm font-medium text-harvest">{uploading ? "Uploading…" : "Click to upload video file"}</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    className="text-sm h-10"
                  />
                  <Button type="button" onClick={() => { if (urlInput.trim()) { setVideoUrl(urlInput.trim()); } }}
                    className="bg-harvest text-white h-10 px-4 text-xs flex-shrink-0">
                    <Save className="w-3.5 h-3.5 mr-1" /> Save URL
                  </Button>
                </div>
                <p className="text-xs text-slate_mist">Supports YouTube, Vimeo, or any direct video URL.</p>
              </div>
            )}
            {videoUrl && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Link className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium truncate flex-1">✓ {videoUrl}</p>
                <button type="button" onClick={() => { setVideoUrl(""); setUrlInput(""); }} className="text-green-600 hover:text-green-800 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving || uploading} className="flex-1 bg-harvest text-white">
            <Save className="w-4 h-4 mr-1.5" />{saving ? "Saving…" : "Save Video"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminVideoLibrary({ courses }) {
  const [topics, setTopics]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.CourseTopic.filter({ type: "video" }, "sort_order");
    setTopics(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getCourse = (id) => courses.find(c => c.id === id);

  const filtered = topics.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "all" || t.course_id === courseFilter;
    return matchSearch && matchCourse;
  });

  const deleteVideo = async (topic) => {
    await base44.entities.CourseTopic.delete(topic.id);
    toast.success("Video deleted.");
    load();
  };

  const totalDuration = topics.reduce((s, t) => s + (t.video_duration_mins || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const mins  = totalDuration % 60;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Video Library</h2>
          <p className="text-sm text-slate_mist">All training videos across your courses. Platform total: <strong>237 videos</strong>.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="bg-harvest text-white gap-1.5 text-sm h-9">
          <Upload className="w-4 h-4" /> Upload Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Platform Videos",  value: 237,                          color: "text-blue-600 bg-blue-50" },
          { label: "In Database",       value: topics.length,                color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Duration",    value: `${hours}h ${mins}m`,         color: "text-green-600 bg-green-50" },
          { label: "Avg Duration",      value: topics.length > 0 ? `${Math.round(totalDuration / topics.length)}m` : "—", color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate_mist">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">Loading videos…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <Video className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
          <p className="font-display font-semibold text-ink mb-1">No videos found</p>
          <p className="text-sm text-slate_mist">Add video topics to your courses via Course Management.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Thumbnail", "Title", "Course", "Level", "Duration", "URL", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(topic => {
                  const course = getCourse(topic.course_id);
                  const thumb  = getVideoThumb(topic.video_url);
                  return (
                    <tr key={topic.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <Play className="w-4 h-4 text-slate_mist" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink max-w-[200px]">
                        <p className="truncate">{topic.title}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate_mist max-w-[160px]">
                        <p className="truncate">{course?.title || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course?.level] || "bg-gray-100 text-gray-600"}`}>
                          {course?.level?.replace("level", "L") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate_mist whitespace-nowrap">
                        {topic.video_duration_mins > 0 ? `${topic.video_duration_mins} min` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {topic.video_url ? (
                          <a href={topic.video_url} target="_blank" rel="noopener noreferrer"
                            className="text-harvest hover:underline text-xs flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        ) : <span className="text-slate_mist/40 text-xs">No URL</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => deleteVideo(topic)}
                            className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
            Showing {filtered.length} of {topics.length} videos
          </div>
        </div>
      )}

      {showUpload && (
        <UploadModal courses={courses} onClose={() => setShowUpload(false)} onSave={load} />
      )}
    </div>
  );
}