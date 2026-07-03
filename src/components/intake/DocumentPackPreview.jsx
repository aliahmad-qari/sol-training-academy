import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ChevronUp, Eye, CheckCircle, Building2, Hash, MapPin, Mail, Phone } from "lucide-react";

/**
 * DocumentPackPreview
 * Shows a branded "preview" of what the generated document pack looks like
 * before the user downloads the full files.
 *
 * Props:
 *   documents  — string[] — list of document names
 *   company    — { company_name, abn, address, company_email, company_phone }
 *   logoPreview — data URL string (optional)
 *   packageName — string
 *   auditPathway — string (optional, NDIS only)
 */
export default function DocumentPackPreview({ documents, company, logoPreview, packageName, auditPathway }) {
  const [open, setOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const previewContent = {
    "Complaints Management Policy": `COMPLAINTS MANAGEMENT POLICY\n\n${company.company_name || "Your Company"}\nABN: ${company.abn || "XX XXX XXX XXX"}\n\n1. PURPOSE\nThis policy outlines ${company.company_name || "Your Company"}'s commitment to managing complaints in accordance with the NDIS Practice Standards and Quality & Safeguards Framework.\n\n2. SCOPE\nThis policy applies to all staff, participants, and stakeholders of ${company.company_name || "Your Company"}.\n\n3. POLICY STATEMENT\n${company.company_name || "Your Company"} is committed to providing a safe, accessible, and effective complaints process for all participants and their families.\n\n4. PROCEDURE\n• All complaints are acknowledged within 24 hours\n• Investigated within 10 business days\n• Escalated to NDIS Commission where required\n• Recorded in the Complaints Register\n\nApproved by: ________________________\nDate: ${new Date().toLocaleDateString("en-AU")}\nReview Date: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("en-AU")}`,

    "Incident Response Procedure": `INCIDENT RESPONSE PROCEDURE\n\n${company.company_name || "Your Company"}\nABN: ${company.abn || "XX XXX XXX XXX"}\n\n1. PURPOSE\nTo provide clear guidance for responding to and reporting incidents in line with NDIS Commission requirements.\n\n2. REPORTABLE INCIDENTS (5 Categories)\n• Death of a participant\n• Serious injury\n• Abuse or neglect\n• Unlawful sexual or physical contact\n• Use of unauthorised restrictive practices\n\n3. INTERNAL REPORTING TIMELINE\n• Immediate verbal report to manager\n• Written report within 24 hours\n• NDIS Commission notification within timeframes\n\nApproved by: ________________________\nDate: ${new Date().toLocaleDateString("en-AU")}`,

    "Service Agreement Template": `SERVICE AGREEMENT\n\n${company.company_name || "Your Company"} (ABN: ${company.abn || "XX XXX XXX XXX"})\n${company.address || "[Business Address]"}\n\nThis Service Agreement is entered into between ${company.company_name || "Your Company"} (\"the Provider\") and the Participant.\n\nSERVICES TO BE PROVIDED:\n[List of agreed NDIS supports]\n\nFUNDING DETAILS:\nBudget Category: [Core / Capacity Building / Capital]\nService Booking Reference: ________________\n\nFEES & CHARGES:\nAll fees are charged in accordance with the current NDIS Pricing Arrangements & Price Limits.\n\nPARTICIPANT RIGHTS:\nYou have the right to:\n• Choose your own supports\n• Change providers with 2 weeks notice\n• Make complaints without fear of retribution\n\nSigned (Provider): ________________________\nSigned (Participant): _____________________\nDate: ${new Date().toLocaleDateString("en-AU")}`,
  };

  const getPreview = (docName) => previewContent[docName] || `${docName.toUpperCase()}\n\n${company.company_name || "Your Company"}\nABN: ${company.abn || "XX XXX XXX XXX"}\n\nThis document has been prepared in accordance with NDIS Practice Standards and Quality & Safeguards Framework requirements.\n\nAll content is customised for ${company.company_name || "Your Company"} and reflects the requirements of the ${packageName} package.\n\nApproved by: ________________________\nDate: ${new Date().toLocaleDateString("en-AU")}\nReview Date: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("en-AU")}`;

  return (
    <div className="rounded-2xl border border-harvest/20 bg-harvest/5 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-harvest/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-harvest" />
          <div className="text-left">
            <p className="font-display font-semibold text-ink text-sm">Preview Your Document Pack</p>
            <p className="text-xs text-slate_mist">{documents.length} documents — click to see a sample of your branded content</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-harvest" /> : <ChevronDown className="w-4 h-4 text-harvest" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-harvest/20">

              {/* Branded header card — simulates a document cover page */}
              <div className="mt-4 bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
                <div className="bg-ink px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-8 object-contain bg-white rounded px-1" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-harvest flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {(company.company_name || "C")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-display font-bold text-sm">{company.company_name || "Your Company"}</p>
                      <p className="text-white/50 text-[10px]">NDIS Document Pack — {packageName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-harvest text-white px-2 py-1 rounded font-bold uppercase tracking-wide">Branded</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                  {company.abn && (
                    <div className="flex items-center gap-1.5 text-slate_mist">
                      <Hash className="w-3 h-3 text-harvest" /> ABN: {company.abn}
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-1.5 text-slate_mist">
                      <MapPin className="w-3 h-3 text-harvest" /> {company.address}
                    </div>
                  )}
                  {company.company_email && (
                    <div className="flex items-center gap-1.5 text-slate_mist">
                      <Mail className="w-3 h-3 text-harvest" /> {company.company_email}
                    </div>
                  )}
                  {company.company_phone && (
                    <div className="flex items-center gap-1.5 text-slate_mist">
                      <Phone className="w-3 h-3 text-harvest" /> {company.company_phone}
                    </div>
                  )}
                  {auditPathway && (
                    <div className="col-span-2 flex items-start gap-1.5 text-slate_mist">
                      <CheckCircle className="w-3 h-3 text-harvest mt-0.5 flex-shrink-0" /> {auditPathway}
                    </div>
                  )}
                </div>
              </div>

              {/* Document list — click to preview */}
              <p className="text-xs font-semibold text-harvest uppercase tracking-wider">Click any document to preview</p>
              <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <button
                    key={doc}
                    onClick={() => setPreviewDoc(previewDoc === doc ? null : doc)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-left transition-all text-sm ${
                      previewDoc === doc
                        ? "border-harvest bg-harvest/10 text-ink"
                        : "border-border/50 bg-white hover:border-harvest/40 text-slate_mist"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-harvest flex-shrink-0" />
                      {doc}
                    </div>
                    <span className="text-[10px] text-slate_mist/60 flex-shrink-0">{previewDoc === doc ? "▲ close" : "▼ preview"}</span>
                  </button>
                ))}
              </div>

              {/* Inline document preview */}
              <AnimatePresence>
                {previewDoc && (
                  <motion.div
                    key={previewDoc}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white border border-border rounded-xl p-5 shadow-inner"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                      <FileText className="w-4 h-4 text-harvest" />
                      <span className="font-display font-semibold text-sm text-ink">{previewDoc}</span>
                      <span className="ml-auto text-[10px] bg-chalk border border-border px-2 py-0.5 rounded text-slate_mist">Sample Preview</span>
                    </div>
                    <pre className="text-xs text-slate_mist whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {getPreview(previewDoc)}
                    </pre>
                    <p className="text-[10px] text-slate_mist/50 mt-3 italic">
                      * Full document contains additional sections, formatted headers, your logo, and page numbering.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}