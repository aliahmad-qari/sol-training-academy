import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import apiClient from "@/api/apiClient";
import {
  MessageSquare, ThumbsUp, Reply, Plus, Search,
  ChevronDown, ChevronUp, Users, Circle, Clock,
  Send, X, MessageCircle, ArrowLeft, Loader2,
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

function presenceTier(updatedDate) {
  if (!updatedDate) return "away";
  const diff = NOW() - new Date(updatedDate).getTime();
  if (diff < MS_1H)  return "online";
  if (diff < MS_24H) return "today";
  if (diff < MS_7D)  return "week";
  return "away";
}

const TIER_CONFIG = {
  online: { dot: "bg-emerald-400", ring: "ring-emerald-400/30", label: "Active now",        order: 0 },
  today:  { dot: "bg-amber-400",   ring: "ring-amber-400/30",   label: "Active today",      order: 1 },
  week:   { dot: "bg-slate-400",   ring: "ring-slate-400/20",   label: "Active this week",  order: 2 },
  away:   { dot: "bg-slate-200",   ring: "",                    label: "Not recently active", order: 3 },
};

function relativeTime(date) {
  if (!date) return "";
  const diff = NOW() - new Date(date).getTime();
  if (diff < 60_000)  return "just now";
  if (diff < MS_1H)   return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < MS_24H)  return `${Math.floor(diff / MS_1H)}h ago`;
  if (diff < MS_7D)   return `${Math.floor(diff / MS_24H)}d ago`;
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// ── DM Chat Panel ─────────────────────────────────────────────────────────────
function DMChat({ currentUser, peer, courseId, courseTitle, onClose, onUnreadChange }) {
  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const bottomRef   = useRef(null);
  const pollRef     = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiClient.get("/direct-messages", {
        params: { course_id: courseId, other_user_id: peer.user_id },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setMessages(data);
      // Tell parent the unread count changed (reading marks them read server-side).
      onUnreadChange?.();
    } catch {
      // Silently ignore polling errors.
    } finally {
      setLoading(false);
    }
  }, [courseId, peer.user_id, onUnreadChange]);

  // Initial load + 5-second poll while chat is open.
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      await apiClient.post("/direct-messages", {
        receiver_id: peer.user_id,
        course_id:   courseId,
        content:     trimmed,
      });
      await fetchMessages();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't send message.");
      setText(trimmed); // Restore on failure.
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const initials = (peer.user_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const tier = presenceTier(peer.updated_date || peer.updatedAt);
  const cfg  = TIER_CONFIG[tier];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-slate-50 flex-shrink-0">
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate_mist" />
        </button>
        <div className={`relative w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-slate-100 text-slate_mist ${tier !== "away" ? `ring-2 ${cfg.ring}` : ""}`}>
          {initials}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate leading-tight">{peer.user_name}</p>
          <p className="text-[10px] text-slate_mist flex items-center gap-1">
            {tier === "online"
              ? <><Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" /> Online</>
              : cfg.label}
            {courseTitle && <> · {courseTitle}</>}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-harvest" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-ink">No messages yet</p>
            <p className="text-xs text-slate_mist mt-1">
              Start the conversation about <strong>{courseTitle}</strong>
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender_id) === String(currentUser.id);
            return (
              <div key={msg.id || msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-harvest text-white rounded-br-sm"
                    : "bg-slate-100 text-ink rounded-bl-sm"
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/60 text-right" : "text-slate_mist"}`}>
                    {relativeTime(msg.createdAt || msg.created_date)}
                    {!isMe && msg.read_at && <span className="ml-1">· Seen</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 p-3 border-t border-border/30 flex-shrink-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-harvest/60 max-h-24 overflow-y-auto"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-xl bg-harvest text-white flex items-center justify-center flex-shrink-0 hover:bg-harvest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Active Learners + DM launcher sidebar ─────────────────────────────────────
function ActiveLearners({ courseEnrollments, currentUser, selectedCourse, unreadCounts, onOpenChat }) {
  const [open, setOpen] = useState(true);

  const relevant = useMemo(() => {
    const base = courseEnrollments.filter(e =>
      selectedCourse === "all" || e.course_id === selectedCourse
    );
    const seen = new Set();
    return base.filter(e => {
      const uid = String(e.user_id);
      if (uid === String(currentUser?.id)) return false; // exclude self
      if (seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });
  }, [courseEnrollments, selectedCourse, currentUser]);

  const sorted = useMemo(() => [...relevant].sort((a, b) => {
    const ta = TIER_CONFIG[presenceTier(a.updated_date || a.updatedAt)].order;
    const tb = TIER_CONFIG[presenceTier(b.updated_date || b.updatedAt)].order;
    if (ta !== tb) return ta - tb;
    return (a.user_name || "").localeCompare(b.user_name || "");
  }), [relevant]);

  const activeCount = sorted.filter(e => {
    const t = presenceTier(e.updated_date || e.updatedAt);
    return t === "online" || t === "today";
  }).length;

  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate_mist" />
          <span className="text-sm font-semibold text-ink">Course Members</span>
          {activeCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {activeCount} active
            </span>
          )}
          {totalUnread > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-harvest text-white">
              {totalUnread} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate_mist">{sorted.length}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-slate_mist" /> : <ChevronDown className="w-3.5 h-3.5 text-slate_mist" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            {sorted.length === 0 ? (
              <p className="px-4 pb-4 pt-1 text-xs text-slate_mist text-center">No classmates enrolled yet.</p>
            ) : (
              <div className="px-2 pb-2 max-h-72 overflow-y-auto space-y-0.5">
                {sorted.map(enr => {
                  const uid      = String(enr.user_id);
                  const tier     = presenceTier(enr.updated_date || enr.updatedAt);
                  const cfg      = TIER_CONFIG[tier];
                  const lastSeen = relativeTime(enr.updated_date || enr.updatedAt);
                  const initials = (enr.user_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                  const unread   = unreadCounts[String(enr.course_id)] || 0;

                  return (
                    <button key={uid} onClick={() => onOpenChat(enr)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-harvest/5 transition-colors group text-left">
                      <div className={`relative w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-slate-100 text-slate_mist ${tier !== "away" ? `ring-2 ${cfg.ring}` : ""}`}>
                        {initials}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate leading-tight">{enr.user_name || "Student"}</p>
                        <p className="text-[10px] text-slate_mist flex items-center gap-1">
                          {tier === "online"
                            ? <><Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />Online</>
                            : lastSeen ? <><Clock className="w-1.5 h-1.5" />{lastSeen}</> : cfg.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {unread > 0 && (
                          <span className="text-[10px] font-bold w-4 h-4 rounded-full bg-harvest text-white flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>
                        )}
                        <MessageCircle className="w-3.5 h-3.5 text-harvest opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2 border-t border-border/30 bg-slate-50 flex flex-wrap gap-x-3 gap-y-1">
              {[{ dot: "bg-emerald-400", label: "< 1h" }, { dot: "bg-amber-400", label: "Today" }, { dot: "bg-slate-400", label: "This week" }].map(item => (
                <span key={item.label} className="flex items-center gap-1 text-[10px] text-slate_mist">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />{item.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({ post, replies, user, onReply, onLike }) {
  const [showReplies,    setShowReplies]    = useState(false);
  const [replyText,      setReplyText]      = useState("");
  const [showReplyForm,  setShowReplyForm]  = useState(false);
  const [saving,         setSaving]         = useState(false);
  const liked = (post.liked_by || []).includes(user?.id);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    await onReply(post, replyText.trim());
    setReplyText(""); setShowReplyForm(false); setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-harvest/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-harvest">
            {(post.user_name || "S").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-ink">{post.user_name || "Student"}</span>
              <span className="text-[10px] text-slate_mist">
                {new Date(post.created_date || post.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </span>
              {post.course_title && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-harvest/10 text-harvest ml-auto">
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
            <Button size="sm" onClick={submitReply} disabled={saving || !replyText.trim()} className="bg-harvest text-white">Post Reply</Button>
          </div>
        </div>
      )}
      {showReplies && replies.length > 0 && (
        <div className="border-t border-border/30 bg-slate-50 divide-y divide-border/20">
          {replies.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate_mist">
                {(r.user_name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-ink">{r.user_name}</span>
                  <span className="text-[10px] text-slate_mist">
                    {new Date(r.created_date || r.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
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
  const [courseEnrols,   setCourseEnrols]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showNewForm,    setShowNewForm]     = useState(false);
  const [newPost,        setNewPost]         = useState({ title: "", content: "", course_id: "" });
  const [saving,         setSaving]         = useState(false);
  // DM state
  const [activePeer,     setActivePeer]     = useState(null); // enrollment object of the peer
  const [unreadCounts,   setUnreadCounts]   = useState({});   // { [courseId]: count }

  // ── Fetch unread counts ────────────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const res = await apiClient.get("/direct-messages/unread-counts");
      setUnreadCounts(res.data?.data?.byCourse || {});
    } catch { /* silent */ }
  }, []);

  // ── Load posts + co-learners ───────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      // Build course_ids param from the student's own enrollments.
      const courseIds = (enrollments || []).map(e => e.course_id).filter(Boolean).join(",");

      const [allPosts, peersRes] = await Promise.all([
        base44.entities.DiscussionPost.list("-created_date"),
        // Dedicated endpoint — returns co-enrolled students only (backend-scoped).
        courseIds
          ? apiClient.get(`/student/co-learners?course_ids=${courseIds}`).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } }),
      ]);

      setPosts(Array.isArray(allPosts) ? allPosts : []);
      const peers = Array.isArray(peersRes.data?.data) ? peersRes.data.data : [];
      setCourseEnrols(peers);
    } catch (err) {
      setPosts([]);
      toast.error("Couldn't load the discussion board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) { load(); fetchUnread(); }
  }, [user?.id]);

  // Poll unread counts every 10s so badge updates even when chat is closed.
  useEffect(() => {
    if (!user?.id) return;
    const t = setInterval(fetchUnread, 10000);
    return () => clearInterval(t);
  }, [user?.id, fetchUnread]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const submitPost = async () => {
    if (!newPost.content.trim() || !newPost.course_id) { toast.error("Please select a course and write something."); return; }
    setSaving(true);
    try {
      const enrollment = enrollments.find(e => e.course_id === newPost.course_id);
      await base44.entities.DiscussionPost.create({
        course_id: newPost.course_id, course_title: enrollment?.course_title || "",
        title: newPost.title, content: newPost.content.trim(),
      });
      setNewPost({ title: "", content: "", course_id: "" }); setShowNewForm(false);
      toast.success("Post published!"); load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't publish your post.");
    } finally { setSaving(false); }
  };

  const handleReply = async (parentPost, text) => {
    try {
      await base44.entities.DiscussionPost.create({
        course_id: parentPost.course_id, course_title: parentPost.course_title,
        parent_id: parentPost.id, content: text,
      });
      load();
    } catch { toast.error("Couldn't post your reply."); }
  };

  const handleLike = async (post) => {
    const liked = (post.liked_by || []).some(id => String(id) === String(user.id));
    const optimistic = liked
      ? { ...post, liked_by: post.liked_by.filter(id => String(id) !== String(user.id)), likes: Math.max(0, (post.likes || 0) - 1) }
      : { ...post, liked_by: [...(post.liked_by || []), user.id], likes: (post.likes || 0) + 1 };
    setPosts(prev => prev.map(p => p.id === post.id ? optimistic : p));
    try {
      const updated = await base44.entities.DiscussionPost.like(post.id);
      if (updated) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...updated } : p));
    } catch {
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
      toast.error("Couldn't register your like.");
    }
  };

  const topLevelPosts = posts.filter(p => !p.parent_id);
  const filtered = topLevelPosts.filter(p => {
    const matchCourse = selectedCourse === "all" || p.course_id === selectedCourse;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchSearch;
  });

  // Course title for DM panel
  const peerCourseTitle = activePeer ? (enrollments.find(e => e.course_id === activePeer.course_id)?.course_title || activePeer.course_title || "") : "";
  const dmCourseId = activePeer?.course_id || (selectedCourse !== "all" ? selectedCourse : enrollments[0]?.course_id) || "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-ink">Course Discussion Board</h2>
        </div>
        <p className="text-sm text-slate_mist">Ask questions, share insights, and message classmates directly.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left: posts + DM panel ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* If a peer is selected, show DM panel instead of post list */}
          <AnimatePresence mode="wait">
            {activePeer ? (
              <motion.div key="dm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="h-[500px] flex flex-col">
                <DMChat
                  currentUser={user}
                  peer={activePeer}
                  courseId={dmCourseId}
                  courseTitle={peerCourseTitle}
                  onClose={() => setActivePeer(null)}
                  onUnreadChange={fetchUnread}
                />
              </motion.div>
            ) : (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
                      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…" className="pl-9 h-9 text-sm" />
                    </div>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="w-full sm:w-44 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {enrollments.map(e => <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setShowNewForm(true)} size="sm" className="w-full sm:w-auto bg-harvest text-white gap-1.5 h-9">
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
                        <SelectContent>{enrollments.map(e => <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>)}</SelectContent>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: active learners sidebar ──────────────────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
          <ActiveLearners
            courseEnrollments={courseEnrols}
            currentUser={user}
            selectedCourse={selectedCourse}
            unreadCounts={unreadCounts}
            onOpenChat={setActivePeer}
          />
        </div>
      </div>
    </div>
  );
}
