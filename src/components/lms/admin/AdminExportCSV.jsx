import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, FileText, Users, HelpCircle, Award, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ExportCard({ icon: Icon, title, desc, color, onExport, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
        <div><p className="font-display font-semibold text-ink">{title}</p><p className="text-xs text-slate_mist">{desc}</p></div>
      </div>
      <Button onClick={onExport} disabled={loading} variant="outline" className="gap-2 text-sm w-full">
        <Download className="w-4 h-4" /> {loading ? "Exporting…" : "Export CSV"}
      </Button>
    </div>
  );
}

export default function AdminExportCSV({ courses }) {
  const [loading, setLoading] = useState({});

  const doExport = async (key, fetchFn, headers, mapFn) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const data = await fetchFn();
      if (!data || data.length === 0) {
        toast.info("No data to export yet.");
        return;
      }
      const rows = [headers, ...data.map(mapFn)];
      const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} rows successfully!`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const exports = [
    {
      key: "students",
      icon: Users,
      title: "Students & Enrollments",
      desc: "All student enrollments with progress and status",
      color: "bg-blue-100 text-blue-600",
      fetch: () => base44.entities.CourseEnrollment.list("-created_date", 2000),
      headers: ["Student Name", "Email", "Course", "Level", "Status", "Progress", "Enrolled Date", "Certificate"],
      map: e => [e.user_name, e.user_email, e.course_title, e.course_level, e.status, `${e.progress_percent || 0}%`, new Date(e.created_date).toLocaleDateString("en-AU"), e.certificate_issued ? "Yes" : "No"],
    },
    {
      key: "quiz_attempts",
      icon: HelpCircle,
      title: "Quiz Attempts",
      desc: "All quiz attempts with scores and pass/fail status",
      color: "bg-purple-100 text-purple-600",
      fetch: () => base44.entities.QuizAttempt.list("-created_date", 2000),
      headers: ["Student ID", "Course ID", "Topic ID", "Score", "Passed", "Attempt #", "Date"],
      map: q => [q.user_id, q.course_id, q.topic_id, `${q.score}%`, q.passed ? "Yes" : "No", q.attempt_number || 1, new Date(q.created_date).toLocaleDateString("en-AU")],
    },
    {
      key: "submissions",
      icon: ClipboardList,
      title: "Assignment Submissions",
      desc: "All assignment submissions with grades",
      color: "bg-emerald-100 text-emerald-600",
      fetch: () => base44.entities.AssignmentSubmission.list("-created_date", 2000),
      headers: ["Student Name", "Email", "Assignment", "Course", "Status", "Marks", "Max Marks", "Passed", "Date"],
      map: s => [s.user_name, s.user_email, s.assignment_title, s.course_title, s.status, s.marks_awarded ?? "", s.max_marks, s.passed ? "Yes" : "No", new Date(s.created_date).toLocaleDateString("en-AU")],
    },
    {
      key: "certificates",
      icon: Award,
      title: "Certificates",
      desc: "All issued certificates and completions",
      color: "bg-amber-100 text-amber-600",
      fetch: () => base44.entities.CourseEnrollment.filter({ certificate_issued: true }, "-created_date", 500),
      headers: ["Student Name", "Email", "Course", "Completed Date", "Certificate URL"],
      map: e => [e.user_name, e.user_email, e.course_title, e.completed_date || "", e.certificate_url || ""],
    },
    {
      key: "payments",
      icon: FileText,
      title: "Payments",
      desc: "All course payment records",
      color: "bg-rose-100 text-rose-600",
      fetch: () => base44.entities.CoursePayment.list("-created_date", 2000),
      headers: ["Date", "Course", "Amount", "Method", "Status", "Transaction ID"],
      map: p => [new Date(p.created_date).toLocaleDateString("en-AU"), p.course_title, `$${p.amount_paid || p.course_price || 0}`, p.payment_method, p.payment_status, p.transaction_id || ""],
    },
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-display font-semibold text-lg text-ink">Export Data to CSV</h2>
      <p className="text-sm text-slate_mist">Download your LMS data as CSV files for offline analysis or reporting.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map(exp => (
          <ExportCard key={exp.key} icon={exp.icon} title={exp.title} desc={exp.desc} color={exp.color}
            loading={loading[exp.key]}
            onExport={() => doExport(exp.key, exp.fetch, exp.headers, exp.map)} />
        ))}
      </div>
    </div>
  );
}