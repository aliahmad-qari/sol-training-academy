import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Trash2, CheckCircle, Flag, Search, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminDiscussionModeration({ courses }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const allPosts = await base44.entities.DiscussionPost.list("-created_date", 200);
    setPosts(allPosts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deletePost = async (post) => {
    if (!confirm(`Delete this post by "${post.user_name}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    await base44.entities.DiscussionPost.delete(post.id);
    setPosts(prev => prev.filter(p => p.id !== post.id));
    toast.success("Post deleted.");
    setDeletingId(null);
  };

  const filtered = posts.filter(p => {
    const matchCourse = courseFilter === "all" || p.course_id === courseFilter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.content?.toLowerCase().includes(q) ||
      p.user_name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q);
    return matchCourse && matchSearch;
  });

  const topLevel = filtered.filter(p => !p.parent_id);
  const replies = filtered.filter(p => !!p.parent_id);

  const stats = [
    { label: "Total Posts", value: posts.length, color: "text-blue-600 bg-blue-50" },
    { label: "Top-Level", value: posts.filter(p => !p.parent_id).length, color: "text-purple-600 bg-purple-50" },
    { label: "Replies", value: posts.filter(p => !!p.parent_id).length, color: "text-emerald-600 bg-emerald-50" },
    { label: "Courses Active", value: new Set(posts.map(p => p.course_id)).size, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-ink">Discussion Moderation</h2>
          <p className="text-xs text-slate-500">Review and moderate all student discussion posts</p>
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

      {/* Filters */}
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
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-harvest" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">No discussion posts found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filtered.length} Posts ({topLevel.length} top-level, {replies.length} replies)
            </p>
          </div>
          <div className="divide-y divide-border/20">
            {filtered.map(post => {
              const course = courses.find(c => c.id === post.course_id);
              const isReply = !!post.parent_id;
              return (
                <div key={post.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isReply ? "pl-10 bg-slate-50/50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                      isReply ? "bg-slate-100 text-slate-500" : "bg-harvest/10 text-harvest"
                    }`}>
                      {(post.user_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-ink">{post.user_name || "Unknown"}</span>
                        {isReply && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">Reply</span>
                        )}
                        {course && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{course.title}</span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {(post.likes || 0) > 0 && (
                          <span className="text-[10px] text-slate-500">❤️ {post.likes}</span>
                        )}
                      </div>
                      {post.title && <p className="text-sm font-semibold text-ink mb-0.5">{post.title}</p>}
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{post.content}</p>
                    </div>
                    <button
                      onClick={() => deletePost(post)}
                      disabled={deletingId === post.id}
                      className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete post"
                    >
                      {deletingId === post.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
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