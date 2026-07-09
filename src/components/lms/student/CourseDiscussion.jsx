import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, ThumbsUp, Reply, Plus, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
              <span className="text-[10px] text-slate_mist">{new Date(post.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
            </div>
            {post.title && <p className="font-display font-semibold text-ink mb-1">{post.title}</p>}
            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
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
            <Button size="sm" onClick={submitReply} disabled={saving || !replyText.trim()} className="bg-harvest text-white">Post Reply</Button>
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
              <div>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-ink">{r.user_name}</span>
                  <span className="text-[10px] text-slate_mist">{new Date(r.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                </div>
                <p className="text-xs text-slate-700">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDiscussion({ user, enrollments }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", course_id: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Backend scopes results to the courses this student is enrolled in, so
      // all enrolled students see each other's posts. Staff see everything.
      const all = await base44.entities.DiscussionPost.list("-created_date");
      setPosts(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error("Failed to load discussions:", err);
      setPosts([]);
      toast.error("Couldn't load the discussion board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const submitPost = async () => {
    if (!newPost.content.trim() || !newPost.course_id) { toast.error("Please fill all required fields."); return; }
    setSaving(true);
    try {
      const enrollment = enrollments.find(e => e.course_id === newPost.course_id);
      await base44.entities.DiscussionPost.create({
        course_id: newPost.course_id,
        course_title: enrollment?.course_title || "",
        title: newPost.title,
        content: newPost.content.trim(),
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

  const handleReply = async (parentPost, text) => {
    try {
      await base44.entities.DiscussionPost.create({
        course_id: parentPost.course_id,
        course_title: parentPost.course_title,
        parent_id: parentPost.id,
        content: text,
      });
      load();
    } catch (err) {
      console.error("Failed to post reply:", err);
      toast.error("Couldn't post your reply. Please try again.");
    }
  };

  const handleLike = async (post) => {
    // Optimistic toggle; the atomic backend endpoint returns the source of truth.
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
      setPosts(prev => prev.map(p => p.id === post.id ? post : p)); // rollback
      toast.error("Couldn't register your like. Please try again.");
    }
  };

  const topLevelPosts = posts.filter(p => !p.parent_id);
  const filtered = topLevelPosts.filter(p => {
    const matchCourse = selectedCourse === "all" || p.course_id === selectedCourse;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-ink">Course Discussion Board</h2>
        </div>
        <p className="text-sm text-slate_mist">Ask questions, share insights, and help fellow students.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…" className="pl-9 h-9 text-sm" />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {enrollments.map(e => <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewForm(true)} size="sm" className="bg-harvest text-white gap-1.5 h-9">
          <Plus className="w-3.5 h-3.5" /> New Post
        </Button>
      </div>

      {showNewForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm space-y-3">
          <h3 className="font-display font-semibold text-ink">Create a New Discussion Post</h3>
          <Select value={newPost.course_id} onValueChange={v => setNewPost(p => ({ ...p, course_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a course *" /></SelectTrigger>
            <SelectContent>
              {enrollments.map(e => <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Title (optional)" />
          <Textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
            placeholder="What's your question or topic? *" rows={4} className="resize-none" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
            <Button size="sm" onClick={submitPost} disabled={saving} className="bg-harvest text-white">Publish Post</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate_mist text-sm">Loading discussions…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
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
  );
}