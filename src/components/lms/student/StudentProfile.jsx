import React, { useState } from "react";
import { User, Mail, Phone, Lock, BookOpen, Award, Target, Clock, Edit2, Save, X, Camera, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const LEVEL_COLORS = {
  level1: "bg-harvest/10 text-harvest border-harvest/30",
  level2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  level3: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function StudentProfile({ user, enrollments, quizAttempts }) {
  const [editMode, setEditMode]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [phone, setPhone]         = useState(user?.phone || "");
  const completed  = enrollments.filter(e => e.status === "completed").length;
  const certs      = enrollments.filter(e => e.certificate_issued).length;
  const passedQ    = quizAttempts.filter(q => q.passed).length;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone });
      toast.success("Profile updated successfully.");
      setEditMode(false);
    } catch {
      toast.error("Failed to update profile.");
    }
    setSaving(false);
  };

  const initials = (user?.full_name || user?.email || "S")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-harvest to-amber-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        </div>
        
        <div className="px-6 pb-6 relative">
          {/* Avatar & Header */}
          <div className="flex items-end gap-5 -mt-14 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-harvest to-amber-600 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-display font-bold text-3xl">{initials}</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-harvest flex items-center justify-center text-harvest hover:bg-slate-50 transition-colors shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-end justify-between pb-1">
              <div>
                <h2 className="font-display font-bold text-3xl text-ink">{user?.full_name || "Student"}</h2>
                <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
              </div>
              
              {!editMode ? (
                <Button size="sm" onClick={() => setEditMode(true)} className="gap-2 bg-harvest hover:bg-harvest/90 text-white">
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} disabled={saving} className="bg-harvest hover:bg-harvest/90 text-white">
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-700">Active Student • Verified Account</span>
          </div>
        </div>
      </Card>

      {/* Learning Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Courses Enrolled", value: enrollments.length, icon: BookOpen, color: "text-harvest bg-harvest/10" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Certificates", value: certs, icon: Award, color: "text-blue-600 bg-blue-50" },
          { label: "Quizzes Passed", value: passedQ, icon: Target, color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-2xl text-ink">{s.value}</p>
            <p className="text-xs text-slate-600 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Account Information */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <User className="w-5 h-5 text-harvest" />
          <h3 className="font-display font-bold text-lg text-ink">Account Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</Label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-ink font-medium">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {user?.full_name || "Not provided"}
              </div>
              <p className="text-xs text-slate-400 mt-1">Contact support to change</p>
            </div>

            {/* Email Address */}
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Address</Label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {user?.email || "Not provided"}
              </div>
              <p className="text-xs text-slate-400 mt-1">Verified and secure</p>
            </div>

            {/* Phone Number */}
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</Label>
              {editMode ? (
                <Input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+61 4XX XXX XXX" 
                  className="h-11"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {user?.phone || phone || "Not provided"}
                </div>
              )}
            </div>

            {/* Account Role */}
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Account Type</Label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="capitalize">{user?.role === "admin" ? "Instructor" : "Student"}</span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                To update your name or email, <a href="mailto:info@solbusinessconsultant.com.au" className="font-semibold hover:underline">contact support</a>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Learning History */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Clock className="w-5 h-5 text-harvest" />
          <h3 className="font-display font-bold text-lg text-ink">Enrollment History</h3>
        </div>
        {enrollments.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No course enrollments yet. Start learning today!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {enrollments.map(enr => (
              <div key={enr.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-ink">{enr.course_title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Enrolled {enr.created_date ? new Date(enr.created_date).toLocaleDateString("en-AU") : "—"}
                      {enr.completed_date && ` • Completed ${new Date(enr.completed_date).toLocaleDateString("en-AU")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${LEVEL_COLORS[enr.course_level] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {enr.course_level?.replace("level", "Level ")}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${enr.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-harvest/10 text-harvest"}`}>
                      {enr.status === "completed" ? "✓ Completed" : `${enr.progress_percent || 0}%`}
                    </span>
                  </div>
                </div>
                {enr.status !== "completed" && (
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-harvest rounded-full transition-all" style={{ width: `${enr.progress_percent || 0}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security & Password */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <div className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-bold text-ink mb-1">Password & Security</h4>
            <p className="text-sm text-slate-600 mb-4">Keep your account secure by updating your password regularly.</p>
            <Button variant="outline" size="sm" className="gap-2">
              <Lock className="w-4 h-4" />
              <a href="/forgot-password" className="hover:underline">
                Change Password
              </a>
            </Button>
            <p className="text-xs text-slate-500 mt-3">
              Need help? <a href="mailto:info@solbusinessconsultant.com.au" className="text-harvest hover:underline font-semibold">Contact support</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}