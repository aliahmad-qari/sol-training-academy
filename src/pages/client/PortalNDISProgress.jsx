import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ApplicationTracker from "@/components/client/ApplicationTracker";
import NDISProgressBar from "@/components/client/NDISProgressBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";

export default function PortalNDISProgress() {
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
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">NDIS Registration Progress</h1>
        <p className="text-slate-500 text-sm">Track your NDIS registration journey in real time.</p>
      </div>

      {loading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : (
        <NDISProgressBar enquiries={enquiries} />
      )}

      {!loading && (
        <ApplicationTracker enquiries={enquiries} />
      )}

      {!loading && enquiries.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">Submit an NDIS enquiry to activate your progress tracker.</p>
          <Link to="/get-started">
            <Button className="bg-harvest text-white gap-2">
              Start Enquiry <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Info boxes */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {[
          { title: "Initial Assessment", desc: "We review your organisation against the NDIS Practice Standards." },
          { title: "Document Preparation", desc: "Policies, procedures, and evidence packages are prepared." },
          { title: "Audit & Registration", desc: "Lodgement to NDIS Commission and audit coordination." },
        ].map(info => (
          <Card key={info.title} className="p-5 border-l-4 border-l-harvest">
            <h4 className="font-semibold text-sm text-ink mb-1">{info.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{info.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}