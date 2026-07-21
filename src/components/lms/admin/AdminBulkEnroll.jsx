import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";

const getRecordId = (record) => record?._id || record?.id;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const findUserByEmail = async (email, userCache) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  if (userCache?.has(normalized)) return userCache.get(normalized);

  const matches = await base44.entities.User.filter({ search: normalized, role: "student" }).catch(() => []);
  const user = matches.find((candidate) => normalizeEmail(candidate.email) === normalized) || null;
  if (user && userCache) userCache.set(normalized, user);
  return user;
};

const ensureStudentUser = async (row, userCache) => {
  const email = normalizeEmail(row.email);
  const existing = await findUserByEmail(email, userCache);
  if (existing) return { user: existing, created: false };

  try {
    const user = await base44.entities.User.create({
      full_name: row.name || email,
      email,
      role: "student",
    });
    if (userCache) userCache.set(email, user);
    return { user, created: true };
  } catch (err) {
    if (err.response?.status === 409) {
      const user = await findUserByEmail(email, userCache);
      if (user) return { user, created: false };
    }
    throw err;
  }
};

export default function AdminBulkEnroll({ courses, onClose, onDone }) {
  const [courseId, setCourseId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [results, setResults] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(Boolean);
    return lines.map(line => {
      const parts = line.split(",").map(p => p.trim().replace(/"/g, ""));
      return { name: parts[0] || "", email: parts[1] || "" };
    }).filter(r => r.email && r.email.includes("@"));
  };

  const enroll = async () => {
    if (!courseId) { toast.error("Please select a course."); return; }
    if (!csvText.trim()) { toast.error("Please paste CSV data or upload a file."); return; }
    const rows = parseCSV(csvText);
    if (rows.length === 0) { toast.error("No valid emails found. Format: Name,Email (one per line)"); return; }

    setEnrolling(true);
    const success = [], failed = [], createdUsers = [];
    const existingUsers = await base44.entities.User.list("-created_date", 2000).catch(() => []);
    const userCache = new Map(existingUsers.map((user) => [normalizeEmail(user.email), user]));

    for (const row of rows) {
      try {
        const { user, created } = await ensureStudentUser(row, userCache);
        const userId = getRecordId(user);
        if (!userId) throw new Error("Could not resolve a valid student account ID.");

        await base44.entities.CourseEnrollment.create({
          user_id: userId,
          course_id: courseId,
        });

        const email = normalizeEmail(user.email || row.email);
        success.push(email);
        if (created) {
          createdUsers.push({
            email,
            generatedPassword: user.generated_password,
          });
        }
      } catch (err) {
        failed.push({
          email: normalizeEmail(row.email),
          reason: err.response?.data?.message || err.message || "Enrollment failed",
        });
      }
    }

    setResults({ success, failed, createdUsers });
    setEnrolling(false);
    if (success.length > 0) {
      toast.success(`${success.length} student${success.length !== 1 ? "s" : ""} enrolled!`);
      onDone();
    }
  };

  const downloadTemplate = () => {
    const csv = "Name,Email\nJane Smith,jane@example.com\nJohn Doe,john@example.com";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bulk_enroll_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">Bulk Enroll Students</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV with Name, Email columns</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {!results ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500 mb-1.5 block font-semibold">Course *</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select course…" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Upload CSV or Paste Data</Label>
                <button onClick={downloadTemplate} className="text-xs text-harvest hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> Template
                </button>
              </div>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border/40 rounded-xl p-4 text-center cursor-pointer hover:border-harvest/40 hover:bg-harvest/5 transition-all mb-3"
              >
                <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Click to upload CSV file</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              </div>
              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={"Name,Email\nJane Smith,jane@example.com\nJohn Doe,john@example.com"}
                rows={6}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {csvText && (
                <p className="text-xs text-slate-500 mt-1">
                  {parseCSV(csvText).length} valid email{parseCSV(csvText).length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={enroll} disabled={enrolling} className="flex-1 bg-harvest text-white gap-2 font-semibold">
                {enrolling ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling…</> : <><Upload className="w-4 h-4" /> Enroll Students</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-2xl text-emerald-700">{results.success.length}</p>
                <p className="text-xs text-emerald-600">Enrolled</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="font-bold text-2xl text-red-600">{results.failed.length}</p>
                <p className="text-xs text-red-500">Failed</p>
              </div>
            </div>
            {results.createdUsers?.some(u => u.generatedPassword) && (
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-700 mb-1">New account temporary passwords:</p>
                {results.createdUsers.filter(u => u.generatedPassword).map(u => <p key={u.email} className="text-xs text-amber-700 font-mono">{u.email}: {u.generatedPassword}</p>)}
              </div>
            )}
            {results.failed.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700 mb-1">Failed emails:</p>
                {results.failed.map(item => <p key={item.email || item} className="text-xs text-red-600">{item.email || item}{item.reason ? ` - ${item.reason}` : ""}</p>)}
              </div>
            )}
            <Button onClick={onClose} className="w-full bg-harvest text-white">Done</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}