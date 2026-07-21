import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
};

const SERVICE_OPTIONS = [
  { value: "ndis_registration", label: "NDIS Registration Support" },
  { value: "software_automation", label: "Easy Compliance / Automation" },
  { value: "accountancy", label: "Bookkeeping & BAS" },
  { value: "support_coordination_training", label: "Support Coordination Training" },
  { value: "business_registration", label: "Company Registration" },
  { value: "website_development", label: "Website Development" },
  { value: "accountancy_payroll", label: "Payroll Services" },
  { value: "general_enquiry", label: "Other / Multiple Services" },
];

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const selectedService = SERVICE_OPTIONS.find((service) => service.value === formData.service);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceType = formData.service || "general_enquiry";
    const serviceLabel = selectedService?.label || "General website enquiry";

    try {
      await base44.entities.Enquiry.create({
        service_type: serviceType,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        company_name: formData.company || "",
        message: `[Website Contact Form - ${serviceLabel}]\n\n${formData.message || "No message provided."}`,
        status: "new",
        source: "website_contact_form",
      });

      base44.integrations.Core.SendEmail({
        to: "info@solbusinessconsultant.com.au",
        subject: `New website enquiry - ${serviceLabel}`,
        body: `New website enquiry received.\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nCompany: ${formData.company || "Not provided"}\nService: ${serviceLabel}\n\nMessage:\n${formData.message || "No message provided."}`,
      }).catch(() => {});

      toast.success("Thank you! Your enquiry has been sent. We'll be in touch within 24 hours.");
      setFormData(INITIAL_FORM);
    } catch (error) {
      toast.error("We couldn't send your enquiry. Please email or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-chalk relative overflow-hidden">
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full border border-harvest/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight mb-6">
              Ready to Build<br />Your Foundation?
            </h2>
            <p className="text-lg text-slate_mist leading-relaxed mb-10 max-w-md">
              Book a free, no-obligation consultation. We'll discuss your situation and create a clear path forward.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Email</p>
                  <a href="mailto:info@solbusinessconsultant.com.au" className="font-display font-semibold text-ink hover:text-harvest transition-colors">info@solbusinessconsultant.com.au</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Phone</p>
                  <a href="tel:+61460003494" className="font-display font-semibold text-ink hover:text-harvest transition-colors">+61 460 003 494</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Location</p>
                  <p className="font-display font-semibold text-ink">Glenroy VIC 3046 - Australia-wide</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <span className="text-harvest font-bold text-xs">WWW</span>
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Website</p>
                  <a href="https://www.solbusinessconsultant.com.au" target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-ink hover:text-harvest transition-colors">www.solbusinessconsultant.com.au</a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Full Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Email</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your email address"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Australian phone number"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Business or trading name"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Service Needed</Label>
                <Select value={formData.service} onValueChange={(val) => setFormData({ ...formData, service: val })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((service) => (
                      <SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your business needs..."
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-harvest hover:bg-harvest/90 text-white font-display text-base py-6 gap-2 group"
              >
                {loading ? "Sending..." : "Book Free Consultation"}
                {!loading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
              </Button>
              <p className="text-xs text-center text-slate_mist">
                By submitting this form you consent to SOL Business Consultant collecting and
                handling your details in line with our{" "}
                <Link to="/privacy-policy" className="text-harvest hover:underline font-medium">
                  Privacy Policy
                </Link>
                . We'll respond within 24 hours — no pressure, no obligations.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
