import React, { useState, useEffect, useRef } from "react";
import { StickyNote, Save, Trash2, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TopicNotes({ userId, courseId, courseTitle, topicId, topicTitle }) {
  const [note, setNote]         = useState(null);   // existing StudentNote record
  const [content, setContent]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const saveTimer = useRef(null);

  // Load note whenever topic changes
  useEffect(() => {
    if (!userId || !topicId) return;
    setLoading(true);
    setSaved(false);
    base44.entities.StudentNote.filter({ user_id: userId, topic_id: topicId }).then(results => {
      if (results.length > 0) {
        setNote(results[0]);
        setContent(results[0].content || "");
      } else {
        setNote(null);
        setContent("");
      }
      setLoading(false);
    });
  }, [userId, topicId]);

  // Auto-save with debounce
  useEffect(() => {
    if (loading) return;
    clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      if (content.trim()) saveNote();
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [content]);

  const saveNote = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      course_id: courseId,
      course_title: courseTitle,
      topic_id: topicId,
      topic_title: topicTitle,
      content: content.trim(),
    };
    let updated;
    if (note) {
      updated = await base44.entities.StudentNote.update(note.id, { content: content.trim() });
      setNote(prev => ({ ...prev, content: content.trim() }));
    } else {
      updated = await base44.entities.StudentNote.create(payload);
      setNote(updated);
    }
    setSaving(false);
    setSaved(true);
  };

  const deleteNote = async () => {
    if (!note) { setContent(""); return; }
    await base44.entities.StudentNote.delete(note.id);
    setNote(null);
    setContent("");
    setSaved(false);
  };

  return (
    <div className="mt-6 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2.5">
          <StickyNote className="w-4 h-4 text-harvest" />
          <span className="text-sm font-semibold text-white">My Notes</span>
          {note && <span className="text-[10px] bg-harvest/20 text-harvest px-2 py-0.5 rounded-full font-bold">Saved</span>}
        </div>
        <div className="flex items-center gap-3">
          {saving && <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />}
          {saved && !saving && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-white/30" />
            : <ChevronUp className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-white/30 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading notes…
            </div>
          ) : (
            <>
              <p className="text-[11px] text-white/30 mb-2">
                Notes for: <span className="text-white/50">{topicTitle}</span> · auto-saved as you type
              </p>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Jot down key points, timestamps, or questions about this topic…"
                className="min-h-[120px] bg-slate-800 border-white/10 text-white/80 placeholder:text-white/20 resize-y focus-visible:ring-harvest text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-white/20">{content.length} characters</p>
                <div className="flex gap-2">
                  {(note || content.trim()) && (
                    <Button size="sm" variant="ghost"
                      onClick={deleteNote}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 text-xs">
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </Button>
                  )}
                  <Button size="sm"
                    onClick={saveNote}
                    disabled={saving || !content.trim()}
                    className="bg-harvest hover:bg-harvest/90 text-white gap-1.5 text-xs">
                    {saving
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                      : saved
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
                      : <><Save className="w-3.5 h-3.5" /> Save Note</>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}