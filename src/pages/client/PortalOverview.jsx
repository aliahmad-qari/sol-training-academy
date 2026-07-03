import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Package, Shield, CreditCard, ArrowRight, TrendingUp, CheckCircle, Clock, FolderOpen, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const STATUS_CONFIG = {
  new: { label: "New Enquiry", color: "text-blue-600 bg-blue-50" },
  in_progress: { label: "In Progress", color: "text-amber-600 bg-amber-50" },
  awaiting_payment: { label: "Awaiting Payment", color: "text-yellow-600 bg-yellow-50" },
  paid: { label: "Paid", color: "text-emerald-600 bg-emerald-50" },
  completed: { label: "Completed", color: "text-harvest bg-harvest/10" },
  cancelled: { label: "Cancelled", color: "text-slate-600 bg-slate-100" },
};

export default function PortalOverview() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Enquiry.filter({ email: user.email }),
      base44.entities.Subscription.filter({ email: user.email }),
    ]).then(([enq, subs]) => {
      setEnquiries(enq || []);
      setSubscriptions(subs || []);
    }).finally(() => setLoading(false));
  }, [user?.email]);

  const activeEnquiries = enquiries.filter(e => e.status !== "cancelled" && e.status !== "completed");
  const activeSubs = subscriptions.filter(s => s.status === "active");

  const STAT_CARDS = [
    { label: "Active Enquiries", value: activeEnquiries.length, icon: FileText, color: "bg-blue-50 text-blue-600", href: "/client-portal/enquiries" },
    { label: "Subscriptions",    value: activeSubs.length,      icon: Package, color: "bg-emerald-50 text-emerald-600", href: "/client-portal/subscriptions" },
    { label: "NDIS Progress",    value: enquiries.length ? "Active" : "Not Started", icon: Shield, color: "bg-amber-50 text-amber-600", href: "/client-portal/ndis-progress" },
    { label: "Invoices Due",     value: 0,                       icon: CreditCard, color: "bg-purple-50 text-purple-600", href: "/client-portal/invoices" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-ink to-slate-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-harvest/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">Good to see you back</p>
          <h1 className="font-display font-bold text-3xl mb-2">
            Welcome, {user?.full_name?.split(" ")[0] || "Client"} 👋
          </h1>
          <p className="text-white/70 text-sm max-w-lg">
            Your SOL Business Consultant client portal. Track enquiries, manage documents, and monitor your NDIS registration journey.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <Link key={s.label} to={s.href}>
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-ink">{loading ? "—" : s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              <ArrowRight className="w-3 h-3 text-slate-300 mt-2 group-hover:text-harvest transition-colors" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-ink">Recent Enquiries</h2>
          <Link to="/client-portal/enquiries" className="text-xs text-harvest font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ) : enquiries.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm mb-3">No enquiries yet. Start your NDIS journey today.</p>
            <Link to="/client-portal/onboarding">
              <Button size="sm" className="bg-harvest text-white gap-2">Start NDIS Enquiry <ArrowRight className="w-3 h-3" /></Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {enquiries.slice(0, 3).map(enq => {
              const cfg = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
              return (
                <Card key={enq.id} className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-9 h-9 rounded-lg bg-harvest/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-harvest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">{enq.company_name || "Enquiry"}</p>
                    <p className="text-xs text-slate-400">{enq.created_date ? new Date(enq.created_date).toLocaleDateString() : ""}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-display font-semibold text-lg text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Enquiry",     href: "/client-portal/onboarding",  icon: ClipboardList },
            { label: "NDIS Progress",   href: "/client-portal/ndis-progress", icon: Shield },
            { label: "Upload Docs",     href: "/client-portal/documents",    icon: FileText },
            { label: "View Invoices",   href: "/client-portal/invoices",     icon: CreditCard },
          ].map(q => (
            <Link key={q.label} to={q.href}>
              <Card className="p-4 flex flex-col items-center gap-2 text-center hover:shadow-md hover:border-harvest/30 transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-harvest/10 group-hover:bg-harvest/20 flex items-center justify-center transition-colors">
                  <q.icon className="w-4 h-4 text-harvest" />
                </div>
                <p className="text-xs font-semibold text-ink">{q.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}