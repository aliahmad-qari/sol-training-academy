import React from "react";
import { motion } from "framer-motion";
import { Eye, Volume2, Type, Contrast, CheckCircle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const WCAG_ITEMS = [
  { criterion: "1.1.1 Non-text Content", level: "A", status: "compliant", note: "All images include descriptive alt text" },
  { criterion: "1.3.1 Info and Relationships", level: "A", status: "compliant", note: "Semantic HTML structure used throughout" },
  { criterion: "1.4.3 Contrast (Minimum)", level: "AA", status: "compliant", note: "4.5:1 contrast ratio maintained" },
  { criterion: "1.4.4 Resize Text", level: "AA", status: "compliant", note: "Text scales up to 200% without loss of functionality" },
  { criterion: "2.1.1 Keyboard", level: "A", status: "compliant", note: "All functionality accessible via keyboard" },
  { criterion: "2.4.1 Bypass Blocks", level: "A", status: "partial", note: "Skip navigation links in progress" },
  { criterion: "2.4.2 Page Titled", level: "A", status: "compliant", note: "All pages have descriptive titles" },
  { criterion: "3.1.1 Language of Page", level: "A", status: "compliant", note: "HTML lang attribute set to en-AU" },
  { criterion: "4.1.2 Name, Role, Value", level: "A", status: "compliant", note: "Interactive elements use ARIA labels" },
];

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">Accessibility</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-4">Accessibility Statement</h1>
            <p className="text-lg text-slate_mist leading-relaxed">
              SOL Business Consultant is committed to ensuring digital accessibility for people with disabilities. We continuously improve the user experience for everyone and apply relevant accessibility standards.
            </p>
          </motion.div>

          <div className="space-y-8 text-sm text-slate_mist leading-relaxed">

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Our Commitment</h2>
              <p>We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> as published by the World Wide Web Consortium (W3C). These guidelines explain how to make web content more accessible to people with disabilities, and to all users regardless of device.</p>
              <p className="mt-2">As a business providing services to NDIS participants, families, and carers, we recognise that accessible design is not just a legal requirement — it is fundamental to serving our community.</p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-4">Accessibility Features</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Type, title: "Adjustable Text Size", desc: "Use your browser's zoom (Ctrl/Cmd + or -) to increase text size up to 200%" },
                  { icon: Contrast, title: "High Contrast Support", desc: "The site supports operating system high-contrast mode settings" },
                  { icon: Volume2, title: "Screen Reader Compatible", desc: "Semantic HTML and ARIA labels support screen readers such as NVDA, JAWS, and VoiceOver" },
                  { icon: Eye, title: "Keyboard Navigation", desc: "All interactive elements are accessible via Tab, Enter, and arrow keys" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-chalk rounded-xl p-5">
                    <Icon className="w-5 h-5 text-harvest mb-2" />
                    <h3 className="font-display font-semibold text-ink text-sm mb-1">{title}</h3>
                    <p className="text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-4">WCAG 2.1 Conformance Status</h2>
              <div className="space-y-2">
                {WCAG_ITEMS.map(item => (
                  <div key={item.criterion} className="flex items-center justify-between bg-white border border-border/60 rounded-lg p-3 gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${item.status === "compliant" ? "text-green-500" : "text-amber-400"}`} />
                      <span className="font-medium text-ink text-xs truncate">{item.criterion}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.level === "A" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>{item.level}</span>
                    <span className="text-xs text-slate_mist hidden sm:block flex-shrink-0 max-w-[200px] truncate">{item.note}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate_mist mt-3 italic">Partial = in progress. Last reviewed: June 2026.</p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Known Limitations</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Some older PDF documents may not be fully accessible. We are working to remediate these.</li>
                <li>Third-party embedded content (e.g. Stripe payment pages) is outside our direct control.</li>
                <li>Skip-to-content navigation links are being implemented.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Feedback & Contact</h2>
              <p>If you experience any barriers accessing our content, or if you require information in an alternative format, please contact us:</p>
              <div className="bg-chalk rounded-xl p-5 mt-3 space-y-1">
                <p><strong>Email:</strong> <a href="mailto:info@solbusinessconsultant.com.au" className="text-harvest hover:underline">info@solbusinessconsultant.com.au</a></p>
                <p><strong>Phone:</strong> <a href="tel:+61460003494" className="text-harvest hover:underline">+61 460 003 494</a></p>
                <p><strong>Post:</strong> SOL Business Consultant, Glenroy VIC 3046</p>
              </div>
              <p className="mt-3">We aim to respond to accessibility feedback within 5 business days.</p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Formal Complaints</h2>
              <p>If you are not satisfied with our response, you may contact the <strong>Australian Human Rights Commission</strong>:</p>
              <div className="bg-chalk rounded-xl p-4 mt-2 text-xs">
                <p><strong>Website:</strong> <a href="https://humanrights.gov.au" target="_blank" rel="noopener noreferrer" className="text-harvest hover:underline">humanrights.gov.au</a></p>
                <p><strong>Phone:</strong> 1300 656 419</p>
              </div>
            </section>

            <p className="text-xs text-slate_mist border-t border-border pt-6">
              This statement was last reviewed on 3 June 2026 and applies to the website at <a href="https://www.solbusinessconsultant.com.au" className="text-harvest hover:underline">www.solbusinessconsultant.com.au</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}