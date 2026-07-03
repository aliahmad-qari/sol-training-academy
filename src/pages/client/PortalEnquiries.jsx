import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const STATUS_CONFIG = {
  new: { label: "New",              color: "text-blue-700 bg-blue-50 border-blue-200" },
  in_progress: { label: "In Progress", color: "text-amber-700 bg-amber-50 border-amber-200" },
  awaiting_payment: { label: "Awaiting Payment", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  paid: { label: "Paid",            color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  completed: { label: "Completed",  color: "text-harvest bg-harvest/10 border-harvest/30" },
  cancelled: { label: "Cancelled",  color: "text-slate-600 bg-slate-50 border-slate-200" },
};

export default function PortalEnquiries() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Enquiry.filter({ email: user.email })
      .then(data => setEnquiries(data || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink mb-1">Consultancy Enquiries</h1>
          <p className="text-slate-500 text-sm">All your service enquiries and their current status.</p>
        </div>
        <Link to="/get-started">
          <Button className="bg-harvest text-white gap-2 text-sm">
            + New Enquiry
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : enquiries.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-ink mb-2">No enquiries yet</h3>
          <p className="text-slate-500 text-sm mb-5">Get started with your NDIS registration or business services.</p>
          <Link to="/get-started">
            <Button className="bg-harvest text-white gap-2">Start New Enquiry <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enq => {
            const cfg = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
            return (
              <Card key={enq.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-harvest/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-harvest" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-ink">{enq.company_name || "Enquiry"}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted {enq.created_date ? new Date(enq.created_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                  {enq.service_type && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Service</p>
                      <p className="font-medium text-ink text-xs capitalize">{enq.service_type.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {enq.contact_name && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Contact</p>
                      <p className="font-medium text-ink text-xs">{enq.contact_name}</p>
                    </div>
                  )}
                  {enq.package_price && (
                    <div className="bg-harvest/5 rounded-lg px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Estimated Cost</p>
                      <p className="font-bold text-harvest text-sm">${enq.package_price.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {enq.message && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3 leading-relaxed">{enq.message}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}