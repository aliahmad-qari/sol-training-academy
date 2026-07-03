import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Legal</span>
            <h1 className="font-display font-bold text-4xl text-ink mb-3">Refund & Cancellation Policy</h1>
            <p className="text-slate_mist">SOL Business Consultant Pty Ltd — ABN 20 662 022 522</p>
            <p className="text-slate_mist text-sm mt-1">In accordance with the Australian Consumer Law (ACL)</p>
          </div>

          <div className="space-y-5">
            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Refund Eligibility</h2>
              <div className="space-y-2 text-sm text-slate_mist">
                <p><strong className="text-harvest">✅ REFUND ELIGIBLE:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Service was NOT delivered as promised (major failure)</li>
                  <li>• Deliverables do NOT meet agreed specifications</li>
                  <li>• Payment was charged in error or duplicated</li>
                  <li>• Service was cancelled by us without cause</li>
                </ul>
                <p className="mt-3"><strong className="text-harvest">❌ NON-REFUNDABLE (Digital Goods):</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• NDIS training materials (once access granted)</li>
                  <li>• Custom NDIS documents (once generated)</li>
                  <li>• Software systems (once deployed)</li>
                  <li>• Website hosting (once activated)</li>
                  <li>• Consultation services (once delivered)</li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Alternatives to Refunds</h2>
              <p className="text-sm text-slate_mist">If you've changed your mind, we offer:</p>
              <ul className="space-y-1 text-sm text-slate_mist ml-4">
                <li>• <strong>Service Credit:</strong> Apply toward future services (valid 12 months)</li>
                <li>• <strong>Modified Deliverables:</strong> Up to 2 free revision rounds</li>
                <li>• <strong>Deferred Delivery:</strong> Postpone service up to 12 months</li>
                <li>• <strong>Partial Refund:</strong> For bundled services not yet commenced</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-harvest" />
                <h2 className="font-display font-bold text-lg text-ink m-0">Service-Specific Refunds</h2>
              </div>
              <div className="space-y-3 text-sm text-slate_mist">
                <div className="p-3 bg-chalk rounded-lg">
                  <p className="font-semibold text-ink">NDIS Registration (Starter $1,800 | Ultimate $3,500)</p>
                  <p>Refund window: 14 days before documents sent</p>
                </div>
                <div className="p-3 bg-chalk rounded-lg">
                  <p className="font-semibold text-ink">Support Coordination Training ($1,200–$3,800)</p>
                  <p>Refund window: 7 days before course access granted</p>
                </div>
                <div className="p-3 bg-chalk rounded-lg">
                  <p className="font-semibold text-ink">Website Development ($1,500–$3,500)</p>
                  <p>100% refund before launch | 50% after design approval | Non-refundable after launch</p>
                </div>
                <div className="p-3 bg-chalk rounded-lg">
                  <p className="font-semibold text-ink">Monthly Bookkeeping ($350)</p>
                  <p>100% refund within 30 days of first payment; then non-refundable per month</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Refund Processing</h2>
              <p className="text-sm text-slate_mist">Timeline: 7–10 business days (Stripe) | 5–7 business days (Bank transfer)</p>
              <p className="text-sm text-slate_mist">Once approved, we'll email confirmation and you can track progress via your bank statement.</p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Cancellation Procedures</h2>
              <div className="space-y-2 text-sm text-slate_mist">
                <p><strong>How to Cancel:</strong> Email info@solbusinessconsultant.com.au with your name, order ID, and reason</p>
                <p><strong>Notice Required:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• One-time services: Immediate</li>
                  <li>• Monthly subscriptions: 7 days</li>
                  <li>• Annual subscriptions: 14 days</li>
                </ul>
                <p><strong>Work in Progress:</strong> Refund for work not yet commenced; charges apply for completed work</p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Guaranteed Remedies (Service Failures)</h2>
              <ul className="space-y-1 text-sm text-slate_mist ml-4">
                <li>• <strong>5+ days late:</strong> 5% service credit</li>
                <li>• <strong>10+ days late:</strong> 10% service credit</li>
                <li>• <strong>20+ days late:</strong> Full refund or 25% credit</li>
                <li>• <strong>Quality failures:</strong> 2 free revisions; 25% credit if no improvement</li>
                <li>• <strong>Duplicate charge:</strong> Immediate full refund within 48 hours</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Australian Consumer Law Rights</h2>
              <p className="text-sm text-slate_mist">You have consumer guarantees including: services provided with due care and skill, goods of acceptable quality, and goods matching description.</p>
              <p className="text-sm text-slate_mist"><strong>Digital Goods Exception:</strong> Once accessed, digital goods cannot be returned for refund, but you retain remedies if goods are faulty or unfit for purpose.</p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Disputes & Escalation</h2>
              <p className="text-sm text-slate_mist"><strong>Step 1:</strong> Contact us within 30 days: info@solbusinessconsultant.com.au</p>
              <p className="text-sm text-slate_mist"><strong>Step 2:</strong> We respond within 10 business days</p>
              <p className="text-sm text-slate_mist"><strong>Step 3:</strong> Escalate to Consumer Affairs Victoria (1300 558 181) or ASIC if unresolved</p>
            </section>

            <section className="bg-harvest/5 border border-harvest/20 rounded-2xl p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-2">How to Request a Refund</h2>
              <div className="text-sm text-slate_mist space-y-1">
                <p>📧 <a href="mailto:info@solbusinessconsultant.com.au" className="text-harvest hover:underline">info@solbusinessconsultant.com.au</a></p>
                <p>📞 <a href="tel:+61460003494" className="text-harvest hover:underline">+61 460 003 494</a></p>
                <p>📍 Glenroy VIC 3046, Australia</p>
                <p>ABN: 20 662 022 522</p>
              </div>
              <p className="text-xs text-slate_mist mt-3">Response time: 2 business days. This policy does not limit your rights under Australian Consumer Law.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}