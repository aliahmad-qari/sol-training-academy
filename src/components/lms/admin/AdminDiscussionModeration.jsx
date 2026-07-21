import React, { useState, useEffect, useMemo } from "react";
import apiClient from "@/api/apiClient";
import {
  MessageSquare, Trash2, Search, RefreshCw, Loader2,
  Users, MessageCircle, ChevronDown, ChevronUp,
  Circle, Clock, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────
const NOW = () => Date.now();
const MS_1H  = 60 * 60 * 1000;
const MS_24H = 24 * MS_1H;
const MS_7D  = 7  * MS_24H;

function presenceTier(updatedAt) {
  if (!updatedAt) return "away";
  const diff = NOW() - new Date(updatedAt).getTime();
  if (diff < MS_1H)  return "online";
  if (diff < MS_24H) return "today";
  if (diff < MS_7D)  return "week";
  return "away";
}

const TIER = {
  online: { dot: "bg-emerald-400", label: "Active < 1h",   badge: "bg-emerald-100 text-emerald-700" },
  today:  { dot: "bg-amber-400",   label: "Active today",  badge: "bg-amber-100 text-amber-700" },
  week:   { dot: "bg-slate-400",   label: "This week",     badge: "bg-slate-100 text-slate-600" },
  away:   { dot: "bg-slate-200",   label: "Inactive",      badge: "bg-slate-100 text-slate-400" },
};

function relTime(date) {
  if (!date) return "—";
  const diff = NOW() - new Date(date).getTime();
  if (diff < 60_000)  return "just now";
  if (diff < MS_1H)   return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < MS_24H)  return `${Math.floor(diff / MS_1H)}h ago`;
  if (diff < MS_7D)   return `${Math.floor(diff / MS_24H)}d ago`;
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// ── Members panel ─────────────────────────────────────────────────────────────
function EnrolledMembersPanel({ courses, posts, dmActivity }) {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [search, setSearch]     = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    apiClient.get("/enrollments?limit=500")
      .then(r => setEnrollments(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  // Build per-user post count map
  const postCountByUser = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      const uid = String(p.user_id);
      map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [posts]);

  // Build per-user DM count map  { userId: { sent, received } }
  const dmByUser = useMemo(() => {
    const map = {};
    (dmActivity || []).forEach(dm => {
      const s = String(dm.sender_id);
      const r = String(dm.receiver_id);
      if (!map[s]) map[s] = { sent: 0, received: 0 };
      if (!map[r]) map[r] = { sent: 0, received: 0 };
      map[s].sent     += 1;
      map[r].received += 1;
    });
    return map;
  }, [dmActivity]);

  const filtered = useMemo(() => {
    return enrollments.filter(e => {
      const matchCourse = selectedCourse === "all" || String(e.course_id) === selectedCourse;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.user_name?.toLowerCase().includes(q) ||
        e.user_email?.toLowerCase().includes(q) ||
        e.course_title?.toLowerCase().includes(q);
      return matchCourse && matchSearch;
    });
  }, [enrollments, selectedCourse, search]);

  // Stats
  const onlineCount = filtered.filter(e => presenceTier(e.updatedAt || e.updated_date) === "online").length;
  const todayCount  = filtered.filter(e => presenceTier(e.updatedAt || e.updated_date) === "today").length;
  const withPosts   = filtered.filter(e => postCountByUser[String(e.user_id)] > 0).length;
  const withDMs     = filtered.filter(e => dmByUser[String(e.user_id)]).length;

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Enrolled",   value: filtered.length,  color: "text-blue-600 bg-blue-50",     icon: Users },
          { label: "Active Now / Today", value: `${onlineCount + todayCount}`, color: "text-emerald-600 bg-emerald-50", icon: Circle },
          { label: "Posted on Board",  value: withPosts,        color: "text-purple-600 bg-purple-50", icon: MessageSquare },
          { label: "Used DM Chat",     value: withDMs,          color: "text-harvest bg-harvest/10",   icon: MessageCircle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-ink leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">No enrolled members found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-border/30">
            {["Student", "Course", "Progress", "Last Active", "Discussion Posts", "DM Activity", "Status"].map(h => (
              <div key={h} className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider
                ${h === "Student" ? "col-span-2" : h === "Course" ? "col-span-2" : "col-span-1"}`}>{h}</div>
            ))}
          </div>

          <div className="divide-y divide-border/20">
            {filtered.map(enr => {
              const uid      = String(enr.user_id);
              const tier     = presenceTier(enr.updatedAt || enr.updated_date);
              const cfg      = TIER[tier];
              const postCnt  = postCountByUser[uid] || 0;
              const dm       = dmByUser[uid];
              const initials = (enr.user_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

              return (
                <div key={enr._id || enr.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-4 py-3 hover:bg-slate-50 transition-colors items-center">
                  {/* Student */}
                  <div className="sm:col-span-2 flex items-center gap-2 min-w-0">
                    <div className="relative w-7 h-7 rounded-full bg-harvest/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-harvest">
                      {initials}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${cfg.dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{enr.user_name || "Student"}</p>
                      <p className="text-[10px] text-slate_mist truncate">{enr.user_email || ""}</p>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="sm:col-span-2 min-w-0">
                    <p className="text-xs text-ink truncate">{enr.course_title || "—"}</p>
                  </div>

                  {/* Progress */}
                  <div className="sm:col-span-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                        <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${enr.progress_percent || 0}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-ink">{enr.progress_percent || 0}%</span>
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="sm:col-span-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                      {relTime(enr.updatedAt || enr.updated_date)}
                    </span>
                  </div>

                  {/* Discussion Posts */}
                  <div className="sm:col-span-1">
                    {postCnt > 0 ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full w-fit">
                        <MessageSquare className="w-2.5 h-2.5" /> {postCnt}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No posts</span>
                    )}
                  </div>

                  {/* DM Activity */}
                  <div className="sm:col-span-1">
                    {dm ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full w-fit">
                        <MessageCircle className="w-2.5 h-2.5" /> {dm.sent}↑ {dm.received}↓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No DMs</span>
                    )}
                  </div>

                  {/* Enrollment status */}
                  <div className="sm:col-span-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      enr.status === "completed" ? "bg-purple-100 text-purple-700" :
                      enr.status === "active"    ? "bg-emerald-100 text-emerald-700" :
                      enr.status === "paused"    ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{enr.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDiscussionModeration({ courses }) {
  const [activeTab,   setActiveTab]   = useState("posts");   // "posts" | "members"
  const [posts,       setPosts]       = useState([]);
  const [dmActivity,  setDmActivity]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [deletingId,  setDeletingId]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [postsRes, dmRes] = await Promise.all([
        apiClient.get("/discussion?limit=500"),
        // Fetch DM metadata for all students (admin-scoped — returns all messages).
        apiClient.get("/direct-messages/admin?limit=1000").catch(() => ({ data: { data: [] } })),
      ]);
      setPosts(Array.isArray(postsRes.data?.data) ? postsRes.data.data : []);
      setDmActivity(Array.isArray(dmRes.data?.data) ? dmRes.data.data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deletePost = async (post) => {
    if (!confirm(`Delete this post by "${post.user_name}"? This cannot be undone.`)) return;
    setDeletingId(post._id || post.id);
    try {
      await apiClient.delete(`/discussion/${post._id || post.id}`);
      setPosts(prev => prev.filter(p =>
        (p._id || p.id) !== (post._id || post.id) &&
        String(p.parent_id) !== String(post._id || post.id)
      ));
      toast.success("Post deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchCourse = courseFilter === "all" || String(p.course_id) === courseFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.content?.toLowerCase().includes(q) ||
      p.user_name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q);
    return matchCourse && matchSearch;
  });

  const topLevel = filteredPosts.filter(p => !p.parent_id);
  const replies  = filteredPosts.filter(p => !!p.parent_id);

  // Count DMs per course for stat card
  const dmCourseCount = new Set((dmActivity || []).map(d => String(d.course_id))).size;

  const stats = [
    { label: "Total Posts",     value: posts.length,                                   color: "text-blue-600 bg-blue-50" },
    { label: "Top-Level",       value: posts.filter(p => !p.parent_id).length,         color: "text-purple-600 bg-purple-50" },
    { label: "Replies",         value: posts.filter(p => !!p.parent_id).length,        color: "text-emerald-600 bg-emerald-50" },
    { label: "DM Messages",     value: dmActivity.length,                              color: "text-harvest bg-harvest/10" },
  ];

  const getCourse = (courseId) => courses.find(c => (c._id || c.id) === String(courseId));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-ink">Discussion Moderation</h2>
          <p className="text-xs text-slate-500">Review posts, moderate content, and monitor member engagement</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-ink">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "posts",   label: "Discussion Posts",    icon: MessageSquare },
          { id: "members", label: "Enrolled Members",    icon: Users },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-ink shadow-sm"
                : "text-slate_mist hover:text-ink"
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Posts tab ─────────────────────────────────────────────────────── */}
      {activeTab === "posts" && (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search posts…" className="pl-9 h-9 text-sm" />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-harvest" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 text-sm">No discussion posts found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {filteredPosts.length} Posts ({topLevel.length} top-level · {replies.length} replies)
                </p>
              </div>
              <div className="divide-y divide-border/20">
                {filteredPosts.map(post => {
                  const course  = getCourse(post.course_id);
                  const isReply = !!post.parent_id;
                  const postId  = post._id || post.id;
                  return (
                    <div key={postId} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isReply ? "pl-10 bg-slate-50/50" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                          isReply ? "bg-slate-100 text-slate-500" : "bg-harvest/10 text-harvest"
                        }`}>
                          {(post.user_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-ink">{post.user_name || "Unknown"}</span>
                            {isReply && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">Reply</span>}
                            {course && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{course.title}</span>}
                            <span className="text-[10px] text-slate-400">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </span>
                            {(post.likes || 0) > 0 && <span className="text-[10px] text-slate-500">❤️ {post.likes}</span>}
                          </div>
                          {post.title && <p className="text-sm font-semibold text-ink mb-0.5">{post.title}</p>}
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{post.content}</p>
                        </div>
                        <button onClick={() => deletePost(post)} disabled={deletingId === postId}
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete post">
                          {deletingId === postId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Members tab ───────────────────────────────────────────────────── */}
      {activeTab === "members" && (
        <EnrolledMembersPanel
          courses={courses}
          posts={posts}
          dmActivity={dmActivity}
        />
      )}
    </div>
  );
}
