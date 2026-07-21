import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Loader2, CheckCircle, Upload,
  CreditCard, Download, FileText, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StepIndicator from "./StepIndicator";
import DocumentPackPreview from "./DocumentPackPreview";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STEPS = ["Your Needs", "Business & Files", "Select Package", "Payment", "Delivery"];

// ─── Config per service ───────────────────────────────────────────────────────
const SERVICE_CONFIG = {
  support_coordination_training: {
    title: "Support Coordination Training",
    subtitle: "Tell us about your training needs so we can match you with the right package.",
    fields: [
      { key: "software_needs", label: "Who is this training for?", placeholder: "e.g. Myself (individual), our team of 5 Support Coordinators, RTO looking for curriculum licensing…" },
      { key: "message", label: "Any specific requirements or questions?", placeholder: "e.g. preferred start date, existing training systems, LMS integration needs, number of staff…" },
    ],
    serviceOptions: [
      "Individual learner (self-paced)",
      "Team / Organisation (up to 10 staff)",
      "Enterprise / RTO licensing",
      "Train-the-trainer program",
      "Blended delivery with live sessions",
      "Custom curriculum development",
    ],
    packages: [
      { id: "training_individual", name: "Individual Learner", price: 1200, desc: "Full 12-module online curriculum, 1,500+ quiz Q&A, 6-month access, certificate of completion, email support." },
      { id: "training_team", name: "Team / Organisation", price: 3800, desc: "Up to 10 staff — full curriculum, video scripts, PowerPoint decks, trainer guides, branded workbooks, 2 live Q&A sessions.", popular: true },
      { id: "training_enterprise", name: "Enterprise / RTO", price: 0, desc: "Unlimited staff, white-label branding, RTO-ready pack, train-the-trainer, LMS integration. Custom pricing." },
    ],
    deliverables: [
      "Full 12-module written curriculum",
      "1,500+ quiz questions with answers",
      "PowerPoint slide decks (all modules)",
      "Video scripts for all 12 modules",
      "Trainer & facilitator guides",
      "Participant workbooks",
      "Scenario-based assessments",
      "Certificate of completion",
    ],
    confirmMsg: "Your training enrolment has been received. Our team will be in touch within 1 business day to confirm access and next steps.",
    emailSubject: (name) => `New Support Coordination Training Enquiry — ${name}`,
  },
  website_development: {
    title: "Website Development",
    subtitle: "Tell us about your website project so we can prepare a tailored proposal.",
    fields: [
      { key: "website_goals", label: "What do you need the website to do?", placeholder: "e.g. NDIS provider site with intake forms, booking, service pages, participant portal…" },
      { key: "message", label: "Current situation & timeline", placeholder: "Do you have an existing site? What's your launch deadline and rough budget?" },
    ],
    serviceOptions: [
      "New website from scratch",
      "Redesign existing site",
      "NDIS provider website",
      "E-commerce / booking system",
      "Landing page only",
      "Maintenance & hosting",
    ],
    packages: [
      { id: "web_starter", name: "Starter Site", price: 1500, desc: "Up to 5 pages, mobile-friendly, SEO basics, contact form, 2 revisions." },
      { id: "web_pro", name: "Pro Site", price: 3500, desc: "Up to 15 pages, full SEO, CMS, booking/intake form, 5 revisions + 1 month support.", popular: true },
      { id: "web_enterprise", name: "Enterprise", price: 7500, desc: "Unlimited pages, custom portal, e-commerce, integrations, ongoing maintenance." },
    ],
    deliverables: [
      "Branded website built to spec",
      "Mobile & tablet responsive",
      "On-page SEO configuration",
      "Google Analytics setup",
      "Contact / intake form integration",
      "1 month post-launch support",
    ],
    confirmMsg: "Your website project has been lodged. Our team will send a detailed proposal within 1 business day.",
    emailSubject: (name) => `New Website Development Enquiry — ${name}`,
  },
  software_automation: {
    title: "Software & NDIS Automation",
    subtitle: "Describe the processes you want to automate and we'll scope the solution.",
    fields: [
      { key: "software_needs", label: "What do you want to automate or build?", placeholder: "e.g. NDIS document generation, client intake system, compliance dashboard, Easy Compliance setup…" },
      { key: "message", label: "Current systems & pain points", placeholder: "What software do you currently use? What's broken or taking too long?" },
    ],
    serviceOptions: [
      "NDIS document automation",
      "Client intake system",
      "Compliance dashboard",
      "Easy Compliance setup & training",
      "Custom software build",
      "Process & workflow automation",
    ],
    packages: [
      { id: "auto_basic", name: "Automation Starter", price: 2500, desc: "Single process automated — e.g. document generation or intake flow. Delivery 1–2 weeks." },
      { id: "auto_pro", name: "Automation Pro", price: 5500, desc: "2–4 processes, Easy Compliance setup, staff training, 30-day support.", popular: true },
      { id: "auto_custom", name: "Custom Build", price: 0, desc: "Fully scoped custom software. Contact for pricing after assessment." },
    ],
    deliverables: [
      "Automated workflow(s) built & tested",
      "Staff training & handover session",
      "System documentation",
      "Easy Compliance configuration (if selected)",
      "30-day post-launch support",
      "Source code / admin access",
    ],
    confirmMsg: "Your automation brief has been received. Our team will contact you within 1 business day to scope the solution.",
    emailSubject: (name) => `New Software Automation Enquiry — ${name}`,
  },
  accountancy: {
    title: "Accountancy Services",
    subtitle: "Tell us about your accounting needs and we'll match you with the right service.",
    fields: [
      { key: "accounting_needs", label: "What accounting services do you need?", placeholder: "e.g. bookkeeping, BAS lodgement, payroll, tax planning, NDIS financial reporting…" },
      { key: "message", label: "Business size & current setup", placeholder: "Employees, software (Xero/MYOB), urgent ATO deadlines, current issues?" },
    ],
    serviceOptions: [
      "Bookkeeping & BAS",
      "Payroll & STP",
      "Tax planning & returns",
      "NDIS financial reporting",
      "Company & ABN registration",
      "Business loan support",
    ],
    packages: [
      { id: "acc_monthly", name: "Monthly Bookkeeping", price: 350, desc: "Monthly bookkeeping, BAS lodgement, and P&L reporting. Billed monthly." },
      { id: "acc_fullservice", name: "Full Service", price: 990, desc: "Bookkeeping + payroll + BAS + tax planning. Monthly retainer.", popular: true },
      { id: "acc_ndis", name: "NDIS Financial Pack", price: 1800, desc: "All Full Service plus NDIS financial reporting, audit support, and SDA/SIL compliance." },
    ],
    deliverables: [
      "Monthly reconciled accounts",
      "BAS lodgement (monthly/quarterly)",
      "Payroll processing & STP",
      "Year-end tax return preparation",
      "NDIS financial reporting",
      "Direct CPA accountant access",
    ],
    confirmMsg: "Your accountancy enquiry has been received. Our team will be in touch within 1 business day.",
    emailSubject: (name) => `New Accountancy Enquiry — ${name}`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const FieldLabel = ({ children }) => (
  <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">{children}</Label>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function GenericIntakeFlow({ serviceType }) {
  const config = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.website_development;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enquiryId, setEnquiryId] = useState(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [docsReady, setDocsReady] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    selected_package: config.packages[1]?.id || config.packages[0]?.id || "",
    website_goals: "", software_needs: "", accounting_needs: "", message: "",
    service_interest: "",
  });

  const [business, setBusiness] = useState({
    company_name: "", abn: "", address: "",
    company_email: "", company_phone: "",
    logo_url: null, logo_file: null,
    extra_file_url: null, extra_file: null, extra_file_name: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const selectedPkg = config.packages.find(p => p.id === form.selected_package) || config.packages[0];

  // ── File handlers ──
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusiness(b => ({ ...b, logo_file: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleExtraFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusiness(b => ({ ...b, extra_file: file, extra_file_name: file.name }));
  };

  // ── Save to DB ──
  const saveEnquiry = async (status) => {
    let logo_url = business.logo_url;
    let extra_file_url = business.extra_file_url;

    if (business.logo_file && !logo_url) {
      const res = await base44.integrations.Core.UploadFile({ file: business.logo_file });
      logo_url = res.file_url;
      setBusiness(b => ({ ...b, logo_url }));
    }
    if (business.extra_file && !extra_file_url) {
      const res = await base44.integrations.Core.UploadFile({ file: business.extra_file });
      extra_file_url = res.file_url;
      setBusiness(b => ({ ...b, extra_file_url }));
    }

    const payload = {
      service_type: serviceType,
      status,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      website_goals: form.website_goals,
      software_needs: form.software_needs,
      accounting_needs: form.accounting_needs,
      selected_package: selectedPkg?.name || "",
      package_price: selectedPkg?.price || 0,
      ...business,
      logo_url,
    };

    if (enquiryId) {
      await base44.entities.Enquiry.update(enquiryId, payload);
      return enquiryId;
    } else {
      const created = await base44.entities.Enquiry.create(payload);
      setEnquiryId(created.id);
      base44.integrations.Core.SendEmail({
        to: "info@solbusinessconsultant.com.au",
        subject: config.emailSubject(form.full_name || "New Client"),
        body: `New ${config.title} enquiry.\n\nName: ${form.full_name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany: ${business.company_name}\nABN: ${business.abn}\nPackage: ${selectedPkg?.name} ($${selectedPkg?.price})\nMessage: ${form.message}`,
      }).catch(() => {});
      return created.id;
    }
  };

  // ── Step navigation ──
  const goStep0Next = () => {
    if (!form.full_name || !form.email) { toast.error("Please enter your name and email."); return; }
    setStep(1);
  };

  const goStep1Next = async () => {
    if (!business.company_name) { toast.error("Please enter your company name."); return; }
    setLoading(true);
    await saveEnquiry("new");
    setLoading(false);
    setStep(2);
  };

  const goStep2Next = async () => {
    setLoading(true);
    await saveEnquiry("awaiting_payment");
    setLoading(false);
    setStep(3);
  };
  const handleOpenPayment = async () => {
    if (!selectedPkg || selectedPkg.price <= 0) {
      await handleConfirmEnquiry();
      return;
    }

    setLoading(true);
    try {
      const id = await saveEnquiry("awaiting_payment");
      await base44.entities.Enquiry.update(id, {
        status: "awaiting_payment",
        payment_reference: null,
        documents_generated: false,
      });
      toast.success("Invoice requested. Our team will send a secure payment link after review.");
      setStep(4);
      setDocsReady(true);
    } catch (e) {
      toast.error("Unable to request invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnquiry = async () => {
    setLoading(true);
    await saveEnquiry("in_progress");
    setLoading(false);
    setStep(4);
    setDocsReady(true);
  };

  const handleConfirmPayment = async () => {
    toast.error("Payment must be verified by SOL before deliverables are released.");
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div id="intake-form" className="bg-white rounded-3xl border border-border/60 shadow-xl p-6 md:p-10 max-w-3xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={step} />

      <AnimatePresence mode="wait">

        {/* ── STEP 0: Your Needs ── */}
        {step === 0 && (
          <motion.div key="s0" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">{config.title}</h3>
              <p className="text-slate_mist text-sm mt-1">{config.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel>Full Name *</FieldLabel>
                <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Email *</FieldLabel>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Phone</FieldLabel>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0400 000 000" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Service Interest</FieldLabel>
                <Select value={form.service_interest} onValueChange={v => set("service_interest", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {config.serviceOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {config.fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <FieldLabel>{f.label}</FieldLabel>
                <Textarea value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} rows={3} />
              </div>
            ))}
            <Button onClick={goStep0Next} className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2 group">
              Continue to Business Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* ── STEP 1: Business Details & File Uploads ── */}
        {step === 1 && (
          <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Business Details & Files</h3>
              <p className="text-slate_mist text-sm mt-1">Your details will be applied to all branded deliverables automatically.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <FieldLabel>Company / Business Name *</FieldLabel>
                <Input value={business.company_name} onChange={e => setBusiness(b => ({ ...b, company_name: e.target.value }))} placeholder="Your Business Pty Ltd" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>ABN</FieldLabel>
                <Input value={business.abn} onChange={e => setBusiness(b => ({ ...b, abn: e.target.value }))} placeholder="XX XXX XXX XXX" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Business Email</FieldLabel>
                <Input type="email" value={business.company_email} onChange={e => setBusiness(b => ({ ...b, company_email: e.target.value }))} placeholder="admin@yourco.com.au" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Business Phone</FieldLabel>
                <Input value={business.company_phone} onChange={e => setBusiness(b => ({ ...b, company_phone: e.target.value }))} placeholder="03 XXXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Business Address</FieldLabel>
                <Input value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} placeholder="Melbourne VIC 3000" />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <FieldLabel>Company Logo (PNG or JPG)</FieldLabel>
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-harvest/50 transition-colors">
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                    <button onClick={() => { setLogoPreview(null); setBusiness(b => ({ ...b, logo_file: null, logo_url: null })); }}
                      className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-7 h-7 text-slate_mist" />
                    <span className="text-sm text-slate_mist">Click to upload your logo</span>
                    <span className="text-xs text-slate_mist/60">PNG or JPG, max 5MB</span>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate_mist">Logo will be applied to all deliverables.</p>
            </div>

            {/* Supporting File Upload */}
            <div className="space-y-2">
              <FieldLabel>Supporting File (optional — brief, existing site, examples)</FieldLabel>
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-harvest/50 transition-colors">
                {business.extra_file_name ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-7 h-7 text-harvest" />
                    <span className="text-sm text-ink">{business.extra_file_name}</span>
                    <button onClick={() => setBusiness(b => ({ ...b, extra_file: null, extra_file_name: "", extra_file_url: null }))}
                      className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-7 h-7 text-slate_mist" />
                    <span className="text-sm text-slate_mist">Upload a brief, PDF, or reference file</span>
                    <span className="text-xs text-slate_mist/60">PDF, DOC, PNG, JPG — max 20MB</span>
                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleExtraFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={goStep1Next} disabled={loading} className="flex-1 bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2 group">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Select Package <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Select Package ── */}
        {step === 2 && (
          <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Choose Your Package</h3>
              <p className="text-slate_mist text-sm mt-1">Select the level of service that matches your needs and budget.</p>
            </div>
            <div className="space-y-3">
              {config.packages.map(pkg => (
                <div key={pkg.id} onClick={() => set("selected_package", pkg.id)}
                  className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${form.selected_package === pkg.id ? "border-harvest bg-harvest/5" : "border-border hover:border-harvest/40"}`}>
                  {pkg.popular && (
                    <span className="absolute top-3 right-3 text-[10px] bg-harvest text-white px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" /> Recommended
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-display font-bold text-ink">{pkg.name}</h4>
                      <p className="text-xs text-slate_mist mt-1 pr-24">{pkg.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {pkg.price > 0 ? (
                        <>
                          <span className="font-display font-bold text-xl text-harvest">${pkg.price.toLocaleString()}</span>
                          <span className="text-xs text-slate_mist block">+GST</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-harvest">Custom Quote</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div className="bg-chalk rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-harvest uppercase tracking-wider mb-2">What You'll Receive</p>
              {config.deliverables.map(d => (
                <div key={d} className="flex items-center gap-2 text-sm text-slate_mist">
                  <CheckCircle className="w-3.5 h-3.5 text-harvest flex-shrink-0" /> {d}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={goStep2Next} disabled={loading} className="flex-1 bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2 group">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && (
          <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Review & Complete Payment</h3>
              <p className="text-slate_mist text-sm mt-1">Review your order and pay securely to trigger service delivery.</p>
            </div>

            {/* Order Summary */}
            <div className="bg-chalk rounded-2xl p-6 border border-border/50 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Order Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate_mist">Service</span><span className="font-semibold text-ink">{config.title}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Package</span><span className="font-semibold text-ink">{selectedPkg?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Client</span><span className="font-semibold text-ink">{form.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Company</span><span className="font-semibold text-ink">{business.company_name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">ABN</span><span className="font-semibold text-ink">{business.abn || "—"}</span></div>
                {logoPreview && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate_mist">Logo</span>
                    <img src={logoPreview} className="h-8 object-contain" alt="logo" />
                  </div>
                )}
                {business.extra_file_name && (
                  <div className="flex justify-between"><span className="text-slate_mist">Supporting file</span><span className="text-ink text-xs">{business.extra_file_name}</span></div>
                )}
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-display font-bold text-ink">Total</span>
                {selectedPkg?.price > 0 ? (
                  <div className="text-right">
                    <span className="font-display font-bold text-2xl text-harvest">${selectedPkg.price.toLocaleString()}</span>
                    <span className="text-xs text-slate_mist ml-1">+GST</span>
                  </div>
                ) : (
                  <span className="font-semibold text-harvest">Custom — Invoice to Follow</span>
                )}
              </div>
            </div>

            {/* Deliverables reminder */}
            <div className="grid grid-cols-2 gap-1.5">
              {config.deliverables.map(d => (
                <div key={d} className="flex items-center gap-2 text-xs text-slate_mist">
                  <CheckCircle className="w-3 h-3 text-harvest flex-shrink-0" /> {d}
                </div>
              ))}
            </div>

            <div className="bg-harvest/5 border border-harvest/20 rounded-xl p-4 text-sm">
              <p className="font-semibold text-ink mb-1">🔒 Secure Invoice Request</p>
              <p className="text-xs text-slate_mist">
                {selectedPkg?.price > 0
                  ? "Online payment links are issued by our team after review. Deliverables are released only after payment is verified."
                  : "This package requires a custom quote — we'll confirm your enquiry and contact you with an invoice."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={handleOpenPayment} disabled={loading} className="flex-1 bg-ink hover:bg-ink/90 text-white font-display py-6 gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                  : selectedPkg?.price > 0
                    ? <><CreditCard className="w-4 h-4" /> Request Secure Invoice</>
                    : "Confirm Enquiry - We will Send an Invoice"
                }
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Delivery ── */}
        {step === 4 && (
          <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 text-center">
            {generatingDocs ? (
              <div className="py-14 space-y-4">
                <Loader2 className="w-14 h-14 animate-spin text-harvest mx-auto" />
                <h3 className="font-display font-bold text-2xl text-ink">Setting Up Your Deliverables…</h3>
                <p className="text-slate_mist max-w-sm mx-auto text-sm">
                  Applying {business.company_name || "your"} branding and details. This takes just a moment.
                </p>
                <div className="flex justify-center gap-1.5 mt-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-harvest animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="py-4">
                  <CheckCircle className="w-16 h-16 text-harvest mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl text-ink">Request Received — You're All Set!</h3>
                  <p className="text-slate_mist mt-2 max-w-md mx-auto text-sm">{config.confirmMsg}</p>
                </div>

                <DocumentPackPreview
                  documents={config.deliverables}
                  company={business}
                  logoPreview={logoPreview}
                  packageName={selectedPkg?.name || ""}
                />

                {/* Deliverables list */}
                <div className="bg-chalk rounded-2xl p-6 text-left space-y-2">
                  <p className="font-display font-semibold text-sm uppercase tracking-wider text-ink mb-3">Your Deliverables</p>
                  {config.deliverables.map(d => (
                    <div key={d} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-ink">
                        <CheckCircle className="w-4 h-4 text-harvest" /> {d}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-harvest border-harvest/30 hover:bg-harvest hover:text-white">
                        <Download className="w-3 h-3" /> Save
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-5 gap-2">
                  <Download className="w-4 h-4" /> Download All Deliverables (.zip)
                </Button>

                {/* Summary card */}
                <div className="bg-chalk rounded-xl p-4 text-left text-sm space-y-1 max-w-md mx-auto">
                  <p><span className="text-slate_mist">Name:</span> <strong>{form.full_name}</strong></p>
                  <p><span className="text-slate_mist">Email:</span> <strong>{form.email}</strong></p>
                  <p><span className="text-slate_mist">Company:</span> <strong>{business.company_name}</strong></p>
                  <p><span className="text-slate_mist">Package:</span> <strong>{selectedPkg?.name}</strong></p>
                </div>

                <p className="text-xs text-slate_mist">
                  A confirmation has been sent to {form.email}. Sol will contact you within 24 hours to kick off delivery.
                </p>
                <p className="text-xs text-slate_mist/50">
                  ⚙️ Developer: Wire the Download buttons to your document generation backend using Enquiry ID: {enquiryId || "—"}
                </p>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}