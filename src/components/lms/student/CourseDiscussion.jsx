import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  MessageSquare, ThumbsUp, Reply, Plus, Search,
  ChevronDown, ChevronUp, Users, Circle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Presence helpers ─────────────────────────────────────────────────────────
const NOW = () => Date.now();
const MS_1H  = 60 * 60 * 1000;
const MS_24H = 24 * MS_1H;
const MS_7D  = 7  * MS_24H;

/**
 * Returns a presence tier based on how recently the enrollment was updated.
 *   "online"  — active within the last hour   → green dot
 *   "today"   — active within 24 hours         → amber dot
 *   "week"    — active within 7 days           → slate dot
 *   "away"    — older than 7 days              → no dot / grey
 */
function presenceTier(updatedDate) {
  if (!updatedDate) return "away";
  const diff = NOW() - new Date(updatedDate).getTime();
  if (diff < MS_1H)  return "online";
  if (diff < MS_24H) return "today";
  if (diff < MS_7D)  return "week";
  return "away";
}

const TIER_CONFIG = {
  online: { dot: "bg-emerald-400", ring: "ring-emerald-400/30", label: "Active now",     order: 0 },
  today:  { dot: "bg-amber-400",   ring: "ring-amber-400/30",   label: "Active today",   order: 1 },
  week:   { dot: "bg-slate-400",   ring: "ring-slate-400/20",   label: "Active this week", order: 2 },
  away:   { dot: "bg-slate-200",   ring: "",                    label: "Not recently active", order: 3 },
};

