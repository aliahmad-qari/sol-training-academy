import React, { useState, useEffect } from "react";
import { FileText, Package, CheckCircle, Clock, AlertCircle, Download, Eye, ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import ProjectsDashboard from "@/components/client/ProjectsDashboard";
import DocumentUpload from "@/components/client/DocumentUpload";
import DocumentTracker from "@/components/client/DocumentTracker";
import InvoiceHistory from "@/components/client/InvoiceHistory";
import ApplicationTracker from "@/components/client/ApplicationTracker";
import NDISTemplatesLibrary from "@/components/client/NDISTemplatesLibrary";

const STATUS_CONFIG = {
  new: { label: "New Enquiry", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "📝" },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚙️" },
  awaiting_payment: { label: "Awaiting Payment", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "💳" },
  paid: { label: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✓" },
  completed: { label: "Completed", color: "bg-harvest/10 text-harvest border-harvest/30", icon: "🎉" },
  cancelled: { label: "Cancelled", color: "bg-slate-50 text-slate-700 border-slate-200", icon: "✕" },
};

const SUBSCRIPTION_STATUS = {
  trial: { label: "Trial", color: "bg-blue-50 text-blue-700" },
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700" },
  paused: { label: "Paused", color: "bg-amber-50 text-amber-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-50 text-slate-700" },
  expired: { label: "Expired", color: "bg-red-50 text-red-700" },
};

export default function ClientPortal() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.email) return;
        
        const enq = await base44.entities.Enquiry.filter({ email: user.email });
        const subs = await base44.entities.Subscription.filter({ email: user.email });
        
        setEnquiries(enq || []);
        setSubscriptions(subs || []);
      } catch (error) {
        toast.error("Failed to load portal data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-harvest rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display font-bold text-4xl text-ink mb-2">Client Portal</h1>
          <p className="text-slate-500 text-lg">Manage your consultancy status, documents, and marketing packages</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-harvest to-amber-600 rounded-2xl p-8 mb-10 text-white">
          <h2 className="font-display font-bold text-2xl mb-2">Welcome, {user?.full_name || "Client"}!</h2>
          <p className="text-white/80">You have {enquiries.length} active enquir{enquiries.length !== 1 ? "ies" : "y"} and {subscriptions.length} marketing subscription{subscriptions.length !== 1 ? "s" : ""}.</p>
        </div>

        {/* NDIS Application Progress Tracker — always visible */}
        <div className="mb-8">
          <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-harvest" /> NDIS Registration Progress
          </h3>
          <ApplicationTracker enquiries={enquiries} />
        </div>

        {/* Active Projects Dashboard */}
        <div className="mb-10">
          <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-harvest" /> Active NDIS Projects
          </h3>
          <ProjectsDashboard enquiries={enquiries} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Consultancy Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultancy Enquiries */}
            <div>
              <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-harvest" /> Consultancy Enquiries
              </h3>
              {enquiries.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No active consultancy enquiries yet.</p>
                  <Link to="/get-started">
                    <Button variant="outline" className="gap-2">
                      Start New Enquiry <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {enquiries.map(enq => {
                    const statusCfg = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                    return (
                      <Card key={enq.id} className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-display font-semibold text-ink mb-1">
                              {enq.company_name || "Untitled Enquiry"}
                            </h4>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <span>{statusCfg.icon}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusCfg.color}`}>
                                {statusCfg.label}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-2">
                              {enq.created_date ? new Date(enq.created_date).toLocaleDateString() : "—"}
                            </p>
                            {enq.service_type && (
                              <span className="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                {enq.service_type.replace("_", " ").toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {enq.message && (
                          <p className="text-sm text-slate-600 mb-3 p-3 bg-slate-50 rounded-lg">{enq.message}</p>
                        )}
                        {enq.package_price && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-sm text-slate-600">Estimated Cost:</span>
                            <span className="font-display font-bold text-harvest">${enq.package_price.toLocaleString()}</span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Document Upload & Tracking */}
            <div>
              <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-harvest" /> Compliance Documents
              </h3>
              <div className="space-y-8">
                {/* Upload Section */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Submit New Documents</p>
                  <DocumentUpload enquiryId={enquiries[0]?.id} onUploadSuccess={() => {}} />
                </div>

                {/* Tracking Section */}
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Document Status & History</p>
                  <DocumentTracker enquiryId={enquiries[0]?.id} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Marketing Packages & Invoices */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-harvest" /> Marketing Subscriptions
              </h3>
              {subscriptions.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No active marketing packages.</p>
                  <Link to="/marketing-packages">
                    <Button variant="outline" size="sm" className="gap-2 w-full">
                      View Packages <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map(sub => {
                    const subStatusCfg = SUBSCRIPTION_STATUS[sub.status] || SUBSCRIPTION_STATUS.active;
                    return (
                      <Card key={sub.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-semibold text-sm text-ink truncate">
                              {sub.business_name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Plan: <span className="font-medium capitalize text-ink">{sub.plan}</span>
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${subStatusCfg.color}`}>
                            {subStatusCfg.label}
                          </span>
                        </div>
                        
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          {sub.billing_cycle && (
                            <p className="text-xs text-slate-600">
                              <span className="text-slate-500">Billing:</span> {sub.billing_cycle === "monthly" ? "Monthly" : "Annual"}
                            </p>
                          )}
                          {sub.next_billing && (
                            <p className="text-xs text-slate-600">
                              <span className="text-slate-500">Next Billing:</span> {new Date(sub.next_billing).toLocaleDateString()}
                            </p>
                          )}
                          {sub.mrr && (
                            <p className="text-xs text-slate-600">
                              <span className="text-slate-500">Monthly Value:</span> ${sub.mrr.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <Link to="/marketing-packages">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3 text-xs h-8 gap-1"
                          >
                            <Eye className="w-3 h-3" /> View Details
                          </Button>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <Card className="p-5 bg-harvest/5 border-harvest/30">
              <h4 className="font-display font-semibold text-sm text-ink mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Link to="/get-started" className="block">
                  <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs h-8">
                    <ArrowRight className="w-3 h-3" /> New Enquiry
                  </Button>
                </Link>
                <Link to="/marketing-packages" className="block">
                  <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs h-8">
                    <Package className="w-3 h-3" /> Explore Packages
                  </Button>
                </Link>
                <a href="mailto:info@solbusinessconsultant.com.au" className="block">
                  <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs h-8">
                    <AlertCircle className="w-3 h-3" /> Contact Support
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* NDIS Templates Library */}
        <div className="mt-10">
          <NDISTemplatesLibrary />
        </div>

        {/* Invoices & Payment History */}
        <div className="mt-10">
          <h3 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-harvest" /> Invoices & Payment History
          </h3>
          <InvoiceHistory userId={user?.id} />
        </div>
      </div>
    </div>
  );
}