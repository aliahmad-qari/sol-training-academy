import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { FileText } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Agreement to Terms",
    content: [
      "By accessing and using this website and our services, you agree to be bound by these Terms & Conditions. SOL Business Consultant operates in full compliance with Australian Consumer Law, Privacy Act 1988 (Cth), NDIS Quality & Safeguards Commission, ATO regulations, and ASIC requirements.",
      "We are not affiliated with the NDIS Commission, ATO, ASIC, or any government body.",
    ],
  },
  {
    title: "2. Services Provided",
    content: [
      "We offer NDIS Registration Support, Support Coordination Training, Accountancy & Bookkeeping, Website Development, Software & Automation, and Business Services (company registration, loan support, admin services, outsourcing).",
      "All services are delivered in Australian dollars (AUD) + GST (10%), unless otherwise specified in your contract.",
    ],
  },
  {
    title: "3. Service Delivery Timeframes",
    content: [
      "NDIS Registration Package: 5–10 working days",
      "Support Coordination Training: 2–5 working days",
      "Website Development: 10–25 working days (depending on package)",
      "Software Automation: 7–21 working days",
      "Accountancy Setup: 3–5 working days",
      "Timeframes are estimates only. We will communicate delays promptly. Custom projects may require extended timelines.",
    ],
  },
  {
    title: "4. Pricing & Payment Terms",
    content: [
      "Prices: All prices in AUD, exclusive of GST (added at checkout)",
      "Payment Methods: Credit/Debit Card (Stripe), Bank Transfer (on request)",
      "Payment Processing: Secure through Stripe (PCI DSS compliant); card details not stored on our servers",
      "Invoicing: Upon payment, emailed immediately",
      "Due: Payment due upon receipt (Net 0 unless agreed)",
    ],
  },
  {
    title: "5. Payment Authorization & Liability",
    content: [
      "By submitting payment, you authorize us to charge your payment method for services selected.",
      "Stripe maintains responsibility for: card data encryption, fraud prevention, PCI-DSS compliance",
      "We are not liable for: declined transactions, Stripe errors, lost payments, bank fees, foreign exchange charges",
    ],
  },
  {
    title: "6. Intellectual Property & Deliverables",
    content: [
      "Upon full payment, you own all custom deliverables: NDIS documents, training materials, websites, software, reports.",
      "Pre-made templates and resources remain our intellectual property for your business use.",
      "You receive full ownership and source code access for websites and software projects.",
      "You may not resell, rebrand, or redistribute deliverables as your own.",
    ],
  },
  {
    title: "7. Refund & Cancellation Policy",
    content: [
      "Please refer to our full Refund & Cancellation Policy (see /refund-policy page).",
      "In summary: Refunds available for major service failures. Change-of-mind refunds not provided (digital goods exception).",
      "Alternatives offered: Service credits, revised deliverables, or deferred services.",
      "Cancellation requests: Submit within 14 days of purchase; refund eligibility depends on work commenced.",
    ],
  },
  {
    title: "8. Confidentiality & Data Handling",
    content: [
      "All client information is kept confidential and encrypted.",
      "Financial, business, and personal data accessed only by staff delivering your service.",
      "Information not shared with third parties (except payment processors and legally required agencies).",
      "Security measures: AES-256 encryption, TLS 1.2+ transmission, regular audits, access logging.",
    ],
  },
  {
    title: "9. Liability & Limitation",
    content: [
      "We use reasonable effort to deliver services on time and to agreed quality.",
      "We are not liable for: indirect/consequential damages, loss of profits, business interruption, third-party service failures.",
      "Maximum liability is limited to the amount you paid for the specific service.",
      "NDIS services: We provide guidance only; final compliance responsibility rests with your organization.",
      "Accounting services: Review deliverables with your accountant; tax laws change frequently.",
    ],
  },
  {
    title: "10. Compliance & Regulatory",
    content: [
      "Australian Consumer Law: Services provided with due care and skill; goods of acceptable quality.",
      "NDIS Compliance: Documents align with current practice standards; audit compliance rests with you.",
      "Tax & Accounting: Based on current law; external accountant review recommended.",
      "Website & Digital Services: Provided 'as is'; target 99% uptime but not guaranteed.",
    ],
  },
  {
    title: "11. Export Restrictions",
    content: [
      "Our digital services are delivered online. You are responsible for complying with local laws regarding software and digital imports.",
      "Time zone differences may affect support response times.",
    ],
  },
  {
    title: "12. Term & Termination",
    content: [
      "Service Term: One-time services from payment to delivery; subscriptions from start date until cancellation.",
      "Termination by Us: If payment not received (14 days notice), terms breach, or legal issues prevent delivery.",
      "Termination by You: Anytime with written notice; refund eligibility per Refund Policy.",
      "Upon Termination: You retain access to deliverables; account data deleted after 90 days.",
    ],
  },
  {
    title: "13. Dispute Resolution",
    content: [
      "Governing Law: Laws of Victoria, Australia.",
      "Complaints: Contact us within 30 days of issue (info@solbusinessconsultant.com.au) with order ID and complaint description.",
      "Initial Response: Within 10 business days.",
      "Escalation: If unresolved, escalate to Consumer Affairs Victoria (1300 558 181) or ASIC.",
    ],
  },
  {
    title: "14. General Provisions",
    content: [
      "Entire Agreement: These Terms, service contract, and Privacy Policy constitute the full agreement.",
      "Modifications: We may update Terms anytime; continued use = acceptance.",
      "Severability: Invalid provisions don't affect remaining terms.",
    ],
  },
  {
    title: "15. Contact Us",
    content: [
      "For questions about these Terms & Conditions:",
      "📧 Email: info@solbusinessconsultant.com.au",
      "📞 Phone: +61 460 003 494",
      "🌐 Website: www.solbusinessconsultant.com.au",
      "📍 Address: Glenroy VIC 3046, Australia",
      "ABN: 20 662 022 522",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Legal</span>
            <h1 className="font-display font-bold text-4xl text-ink mb-3">Terms & Conditions</h1>
            <p className="text-slate_mist">SOL Business Consultant Pty Ltd — ABN 20 662 022 522</p>
            <p className="text-slate_mist text-sm mt-1">Last updated: June 2026</p>
          </div>

          <div className="space-y-5">
            {SECTIONS.map((section) => (
              <section key={section.title} className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
                <h2 className="font-display font-bold text-base text-ink">{section.title}</h2>
                {section.content.map((line, i) => (
                  <p key={i} className="text-sm text-slate_mist leading-relaxed">{line}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}