import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Megaphone, Plus, Edit2, Trash2, Send, X, Save, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BADGE_COLORS = {
  Important: "bg-red-100 text-red-700",
  "New Module": "bg-blue-100 text-blue-700",
  Feature:     "bg-emerald-100 text-emerald-700",
  Notice:      "bg-amber-100 text-amber-700",
  Welcome:     "bg-indigo-100 text-indigo-700",
};

function AnnouncementModal({ ann, onClose, onSave }) {
  const [form, setForm] = useState(
    ann || { title: "", body: "", badge: "Notice", published: false, pinned: false }
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title || !form.body) { toast.error("Title and body are required."); return; }
    setSaving(true);
    try {
      if (ann?._id || ann?.id) {
        const res = await apiClient.patch(`/announcements/${ann._id || ann.id}`, form);
        onSave(res.data.data);
      } else {
        const res = await apiClient.post("/announcements", form);
        onSave(res.data.data);
      }
      toast.success("Announcement saved.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save.");
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
          <h3 className="font-display font-bold text-xl text-ink">{ann ? "Edit Announcement" : "New Announcement"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate_mist hover:text-ink" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Body *</Label>
            <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Announcement content…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Badge</Label>
              <Select value={form.badge} onValueChange={v => setForm(f => ({ ...f, badge: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(BADGE_COLORS).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="w-4 h-4 accent-harvest" />
                <span className="text-sm text-ink font-medium">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 accent-harvest" />
                <span className="text-sm text-ink font-medium">Pinned</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-harvest text-white gap-1.5">
            <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState(null);
  const [search, setSearch]               = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/announcements");
      setAnnouncements(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = (ann) => {
    setAnnouncements(prev => {
      const id = ann._id || ann.id;
      const exists = prev.find(a => (a._id || a.id) === id);
      return exists ? prev.map(a => (a._id || a.id) === id ? ann : a) : [ann, ...prev];
    });
  };

  const del = async (ann) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiClient.delete(`/announcements/${ann._id || ann.id}`);
      setAnnouncements(prev => prev.filter(a => (a._id || a.id) !== (ann._id || ann.id)));
      toast.success("Announcement deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  const togglePublish = async (ann) => {
    try {
      const res = await apiClient.patch(`/announcements/${ann._id || ann.id}`, { published: !ann.published });
      handleSave(res.data.data);
      toast.success(ann.published ? "Unpublished." : "Published — students can now see this.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    }
  };

  const filtered = announcements.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.title || "").toLowerCase().includes(q) ||
      (a.body || "").toLowerCase().includes(q) ||
      (a.badge || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Announcements</h2>
          <p className="text-sm text-slate_mist">Create and manage student-facing announcements and notices.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={() => setModal("new")} className="bg-harvest text-white gap-1.5 text-sm h-9">
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Send className="w-4 h-4 text-green-600" /></div>
          <div>
            <p className="font-display font-bold text-xl text-ink">{announcements.filter(a => a.published).length}</p>
            <p className="text-[10px] text-slate_mist">Published</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Megaphone className="w-4 h-4 text-amber-600" /></div>
          <div>
            <p className="font-display font-bold text-xl text-ink">{announcements.filter(a => !a.published).length}</p>
            <p className="text-[10px] text-slate_mist">Drafts</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {announcements.length > 0 && (
        <div className="relative max-w-sm mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, content or badge…" className="pl-9 h-9 text-sm" />
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-slate_mist text-sm">
          Loading announcements…
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.length > 0 && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-border/50 p-10 text-center">
              <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate_mist/30" />
              <p className="text-slate_mist text-sm">No announcements match “{search}”.</p>
            </div>
          )}
          {filtered.map(a => (
            <div key={a._id || a.id} className="bg-white rounded-2xl border border-border/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${BADGE_COLORS[a.badge] || "bg-gray-100 text-gray-600"}`}>{a.badge}</span>
                    {a.pinned && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">📌 Pinned</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {a.published ? "● Published" : "○ Draft"}
                    </span>
                    <span className="text-[10px] text-slate_mist ml-auto">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-AU") : ""}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-ink mb-1">{a.title}</h3>
                  <p className="text-sm text-slate_mist line-clamp-2">{a.body}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => togglePublish(a)} className="text-xs h-8 px-3 whitespace-nowrap">
                    {a.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setModal(a)} className="h-8 w-8 p-0">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => del(a)} className="h-8 w-8 p-0 text-destructive border-destructive/30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-border p-16 text-center">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-slate_mist/30" />
              <p className="font-display font-semibold text-ink mb-1">No announcements yet</p>
              <Button onClick={() => setModal("new")} className="mt-3 bg-harvest text-white"><Plus className="w-4 h-4 mr-1.5" /> Create First Announcement</Button>
            </div>
          )}
        </div>
      )}

      {modal && (
        <AnnouncementModal
          ann={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
