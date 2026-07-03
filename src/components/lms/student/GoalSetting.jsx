import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Target, Plus, Save, Trash2, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

function GoalForm({ enrollments, onSave, onCancel }) {
  const [form, setForm] = useState({ course_id: "", target_date: "", weekly_hours: 5, notes: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.course_id || !form.target_date) { toast.error("Course and target date are required."); return; }
    setSaving(true);
    const enr = enrollments.find(e => e.course_id === form.course_id);
    await onSave({ ...form, course_title: enr?.course_title || "", enrollment_id: enr?.id || "" });
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm space-y-4">
      <h3 className="font-display font-semibold text-ink">Set a Learning Goal</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Course *</Label>
          <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a course…" /></SelectTrigger>
            <SelectContent>
              {enrollments.map(e => <SelectItem key={e.course_id} value={e.course_id}>{e.course_title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Target Completion Date *</Label>
          <Input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Weekly Study Hours</Label>
          <Input type="number" min={1} max={40} value={form.weekly_hours}
            onChange={e => setForm(f => ({ ...f, weekly_hours: Number(e.target.value) }))} />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-slate_mist mb-1 block">Notes (Optional)</Label>
        <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="resize-none" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={saving} className="bg-harvest text-white gap-1.5">
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Goal"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function GoalSetting({ user, enrollments }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const g = await base44.entities.StudentGoal.filter({ user_id: user.id });
    setGoals(g);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const saveGoal = async (data) => {
    await base44.entities.StudentGoal.create({ user_id: user.id, ...data });
    toast.success("Goal set!");
    setShowForm(false);
    load();
  };

  const deleteGoal = async (id) => {
    await base44.entities.StudentGoal.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success("Goal removed.");
  };

  const getDaysLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getEnrollmentProgress = (courseId) => {
    const enr = enrollments.find(e => e.course_id === courseId);
    return enr?.progress_percent || 0;
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-display font-bold text-ink">Learning Goals</h2>
              <p className="text-sm text-slate_mist">Set target dates to stay on track.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-harvest text-white gap-1.5 h-8">
            <Plus className="w-3.5 h-3.5" /> New Goal
          </Button>
        </div>
      </div>

      {showForm && <GoalForm enrollments={enrollments} onSave={saveGoal} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="text-center py-10 text-slate_mist text-sm">Loading goals…</div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate_mist text-sm">No goals set yet. Set a target date to stay motivated!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(goal => {
            const daysLeft = getDaysLeft(goal.target_date);
            const progress = getEnrollmentProgress(goal.course_id);
            const isOverdue = daysLeft < 0;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-ink">{goal.course_title}</p>
                    <p className="text-xs text-slate_mist flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3 h-3" /> Target: {new Date(goal.target_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate_mist">Course Progress</span>
                    <span className="font-semibold text-ink">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${isOverdue ? "text-red-500" : daysLeft <= 7 ? "text-amber-600" : "text-emerald-600"}`}>
                    <Clock className="w-3 h-3" />
                    {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                  </span>
                  <span className="text-xs text-slate_mist">{goal.weekly_hours}h/week goal</span>
                </div>
                {goal.notes && <p className="text-xs text-slate_mist mt-2 italic">{goal.notes}</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}