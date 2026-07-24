import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle, XCircle, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AutomationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.AutomationLog.list("-created_date", 200).then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return !q || l.business_name?.toLowerCase().includes(q) || l.email_sent_to?.toLowerCase().includes(q) || l.sequence_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate_mist" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" className="pl-9" />
        </div>
        <p className="w-full text-sm text-slate_mist sm:w-auto">{filtered.length} log entries</p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-harvest" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate_mist">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No automation logs yet</p>
            <p className="text-sm mt-1">Logs appear here when sequences are sent</p>
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-chalk border-b border-border">
                <tr>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Business</th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Sequence</th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Subject</th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Sent To</th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-semibold text-slate_mist uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-chalk/50 transition-colors">
                    <td className="px-3 py-3 sm:px-4 font-semibold text-ink">{log.business_name}</td>
                    <td className="px-3 py-3 sm:px-4 text-slate_mist">{log.sequence_name}</td>
                    <td className="px-3 py-3 sm:px-4 text-slate_mist max-w-xs truncate">{log.subject}</td>
                    <td className="px-3 py-3 sm:px-4 text-xs text-slate_mist">{log.email_sent_to}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`flex items-center gap-1 w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {log.status === "sent" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4 text-xs text-slate_mist">
                      {log.created_date ? new Date(log.created_date).toLocaleString("en-AU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}