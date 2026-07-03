import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Bell, Users, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminWaitlist({ courses }) {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => base44.entities.CourseWaitlist.list("-created_date", 300).then(w => { setWaitlist(w); setLoading(false); });
  useEffect(() => { load(); }, []);

  const notifyStudent = async (entry) => {
    await base44.integrations.Core.SendEmail({
      to: entry.user_email,
      subject: `You're off the waitlist — ${entry.course_title} is now available!`,
      body: `Hi ${entry.user_name || "there"},\n\nGreat news! You're now off the waitlist for "${entry.course_title}" at SOL Training Academy.\n\nLog in now to enrol: ${window.location.origin}/student-dashboard\n\nBest,\nSOL Training Academy`,
    });
    await base44.entities.CourseWaitlist.update(entry.id, { notified: true });
    setWaitlist(prev => prev.map(w => w.id === entry.id ? { ...w, notified: true } : w));
    toast.success("Notification sent!");
  };

  const remove = async (id) => {
    await base44.entities.CourseWaitlist.delete(id);
    setWaitlist(prev => prev.filter(w => w.id !== id));
    toast.success("Removed from waitlist.");
  };

  const filtered = filter === "all" ? waitlist : waitlist.filter(w => w.course_id === filter);
  const notifiedCount = waitlist.filter(w => w.notified).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-ink">Course Waitlist</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Waiting", value: waitlist.length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Notified", value: notifiedCount, icon: Bell, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending", value: waitlist.length - notifiedCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div><p className="font-display font-bold text-xl text-ink">{s.value}</p><p className="text-[10px] text-slate_mist">{s.label}</p></div>
          </div>
        ))}
      </div>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Courses" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? <div className="text-center py-10 text-slate_mist text-sm">Loading…</div> : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate_mist text-sm">No students on the waitlist.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-border/30">
              {["Student", "Course", "Joined", "Status", ""].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id} className="border-b border-border/20 hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-ink">{w.user_name || "—"}</p><p className="text-xs text-slate_mist">{w.user_email}</p></td>
                  <td className="px-4 py-3 text-sm text-ink">{w.course_title}</td>
                  <td className="px-4 py-3 text-xs text-slate_mist">{new Date(w.created_date).toLocaleDateString("en-AU")}</td>
                  <td className="px-4 py-3">
                    {w.notified ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Notified</span>
                      : <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Waiting</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!w.notified && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => notifyStudent(w)}>
                          <Send className="w-3 h-3" /> Notify
                        </Button>
                      )}
                      <button onClick={() => remove(w.id)} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}