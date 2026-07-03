import React, { useState } from "react";
import { Megaphone, Plus, Edit2, Trash2, Send, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

const INITIAL = [
  { id: 1, title: "NDIS Practice Standards Update — June 2026", body: "Updated Practice Standards effective 1 July 2026. All Level 2 and 3 content has been reviewed.", badge: "Important", date: "2026-06-03", published: true },
  { id: 2, title: "New Module: Crisis Management & De-escalation", body: "A new advanced module has been added to Level 2 and Level 3 courses.", badge: "New Module", date: "2026-06-01", published: true },
  { id: 3, title: "Certificate Downloads Now Live", body: "Students can now download their Certificates of Completion as PDFs from their dashboard.", badge: "Feature", date: "2026-05-28", published: true },
  { id: 4, title: "Training Resources Section Added", body: "Guides, templates and policies are now available in the Training Resources section.", badge: "Notice", date: "2026-05-15", published: false },
];

const BADGE_COLORS = {
  Important: "bg-red-100 text-red-700",
  "New Module": "bg-blue-100 text-blue-700",
  Feature:     "bg-emerald-100 text-emerald-700",
  Notice:      "bg-amber-100 text-amber-700",
  Welcome:     "bg-indigo-100 text-indigo-700",
};

function AnnouncementModal({ ann, onClose, onSave }) {
  const [form, setForm] = useState(ann || { title: "", body: "", badge: "Notice", published: false });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title || !form.body) { toast.error("Title and body are required."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave({ ...form, id: ann?.id || Date.now(), date: ann?.date || new Date().toISOString().split("T")[0] });
    setSaving(false);
    onClose();
    toast.success("Announcement saved.");
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="w-4 h-4 accent-harvest" />
                <span className="text-sm text-ink font-medium">Published</span>
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
  const [announcements, setAnnouncements] = useState(INITIAL);
  const [modal, setModal]                 = useState(null); // null | "new" | {ann object}

  const save = (ann) => {
    setAnnouncements(prev => {
      const exists = prev.find(a => a.id === ann.id);
      return exists ? prev.map(a => a.id === ann.id ? ann : a) : [ann, ...prev];
    });
  };

  const del = (id) => {
    if (!confirm("Delete this announcement?")) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success("Announcement deleted.");
  };

  const togglePublish = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));
    toast.success("Status updated.");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Announcements</h2>
          <p className="text-sm text-slate_mist">Create and manage student-facing announcements and notices.</p>
        </div>
        <Button onClick={() => setModal("new")} className="bg-harvest text-white gap-1.5 text-sm h-9">
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
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

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-border/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${BADGE_COLORS[a.badge] || "bg-gray-100 text-gray-600"}`}>{a.badge}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.published ? "● Published" : "○ Draft"}
                  </span>
                  <span className="text-[10px] text-slate_mist ml-auto">{a.date}</span>
                </div>
                <h3 className="font-display font-semibold text-ink mb-1">{a.title}</h3>
                <p className="text-sm text-slate_mist line-clamp-2">{a.body}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => togglePublish(a.id)} className="text-xs h-8 px-3 whitespace-nowrap">
                  {a.published ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setModal(a)} className="h-8 w-8 p-0">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => del(a.id)} className="h-8 w-8 p-0 text-destructive border-destructive/30">
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

      {modal && (
        <AnnouncementModal
          ann={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </div>
  );
}