function relativeTime(date) {
  if (!date) return "";
  const diff = NOW() - new Date(date).getTime();
  if (diff < 60_000)          return "just now";
  if (diff < MS_1H)           return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < MS_24H)          return `${Math.floor(diff / MS_1H)}h ago`;
  if (diff < MS_7D)           return `${Math.floor(diff / MS_24H)}d ago`;
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// ── Active Learners sidebar panel ────────────────────────────────────────────
function ActiveLearners({ courseEnrollments, currentUserId, selectedCourse }) {
  const [open, setOpen] = useState(true);

  // Filter to selected course or all
  const relevant = useMemo(() => {
    const base = courseEnrollments.filter(e =>
      selectedCourse === "all" || e.course_id === selectedCourse
    );
    // Deduplicate by user_id (student may have multiple enrollments if multi-course)
    const seen = new Set();
    return base.filter(e => {
      if (seen.has(String(e.user_id))) return false;
      seen.add(String(e.user_id));
      return true;
    });
  }, [courseEnrollments, selectedCourse]);

  // Sort: online → today → week → away, then alphabetically within tier
  const sorted = useMemo(() => [...relevant].sort((a, b) => {
    const ta = TIER_CONFIG[presenceTier(a.updated_date || a.updatedAt)].order;
    const tb = TIER_CONFIG[presenceTier(b.updated_date || b.updatedAt)].order;
    if (ta !== tb) return ta - tb;
    return (a.user_name || "").localeCompare(b.user_name || "");
  }), [relevant]);

  const onlineCount  = sorted.filter(e => presenceTier(e.updated_date || e.updatedAt) === "online").length;
  const todayCount   = sorted.filter(e => presenceTier(e.updated_date || e.updatedAt) === "today").length;
  const activeCount  = onlineCount + todayCount;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate_mist" />
          <span className="text-sm font-semibold text-ink">Course Members</span>
          {activeCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate_mist">{sorted.length} enrolled</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-slate_mist" /> : <ChevronDown className="w-3.5 h-3.5 text-slate_mist" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {sorted.length === 0 ? (
              <div className="px-4 pb-4 pt-1 text-center">
                <p className="text-xs text-slate_mist">No other students enrolled yet.</p>
              </div>
            ) : (
              <div className="px-3 pb-3 max-h-72 overflow-y-auto space-y-0.5">
                {sorted.map(enr => {
                  const uid = String(enr.user_id);
                  const isYou = uid === String(currentUserId);
                  const tier = presenceTier(enr.updated_date || enr.updatedAt);
                  const cfg = TIER_CONFIG[tier];
                  const lastSeen = relativeTime(enr.updated_date || enr.updatedAt);
                  const initials = (enr.user_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

                  return (
                    <div key={uid}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      {/* Avatar + presence ring */}
                      <div className={`relative w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold
                        ${isYou ? "bg-harvest/20 text-harvest" : "bg-slate-100 text-slate_mist"}
                        ${tier !== "away" ? `ring-2 ${cfg.ring}` : ""}`}
                      >
                        {initials}
                        {/* Presence dot */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
                      </div>

                      {/* Name + last active */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate leading-tight">
                          {enr.user_name || "Student"}
                          {isYou && <span className="text-harvest ml-1">(you)</span>}
                        </p>
                        <p className="text-[10px] text-slate_mist leading-tight flex items-center gap-1">
                          {tier === "online" ? (
                            <><Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" /> Online</>
                          ) : lastSeen ? (
                            <><Clock className="w-1.5 h-1.5" /> {lastSeen}</>
                          ) : cfg.label}
                        </p>
                      </div>

                      {/* Progress badge */}
                      {enr.progress_percent > 0 && (
                        <span className="text-[10px] font-semibold text-slate_mist opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {enr.progress_percent}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="px-4 py-2 border-t border-border/30 bg-slate-50 flex flex-wrap gap-x-3 gap-y-1">
              {[
                { dot: "bg-emerald-400", label: "Active now (< 1h)" },
                { dot: "bg-amber-400",   label: "Today" },
                { dot: "bg-slate-400",   label: "This week" },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1 text-[10px] text-slate_mist">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, replies, user, onReply, onLike }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const liked = (post.liked_by || []).includes(user?.id);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    await onReply(post, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-harvest/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-harvest">
            {(post.user_name || "S").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-ink">{post.user_name || "Student"}</span>
              <span className="text-[10px] text-slate_mist">
                {new Date(post.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </span>
              {post.course_title && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-harvest/10 text-harvest ml-auto flex-shrink-0">
                  {post.course_title}
                </span>
              )}
            </div>
            {post.title && <p className="font-display font-semibold text-ink mb-1">{post.title}</p>}
            <p className="text-sm text-slate-700 leading-relaxed break-words">{post.content}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
          <button onClick={() => onLike(post)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-harvest font-semibold" : "text-slate_mist hover:text-harvest"}`}>
            <ThumbsUp className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} /> {post.likes || 0}
          </button>
          <button onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 text-xs text-slate_mist hover:text-ink transition-colors">
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
          {replies.length > 0 && (
            <button onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs text-harvest hover:underline ml-auto">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
              {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="px-4 pb-4 border-t border-border/30 bg-slate-50 pt-3">
          <Textarea value={replyText} onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply…" rows={2} className="resize-none text-sm mb-2" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
            <Button size="sm" onClick={submitReply} disabled={saving || !replyText.trim()}
              className="bg-harvest text-white">Post Reply</Button>
          </div>
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className="border-t border-border/30 bg-slate-50 divide-y divide-border/20">
          {replies.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate_mist">
                {(r.user_name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-ink">{r.user_name}</span>
                  <span className="text-[10px] text-slate_mist">
                    {new Date(r.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 break-words">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CourseDiscussion({ user, enrollments }) {
  const [posts,          setPosts]          = useState([]);
  const [courseEnrols,   setCourseEnrols]   = useState([]); // all enrollments for active-learner sidebar
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showNewForm,    setShowNewForm]     = useState(false);
  const [newPost,        setNewPost]         = useState({ title: "", content: "", course_id: "" });
  const [saving,         setSaving]         = useState(false);

  // ── Load posts + co-learners ─────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [allPosts, allEnrols] = await Promise.all([
        base44.entities.DiscussionPost.list("-created_date"),
        // Fetch all enrollments for courses this student is in so we can show co-learners.
        // We rely on the backend scoping to enrolled courses automatically.
        base44.entities.CourseEnrollment.list().catch(() => []),
      ]);
      setPosts(Array.isArray(allPosts) ? allPosts : []);

      // Only keep enrollments for courses the current user is enrolled in
      const myCourseIds = new Set((enrollments || []).map(e => String(e.course_id)));
      setCourseEnrols(
        Array.isArray(allEnrols)
          ? allEnrols.filter(e => myCourseIds.has(String(e.course_id)))
          : []
      );
    } catch (err) {
      console.error("Failed to load discussions:", err);
      setPosts([]);
      toast.error("Couldn't load the discussion board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  // ── New post ─────────────────────────────────────────────────────────────
  const submitPost = async () => {
    if (!newPost.content.trim() || !newPost.course_id) {
      toast.error("Please select a course and write something.");
      return;
    }
    setSaving(true);
    try {
      const enrollment = enrollments.find(e => e.course_id === newPost.course_id);
      await base44.entities.DiscussionPost.create({
        course_id:    newPost.course_id,
        course_title: enrollment?.course_title || "",
        title:        newPost.title,
        content:      newPost.content.trim(),
      });
      setNewPost({ title: "", content: "", course_id: "" });
      setShowNewForm(false);
      toast.success("Post published!");
      load();
    } catch (err) {
      console.error("Failed to publish post:", err);
      toast.error(err?.response?.data?.message || "Couldn't publish your post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Reply ────────────────────────────────────────────────────────────────
  const handleReply = async (parentPost, text) => {
    try {
      await base44.entities.DiscussionPost.create({
        course_id:    parentPost.course_id,
        course_title: parentPost.course_title,
        parent_id:    parentPost.id,
        content:      text,
      });
      load();
    } catch (err) {
      console.error("Failed to post reply:", err);
      toast.error("Couldn't post your reply. Please try again.");
    }
  };

  // ── Like ─────────────────────────────────────────────────────────────────
  const handleLike = async (post) => {
    const liked = (post.liked_by || []).some(id => String(id) === String(user.id));
    const optimistic = liked
      ? { ...post, liked_by: post.liked_by.filter(id => String(id) !== String(user.id)), likes: Math.max(0, (post.likes || 0) - 1) }
      : { ...post, liked_by: [...(post.liked_by || []), user.id], likes: (post.likes || 0) + 1 };
    setPosts(prev => prev.map(p => p.id === post.id ? optimistic : p));
    try {
      const updated = await base44.entities.DiscussionPost.like(post.id);
      if (updated) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...updated } : p));
    } catch (err) {
      console.error("Failed to like post:", err);
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
      toast.error("Couldn't register your like. Please try again.");
    }
  };

  // ── Filtered posts ───────────────────────────────────────────────────────
  const topLevelPosts = posts.filter(p => !p.parent_id);
  const filtered = topLevelPosts.filter(p => {
    const matchCourse = selectedCourse === "all" || p.course_id === selectedCourse;
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchSearch;
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-ink">Course Discussion Board</h2>
        </div>
        <p className="text-sm text-slate_mist">Ask questions, share insights, and help fellow students.</p>
      </div>

      {/* Two-column layout on large screens: posts (left) + active learners (right) */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left: posts area ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search discussions…" className="pl-9 h-9 text-sm" />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {enrollments.map(e => (
                    <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowNewForm(true)} size="sm"
              className="w-full sm:w-auto bg-harvest text-white gap-1.5 h-9">
              <Plus className="w-3.5 h-3.5" /> New Post
            </Button>
          </div>

          {/* New post form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-border/50 p-4 sm:p-5 shadow-sm space-y-3">
                <h3 className="font-display font-semibold text-ink">Create a New Discussion Post</h3>
                <Select value={newPost.course_id} onValueChange={v => setNewPost(p => ({ ...p, course_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a course *" /></SelectTrigger>
                  <SelectContent>
                    {enrollments.map(e => (
                      <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="Title (optional)" />
                <Textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="What's your question or topic? *" rows={4} className="resize-none" />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={submitPost} disabled={saving} className="bg-harvest text-white">
                    Publish Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Post list */}
          {loading ? (
            <div className="text-center py-10 text-slate_mist text-sm">Loading discussions…</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-6 sm:p-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate_mist text-sm">No discussions yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(post => (
                <PostCard key={post.id} post={post}
                  replies={posts.filter(p => p.parent_id === post.id)}
                  user={user} onReply={handleReply} onLike={handleLike} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: active learners sidebar ───────────────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
          <ActiveLearners
            courseEnrollments={courseEnrols}
            currentUserId={user?.id}
            selectedCourse={selectedCourse}
          />
        </div>

      </div>
    </div>
  );
}
