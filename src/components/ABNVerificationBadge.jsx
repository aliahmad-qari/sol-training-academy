import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const ABN = "20 662 022 522";
const ABN_CLEAN = "20662022522";

export default function ABNVerificationBadge({ compact = false }) {
  const [expanded, setExpanded] = useState(false);

  const abrUrl = `https://www.abr.business.gov.au/ABN/View?abn=${ABN_CLEAN}`;

  if (compact) {
    return (
      <a
        href={abrUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors shadow-sm"
      >
        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        ABN Verified · {ABN}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </a>
    );
  }

  return (
    <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-green-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide">ABN Verified</p>
            <p className="text-sm font-display font-semibold text-ink">{ABN}</p>
          </div>
          <div className="ml-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-2.5 h-2.5" /> Active
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-green-100"
          >
            <div className="p-4 bg-green-50/40 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Entity Name", value: "SOL Business Consultant Pty Ltd" },
                  { label: "ABN", value: ABN },
                  { label: "Entity Type", value: "Australian Private Company" },
                  { label: "Status", value: "Active" },
                  { label: "GST Registered", value: "Yes" },
                  { label: "State", value: "Victoria" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="font-semibold text-ink text-xs">{value}</p>
                  </div>
                ))}
              </div>
              <a
                href={abrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:underline"
              >
                Verify on ABR website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}