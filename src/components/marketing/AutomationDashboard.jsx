import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Users, TrendingUp, Mail, DollarSign, ArrowUpRight, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const PLAN_COLORS = { starter: "#64748B", growth: "#D97706", enterprise: "#0F172A" };
const STATUS_COLORS = { trial: "#3B82F6", active: "#10B981", paused: "#F59E0B", cancelled: "#EF4444", expired: "#6B7280" };

const PLAN_PRICES = {
  starter:    { monthly: 297,  annually: 2970 },
  growth:     { monthly: 697,  annually: 6970 },
  enterprise: { monthly: 1497, annually: 14970 },
};

export default function AutomationDashboard() {
  const [subs, setSubs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Subscription.list("-created_date", 300),
      base44.entities.AutomationLog.list("-created_date", 100),
    ]).then(([s, l]) => { setSubs(s); setLogs(l); setLoading(false); });
  }, []);

  const total = subs.length;
  const active = subs.filter(s => s.status === "active").length;
  const trial = subs.filter(s => s.status === "trial").length;
  const cancelled = subs.filter(s => s.status === "cancelled").length;

  const mrr = subs
    .filter(s => s.status === "active")
    .reduce((sum, s) => {
      const price = PLAN_PRICES[s.plan]?.[s.billing_cycle] || 0;
      return sum + (s.billing_cycle === "annually" ? price / 12 : price);
    }, 0);

  const arr = mrr * 12;

  // Plan distribution for pie
  const planDist = ["starter", "growth", "enterprise"].map(plan => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: subs.filter(s => s.plan === plan).length,
    color: PLAN_COLORS[plan],
  }));

  // Status distribution
  const statusDist = Object.keys(STATUS_COLORS).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: subs.filter(s => s.status === status).length,
    color: STATUS_COLORS[status],
  })).filter(s => s.value > 0);

  // Monthly growth (last 6 months)
  const monthlyGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString("en-AU", { month: "short" });
    const count = subs.filter(s => {
      const c = new Date(s.created_date);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, subscribers: count };
  });

  const statCards = [
    { label: "Total Subscribers", value: total, icon: Users, color: "text-ink", bg: "bg-ink/5" },
    { label: "Active Subscriptions", value: active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "In Trial", value: trial, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "MRR", value: `$${Math.round(mrr).toLocaleString()}`, icon: DollarSign, color: "text-harvest", bg: "bg-harvest/10" },
    { label: "ARR", value: `$${Math.round(arr).toLocaleString()}`, icon: TrendingUp, color: "text-harvest", bg: "bg-harvest/10" },
    { label: "Emails Sent (last 100)", value: logs.length, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-harvest border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-border p-4 space-y-2">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="font-display font-bold text-xl text-ink">{s.value}</p>
            <p className="text-xs text-slate_mist leading-tight">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Monthly Growth */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-ink mb-4">New Subscribers (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyGrowth}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="subscribers" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""} labelLine={false}>
                {planDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {planDist.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-slate_mist">{p.name}</span>
                </div>
                <span className="font-semibold text-ink">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status + Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Subscription Status</h3>
          <div className="space-y-3">
            {statusDist.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1 bg-chalk rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%`, background: s.color }} />
                </div>
                <span className="text-xs text-slate_mist w-16 text-right">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Automation Activity */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Recent Automation Activity</h3>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate_mist text-sm">No automation activity yet</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.slice(0, 8).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 bg-chalk rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-harvest flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{log.business_name}</p>
                    <p className="text-[10px] text-slate_mist truncate">{log.sequence_name}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}