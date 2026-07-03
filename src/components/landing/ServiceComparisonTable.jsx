import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { category: "Getting Started", items: [
    { label: "Initial eligibility assessment" },
    { label: "Step-by-step onboarding guide" },
    { label: "Dedicated consultant assigned" },
  ]},
  { category: "Core Deliverables", items: [
    { label: "Policy & procedure document pack" },
    { label: "Training curriculum (12 modules)" },
    { label: "Automated document generation" },
    { label: "Branded Word/PDF templates" },
    { label: "1,500+ quiz Q&A bank" },
    { label: "Video scripts & PowerPoint decks" },
    { label: "Custom software or dashboard built" },
    { label: "Easy Compliance platform setup" },
  ]},
  { category: "Compliance & Audit", items: [
    { label: "NDIS Practice Standards alignment" },
    { label: "Audit pathway scoping" },
    { label: "Mock audit preparation" },
    { label: "Ongoing compliance monitoring" },
  ]},
  { category: "Support", items: [
    { label: "Email support" },
    { label: "Consulting sessions included" },
    { label: "Live Q&A sessions" },
    { label: "Staff training & handover" },
  ]},
];

// true = included, false = not included, string = partial/note
const SERVICES = [
  {
    id: "ndis",
    name: "NDIS Registration",
    tagline: "Get NDIS registered end-to-end",
    href: "/services/ndis-registration",
    color: "harvest",
    popular: true,
    features: {
      "Initial eligibility assessment": true,
      "Step-by-step onboarding guide": true,
      "Dedicated consultant assigned": true,
      "Policy & procedure document pack": true,
      "Training curriculum (12 modules)": false,
      "Automated document generation": true,
      "Branded Word/PDF templates": true,
      "1,500+ quiz Q&A bank": false,
      "Video scripts & PowerPoint decks": false,
      "Custom software or dashboard built": false,
      "Easy Compliance platform setup": "Add-on",
      "NDIS Practice Standards alignment": true,
      "Audit pathway scoping": true,
      "Mock audit preparation": "Ultimate",
      "Ongoing compliance monitoring": "Add-on",
      "Email support": true,
      "Consulting sessions included": "2–4 hrs",
      "Live Q&A sessions": false,
      "Staff training & handover": false,
    },
  },
  {
    id: "training",
    name: "Support Coordination Training",
    tagline: "Train your team to deliver better",
    href: "/services/support-coordination-training",
    color: "ink",
    popular: false,
    features: {
      "Initial eligibility assessment": true,
      "Step-by-step onboarding guide": true,
      "Dedicated consultant assigned": true,
      "Policy & procedure document pack": false,
      "Training curriculum (12 modules)": true,
      "Automated document generation": false,
      "Branded Word/PDF templates": "Team+",
      "1,500+ quiz Q&A bank": true,
      "Video scripts & PowerPoint decks": true,
      "Custom software or dashboard built": false,
      "Easy Compliance platform setup": false,
      "NDIS Practice Standards alignment": true,
      "Audit pathway scoping": false,
      "Mock audit preparation": false,
      "Ongoing compliance monitoring": false,
      "Email support": true,
      "Consulting sessions included": false,
      "Live Q&A sessions": "Team+",
      "Staff training & handover": false,
    },
  },
  {
    id: "automation",
    name: "Software & Automation",
    tagline: "Automate compliance & workflows",
    href: "/services/software-automation",
    color: "slate_mist",
    popular: false,
    features: {
      "Initial eligibility assessment": true,
      "Step-by-step onboarding guide": true,
      "Dedicated consultant assigned": true,
      "Policy & procedure document pack": false,
      "Training curriculum (12 modules)": false,
      "Automated document generation": true,
      "Branded Word/PDF templates": true,
      "1,500+ quiz Q&A bank": false,
      "Video scripts & PowerPoint decks": false,
      "Custom software or dashboard built": true,
      "Easy Compliance platform setup": true,
      "NDIS Practice Standards alignment": true,
      "Audit pathway scoping": false,
      "Mock audit preparation": false,
      "Ongoing compliance monitoring": true,
      "Email support": true,
      "Consulting sessions included": false,
      "Live Q&A sessions": false,
      "Staff training & handover": true,
    },
  },
];

const Cell = ({ value }) => {
  if (value === true) return <Check className="w-5 h-5 text-harvest mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-border mx-auto" />;
  return <span className="text-xs font-semibold text-harvest bg-harvest/10 px-2 py-0.5 rounded-full">{value}</span>;
};

export default function ServiceComparisonTable() {
  const [hoveredCol, setHoveredCol] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mt-24"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-harvest mb-3 block">
          Compare Services
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">
          Choose the Right Path for Your Business
        </h2>
        <p className="text-slate_mist mt-3 max-w-xl mx-auto text-sm leading-relaxed">
          Not sure which service you need? Compare our three most popular pathways side by side.
        </p>
        <div className="w-16 h-[2px] bg-harvest mt-6 mx-auto" />
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm bg-white">
        <table className="w-full min-w-[640px] border-collapse">
          {/* Service Headers */}
          <thead>
            <tr>
              <th className="w-52 p-5 text-left bg-chalk border-b border-border/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate_mist">Features</span>
              </th>
              {SERVICES.map((svc) => (
                <th
                  key={svc.id}
                  className={`p-5 text-center border-b border-l border-border/60 transition-colors duration-200 ${hoveredCol === svc.id ? "bg-harvest/5" : "bg-chalk"}`}
                  onMouseEnter={() => setHoveredCol(svc.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {svc.popular && (
                    <span className="inline-block text-[10px] bg-harvest text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide mb-2">
                      Most Popular
                    </span>
                  )}
                  <p className="font-display font-bold text-sm text-ink leading-tight">{svc.name}</p>
                  <p className="text-xs text-slate_mist mt-1 font-normal">{svc.tagline}</p>
                  <Link to={svc.href}>
                    <Button size="sm" className="mt-3 bg-harvest hover:bg-harvest/90 text-white text-xs gap-1 h-7 px-3">
                      Get Started <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          {/* Feature Rows */}
          <tbody>
            {FEATURES.map((group) => (
              <React.Fragment key={group.category}>
                {/* Category row */}
                <tr>
                  <td colSpan={4} className="px-5 py-3 bg-ink/[0.03] border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate_mist">{group.category}</span>
                  </td>
                </tr>
                {/* Feature rows */}
                {group.items.map((feature, i) => (
                  <tr key={feature.label} className="border-t border-border/30 hover:bg-chalk/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-ink font-medium">{feature.label}</td>
                    {SERVICES.map((svc) => (
                      <td
                        key={svc.id}
                        className={`px-5 py-3.5 text-center border-l border-border/30 transition-colors duration-200 ${hoveredCol === svc.id ? "bg-harvest/5" : ""}`}
                        onMouseEnter={() => setHoveredCol(svc.id)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        <Cell value={svc.features[feature.label]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>

          {/* Footer CTA row */}
          <tfoot>
            <tr className="border-t border-border/60 bg-chalk">
              <td className="px-5 py-5 text-sm text-slate_mist font-medium">Ready to get started?</td>
              {SERVICES.map((svc) => (
                <td key={svc.id} className="px-5 py-5 text-center border-l border-border/60">
                  <Link to={svc.href}>
                    <Button variant="outline" size="sm" className="text-xs border-harvest/40 text-harvest hover:bg-harvest hover:text-white gap-1">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}