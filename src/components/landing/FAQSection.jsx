import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does NDIS registration take?",
    a: "Timeframes vary depending on provider scope, audit pathway, documentation readiness, and external availability. We help you prepare the documentation, coaching, and audit-readiness steps as efficiently as possible.",
  },
  {
    q: "Do I need to be a registered NDIS provider?",
    a: "If you support NDIA-managed participants or provide high-risk supports — yes. We can assess your specific situation during a free consultation and advise on the best path forward.",
  },
  {
    q: "What's included in the policy pack?",
    a: "40+ documents covering complaints management, incident reporting, privacy, service agreements, risk registers, and more — all customised to your specific registration groups.",
  },
  {
    q: "How does Easy Compliance work?",
    a: "Easy Compliance is our integrated compliance support platform. We configure it for your operations, import your documents, train your team, and provide AI-assisted validation to support ongoing audit readiness.",
  },
  {
    q: "What does onboarding cost for Easy Compliance?",
    a: "Onboarding costs depend on the size and complexity of your organisation. Book a free consultation and we'll provide a transparent, no-obligation quote tailored to your needs.",
  },
  {
    q: "Can I get help with just one service?",
    a: "Absolutely. Our services are modular — choose exactly what you need, whether it's NDIS registration, bookkeeping, payroll, compliance, or any other service.",
  },
  {
    q: "Do you only work with established companies?",
    a: "Both startups and established businesses. We offer adaptable support based on your stage and objectives, from initial company registration to scaling operations.",
  },
  {
    q: "How are your consulting services delivered?",
    a: "We provide services via a mix of virtual meetings, in-person sessions where needed, cloud-based platforms, and ongoing digital support — optimised for your convenience.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
            FAQ
          </span>
          <h2 className="font-display font-bold text-4xl text-ink">
            Frequently Asked Questions
          </h2>
          <div className="w-20 h-[2px] bg-harvest mt-6 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/50 rounded-xl px-6 bg-white data-[state=open]:border-harvest/30 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-ink text-[15px] hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate_mist text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}