import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Upload, CheckCircle, Download, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import StepIndicator from "./StepIndicator";
import DocumentPackPreview from "./DocumentPackPreview";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STEPS = ["Assessment", "Business Details", "Review & Pay", "Your Documents"];

const PROVIDER_FOCUSES = [
  "Support coordination",
  "Personal care and daily living",
  "Community participation",
  "Therapeutic supports",
  "Plan management",
  "High intensity supports",
  "Specialist disability accommodation",
];

const SERVICE_OPTIONS = [
  "Daily personal activities",
  "Community access",
  "Behaviour support",
  "Assistive technology",
  "Plan management",
  "Supported independent living",
  "Therapeutic supports",
];

const PACKAGES = [
  { id: "starter", name: "Starter Package", price: 3950, desc: "ABN setup, policy pack, 2hrs consulting, audit scoping, auditor quotes." },
  { id: "ultimate", name: "Ultimate Package", price: 6500, desc: "Everything in Starter + mock audit, 4hrs consulting, audit representation, Internal Auditor course.", popular: true },
];

const DOCUMENTS = [
  "Complaints Management Policy",
  "Incident Response Procedure",
  "Worker Screening Register",
  "Risk Management Framework",
  "Privacy & Confidentiality Policy",
  "Service Agreement Template",
  "Quality Management Policy",
  "Participant Onboarding Pack",
  "NDIS Practice Standards Checklist",
  "Code of Conduct Policy",
];

function deriveRecommendation(focus, services, volume) {
  const isHighRisk = services.includes("Behaviour support") || services.includes("Supported independent living") || focus === "High intensity supports";
  const auditPath = isHighRisk ? "Certification audit pathway (higher-risk supports detected)" : "Verification audit pathway (standard supports)";
  const module = focus ? `${focus} module — documentation pack ready` : "Standard module ready";
  const pkg = volume > 20 || isHighRisk ? "ultimate" : "starter";
  return { auditPath, module, pkg };
}

