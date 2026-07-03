import React, { useState } from "react";
import { Award, Search, Download, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const LEVEL_COLORS = {
  level1: "bg-blue-100 text-blue-700",
  level2: "bg-amber-100 text-amber-700",
  level3: "bg-purple-100 text-purple-700"
};

export default function AdminCertificates({ enrollments, courses }) {
  const [search, setSearch] = useState("");
  const certified = enrollments.filter(e => e.certificate_issued);

  const filtered = certified.filter(e =>
    !search ||
    (e.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.course_title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-sm text-slate_mist">{certified.length} certificates issued to date</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search certificates…" className="pl-9 h-9 text-sm w-56" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-16 text-center">
          <Award className="w-12 h-12 text-slate_mist/30 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-ink mb-2">No certificates yet</h3>
          <p className="text-slate_mist text-sm">Certificates are issued automatically when students complete a course.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border/30">
                  {["Student", "Course", "Level", "Completed", "Certificate Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-harvest/10 flex items-center justify-center text-harvest text-xs font-bold flex-shrink-0">
                          {(e.user_name || e.user_email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{e.user_name || "—"}</p>
                          <p className="text-xs text-slate_mist">{e.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink max-w-[200px]">
                      <p className="truncate">{e.course_title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[e.course_level] || "bg-gray-100 text-gray-600"}`}>
                        {e.course_level?.replace("level", "Level ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate_mist">
                      {e.completed_date ? new Date(e.completed_date).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Issued
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border/20 text-xs text-slate_mist text-right">
            {filtered.length} of {certified.length} certificates
          </div>
        </div>
      )}
    </div>
  );
}