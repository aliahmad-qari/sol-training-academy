import React, { useState } from "react";
import { HelpCircle, Mail, Phone, MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQS = [
  { q: "How long does NDIS registration take?", a: "NDIS registration typically takes 3–12 months depending on the complexity of your registration group and the readiness of your documentation." },
  { q: "What documents do I need to upload?", a: "You'll need policies, procedures, incident management evidence, worker screening clearances, and insurance certificates. Our team will guide you through each requirement." },
  { q: "When will my consultant contact me?", a: "A consultant will reach out within 1–2 business days of submitting your enquiry. You can also email us directly for urgent queries." },
  { q: "Can I upgrade my service package?", a: "Yes, you can upgrade your package at any time by contacting our team or submitting a new enquiry. Pricing is pro-rated." },
  { q: "How do I track my NDIS registration progress?", a: "Use the 'NDIS Progress' tab in your portal sidebar. This shows your real-time registration pipeline updated by your assigned consultant." },
];

export default function PortalSupport() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Support Centre</h1>
        <p className="text-slate-500 text-sm">Get help with your enquiries, documents, and services.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail,         label: "Email Us",       value: "info@solbusinessconsultant.com.au", href: "mailto:info@solbusinessconsultant.com.au", color: "bg-blue-50 text-blue-600" },
          { icon: Phone,        label: "Call Us",         value: "+61 (0) 400 000 000",               href: "tel:+61400000000",                         color: "bg-emerald-50 text-emerald-600" },
          { icon: Clock,        label: "Business Hours",  value: "Mon–Fri, 9am–5pm AEST",             href: null,                                       color: "bg-amber-50 text-amber-600" },
        ].map(c => (
          <Card key={c.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            {c.href ? (
              <a href={c.href} className="text-sm font-semibold text-ink hover:text-harvest transition-colors">{c.value}</a>
            ) : (
              <p className="text-sm font-semibold text-ink">{c.value}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Send a Message */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg text-ink mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-harvest" /> Send a Message
        </h2>
        <form
          onSubmit={e => { e.preventDefault(); window.location.href = "mailto:info@solbusinessconsultant.com.au"; }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-harvest/30" placeholder="What's this about?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-harvest/30 bg-white">
                <option>General Enquiry</option>
                <option>NDIS Registration</option>
                <option>Document Review</option>
                <option>Billing</option>
                <option>Technical Issue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-harvest/30 resize-none" rows={4} placeholder="Describe your issue or question..." />
          </div>
          <Button type="submit" className="bg-harvest text-white gap-2">Send Message</Button>
        </form>
      </Card>

      {/* FAQs */}
      <div>
        <h2 className="font-semibold text-lg text-ink mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-harvest" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-ink">{faq.q}</span>
                {openIdx === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openIdx === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}