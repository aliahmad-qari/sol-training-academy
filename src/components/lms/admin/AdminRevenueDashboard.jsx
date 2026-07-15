import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, ShoppingCart, Download, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

export default function AdminRevenueDashboard({ courses }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CoursePayment.filter({ payment_status: "completed" }, "-created_date", 500).then(p => { setPayments(p); setLoading(false); });
  }, []);

  const totalRevenue = payments.reduce((s, p) => s + (p.amount_paid || p.course_price || 0), 0);
  const thisMonth = payments.filter(p => new Date(p.created_date).getMonth() === new Date().getMonth());
  const monthRevenue = thisMonth.reduce((s, p) => s + (p.amount_paid || p.course_price || 0), 0);

  // Monthly breakdown
  const monthlyMap = {};
  payments.forEach(p => {
    const d = new Date(p.created_date);
    const key = d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
    monthlyMap[key] = (monthlyMap[key] || 0) + (p.amount_paid || p.course_price || 0);
  });
  const monthlyData = Object.entries(monthlyMap).slice(-6).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));

  // Top courses by revenue
  const courseRevMap = {};
  payments.forEach(p => { courseRevMap[p.course_id] = (courseRevMap[p.course_id] || 0) + (p.amount_paid || p.course_price || 0); });
  const topCourses = courses.map(c => ({ ...c, revenue: courseRevMap[c.id] || 0 })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const exportCSV = () => {
    const rows = [["Date", "Student", "Course", "Amount", "Method"]];
    payments.forEach(p => rows.push([new Date(p.created_date).toLocaleDateString("en-AU"), p.user_id, p.course_title, p.amount_paid || p.course_price, p.payment_method]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "revenue.csv"; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-ink">Revenue Dashboard</h2>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 text-xs"><Download className="w-3.5 h-3.5" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "This Month", value: `$${monthRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
          { label: "Total Orders", value: payments.length, icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
          { label: "Avg Order", value: payments.length > 0 ? `$${(totalRevenue / payments.length).toFixed(2)}` : "—", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div><p className="font-display font-bold text-xl text-ink">{s.value}</p><p className="text-[10px] text-slate_mist">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Monthly Revenue (Last 6 Months)</h3>
          {monthlyData.length === 0 ? <div className="h-40 flex items-center justify-center text-slate_mist text-sm">No payment data yet</div> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Top Courses by Revenue</h3>
          {topCourses.filter(c => c.revenue > 0).length === 0 ? <div className="h-40 flex items-center justify-center text-slate_mist text-sm">No revenue data yet</div> : (
            <div className="space-y-3">
              {topCourses.filter(c => c.revenue > 0).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate_mist w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{c.title}</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                      <div className="h-1.5 bg-harvest rounded-full" style={{ width: `${Math.round((c.revenue / (topCourses[0]?.revenue || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex-shrink-0">${c.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30"><h3 className="font-display font-semibold text-ink">Recent Payments</h3></div>
        {payments.length === 0 ? <div className="p-12 text-center text-slate_mist text-sm">No completed payments yet.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-border/30">
                {["Date", "Course", "Amount", "Method", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate_mist uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {payments.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b border-border/20 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate_mist">{new Date(p.created_date).toLocaleDateString("en-AU")}</td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{p.course_title}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">${(p.amount_paid || p.course_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-slate_mist capitalize">{p.payment_method?.replace("_", " ")}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Completed</span></td>
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