import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">
              Legal
            </span>
            <h1 className="font-display font-bold text-4xl text-ink mb-3">
              Privacy Policy
            </h1>
            <p className="text-slate_mist">SOL Business Consultant Pty Ltd (ABN 20 662 022 522)</p>
            <p className="text-slate_mist text-sm mt-1">Last updated: 11 July 2026</p>
          </div>

          <div className="space-y-5 prose prose-slate max-w-none">
            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">Introduction</h2>
              <p className="text-sm text-slate_mist">
                SOL Business Consultant Pty Ltd (ABN 20 662 022 522) is committed to protecting your privacy and
                handling your personal information in accordance with the Privacy Act 1988 (Cth) and the Australian
                Privacy Principles (APPs).
              </p>
              <p className="text-sm text-slate_mist">
                This Privacy Policy explains how we collect, use, disclose and protect your personal information when
                you visit our website or use our business consulting services.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">1. Information We Collect</h2>
              <ul className="space-y-1 text-sm text-slate_mist ml-4 list-disc">
                <li>Full name</li>
                <li>Email address</li>
                <li>Telephone number</li>
                <li>Business or company information</li>
                <li>Information submitted through contact forms</li>
                <li>Information provided during consultations</li>
                <li>Website usage information collected through cookies and analytics</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">2. How We Use Your Information</h2>
              <ul className="space-y-1 text-sm text-slate_mist ml-4 list-disc">
                <li>Respond to enquiries</li>
                <li>Provide consulting services</li>
                <li>Prepare proposals and quotations</li>
                <li>Communicate regarding our services</li>
                <li>Improve our website and customer experience</li>
                <li>Meet legal and regulatory obligations</li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">3. Cookies and Analytics</h2>
              <p className="text-sm text-slate_mist">
                Our website may use cookies to improve your browsing experience. We may also use Google Analytics or
                similar tools. Users can disable cookies through their browser settings.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">4. Disclosure of Information</h2>
              <p className="text-sm text-slate_mist">
                We may disclose personal information to trusted service providers, IT providers, hosting providers and
                professional advisers, or where required by Australian law. We do not sell, rent or trade personal
                information.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">5. Data Security</h2>
              <p className="text-sm text-slate_mist">
                We take reasonable steps to protect personal information against misuse, loss, unauthorised access,
                modification and disclosure.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">6. Access and Correction</h2>
              <p className="text-sm text-slate_mist">
                Users may request access to or correction of their personal information by contacting us through the
                website.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">7. Changes to This Policy</h2>
              <p className="text-sm text-slate_mist">
                This Privacy Policy may be updated from time to time. The latest version will always be published on
                this page.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-border/50 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-ink">8. Contact Us</h2>
              <div className="text-sm text-slate_mist space-y-1">
                <p>SOL Business Consultant Pty Ltd</p>
                <p>ABN: 20 662 022 522</p>
                <p>For privacy enquiries, please use the Contact page on the website</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
