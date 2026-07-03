import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Eye, Lock, Users, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">Legal</span>
            <h1 className="font-display font-bold text-4xl text-ink mb-3">Privacy Policy</h1>
            <p className="text-slate_mist">SOL Business Consultant Pty Ltd — ABN 20 662 022 522</p>
            <p className="text-slate_mist text-sm mt-1">Last updated: June 2026</p>
          </div>

          <div className="space-y-5 prose prose-slate max-w-none">
            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">1. Introduction</h2>
              <p className="text-sm text-slate_mist">SOL Business Consultant Pty Ltd is committed to protecting your privacy. We comply with the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs). We are not affiliated with the NDIS Commission or any government agency.</p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-harvest" />
                <h2 className="font-display font-bold text-lg text-ink m-0">2. Information We Collect</h2>
              </div>
              <div className="space-y-3 text-sm text-slate_mist">
                <div>
                  <p className="font-semibold text-ink mb-1">Personal Information</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Full name, email, phone number</li>
                    <li>• Date of birth (if applicable)</li>
                    <li>• ABN or ACN</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-ink mb-1">Business & Company Information</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Company name, ABN, ACN, industry type</li>
                    <li>• Business address and contact details</li>
                    <li>• Financial information (if provided)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-ink mb-1">Payment & Financial Information</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Credit/debit card details (via Stripe, secure processing)</li>
                    <li>• Payment transaction history</li>
                    <li>• Invoice details</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-ink mb-1">Service Delivery Information</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Enquiry details and uploaded files</li>
                    <li>• Communication records (emails, calls)</li>
                    <li>• NDIS registration documents</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-harvest" />
                <h2 className="font-display font-bold text-lg text-ink m-0">3. How We Use Your Information</h2>
              </div>
              <ul className="space-y-1 text-sm text-slate_mist ml-4">
                <li>• Service Delivery — provide NDIS, bookkeeping, training, website, and accounting services</li>
                <li>• Payment Processing — manage payments, invoices, subscriptions via Stripe</li>
                <li>• Customer Support — respond to enquiries and provide technical support</li>
                <li>• Compliance & Legal — meet tax, NDIS, and regulatory requirements</li>
                <li>• Business Analytics — understand service usage and improve offerings</li>
                <li>• Marketing & Communication — send service updates and newsletters (with consent)</li>
                <li>• Fraud Prevention — detect unauthorized access and security threats</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-harvest" />
                <h2 className="font-display font-bold text-lg text-ink m-0">4. Information Sharing & Disclosure</h2>
              </div>
              <p className="text-sm text-slate_mist font-semibold">We do NOT sell, trade, or rent your personal information.</p>
              <div className="space-y-2 text-sm text-slate_mist">
                <p><strong>Service Providers:</strong> Stripe (payments), email providers, cloud hosting, NDIS Commission, ATO, accounting partners</p>
                <p><strong>Legal & Regulatory:</strong> Government agencies (ATO, ASIC, NDIS Commission) as required by law</p>
                <p><strong>Business Transfers:</strong> In case of acquisition, we will notify you</p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-harvest" />
                <h2 className="font-display font-bold text-lg text-ink m-0">5. Data Security & Encryption</h2>
              </div>
              <ul className="space-y-1 text-sm text-slate_mist ml-4">
                <li>• End-to-End Encryption — TLS 1.2+ for all data transmission</li>
                <li>• Secure Payment — Stripe's PCI-DSS compliant platform; no card data stored</li>
                <li>• Role-Based Access Control — only authorized staff access data</li>
                <li>• Secure File Storage — encrypted servers (AES-256)</li>
                <li>• Regular Security Audits — periodic reviews and penetration testing</li>
                <li>• Access Logging — all sensitive data access monitored</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">6. Cookies & Tracking</h2>
              <p className="text-sm text-slate_mist">Our website uses cookies to remember your session, track performance, and deliver personalized content. You can disable cookies via browser settings.</p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">7. Data Retention</h2>
              <p className="text-sm text-slate_mist">Active clients: Duration of service + 7 years | Inactive clients: Up to 3 years then deleted | Payment records: 7 years | Marketing: Until unsubscribe</p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">8. Your Privacy Rights</h2>
              <ul className="space-y-1 text-sm text-slate_mist ml-4">
                <li>• Access your information (free of charge)</li>
                <li>• Correct inaccurate or incomplete information</li>
                <li>• Delete your information (where legally permissible)</li>
                <li>• Opt-out of marketing communications anytime</li>
                <li>• Lodge complaints with OAIC if privacy breached</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">9. Contact Us</h2>
              <div className="text-sm text-slate_mist space-y-1">
                <p>📧 Email: <a href="mailto:info@solbusinessconsultant.com.au" className="text-harvest hover:underline">info@solbusinessconsultant.com.au</a></p>
                <p>📞 Phone: <a href="tel:+61460003494" className="text-harvest hover:underline">+61 460 003 494</a></p>
                <p>🌐 Website: www.solbusinessconsultant.com.au</p>
                <p>📍 Address: Glenroy VIC 3046, Australia</p>
                <p>ABN: 20 662 022 522</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}