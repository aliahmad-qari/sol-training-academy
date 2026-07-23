import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Who is this training designed for?",
    a: "This curriculum is designed for Support Coordinators, Specialist Support Coordinators, NDIS providers onboarding new staff, and RTOs seeking a comprehensive, audit-ready training package. It is also suitable for plan managers or allied health professionals who work alongside Support Coordinators.",
  },
  {
    q: "What are the 12 modules and how long does each take?",
    a: "The 12 modules cover: (1) Introduction to the NDIS, (2) Role & Responsibilities of a Support Coordinator, (3) NDIS Practice Standards & Code of Conduct, (4) Plan Implementation & Budget Management, (5) Goal Setting & Participant-Centred Practice, (6) Stakeholder & Provider Coordination, (7) Documentation & Reporting Requirements, (8) Risk Management & Incident Response, (9) Complex Needs & Specialist Support Coordination, (10) Cultural Safety & Diversity, (11) Workforce Development & Self-Care, and (12) Audit Readiness & Continuous Improvement. Each module is designed for approximately 2–3 hours of self-paced learning, totalling 24–36 hours across the full curriculum.",
  },
  {
    q: "Is the curriculum aligned to the NDIS Practice Standards?",
    a: "Yes. Every module is fully mapped to the NDIS Practice Standards and the NDIS Code of Conduct. The curriculum also references the NDIS Quality and Safeguards Commission requirements, making it suitable for providers preparing for verification or certification audits.",
  },
  {
    q: "Do I receive a certificate upon completion?",
    a: "Yes. Individual learners receive a SOL Certificate of Completion upon finishing all 12 modules and assessments. Team and Enterprise packages include branded completion certificate templates your organisation can issue to staff under your own branding. This is a practical completion certificate, not a nationally accredited qualification unless delivered by an authorised RTO under its own scope.",
  },
  {
    q: "Can we white-label the content for our RTO or organisation?",
    a: "Absolutely. The Team package includes co-branded materials using your organisation's logo and details. The Enterprise / RTO package includes full white-label rights — meaning all content (workbooks, slide decks, video scripts, assessments) is delivered under your brand with no SOL branding, including LMS integration support.",
  },
  {
    q: "What format are the training materials delivered in?",
    a: "Materials are delivered as editable Word documents, PowerPoint slide decks (.pptx), PDF workbooks, and plain-text video scripts. The 1,500+ quiz question bank is provided in a structured format compatible with most LMS platforms (including Moodle, TalentLMS, and LearnDash).",
  },
  {
    q: "How soon will I receive access to the materials after payment?",
    a: "For Individual and Team packages, materials are delivered to your email inbox within 1 business day of payment confirmation. Enterprise packages involve a brief onboarding call to apply your branding before delivery, typically within 3–5 business days.",
  },
  {
    q: "Can I purchase additional modules or update the curriculum later?",
    a: "All packages include ongoing updates to the curriculum at no extra cost for the duration of your access period. If you require custom modules tailored to a specific disability support type or organisational workflow, this can be scoped as part of the Enterprise package or as an add-on.",
  },
  {
    q: "Is there live support or mentoring available?",
    a: "The Team package includes 2 live Q&A sessions with a SOL trainer. The Enterprise package includes a train-the-trainer program and unlimited email support during the initial rollout period. Individual learners have access to email support throughout their 6-month access period.",
  },
  {
    q: "What if I need a tax invoice or need to pay via EFT?",
    a: "We can issue a formal tax invoice for any package. If you prefer to pay via EFT (bank transfer) rather than online, please select the Enterprise / Custom package option in the intake form or contact us directly at info@solbusinessconsultant.com.au and we will arrange this for you.",
  },
];

export default function SupportCoordinationFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">
            FAQ
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">
            Common Questions About the Training
          </h2>
          <p className="text-slate_mist mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Everything you need to know before enrolling — from curriculum structure to delivery formats and certification.
          </p>
          <div className="w-16 h-[2px] bg-harvest mt-6 mx-auto" />
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={`rounded-xl border transition-all duration-300 ${
                openIndex === i
                  ? "border-harvest/40 bg-harvest/[0.03] shadow-sm"
                  : "border-border/60 bg-white hover:border-harvest/30"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
              >
                <span className={`font-display font-semibold text-sm md:text-base leading-snug transition-colors ${openIndex === i ? "text-harvest" : "text-ink"}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-slate_mist transition-transform duration-300 ${openIndex === i ? "rotate-180 text-harvest" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-slate_mist leading-relaxed border-t border-border/40 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center bg-chalk rounded-2xl p-8 border border-border/50"
        >
          <p className="text-ink font-display font-semibold text-lg mb-1">Still have questions?</p>
          <p className="text-slate_mist text-sm mb-4">Our team is happy to walk you through the right package for your organisation.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@solbusinessconsultant.com.au"
              className="inline-flex items-center justify-center gap-2 bg-harvest hover:bg-harvest/90 text-white font-display font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              ✉️ Email Us
            </a>
            <a href="tel:+61460003494"
              className="inline-flex items-center justify-center gap-2 border border-border text-ink hover:border-harvest hover:text-harvest font-display font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              📞 +61 460 003 494
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}