import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Eye, Calendar, DollarSign, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const STATUS_CONFIG = {
  trial: { label: "Trial", color: "text-blue-700 bg-blue-50 border-blue-200" },
  active: { label: "Active", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  paused: { label: "Paused", color: "text-amber-700 bg-amber-50 border-amber-200" },
  cancelled: { label: "Cancelled", color: "text-slate-600 bg-slate-50 border-slate-200" },
  expired: { label: "Expired", color: "text-red-700 bg-red-50 border-red-200" },
};

export default function PortalSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Subscription.filter({ email: user.email })
      .then(data => setSubscriptions(data || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const query = search.trim().toLowerCase();
  const filteredSubscriptions = query
    ? subscriptions.filter(sub => {
        const statusLabel = STATUS_CONFIG[sub.status]?.label || sub.status;
        return [sub.business_name, sub.plan, sub.billing_cycle, statusLabel, sub.notes]
          .some(value => String(value || "").toLowerCase().includes(query));
      })
    : subscriptions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink mb-1">Marketing Subscriptions</h1>
          <p className="text-slate-500 text-sm">Your active digital marketing packages.</p>
        </div>
        <Link to="/marketing-packages">
          <Button variant="outline" className="gap-2 text-sm">Explore Packages <ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </div>

      {!loading && subscriptions.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-harvest/25 focus:border-harvest"
          />
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-ink mb-2">No active subscriptions</h3>
          <p className="text-slate-500 text-sm mb-5">Grow your NDIS business with our digital marketing packages.</p>
          <Link to="/marketing-packages">
            <Button className="bg-harvest text-white gap-2">View Packages <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </Card>
      ) : filteredSubscriptions.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No subscriptions match your search.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSubscriptions.map(sub => {
            const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
            return (
              <Card key={sub.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-harvest" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm">{sub.business_name}</h3>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">{sub.plan} Plan</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                </div>

                <div className="space-y-2 text-sm">
                  {sub.billing_cycle && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs">{sub.billing_cycle === "monthly" ? "Monthly" : "Annual"} billing</span>
                    </div>
                  )}
                  {sub.next_billing && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs">Next: {new Date(sub.next_billing).toLocaleDateString()}</span>
                    </div>
                  )}
                  {sub.mrr && (
                    <div className="flex items-center gap-2 text-harvest font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-sm">${sub.mrr.toFixed(2)}/mo</span>
                    </div>
                  )}
                </div>

                <Link to="/marketing-packages" className="mt-4 block">
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
