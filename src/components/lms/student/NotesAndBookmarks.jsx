import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Bookmark, Plus, Trash2, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function NotesAndBookmarks({ user, enrollments }) {
  const [tab, setTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const n = await base44.entities.StudentNote.filter({ user_id: user.id }, "-created_date");
      setNotes(Array.isArray(n) ? n : []);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setNotes([]);
      toast.error("Couldn't load your notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await base44.entities.StudentNote.create({
        user_id: user.id,
        course_id: "general",
        course_title: "General Notes",
        content: newNote.trim(),
        is_bookmarked: false,
      });
      setNewNote("");
      setAdding(false);
      toast.success("Note saved!");
      load();
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Couldn't save your note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBookmark = async (note) => {
    const next = !note.is_bookmarked;
    // Optimistic update, rolled back on failure.
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_bookmarked: next } : n));
    try {
      await base44.entities.StudentNote.update(note.id, { is_bookmarked: next });
    } catch (err) {
      console.error("Failed to update bookmark:", err);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_bookmarked: !next } : n));
      toast.error("Couldn't update the bookmark. Please try again.");
    }
  };

  const deleteNote = async (id) => {
    const prev = notes;
    setNotes(cur => cur.filter(n => n.id !== id)); // optimistic
    try {
      await base44.entities.StudentNote.delete(id);
      toast.success("Note deleted.");
    } catch (err) {
      console.error("Failed to delete note:", err);
      setNotes(prev); // rollback
      toast.error("Couldn't delete the note. Please try again.");
    }
  };

  const displayed = notes.filter(n => {
    const matchTab = tab === "notes" ? true : n.is_bookmarked;
    const term = search.toLowerCase();
    const matchSearch = !search
      || (n.content || "").toLowerCase().includes(term)
      || (n.topic_title || "").toLowerCase().includes(term);
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <StickyNote className="w-5 h-5 text-amber-600" />
          <h2 className="font-display font-bold text-ink">Notes & Bookmarks</h2>
        </div>
        <p className="text-sm text-slate_mist">Keep track of your learning with personal notes and bookmarked topics.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ id: "notes", label: `All Notes (${notes.length})`, icon: StickyNote },
            { id: "bookmarks", label: `Bookmarks (${notes.filter(n => n.is_bookmarked).length})`, icon: Bookmark }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white shadow text-ink" : "text-slate_mist hover:text-ink"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setAdding(true)} size="sm" className="bg-harvest text-white gap-1.5 h-8">
          <Plus className="w-3.5 h-3.5" /> Add Note
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm">
          <Textarea value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="Write your note here…" rows={4} className="resize-none mb-3" autoFocus />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setNewNote(""); }}>Cancel</Button>
            <Button size="sm" onClick={addNote} disabled={saving || !newNote.trim()} className="bg-harvest text-white">
              {saving ? "Saving…" : "Save Note"}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…" className="pl-9 h-9 text-sm" />
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate_mist text-sm">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
          {tab === "bookmarks" ? <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" /> : <StickyNote className="w-10 h-10 text-slate-300 mx-auto mb-3" />}
          <p className="text-slate_mist text-sm">{tab === "bookmarks" ? "No bookmarked notes yet." : "No notes yet. Add your first note!"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayed.map(note => (
              <motion.div key={note.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {note.topic_title && <p className="text-[10px] text-harvest font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> {note.topic_title}</p>}
                    <p className="text-sm text-ink leading-relaxed">{note.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                  <p className="text-[10px] text-slate_mist">{new Date(note.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleBookmark(note)}
                      className={`p-1.5 rounded-lg transition-colors ${note.is_bookmarked ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-400"}`}>
                      <Bookmark className="w-3.5 h-3.5" fill={note.is_bookmarked ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}