export default function NDISIntakeFlow({ onEnquirySaved }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enquiryId, setEnquiryId] = useState(null);

  const [assessment, setAssessment] = useState({
    full_name: "", email: "", phone: "",
    provider_focus: "Support coordination",
    selected_services: [],
    participant_volume: 10,
    selected_package: "ultimate",
    message: "",
  });

  const [business, setBusiness] = useState({
    company_name: "", abn: "", address: "",
    company_email: "", company_phone: "",
    logo_url: null, logo_file: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [docsReady, setDocsReady] = useState(false);

  const recommendation = deriveRecommendation(
    assessment.provider_focus,
    assessment.selected_services,
    assessment.participant_volume
  );

  const pkg = PACKAGES.find(p => p.id === assessment.selected_package) || PACKAGES[1];

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusiness(b => ({ ...b, logo_file: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const toggleService = (svc) => {
    setAssessment(a => ({
      ...a,
      selected_services: a.selected_services.includes(svc)
        ? a.selected_services.filter(s => s !== svc)
        : [...a.selected_services, svc]
    }));
  };

  const saveEnquiry = async (status = "new") => {
    let logo_url = business.logo_url;
    if (business.logo_file && !logo_url) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file: business.logo_file });
        logo_url = res.file_url;
        setBusiness(b => ({ ...b, logo_url }));
      } catch (e) { /* continue without logo */ }
    }
    const payload = {
      service_type: "ndis_registration",
      status,
      ...assessment,
      ...business,
      logo_url,
      audit_pathway: recommendation.auditPath,
      module_recommendation: recommendation.module,
      package_price: pkg.price,
      selected_package: pkg.name,
    };
    if (enquiryId) {
      await base44.entities.Enquiry.update(enquiryId, payload);
      return enquiryId;
    } else {
      const created = await base44.entities.Enquiry.create(payload);
      setEnquiryId(created.id);
      // Send email notification
      base44.integrations.Core.SendEmail({
        to: "info@solbusinessconsultant.com.au",
        subject: `New NDIS Registration Enquiry — ${assessment.full_name || "New Client"}`,
        body: `New NDIS registration enquiry received.\n\nName: ${assessment.full_name}\nEmail: ${assessment.email}\nPhone: ${assessment.phone}\nPackage: ${pkg.name} ($${pkg.price})\nCompany: ${business.company_name}\nABN: ${business.abn}\nFocus: ${assessment.provider_focus}\nParticipant Volume: ${assessment.participant_volume}\nAudit Pathway: ${recommendation.auditPath}`,
      }).catch(() => {});
      return created.id;
    }
  };

  const handleStep1Next = async () => {
    if (!assessment.full_name || !assessment.email) {
      toast.error("Please enter your name and email.");
      return;
    }
    setLoading(true);
    try {
      await saveEnquiry("new");
      setStep(1);
    } catch (e) { toast.error("Failed to save. Please try again."); }
    setLoading(false);
  };

  const handleStep2Next = async () => {
    if (!business.company_name || !business.abn) {
      toast.error("Please enter company name and ABN.");
      return;
    }
    setLoading(true);
    try {
      await saveEnquiry("awaiting_payment");
      setStep(2);
    } catch (e) { toast.error("Failed to save. Please try again."); }
    setLoading(false);
  };
  const handleOpenPayment = async () => {
    setLoading(true);
    try {
      const id = await saveEnquiry("awaiting_payment");
      await base44.entities.Enquiry.update(id, {
        status: "awaiting_payment",
        payment_reference: null,
        documents_generated: false,
      });
      toast.success("Invoice requested. Our team will send a secure payment link after review.");
      if (onEnquirySaved) onEnquirySaved();
    } catch (e) {
      toast.error("Unable to request invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    toast.error("Payment must be verified by SOL before documents are generated.");
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div id="intake-form" className="bg-white rounded-3xl border border-border/60 shadow-xl p-6 md:p-10 max-w-3xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={step} />

      <AnimatePresence mode="wait">
        {/* STEP 0 — Assessment */}
        {step === 0 && (
          <motion.div key="step0" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Tell us about your NDIS business</h3>
              <p className="text-slate_mist text-sm mt-1">We'll assess your registration pathway and recommend the right package.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Full Name *</Label>
                <Input value={assessment.full_name} onChange={e => setAssessment(a => ({ ...a, full_name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Email *</Label>
                <Input type="email" value={assessment.email} onChange={e => setAssessment(a => ({ ...a, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Phone</Label>
                <Input value={assessment.phone} onChange={e => setAssessment(a => ({ ...a, phone: e.target.value }))} placeholder="0400 000 000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Expected Participants (90 days)</Label>
                <Input type="number" min={1} value={assessment.participant_volume} onChange={e => setAssessment(a => ({ ...a, participant_volume: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Main Service Type</Label>
              <Select value={assessment.provider_focus} onValueChange={v => setAssessment(a => ({ ...a, provider_focus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDER_FOCUSES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Services You'll Deliver (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map(svc => (
                  <label key={svc} className="flex items-center gap-2 text-sm cursor-pointer group">
                    <Checkbox checked={assessment.selected_services.includes(svc)} onCheckedChange={() => toggleService(svc)} />
                    <span className="text-ink group-hover:text-harvest transition-colors">{svc}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Package selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Choose Your Package</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {PACKAGES.map(p => (
                  <div key={p.id} onClick={() => setAssessment(a => ({ ...a, selected_package: p.id }))}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${assessment.selected_package === p.id ? "border-harvest bg-harvest/5" : "border-border hover:border-harvest/40"}`}>
                    {p.popular && <span className="text-[10px] bg-harvest text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Recommended</span>}
                    <h4 className="font-display font-bold text-ink mt-1">{p.name}</h4>
                    <p className="text-harvest font-bold text-xl mt-1">${p.price.toLocaleString()} <span className="text-xs text-slate_mist font-normal">+GST</span></p>
                    <p className="text-xs text-slate_mist mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* AI Recommendation preview */}
            <div className="bg-chalk rounded-xl p-4 border border-harvest/20 space-y-2">
              <p className="text-xs font-semibold text-harvest uppercase tracking-wider">Your Assessment Result</p>
              <p className="text-sm text-ink"><span className="text-slate_mist">Audit pathway:</span> {recommendation.auditPath}</p>
              <p className="text-sm text-ink"><span className="text-slate_mist">Module:</span> {recommendation.module}</p>
              <p className="text-sm text-ink"><span className="text-slate_mist">Recommended package:</span> <strong>{pkg.name}</strong></p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Additional Message (optional)</Label>
              <Textarea value={assessment.message} onChange={e => setAssessment(a => ({ ...a, message: e.target.value }))} placeholder="Tell us more about your NDIS goals..." rows={3} />
            </div>
            <Button onClick={handleStep1Next} disabled={loading} className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2 group">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue to Business Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </motion.div>
        )}

        {/* STEP 1 — Business Details */}
        {step === 1 && (
          <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Business Branding Vault</h3>
              <p className="text-slate_mist text-sm mt-1">Your details will be applied to all branded document templates automatically.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Company / Business Name *</Label>
                <Input value={business.company_name} onChange={e => setBusiness(b => ({ ...b, company_name: e.target.value }))} placeholder="Sol Care Services Pty Ltd" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">ABN *</Label>
                <Input value={business.abn} onChange={e => setBusiness(b => ({ ...b, abn: e.target.value }))} placeholder="XX XXX XXX XXX" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Phone</Label>
                <Input value={business.company_phone} onChange={e => setBusiness(b => ({ ...b, company_phone: e.target.value }))} placeholder="0460 003 494" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Business Email</Label>
                <Input type="email" value={business.company_email} onChange={e => setBusiness(b => ({ ...b, company_email: e.target.value }))} placeholder="admin@yourcompany.com.au" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Business Address</Label>
                <Input value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} placeholder="Melbourne VIC 3000" />
              </div>
            </div>
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Company Logo (PNG or JPG)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-harvest/50 transition-colors">
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={logoPreview} alt="Logo preview" className="h-20 object-contain" />
                    <button onClick={() => { setLogoPreview(null); setBusiness(b => ({ ...b, logo_file: null, logo_url: null })); }}
                      className="text-xs text-destructive hover:underline">Remove logo</button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate_mist" />
                    <span className="text-sm text-slate_mist">Click to upload your logo</span>
                    <span className="text-xs text-slate_mist/60">PNG or JPG, max 5MB</span>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate_mist">Your logo will be embedded in all generated Word documents.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleStep2Next} disabled={loading} className="flex-1 bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2 group">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue to Review & Pay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 — Review & Pay */}
        {step === 2 && (
          <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Review & Complete Payment</h3>
              <p className="text-slate_mist text-sm mt-1">Review your order and proceed to payment to generate your branded document pack.</p>
            </div>
            {/* Order Summary */}
            <div className="bg-chalk rounded-2xl p-6 space-y-4 border border-border/50">
              <h4 className="font-display font-semibold text-ink text-sm uppercase tracking-wider">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate_mist">Package</span><span className="font-semibold text-ink">{pkg.name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Client</span><span className="font-semibold text-ink">{assessment.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Company</span><span className="font-semibold text-ink">{business.company_name}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">ABN</span><span className="font-semibold text-ink">{business.abn}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Provider Focus</span><span className="font-semibold text-ink">{assessment.provider_focus}</span></div>
                <div className="flex justify-between"><span className="text-slate_mist">Audit Pathway</span><span className="font-semibold text-ink text-right max-w-xs">{recommendation.auditPath}</span></div>
                {logoPreview && <div className="flex justify-between items-center"><span className="text-slate_mist">Logo</span><img src={logoPreview} className="h-8 object-contain" alt="logo" /></div>}
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-display font-bold text-ink">Total</span>
                <div className="text-right">
                  <span className="font-display font-bold text-2xl text-harvest">${pkg.price.toLocaleString()}</span>
                  <span className="text-xs text-slate_mist ml-1">+GST</span>
                </div>
              </div>
            </div>
            {/* What you'll receive */}
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-sm text-ink uppercase tracking-wider">Documents You'll Receive ({DOCUMENTS.length}+)</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {DOCUMENTS.map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-xs text-slate_mist">
                    <CheckCircle className="w-3 h-3 text-harvest flex-shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate_mist mt-1">All documents branded with {business.company_name || "your company"} name, ABN, and logo.</p>
            </div>
            <div className="bg-harvest/5 border border-harvest/20 rounded-xl p-4 text-sm text-ink">
              <p className="font-semibold mb-1">🔒 Secure Invoice Request</p>
              <p className="text-slate_mist text-xs">Online payment links are issued by our team after review. Documents are generated only after payment is verified.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleOpenPayment} disabled={loading} className="flex-1 bg-ink hover:bg-ink/90 text-white font-display py-6 gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting invoice...</> : <><CreditCard className="w-4 h-4" /> Request Secure Invoice</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Documents */}
        {step === 3 && (
          <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 text-center">
            {generatingDocs ? (
              <div className="py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-harvest mx-auto" />
                <h3 className="font-display font-bold text-2xl text-ink">Generating Your Branded Documents…</h3>
                <p className="text-slate_mist">Applying {business.company_name} details to all templates. This takes just a moment.</p>
              </div>
            ) : (
              <>
                <div className="py-4">
                  <CheckCircle className="w-16 h-16 text-harvest mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl text-ink">Your Document Pack is Ready!</h3>
                  <p className="text-slate_mist mt-2">Payment confirmed. {DOCUMENTS.length}+ branded documents have been generated for {business.company_name}.</p>
                </div>
                <DocumentPackPreview
                  documents={DOCUMENTS}
                  company={business}
                  logoPreview={logoPreview}
                  packageName={pkg.name}
                  auditPathway={recommendation.auditPath}
                />

                <div className="bg-chalk rounded-2xl p-6 text-left space-y-2">
                  <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-ink mb-3">Documents Ready for Download</h4>
                  <div className="space-y-2">
                    {DOCUMENTS.map(doc => (
                      <div key={doc} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-ink">
                          <CheckCircle className="w-4 h-4 text-harvest" />
                          {doc} — {business.company_name}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-harvest border-harvest/30 hover:bg-harvest hover:text-white">
                          <Download className="w-3 h-3" /> .docx
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-6 gap-2">
                  <Download className="w-5 h-5" /> Download All Documents (.zip)
                </Button>
                <p className="text-xs text-slate_mist">
                  A confirmation email has been sent to {assessment.email}. Sol will follow up within 24 hours to arrange your coaching session.
                </p>
                <p className="text-xs text-slate_mist/60">
                  ⚙️ Developer: Connect the Download buttons to your document generation backend (e.g. a Word template merge service using company_name, ABN, logo_url fields stored in the Enquiry record ID: {enquiryId}).
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}