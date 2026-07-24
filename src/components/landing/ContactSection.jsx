import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
  website: "",
};

const SERVICE_OPTIONS = [
  { value: "ndis_registration", label: "NDIS Registration Support" },
  { value: "software_automation", label: "Easy Compliance / Automation" },
  { value: "accountancy", label: "Finance Operations Support" },
  { value: "support_coordination_training", label: "Support Coordination Training" },
  { value: "business_registration", label: "Company Registration" },
  { value: "website_development", label: "Website Development" },
  { value: "accountancy_payroll", label: "Payroll Process Support" },
  { value: "general_enquiry", label: "Other / Multiple Services" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s().-]{8,20}$/;
const WHATSAPP_LINK = "https://wa.me/61460003494?text=Hi%20SOL%20Business%20Consultant%2C%20I%27d%20like%20to%20book%20a%20consultation.";

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const selectedService = SERVICE_OPTIONS.find((service) => service.value === formData.service);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (formData.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
    if (!EMAIL_RE.test(formData.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (formData.phone.trim() && !PHONE_RE.test(formData.phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (!formData.service) nextErrors.service = "Please select the service you need.";
    if (formData.message.trim().length < 10) nextErrors.message = "Please add a few details so we can help properly.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.website) {
      setFormData(INITIAL_FORM);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before sending.");
      return;
    }

    setLoading(true);

    const serviceType = formData.service || "general_enquiry";
    const serviceLabel = selectedService?.label || "General website enquiry";

    try {
      await apiClient.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        service: serviceType,
        service_label: serviceLabel,
        message: formData.message.trim(),
        website: formData.website,
      });

      toast.success("Thank you! Your enquiry has been sent. We'll be in touch within 24 hours.");
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch (error) {
      console.error("Contact enquiry failed:", error);
      const message = error?.response?.data?.message || "We couldn't send your enquiry. Please email or call us directly.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-chalk relative overflow-hidden">
      <div className="absolute -bottom-32 -right-32 hidden h-[420px] w-[420px] rounded-full border border-harvest/5 pointer-events-none sm:block lg:h-[500px] lg:w-[500px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-6">
              Ready to Build<br />Your Foundation?
            </h2>
            <p className="text-base md:text-lg text-slate_mist leading-relaxed mb-8 max-w-md">
              Book a free, no-obligation consultation. We'll discuss your situation and create a clear path forward.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 hover:bg-green-600"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Us
              </a>
              <Link
                to="/get-started"
                className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-harvest hover:text-harvest"
              >
                <ArrowRight className="w-4 h-4" /> Start Online Enquiry
              </Link>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-harvest" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Email</p>
                  <a href="mailto:info@solbusinessconsultant.com.au" className="font-display font-semibold text-ink hover:text-harvest transition-colors break-words">info@solbusinessconsultant.com.au</a>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Phone</p>
                  <a href="tel:+61460003494" className="font-display font-semibold text-ink hover:text-harvest transition-colors">+61 460 003 494</a>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-harvest" />
                </div>
                <div>
                  <p className="text-xs text-slate_mist uppercase tracking-wider">Location</p>
                  <p className="font-display font-semibold text-ink">Glenroy VIC 3046 - Australia-wide</p>
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
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-5 sm:p-8 border border-border/50 shadow-lg space-y-5">
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                tabIndex="-1"
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="contact-name"
                    required
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your full name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className="h-12"
                  />
                  {errors.name && <p id="contact-name-error" className="text-xs font-medium text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Email</Label>
                  <Input
                    id="contact-email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Your email address"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className="h-12"
                  />
                  {errors.email && <p id="contact-email-error" className="text-xs font-medium text-destructive">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Australian phone number"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                    className="h-12"
                  />
                  {errors.phone && <p id="contact-phone-error" className="text-xs font-medium text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-company" className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Company</Label>
                  <Input
                    id="contact-company"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Business or trading name"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Service Needed</Label>
                <Select value={formData.service} onValueChange={(val) => updateField("service", val)}>
                  <SelectTrigger className="h-12" aria-invalid={Boolean(errors.service)}>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((service) => (
                      <SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && <p className="text-xs font-medium text-destructive">{errors.service}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-xs font-semibold text-slate_mist uppercase tracking-wider">Message</Label>
                <Textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Tell us about your business needs..."
                  rows={4}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message && <p id="contact-message-error" className="text-xs font-medium text-destructive">{errors.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-harvest hover:bg-harvest/90 text-white font-display text-base py-5 sm:py-6 gap-2 group"
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
                . We'll respond within 24 hours - no pressure, no obligations.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
