import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { format } from "date-fns";
import { Building2, Tag, DollarSign, Users, ChevronRight, RefreshCw, Inbox } from "lucide-react";

const STATUS_CONFIG = {
  new:              { label: "New",              dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress:      { label: "In Progress",      dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  awaiting_payment: { label: "Awaiting Payment", dot: "bg-orange-500",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
  paid:             { label: "Paid",             dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed:        { label: "Completed",        dot: "bg-green-600",   badge: "bg-green-50 text-green-700 border-green-200" },
  cancelled:        { label: "Cancelled",        dot: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200" },
};

function Pill({ children, className }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

export default function NDISIntakeSummary({ setActiveTab }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // Support tickets with service_type ndis_registration, or use support-tickets endpoint
    apiClient.get('/support-tickets?service_type=ndis_registration&limit=50')
      .then(res => setItems(res.data?.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const newItems = items.filter(e => e.status === "new");
  const recentOther = items.filter(e => e.status !== "new" && e.status !== "cancelled").slice(0, 3);
  const displayList = [...newItems, ...recentOther].slice(0, 8);

  const totalNew = newItems.length;
  const totalInProgress = items.filter(e => e.status === "in_progress" || e.status === "awaiting_payment").length;
  const totalCompleted = items.filter(e => e.status === "paid" || e.status === "completed").length;

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-semibold text-ink">NDIS Intake Submissions</h3>
          {totalNew > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {totalNew} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setActiveTab("ndis_intake")}
            className="text-xs text-harvest font-medium hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="px-5 py-3 border-b border-slate-50 flex gap-3 flex-wrap">
        <Pill className="bg-blue-50 text-blue-700 border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {totalNew} Pending Review
        </Pill>
        <Pill className="bg-amber-50 text-amber-700 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {totalInProgress} In Progress
        </Pill>
        <Pill className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {totalCompleted} Completed
        </Pill>
      </div>

      {/* List */}
      {loading ? (
        <div className="divide-y divide-border/20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-48" />
              </div>
              <div className="h-5 w-14 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-12 text-center">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No intake submissions yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {displayList.map(e => {
            const cfg = STATUS_CONFIG[e.status] || STATUS_CONFIG.new;
            const isNew = e.status === "new";
            return (
              <div
                key={e.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors ${isNew ? "bg-blue-50/30" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  isNew ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {(e.full_name || "?")[0].toUpperCase()}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{e.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {e.company_name && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <Building2 className="w-2.5 h-2.5" /> {e.company_name}
                      </span>
                    )}
                    {e.provider_focus && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> {e.provider_focus}
                      </span>
                    )}
                    {e.selected_services?.length > 0 && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> {e.selected_services.length} service{e.selected_services.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Package + value */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                  {e.selected_package && (
                    <span className="text-[11px] bg-harvest/10 text-harvest border border-harvest/20 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                      {e.selected_package}
                    </span>
                  )}
                  {e.package_price && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-0.5 font-medium">
                      <DollarSign className="w-2.5 h-2.5" />{e.package_price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Status + date */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {e.created_date ? format(new Date(e.created_date), "dd MMM yy") : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}