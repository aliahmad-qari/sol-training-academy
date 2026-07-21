import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, Users, TrendingUp, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReferralReport() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Referral.list("-created_date", 500)
      .then(r => setReferrals(r))
      .catch(() => setReferrals([]))
      .finally(() => setLoading(false));
  }, []);

  const byReferrer = {};
  referrals.forEach(r => {
    if (!byReferrer[r.referrer_id]) byReferrer[r.referrer_id] = { name: r.referrer_name, email: r.referrer_email, total: 0, registered: 0, enrolled: 0 };
    byReferrer[r.referrer_id].total++;
    if (r.status === "registered" || r.status === "enrolled") byReferrer[r.referrer_id].registered++;
    if (r.status === "enrolled") byReferrer[r.referrer_id].enrolled++;
  });
  const leaderboard = Object.entries(byReferrer).sort((a, b) => b[1].total - a[1].total);

  const exportCSV = () => {
    const rows = [["Referrer Name", "Referrer Email", "Referred Email", "Referred Name", "Status", "Date"]];
    referrals.forEach(r => rows.push([r.referrer_name, r.referrer_email, r.referred_email, r.referred_name, r.status, new Date(r.created_date).toLocaleDateString("en-AU")]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "referrals.csv"; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-ink">Referral Report</h2>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 text-xs"><Download className="w-3.5 h-3.5" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Referrals", value: referrals.length, icon: Gift, color: "text-harvest bg-harvest/10" },
          { label: "Registered", value: referrals.filter(r => r.status !== "pending").length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Enrolled", value: referrals.filter(r => r.status === "enrolled").length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Conversion", value: referrals.length > 0 ? `${Math.round((referrals.filter(r => r.status === "enrolled").length / referrals.length) * 100)}%` : "—", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div><p className="font-display font-bold text-xl text-ink">{s.value}</p><p className="text-[10px] text-slate_mist">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30"><h3 className="font-display font-semibold text-ink">Top Referrers</h3></div>
        {loading ? <div className="p-8 text-center text-slate_mist text-sm">Loading…</div> : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate_mist text-sm">No referrals yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-border/30">
              {["#", "Referrer", "Total Referred", "Registered", "Enrolled"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {leaderboard.map(([id, data], i) => (
                <tr key={id} className="border-b border-border/20 hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs font-bold text-slate_mist">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-ink">{data.name || "—"}</p>
                    <p className="text-xs text-slate_mist">{data.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">{data.total}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">{data.registered}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{data.enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All Referrals */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30"><h3 className="font-display font-semibold text-ink">All Referrals</h3></div>
        {referrals.length === 0 ? <div className="p-12 text-center text-slate_mist text-sm">No referrals yet.</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-border/30">
              {["Referrer", "Referred Person", "Status", "Date"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id} className="border-b border-border/20 hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="text-xs font-medium text-ink">{r.referrer_name}</p><p className="text-[10px] text-slate_mist">{r.referrer_email}</p></td>
                  <td className="px-4 py-3"><p className="text-xs font-medium text-ink">{r.referred_name || "—"}</p><p className="text-[10px] text-slate_mist">{r.referred_email}</p></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "enrolled" ? "bg-emerald-100 text-emerald-700" : r.status === "registered" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate_mist">{new Date(r.created_date).toLocaleDateString("en-AU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}